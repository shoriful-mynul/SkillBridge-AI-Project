/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export interface GeminiCallOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  timeoutMs?: number;
  maxRetries?: number;
}

export class GeminiService {
  private aiClient: GoogleGenAI | null;
  private defaultModel: string;

  constructor(apiKey = process.env.GEMINI_API_KEY || '', model = process.env.GEMINI_MODEL || 'gemini-2.5-flash', customClient?: GoogleGenAI) {
    this.defaultModel = model;
    if (customClient) {
      this.aiClient = customClient;
    } else if (apiKey && apiKey.trim().length > 5) {
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } else {
      this.aiClient = null;
    }
  }

  isConfigured(): boolean {
    return this.aiClient !== null;
  }

  /**
   * Bounded call to Gemini with timeout and selective retry for transient errors.
   * Never retries 4xx client errors (400, 401, 403, 429).
   */
  async generateStructuredContent<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options: GeminiCallOptions = {}
  ): Promise<T> {
    if (!this.aiClient) {
      const err: any = new Error('GEMINI_API_KEY is not configured on the server. Please switch to Synthetic Rehearsal mode.');
      err.status = 503;
      err.isPermanent = true;
      throw err;
    }

    const {
      model = this.defaultModel,
      systemInstruction,
      temperature = 0.2,
      timeoutMs = 20000,
      maxRetries = 2,
    } = options;

    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      attempt++;

      try {
        const resultPromise = this.aiClient.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature,
          },
        });

        // Bounded timeout race
        let timer: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            const timeoutErr: any = new Error(`Gemini request timed out after ${timeoutMs}ms`);
            timeoutErr.isTimeout = true;
            reject(timeoutErr);
          }, timeoutMs);
        });

        const response = await Promise.race([resultPromise, timeoutPromise]).finally(() => {
          clearTimeout(timer);
        });

        const rawText = response.text;
        if (!rawText || rawText.trim().length === 0) {
          throw new Error('Received empty response body from language model');
        }

        let cleaned = rawText.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
        }

        const parsedJson = JSON.parse(cleaned);

        // Validate strictly using Zod
        const validation = schema.safeParse(parsedJson);
        if (!validation.success) {
          const schemaErr: any = new Error(
            `Gemini response failed schema validation: ${validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`
          );
          schemaErr.isValidationError = true;
          throw schemaErr;
        }

        return validation.data;
      } catch (err: any) {
        lastError = err;

        // Categorize error: Do not retry permanent errors (400, 401, 403, 429, or schema validation)
        const errMsg = err?.message || String(err);
        const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED');
        const isAuth = errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('API_KEY_INVALID');
        const isClient = errMsg.includes('400') || err.isValidationError;

        if (isQuota || isAuth || isClient || err.isPermanent) {
          // Do not retry repeatedly
          throw err;
        }

        // Only retry transient errors (timeouts, 503, network blips) if attempts remain
        if (attempt <= maxRetries) {
          const backoffMs = attempt * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }
      }
    }

    throw lastError || new Error('Gemini request failed after retries');
  }
}

export const defaultGeminiService = new GeminiService();
