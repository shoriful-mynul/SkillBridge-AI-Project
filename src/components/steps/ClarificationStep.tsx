/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClarificationDetail, TargetRole } from '../../types/index.ts';
import { ROLE_RUBRICS } from '../../data/rubrics.ts';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

interface ClarificationStepProps {
  selectedRole: TargetRole;
  clarification: ClarificationDetail;
  rawText: string;
  onUpdateTextAndRetry: (newText: string) => void;
  onBackToInput: () => void;
  isLoading: boolean;
}

export const ClarificationStep: React.FC<ClarificationStepProps> = ({
  selectedRole,
  clarification,
  rawText,
  onUpdateTextAndRetry,
  onBackToInput,
  isLoading
}) => {
  const [supplementalText, setSupplementalText] = useState(rawText);
  const rubric = ROLE_RUBRICS[selectedRole];

  return (
    <div className="space-y-6">
      {/* Alert Header */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-amber-900">
            Clarification Needed: Concrete Project Details Required
          </h2>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            SkillBridge AI is grounded exclusively in your own project decisions. We do not invent or assume experience.
            Your submission currently lacks specific tools or decisions needed to generate a valid assessment task.
          </p>
        </div>
      </div>

      {/* Reason & Missing Elements */}
      <div className="bg-[#fcfbf9] rounded-xl p-5 border border-[#e5e1d8] space-y-4">
        {clarification.reason && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Assessment Engine Observation
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200">
              {clarification.reason}
            </p>
          </div>
        )}

        {clarification.missingElements && clarification.missingElements.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Missing Grounding Elements
            </h3>
            <ul className="space-y-1.5">
              {clarification.missingElements.map((el, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{el}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {clarification.promptQuestions && clarification.promptQuestions.length > 0 && (
          <div className="pt-2 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153424] mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#2c6e49]" />
              <span>Please answer these 3 clarification questions in your text:</span>
            </h3>
            <div className="space-y-2">
              {clarification.promptQuestions.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#edf3ee] border border-[#cbdcca] text-xs text-[#153424] font-medium">
                  {idx + 1}. {q}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editable Clarification Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading && supplementalText.trim().length >= 30) {
            onUpdateTextAndRetry(supplementalText);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="clarified-text" className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
            Add Concrete Project, Tool &amp; Decision Details
          </label>
          <textarea
            id="clarified-text"
            rows={8}
            value={supplementalText}
            onChange={(e) => setSupplementalText(e.target.value)}
            disabled={isLoading}
            placeholder="Add the project name, the specific library/tool used, what trade-off or architectural choice you made, and how you validated it..."
            className="w-full rounded-xl border border-stone-300 p-4 text-xs font-mono text-stone-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#153424]/20 focus:border-[#153424] bg-white transition resize-y"
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onBackToInput}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Input</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || supplementalText.trim().length < 30}
            className={`px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide flex items-center gap-2 transition shadow-sm ${
              isLoading || supplementalText.trim().length < 30
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#153424] text-white hover:bg-[#0b1f15]'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Re-verifying Grounding...</span>
              </>
            ) : (
              <>
                <span>Re-evaluate Grounding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
