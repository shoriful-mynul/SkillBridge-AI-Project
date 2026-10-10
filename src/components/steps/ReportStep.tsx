/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GroundedTask,
  InitialAssessment,
  RevisionEvaluation,
  StudentDraft,
  TargetRole
} from '../../types/index.ts';
import { ROLE_RUBRICS } from '../../data/rubrics.ts';
import {
  Award,
  CheckCircle2,
  Download,
  Copy,
  Printer,
  RotateCcw,
  Shield,
  TrendingUp,
  FileText,
  Check,
  Quote,
  Info,
  Compass,
  Clock,
  Cpu
} from 'lucide-react';

interface ReportStepProps {
  selectedRole: TargetRole;
  task: GroundedTask;
  draft: StudentDraft;
  initialAssessment: InitialAssessment;
  evaluation: RevisionEvaluation;
  onResetSession: () => void;
  isRehearsal: boolean;
  modelName?: string;
}

export const ReportStep: React.FC<ReportStepProps> = ({
  selectedRole,
  task,
  draft,
  initialAssessment,
  evaluation,
  onResetSession,
  isRehearsal,
  modelName = 'gemini-3.8-flash'
}) => {
  const [copied, setCopied] = useState(false);
  const rubric = ROLE_RUBRICS[selectedRole];
  const timestamp = new Date().toLocaleString();

  const overallDelta = evaluation.scoreDelta;

  // Prepare Markdown Export
  const generateMarkdownReport = (): string => {
    return `# SkillBridge AI · Verified Evidence Report
**AICON’26 · Team Gradient (EdTech & Workforce)**
*${isRehearsal ? 'SYNTHETIC REHEARSAL · NOT LIVE AI' : 'Live Grounded Assessment Session'}*
- **Model:** ${isRehearsal ? 'Fictional Curated Dataset' : modelName}
- **Timestamp:** ${timestamp}

## 1. Context & Grounding
- **Target Role:** ${rubric.roleTitle} (${rubric.version})
- **Project:** ${task.projectTitle}
- **Quoted Source:** "${task.verbatimSource}"
- **Target Decision:** ${task.quotedDecision}
- **Challenge Task:** ${task.taskTitle}
- **Scenario:** ${task.scenarioDescription}

---

## 2. ${evaluation.label}
*Notice: Evaluates evidence change on this single practice task. Never presented as proven lasting learning, employability, or general proficiency.*

- **Initial Baseline Score:** ${evaluation.initialOverallScore.toFixed(2)} / 3.0
- **Revised Evidence Score:** ${evaluation.revisedOverallScore.toFixed(2)} / 3.0
- **Score Delta:** ${overallDelta >= 0 ? `+${overallDelta.toFixed(2)}` : overallDelta.toFixed(2)}

### Comparable Dimension Progression (Equal 0.25 Weights on Both Attempts):
${evaluation.dimensionDeltas
  .map(
    (d) =>
      `- **${d.dimensionName}:** ${d.initialScore}/3 ➔ ${d.revisedScore}/3\n  *Evidence Quote:* "${d.evidenceQuote}"\n  *Delta Note:* ${d.evidenceDelta}`
  )
  .join('\n')}

---

## 3. Adaptive Follow-up Probing Questions & Defenses
- **Probe 1:** ${initialAssessment.adaptiveFollowUps[0].question}
  - *Defense:* ${draft.followUpAnswer1 || 'N/A'}
- **Probe 2:** ${initialAssessment.adaptiveFollowUps[1].question}
  - *Defense:* ${draft.followUpAnswer2 || 'N/A'}

---

## 4. Critique Uptake (Observed Only After Revision)
- **Score:** ${evaluation.critiqueUptake.score} / 3 (${evaluation.critiqueUptake.anchorLabel})
- **Applied Strategy:** ${evaluation.chosenNextStepTitle}
- **Evidence Quote:** "${evaluation.critiqueUptake.evidenceQuote}"
- **Critique:** ${evaluation.critiqueUptake.critique}

---

## 5. Demonstrated Technical Competencies
${evaluation.verifiedCompetencies.map((c) => `- [x] ${c}`).join('\n')}

---

## 6. Executive Growth Synthesis
${evaluation.synthesis}

---

## 7. Submission Artifacts
### Initial Attempt:
${draft.firstAnswer}

### Revised Attempt:
${draft.revisedAnswer}

---

## 8. Disclaimers & Ethics
- ${evaluation.evidenceDisclaimer}
- ${evaluation.ownershipDisclaimer}
- Notice: This report is NOT a certified skill credential, hiring assessment, or general skill certification.
`;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `skillbridge-evidence-${selectedRole}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const data = {
      meta: {
        app: 'SkillBridge AI',
        event: 'AICON’26',
        team: 'Team Gradient',
        domain: 'EdTech & Workforce',
        mode: isRehearsal ? 'synthetic_rehearsal' : 'live_ai',
        role: selectedRole,
        rubricVersion: rubric.version,
        scoringScale: '0-3',
        model: isRehearsal ? 'synthetic-curated-data' : modelName,
        timestamp: new Date().toISOString()
      },
      task,
      studentPrediction: {
        predictedScore: draft.predictedScore,
        confidence: draft.predictionConfidence,
        rationale: draft.predictionRationale
      },
      initialAssessment,
      evaluation,
      followUps: [
        {
          question: initialAssessment.adaptiveFollowUps[0].question,
          answer: draft.followUpAnswer1
        },
        {
          question: initialAssessment.adaptiveFollowUps[1].question,
          answer: draft.followUpAnswer2
        }
      ],
      answers: {
        initial: draft.firstAnswer,
        followUp1: draft.followUpAnswer1,
        followUp2: draft.followUpAnswer2,
        revised: draft.revisedAnswer
      },
      disclaimers: {
        evidence: evaluation.evidenceDisclaimer,
        ownership: evaluation.ownershipDisclaimer,
        credentialLimitation: 'Not a certified skill credential or hiring filter.'
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `skillbridge-evidence-${selectedRole}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = async () => {
    const text = `SkillBridge AI · ${evaluation.label}
Role: ${rubric.roleTitle} (${rubric.version}) | Mode: ${isRehearsal ? 'Synthetic Rehearsal' : 'Live AI'}
Score: ${evaluation.initialOverallScore.toFixed(2)}/3 ➔ ${evaluation.revisedOverallScore.toFixed(2)}/3 (+${overallDelta.toFixed(2)})
Critique Uptake: ${evaluation.critiqueUptake.score}/3 (${evaluation.critiqueUptake.anchorLabel})
Verified Competencies:
${evaluation.verifiedCompetencies.map((c) => `• ${c}`).join('\n')}
${evaluation.ownershipDisclaimer}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Top Header with Verified Seal */}
      <div className="bg-[#153424] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#1e4531] relative overflow-hidden print:bg-white print:text-black print:border-stone-800 print:p-4">
        {/* Synthetic Rehearsal Watermark / Banner */}
        {isRehearsal && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-bold tracking-wider uppercase print:bg-stone-100 print:text-black print:border-black">
            <span>Synthetic Rehearsal · Not Live AI</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b4331] text-[#85dfa5] border border-[#2a6144] text-xs font-semibold mb-3 print:border-stone-400 print:text-black">
              <Award className="w-3.5 h-3.5" />
              <span>{evaluation.label}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white print:text-black">
              {rubric.roleTitle} Evidence Report
            </h1>
            <p className="text-xs sm:text-sm text-[#c0decb] mt-1 leading-relaxed max-w-xl print:text-stone-700">
              Demonstrated on project <strong>{task.projectTitle}</strong> grounded in your verified technical decisions.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-[#a8dbc0] print:text-stone-600">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Engine: {isRehearsal ? 'Synthetic Curated' : modelName}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Generated: {timestamp}</span>
              </span>
            </div>
          </div>

          {/* Overall Delta Badge (0-3 scale) */}
          <div className="bg-[#0f281c] p-4 rounded-xl border border-[#235338] text-center shrink-0 print:bg-stone-50 print:border-stone-400">
            <span className="text-[10px] uppercase font-bold text-[#85dfa5] block mb-1 print:text-black">
              {evaluation.label}
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-stone-400 line-through text-lg font-bold">
                {evaluation.initialOverallScore.toFixed(2)}
              </span>
              <span className="text-3xl font-extrabold text-white print:text-black">
                {evaluation.revisedOverallScore.toFixed(2)}
              </span>
              <span className="text-xs text-stone-300 print:text-black">/ 3.0</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-[#85dfa5] flex items-center justify-center gap-1 print:text-black">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{overallDelta >= 0 ? `+${overallDelta.toFixed(2)}` : overallDelta.toFixed(2)} Score Delta</span>
            </div>
          </div>
        </div>

        {/* Scope disclaimer */}
        <div className="mt-5 pt-4 border-t border-[#26533a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#a8dbc0] print:text-stone-600 print:border-stone-300">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#85dfa5] shrink-0 print:text-black" />
            <span>Never presented as proven lasting learning, employability, or general proficiency.</span>
          </div>
          <span>Same 4 observable dimensions &amp; normalized 0.25 weights.</span>
        </div>
      </div>

      {/* Task & Grounding Context */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-2 print:border-stone-300">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Task &amp; Grounding Context
        </h2>
        <div className="p-3 rounded-xl bg-[#f7f6f2] border border-[#eae6dd] text-xs">
          <div className="flex items-center gap-1 font-bold text-[#153424] mb-1">
            <Quote className="w-3 h-3 text-[#2c6e49]" />
            <span>Verbatim Source Anchor:</span>
          </div>
          <p className="font-mono text-stone-800 italic">"{task.verbatimSource}"</p>
          <div className="mt-2 pt-2 border-t border-stone-200 flex flex-wrap gap-4 text-[11px] text-stone-600">
            <span><strong>Target Tool:</strong> {task.quotedTool}</span>
            <span><strong>Tested Decision:</strong> {task.quotedDecision}</span>
          </div>
        </div>
      </div>

      {/* Comparable Dimension Progression Grid */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-4 print:border-stone-300">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {evaluation.label} (Equal 0.25 Normalized Weights)
          </h2>
          <span className="text-[11px] font-mono text-stone-500">0–3 Scale</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluation.dimensionDeltas.map((dim) => {
            const dimDelta = dim.revisedScore - dim.initialScore;
            return (
              <div
                key={dim.dimensionId}
                className="p-4 rounded-xl bg-[#fcfbf9] border border-stone-200 space-y-2.5 print:bg-white"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0f281c] truncate pr-2">
                    {dim.dimensionName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold shrink-0">
                    <span className="text-stone-400">{dim.initialScore}</span>
                    <span className="text-stone-400">➔</span>
                    <span className="text-[#153424] px-1.5 py-0.5 rounded bg-[#edf3ee] border border-[#cbdcca] print:bg-stone-100">
                      {dim.revisedScore} / 3
                    </span>
                    {dimDelta > 0 && (
                      <span className="text-[10px] text-emerald-700 font-sans font-semibold">
                        (+{dimDelta})
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden print:hidden">
                  <div
                    className="bg-[#153424] h-full transition-all duration-500"
                    style={{ width: `${(dim.revisedScore / 3) * 100}%` }}
                  />
                </div>

                {dim.evidenceQuote && (
                  <div className="p-2 rounded-lg bg-white border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5 flex items-center gap-1">
                      <Quote className="w-2.5 h-2.5 text-[#2c6e49]" /> Verified Answer Quote:
                    </span>
                    <p className="text-[11px] font-mono text-stone-800 italic line-clamp-2">
                      "{dim.evidenceQuote}"
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-stone-600 leading-relaxed">
                  <strong className="text-stone-700">Delta Note:</strong> {dim.evidenceDelta}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adaptive Follow-up Probing & Defenses */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-3 print:border-stone-300">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Adaptive Follow-up Probing Questions &amp; Student Defenses
        </h2>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#fcfbf9] border border-stone-200 text-xs">
            <span className="font-bold text-[#153424] block mb-1">
              Probe 1: {initialAssessment.adaptiveFollowUps[0].question}
            </span>
            <p className="font-mono text-stone-800 bg-white p-2.5 rounded-lg border border-stone-100 whitespace-pre-wrap">
              {draft.followUpAnswer1 || 'N/A'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#fcfbf9] border border-stone-200 text-xs">
            <span className="font-bold text-[#153424] block mb-1">
              Probe 2: {initialAssessment.adaptiveFollowUps[1].question}
            </span>
            <p className="font-mono text-stone-800 bg-white p-2.5 rounded-lg border border-stone-100 whitespace-pre-wrap">
              {draft.followUpAnswer2 || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Critique Uptake (Displayed Separately After Revision) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#edf3ee] border border-[#cbdcca] space-y-3 print:bg-white print:border-stone-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2c6e49]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#153424]">
              Critique Uptake &amp; Strategy Application (Displayed Separately)
            </h2>
          </div>
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white text-[#153424] border border-[#cbdcca]">
            {evaluation.critiqueUptake.score} / 3 ({evaluation.critiqueUptake.anchorLabel})
          </span>
        </div>

        <p className="text-xs text-[#26533a]">
          Applied Strategy: <strong>{evaluation.chosenNextStepTitle}</strong>
        </p>

        {evaluation.critiqueUptake.evidenceQuote && (
          <div className="p-3 rounded-xl bg-white border border-[#cbdcca]">
            <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
              Evidence of Critique Uptake (Literal Quote):
            </span>
            <p className="text-xs font-mono text-stone-800 italic">
              "{evaluation.critiqueUptake.evidenceQuote}"
            </p>
          </div>
        )}

        <p className="text-xs text-[#1e4732] leading-relaxed">
          {evaluation.critiqueUptake.critique}
        </p>
      </div>

      {/* Verified Competencies */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3 print:border-stone-300">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#153424] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2c6e49]" />
          <span>Demonstrated Technical Competencies</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {evaluation.verifiedCompetencies.map((comp, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#fcfbf9] border border-stone-200 text-xs text-[#153424] font-medium flex items-start gap-2 shadow-2xs print:bg-white"
            >
              <Check className="w-3.5 h-3.5 text-[#2c6e49] shrink-0 mt-0.5" />
              <span>{comp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Synthesis */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-3 print:border-stone-300">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          Executive Growth Synthesis
        </h2>
        <p className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-[#fcfbf9] p-4 rounded-xl border border-stone-200 print:bg-white">
          {evaluation.synthesis}
        </p>
      </div>

      {/* Side-by-side Comparative Evidence (Initial vs Revised) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-2xs space-y-3 print:border-stone-300">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Comparable Submission Evidence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#f7f6f2] border border-[#eae6dd] print:bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-600">Initial Attempt</span>
              <span className="text-[11px] font-mono text-stone-500">
                Score: {evaluation.initialOverallScore.toFixed(2)}/3
              </span>
            </div>
            <p className="text-xs text-stone-700 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto print:max-h-none">
              {draft.firstAnswer}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f4f9f5] border border-[#cbe2d3] print:bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#153424]">Revised &amp; Defended</span>
              <span className="text-[11px] font-mono font-bold text-[#153424]">
                Score: {evaluation.revisedOverallScore.toFixed(2)}/3
              </span>
            </div>
            <p className="text-xs text-stone-800 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto print:max-h-none">
              {draft.revisedAnswer}
            </p>
          </div>
        </div>
      </div>

      {/* Rigor & Ethics Disclaimers */}
      <div className="p-4 rounded-xl bg-[#f7f6f2] border border-[#eae6dd] space-y-1.5 text-xs text-stone-600 print:bg-white print:border-stone-400">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#2c6e49] shrink-0 mt-0.5" />
          <span>{evaluation.evidenceDisclaimer}</span>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-[#2c6e49] shrink-0 mt-0.5" />
          <span>{evaluation.ownershipDisclaimer}</span>
        </div>
        <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
          This report is practice on one task and is NOT a certified skill credential, hiring assessment, or general skill certification.
        </div>
      </div>

      {/* Export & Actions Toolbar (Hidden on print) */}
      <div className="p-4 rounded-2xl bg-[#fcfbf9] border border-[#e5e1d8] flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-[#153424] text-xs font-medium text-stone-800 flex items-center gap-1.5 transition shadow-2xs focus-visible:ring-2 focus-visible:ring-[#153424]"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Markdown</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-[#153424] text-xs font-medium text-stone-800 flex items-center gap-1.5 transition shadow-2xs focus-visible:ring-2 focus-visible:ring-[#153424]"
          >
            <FileText className="w-3.5 h-3.5 text-stone-500" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-[#153424] text-xs font-medium text-stone-800 flex items-center gap-1.5 transition shadow-2xs focus-visible:ring-2 focus-visible:ring-[#153424]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center gap-1.5 transition shadow-2xs focus-visible:ring-2 focus-visible:ring-[#153424]"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onResetSession}
          className="px-5 py-2.5 rounded-xl bg-[#153424] text-white hover:bg-[#0b1f15] text-xs font-semibold flex items-center gap-2 transition shadow-sm focus-visible:ring-2 focus-visible:ring-[#153424]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Practice Session</span>
        </button>
      </div>
    </div>
  );
};
