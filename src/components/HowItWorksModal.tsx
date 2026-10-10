/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, Shield, Target, Sparkles, BookOpen } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#e5e1d8] relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#eaf1ec] text-[#1b4331] border border-[#cfdfd3]">
            Methodology &amp; Architecture
          </span>
          <span className="text-xs font-semibold text-stone-500">AICON’26 · Team Gradient</span>
        </div>

        <h2 id="modal-title" className="text-2xl font-bold tracking-tight text-[#0f281c] mb-2">
          Your project. Your decisions. Now make them evidence.
        </h2>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          SkillBridge AI bridges the gap between passive resume assertions and verified technical competence.
          We test concrete engineering decisions made in real projects, not arbitrary coding trivia.
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl bg-[#f7f6f2] border border-[#e8e4db] flex gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#153424] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-4 h-4 text-[#85dfa5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f281c]">1. Claim Grounding, Not Hallucination</h3>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Gemini extracts explicit project claims with exact verbatim source quotations. If your submission lacks concrete tools or decisions, we ask for clarification rather than inventing experience.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#f7f6f2] border border-[#e8e4db] flex gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#153424] text-white flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-[#85dfa5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f281c]">2. Distinct Versioned Role Rubrics</h3>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Choose between AI/ML Intern (v1.4), Data Analyst Intern (v1.3), or Frontend Dev Intern (v1.2).
                Each role uses 4 shared evaluation dimensions with deep, role-specific scoring anchors.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#f7f6f2] border border-[#e8e4db] flex gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#153424] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-[#85dfa5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f281c]">3. Adaptive Probing &amp; Formative Next Steps</h3>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Predict your score, answer a challenge task, and answer two follow-up questions targeting tradeoffs or validation gaps. Select from two clear next steps to guide your one revision.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#eef5f0] border border-[#c6ded0] flex gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#153424] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-[#85dfa5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#153424]">4. Ownership &amp; Ethical Boundaries</h3>
              <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">
                <strong>You own the feedback.</strong> This is practice on one specific task, not a general hiring filter, ranking leaderboard, or universal certificate.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#153424] text-white text-xs font-semibold hover:bg-[#0b1f15] transition shadow-sm"
          >
            Got it, let's practice
          </button>
        </div>
      </div>
    </div>
  );
};
