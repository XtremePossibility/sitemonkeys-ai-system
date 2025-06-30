// SITE MONKEYS VAULT SYSTEM - PRODUCTION
// Version: PROD-1.0

// CORE SITE MONKEYS BUSINESS LOGIC
export const SITE_MONKEYS_VAULT = {
  vault_id: "SM-PROD-v1.0",
  business_context: "early_stage_saas_validation_phase",
  
  // FINANCIAL CONSTRAINTS (ALWAYS ENFORCED)
  financial_framework: {
    launch_budget: {
      target: 15000,
      hard_cap: 20000,
      current_spent: 0 // This would be updated dynamically
    },
    monthly_burn: {
      target: 3000,
      maximum: 4000
    },
    pricing_tiers: {
      boost: { price: 697, margin_target: 0.87 },
      climb: { price: 1497, margin_target: 0.87 },
      lead: { price: 2997, margin_target: 0.87 }
    },
    margin_requirements: {
      target: 0.87, // 87%
      minimum: 0.75 // 75%
    }
  },
  
  // OPERATIONAL STANDARDS
  operational_framework: {
    delivery_standards: {
      uptime_target: 0.998, // 99.8%
      uptime_minimum: 0.970, // 97.0%
      zero_failure_required: true,
      quality_assurance_mandatory: true
    },
    founder_protection: {
      max_decision_fatigue_score: 7, // Out of 10
      cognitive_load_monitoring: true,
      time_optimization_priority: "high"
    },
    brand_positioning: {
      tagline: "Overlooked to Overbooked",
      premium_positioning_required: true,
      no_undercutting_allowed: true
    }
  },
  
  // DECISION FRAMEWORKS
  decision_frameworks: {
    pricing_strategy: {
      triggers: ["price", "pricing", "cost", "revenue", "monetization", "subscription", "tier"],
      logic_tree: {
        step_1: "Validate against established tiers (Boost/Climb/Lead)",
        step_2: "Calculate total cost of ownership including hidden costs",
        step_3: "Ensure margin requirements (87% target, 75% minimum)",
        step_4: "Justify premium positioning with value delivery",
        step_5: "Model cash flow impact over 6 months"
      },
      override_authority: "VAULT_WINS",
      violation_flags: ["undercutting", "margin_compression", "value_undermining"]
    },
    
    feature_prioritization: {
      triggers: ["feature", "development", "roadmap", "build", "functionality", "scope"],
      logic_tree: {
        step_1: "Assess immediate revenue impact (paying customers)",
        step_2: "Calculate development cost (time + contractor + opportunity)",
        step_3: "Validate market demand with evidence",
        step_4: "Evaluate technical debt and maintenance burden",
        step_5: "Prioritize: Revenue > Cost efficiency > Validation > Simplicity"
      },
      override_authority: "VAULT_WINS",
      founder_protection: "Prevent feature creep and scope expansion"
    },
    
    resource_allocation: {
      triggers: ["hire", "hiring", "spend", "invest", "budget", "contractor", "team"],
      logic_tree: {
        step_1: "Calculate runway impact (months preserved/consumed)",
        step_2: "Require measurable ROI timeline",
        step_3: "Prioritize runway extension over growth acceleration",
        step_4: "Evaluate cheaper/faster alternatives",
        step_5: "Assess founder time liberation vs. cost"
      },
      override_authority: "VAULT_WINS",
      cash_preservation_priority: true
    },
    
    market_validation: {
      triggers: ["market", "customer", "validation", "demand", "audience", "target", "competitive"],
      logic_tree: {
        step_1: "Require primary research evidence (customer conversations)",
        step_2: "Conservative market size estimation (addressable not total)",
        step_3: "Realistic customer acquisition cost modeling",
        step_4: "Competitive response probability assessment",
        step_5: "Evidence hierarchy: Primary > Reports > Assumptions"
      },
      override_authority: "MERGE_WITH_MODE",
      assumption_challenge_required: true
    },
    
    operational_decisions: {
      triggers: ["process", "workflow", "system", "tool", "efficiency", "automation"],
      logic_tree: {
        step_1: "Founder time impact analysis",
        step_2: "Quality assurance compatibility check",
        step_3: "Zero-failure delivery preservation",
        step_4: "Long-term maintenance burden assessment",
        step_5: "Premium brand alignment verification"
      },
      override_authority: "VAULT_WINS",
      quality_non_negotiable: true
    }
  },
  
  // CRITICAL ASSUMPTIONS (WITH EXPIRATION)
  assumptions: {
    market_stage: {
      value: "pre_product_market_fit",
      confidence: 0.85,
      last_validated: "2024-06-01",
      expires_after_days: 90,
      validation_triggers: ["revenue_milestone", "customer_feedback", "competitive_analysis"]
    },
    cash_runway: {
      value: "limited_bootstrap_funding",
      confidence: 0.95,
      last_validated: "2024-06-15", 
      expires_after_days: 30,
      validation_triggers: ["monthly_burn_review", "revenue_update"]
    },
    competition_level: {
      value: "established_players_exist",
      confidence: 0.90,
      last_validated: "2024-05-15",
      expires_after_days: 60,
      validation_triggers: ["competitor_analysis", "market_research"]
    }
  }
};

// VAULT ACCESS VERIFICATION
export async function verifyVaultAccess(mode, vault_requested) {
  const verification = {
    allowed: false,
    reason: "",
    vault_loaded: false,
    compatibility_check: false
  };
  
  // Only allow vault access in Site Monkeys mode
  if (mode === 'site_monkeys' && vault_requested) {
    verification.allowed = true;
    verification.vault_loaded = true;
    verification.compatibility_check = true;
    verification.reason = "Site Monkeys mode with vault access approved";
  } else if (mode !== 'site_monkeys' && vault_requested) {
    verification.allowed = false;
    verification.reason = "Vault access denied - must be in Site Monkeys mode";
  } else {
    verification.allowed = true;
    verification.reason = "Standard mode operation without vault";
  }
  
  return verification;
}

// VAULT TRIGGER DETECTION
export function checkVaultTriggers(message) {
  const triggeredFrameworks = [];
  const messageLC = message.toLowerCase();
  
  // Check each decision framework
  Object.entries(SITE_MONKEYS_VAULT.decision_frameworks).forEach(([frameworkName, framework]) => {
    const triggered = framework.triggers.some(trigger => messageLC.includes(trigger));
    if (triggered) {
      triggeredFrameworks.push({
        name: frameworkName,
        framework: framework,
        confidence: 0.8 // Default confidence for trigger detection
      });
    }
  });
  
  return triggeredFrameworks;
}

// VAULT CONTEXT GENERATION
export function generateVaultContext(triggeredFrameworks) {
  if (!triggeredFrameworks || triggeredFrameworks.length === 0) {
    return "";
  }
  
  let context = "\n=== SITE MONKEYS VAULT LOGIC ACTIVE ===\n";
  
  // Add financial constraints
  context += `
FINANCIAL CONSTRAINTS:
- Launch Budget: $${SITE_MONKEYS_VAULT.financial_framework.launch_budget.target.toLocaleString()} target, $${SITE_MONKEYS_VAULT.financial_framework.launch_budget.hard_cap.toLocaleString()} cap
- Monthly Burn: $${SITE_MONKEYS_VAULT.financial_framework.monthly_burn.target.toLocaleString()} target
- Margin Requirements: ${SITE_MONKEYS_VAULT.financial_framework.margin_requirements.target * 100}% target, ${SITE_MONKEYS_VAULT.financial_framework.margin_requirements.minimum * 100}% minimum
- Pricing Tiers: Boost $${SITE_MONKEYS_VAULT.financial_framework.pricing_tiers.boost.price}, Climb $${SITE_MONKEYS_VAULT.financial_framework.pricing_tiers.climb.price}, Lead $${SITE_MONKEYS_VAULT.financial_framework.pricing_tiers.lead.price}
`;
  
  // Add operational standards
  context += `
OPERATIONAL STANDARDS:
- Brand Positioning: "${SITE_MONKEYS_VAULT.operational_framework.brand_positioning.tagline}"
- Quality: ${SITE_MONKEYS_VAULT.operational_framework.delivery_standards.uptime_target * 100}% uptime target, Zero-failure delivery required
- Founder Protection: Cognitive load monitoring active, decision fatigue prevention
`;
  
  // Add triggered frameworks
  context += "\nTRIGGERED DECISION FRAMEWORKS:\n";
  triggeredFrameworks.forEach(tf => {
    context += `\n${tf.name.toUpperCase()}:\n`;
    Object.entries(tf.framework.logic_tree).forEach(([step, instruction]) => {
      context += `  ${step}: ${instruction}\n`;
    });
    context += `  Override Authority: ${tf.framework.override_authority}\n`;
  });
  
  context += "\n=== END VAULT LOGIC ===\n";
  
  return context;
}

// VAULT VALIDATION FUNCTIONS
export function validatePricingDecision(price, tier) {
  const violations = [];
  const recommendations = [];
  
  const tierConfig = SITE_MONKEYS_VAULT.financial_framework.pricing_tiers[tier.toLowerCase()];
  
  if (!tierConfig) {
    violations.push(`Invalid pricing tier: ${tier}`);
    return { violations, recommendations };
  }
  
  if (price < tierConfig.price) {
    violations.push(`Pricing below established ${tier} tier ($${tierConfig.price})`);
  }
  
  // Calculate implied margin (simplified)
  const estimatedCost = price * (1 - tierConfig.margin_target);
  const actualMargin = (price - estimatedCost) / price;
  
  if (actualMargin < SITE_MONKEYS_VAULT.financial_framework.margin_requirements.minimum) {
    violations.push(`Margin ${(actualMargin * 100).toFixed(1)}% below minimum ${SITE_MONKEYS_VAULT.financial_framework.margin_requirements.minimum * 100}%`);
  }
  
  if (actualMargin < SITE_MONKEYS_VAULT.financial_framework.margin_requirements.target) {
    recommendations.push(`Consider optimizing to reach ${SITE_MONKEYS_VAULT.financial_framework.margin_requirements.target * 100}% margin target`);
  }
  
  return { violations, recommendations };
}

export function validateResourceAllocation(cost, purpose, timeline) {
  const violations = [];
  const recommendations = [];
  
  // Check against budget constraints
  if (cost > SITE_MONKEYS_VAULT.financial_framework.launch_budget.target) {
    violations.push(`Cost $${cost.toLocaleString()} exceeds launch budget target $${SITE_MONKEYS_VAULT.financial_framework.launch_budget.target.toLocaleString()}`);
  }
  
  if (cost > SITE_MONKEYS_VAULT.financial_framework.launch_budget.hard_cap) {
    violations.push(`Cost $${cost.toLocaleString()} exceeds hard budget cap $${SITE_MONKEYS_VAULT.financial_framework.launch_budget.hard_cap.toLocaleString()}`);
  }
  
  // Calculate runway impact
  const monthlyImpact = cost / timeline; // Assuming timeline in months
  if (monthlyImpact > SITE_MONKEYS_VAULT.financial_framework.monthly_burn.target) {
    recommendations.push(`Monthly impact $${monthlyImpact.toLocaleString()} exceeds burn target. Consider phasing or alternatives.`);
  }
  
  return { violations, recommendations };
}

// ASSUMPTION HEALTH MONITORING
export function checkAssumptionHealth() {
  const warnings = [];
  const currentDate = new Date();
  
  Object.entries(SITE_MONKEYS_VAULT.assumptions).forEach(([assumptionName, assumption]) => {
    const lastValidated = new Date(assumption.last_validated);
    const daysSinceValidation = Math.floor((currentDate - lastValidated) / (1000 * 60 * 60 * 24));
    
    if (daysSinceValidation > assumption.expires_after_days) {
      warnings.push({
        assumption: assumptionName,
        status: "EXPIRED",
        days_overdue: daysSinceValidation - assumption.expires_after_days,
        confidence: assumption.confidence,
        action_required: "Validation required"
      });
    } else if (daysSinceValidation > (assumption.expires_after_days * 0.8)) {
      warnings.push({
        assumption: assumptionName,
        status: "EXPIRING_SOON", 
        days_until_expiry: assumption.expires_after_days - daysSinceValidation,
        confidence: assumption.confidence,
        action_required: "Consider validation"
      });
    }
  });
  
  return warnings;
}

// VAULT CONFLICT DETECTION
export function detectVaultConflicts(message, mode, baseResponse) {
  const conflicts = [];
  
  // Only check for conflicts in Site Monkeys mode
  if (mode !== 'site_monkeys') {
    return conflicts;
  }
  
  const triggeredFrameworks = checkVaultTriggers(message);
  
  triggeredFrameworks.forEach(tf => {
    // Check for pricing violations
    if (tf.name === 'pricing_strategy') {
      const priceMatches = baseResponse.match(/\$[\d,]+/g);
      if (priceMatches) {
        priceMatches.forEach(priceStr => {
          const price = parseInt(priceStr.replace(/[$,]/g, ''));
          if (price < SITE_MONKEYS_VAULT.financial_framework.pricing_tiers.boost.price) {
            conflicts.push({
              type: "pricing_violation",
              description: `Suggested price ${priceStr} below minimum tier`,
              framework: tf.name,
              severity: "HIGH"
            });
          }
        });
      }
    }
    
    // Check for margin discussions
    if (tf.name === 'resource_allocation' && baseResponse.toLowerCase().includes('cheap')) {
      conflicts.push({
        type: "brand_positioning_conflict",
        description: "Language inconsistent with premium positioning",
        framework: tf.name,
        severity: "MEDIUM"
      });
    }
  });
  
  return conflicts;
}
