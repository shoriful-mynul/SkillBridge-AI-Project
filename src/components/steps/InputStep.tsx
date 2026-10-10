/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { TargetRole } from '../../types/index.ts';
import { ROLE_RUBRICS } from '../../data/rubrics.ts';
import { SAMPLE_PROJECT_TEXTS, VAGUE_SAMPLE_TEXT } from '../../data/samplePrompts.ts';
import {
  Sparkles,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Save,
  Trash2,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface InputStepProps {
  selectedRole: TargetRole;
  onSelectRole: (role: TargetRole) => void;
  isRoleLocked: boolean;
  rawText: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isRehearsal: boolean;
  onToggleRehearsal: () => void;
  isAutoSaveEnabled: boolean;
  onToggleAutoSave: (enabled: boolean) => void;
  hasSavedDraft: boolean;
  onRestoreDraft: () => void;
  onClearDraft: () => void;
  onClearSession?: () => void;
}

export const InputStep: React.FC<InputStepProps> = ({
  selectedRole,
  onSelectRole,
  isRoleLocked,
  rawText,
  onChangeText,
  onSubmit,
  isLoading,
  isRehearsal,
  onToggleRehearsal,
  isAutoSaveEnabled,
  onToggleAutoSave,
  hasSavedDraft,
  onRestoreDraft,
  onClearDraft,
  onClearSession
}) => {
  const currentRubric = ROLE_RUBRICS[selectedRole];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF import state
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null);

  // Handle PDF file selection
  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfErrorMessage(null);
    setPdfStatusMessage(null);

    // Validate client-side file size (5 MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setPdfErrorMessage(
        `File "${file.name}" exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller text-based PDF.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfErrorMessage('Selected file is not a PDF. Please select a valid .pdf file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingPdf(true);
    setPdfStatusMessage('Reading and extracting text from PDF (5 MB limit, zero server retention)...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          const response = await fetch('/api/import-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileBase64: base64Data,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            setPdfErrorMessage(
              data.error || 'Failed to extract text. If this PDF is scanned or encrypted, please paste text directly.'
            );
          } else {
            onChangeText(data.text);
            setPdfStatusMessage(
              `Successfully extracted ${data.text.length} characters from "${file.name}" (${data.pageCount || 1} pages). You can edit the text below before analysis.`
            );
          }
        } catch (err: any) {
          setPdfErrorMessage(
            err.message || 'Error processing PDF document. Please paste your text directly.'
          );
        } finally {
          setIsUploadingPdf(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.onerror = () => {
        setPdfErrorMessage('Failed to read the local PDF file.');
        setIsUploadingPdf(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setPdfErrorMessage(err.message || 'Failed to read file.');
      setIsUploadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Heading as specified in brief */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf3ee] border border-[#cbdcca] text-xs font-semibold text-[#153424] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#2c6e49]" />
          <span>Stage 1: Project Grounding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f281c]">
          Your project. Your decisions. Now make them evidence.
        </h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          Paste your project description or import a text-based PDF CV. SkillBridge extracts concrete claims with verbatim source quotes, verifies tools and decisions, and builds an authentic challenge task.
        </p>
      </div>

      {/* Role Confirmation & Fictional Rehearsal Samples (Feature 5) */}
      <div className="p-4 rounded-xl bg-[#f7f6f2] border border-[#e8e4db] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Selected Target Role &amp; Rubric
            </span>
            <h2 className="text-sm font-bold text-[#0f281c] mt-0.5">
              {currentRubric.roleTitle}{' '}
              <span className="font-mono text-xs font-normal text-stone-500">
                ({currentRubric.version})
              </span>
            </h2>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Shared dimensions · Role-specific 0–3 scoring anchors
          </div>
        </div>

        {/* Dedicated Distinct Fictional Samples */}
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1.5">
            Load Fictional Practice Sample (Distinct per role):
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROJECT_TEXTS.map((sample) => (
              <button
                key={sample.roleId}
                type="button"
                onClick={() => {
                  if (!isRoleLocked) {
                    onSelectRole(sample.roleId);
                  }
                  onChangeText(sample.content);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition shadow-2xs ${
                  selectedRole === sample.roleId
                    ? 'bg-white border-[#153424] text-[#153424] font-bold ring-1 ring-[#153424]/10'
                    : 'bg-white border-stone-300 hover:border-stone-400 text-stone-700'
                }`}
                title={sample.description}
              >
                {sample.roleId === 'aiml-intern' && '1. ChestX-Ray (AI/ML)'}
                {sample.roleId === 'data-analyst-intern' && '2. SaaS Churn (Data Analyst)'}
                {sample.roleId === 'frontend-dev-intern' && '3. Virtual Grid (Frontend Dev)'}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onChangeText(VAGUE_SAMPLE_TEXT)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium transition"
              title="Load vague text to test clarification flow"
            >
              Test Vague Text
            </button>
          </div>
        </div>
      </div>

      {/* Feature 1: PDF Import Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f281c] flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#2c6e49]" />
              <span>Import Text-Based PDF (Optional)</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              5 MB limit · Validated server-side · Never retained after extraction or logged
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,.pdf"
              onChange={handlePdfFileSelect}
              className="hidden"
              id="pdf-file-upload"
              disabled={isUploadingPdf || isLoading}
            />
            <label
              htmlFor="pdf-file-upload"
              className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border font-semibold cursor-pointer transition ${
                isUploadingPdf || isLoading
                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                  : 'bg-white hover:bg-stone-50 border-stone-300 text-stone-800 hover:border-[#153424]'
              }`}
            >
              {isUploadingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-stone-400 border-t-stone-700 rounded-full animate-spin" />
                  <span>Extracting Text...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#2c6e49]" />
                  <span>Choose PDF File</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* PDF Status Notification */}
        {pdfStatusMessage && (
          <div
            className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{pdfStatusMessage}</p>
          </div>
        )}

        {/* Scanned/Unreadable PDF Limitation Notice */}
        {pdfErrorMessage && (
          <div
            className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">PDF Limitation Notice:</strong>
              <p className="leading-relaxed">{pdfErrorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Form with Editable Textarea */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading && rawText.trim().length >= 20) {
            onSubmit();
          }
        }}
        className="space-y-4"
      >
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="cv-project-text"
              className="text-xs font-bold uppercase tracking-wider text-stone-700"
            >
              Editable Project Narrative or CV Text
            </label>
            <span className="text-[11px] text-stone-600 font-mono">
              {rawText.length} characters (min 20)
            </span>
          </div>

          <textarea
            id="cv-project-text"
            rows={10}
            value={rawText}
            onChange={(e) => onChangeText(e.target.value)}
            disabled={isLoading || isUploadingPdf}
            placeholder={`Paste your project text or import a PDF above.
Example:
Project: ChestX-Ray Pneumonia Classifier & Interpretability Pipeline
Replaced ResNet-50 baseline with fine-tuned DenseNet-121 architecture to reuse feature maps and cut parameters from 25.6M to 7.0M on medical data.
Mitigated class imbalance with focal loss (gamma=2.0, alpha=0.25).
Employed patient-level stratified splitting to ensure zero data leakage between train/test partitions.
Achieved ROC-AUC of 0.941 and sensitivity of 93.2%.`}
            className="w-full rounded-xl border border-stone-300 p-4 text-xs font-mono text-stone-800 leading-relaxed placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#153424] bg-white transition resize-y break-words"
          />

          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
            <span>Must describe at least one tool and an engineering decision.</span>
            <span>Treated as untrusted data · Never executed as instructions</span>
          </div>
        </div>

        {/* Feature 3: Optional Local Draft Control */}
        <div className="p-3.5 rounded-xl bg-[#f7f6f2] border border-[#e8e4db] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="autosave-toggle"
              checked={isAutoSaveEnabled}
              onChange={(e) => onToggleAutoSave(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-[#153424] focus:ring-[#153424]"
            />
            <label htmlFor="autosave-toggle" className="text-stone-700 cursor-pointer">
              <span className="font-semibold block text-[#0f281c]">Save draft on this device</span>
              <span className="text-[11px] text-stone-500 block leading-tight">
                Off by default. Uses browser storage; may be visible to others on this device. Never stores credentials or scores.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {hasSavedDraft && (
              <>
                <button
                  type="button"
                  onClick={onRestoreDraft}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition"
                  title="Restore saved input draft"
                >
                  Restore Saved Draft
                </button>
                <button
                  type="button"
                  onClick={onClearDraft}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-red-700 hover:bg-red-50 border border-red-200 transition"
                  title="Delete saved draft from device storage"
                >
                  Clear Saved Draft
                </button>
              </>
            )}
            {onClearSession && (rawText.trim().length > 0 || hasSavedDraft) && (
              <button
                type="button"
                onClick={onClearSession}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition"
                title="Clear current text and start a clean session"
              >
                Clear Session
              </button>
            )}
          </div>
        </div>

        {/* Feature 2: Clear Submission Disclosure */}
        {!isRehearsal && (
          <div className="p-4 rounded-xl bg-[#f2f7f4] border border-[#cbdcca] text-xs text-[#153424] space-y-1">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
              <Info className="w-3.5 h-3.5 text-[#2c6e49]" />
              <span>Live AI Submission Disclosure</span>
            </div>
            <p className="leading-relaxed text-[11px] text-stone-700">
              Your submitted project text and task answers will be transmitted to the configured Google Gemini service for extraction and assessment.
              <strong> Please remove personal identifiers</strong> (such as your full name, phone number, address, or email) before proceeding.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-stone-500">Want to test without sending data?</span>
              <button
                type="button"
                onClick={onToggleRehearsal}
                className="font-bold underline text-[#153424] hover:text-[#0b1f15]"
              >
                Switch to Synthetic Rehearsal
              </button>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            {isRehearsal ? (
              <span className="inline-flex items-center gap-1 text-[#26533a] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#2c6e49]" />
                Synthetic Rehearsal (Fictional data, zero external transmission)
              </span>
            ) : (
              <span>Gemini 3.8 Flash Engine · Subject to submission disclosure</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || rawText.trim().length < 20 || isUploadingPdf}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#153424] ${
              isLoading || rawText.trim().length < 20 || isUploadingPdf
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#153424] text-white hover:bg-[#0b1f15] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Extracting &amp; Verifying Claims...</span>
              </>
            ) : (
              <>
                <span>Extract Claims &amp; Begin Practice</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
