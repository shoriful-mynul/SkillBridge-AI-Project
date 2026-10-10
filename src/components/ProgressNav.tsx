/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TargetRole, AssessmentStage } from '../types/index.ts';
import { ROLE_RUBRICS } from '../data/rubrics.ts';
import { Check, Lock, ChevronDown, Award, Circle } from 'lucide-react';

interface ProgressNavProps {
  currentStage: AssessmentStage;
  selectedRole: TargetRole;
  isRoleLocked: boolean;
  onSelectRole: (role: TargetRole) => void;
  onNavigateToStage?: (stage: AssessmentStage) => void;
}

interface StepItem {
  id: AssessmentStage;
  label: string;
  shortLabel: string;
}

const STAGES: StepItem[] = [
  { id: 'input', label: '1. Project Input', shortLabel: 'Input' },
  { id: 'claim_review', label: '2. Claim Review', shortLabel: 'Claims' },
  { id: 'task', label: '3. Grounded Task', shortLabel: 'Task' },
  { id: 'first_answer', label: '4. First Answer', shortLabel: 'Answer' },
  { id: 'follow_ups', label: '5. Follow-up Probing', shortLabel: 'Follow-ups' },
  { id: 'feedback', label: '6. Strategic Feedback', shortLabel: 'Feedback' },
  { id: 'revision', label: '7. Guided Revision', shortLabel: 'Revision' },
  { id: 'final_report', label: '8. Evidence Report', shortLabel: 'Report' }
];

export const ProgressNav: React.FC<ProgressNavProps> = ({
  currentStage,
  selectedRole,
  isRoleLocked,
  onSelectRole,
}) => {
  const currentRubric = ROLE_RUBRICS[selectedRole];

  // Helper to determine step status
  const getStageIndex = (stage: AssessmentStage): number => {
    if (stage === 'clarification') return 0;
    return STAGES.findIndex((s) => s.id === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-5">
      {/* Target Role Selector Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e1d8] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="target-role-select" className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            Target Role
          </label>
          {isRoleLocked ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200" title="Role is locked during assessment">
              <Lock className="w-3 h-3" /> Locked
            </span>
          ) : (
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          )}
        </div>

        <div className="relative">
          <select
            id="target-role-select"
            value={selectedRole}
            disabled={isRoleLocked}
            onChange={(e) => onSelectRole(e.target.value as TargetRole)}
            className={`w-full appearance-none rounded-xl px-3.5 py-2.5 text-xs font-semibold border transition ${
              isRoleLocked
                ? 'bg-stone-50 text-stone-700 border-stone-200 cursor-not-allowed'
                : 'bg-white text-[#0f281c] border-stone-300 hover:border-[#153424] focus:ring-2 focus:ring-[#153424]/20 focus:border-[#153424] cursor-pointer'
            }`}
          >
            <option value="aiml-intern">1. AI/ML Intern (v1.4)</option>
            <option value="data-analyst-intern">2. Data Analyst Intern (v1.3)</option>
            <option value="frontend-dev-intern">3. Frontend Developer Intern (v1.2)</option>
          </select>
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {isRoleLocked && (
          <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
            Role is locked to preserve rubric consistency. To change roles, reset the session.
          </p>
        )}

        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
          <span className="font-medium">Rubric:</span>
          <span className="font-mono font-semibold text-[#153424] px-1.5 py-0.5 rounded bg-[#edf3ee]">
            {currentRubric.version}
          </span>
        </div>
      </div>

      {/* Progress Stepper Timeline */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e1d8] shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Assessment Flow
          </span>
          <span className="text-[11px] font-mono text-stone-600">
            {Math.min(currentIndex + 1, 8)} / 8
          </span>
        </div>

        <nav aria-label="Assessment Progress" className="flex flex-col gap-1.5">
          {STAGES.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex || (currentStage === 'clarification' && idx === 0);

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                  isCurrent
                    ? 'bg-[#153424] text-white font-semibold shadow-sm'
                    : isCompleted
                    ? 'text-stone-700 hover:bg-stone-50 font-medium'
                    : 'text-stone-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-[#e2ece5] text-[#153424]'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Practice Boundary Note */}
      <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#eae6dd] text-[11px] text-stone-600 leading-relaxed">
        <p className="font-semibold text-[#0f281c] mb-0.5">Practice Philosophy</p>
        Focused practice on 1 grounded task. Student owns the feedback. Not hiring screening.
      </div>
    </aside>
  );
};
