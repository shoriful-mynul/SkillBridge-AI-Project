/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, HelpCircle, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  isRehearsal: boolean;
  onToggleRehearsal: () => void;
  onOpenHowItWorks: () => void;
  onResetSession: () => void;
  isRoleLocked: boolean;
  serverConfigured: boolean;
  canReset?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isRehearsal,
  onToggleRehearsal,
  onOpenHowItWorks,
  onResetSession,
  isRoleLocked,
  serverConfigured,
  canReset = false,
}) => {
  return (
    <header className="border-b border-[#e5e1d8] bg-[#fcfbf9]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Synthetic Rehearsal Notice Banner */}
      {isRehearsal && (
        <div className="bg-[#e9f0ec] border-b border-[#c9dacf] px-4 py-1.5 text-xs text-[#153424] flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#3d7a57] animate-pulse" />
            <span>Synthetic rehearsal · not live AI</span>
            <span className="text-[#51745f] hidden sm:inline">— Curated baseline data for exploration without API consumption.</span>
          </div>
          <button
            onClick={onToggleRehearsal}
            className="text-xs text-[#153424] underline hover:text-[#0b1f15] font-semibold transition"
          >
            Switch to Live AI
          </button>
        </div>
      )}

      {!isRehearsal && !serverConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span>Server GEMINI_API_KEY is not detected. Live calls require an API key in Secrets.</span>
          </div>
          <button
            onClick={onToggleRehearsal}
            className="font-semibold underline hover:text-amber-950 transition"
          >
            Use Synthetic Rehearsal
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#153424] flex items-center justify-center text-white shadow-sm ring-1 ring-[#153424]/10">
            {/* Custom geometric checkmark motif */}
            <svg className="w-5 h-5 text-[#85dfa5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-[#0f281c]">
                SkillBridge <span className="text-[#2c6e49] font-medium">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#e8efe9] text-[#1b4331] border border-[#cbdcca]">
                AICON’26
              </span>
            </div>
            <span className="text-[11px] font-medium text-stone-700 tracking-wide">
              Team Gradient · EdTech &amp; Workforce
            </span>
          </div>
        </div>

        {/* Right: Actions & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switcher Button */}
          <button
            onClick={onToggleRehearsal}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${
              isRehearsal
                ? 'bg-[#eef5f0] text-[#153424] border-[#b9d4c2] hover:bg-[#e2ece5]'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
            title="Toggle between Live AI model and Synthetic Rehearsal"
          >
            {isRehearsal ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#2c6e49]" />
                <span className="font-semibold">Rehearsal Mode</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live AI Mode</span>
              </>
            )}
          </button>

          {/* How it works modal trigger */}
          <button
            onClick={onOpenHowItWorks}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 font-medium flex items-center gap-1.5 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">How it works</span>
          </button>

          {/* Reset / Clear Session */}
          {(isRoleLocked || canReset) && (
            <button
              onClick={onResetSession}
              className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium flex items-center gap-1.5 transition"
              title="Clear session and start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Session</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
