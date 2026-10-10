/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TargetRole = 'aiml-intern' | 'data-analyst-intern' | 'frontend-dev-intern';

// 0–3 anchored scale as required
export type Score0to3 = 0 | 1 | 2 | 3;

export interface RubricDimensionAnchor {
  score: Score0to3; // 0: Unobserved, 1: Emerging, 2: Competent, 3: Exemplary
  label: string;
  criteria: string;
}

export interface RubricDimension {
  id: 'problem_framing' | 'decision_quality' | 'tradeoff_navigation' | 'verification_rigor';
  name: string;
  description: string;
  anchors: RubricDimensionAnchor[];
}

export interface RoleRubric {
  roleId: TargetRole;
  roleTitle: string;
  version: string;
  description: string;
  coreSkills: string[];
  taskConstraints: string[];
  dimensions: RubricDimension[];
}

export interface ExtractedClaim {
  id: string;
  projectTitle: string;
  verbatimQuote: string; // Exact quote from student's raw text
  toolsMentioned: string[];
  technicalDecision: string;
  claimedOutcome: string;
  groundingConfidence: 'high' | 'moderate';
}

export interface ClarificationDetail {
  needsClarification: boolean;
  missingElements: string[];
  reason: string;
  promptQuestions: string[];
}

export interface GroundedTask {
  id: string;
  roleId: TargetRole;
  projectTitle: string;
  quotedTool: string;
  quotedDecision: string;
  verbatimSource: string;
  taskTitle: string;
  scenarioDescription: string;
  requiredDeliverables: string[];
  technicalConstraints: string[];
  rubricVersion: string;
}

// Dimension score with validated literal quotation evidence
export interface DimensionScore {
  dimensionId: RubricDimension['id'];
  dimensionName: string;
  score: Score0to3; // 0 - 3 scale
  anchorMatched: string;
  observation: string;
  evidenceQuote: string; // Literal substring quote from student's answer (required if score > 1)
  isQuoteVerified: boolean; // Server verified literal substring
  unsupportedAreas: string; // What remains unsupported or unclear
}

export interface NextStepOption {
  id: 'option_a' | 'option_b';
  title: string;
  focusArea: string;
  description: string;
  recommendedGuidance: string;
}

// Initial assessment on attempt 1
export interface InitialAssessment {
  overallScore: number; // Deterministically computed weighted aggregate (0.0 to 3.0)
  normalizedPercentage: number; // Deterministic 0 - 100%
  dimensionScores: DimensionScore[];
  demonstratedSummary: string[];
  unsupportedSummary: string[];
  strategyImprovement: string; // One strategy-focused improvement
  adaptiveFollowUps: [
    { id: 'follow_up_1'; question: string; intent: string },
    { id: 'follow_up_2'; question: string; intent: string }
  ];
  nextSteps: [NextStepOption, NextStepOption];
  // Coachability / critique uptake is strictly unobserved on first attempt
  critiqueUptake: null;
}

// Separate critique uptake evaluated only after revision
export interface CritiqueUptakeEvaluation {
  score: Score0to3;
  anchorLabel: string;
  evidenceQuote: string;
  critique: string;
}

// Final evidence report comparing before/after
export interface RevisionEvaluation {
  initialOverallScore: number; // Same 4 observable dimensions
  revisedOverallScore: number; // Same 4 observable dimensions & same weights
  scoreDelta: number;
  label: 'Evidence change on this task'; // Explicit mandatory label
  dimensionDeltas: {
    dimensionId: RubricDimension['id'];
    dimensionName: string;
    initialScore: Score0to3;
    revisedScore: Score0to3;
    evidenceQuote: string;
    isQuoteVerified: boolean;
    evidenceDelta: string;
  }[];
  chosenNextStepTitle: string;
  nextStepApplicationCritique: string;
  // Critique uptake displayed SEPARATELY
  critiqueUptake: CritiqueUptakeEvaluation;
  verifiedCompetencies: string[];
  synthesis: string;
  evidenceDisclaimer: string; // "A literal quote is evidence of what was written, not proof of technical correctness or code execution."
  ownershipDisclaimer: string; // "Practice on this grounded task demonstrated · Not hiring screening or general skill certification · The student owns this feedback."
}

export type AssessmentStage =
  | 'input'
  | 'clarification'
  | 'claim_review'
  | 'task'
  | 'first_answer'
  | 'follow_ups'
  | 'feedback'
  | 'revision'
  | 'final_report';

export interface StudentDraft {
  predictedScore: Score0to3;
  predictionConfidence: 'high' | 'moderate' | 'tentative';
  predictionRationale: string;
  firstAnswer: string;
  followUpAnswer1: string;
  followUpAnswer2: string;
  chosenNextStepId: 'option_a' | 'option_b' | null;
  revisedAnswer: string;
}

export interface SessionState {
  sessionId: string;
  isRehearsal: boolean;
  stage: AssessmentStage;
  selectedRole: TargetRole;
  isRoleLocked: boolean;
  rawInputText: string;
  clarification?: ClarificationDetail;
  extractedClaims: ExtractedClaim[];
  selectedClaimId: string | null;
  groundedTask: GroundedTask | null;
  draft: StudentDraft;
  initialAssessment: InitialAssessment | null;
  revisionEvaluation: RevisionEvaluation | null;
  isLoading: boolean;
  loadingMessage: string;
  errorMessage: string | null;
}
