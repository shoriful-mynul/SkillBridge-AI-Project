/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InitialAssessment, NextStepOption, StudentDraft, TargetRole } from '../../types/index.ts';
import { ROLE_RUBRICS } from '../../data/rubrics.ts';
import {
  CheckCircle2,
  ArrowRight,
  Target,
  Compass,
  Sparkles,
  AlertCircle,
  Quote,
  Lightbulb,
  Info
} from 'lucide-react';

interface FeedbackStepProps {
  selectedRole: TargetRole;
  initialAssessment: InitialAssessment;
  draft: StudentDraft;
  onSelectNextStep: (stepId: 'option_a' | 'option_b') => void;
  onProceedToRevision: () => void;
}

export const FeedbackStep: React.FC<FeedbackStepProps> = ({
  selectedRole,
  initialAssessment,
  draft,
  onSelectNextStep,
  onProceedToRevision
}) => {
  const rubric = ROLE_RUBRICS[selectedRole];
  const optionA = initialAssessment.nextSteps[0];
  const optionB = initialAssessment.nextSteps[1];

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf3ee] border border-[#cbdcca] text-xs font-semibold text-[#153424] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#2c6e49]" />
          <span>Stage 5: Strategic Formative Feedback</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0f281c]">
          Diagnostic Rubric Evaluation (0–3 Scale)
        </h2>
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">
          Initial baseline: <strong>{initialAssessment.overallScore.toFixed(2)} / 3.0</strong> ({initialAssessment.normalizedPercentage}%).
          Coachability/critique uptake is <span className="font-semibold text-stone-600">unobserved on this first attempt</span> and will be evaluated after your revision.
        </p>
      </div>

      {/* Quote Evidence Rigor Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#eae6dd] text-xs text-stone-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#2c6e49] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Quotation Evidence Standard:</strong> Scores above 1 require verified literal substring quotations from your answer.
          A literal quote is evidence of what was written, not proof of technical correctness or code execution.
        </p>
      </div>

      {/* 1. What the Answer Demonstrated & 2. What Remains Unsupported */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Demonstrated */}
        <div className="p-4 rounded-xl bg-[#edf3ee] border border-[#cbdcca]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#153424] mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2c6e49]" />
            <span>1. What the Answer Demonstrated</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-[#153424]">
            {initialAssessment.demonstratedSummary.map((str, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#2c6e49] font-bold">•</span>
                <span className="leading-snug">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unsupported */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>2. What Remains Unsupported or Unclear</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-amber-900">
            {initialAssessment.unsupportedSummary.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span className="leading-snug">{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. One Strategy-Focused Improvement Banner */}
      <div className="p-4 rounded-xl bg-[#f4f8f5] border border-[#cbe0d3] flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-[#2c6e49] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#153424]">
            3. Strategy-Focused Improvement
          </h4>
          <p className="text-xs text-[#1e4732] mt-0.5 leading-relaxed font-medium">
            {initialAssessment.strategyImprovement}
          </p>
        </div>
      </div>

      {/* 4 Dimension Breakdown Cards with Literal Quotations */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Dimensional Breakdown &amp; Literal Evidence ({rubric.version})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {initialAssessment.dimensionScores.map((dim) => (
            <div
              key={dim.dimensionId}
              className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#0f281c] truncate pr-2">
                    {dim.dimensionName}
                  </h4>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[#edf3ee] text-[#153424] border border-[#cbdcca] shrink-0">
                    {dim.score} / 3
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-[#2c6e49] mb-2">
                  Anchor: {dim.anchorMatched}
                </div>

                <div className="space-y-2 text-xs">
                  {/* Verified Quote Substring */}
                  {dim.evidenceQuote && (
                    <div className="p-2.5 rounded-lg bg-[#f7f6f2] border border-[#eae6dd]">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-500 mb-1">
                        <span className="flex items-center gap-1">
                          <Quote className="w-2.5 h-2.5 text-[#2c6e49]" />
                          Cited Answer Quote
                        </span>
                        {dim.isQuoteVerified ? (
                          <span className="text-emerald-700 font-semibold lowercase">verified substring</span>
                        ) : (
                          <span className="text-amber-700 font-semibold lowercase">unverified</span>
                        )}
                      </div>
                      <blockquote className="text-stone-800 italic font-mono text-[11px] leading-snug">
                        "{dim.evidenceQuote}"
                      </blockquote>
                    </div>
                  )}

                  {/* Observation */}
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">
                      Observation
                    </span>
                    <p className="text-stone-700 leading-snug">{dim.observation}</p>
                  </div>

                  {/* Unsupported */}
                  <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5">
                      Unsupported / Unclear
                    </span>
                    <p className="text-amber-900 leading-snug">{dim.unsupportedAreas}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two Concrete Next-Step Choices (Achievable in One Revision) */}
      <div className="pt-2 border-t border-stone-200 space-y-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#153424] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#2c6e49]" />
            4. Choose One Next-Step Direction for Your Revision
          </span>
          <p className="text-xs text-stone-600 mt-0.5">
            Select one concrete, achievable goal to focus your single revision:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A */}
          <div
            onClick={() => onSelectNextStep('option_a')}
            className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              draft.chosenNextStepId === 'option_a'
                ? 'border-[#153424] bg-[#f5faf6] ring-2 ring-[#153424]/10 shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#edf3ee] text-[#153424]">
                  Option A: {optionA.focusArea}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    draft.chosenNextStepId === 'option_a'
                      ? 'border-[#153424] bg-[#153424]'
                      : 'border-stone-300'
                  }`}
                >
                  {draft.chosenNextStepId === 'option_a' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>

              <h4 className="text-sm font-bold text-[#0f281c] mb-1.5">
                {optionA.title}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                {optionA.description}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-[#153424]">
              <strong>Recommended Execution:</strong> {optionA.recommendedGuidance}
            </div>
          </div>

          {/* Option B */}
          <div
            onClick={() => onSelectNextStep('option_b')}
            className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              draft.chosenNextStepId === 'option_b'
                ? 'border-[#153424] bg-[#f5faf6] ring-2 ring-[#153424]/10 shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#edf3ee] text-[#153424]">
                  Option B: {optionB.focusArea}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    draft.chosenNextStepId === 'option_b'
                      ? 'border-[#153424] bg-[#153424]'
                      : 'border-stone-300'
                  }`}
                >
                  {draft.chosenNextStepId === 'option_b' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>

              <h4 className="text-sm font-bold text-[#0f281c] mb-1.5">
                {optionB.title}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                {optionB.description}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-[#153424]">
              <strong>Recommended Execution:</strong> {optionB.recommendedGuidance}
            </div>
          </div>
        </div>
      </div>

      {/* Action to proceed */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onProceedToRevision}
          disabled={!draft.chosenNextStepId}
          className={`px-7 py-3 rounded-xl font-semibold text-xs tracking-wide flex items-center gap-2 transition shadow-sm ${
            !draft.chosenNextStepId
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-[#153424] text-white hover:bg-[#0b1f15]'
          }`}
        >
          <span>Apply Chosen Direction &amp; Revise Answer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
