/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AssessmentStage,
  ClarificationDetail,
  ExtractedClaim,
  GroundedTask,
  InitialAssessment,
  NextStepOption,
  RevisionEvaluation,
  StudentDraft,
  TargetRole
} from './types/index.ts';
import { ROLE_RUBRICS } from './data/rubrics.ts';
import { REHEARSAL_DATA } from './data/rehearsalData.ts';
import { Header } from './components/Header.tsx';
import { HowItWorksModal } from './components/HowItWorksModal.tsx';
import { ProgressNav } from './components/ProgressNav.tsx';
import { FocusCard } from './components/FocusCard.tsx';
import { InputStep } from './components/steps/InputStep.tsx';
import { ClarificationStep } from './components/steps/ClarificationStep.tsx';
import { ClaimReviewStep } from './components/steps/ClaimReviewStep.tsx';
import { TaskStep } from './components/steps/TaskStep.tsx';
import { FollowUpStep } from './components/steps/FollowUpStep.tsx';
import { FeedbackStep } from './components/steps/FeedbackStep.tsx';
import { RevisionStep } from './components/steps/RevisionStep.tsx';
import { ReportStep } from './components/steps/ReportStep.tsx';
import { AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import {
  clearLocalDraft,
  isLocalDraftEnabled,
  loadLocalDraft,
  saveLocalDraft,
  setLocalDraftEnabled
} from './utils/localDraft.ts';

const INITIAL_DRAFT: StudentDraft = {
  predictedScore: 2,
  predictionConfidence: 'moderate',
  predictionRationale: '',
  firstAnswer: '',
  followUpAnswer1: '',
  followUpAnswer2: '',
  chosenNextStepId: null,
  revisedAnswer: '',
};

export default function App() {
  // Session Configuration & State
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [isRehearsal, setIsRehearsal] = useState(false);
  const [serverConfigured, setServerConfigured] = useState(true);
  const [modelName, setModelName] = useState('gemini-3.8-flash');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Local draft state
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState<boolean>(() => isLocalDraftEnabled());
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(() => Boolean(loadLocalDraft()));

  // Core Progression State
  const [selectedRole, setSelectedRole] = useState<TargetRole>('aiml-intern');
  const [isRoleLocked, setIsRoleLocked] = useState(false);
  const [stage, setStage] = useState<AssessmentStage>('input');

  // Grounding Data
  const [rawInputText, setRawInputText] = useState('');
  const [clarification, setClarification] = useState<ClarificationDetail | undefined>(undefined);
  const [extractedClaims, setExtractedClaims] = useState<ExtractedClaim[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [groundedTask, setGroundedTask] = useState<GroundedTask | null>(null);

  // Draft & Evaluations
  const [draft, setDraft] = useState<StudentDraft>(INITIAL_DRAFT);
  const [initialAssessment, setInitialAssessment] = useState<InitialAssessment | null>(null);
  const [revisionEvaluation, setRevisionEvaluation] = useState<RevisionEvaluation | null>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check server config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setServerConfigured(Boolean(data.configured));
        if (data.model) setModelName(data.model);
        if (!data.configured) {
          setIsRehearsal(true);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch /api/config:', err);
        setServerConfigured(false);
      });
  }, []);

  // Persist draft if enabled
  useEffect(() => {
    if (isAutoSaveEnabled && (rawInputText.trim().length > 0 || draft.firstAnswer.trim().length > 0)) {
      saveLocalDraft(selectedRole, rawInputText, draft);
      setHasSavedDraft(true);
    }
  }, [isAutoSaveEnabled, selectedRole, rawInputText, draft]);

  const handleToggleAutoSave = (enabled: boolean) => {
    setIsAutoSaveEnabled(enabled);
    setLocalDraftEnabled(enabled);
    if (enabled) {
      saveLocalDraft(selectedRole, rawInputText, draft);
      setHasSavedDraft(true);
    }
  };

  const handleRestoreDraft = () => {
    const saved = loadLocalDraft();
    if (saved) {
      if (saved.selectedRole && !isRoleLocked) {
        setSelectedRole(saved.selectedRole);
      }
      if (saved.rawInputText) {
        setRawInputText(saved.rawInputText);
      }
      if (saved.draft) {
        setDraft(saved.draft);
      }
    }
  };

  const handleClearDraft = () => {
    clearLocalDraft();
    setHasSavedDraft(false);
  };

  // Update draft partials
  const handleUpdateDraft = (updates: Partial<StudentDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  // Toggle Rehearsal Mode
  const handleToggleRehearsal = () => {
    const nextRehearsal = !isRehearsal;
    setIsRehearsal(nextRehearsal);
    setErrorMessage(null);

    // If switching to rehearsal and text is empty, preload rehearsal sample
    if (nextRehearsal && rawInputText.trim().length === 0) {
      setRawInputText(REHEARSAL_DATA[selectedRole].sampleInput);
    }
  };

  // Reset Session
  const handleResetSession = () => {
    setShowResetConfirm(false);
    setSessionId(crypto.randomUUID());
    setStage('input');
    setIsRoleLocked(false);
    setClarification(undefined);
    setExtractedClaims([]);
    setSelectedClaimId(null);
    setGroundedTask(null);
    setDraft(INITIAL_DRAFT);
    setInitialAssessment(null);
    setRevisionEvaluation(null);
    setErrorMessage(null);
  };

  const handleClearSession = () => {
    handleResetSession();
    setRawInputText('');
  };

  // STEP 1 -> 2: Extract Claims from Raw Text
  const handleExtractClaims = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingMessage('Extracting concrete project claims with verbatim source quotations...');

    if (isRehearsal) {
      setTimeout(() => {
        const bundle = REHEARSAL_DATA[selectedRole];
        setExtractedClaims(bundle.claims);
        setSelectedClaimId(bundle.claims[0].id);
        setIsRoleLocked(true);
        setStage('claim_review');
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch('/api/extract-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, roleId: selectedRole, rawText: rawInputText }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error (${response.status})`);
      }

      const data = await response.json();

      if (data.needsClarification) {
        setClarification(data);
        setStage('clarification');
      } else if (data.claims && data.claims.length > 0) {
        setExtractedClaims(data.claims);
        setSelectedClaimId(data.claims[0].id);
        setIsRoleLocked(true);
        setStage('claim_review');
      } else {
        throw new Error('No concrete claims could be extracted. Please add specific technical decisions.');
      }
    } catch (err: any) {
      console.error('Extract claims failure:', err);
      setErrorMessage(err.message || 'Failed to extract claims. Your draft has been preserved.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 -> 3: Generate Grounded Task
  const handleGenerateTask = async () => {
    const selectedClaim = extractedClaims.find((c) => c.id === selectedClaimId);
    if (!selectedClaim) return;

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingMessage('Generating challenge task grounded in your quoted decision...');

    const rubric = ROLE_RUBRICS[selectedRole];

    if (isRehearsal) {
      setTimeout(() => {
        const bundle = REHEARSAL_DATA[selectedRole];
        setGroundedTask(bundle.task);
        // Preload preset answers if draft is empty
        if (!draft.firstAnswer) {
          setDraft((prev) => ({
            ...prev,
            predictedScore: bundle.presetDraft.predictedScore,
            predictionConfidence: bundle.presetDraft.predictionConfidence,
            predictionRationale: bundle.presetDraft.predictionRationale,
            firstAnswer: bundle.presetDraft.firstAnswer,
          }));
        }
        setStage('task');
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch('/api/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          roleId: selectedRole,
          claim: selectedClaim,
          rubricVersion: rubric.version,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Task generation failed (${response.status})`);
      }

      const task = await response.json();
      setGroundedTask(task);
      setStage('task');
    } catch (err: any) {
      console.error('Generate task failure:', err);
      setErrorMessage(err.message || 'Failed to generate task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3 -> 4: Submit First Answer & Generate Probes
  const handleSubmitFirstAnswer = async () => {
    if (!groundedTask) return;

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingMessage('Assessing answer against rubric and generating adaptive follow-ups...');

    if (isRehearsal) {
      setTimeout(() => {
        const bundle = REHEARSAL_DATA[selectedRole];
        setInitialAssessment(bundle.initialAssessment);
        if (!draft.followUpAnswer1) {
          setDraft((prev) => ({
            ...prev,
            followUpAnswer1: bundle.presetDraft.followUpAnswer1,
            followUpAnswer2: bundle.presetDraft.followUpAnswer2,
          }));
        }
        setStage('follow_ups');
        setIsLoading(false);
      }, 600);
      return;
    }

    try {
      const response = await fetch('/api/assess-and-probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          roleId: selectedRole,
          task: groundedTask,
          predictedScore: draft.predictedScore,
          predictionRationale: draft.predictionRationale,
          firstAnswer: draft.firstAnswer,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Assessment failed (${response.status})`);
      }

      const assessment = await response.json();
      setInitialAssessment(assessment);
      setStage('follow_ups');
    } catch (err: any) {
      console.error('Assessment & probe failure:', err);
      setErrorMessage(err.message || 'Failed to evaluate answer. Your response is saved.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 4 -> 5: Submit Follow-ups -> Show Feedback
  const handleSubmitFollowUps = () => {
    if (!initialAssessment) return;
    // Set default chosen next step if not selected
    if (!draft.chosenNextStepId) {
      setDraft((prev) => ({ ...prev, chosenNextStepId: 'option_a' }));
    }
    setStage('feedback');
  };

  // STEP 5 -> 6: Proceed to Revision
  const handleProceedToRevision = () => {
    // If revision is empty, copy firstAnswer so user can refine it
    if (!draft.revisedAnswer) {
      setDraft((prev) => ({ ...prev, revisedAnswer: prev.firstAnswer }));
    }
    setStage('revision');
  };

  // STEP 6 -> 7: Submit Revision & Finalize Report
  const handleSubmitRevision = async () => {
    if (!groundedTask || !initialAssessment) return;

    const chosenStep =
      initialAssessment.nextSteps.find((s) => s.id === draft.chosenNextStepId) ||
      initialAssessment.nextSteps[0];

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingMessage('Comparing before/after evidence and synthesizing final report...');

    if (isRehearsal) {
      setTimeout(() => {
        const bundle = REHEARSAL_DATA[selectedRole];
        setRevisionEvaluation(bundle.revisionEvaluation);
        setStage('final_report');
        setIsLoading(false);
      }, 700);
      return;
    }

    try {
      const response = await fetch('/api/evaluate-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          roleId: selectedRole,
          task: groundedTask,
          followUpAnswer1: draft.followUpAnswer1,
          followUpAnswer2: draft.followUpAnswer2,
          chosenNextStep: chosenStep,
          firstAnswer: draft.firstAnswer,
          revisedAnswer: draft.revisedAnswer,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Revision evaluation failed (${response.status})`);
      }

      const evaluation = await response.json();
      setRevisionEvaluation(evaluation);
      setStage('final_report');
    } catch (err: any) {
      console.error('Revision evaluation failure:', err);
      setErrorMessage(err.message || 'Failed to evaluate revision. Your work is saved.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClaim = extractedClaims.find((c) => c.id === selectedClaimId) || null;
  const chosenNextStep =
    initialAssessment?.nextSteps.find((s) => s.id === draft.chosenNextStepId) ||
    initialAssessment?.nextSteps[0];

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-stone-800 flex flex-col font-sans selection:bg-[#c2d6c7] selection:text-[#0f281c]">
      {/* SkillBridge Header */}
      <Header
        isRehearsal={isRehearsal}
        onToggleRehearsal={handleToggleRehearsal}
        onOpenHowItWorks={() => setShowHowItWorks(true)}
        onResetSession={() => setShowResetConfirm(true)}
        isRoleLocked={isRoleLocked}
        serverConfigured={serverConfigured}
        canReset={isRoleLocked || stage !== 'input' || rawInputText.trim().length > 0 || hasSavedDraft}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Recoverable Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold block">Assessment Request Notice</strong>
                <p className="text-xs text-red-800 mt-0.5 leading-relaxed">{errorMessage}</p>
                <p className="text-[11px] text-red-700 mt-1">
                  Your work has been safely preserved. You can retry immediately or switch to Synthetic Rehearsal.
                </p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-800 p-1"
              aria-label="Dismiss error"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-3 border-[#153424]/20 border-t-[#153424] animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-[#0f281c]">Processing Assessment Step</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{loadingMessage}</p>
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                {isRehearsal ? 'Synthetic Rehearsal · Fictional Grounding' : 'Live Gemini 3.8 Flash Engine'}
              </span>
            </div>
          </div>
        )}

        {/* Three-Column Workspace Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Column 1: Left Progress Navigation */}
          <ProgressNav
            currentStage={stage}
            selectedRole={selectedRole}
            isRoleLocked={isRoleLocked}
            onSelectRole={(newRole) => {
              if (!isRoleLocked) {
                setSelectedRole(newRole);
              }
            }}
          />

          {/* Column 2: Central Assessment Workspace Card */}
          <section className="flex-1 w-full min-w-0 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-[#e5e1d8]">
            {stage === 'input' && (
              <InputStep
                selectedRole={selectedRole}
                onSelectRole={(r) => {
                  if (!isRoleLocked) setSelectedRole(r);
                }}
                isRoleLocked={isRoleLocked}
                rawText={rawInputText}
                onChangeText={setRawInputText}
                onSubmit={handleExtractClaims}
                isLoading={isLoading}
                isRehearsal={isRehearsal}
                onToggleRehearsal={handleToggleRehearsal}
                isAutoSaveEnabled={isAutoSaveEnabled}
                onToggleAutoSave={handleToggleAutoSave}
                hasSavedDraft={hasSavedDraft}
                onRestoreDraft={handleRestoreDraft}
                onClearDraft={handleClearDraft}
                onClearSession={handleClearSession}
              />
            )}

            {stage === 'clarification' && clarification && (
              <ClarificationStep
                selectedRole={selectedRole}
                clarification={clarification}
                rawText={rawInputText}
                onUpdateTextAndRetry={(newText) => {
                  setRawInputText(newText);
                  handleExtractClaims();
                }}
                onBackToInput={() => setStage('input')}
                isLoading={isLoading}
              />
            )}

            {stage === 'claim_review' && (
              <ClaimReviewStep
                selectedRole={selectedRole}
                claims={extractedClaims}
                selectedClaimId={selectedClaimId}
                onSelectClaim={setSelectedClaimId}
                onGenerateTask={handleGenerateTask}
                onBackToInput={() => {
                  setStage('input');
                  setIsRoleLocked(false);
                }}
                isLoading={isLoading}
              />
            )}

            {stage === 'task' && groundedTask && (
              <TaskStep
                selectedRole={selectedRole}
                task={groundedTask}
                draft={draft}
                onUpdateDraft={handleUpdateDraft}
                onSubmitAnswer={handleSubmitFirstAnswer}
                isLoading={isLoading}
              />
            )}

            {stage === 'follow_ups' && initialAssessment && (
              <FollowUpStep
                selectedRole={selectedRole}
                initialAssessment={initialAssessment}
                draft={draft}
                onUpdateDraft={handleUpdateDraft}
                onSubmitFollowUps={handleSubmitFollowUps}
                isLoading={isLoading}
              />
            )}

            {stage === 'feedback' && initialAssessment && (
              <FeedbackStep
                selectedRole={selectedRole}
                initialAssessment={initialAssessment}
                draft={draft}
                onSelectNextStep={(stepId) => handleUpdateDraft({ chosenNextStepId: stepId })}
                onProceedToRevision={handleProceedToRevision}
              />
            )}

            {stage === 'revision' && chosenNextStep && (
              <RevisionStep
                selectedRole={selectedRole}
                chosenNextStep={chosenNextStep}
                draft={draft}
                onUpdateDraft={handleUpdateDraft}
                onSubmitRevision={handleSubmitRevision}
                isLoading={isLoading}
              />
            )}

            {stage === 'final_report' && groundedTask && initialAssessment && revisionEvaluation && (
              <ReportStep
                selectedRole={selectedRole}
                task={groundedTask}
                draft={draft}
                initialAssessment={initialAssessment}
                evaluation={revisionEvaluation}
                onResetSession={handleResetSession}
                isRehearsal={isRehearsal}
                modelName={modelName}
              />
            )}
          </section>

          {/* Column 3: Right Dark-Green Focus Card */}
          <FocusCard
            selectedRole={selectedRole}
            groundedTask={groundedTask}
            selectedClaim={selectedClaim}
            draft={draft}
            initialAssessment={initialAssessment}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#e5e1d8] bg-[#f8f6f0] py-4 text-center text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0f281c]">SkillBridge AI</span>
            <span>·</span>
            <span>AICON’26 EdTech &amp; Workforce Domain</span>
            <span>·</span>
            <span className="font-semibold text-stone-700">Team Gradient</span>
          </div>
          <p className="text-[11px] text-stone-600">
            Student owns feedback · Practice on 1 grounded task · Not hiring screening or certification
          </p>
        </div>
      </footer>

      {/* Methodology Modal */}
      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />

      {/* Confirm Reset Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f281c]">Start a New Session?</h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Starting a new session will clear current answers and unlock role selection.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSession}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
