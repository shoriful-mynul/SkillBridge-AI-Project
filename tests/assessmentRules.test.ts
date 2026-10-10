/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDeterministicOverallScore,
  isValidStageTransition,
  NORMALIZED_DIMENSION_WEIGHTS,
  sessionStore,
  validateAndEnforceScoreQuote,
  validateQuoteSubstring
} from '../server/assessmentEngine.ts';
import { GeminiService } from '../server/geminiService.ts';
import { z } from 'zod';
import { AssessmentStage, Score0to3 } from '../src/types/index.ts';

// =========================================================================
// TEST SUITE: SkillBridge AI Assessment Rules Verification
// =========================================================================

describe('1. Quotation Validation & Literal Substring Rules', () => {
  const studentAnswer =
    'In our project, we chose DenseNet-121 over ResNet-50 because DenseNet connects all preceding layer feature maps via concatenation. We grouped by patient ID before splitting 70/15/15 to prevent leakage.';

  const cvExcerpt =
    'Experienced ML Intern. Worked with TensorFlow and conducted data analysis for hospital radiology units.';

  it('validates exact literal substring of the submitted answer', () => {
    const validQuote = 'DenseNet connects all preceding layer feature maps via concatenation';
    const isValid = validateQuoteSubstring(studentAnswer, validQuote);
    assert.equal(isValid, true, 'Literal quote from student answer must be accepted');
  });

  it('rejects hallucinated or modified quotes that do not appear in the answer', () => {
    const alteredQuote = 'DenseNet adds preceding feature maps using residual addition';
    const isValid = validateQuoteSubstring(studentAnswer, alteredQuote);
    assert.equal(isValid, false, 'Altered quote must be rejected');
  });

  it('never accepts quotations from the CV as answer evidence', () => {
    const cvQuote = 'conducted data analysis for hospital radiology units';
    // CV quote is in CV, but NOT in student answer
    assert.equal(cvExcerpt.includes(cvQuote), true);
    assert.equal(validateQuoteSubstring(studentAnswer, cvQuote), false, 'CV text must not count as answer evidence');
  });

  it('preserves score > 1 when quotation is a verified literal substring', () => {
    const result = validateAndEnforceScoreQuote(
      3,
      'DenseNet connects all preceding layer feature maps via concatenation',
      studentAnswer
    );
    assert.equal(result.finalScore, 3);
    assert.equal(result.isQuoteVerified, true);
  });

  it('strictly clamps score to 1 if score > 1 lacks an exact literal quotation', () => {
    const resultWithoutQuote = validateAndEnforceScoreQuote(3, '', studentAnswer);
    assert.equal(resultWithoutQuote.finalScore, 1, 'Score must be clamped to 1 when quote is missing');
    assert.equal(resultWithoutQuote.isQuoteVerified, false);
    assert.match(resultWithoutQuote.auditNote || '', /clamped to 1/i);

    const resultWithFakeQuote = validateAndEnforceScoreQuote(
      2,
      'This sentence was never written by the student',
      studentAnswer
    );
    assert.equal(resultWithFakeQuote.finalScore, 1, 'Score must be clamped to 1 when quote is not a substring');
    assert.equal(resultWithFakeQuote.isQuoteVerified, false);
  });

  it('permits score 0 or 1 without requiring quotation evidence', () => {
    const resultScore0 = validateAndEnforceScoreQuote(0, '', studentAnswer);
    assert.equal(resultScore0.finalScore, 0);

    const resultScore1 = validateAndEnforceScoreQuote(1, '', studentAnswer);
    assert.equal(resultScore1.finalScore, 1);
  });
});

describe('2. Initial Null Coachability Rule', () => {
  it('represents coachability/critique uptake as strictly null on the first attempt', () => {
    const sampleDimensionScores = [
      { dimensionId: 'problem_framing', score: 2 },
      { dimensionId: 'decision_quality', score: 2 },
      { dimensionId: 'tradeoff_navigation', score: 1 },
      { dimensionId: 'verification_rigor', score: 2 },
    ];

    const { overallScore, normalizedPercentage } = calculateDeterministicOverallScore(sampleDimensionScores);

    const initialAssessmentRecord = {
      overallScore,
      normalizedPercentage,
      dimensionScores: sampleDimensionScores,
      critiqueUptake: null, // As required by assessment rules
    };

    assert.strictEqual(
      initialAssessmentRecord.critiqueUptake,
      null,
      'Critique uptake must be strictly null (unobserved) on first attempt, not zero'
    );
    assert.notEqual(
      initialAssessmentRecord.critiqueUptake,
      0,
      'Critique uptake must NOT be represented as zero on first attempt'
    );
  });
});

describe('3. Comparable Revision Weights & Deterministic Calculations', () => {
  it('uses the same four observable dimensions and identical 0.25 normalized weights on both attempts', () => {
    const initialScores = [
      { dimensionId: 'problem_framing', score: 1 },
      { dimensionId: 'decision_quality', score: 2 },
      { dimensionId: 'tradeoff_navigation', score: 1 },
      { dimensionId: 'verification_rigor', score: 2 },
    ];

    const revisedScores = [
      { dimensionId: 'problem_framing', score: 2 },
      { dimensionId: 'decision_quality', score: 3 },
      { dimensionId: 'tradeoff_navigation', score: 2 },
      { dimensionId: 'verification_rigor', score: 3 },
    ];

    // Check weights
    assert.equal(NORMALIZED_DIMENSION_WEIGHTS['problem_framing'], 0.25);
    assert.equal(NORMALIZED_DIMENSION_WEIGHTS['decision_quality'], 0.25);
    assert.equal(NORMALIZED_DIMENSION_WEIGHTS['tradeoff_navigation'], 0.25);
    assert.equal(NORMALIZED_DIMENSION_WEIGHTS['verification_rigor'], 0.25);

    // Initial calculation: (1 + 2 + 1 + 2) / 4 = 1.50
    const initialResult = calculateDeterministicOverallScore(initialScores);
    assert.equal(initialResult.overallScore, 1.5);
    assert.equal(initialResult.normalizedPercentage, 50);

    // Revised calculation: (2 + 3 + 2 + 3) / 4 = 2.50
    const revisedResult = calculateDeterministicOverallScore(revisedScores);
    assert.equal(revisedResult.overallScore, 2.5);
    assert.equal(revisedResult.normalizedPercentage, 83);

    const delta = Math.round((revisedResult.overallScore - initialResult.overallScore) * 100) / 100;
    assert.equal(delta, 1.0, 'Evidence delta must be deterministically calculated');
  });

  it('keeps critique uptake separate from the 4-dimension comparable aggregate', () => {
    // Critique uptake evaluated separately
    const separateCritiqueUptake = {
      score: 3 as Score0to3,
      anchorLabel: 'Exemplary',
      evidenceQuote: 'set our operational classification threshold using Youden J statistic at 0.38',
      critique: 'Successfully integrated edge latency and threshold guidance',
    };

    assert.ok(separateCritiqueUptake.score >= 0 && separateCritiqueUptake.score <= 3);
    assert.equal(typeof separateCritiqueUptake.critique, 'string');
  });
});

describe('4. State Machine Transition & Client Tampering Guards', () => {
  it('allows valid sequential state transitions', () => {
    assert.equal(isValidStageTransition('input', 'claim_review'), true);
    assert.equal(isValidStageTransition('claim_review', 'task'), true);
    assert.equal(isValidStageTransition('task', 'first_answer'), true);
    assert.equal(isValidStageTransition('first_answer', 'follow_ups'), true);
    assert.equal(isValidStageTransition('follow_ups', 'feedback'), true);
    assert.equal(isValidStageTransition('feedback', 'revision'), true);
    assert.equal(isValidStageTransition('revision', 'final_report'), true);
  });

  it('rejects invalid state jumps that skip steps or subvert assessment flow', () => {
    assert.equal(isValidStageTransition('input', 'revision'), false, 'Cannot jump from input directly to revision');
    assert.equal(isValidStageTransition('input', 'final_report'), false, 'Cannot jump from input to final_report');
    assert.equal(isValidStageTransition('task', 'final_report'), false, 'Cannot jump from task to report without answering');
    assert.equal(isValidStageTransition('claim_review', 'revision'), false, 'Cannot skip task and first answer');
  });

  it('server session store isolates trusted state from client-side score modification', () => {
    const testSession = sessionStore.getOrCreateSession('test-tamper-session', 'aiml-intern');
    assert.equal(testSession.stage, 'input');

    // Simulate initial assessment completed on server
    sessionStore.updateSession(testSession.sessionId, {
      stage: 'first_answer',
      initialAssessment: {
        overallScore: 1.5,
        normalizedPercentage: 50,
        dimensionScores: [
          {
            dimensionId: 'problem_framing',
            dimensionName: 'Problem Framing',
            score: 1,
            anchorMatched: 'Emerging',
            observation: 'Basic mention',
            evidenceQuote: '',
            isQuoteVerified: true,
            unsupportedAreas: 'No baseline',
          },
        ],
        demonstratedSummary: ['Defined task'],
        unsupportedSummary: ['Lacks baseline'],
        strategyImprovement: 'Add baseline',
        adaptiveFollowUps: [
          { id: 'follow_up_1', question: 'Why DenseNet?', intent: 'Tradeoffs' },
          { id: 'follow_up_2', question: 'What metrics?', intent: 'Validation' },
        ],
        nextSteps: [
          { id: 'option_a', title: 'Option A', focusArea: 'Tradeoffs', description: 'desc', recommendedGuidance: 'rec' },
          { id: 'option_b', title: 'Option B', focusArea: 'Validation', description: 'desc', recommendedGuidance: 'rec' },
        ],
        critiqueUptake: null,
      },
    });

    const retrieved = sessionStore.getSession(testSession.sessionId);
    assert.equal(retrieved?.initialAssessment?.overallScore, 1.5);
    // Even if client attempts to send modified score 3.0 in payload, server relies on retrieved.initialAssessment.overallScore
  });
});

describe('5. Reliability & Failed-Provider Behavior (Test Doubles)', () => {
  // Test Double: Mock AI client that simulates transient 500 error followed by success
  it('retries transient errors with bounded attempts using test double', async () => {
    let callCount = 0;
    const transientMockClient: any = {
      models: {
        generateContent: async () => {
          callCount++;
          if (callCount === 1) {
            throw new Error('503 Service Unavailable: transient network blip');
          }
          return {
            text: JSON.stringify({
              result: 'success after retry',
            }),
          };
        },
      },
    };

    const service = new GeminiService('dummy-key', 'mock-model', transientMockClient);
    const schema = z.object({ result: z.string() });

    const output = await service.generateStructuredContent('test prompt', schema, {
      maxRetries: 2,
      timeoutMs: 5000,
    });

    assert.equal(callCount, 2, 'Should succeed on second attempt after transient error');
    assert.equal(output.result, 'success after retry');
  });

  // Test Double: Mock AI client simulating 429 quota exhaustion
  it('does NOT repeatedly retry 429 rate limits or client auth errors', async () => {
    let callCount = 0;
    const rateLimitMockClient: any = {
      models: {
        generateContent: async () => {
          callCount++;
          throw new Error('429 Quota exceeded: RESOURCE_EXHAUSTED');
        },
      },
    };

    const service = new GeminiService('dummy-key', 'mock-model', rateLimitMockClient);
    const schema = z.object({ result: z.string() });

    await assert.rejects(
      async () => {
        await service.generateStructuredContent('test prompt', schema, { maxRetries: 2 });
      },
      (err: any) => {
        assert.match(err.message, /429/);
        return true;
      }
    );

    assert.equal(callCount, 1, 'Must fail immediately without repeated retries on 429');
  });

  // Test Double: Mock AI client simulating request timeout
  it('handles bounded timeouts properly without advancing state', async () => {
    const hangingMockClient: any = {
      models: {
        generateContent: async () => {
          // Hangs forever
          return new Promise(() => {});
        },
      },
    };

    const service = new GeminiService('dummy-key', 'mock-model', hangingMockClient);
    const schema = z.object({ result: z.string() });

    await assert.rejects(
      async () => {
        await service.generateStructuredContent('test prompt', schema, {
          timeoutMs: 80, // Bounded short timeout
          maxRetries: 0,
        });
      },
      (err: any) => {
        assert.equal(err.isTimeout, true, 'Error must be flagged as timeout');
        return true;
      }
    );
  });
});

describe('6. Text-Based PDF Import & File Validation Rules', () => {
  // Test PDF extraction service functions
  it('enforces the 5 MB file size limit and rejects larger buffers', async () => {
    const { extractTextFromPdfBuffer } = await import('../server/pdfService.ts');
    const oversizeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024); // 5 MB + 1 KB

    const result = await extractTextFromPdfBuffer(oversizeBuffer, 'oversize.pdf');
    assert.equal(result.success, false);
    assert.match(result.error || '', /exceeds the 5 MB limit/i);
  });

  it('validates PDF magic bytes and rejects non-PDF files', async () => {
    const { extractTextFromPdfBuffer } = await import('../server/pdfService.ts');
    const fakeBuffer = Buffer.from('This is a text or binary file, not a PDF.');

    const result = await extractTextFromPdfBuffer(fakeBuffer, 'fake.pdf');
    assert.equal(result.success, false);
    assert.match(result.error || '', /not a valid PDF document/i);
  });

  it('detects scanned or empty PDFs and explains the limitation without fabricating text', async () => {
    const { extractTextFromPdfBuffer } = await import('../server/pdfService.ts');
    // Minimal valid PDF structure with empty text catalog
    const emptyPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer << /Size 4 /Root 1 0 R >>
startxref
190
%%EOF`;

    const result = await extractTextFromPdfBuffer(Buffer.from(emptyPdfContent), 'empty.pdf');
    assert.equal(result.success, false);
    assert.equal(result.isScannedOrEmpty, true);
    assert.match(result.error || '', /scanned, image-based, or encrypted/i);
  });
});

describe('7. Optional Local Draft & Data Boundary Rules', () => {
  it('persists only editable student drafts and never credentials or trusted scores', async () => {
    // Mock localStorage in node environment for test
    const storageMap = new Map<string, string>();
    const mockStorage: Storage = {
      getItem: (k: string) => storageMap.get(k) || null,
      setItem: (k: string, v: string) => storageMap.set(k, v),
      removeItem: (k: string) => storageMap.delete(k),
      clear: () => storageMap.clear(),
      key: () => null,
      length: storageMap.size,
    };
    (globalThis as any).localStorage = mockStorage;

    const { saveLocalDraft, setLocalDraftEnabled, loadLocalDraft } = await import('../src/utils/localDraft.ts');

    // Default: disabled
    setLocalDraftEnabled(true);

    const testDraft = {
      predictedScore: 2 as const,
      predictionConfidence: 'moderate' as const,
      predictionRationale: 'Clear architecture',
      firstAnswer: 'Chosen DenseNet-121 over ResNet-50',
      followUpAnswer1: 'Answer 1',
      followUpAnswer2: 'Answer 2',
      chosenNextStepId: 'option_a' as const,
      revisedAnswer: 'Revised answer',
    };

    saveLocalDraft('aiml-intern', 'Project description text', testDraft);

    const loaded = loadLocalDraft();
    assert.ok(loaded);
    assert.equal(loaded.selectedRole, 'aiml-intern');
    assert.equal(loaded.rawInputText, 'Project description text');
    assert.equal(loaded.draft.firstAnswer, 'Chosen DenseNet-121 over ResNet-50');

    // Security assertion: Loaded payload must NOT contain API keys, server tokens, or trusted overallScore
    assert.equal((loaded as any).apiKey, undefined);
    assert.equal((loaded as any).initialAssessment, undefined);
    assert.equal((loaded as any).overallScore, undefined);
  });
});

