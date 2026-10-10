/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GroundedTask, Score0to3, StudentDraft, TargetRole } from '../../types/index.ts';
import { ROLE_RUBRICS } from '../../data/rubrics.ts';
import { Target, Quote, CheckCircle2, ArrowRight, Award, Info } from 'lucide-react';

interface TaskStepProps {
  selectedRole: TargetRole;
  task: GroundedTask;
  draft: StudentDraft;
  onUpdateDraft: (updates: Partial<StudentDraft>) => void;
  onSubmitAnswer: () => void;
  isLoading: boolean;
}

export const TaskStep: React.FC<TaskStepProps> = ({
  selectedRole,
  task,
  draft,
  onUpdateDraft,
  onSubmitAnswer,
  isLoading
}) => {
  const rubric = ROLE_RUBRICS[selectedRole];

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf3ee] border border-[#cbdcca] text-xs font-semibold text-[#153424] mb-3">
          <Target className="w-3.5 h-3.5 text-[#2c6e49]" />
          <span>Stage 3: Grounded Practice Task</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0f281c]">
          {task.taskTitle}
        </h2>
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">
          Grounded directly in your decisions for <strong>{task.projectTitle}</strong>.
          Evaluated against the <strong>{rubric.roleTitle}</strong> rubric ({task.rubricVersion}) on a 0–3 anchored scale.
        </p>
      </div>

      {/* Grounding Source Box */}
      <div className="p-4 rounded-xl bg-[#f7f6f2] border border-[#eae6dd]">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
          <Quote className="w-3.5 h-3.5 text-[#2c6e49]" />
          <span>Your Verbatim Source Quote</span>
        </div>
        <blockquote className="text-xs text-stone-800 italic leading-relaxed font-mono">
          "{task.verbatimSource}"
        </blockquote>
        <div className="mt-2.5 pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600">
          <div>
            <strong className="text-stone-700">Target Tool:</strong> {task.quotedTool}
          </div>
          <div>
            <strong className="text-stone-700">Tested Decision:</strong> {task.quotedDecision}
          </div>
        </div>
      </div>

      {/* Scenario & Required Deliverables */}
      <div className="bg-white rounded-xl p-5 border border-stone-200 space-y-4 shadow-2xs">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#153424] mb-1.5">
            The Engineering Scenario
          </h3>
          <p className="text-xs text-stone-700 leading-relaxed bg-[#fcfbf9] p-3.5 rounded-lg border border-stone-200">
            {task.scenarioDescription}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
            Required Technical Deliverables
          </h3>
          <ul className="space-y-2">
            {task.requiredDeliverables.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                <span className="w-5 h-5 rounded-full bg-[#edf3ee] text-[#153424] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {task.technicalConstraints && task.technicalConstraints.length > 0 && (
          <div className="pt-2 border-t border-stone-100">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Role Rubric Constraints
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {task.technicalConstraints.map((c, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-stone-50 text-stone-600 border border-stone-200"
                >
                  • {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Self-Prediction Widget (0-3 anchored scale) */}
      <div className="p-5 rounded-xl bg-[#edf3ee] border border-[#cbdcca] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#2c6e49]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153424]">
              Step 1: Predict Expected Score (0 to 3 Scale)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#153424]">
            Predicted: {draft.predictedScore} / 3
          </span>
        </div>

        <p className="text-xs text-[#26533a] leading-relaxed">
          Calibrate your engineering self-awareness against rubric {task.rubricVersion}.
        </p>

        {/* 0-3 Score Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {([0, 1, 2, 3] as Score0to3[]).map((score) => {
            const isSelected = draft.predictedScore === score;
            const labels = ['0: Unobserved', '1: Emerging', '2: Competent', '3: Exemplary'];
            return (
              <button
                key={score}
                type="button"
                onClick={() => onUpdateDraft({ predictedScore: score })}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition text-center ${
                  isSelected
                    ? 'bg-[#153424] text-white border-[#153424] shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                }`}
              >
                {labels[score]}
              </button>
            );
          })}
        </div>

        {/* Confidence & Rationale */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-[#153424] block mb-1">
              Confidence Level:
            </label>
            <div className="flex gap-2">
              {(['high', 'moderate', 'tentative'] as const).map((conf) => (
                <button
                  key={conf}
                  type="button"
                  onClick={() => onUpdateDraft({ predictionConfidence: conf })}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize border transition ${
                    draft.predictionConfidence === conf
                      ? 'bg-white text-[#153424] border-[#153424]'
                      : 'bg-[#e2ece5] text-stone-600 border-transparent hover:bg-white'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="prediction-rationale" className="text-[11px] font-semibold text-[#153424] block mb-1">
              Brief Prediction Rationale:
            </label>
            <input
              id="prediction-rationale"
              type="text"
              value={draft.predictionRationale}
              onChange={(e) => onUpdateDraft({ predictionRationale: e.target.value })}
              placeholder="e.g. Confident in architecture; need to specify empirical validation."
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#cbdcca] bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#153424]"
            />
          </div>
        </div>
      </div>

      {/* Answer Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading && draft.firstAnswer.trim().length >= 30) {
            onSubmitAnswer();
          }
        }}
        className="space-y-4"
      >
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="first-answer-text" className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Step 2: Write Your First Answer
            </label>
            <span className="text-[11px] text-stone-600 font-mono">
              {draft.firstAnswer.length} characters (min 30)
            </span>
          </div>

          <textarea
            id="first-answer-text"
            rows={10}
            value={draft.firstAnswer}
            onChange={(e) => onUpdateDraft({ firstAnswer: e.target.value })}
            disabled={isLoading}
            placeholder={`Structure your defense:
1. Technical Mechanism & Architectural Logic (Why this tool and design?)
2. Trade-offs Accepted & Alternatives Discarded (What constraints did you face?)
3. Empirical Validation & Verification (How did you prove it worked without regression?)`}
            className="w-full rounded-xl border border-stone-300 p-4 text-xs font-mono text-stone-800 leading-relaxed placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#153424]/20 focus:border-[#153424] bg-white transition resize-y"
          />

          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-2">
            <Info className="w-3.5 h-3.5 text-[#2c6e49] shrink-0" />
            <span>Scores above 1 require literal quotation evidence verified from this answer.</span>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || draft.firstAnswer.trim().length < 30}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition shadow-sm ${
              isLoading || draft.firstAnswer.trim().length < 30
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#153424] text-white hover:bg-[#0b1f15] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating against Rubric &amp; Generating Probes...</span>
              </>
            ) : (
              <>
                <span>Submit Answer &amp; Get Formative Probes</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
