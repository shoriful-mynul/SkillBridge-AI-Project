/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentDraft, TargetRole } from '../types/index.ts';

const DRAFT_STORAGE_KEY = 'skillbridge_local_draft_v2';
const AUTOSAVE_ENABLED_KEY = 'skillbridge_autosave_enabled_v2';

export interface SavedDraftPayload {
  selectedRole: TargetRole;
  rawInputText: string;
  draft: StudentDraft;
  savedAt: number;
}

export function isLocalDraftEnabled(): boolean {
  try {
    return localStorage.getItem(AUTOSAVE_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setLocalDraftEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(AUTOSAVE_ENABLED_KEY, 'true');
    } else {
      localStorage.removeItem(AUTOSAVE_ENABLED_KEY);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Saves ONLY editable input drafts to localStorage.
 * NEVER stores API keys, server-trusted scores, or completed assessments.
 */
export function saveLocalDraft(
  selectedRole: TargetRole,
  rawInputText: string,
  draft: StudentDraft
): boolean {
  if (!isLocalDraftEnabled()) return false;

  try {
    const payload: SavedDraftPayload = {
      selectedRole,
      rawInputText,
      draft: {
        predictedScore: draft.predictedScore,
        predictionConfidence: draft.predictionConfidence,
        predictionRationale: draft.predictionRationale,
        firstAnswer: draft.firstAnswer,
        followUpAnswer1: draft.followUpAnswer1,
        followUpAnswer2: draft.followUpAnswer2,
        chosenNextStepId: draft.chosenNextStepId,
        revisedAnswer: draft.revisedAnswer,
      },
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadLocalDraft(): SavedDraftPayload | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedDraftPayload;
  } catch {
    return null;
  }
}

export function clearLocalDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
