/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TargetRole, GroundedTask, InitialAssessment, StudentDraft, ExtractedClaim } from '../types/index.ts';
import { ROLE_RUBRICS } from '../data/rubrics.ts';
import { Shield, ChevronDown, ChevronUp, Quote, Target, Star, CheckCircle, Info } from 'lucide-react';

interface FocusCardProps {
  selectedRole: TargetRole;
  groundedTask: GroundedTask | null;
  selectedClaim: ExtractedClaim | null;
  draft: StudentDraft;
  initialAssessment: InitialAssessment | null;
}

export const FocusCard: React.FC<FocusCardProps> = ({
  selectedRole,
  groundedTask,
  selectedClaim,
  draft,
  initialAssessment,
}) => {
  const rubric = ROLE_RUBRICS[selectedRole];
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  const toggleDimension = (id: string) => {
    setExpandedDimension(expandedDimension === id ? null : id);
  };

  return (
    <aside className="w-full lg:w-80 shrink-0">
      <div className="bg-[#153424] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#1e4531] flex flex-col gap-5 sticky top-20">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#26533a]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#85dfa5] animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#a8dbc0]">
              Evaluation Context
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e4732] text-[#85dfa5] border border-[#2a6144]">
            {rubric.version}
          </span>
        </div>

        {/* Role & Core Skills Badge */}
        <div>
          <span className="text-xs text-[#a8dbc0] block font-medium">Active Rubric</span>
          <h3 className="text-sm font-bold text-white mt-0.5">{rubric.roleTitle}</h3>
          <p className="text-[11px] text-[#c0decb] mt-1 leading-relaxed">
            {rubric.description}
          </p>
        </div>

        {/* Quoted Grounding Anchor (if available) */}
        {(groundedTask || selectedClaim) && (
          <div className="p-3.5 rounded-xl bg-[#0f281c] border border-[#1f4a33]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#85dfa5] mb-1">
              <Quote className="w-3 h-3" />
              <span>Grounded Anchor Quote</span>
            </div>
            <p className="text-xs text-[#dbece1] italic line-clamp-3 leading-relaxed">
              "{groundedTask ? groundedTask.verbatimSource : selectedClaim?.verbatimQuote}"
            </p>
            <div className="mt-2 pt-2 border-t border-[#1a3d2b] flex items-center justify-between text-[10px] text-[#9fc8b0]">
              <span>Grounded Tool:</span>
              <span className="font-semibold text-white truncate max-w-[140px]">
                {groundedTask ? groundedTask.quotedTool : selectedClaim?.toolsMentioned.join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Prediction vs Actual Gauge (0-3 scale) */}
        {draft.predictedScore !== undefined && (
          <div className="p-3.5 rounded-xl bg-[#1b4331] border border-[#295c43]">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#c0decb] mb-1.5">
              <span>Your Self-Prediction</span>
              <span className="text-white font-bold">{draft.predictedScore} / 3</span>
            </div>
            <div className="w-full bg-[#0f281c] rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-[#85dfa5] h-full transition-all duration-300"
                style={{ width: `${(draft.predictedScore / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#a8dbc0] mt-1.5">
              <span>Confidence: <strong className="text-white capitalize">{draft.predictionConfidence}</strong></span>
              {initialAssessment && (
                <span className="text-[#85dfa5] font-semibold">
                  Baseline: {initialAssessment.overallScore.toFixed(2)} / 3.0
                </span>
              )}
            </div>
          </div>
        )}

        {/* Role-Specific Rubric Dimensions Explorer (0-3 Scale) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#a8dbc0] uppercase tracking-wider">
              Anchors (0–3 Scale)
            </span>
            <span className="text-[10px] text-[#9ec4ad]">4 Dimensions</span>
          </div>

          <div className="space-y-1.5">
            {rubric.dimensions.map((dim) => {
              const isExpanded = expandedDimension === dim.id;
              return (
                <div
                  key={dim.id}
                  className="rounded-lg bg-[#112d1f] border border-[#1f4732] overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleDimension(dim.id)}
                    className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-medium text-white hover:bg-[#163a28] transition"
                  >
                    <span className="truncate pr-2">{dim.name}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#85dfa5] shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 text-[11px] text-[#cbe1d3] border-t border-[#1a3d2b] space-y-2 bg-[#0c2317]">
                      <p className="text-[10px] text-[#85dfa5]">{dim.description}</p>
                      <div className="space-y-1 pt-1">
                        {dim.anchors.map((anchor) => (
                          <div key={anchor.score} className="flex gap-2 items-start text-[10px] leading-snug">
                            <span className="font-mono font-bold text-[#85dfa5] shrink-0">
                              [{anchor.score}/3]
                            </span>
                            <div>
                              <strong className="text-white">{anchor.label}:</strong>{' '}
                              <span className="text-[#bfd8c7]">{anchor.criteria}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rigor Principle & Ownership Disclaimers */}
        <div className="pt-2 border-t border-[#26533a] space-y-2 text-[10px] text-[#a8dbc0] leading-relaxed">
          <div className="flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#85dfa5] shrink-0 mt-0.5" />
            <span>
              A literal quote is evidence of what was written, not proof of technical correctness or code execution.
            </span>
          </div>

          <div className="flex items-start gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#85dfa5] shrink-0 mt-0.5" />
            <span>
              Student owns this feedback · Practice on 1 task · Not hiring screening or general skill certification.
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
