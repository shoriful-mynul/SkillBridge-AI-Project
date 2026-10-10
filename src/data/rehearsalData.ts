/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ExtractedClaim,
  GroundedTask,
  InitialAssessment,
  RevisionEvaluation,
  StudentDraft,
  TargetRole
} from '../types/index.ts';

export interface RehearsalBundle {
  roleId: TargetRole;
  sampleInput: string;
  claims: ExtractedClaim[];
  task: GroundedTask;
  presetDraft: StudentDraft;
  initialAssessment: InitialAssessment;
  revisionEvaluation: RevisionEvaluation;
}

export const REHEARSAL_DATA: Record<TargetRole, RehearsalBundle> = {
  'aiml-intern': {
    roleId: 'aiml-intern',
    sampleInput: `Project: ChestX-Ray Pneumonia Classifier & Interpretability Pipeline
Replaced a standard ResNet-50 baseline with a fine-tuned DenseNet-121 architecture because DenseNet's dense connectivity reuses feature maps across layers, providing better gradient flow and reducing parameter count from 25.6M to 7.0M on limited medical datasets.
Mitigated severe class imbalance by implementing focal loss (gamma=2.0, alpha=0.25) instead of standard binary cross-entropy.
Employed patient-level stratified splitting to ensure zero data leakage between train, validation, and test partitions.
Achieved ROC-AUC of 0.941 and sensitivity of 93.2%.`,
    claims: [
      {
        id: 'claim-aiml-1',
        projectTitle: 'ChestX-Ray Pneumonia Classifier',
        verbatimQuote: "Replaced a standard ResNet-50 baseline with a fine-tuned DenseNet-121 architecture because DenseNet's dense connectivity reuses feature maps across layers, providing better gradient flow and reducing parameter count from 25.6M to 7.0M on limited medical datasets.",
        toolsMentioned: ['PyTorch', 'DenseNet-121', 'ResNet-50'],
        technicalDecision: 'Selected DenseNet-121 over ResNet-50 to leverage feature reuse and cut parameter count from 25.6M to 7.0M for sample efficiency on medical imagery.',
        claimedOutcome: 'Lower memory footprint, mitigated vanishing gradients, and improved ROC-AUC to 0.941.',
        groundingConfidence: 'high'
      },
      {
        id: 'claim-aiml-2',
        projectTitle: 'ChestX-Ray Pneumonia Classifier',
        verbatimQuote: 'Mitigated severe class imbalance by implementing focal loss (gamma=2.0, alpha=0.25) instead of standard binary cross-entropy.',
        toolsMentioned: ['PyTorch', 'Focal Loss'],
        technicalDecision: 'Adopted Focal Loss to dynamically down-weight loss contribution from well-classified negative instances.',
        claimedOutcome: 'Sensitivity reached 93.2% while protecting specificity.',
        groundingConfidence: 'high'
      }
    ],
    task: {
      id: 'task-aiml-1',
      roleId: 'aiml-intern',
      projectTitle: 'ChestX-Ray Pneumonia Classifier',
      quotedTool: 'DenseNet-121 in PyTorch with Focal Loss',
      quotedDecision: 'Replaced ResNet-50 baseline with DenseNet-121 to reuse feature maps and reduce parameter count from 25.6M to 7.0M under severe class imbalance.',
      verbatimSource: "Replaced a standard ResNet-50 baseline with a fine-tuned DenseNet-121 architecture because DenseNet's dense connectivity reuses feature maps across layers, providing better gradient flow and reducing parameter count from 25.6M to 7.0M on limited medical datasets.",
      taskTitle: 'Defend DenseNet-121 Architecture & Validation Strategy Under Clinical Resource Constraints',
      scenarioDescription: 'Hospital deployment requires running inference on low-power edge radiology workstations with limited GPU VRAM. Simultaneously, clinicians report that false negatives on pediatric pneumonia carry severe clinical danger, while false alarms cause triage delays.',
      requiredDeliverables: [
        'Mechanistic explanation of why DenseNet-121 feature concatenation prevented overfitting compared to ResNet-50 residual summation.',
        'Formal defense of your validation split methodology proving patient-level zero-leakage.',
        'Specific trade-off analysis: latency vs memory vs sensitivity thresholding under clinical operational constraints.'
      ],
      technicalConstraints: [
        'Must reference the v2.1-aiml rubric dimensions.',
        'Must justify the exact loss and metric calibration (ROC-AUC vs PR-AUC).',
        'Must specify explicit failure modes or out-of-distribution risks.'
      ],
      rubricVersion: 'v2.1-aiml'
    },
    presetDraft: {
      predictedScore: 2,
      predictionConfidence: 'moderate',
      predictionRationale: 'I understand why DenseNet reduces parameters through concatenation, but I have not yet detailed clinical threshold calibration.',
      firstAnswer: `In our project, we chose DenseNet-121 over ResNet-50 because DenseNet connects all preceding layer feature maps via concatenation (x_l = H_l([x_0, x_1, ... x_{l-1}])), rather than identity summation. This encouraged repetitive feature reuse without needing wide channels, reducing parameters from 25.6M to 7.0M. On a dataset of only ~5,800 images, ResNet-50 was prone to memorizing training artifacts.

For validation, we performed patient-level stratified splitting. Chest X-ray datasets frequently contain multiple scans per patient taken days apart; standard random train/test splits cause severe data leakage because the model learns patient-specific anatomy rather than pathology. We grouped by patient ID before splitting 70/15/15.

We tuned focal loss to penalize false negatives more heavily because missing pneumonia in a child is medically unacceptable. We achieved a 0.941 ROC-AUC.`,
      followUpAnswer1: `If hospital workstations lack high-VRAM GPUs, DenseNet-121 can face memory bottlenecks during backpropagation due to feature map retention, but at inference time memory overhead is minimal (sub-35MB weights). However, concatenation does increase memory bandwidth usage compared to depthwise separable convolutions (like MobileNetV3). If edge workstations are strictly CPU-bound, MobileNetV3 with INT8 quantization would be our fallback architecture, accepting a minor 0.015 drop in ROC-AUC for 3x throughput.`,
      followUpAnswer2: `Because class imbalance was roughly 3:1 (pneumonia to normal), ROC-AUC alone can be overly optimistic due to true negative counts. We therefore monitored the Precision-Recall AUC (PR-AUC = 0.962) and set our operational classification threshold using Youden's J statistic, prioritizing high sensitivity (93.2%) while maintaining clinical specificity above 85% to prevent radiologist alert fatigue.`,
      chosenNextStepId: 'option_a',
      revisedAnswer: `In our project, we chose DenseNet-121 over ResNet-50 because DenseNet connects all preceding layer feature maps via concatenation (x_l = H_l([x_0, x_1, ... x_{l-1}])), rather than identity summation. This encouraged repetitive feature reuse without needing wide channels, reducing parameters from 25.6M to 7.0M.

Validation Leakage Defense:
Chest X-ray datasets frequently contain multiple scans per patient taken days apart; standard random train/test splits cause severe data leakage because the model learns patient-specific anatomy rather than pathology. We grouped by patient ID before splitting 70/15/15.

Clinical Trade-offs & Operational Calibration:
1. Metric Rigor: Rather than relying solely on global ROC-AUC, we monitored PR-AUC (0.962) and set our operational classification threshold using Youden's J statistic at 0.38 to balance sensitivity (93.2%) against clinical specificity (86.4%), avoiding radiologist alert fatigue.
2. Hardware Constraints: While concatenation increases memory bandwidth, at inference with batch size 1 on an Intel Xeon CPU the model runs in 42ms. For edge deployment with sub-20MB RAM budgets, INT8 post-training quantization via TorchScript reduced footprint from 35MB to 18MB with under 0.008 ROC-AUC loss.`
    },
    initialAssessment: {
      overallScore: 2.0,
      normalizedPercentage: 67,
      dimensionScores: [
        {
          dimensionId: 'problem_framing',
          dimensionName: 'Problem Framing & Task Formulation',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Frames binary diagnostic classification and parameter reduction constraints.',
          evidenceQuote: 'reducing parameters from 25.6M to 7.0M. On a dataset of only ~5,800 images, ResNet-50 was prone to memorizing training artifacts.',
          isQuoteVerified: true,
          unsupportedAreas: 'Did not specify operational decision threshold or baseline heuristic comparison.'
        },
        {
          dimensionId: 'decision_quality',
          dimensionName: 'Architectural & Technical Decision Quality',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Provides sound architectural reason for DenseNet feature concatenation over additive shortcuts.',
          evidenceQuote: 'DenseNet connects all preceding layer feature maps via concatenation (x_l = H_l([x_0, x_1, ... x_{l-1}])), rather than identity summation.',
          isQuoteVerified: true,
          unsupportedAreas: 'Lacked contrast with edge-specific architectures such as MobileNetV3.'
        },
        {
          dimensionId: 'tradeoff_navigation',
          dimensionName: 'Trade-off & Constraint Navigation',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Acknowledges asymmetric clinical cost of false negatives.',
          evidenceQuote: 'We tuned focal loss to penalize false negatives more heavily because missing pneumonia in a child is medically unacceptable.',
          isQuoteVerified: true,
          unsupportedAreas: 'Omitted hardware latency, CPU/VRAM budgets, and threshold calibration.'
        },
        {
          dimensionId: 'verification_rigor',
          dimensionName: 'Verification, Validation & Metrics Rigor',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Explains patient-grouped stratification to prevent high-risk clinical leakage.',
          evidenceQuote: 'grouped by patient ID before splitting 70/15/15',
          isQuoteVerified: true,
          unsupportedAreas: 'Relied on ROC-AUC without discussing PR-AUC or calibration curves under class imbalance.'
        }
      ],
      demonstratedSummary: [
        'Accurately formulated DenseNet concatenation mechanics vs ResNet addition.',
        'Implemented patient-level grouping to eliminate anatomical leakage across splits.'
      ],
      unsupportedSummary: [
        'Hardware inference latency and VRAM limits on edge workstations were unquantified.',
        'Clinical decision threshold calibration was absent from the initial submission.'
      ],
      strategyImprovement: 'Bridge architectural math with edge deployment limits: quantify latency/memory budgets and calibrate decision thresholds against operational costs.',
      adaptiveFollowUps: [
        {
          id: 'follow_up_1',
          question: 'DenseNet concatenation is known for high memory bandwidth consumption during tensor caching. If the workstation has no discrete GPU, what exact fallback architecture or quantization would you deploy, and what accuracy sacrifice would you accept?',
          intent: 'Explore edge inference latency and memory tradeoffs.'
        },
        {
          id: 'follow_up_2',
          question: 'In imbalanced medical screening, ROC-AUC can be overly optimistic due to large true negatives. How did you calibrate your decision threshold to balance sensitivity against radiologist alert fatigue, and did you evaluate PR-AUC?',
          intent: 'Explore operational metric calibration and class imbalance verification.'
        }
      ],
      nextSteps: [
        {
          id: 'option_a',
          title: 'Deepen Edge Deployment Constraints & Operational Calibration',
          focusArea: 'Trade-off Navigation & Decision Thresholding',
          description: 'Incorporate edge quantization (INT8/TorchScript) and formal threshold calibration (Youden index/PR-AUC) directly into your core defense.',
          recommendedGuidance: 'Quantify the CPU latency budget and the PR-AUC trade-off curve.'
        },
        {
          id: 'option_b',
          title: 'Strengthen Out-of-Distribution & Robustness Testing',
          focusArea: 'Verification & Empirical Validation Rigor',
          description: 'Detail slice-based evaluation, external hospital dataset testing, and radiologist Grad-CAM alignment.',
          recommendedGuidance: 'Explain how you test whether the model overfits to hospital-specific scanner artifacts.'
        }
      ],
      critiqueUptake: null // Strictly unobserved on attempt 1
    },
    revisionEvaluation: {
      initialOverallScore: 2.0,
      revisedOverallScore: 2.75,
      scoreDelta: 0.75,
      label: 'Evidence change on this task',
      dimensionDeltas: [
        {
          dimensionId: 'problem_framing',
          dimensionName: 'Problem Framing & Task Formulation',
          initialScore: 2,
          revisedScore: 3,
          evidenceQuote: 'set our operational classification threshold using Youden\'s J statistic at 0.38 to balance sensitivity (93.2%) against clinical specificity (86.4%), avoiding radiologist alert fatigue.',
          isQuoteVerified: true,
          evidenceDelta: 'Anchored task formulation to operational Youden thresholding and clinician alert bounds.'
        },
        {
          dimensionId: 'decision_quality',
          dimensionName: 'Architectural & Technical Decision Quality',
          initialScore: 2,
          revisedScore: 3,
          evidenceQuote: 'INT8 post-training quantization via TorchScript reduced footprint from 35MB to 18MB with under 0.008 ROC-AUC loss.',
          isQuoteVerified: true,
          evidenceDelta: 'Added mechanistic defense of INT8 TorchScript quantization pipeline for low-power edge radiology.'
        },
        {
          dimensionId: 'tradeoff_navigation',
          dimensionName: 'Trade-off & Constraint Navigation',
          initialScore: 2,
          revisedScore: 2,
          evidenceQuote: 'at inference with batch size 1 on an Intel Xeon CPU the model runs in 42ms.',
          isQuoteVerified: true,
          evidenceDelta: 'Quantified 42ms CPU inference budget and 18MB RAM limit.'
        },
        {
          dimensionId: 'verification_rigor',
          dimensionName: 'Verification, Validation & Metrics Rigor',
          initialScore: 2,
          revisedScore: 3,
          evidenceQuote: 'monitored PR-AUC (0.962) and set our operational classification threshold using Youden\'s J statistic at 0.38',
          isQuoteVerified: true,
          evidenceDelta: 'Integrated PR-AUC metric defense alongside zero-leakage patient-id partition proofs.'
        }
      ],
      chosenNextStepTitle: 'Deepen Edge Deployment Constraints & Operational Calibration',
      nextStepApplicationCritique: 'The student directly applied Option A, integrating INT8 TorchScript quantization and Youden index threshold calibration with explicit quotes.',
      critiqueUptake: {
        score: 3,
        anchorLabel: 'Exemplary',
        evidenceQuote: 'set our operational classification threshold using Youden\'s J statistic at 0.38 to balance sensitivity (93.2%) against clinical specificity (86.4%)',
        critique: 'Successfully converted critique on missing threshold calibration into verified, operational metric evidence.'
      },
      verifiedCompetencies: [
        'DenseNet-121 feature concatenation mechanics and parameter reduction defense',
        'Patient-grouped cross-partition leakage prevention on medical scans',
        'Imbalanced data optimization using Focal Loss and PR-AUC calibration',
        'Edge quantization (INT8 TorchScript) with measured CPU latency'
      ],
      synthesis: 'The revision exhibits measurable evidence progression on this task, transitioning from theoretical architectural knowledge to defensible deployment trade-offs.',
      evidenceDisclaimer: 'A literal quote is evidence of what was written, not proof of technical correctness or code execution.',
      ownershipDisclaimer: 'Practice on this grounded task demonstrated · Not hiring screening or general skill certification · The student owns this feedback.'
    }
  },
  'data-analyst-intern': {
    roleId: 'data-analyst-intern',
    sampleInput: `Project: B2B SaaS Customer Retention & Churn Attribution Engine
Replaced monolithic manual SQL queries with a modular dbt transformation layer, building a star-schema fact table fact_subscription_events and dimension dim_customers with surrogate keys.
Used SQL window functions to calculate trailing 30-day net revenue retention (NRR) and identify contraction vs churn.
Conducted Kaplan-Meier survival analysis discovering teams activating Slack integration within 14 days had a 38% lower 6-month churn hazard ratio.`,
    claims: [
      {
        id: 'claim-da-1',
        projectTitle: 'B2B SaaS Retention Engine',
        verbatimQuote: 'Replaced monolithic manual SQL queries with a modular dbt transformation layer, building a star-schema fact table fact_subscription_events and dimension dim_customers with surrogate keys to avoid row fanout on 1-to-many subscription upgrades.',
        toolsMentioned: ['dbt', 'PostgreSQL', 'Snowflake'],
        technicalDecision: 'Architected modular dbt dimensional models with surrogate keys to eliminate row fanout during subscription tier changes.',
        claimedOutcome: 'Guaranteed deterministic aggregation grain and eliminated duplicate revenue reporting.',
        groundingConfidence: 'high'
      }
    ],
    task: {
      id: 'task-da-1',
      roleId: 'data-analyst-intern',
      projectTitle: 'B2B SaaS Retention Engine',
      quotedTool: 'dbt and SQL Window Functions (SUM OVER / LAG)',
      quotedDecision: 'Built star-schema fact_subscription_events with surrogate keys and window functions to compute 30-day trailing NRR without row fanout.',
      verbatimSource: 'Replaced monolithic manual SQL queries with a modular dbt transformation layer, building a star-schema fact table fact_subscription_events and dimension dim_customers with surrogate keys to avoid row fanout on 1-to-many subscription upgrades.',
      taskTitle: 'Defend Granularity, Data Contracts, and Churn Attribution Against Upstream Inconsistencies',
      scenarioDescription: 'Finance reports a $420,000 discrepancy between billing Stripe events and your dbt Net Revenue Retention metrics. Simultaneously, the VP of Sales questions whether the 38% churn reduction linked to Slack integration is causal or merely selection bias.',
      requiredDeliverables: [
        'Detailed explanation of table grain and join logic preventing row fanout when a single account upgrades mid-month.',
        'Definition of the Net Revenue Retention mathematical formula including handling of paused, refunded, and downgraded subscriptions.',
        'Statistical defense: how you controlled for confounding variables (e.g., account size, company maturity) in the Slack integration survival analysis.'
      ],
      technicalConstraints: [
        'Must reference the v2.1-data rubric dimensions.',
        'Must specify window function partition keys and ordering.',
        'Must provide concrete business recommendations based on the findings.'
      ],
      rubricVersion: 'v2.1-data'
    },
    presetDraft: {
      predictedScore: 2,
      predictionConfidence: 'moderate',
      predictionRationale: 'I know the dbt surrogate key grain logic well, but need to formalize confounder adjustments.',
      firstAnswer: `To resolve row fanout, our dbt model creates a surrogate key combining subscription_id and change_timestamp. When accounts upgrade, we assign a valid_from and valid_to window. In fact_subscription_events, each row represents an immutable billing state.

We calculated NRR using SQL window functions:
NRR = (Starting MRR + Expansion MRR - Contraction MRR - Churn MRR) / Starting MRR.
We partitioned by customer_id and used LAG to find the prior month MRR.

For the Slack integration correlation, we used Kaplan-Meier survival curves. Accounts with Slack integration churned 38% less.`,
      followUpAnswer1: `To reconcile the $420,000 difference with Stripe billing, we identified that Stripe logs pending and failed invoice retries as active until day 14 of dunning. In our dbt model, we added an invoice_status = 'paid' predicate and aligned the accounting cutoff to midnight UTC rather than local browser timestamps.`,
      followUpAnswer2: `To prove that the 38% churn drop wasn't just selection bias (larger companies adopting Slack anyway), we ran a multivariate Cox Proportional Hazards regression controlling for team seat count, industry vertical, and onboarding engagement score. The hazard ratio remained statistically significant (HR = 0.67, 95% CI [0.54, 0.83], p = 0.003).`,
      chosenNextStepId: 'option_b',
      revisedAnswer: `Table Grain & Join Architecture:
To prevent row fanout during mid-cycle subscription tier changes, we modeled fact_subscription_events at the grain of (subscription_id, effective_change_timestamp) using dbt surrogate keys. We implemented Type-2 Slowly Changing Dimensions with valid_from and coalesce(valid_to, '9999-12-31'). When joining to dim_customers, we joined strictly on customer_surrogate_key within active timestamp ranges, eliminating duplicate billing rows.

Metric Formulation & Stripe Reconciliation:
We defined Net Revenue Retention (NRR) strictly over a normalized 30-day cohort:
NRR = (MRR_start + Expansion - Contraction - Churn) / MRR_start.
We resolved the $420k Stripe discrepancy by adding an invoice_status = 'paid' predicate and standardizing cutoff boundaries to midnight UTC.

Statistical Defense Against Confounding:
To verify whether the 38% churn reduction from Slack integration was causal or confounded by company size, we ran a multivariate Cox Proportional Hazards regression controlling for team seat count, ARR tier, and days to first active login. Even after adjusting for account scale, Slack integration retained a significant protective effect (Hazard Ratio = 0.67, 95% CI [0.54, 0.83], p = 0.003). We recommended product onboarding prioritize Slack setup in Step 2.`
    },
    initialAssessment: {
      overallScore: 2.0,
      normalizedPercentage: 67,
      dimensionScores: [
        {
          dimensionId: 'problem_framing',
          dimensionName: 'Problem Framing & Metric Formulation',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Frames NRR mathematical formula and cohort tracking approach.',
          evidenceQuote: 'NRR = (Starting MRR + Expansion MRR - Contraction MRR - Churn MRR) / Starting MRR.',
          isQuoteVerified: true,
          unsupportedAreas: 'Did not address dunning states, failed payments, or invoice cutoff dates.'
        },
        {
          dimensionId: 'decision_quality',
          dimensionName: 'Architectural & Technical Decision Quality',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Surrogate key usage prevents basic duplicate fanout on subscription upgrades.',
          evidenceQuote: 'creates a surrogate key combining subscription_id and change_timestamp. When accounts upgrade, we assign a valid_from and valid_to window.',
          isQuoteVerified: true,
          unsupportedAreas: 'Lacked formal SCD2 SQL syntax or data contract tests.'
        },
        {
          dimensionId: 'tradeoff_navigation',
          dimensionName: 'Trade-off & Constraint Navigation',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Tracks immutable billing intervals across upgrades.',
          evidenceQuote: 'In fact_subscription_events, each row represents an immutable billing state.',
          isQuoteVerified: true,
          unsupportedAreas: 'Did not reconcile against external Stripe billing logs.'
        },
        {
          dimensionId: 'verification_rigor',
          dimensionName: 'Verification, Validation & Metrics Rigor',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Mentions Kaplan-Meier survival curves for customer churn.',
          evidenceQuote: 'For the Slack integration correlation, we used Kaplan-Meier survival curves. Accounts with Slack integration churned 38% less.',
          isQuoteVerified: true,
          unsupportedAreas: 'Did not control for company size confounder or report confidence intervals.'
        }
      ],
      demonstratedSummary: [
        'Correctly formulated NRR with expansion, contraction, and churn components.',
        'Proper intuition regarding surrogate keys and immutable billing events.'
      ],
      unsupportedSummary: [
        'Did not address financial reconciliation or dunning state rules.',
        'Causal inference was unsupported (confounded correlation).'
      ],
      strategyImprovement: 'Address data contract reconciliation with upstream billing APIs and defend statistical causality with multivariate regression.',
      adaptiveFollowUps: [
        {
          id: 'follow_up_1',
          question: 'How exactly would you audit and reconcile the $420,000 discrepancy between Stripe billing logs and your dbt model (e.g. dunning, timezone boundaries, refund handling)?',
          intent: 'Explore financial data reconciliation and upstream data contracts.'
        },
        {
          id: 'follow_up_2',
          question: 'Bigger companies naturally both adopt integrations and churn less. How did you rule out company size as a confounding factor in your Slack retention analysis?',
          intent: 'Explore statistical causal inference and confounder control.'
        }
      ],
      nextSteps: [
        {
          id: 'option_a',
          title: 'Strengthen Data Modeling & Pipeline Data Contracts',
          focusArea: 'Architectural & Technical Decision Quality',
          description: 'Detail the SCD2 schema, surrogate key generation macros in dbt, and automated uniqueness tests.',
          recommendedGuidance: 'Specify how your dbt tests prevent future revenue reporting drift.'
        },
        {
          id: 'option_b',
          title: 'Deepen Causal Inference & Financial Reconciliation',
          focusArea: 'Verification & Empirical Validation Rigor',
          description: 'Incorporate your Cox regression hazard ratio findings and Stripe dunning reconciliation directly into your revised defense.',
          recommendedGuidance: 'Include 95% confidence intervals and p-values alongside the operational recommendation.'
        }
      ],
      critiqueUptake: null // Strictly unobserved on attempt 1
    },
    revisionEvaluation: {
      initialOverallScore: 2.0,
      revisedOverallScore: 2.75,
      scoreDelta: 0.75,
      label: 'Evidence change on this task',
      dimensionDeltas: [
        {
          dimensionId: 'problem_framing',
          dimensionName: 'Problem Framing & Metric Formulation',
          initialScore: 2,
          revisedScore: 3,
          evidenceQuote: 'resolved the $420k Stripe discrepancy by adding an invoice_status = \'paid\' predicate and standardizing cutoff boundaries to midnight UTC.',
          isQuoteVerified: true,
          evidenceDelta: 'Standardized UTC cutoff rules and invoice status predicates to resolve financial discrepancies.'
        },
        {
          dimensionId: 'decision_quality',
          dimensionName: 'Architectural & Technical Decision Quality',
          initialScore: 2,
          revisedScore: 2,
          evidenceQuote: 'implemented Type-2 Slowly Changing Dimensions with valid_from and coalesce(valid_to, \'9999-12-31\').',
          isQuoteVerified: true,
          evidenceDelta: 'Documented SCD2 validity windows and surrogate key join boundaries.'
        },
        {
          dimensionId: 'tradeoff_navigation',
          dimensionName: 'Trade-off & Constraint Navigation',
          initialScore: 2,
          revisedScore: 3,
          evidenceQuote: 'reconciled the $420k Stripe discrepancy by adding an invoice_status = \'paid\' predicate',
          isQuoteVerified: true,
          evidenceDelta: 'Explicit handling of dunning states and billing cutoff latency.'
        },
        {
          dimensionId: 'verification_rigor',
          dimensionName: 'Verification, Validation & Metrics Rigor',
          initialScore: 2,
          revisedScore: 3,
          evidenceQuote: 'multivariate Cox Proportional Hazards regression controlling for team seat count, ARR tier, and days to first active login. Even after adjusting for account scale, Slack integration retained a significant protective effect (Hazard Ratio = 0.67, 95% CI [0.54, 0.83], p = 0.003).',
          isQuoteVerified: true,
          evidenceDelta: 'Proved causality with multivariate Cox Proportional Hazards regression.'
        }
      ],
      chosenNextStepTitle: 'Deepen Causal Inference & Financial Reconciliation',
      nextStepApplicationCritique: 'The student directly applied Option B, incorporating Cox regression hazard ratios and Stripe status predicates with verified quotes.',
      critiqueUptake: {
        score: 3,
        anchorLabel: 'Exemplary',
        evidenceQuote: 'Cox Proportional Hazards regression controlling for team seat count, ARR tier, and days to first active login',
        critique: 'Successfully resolved critique on confounding bias by executing multivariate survival analysis.'
      },
      verifiedCompetencies: [
        'SCD2 dimensional modeling and surrogate key design in dbt',
        'Complex financial metric formulation (NRR, dunning, and cohort churn)',
        'Cross-system data reconciliation against third-party billing APIs',
        'Multivariate survival analysis and confounder control in Python'
      ],
      synthesis: 'The revision demonstrates measurable evidence progression on this task, progressing from descriptive SQL to statistical causal modeling.',
      evidenceDisclaimer: 'A literal quote is evidence of what was written, not proof of technical correctness or code execution.',
      ownershipDisclaimer: 'Practice on this grounded task demonstrated · Not hiring screening or general skill certification · The student owns this feedback.'
    }
  },
  'frontend-dev-intern': {
    roleId: 'frontend-dev-intern',
    sampleInput: `Project: High-Throughput Accessible Financial Data Grid
Decided to adopt TanStack Virtual windowing instead of standard pagination or infinite scrolling, rendering only the ~35 DOM nodes visible in the viewport, which reduced initial DOM memory footprint from 84MB to 6.2MB.
Architected a custom keyboard roving tabindex navigation system following WAI-ARIA grid patterns.
Avoided unnecessary re-renders during high-frequency WebSocket updates (50 updates/sec) by moving streaming ticker states into an isolated subscriber hook with useRef and Canvas micro-sparklines.
Automated accessibility audits using jest-axe and verified with VoiceOver screen reader, reducing Interaction to Next Paint (INP) from 180ms to 24ms.`,
    claims: [
      {
        id: 'claim-fe-1',
        projectTitle: 'Accessible Financial Data Grid',
        verbatimQuote: 'Decided to adopt TanStack Virtual windowing instead of standard pagination or infinite scrolling, rendering only the ~35 DOM nodes visible in the viewport, which reduced initial DOM memory footprint from 84MB to 6.2MB.',
        toolsMentioned: ['React 19', 'TanStack Virtual', 'TypeScript'],
        technicalDecision: 'Implemented TanStack Virtual windowing over pagination to support fluid scrolling across 100k records while restricting rendered DOM nodes to 35.',
        claimedOutcome: 'Reduced DOM memory from 84MB to 6.2MB with steady 60fps frame rates.',
        groundingConfidence: 'high'
      }
    ],
    task: {
      id: 'task-fe-1',
      roleId: 'frontend-dev-intern',
      projectTitle: 'Accessible Financial Data Grid',
      quotedTool: 'TanStack Virtual and WAI-ARIA Roving Tabindex in React 19',
      quotedDecision: 'Adopted virtual windowing (rendering 35 nodes from 100k) with roving tabindex and isolated WebSocket subscribers to cut INP from 180ms to 24ms.',
      verbatimSource: 'Decided to adopt TanStack Virtual windowing instead of standard pagination or infinite scrolling, rendering only the ~35 DOM nodes visible in the viewport, which reduced initial DOM memory footprint from 84MB to 6.2MB.',
      taskTitle: 'Defend Accessible Grid Focus Management and High-Frequency Render Isolation',
      scenarioDescription: 'During high market volatility, the WebSocket feeds 80 updates per second while screen reader users navigate price matrices. A team member proposes pushing all price updates into top-level React context, causing sluggish keyboard responsiveness.',
      requiredDeliverables: [
        'Component architecture diagram & data flow explaining how cell renders are decoupled from streaming socket state.',
        'WAI-ARIA grid specification: roving tabindex mechanics, aria-rowindex calculation for virtualized rows, and focus preservation during scrolling.',
        'Web performance breakdown: measuring Interaction to Next Paint (INP) and avoiding layout thrashing.'
      ],
      technicalConstraints: [
        'Must reference the v2.1-fedev rubric dimensions.',
        'Must explain why top-level Context causes frame drops.',
        'Must include automated testing strategy with jest-axe and screen reader verification.'
      ],
      rubricVersion: 'v2.1-fedev'
    },
    presetDraft: {
      predictedScore: 2,
      predictionConfidence: 'moderate',
      predictionRationale: 'I know how virtualization works and how to avoid re-rendering the whole table, but I want to make sure my ARIA roving tabindex logic is formally explained.',
      firstAnswer: `Pushing 80 WebSocket updates per second into top-level Context would force every consumer component to re-render, blocking the browser main thread and spiking INP. Instead, we use an event-driven pub-sub pattern where individual cells subscribe directly to their stock symbol via a custom hook and update via refs or local state.

For virtualization, TanStack Virtual calculates the visible window offsets and renders ~35 row divs. We use a roving tabindex so only the active cell has tabindex="0" and others have tabindex="-1". Users can navigate with arrow keys.`,
      followUpAnswer1: `When virtual scrolling unmounts rows, screen readers lose focus if the focused cell leaves the viewport. To solve this, we track the focused coordinate (rowId, colIndex) in a persistent state machine outside the DOM. If the user scrolls or navigates, TanStack Virtual's scrollToIndex ensures the target row is rendered before focus() is invoked, and aria-rowindex / aria-colindex accurately announce position in the full 100k set.`,
      followUpAnswer2: `To maintain sub-25ms INP during rapid market updates, we wrapped secondary UI updates in React 19 startTransition and batched canvas sparkline redraws using requestAnimationFrame. We measured INP with the Web Vitals extension and validated zero accessibility regressions using jest-axe in CI.`,
      chosenNextStepId: 'option_a',
      revisedAnswer: `Architecture & Render Isolation:
Pushing 80 updates/sec into top-level Context causes catastrophic frame drops because React Context triggers re-evaluation for every subscribed component in the tree, causing frequent garbage collection and pushing INP past 180ms.
To isolate rendering:
1. Data Layer: The WebSocket stream writes to an in-memory mutable store. Individual cell components subscribe strictly to their symbol's channel via useSyncExternalStore or a targeted subscriber hook.
2. Canvas Micro-Sparklines: High-frequency price curves are drawn on direct HTML5 canvas contexts scheduled via requestAnimationFrame, completely bypassing the React reconciliation engine. Non-urgent state transitions use React 19 startTransition to keep the main thread responsive.

Virtualization & WAI-ARIA Focus State Machine:
Virtualizing rows presents a critical accessibility challenge: if a row scrolls out of the DOM, browser focus collapses to document.body.
1. Roving Tabindex: We implemented a persistent focus coordinator. The active cell holds tabIndex={0} while all others hold tabIndex={-1}.
2. Focus Retention & Virtual Boundaries: When arrow keys traverse beyond the visible 35-row window, our keyboard handler calls virtualizer.scrollToIndex(targetRow) synchronously before focusing the newly mounted DOM node in requestAnimationFrame.
3. Screen Reader Semantics: Virtualized rows include role="row" aria-rowindex={actualIndex + 1} and role="gridcell" aria-colindex={col + 1}, giving screen reader users accurate position awareness within the 100,000 dataset without needing the entire dataset in the DOM.

Verification & Core Web Vitals:
We proved compliance via automated CI axe-core accessibility tests, manual VoiceOver/NVDA matrix traversal, and Chrome DevTools performance profiling, confirming stable 60fps scrolling and an INP of 24ms.`
    },
    initialAssessment: {
      overallScore: 2.0,
      normalizedPercentage: 67,
      dimensionScores: [
        {
          dimensionId: 'problem_framing',
          dimensionName: 'Problem Framing & Component Architecture',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Identified React context re-render bottleneck and subscriber pattern.',
          evidenceQuote: 'Pushing 80 WebSocket updates per second into top-level Context would force every consumer component to re-render, blocking the browser main thread and spiking INP.',
          isQuoteVerified: true,
          unsupportedAreas: 'Did not specify useSyncExternalStore or scheduling boundaries.'
        },
        {
          dimensionId: 'decision_quality',
          dimensionName: 'Architectural & Technical Decision Quality',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Implemented roving tabindex and TanStack Virtualization.',
          evidenceQuote: 'roving tabindex so only the active cell has tabindex="0" and others have tabindex="-1". Users can navigate with arrow keys.',
          isQuoteVerified: true,
          unsupportedAreas: 'Lacked formal focus restoration mechanism when virtual nodes unmount.'
        },
        {
          dimensionId: 'tradeoff_navigation',
          dimensionName: 'Trade-off & Constraint Navigation',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Constrains DOM nodes to visible window.',
          evidenceQuote: 'TanStack Virtual calculates the visible window offsets and renders ~35 row divs.',
          isQuoteVerified: true,
          unsupportedAreas: 'Needs details on requestAnimationFrame scheduling or concurrent transitions.'
        },
        {
          dimensionId: 'verification_rigor',
          dimensionName: 'Verification, Validation & Metrics Rigor',
          score: 2,
          anchorMatched: 'Competent (Score 2)',
          observation: 'Understands keyboard navigation constraints.',
          evidenceQuote: 'Users can navigate with arrow keys.',
          isQuoteVerified: true,
          unsupportedAreas: 'Lacked automated accessibility assertions and screen reader aria-rowindex verification.'
        }
      ],
      demonstratedSummary: [
        'Correct diagnosis of React Context performance degradation in streaming dashboards.',
        'Proper adoption of roving tabindex mechanics for grid navigation.'
      ],
      unsupportedSummary: [
        'Focus collapse during virtual DOM unmounting was unaddressed.',
        'Automated accessibility and Core Web Vitals testing protocols were missing.'
      ],
      strategyImprovement: 'Solve focus preservation when virtual DOM nodes unmount by coordinating scrollToIndex with aria-rowindex semantics and measuring INP.',
      adaptiveFollowUps: [
        {
          id: 'follow_up_1',
          question: 'When a user navigates via keyboard past the 35 rendered rows, the target DOM node does not exist yet. How do you prevent focus from collapsing to the document body?',
          intent: 'Explore virtual DOM focus preservation and WAI-ARIA grid mechanics.'
        },
        {
          id: 'follow_up_2',
          question: 'How did you schedule 80 updates per second without dropping frames, and what specific tools did you use to measure Interaction to Next Paint (INP)?',
          intent: 'Explore browser main-thread scheduling and Core Web Vitals profiling.'
        }
      ],
      nextSteps: [
        {
          id: 'option_a',
          title: 'Deepen Virtual Focus Management & Browser Main-Thread Scheduling',
          focusArea: 'Architectural & Technical Decision Quality',
          description: 'Detail your scrollToIndex focus synchronization, aria-rowindex calculation, and requestAnimationFrame canvas rendering.',
          recommendedGuidance: 'Explain how startTransition and useSyncExternalStore protect the main thread.'
        },
        {
          id: 'option_b',
          title: 'Formalize Automated Accessibility & Performance Testing Rigor',
          focusArea: 'Verification, Validation & Metrics Rigor',
          description: 'Specify your automated axe-core test suite, screen reader test protocols, and Lighthouse INP benchmarks.',
          recommendedGuidance: 'Document specific assertions for roving tabindex and keyboard focus traps.'
        }
      ],
      critiqueUptake: null // Strictly unobserved on attempt 1
    },
    revisionEvaluation: {
      initialOverallScore: 2.0,
      revisedOverallScore: 2.75,
      scoreDelta: 0.75,
      label: 'Evidence change on this task',
      dimensionDeltas: [
        {
          dimensionId: 'problem_framing',
          dimensionName: 'Problem Framing & Component Architecture',
          initialScore: 2,
          revisedScore: 3,
          evidenceQuote: 'Data Layer: The WebSocket stream writes to an in-memory mutable store. Individual cell components subscribe strictly to their symbol\'s channel via useSyncExternalStore',
          isQuoteVerified: true,
          evidenceDelta: 'Integrated decoupled subscriber store (useSyncExternalStore) and direct canvas contexts.'
        },
        {
          dimensionId: 'decision_quality',
          dimensionName: 'Architectural & Technical Decision Quality',
          initialScore: 2,
          revisedScore: 3,
          evidenceQuote: 'When arrow keys traverse beyond the visible 35-row window, our keyboard handler calls virtualizer.scrollToIndex(targetRow) synchronously before focusing the newly mounted DOM node in requestAnimationFrame.',
          isQuoteVerified: true,
          evidenceDelta: 'Built robust focus coordinator pairing scrollToIndex with requestAnimationFrame.'
        },
        {
          dimensionId: 'tradeoff_navigation',
          dimensionName: 'Trade-off & Constraint Navigation',
          initialScore: 2,
          revisedScore: 2,
          evidenceQuote: 'Non-urgent state transitions use React 19 startTransition to keep the main thread responsive.',
          isQuoteVerified: true,
          evidenceDelta: 'Leveraged startTransition to avoid blocking the main thread.'
        },
        {
          dimensionId: 'verification_rigor',
          dimensionName: 'Verification, Validation & Metrics Rigor',
          initialScore: 2,
          revisedScore: 3,
          evidenceQuote: 'automated CI axe-core accessibility tests, manual VoiceOver/NVDA matrix traversal, and Chrome DevTools performance profiling, confirming stable 60fps scrolling and an INP of 24ms.',
          isQuoteVerified: true,
          evidenceDelta: 'Automated CI axe-core testing and verified 24ms INP.'
        }
      ],
      chosenNextStepTitle: 'Deepen Virtual Focus Management & Browser Main-Thread Scheduling',
      nextStepApplicationCritique: 'The student directly applied Option A, implementing scrollToIndex focus synchronization and requestAnimationFrame scheduling with exact quotes.',
      critiqueUptake: {
        score: 3,
        anchorLabel: 'Exemplary',
        evidenceQuote: 'calls virtualizer.scrollToIndex(targetRow) synchronously before focusing the newly mounted DOM node in requestAnimationFrame.',
        critique: 'Masterfully resolved focus collapse critique in virtualized DOM lists.'
      },
      verifiedCompetencies: [
        'TanStack Virtual DOM windowing with scroll-to-index focus recovery',
        'WAI-ARIA grid standard compliance (roving tabindex, aria-rowindex)',
        'Decoupled WebSocket state management with useSyncExternalStore',
        'Main-thread optimization with startTransition and measured 24ms INP'
      ],
      synthesis: 'The revision demonstrates measurable evidence progression on this task, solving complex virtual DOM accessibility and frame pacing challenges.',
      evidenceDisclaimer: 'A literal quote is evidence of what was written, not proof of technical correctness or code execution.',
      ownershipDisclaimer: 'Practice on this grounded task demonstrated · Not hiring screening or general skill certification · The student owns this feedback.'
    }
  }
};
