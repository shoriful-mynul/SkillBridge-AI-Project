/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TargetRole } from '../types/index.ts';

export interface SampleProjectText {
  roleId: TargetRole;
  label: string;
  description: string;
  content: string;
}

export const SAMPLE_PROJECT_TEXTS: SampleProjectText[] = [
  {
    roleId: 'aiml-intern',
    label: 'ChestX-Ray Pneumonia Classifier (PyTorch & DenseNet-121)',
    description: 'Realistic ML intern project with class imbalance, Grad-CAM interpretability, and ROC-AUC metrics.',
    content: `PROJECT: ChestX-Ray Pneumonia Classifier & Interpretability Pipeline
Role: Machine Learning Research Intern
Technologies: Python, PyTorch, torchvision, Torchvision Models, Albumentations, Grad-CAM, scikit-learn

Project Details:
- Developed an automated deep learning diagnostic screening pipeline for pediatric pneumonia from 5,856 anterior-posterior chest X-ray images.
- Replaced a standard ResNet-50 baseline with a fine-tuned DenseNet-121 architecture because DenseNet's dense connectivity reuses feature maps across layers, providing better gradient flow and reducing parameter count from 25.6M to 7.0M on limited medical datasets.
- Mitigated severe class imbalance (3,883 pneumonia vs 1,349 normal cases) by implementing focal loss (gamma=2.0, alpha=0.25) instead of standard binary cross-entropy, down-weighting easy negative examples.
- Employed patient-level stratified splitting to ensure zero data leakage between train, validation, and test partitions, preventing slices from the same patient appearing in both sets.
- Integrated Grad-CAM heatmaps to visualize radiologist attention regions, achieving an overall ROC-AUC of 0.941 and sensitivity of 93.2% while reducing false negatives in early pneumonia detection.`
  },
  {
    roleId: 'data-analyst-intern',
    label: 'B2B SaaS Churn & Retention Cohort Engine (PostgreSQL & dbt)',
    description: 'Realistic analytics intern project with dimensional modeling, window functions, and survival analysis.',
    content: `PROJECT: B2B SaaS Customer Retention & Churn Attribution Engine
Role: Data Analyst Intern
Technologies: SQL (PostgreSQL), dbt, Snowflake, Python (pandas, lifelines), Tableau

Project Details:
- Designed and built an automated subscription retention and cohort analysis model tracking 45,000 monthly recurring revenue (MRR) accounts over 24 months.
- Replaced monolithic manual SQL queries with a modular dbt transformation layer, building a star-schema fact table fact_subscription_events and dimension dim_customers with surrogate keys to avoid row fanout on 1-to-many subscription upgrades.
- Used SQL window functions (SUM OVER and LAG) to calculate trailing 30-day net revenue retention (NRR) and identify contraction vs churn inflection points at the 90-day onboarding boundary.
- Handled edge cases including suspended accounts, failed payment retries, and mid-cycle tier migrations by defining strict active user state machines rather than raw payment timestamps.
- Conducted Kaplan-Meier survival analysis to isolate product feature adoption triggers, discovering that teams activating Slack integration within 14 days had a 38% lower 6-month churn hazard ratio (p < 0.01).`
  },
  {
    roleId: 'frontend-dev-intern',
    label: 'Virtual Data Grid with WCAG 2.1 AA (React & TypeScript)',
    description: 'Realistic frontend intern project with TanStack Virtual, keyboard navigation, and INP optimization.',
    content: `PROJECT: High-Throughput Accessible Financial Data Grid
Role: Frontend Engineering Intern
Technologies: React 19, TypeScript, TanStack Virtual, Tailwind CSS, Jest, axe-core

Project Details:
- Engineered a high-performance web data grid displaying up to 100,000 streaming stock quotes with sub-16ms frame times.
- Decided to adopt TanStack Virtual windowing instead of standard pagination or infinite scrolling, rendering only the ~35 DOM nodes visible in the viewport, which reduced initial DOM memory footprint from 84MB to 6.2MB.
- Architected a custom keyboard roving tabindex navigation system following WAI-ARIA grid patterns, allowing financial traders to navigate cells via arrow keys, PageUp/Down, and Enter to trigger modal execution without losing browser focus.
- Avoided unnecessary re-renders during high-frequency WebSocket updates (50 updates/sec) by moving streaming ticker states into an isolated subscriber hook with useRef and Canvas micro-sparklines instead of top-level React component state.
- Automated accessibility audits using jest-axe and verified with VoiceOver screen reader, reducing Interaction to Next Paint (INP) from 180ms to 24ms.`
  }
];

export const VAGUE_SAMPLE_TEXT = `Skills: Python, Machine Learning, JavaScript, HTML, SQL, Git.
Experience:
Worked on a website and built some machine learning models. Cleaned data and made presentations for the team. Used libraries like pandas and React.`;
