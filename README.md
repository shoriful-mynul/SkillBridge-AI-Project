# SkillBridge AI · Verifiable Project Assessment

> **AICON'26 Submission by Team Gradient**  
> Turn student project claims into verifiable evidence through decision-grounded assessment, rubric feedback, and iterative revision.

---

## 1. Problem Statement & Motivation
Resume claims and portfolios are filled with buzzwords ("implemented transformer models", "built microservices pipeline", "optimized performance by 40%"). Traditional interviews struggle with two opposing traps:
1. **Generic multiple-choice quizzes or AI-detection scores**, which test memorization or produce unreliable AI-authorship scores that penalize non-native speakers or nervous candidates.
2. **Ungrounded take-home projects**, which invite unverified copy-pasting without probing the candidate's actual architectural decisions and trade-offs.

**SkillBridge AI** replaces superficial scoring with **verifiable, quotation-anchored evidence**:
- Extracts concrete project claims with exact line quotations.
- Triggers clarification if project text lacks verifiable tool/decision context.
- Generates an adaptive task grounded strictly in the candidate's reported architectural choices.
- Scores four core dimensions on a 0–3 anchored scale where any score above 1 **strictly requires** an exact literal quotation from the submitted answer.
- Evaluates critique uptake on revision without conflating it with baseline technical depth.
- Labels results honestly: **"Evidence change on this task"**, never claiming to be a general intelligence metric or hiring guarantee.

---

## 2. Architecture & Design Principles

```
┌────────────────────────────────────────────────────────────┐
│                  Client UI (React + Vite)                  │
│  - No API keys in bundle                                   │
│  - Optional opt-in local draft (editable text only)        │
│  - Explicit data disclosure before external API call       │
│  - Fully labeled Synthetic Rehearsal mode toggle           │
│  - Accessible WCAG contrast, visible focus, ARIA live      │
└─────────────┬───────────────────────────────▲──────────────┘
              │                               │
       HTTP REST API                   JSON Response
              │                               │
┌─────────────▼───────────────────────────────┴──────────────┐
│             Server & Deterministic Engine (Node/Express)    │
│  - Session state machine (validates sequential transitions)│
│  - Untrusted client input sanitization                     │
│  - 5 MB PDF text parser (no file persistence/logging)      │
│  - Literal substring quotation verifier (clamps if missing)│
│  - Deterministic aggregate math (same 0.25 weights both)   │
│  - Coachability strictly null on attempt 1                 │
│  - Bounded retries for transient errors; no 429 retries    │
└─────────────────────────────┬──────────────────────────────┘
                              │
                    Structured Zod Schemas
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                   Gemini 2.5 Flash Provider                │
│  - Server-side only via @google/genai SDK                  │
│  - Strict JSON schemas via Zod parser                      │
│  - Graceful fallback to Synthetic Rehearsal on error       │
└────────────────────────────────────────────────────────────┘
```

### Key Technical Guarantees
1. **Deterministic Scoring Math**: Dimension aggregation, threshold calculations, and before/after delta comparisons run strictly in deterministic TypeScript server code (`server/assessmentEngine.ts`), never via LLM temperature hallucinations.
2. **Quotation Validation Rule**: Scores > 1 require an exact literal substring match within the submitted answer. If the LLM returns an altered, hallucinated quote, or cites the CV text instead of the student answer, the server strictly clamps the score to 1 and marks `isQuoteVerified = false`.
3. **Initial Null Coachability**: Coachability/critique uptake is mathematically unobserved on the first attempt and is represented as `null`, never `0`. On revision, the four initial dimensions use the exact same normalized weights (0.25 each) to ensure honest comparison.
4. **State Machine & Tamper Proofing**: Sessions are tracked server-side (`sessionStore`). Direct API jumps (e.g. posting a revision without completing follow-ups) are rejected with HTTP 400.
5. **No Synthetic Live Results on Failure**: Provider failures never invent synthetic results under a live label. Users are informed transparently with bounded timeout handling.
6. **Privacy & Data Boundary**: Text-based PDFs are checked for magic bytes, parsed strictly in memory with a 5 MB limit, and discarded immediately without disk persistence. Optional local drafts save only editable input text, never server scores or API credentials.

---

## 3. Supported Roles & Distinct Rubrics

Three specialized technical roles are supported, each loaded with distinct source anchors and evaluation criteria:

| Role | Key Focus Areas | Anchor Examples |
|---|---|---|
| **AI / ML Engineer** | Architecture trade-offs, data hygiene, train/test leakage, failure modes | `loss_formulation`, `data_leakage_mitigation`, `validation_split_strategy` |
| **Data Analyst** | Metric integrity, cohort definitions, confounders, data hygiene | `cohort_boundary_definition`, `statistical_confounder_audit`, `metric_formula_validation` |
| **Frontend Developer** | State synchronization, edge rendering, bundle optimization, accessibility | `state_architecture`, `hydration_mismatch_guard`, `perceived_latency_optimization` |

---

## 4. Environment Variables & Setup

### Requirements
- Node.js 18+ (tested on Node 20 LTS)
- npm 9+

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
# .env
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL="gemini-2.5-flash"
PORT=3000
```
*(Note: If `GEMINI_API_KEY` is not provided, the server remains operational and all functionality can be practiced via the fully featured Synthetic Rehearsal mode).*

### Installation & Running
```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run linter / type checks
npm run lint

# Start full-stack development server (Express + Vite)
npm run dev
```
The application will be live at `http://localhost:3000`.

---

## 5. Verification Status & Automated Tests

Automated tests cover all critical business rules using deterministic test doubles (`tests/assessmentRules.test.ts`):

- **Suite 1: Quotation Validation & Literal Substring Rules** (6 tests)
  - Accepts exact literal substrings from submitted answer.
  - Rejects hallucinated or modified quotes.
  - Rejects CV excerpts passed off as answer evidence.
  - Preserves score > 1 when quotation is verified.
  - Clamps score > 1 to 1 when quotation is invalid.
  - Allows scores 0 and 1 without quotation requirement.
- **Suite 2: Initial Null Coachability Rule** (1 test)
  - Verifies critique uptake is strictly `null` on attempt 1.
- **Suite 3: Comparable Revision Weights & Deterministic Calculations** (2 tests)
  - Identical 4-dimension 0.25 weights across both attempts.
  - Critique uptake isolated from baseline comparison aggregate.
- **Suite 4: State Machine Transition & Client Tampering Guards** (3 tests)
  - Enforces sequential progression (`input` → `task` → `assessment` → `followup` → `revision` → `report`).
  - Rejects invalid stage jumps and prevents client score spoofing.
- **Suite 5: Reliability & Failed-Provider Behavior** (3 tests)
  - Bounded retries for transient failures.
  - Does not repeatedly retry HTTP 429 rate limits or client auth errors.
  - Preserves user drafts on bounded timeout.
- **Suite 6: Text-Based PDF Import & File Validation** (3 tests)
  - Enforces 5 MB limit.
  - Validates `%PDF` magic bytes.
  - Rejects scanned/empty PDFs with actionable guidance.
- **Suite 7: Optional Local Draft & Data Boundary Rules** (1 test)
  - Persists only editable student drafts in browser storage, never API secrets or server scores.

**Test Execution**: All 19 tests pass (`19 pass, 0 fail`).  
**TypeScript Validation**: `tsc --noEmit` passes with 0 errors.

---

## 6. Five-Minute Presentation & Demo Script

### Target Duration: 5:00 minutes

| Time | Stage | Action / Talking Point | Fallback Path |
|---|---|---|---|
| **0:00 - 0:45** | **The Problem** | *“Resume buzzwords and generic AI-detection scores don’t prove technical ownership. We built SkillBridge AI to replace speculation with verifiable, quotation-anchored evidence.”* | Point to top-level banner explaining evidence principles. |
| **0:45 - 1:30** | **Project Input & Claims** | Load the sample ML or Data Analyst project (or upload a PDF). Point out the extracted claims with exact quotation excerpts. Mention that vague input triggers clarification rather than a fake task. | Use preloaded sample in one click. |
| **1:30 - 2:30** | **Grounded Task & Initial Score** | Show the generated engineering task targeting the specific model choice. Submit an answer with technical justifications. Highlight that score > 1 **must cite an exact literal substring** of the answer. | Toggle **Synthetic Rehearsal** if live API is throttled. |
| **2:30 - 3:30** | **Feedback & Follow-Ups** | Review the 4-part feedback: demonstrated evidence, unsupported gaps, one strategy, two achievable next steps. Answer the 2 adaptive follow-up questions probing trade-offs. | Answers are prefilled in rehearsal mode for instant demo. |
| **3:30 - 4:15** | **Revision & Honest Comparison** | Submit the revised answer. Notice: Coachability was `null` on attempt 1; now critique uptake is clearly displayed. The comparison is labeled **“Evidence change on this task”**, never general IQ or hiring promise. | Click “Next: View Report” to see side-by-side progression. |
| **4:15 - 5:00** | **Export, Disclosures & Limitations** | Show the Print / PDF export and JSON export. Point out the clear disclosure that this is task evidence, not an accredited credential, and review privacy boundaries. | Print preview shows clean, printable layout. |

---

## 7. Disclosures, Reference Materials & Implementation History

- **AI Assistance**: Gemini 2.5 Flash was utilized during development for code structuring, rubric synthesis, and test harness authoring. All core server-side validation logic, state guards, and deterministic aggregation algorithms were architected and verified manually.
- **Reference Rubrics**: Based on established engineering evaluation rubrics for Machine Learning, Data Analytics, and Frontend Architecture, utilizing anchored 0–3 dimensions (`problem_understanding`, `solution_correctness`, `tradeoff_awareness`, `system_thinking`, and post-revision `critique_uptake`).
- **Development History**: The foundational UI and baseline assessment shell were created prior to the sprint; the hardened deterministic quotation verifier, 5 MB text PDF extractor, local draft privacy controls, print report exporter, and exhaustive test double suite were completed during the competition window.

---

## 8. Deployment Configuration Still Required

For production deployment:
1. **Secrets**: Set `GEMINI_API_KEY` in Cloud Run / hosting provider environment secrets.
2. **Origin & CORS**: Configure trusted origins if decoupling frontend from backend.
3. **Session Storage**: In multi-instance distributed environments, swap the in-memory `sessionStore` for Redis or Cloud Firestore with TTL expiration.
4. **Build Command**: Standard `npm run build` compiles Vite assets to `/dist`; Express serves static files via `server.ts`.
