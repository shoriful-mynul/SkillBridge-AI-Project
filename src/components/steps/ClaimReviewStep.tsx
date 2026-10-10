/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExtractedClaim, TargetRole } from '../../types/index.ts';
import { ROLE_RUBRICS } from '../../data/rubrics.ts';
import { CheckCircle2, Quote, ArrowRight, ArrowLeft, Wrench, Compass } from 'lucide-react';

interface ClaimReviewStepProps {
  selectedRole: TargetRole;
  claims: ExtractedClaim[];
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
  onGenerateTask: () => void;
  onBackToInput: () => void;
  isLoading: boolean;
}

export const ClaimReviewStep: React.FC<ClaimReviewStepProps> = ({
  selectedRole,
  claims,
  selectedClaimId,
  onSelectClaim,
  onGenerateTask,
  onBackToInput,
  isLoading
}) => {
  const rubric = ROLE_RUBRICS[selectedRole];

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf3ee] border border-[#cbdcca] text-xs font-semibold text-[#153424] mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2c6e49]" />
          <span>Stage 2: Claim Verification</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0f281c]">
          Select a project claim to practice
        </h2>
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">
          Gemini extracted {claims.length} concrete engineering {claims.length === 1 ? 'claim' : 'claims'} with exact source quotes from your submission.
          Choose which claim you wish to turn into verified evidence under the <strong>{rubric.roleTitle}</strong> rubric.
        </p>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {claims.map((claim) => {
          const isSelected = selectedClaimId === claim.id;

          return (
            <div
              key={claim.id}
              onClick={() => onSelectClaim(claim.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#f5faf6] border-[#153424] ring-2 ring-[#153424]/10 shadow-sm'
                  : 'bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      isSelected
                        ? 'border-[#153424] bg-[#153424]'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <h3 className="text-sm font-bold text-[#0f281c]">
                    {claim.projectTitle}
                  </h3>
                </div>

                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#edf3ee] text-[#153424] border border-[#cbdcca]">
                  {claim.groundingConfidence} confidence
                </span>
              </div>

              {/* Exact Quotation Anchor */}
              <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#eae6dd] my-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  <Quote className="w-3 h-3 text-[#2c6e49]" />
                  <span>Exact Source Quote</span>
                </div>
                <blockquote className="text-xs text-stone-800 italic leading-relaxed font-mono">
                  "{claim.verbatimQuote}"
                </blockquote>
              </div>

              {/* Tools & Decision Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-stone-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Quoted Tools &amp; Libraries
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {claim.toolsMentioned.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200"
                      >
                        <Wrench className="w-2.5 h-2.5 text-stone-500" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Extracted Technical Decision
                  </span>
                  <p className="text-xs text-stone-700 leading-snug">
                    {claim.technicalDecision}
                  </p>
                </div>
              </div>

              {claim.claimedOutcome && (
                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Asserted Outcome:</span>
                  <span className="font-medium text-[#153424] truncate max-w-[260px] sm:max-w-md">
                    {claim.claimedOutcome}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBackToInput}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Project Text</span>
        </button>

        <button
          type="button"
          onClick={onGenerateTask}
          disabled={isLoading || !selectedClaimId}
          className={`px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide flex items-center gap-2 transition shadow-sm ${
            isLoading || !selectedClaimId
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-[#153424] text-white hover:bg-[#0b1f15]'
          }`}
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Grounding Challenge Task...</span>
            </>
          ) : (
            <>
              <span>Generate Grounded Task</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
