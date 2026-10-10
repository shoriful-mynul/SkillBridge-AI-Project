/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InitialAssessment, StudentDraft, TargetRole } from '../../types/index.ts';
import { ROLE_RUBRICS } from '../../data/rubrics.ts';
import { HelpCircle, ChevronDown, ChevronUp, ArrowRight, Info, MessageSquare } from 'lucide-react';

interface FollowUpStepProps {
  selectedRole: TargetRole;
  initialAssessment: InitialAssessment;
  draft: StudentDraft;
  onUpdateDraft: (updates: Partial<StudentDraft>) => void;
  onSubmitFollowUps: () => void;
  isLoading: boolean;
}

export const FollowUpStep: React.FC<FollowUpStepProps> = ({
  selectedRole,
  initialAssessment,
  draft,
  onUpdateDraft,
  onSubmitFollowUps,
  isLoading
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const rubric = ROLE_RUBRICS[selectedRole];

  const q1 = initialAssessment.adaptiveFollowUps[0];
  const q2 = initialAssessment.adaptiveFollowUps[1];

  const canSubmit =
    draft.followUpAnswer1.trim().length >= 15 && draft.followUpAnswer2.trim().length >= 15;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf3ee] border border-[#cbdcca] text-xs font-semibold text-[#153424] mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-[#2c6e49]" />
          <span>Stage 4: Adaptive Probing</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0f281c]">
          Answer Two Targeted Follow-up Questions
        </h2>
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">
          These follow-up questions explore your technical decision-making and verification trade-offs.
        </p>
      </div>

      {/* Baseline Snapshot Card (0-3 scale) */}
      <div className="p-4 rounded-xl bg-[#f7f6f2] border border-[#eae6dd] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Initial Evaluation Baseline (0–3 Scale)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-extrabold text-[#153424]">
              {initialAssessment.overallScore.toFixed(2)}
            </span>
            <span className="text-xs text-stone-500 font-medium">/ 3.0 scale ({initialAssessment.normalizedPercentage}%)</span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Predicted: <strong>{draft.predictedScore} / 3</strong> ({draft.predictionConfidence} confidence).
            Coachability / Critique Uptake: <span className="font-semibold text-stone-500">Unobserved on attempt 1</span>.
          </p>
        </div>

        {/* Collapsible Original Answer Review */}
        <button
          type="button"
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium flex items-center justify-between gap-2 shrink-0 transition"
        >
          <span>{showOriginal ? 'Hide' : 'Review'} Your Initial Answer</span>
          {showOriginal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showOriginal && (
        <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 leading-relaxed font-mono whitespace-pre-wrap">
          {draft.firstAnswer}
        </div>
      )}

      {/* Ethical Scope & Follow-up Boundary Notice */}
      <div className="p-3.5 rounded-xl bg-[#edf3ee] border border-[#cbdcca] text-xs text-[#153424] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#2c6e49] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Follow-up Scope:</strong> These questions explore your engineering understanding and constraints.
          They are not AI-use detection or cheating accusations. Nerves, time pressure, and language differences naturally affect answers.
        </p>
      </div>

      {/* Two Follow-up Questions Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading && canSubmit) {
            onSubmitFollowUps();
          }
        }}
        className="space-y-6"
      >
        {/* Question 1: Decision / Tradeoff */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#edf3ee] text-[#153424]">
              Question 1: Decision Trade-off
            </span>
            <span className="text-[10px] text-stone-400 font-medium">{q1.intent}</span>
          </div>

          <h3 className="text-sm font-bold text-[#0f281c] leading-snug">
            {q1.question}
          </h3>

          <textarea
            rows={4}
            value={draft.followUpAnswer1}
            onChange={(e) => onUpdateDraft({ followUpAnswer1: e.target.value })}
            disabled={isLoading}
            placeholder="Explain the specific mechanism, fallback choice, or latency/memory trade-off you navigated..."
            className="w-full rounded-xl border border-stone-300 p-3.5 text-xs font-mono text-stone-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#153424]/20 focus:border-[#153424] bg-stone-50/50 transition resize-y"
          />
        </div>

        {/* Question 2: Validation / Verification */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#edf3ee] text-[#153424]">
              Question 2: Verification Rigor
            </span>
            <span className="text-[10px] text-stone-400 font-medium">{q2.intent}</span>
          </div>

          <h3 className="text-sm font-bold text-[#0f281c] leading-snug">
            {q2.question}
          </h3>

          <textarea
            rows={4}
            value={draft.followUpAnswer2}
            onChange={(e) => onUpdateDraft({ followUpAnswer2: e.target.value })}
            disabled={isLoading}
            placeholder="Describe the empirical metric, threshold calibration, test suite, or statistical verification you used..."
            className="w-full rounded-xl border border-stone-300 p-3.5 text-xs font-mono text-stone-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#153424]/20 focus:border-[#153424] bg-stone-50/50 transition resize-y"
          />
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || !canSubmit}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition shadow-sm ${
              isLoading || !canSubmit
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#153424] text-white hover:bg-[#0b1f15] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Feedback &amp; Next Steps...</span>
              </>
            ) : (
              <>
                <span>Submit Probes &amp; Review Formative Feedback</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
