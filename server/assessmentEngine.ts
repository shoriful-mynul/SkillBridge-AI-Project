/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import {
  AssessmentStage,
  CritiqueUptakeEvaluation,
  DimensionScore,
  GroundedTask,
  InitialAssessment,
  NextStepOption,
  RevisionEvaluation,
  Score0to3,
  TargetRole
} from '../src/types/index.ts';

// -------------------------------------------------------------
// 1. DETERMINISTIC QUOTATION VALIDATION
// -------------------------------------------------------------

/**
 * Validates whether cited quotation is an exact literal substring of the student answer.
 * Never allows citing the CV as answer evidence.
 */
export function validateQuoteSubstring(answer: string, quote: string): boolean {
  if (!answer || typeof answer !== 'string') return false;
  if (!quote || typeof quote !== 'string') return false;

  const cleanedQuote = quote.trim().replace(/^["']|["']$/g, '');
  if (cleanedQuote.length === 0) return false;

  return answer.includes(cleanedQuote);
}

/**
 * Enforces rule: A score above 1 must include an exact quotation from the current answer.
 * If score > 1 and quotation is missing or not a literal substring, score is clamped to 1.
 */
export function validateAndEnforceScoreQuote(
  rawScore: number,
  quote: string,
  answer: string
): {
  finalScore: Score0to3;
  isQuoteVerified: boolean;
  cleanQuote: string;
  auditNote?: string;
} {
  // Clamp raw score to 0..3 integer
  const clampedRaw = Math.max(0, Math.min(3, Math.round(rawScore))) as Score0to3;
  const cleanQuote = (quote || '').trim().replace(/^["']|["']$/g, '');

  if (clampedRaw <= 1) {
    const isSubstring = cleanQuote.length > 0 && answer.includes(cleanQuote);
    return {
      finalScore: clampedRaw,
      isQuoteVerified: isSubstring,
      cleanQuote: cleanQuote,
    };
  }

  // Score is 2 or 3: Quotation is strictly required to be a literal substring of the answer
  const isLiteralSubstring = validateQuoteSubstring(answer, cleanQuote);

  if (!isLiteralSubstring) {
    return {
      finalScore: 1, // Clamped down to 1 because score > 1 requires verified answer quotation
      isQuoteVerified: false,
      cleanQuote: cleanQuote,
      auditNote:
        'Score clamped to 1: Cited evidence quotation was not found as a literal substring of the submitted answer.',
    };
  }

  return {
    finalScore: clampedRaw,
    isQuoteVerified: true,
    cleanQuote: cleanQuote,
  };
}

// -------------------------------------------------------------
// 2. DETERMINISTIC AGGREGATE CALCULATIONS
// -------------------------------------------------------------

export const NORMALIZED_DIMENSION_WEIGHTS: Record<string, number> = {
  problem_framing: 0.25,
  decision_quality: 0.25,
  tradeoff_navigation: 0.25,
  verification_rigor: 0.25,
};

/**
 * Deterministically calculates weighted aggregate score across the 4 observable dimensions.
 * Never computed by an LLM.
 */
export function calculateDeterministicOverallScore(
  dimensionScores: { dimensionId: string; score: number }[],
  weights = NORMALIZED_DIMENSION_WEIGHTS
): { overallScore: number; normalizedPercentage: number } {
  let totalScore = 0;
  let totalWeight = 0;

  for (const item of dimensionScores) {
    const weight = weights[item.dimensionId] ?? 0.25;
    totalScore += item.score * weight;
    totalWeight += weight;
  }

  const overall = totalWeight > 0 ? totalScore / totalWeight : 0;
  const roundedOverall = Math.round(overall * 100) / 100;
  // Normalized percentage on 0-3 scale: (score / 3.0) * 100
  const normalizedPct = Math.round((roundedOverall / 3.0) * 100);

  return {
    overallScore: roundedOverall,
    normalizedPercentage: Math.min(100, Math.max(0, normalizedPct)),
  };
}

// -------------------------------------------------------------
// 3. STATE MACHINE TRANSITION VALIDATION
// -------------------------------------------------------------

const ALLOWED_STAGE_TRANSITIONS: Record<AssessmentStage, AssessmentStage[]> = {
  input: ['claim_review', 'clarification'],
  clarification: ['claim_review', 'clarification', 'input'],
  claim_review: ['task', 'input'],
  task: ['first_answer'],
  first_answer: ['follow_ups', 'task'],
  follow_ups: ['feedback'],
  feedback: ['revision'],
  revision: ['final_report', 'feedback'],
  final_report: ['input'],
};

export function isValidStageTransition(
  currentStage: AssessmentStage,
  targetStage: AssessmentStage
): boolean {
  if (currentStage === targetStage) return true;
  const allowed = ALLOWED_STAGE_TRANSITIONS[currentStage] || [];
  return allowed.includes(targetStage);
}

// -------------------------------------------------------------
// 4. TRUSTED SERVER-SIDE SESSION STORE
// -------------------------------------------------------------

export interface ServerSessionRecord {
  sessionId: string;
  roleId: TargetRole;
  stage: AssessmentStage;
  rawCvText?: string;
  extractedClaims?: any[];
  selectedClaimId?: string;
  groundedTask?: GroundedTask;
  predictedScore?: Score0to3;
  predictionRationale?: string;
  firstAnswer?: string;
  initialAssessment?: InitialAssessment;
  followUpAnswer1?: string;
  followUpAnswer2?: string;
  chosenNextStepId?: 'option_a' | 'option_b';
  revisedAnswer?: string;
  revisionEvaluation?: RevisionEvaluation;
  createdAt: number;
  updatedAt: number;
}

class InMemorySessionStore {
  private sessions = new Map<string, ServerSessionRecord>();

  getOrCreateSession(sessionId?: string, roleId: TargetRole = 'aiml-intern'): ServerSessionRecord {
    const id = sessionId && this.sessions.has(sessionId) ? sessionId : crypto.randomUUID();
    let session = this.sessions.get(id);

    if (!session) {
      session = {
        sessionId: id,
        roleId,
        stage: 'input',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.sessions.set(id, session);
    }
    return session;
  }

  getSession(sessionId: string): ServerSessionRecord | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, updates: Partial<ServerSessionRecord>): ServerSessionRecord {
    const existing = this.sessions.get(sessionId);
    if (!existing) {
      throw new Error(`Session ${sessionId} not found.`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    this.sessions.set(sessionId, updated);
    return updated;
  }
}

export const sessionStore = new InMemorySessionStore();

// -------------------------------------------------------------
// 5. ZOD SCHEMAS FOR STRUCTURED GEMINI VALIDATION
// -------------------------------------------------------------

export const ClaimExtractionResponseSchema = z.object({
  needsClarification: z.boolean(),
  missingElements: z.array(z.string()).optional(),
  reason: z.string().optional(),
  promptQuestions: z.array(z.string()).optional(),
  claims: z
    .array(
      z.object({
        id: z.string(),
        projectTitle: z.string(),
        verbatimQuote: z.string(),
        toolsMentioned: z.array(z.string()),
        technicalDecision: z.string(),
        claimedOutcome: z.string(),
        groundingConfidence: z.enum(['high', 'moderate']),
      })
    )
    .optional(),
});

export const GroundedTaskResponseSchema = z.object({
  id: z.string(),
  roleId: z.enum(['aiml-intern', 'data-analyst-intern', 'frontend-dev-intern']),
  projectTitle: z.string(),
  quotedTool: z.string(),
  quotedDecision: z.string(),
  verbatimSource: z.string(),
  taskTitle: z.string(),
  scenarioDescription: z.string(),
  requiredDeliverables: z.array(z.string()),
  technicalConstraints: z.array(z.string()),
  rubricVersion: z.string(),
});

export const RawInitialAssessmentSchema = z.object({
  dimensionScores: z.array(
    z.object({
      dimensionId: z.enum([
        'problem_framing',
        'decision_quality',
        'tradeoff_navigation',
        'verification_rigor',
      ]),
      dimensionName: z.string(),
      score: z.number().min(0).max(3),
      anchorMatched: z.string(),
      observation: z.string(),
      evidenceQuote: z.string().default(''),
      unsupportedAreas: z.string(),
    })
  ),
  demonstratedSummary: z.array(z.string()),
  unsupportedSummary: z.array(z.string()),
  strategyImprovement: z.string(),
  adaptiveFollowUps: z.tuple([
    z.object({ id: z.literal('follow_up_1'), question: z.string(), intent: z.string() }),
    z.object({ id: z.literal('follow_up_2'), question: z.string(), intent: z.string() }),
  ]),
  nextSteps: z.tuple([
    z.object({
      id: z.literal('option_a'),
      title: z.string(),
      focusArea: z.string(),
      description: z.string(),
      recommendedGuidance: z.string(),
    }),
    z.object({
      id: z.literal('option_b'),
      title: z.string(),
      focusArea: z.string(),
      description: z.string(),
      recommendedGuidance: z.string(),
    }),
  ]),
});

export const RawRevisionEvaluationSchema = z.object({
  dimensionScores: z.array(
    z.object({
      dimensionId: z.enum([
        'problem_framing',
        'decision_quality',
        'tradeoff_navigation',
        'verification_rigor',
      ]),
      dimensionName: z.string(),
      score: z.number().min(0).max(3),
      evidenceQuote: z.string().default(''),
      evidenceDelta: z.string(),
    })
  ),
  critiqueUptake: z.object({
    score: z.number().min(0).max(3),
    anchorLabel: z.string(),
    evidenceQuote: z.string().default(''),
    critique: z.string(),
  }),
  chosenNextStepTitle: z.string(),
  nextStepApplicationCritique: z.string(),
  verifiedCompetencies: z.array(z.string()),
  synthesis: z.string(),
});
