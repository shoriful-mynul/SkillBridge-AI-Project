/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoleRubric, TargetRole } from '../types/index.ts';

export const ROLE_RUBRICS: Record<TargetRole, RoleRubric> = {
  'aiml-intern': {
    roleId: 'aiml-intern',
    roleTitle: 'AI/ML Intern',
    version: 'v2.1-aiml',
    description: 'Evaluates machine learning problem formulation, model architecture choices, training & inference tradeoffs, and empirical validation rigor.',
    coreSkills: [
      'Data Preprocessing & Leakage Prevention',
      'Model Architecture & Baseline Benchmarking',
      'Hyperparameter & Loss Formulation',
      'Evaluation Metrics (ROC-AUC, PR-AUC, F1, Latency)',
      'Overfitting Mitigation & Generalization',
      'Inference Efficiency & Deployment Constraints'
    ],
    taskConstraints: [
      'Must specify explicit baseline comparison (e.g. heuristic vs classical vs deep model).',
      'Must explain feature representation and data leakage defenses (temporal or group splits).',
      'Must justify loss function and evaluation metric alignment with real operational impact.',
      'Must address inference latency or resource constraints alongside predictive performance.'
    ],
    dimensions: [
      {
        id: 'problem_framing',
        name: 'Problem Framing & Task Formulation',
        description: 'Clarity in framing the ML task, defining inputs/outputs, target metric alignment, and baseline comparison.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No task formulation, target metric, or baseline specified in the text.' },
          { score: 1, label: 'Emerging', criteria: 'Vague assertion (e.g., "used AI to predict churn") with no formal target label definition or baseline comparison.' },
          { score: 2, label: 'Competent', criteria: 'Defines task formulation, target label, and baseline algorithm (e.g., logistic regression or majority class).' },
          { score: 3, label: 'Exemplary', criteria: 'Rigorous formulation: baseline progression, class imbalance mitigation, explicit loss-to-utility alignment, and boundary failure analysis.' }
        ]
      },
      {
        id: 'decision_quality',
        name: 'Architectural & Technical Decision Quality',
        description: 'Rationale for model selection, feature engineering, loss design, and hyperparameter decisions.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No architectural details, model names, or technical mechanisms provided.' },
          { score: 1, label: 'Emerging', criteria: 'Treats ML library as a black box; selects architecture purely because it is popular without technical rationale.' },
          { score: 2, label: 'Competent', criteria: 'Provides technical rationale for model choice (e.g., tree ensemble for tabular features or parameter reduction via feature reuse).' },
          { score: 3, label: 'Exemplary', criteria: 'Defends architecture against concrete alternatives with mathematical or mechanistic depth (e.g., inductive bias, gradient flow, custom loss).' }
        ]
      },
      {
        id: 'tradeoff_navigation',
        name: 'Trade-off & Constraint Navigation',
        description: 'Handling inference latency vs accuracy, model complexity vs interpretability, and sample efficiency.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'Ignores compute limits, latency budgets, training cost, and model interpretability.' },
          { score: 1, label: 'Emerging', criteria: 'Mentions trade-offs in passing (e.g., "takes longer to train") without quantifying limits or operational constraints.' },
          { score: 2, label: 'Competent', criteria: 'Acknowledges inference time and memory footprint; balances precision vs recall for the task.' },
          { score: 3, label: 'Exemplary', criteria: 'Nuanced trade-off defense: quantifies Pareto frontier, discusses quantization/pruning, false positive cost asymmetry, and resource scaling.' }
        ]
      },
      {
        id: 'verification_rigor',
        name: 'Verification, Validation & Metrics Rigor',
        description: 'Data leakage prevention, cross-validation strategy, out-of-distribution robustness, and sliced evaluation.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No validation metrics, splits, or evaluation methodologies mentioned.' },
          { score: 1, label: 'Emerging', criteria: 'Reports raw training or random-split accuracy with no consideration of data leakage or class skew.' },
          { score: 2, label: 'Competent', criteria: 'Employs appropriate split strategy (grouped or time-series) and reports multi-dimensional metrics (F1, PR-AUC).' },
          { score: 3, label: 'Exemplary', criteria: 'Defensive validation: proves zero-leakage, confidence calibration (ECE), stress testing under distribution shift, and reproducible ablation experiments.' }
        ]
      }
    ]
  },
  'data-analyst-intern': {
    roleId: 'data-analyst-intern',
    roleTitle: 'Data Analyst Intern',
    version: 'v2.1-data',
    description: 'Evaluates analytical question translation, SQL/transformation hygiene, statistical reasoning, and stakeholder decision support.',
    coreSkills: [
      'Exploratory Data Analysis & Data Hygiene',
      'Advanced SQL & Dimensional Modeling',
      'Business Metric Formulation (Churn, Cohorts, CAC)',
      'Statistical Significance & Anomaly Detection',
      'Confounder & Bias Identification',
      'Actionable Stakeholder Data Storytelling'
    ],
    taskConstraints: [
      'Must explain data source granularity and join logic (handling 1:N or M:N deduplication).',
      'Must define explicit business metric formula with edge cases (nulls, active status, cancellations).',
      'Must distinguish correlation from causation and evaluate sample bias or confounders.',
      'Must translate analytical findings into at least one concrete, actionable operational recommendation.'
    ],
    dimensions: [
      {
        id: 'problem_framing',
        name: 'Problem Framing & Metric Formulation',
        description: 'Ability to deconstruct ambiguous stakeholder business questions into measurable analytical KPIs.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No business context or metric formula provided.' },
          { score: 1, label: 'Emerging', criteria: 'Reports raw descriptive counts without cohort boundaries or time-window definitions.' },
          { score: 2, label: 'Competent', criteria: 'Frames the analytical hypothesis, defines the core KPI formula, and bounds the observation period.' },
          { score: 3, label: 'Exemplary', criteria: 'Comprehensive metric hierarchy: translates executive ambiguity into north-star and counter-metrics, anticipating gaming.' }
        ]
      },
      {
        id: 'decision_quality',
        name: 'Architectural & Technical Decision Quality',
        description: 'SQL architecture, window functions, normalization, aggregation grain, and transformation pipelines.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No transformation logic, queries, or data modeling choices provided.' },
          { score: 1, label: 'Emerging', criteria: 'Basic single-table filtering with no consideration of query cost, surrogate keys, or row fanout.' },
          { score: 2, label: 'Competent', criteria: 'Uses CTEs, window functions (SUM OVER / LAG), and validates table grain to prevent duplication.' },
          { score: 3, label: 'Exemplary', criteria: 'Production-grade modeling: defends star-schema design, explains partition pruning, and documents data contract assumptions.' }
        ]
      },
      {
        id: 'tradeoff_navigation',
        name: 'Trade-off & Constraint Navigation',
        description: 'Handling missing data, outliers, report latency vs precision, and signal vs noise.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'Silently ignores data hygiene, missing records, or outliers.' },
          { score: 1, label: 'Emerging', criteria: 'Drops all null rows indiscriminately without evaluating selection bias.' },
          { score: 2, label: 'Competent', criteria: 'Documents missingness mechanism; chooses justified imputation or exclusion thresholds; reconciles billing anomalies.' },
          { score: 3, label: 'Exemplary', criteria: 'Nuanced statistical trade-offs: defensibly models censored data, quantifies survival bias, and prevents Simpson\'s paradox.' }
        ]
      },
      {
        id: 'verification_rigor',
        name: 'Verification, Validation & Metrics Rigor',
        description: 'Sanity checks, statistical significance, cross-system reconciliation, and defensive analysis.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No sanity checking or statistical validation presented.' },
          { score: 1, label: 'Emerging', criteria: 'Confuses correlation with causation; accepts query output without reconciling source systems.' },
          { score: 2, label: 'Competent', criteria: 'Reconciles transformed data against upstream source of truth; computes confidence intervals or p-values where applicable.' },
          { score: 3, label: 'Exemplary', criteria: 'Rock-solid defense: multivariate regression controlling for confounders (Cox model), power calculation, and error bounds.' }
        ]
      }
    ]
  },
  'frontend-dev-intern': {
    roleId: 'frontend-dev-intern',
    roleTitle: 'Frontend Developer Intern',
    version: 'v2.1-fedev',
    description: 'Evaluates component architecture, state management boundaries, accessibility (WCAG), and browser performance optimization.',
    coreSkills: [
      'Component Architecture & Prop Hierarchy',
      'State Management & Unnecessary Re-render Avoidance',
      'Web Accessibility (WCAG 2.1 AA, Semantic HTML, ARIA)',
      'Performance & Core Web Vitals (LCP, INP, CLS)',
      'Resilient Async Network & Error Boundary Handling',
      'Responsive UX & Design System Tokens'
    ],
    taskConstraints: [
      'Must explain component breakdown, state ownership, and data flow hierarchy.',
      'Must explicitly address accessibility: keyboard navigation, screen reader announcements, and focus management.',
      'Must consider browser runtime performance (re-renders, DOM size, bundle size, or virtualized lists).',
      'Must define error boundary and graceful loading states for degraded network conditions.'
    ],
    dimensions: [
      {
        id: 'problem_framing',
        name: 'Problem Framing & Component Architecture',
        description: 'Decomposition of user interfaces into reusable, decoupled components with clear separation of concerns.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No component structure or UI state architecture described.' },
          { score: 1, label: 'Emerging', criteria: 'Monolithic component structure with mixed concerns, prop drilling, and unclear boundaries.' },
          { score: 2, label: 'Competent', criteria: 'Clean component hierarchy: separates container logic from presentational components with typed props.' },
          { score: 3, label: 'Exemplary', criteria: 'Architectural mastery: highly cohesive decoupled modules, subscriber stores (useSyncExternalStore), and micro-state boundaries.' }
        ]
      },
      {
        id: 'decision_quality',
        name: 'Architectural & Technical Decision Quality',
        description: 'State management strategy, caching, semantic HTML5, and accessibility implementation.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No accessibility, keyboard, or state management implementation provided.' },
          { score: 1, label: 'Emerging', criteria: 'Uses unsemantic div buttons with onClick handlers; ignores keyboard focus and ARIA roles.' },
          { score: 2, label: 'Competent', criteria: 'Implements WCAG 2.1 AA standards: roving tabindex, aria-* attributes, and visible focus management.' },
          { score: 3, label: 'Exemplary', criteria: 'Flawless execution: accessible roving tabindex, virtualized focus recovery with scrollToIndex, and live region semantics.' }
        ]
      },
      {
        id: 'tradeoff_navigation',
        name: 'Trade-off & Constraint Navigation',
        description: 'Balancing client vs server computation, bundle weight vs capability, and optimistic UI vs data consistency.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No consideration of runtime constraints, frame rates, or memory budgets.' },
          { score: 1, label: 'Emerging', criteria: 'Installs heavy packages for trivial tasks; ignores initial bundle size and mobile CPU bottlenecks.' },
          { score: 2, label: 'Competent', criteria: 'Analyzes rendering trade-offs; implements virtualization or windowing to constrain DOM footprint.' },
          { score: 3, label: 'Exemplary', criteria: 'Deep browser performance optimization: requestAnimationFrame scheduling, startTransition concurrent rendering, and sub-25ms INP.' }
        ]
      },
      {
        id: 'verification_rigor',
        name: 'Verification, Validation & Metrics Rigor',
        description: 'Cross-browser testing, automated UI unit/integration tests, lighthouse metrics, and screen reader verification.',
        anchors: [
          { score: 0, label: 'Unobserved', criteria: 'No automated tests, accessibility audits, or runtime benchmarks reported.' },
          { score: 1, label: 'Emerging', criteria: 'Relies solely on manual visual checks in a single browser window.' },
          { score: 2, label: 'Competent', criteria: 'Validates with automated component tests (Testing Library/Vitest) and accessibility audits (axe-core).' },
          { score: 3, label: 'Exemplary', criteria: 'Defensive QA: end-to-end user journey tests with Playwright, screen reader verification (VoiceOver/NVDA), and measured Core Web Vitals.' }
        ]
      }
    ]
  }
};
