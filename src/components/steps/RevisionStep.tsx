/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NextStepOption, StudentDraft, TargetRole } from '../../types/index.ts';
import { ROLE_RUBRICS } from '../../data/rubrics.ts';
import { Edit3, ArrowRight, ChevronDown, ChevronUp, CheckCircle2, Compass, Shield } from 'lucide-react';

interface RevisionStepProps {
  selectedRole: TargetRole;
  chosenNextStep: NextStepOption;
  draft: StudentDraft;
  onUpdateDraft: (updates: Partial<StudentDraft>) => void;
  onSubmitRevision: () => void;
  isLoading: boolean;
}

export const RevisionStep: React.FC<RevisionStepProps> = ({
  selectedRole,
  chosenNextStep,
  draft,
  onUpdateDraft,
  onSubmitRevision,
  isLoading
}) => {
  const [showPriorAnswers, setShowPriorAnswers] = useState(false);
  const rubric = ROLE_RUBRICS[selectedRole];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf3ee] border border-[#cbdcca] text-xs font-semibold text-[#153424] mb-3">
          <Edit3 className="w-3.5 h-3.5 text-[#2c6e49]" />
          <span>Stage 6: Final Guided Revision</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0f281c]">
          Revise your answer to solidify evidence
        </h2>
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">
          Incorporate the defenses you developed in your follow-up answers and target the selected next step to maximize rubric performance.
        </p>
      </div>

      {/* Chosen Direction Banner */}
      <div className="p-4 rounded-xl bg-[#edf3ee] border border-[#cbdcca]">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-[#2c6e49]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#153424]">
            Your Chosen Focus: {chosenNextStep.focusArea}
          </span>
        </div>
        <h3 className="text-sm font-bold text-[#0f281c] mb-1">
          {chosenNextStep.title}
        </h3>
        <p className="text-xs text-[#26533a] leading-relaxed mb-2">
          {chosenNextStep.description}
        </p>
        <div className="p-2.5 rounded-lg bg-white border border-[#cbdcca] text-xs text-[#153424]">
          <strong>Target Execution:</strong> {chosenNextStep.recommendedGuidance}
        </div>
      </div>

      {/* Toggle Prior Answers Context */}
      <div className="bg-[#fcfbf9] rounded-xl border border-stone-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPriorAnswers(!showPriorAnswers)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
        >
          <span>{showPriorAnswers ? 'Hide' : 'Review'} Initial Answer &amp; Follow-up Defenses</span>
          {showPriorAnswers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showPriorAnswers && (
          <div className="p-4 border-t border-stone-200 bg-white space-y-3 text-xs">
            <div>
              <span className="font-bold text-stone-500 block mb-1">Initial Answer:</span>
              <p className="font-mono text-stone-800 bg-[#f7f6f2] p-3 rounded-lg whitespace-pre-wrap">
                {draft.firstAnswer}
              </p>
            </div>
            <div>
              <span className="font-bold text-stone-500 block mb-1">Follow-up 1 (Tradeoffs):</span>
              <p className="font-mono text-stone-800 bg-[#f7f6f2] p-2.5 rounded-lg whitespace-pre-wrap">
                {draft.followUpAnswer1}
              </p>
            </div>
            <div>
              <span className="font-bold text-stone-500 block mb-1">Follow-up 2 (Validation):</span>
              <p className="font-mono text-stone-800 bg-[#f7f6f2] p-2.5 rounded-lg whitespace-pre-wrap">
                {draft.followUpAnswer2}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Revision Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading && draft.revisedAnswer.trim().length >= 40) {
            onSubmitRevision();
          }
        }}
        className="space-y-4"
      >
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="revised-answer-text" className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Revised Answer (Your Comprehensive Defense)
            </label>
            <span className="text-[11px] text-stone-600 font-mono">
              {draft.revisedAnswer.length} characters (min 40)
            </span>
          </div>

          <textarea
            id="revised-answer-text"
            rows={12}
            value={draft.revisedAnswer}
            onChange={(e) => onUpdateDraft({ revisedAnswer: e.target.value })}
            disabled={isLoading}
            placeholder="Write your unified revised answer combining your initial explanation, follow-up defenses, and concrete trade-off/verification specifics..."
            className="w-full rounded-xl border border-stone-300 p-4 text-xs font-mono text-stone-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#153424]/20 focus:border-[#153424] bg-white transition resize-y"
          />
        </div>

        {/* Submit Revision */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || draft.revisedAnswer.trim().length < 40}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition shadow-sm ${
              isLoading || draft.revisedAnswer.trim().length < 40
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#153424] text-white hover:bg-[#0b1f15] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating Revision &amp; Generating Evidence Report...</span>
              </>
            ) : (
              <>
                <span>Submit Revision &amp; Finalize Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
