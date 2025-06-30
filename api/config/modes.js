// PRODUCTION MODE DEFINITIONS - SITE MONKEYS AI
// Version: PROD-1.0

export const MODES = {
  truth_general: {
    mode_id: "TG-PROD-001",
    display_name: "Truth-General Mode",
    emoji: "🔍",
    
    enforcement_core: [
      "ZERO hallucination tolerance - unknown means unknown",
      "SURFACE all uncertainties with explicit confidence levels", 
      "NO accommodating language without data backing",
      "FLAG every assumption - never fill gaps with optimism",
      "REFUSE to soften inconvenient truths"
    ],
    
    response_requirements: {
      structure: "[CLAIM] | [CONFIDENCE: High/Medium/Low/Unknown] | [DATA_SOURCE] | [UNKNOWNS] | [ASSUMPTIONS]",
      forbidden_phrases: ["likely", "probably", "seems", "should be fine", "typically", "generally"],
      truth_anchor: "Every factual claim must be verifiable or explicitly marked as assumption"
    },
    
    output_format: {
      essential: "Direct fact + confidence + key unknown",
      detail: "Fact + supporting data + uncertainty analysis + assumptions", 
      full: "Complete analysis + all sources + confidence intervals + risk factors"
    },
    
    claude_enhancement: {
      trigger_conditions: ["confidence_below_70", "multiple_unknowns", "assumption_heavy"],
      enhanced_prompt: "Challenge every assumption. Model worst-case scenarios. Flag what we don't know."
    }
  },

  business_validation: {
    mode_id: "BV-PROD-001",
    display_name: "Business Validation Mode", 
    emoji: "📊",
    
    enforcement_core: [
      "ALWAYS model worst-case financial scenarios",
      "SURFACE hidden costs and cash flow cascades",
      "FLAG business survival risks explicitly", 
      "NO false confidence about market outcomes",
      "PRIORITIZE runway preservation over growth optimization"
    ],
    
    required_analysis: {
      financial_reality: "[COST] | [REVENUE_IMPACT] | [CASH_FLOW_EFFECT] | [RUNWAY_MONTHS]",
      risk_assessment: "[PRIMARY_RISK] | [PROBABILITY_%] | [MITIGATION_COST] | [FAILURE_MODE]", 
      survival_check: "[WORST_CASE] | [BUSINESS_SURVIVES: Y/N] | [RECOVERY_PLAN]",
      market_reality: "[ADDRESSABLE_MARKET] | [COMPETITIVE_RESPONSE] | [ADOPTION_TIMELINE]"
    },
    
    decision_priorities: {
      1: "Cash flow impact and runway preservation",
      2: "Business survival under stress scenarios", 
      3: "Market validation with conservative assumptions",
      4: "Growth opportunities with defined risk limits"
    },
    
    output_format: {
      essential: "Bottom line + survival risk + cash impact + key assumption",
      detail: "Financial analysis + risk cascade + market reality + alternatives",
      full: "Complete business assessment + scenario modeling + competitive analysis"
    },
    
    claude_enhancement: {
      trigger_conditions: ["high_financial_stakes", "market_uncertainty", "survival_risk"],
      enhanced_prompt: "Model multiple failure scenarios. Calculate hidden costs. Challenge market assumptions."
    }
  },

  site_monkeys: {
    mode_id: "SM-PROD-001", 
    display_name: "Site Monkeys Mode",
    emoji: "🍌",
    
    enforcement_core: [
      "ENFORCE Site Monkeys operational standards",
      "VALIDATE against pricing and margin requirements",
      "PROTECT founder time and energy budgets",
      "MAINTAIN premium positioning and zero-failure delivery",
      "OPTIMIZE for 87% margins and runway extension"
    ],
    
    vault_requirements: {
      access_required: true,
      compatibility_check: true,
      logic_override_authority: "VAULT_WINS_ON_OPERATIONS"
    },
    
    decision_frameworks: {
      pricing_validation: "Never undercut established tiers, always justify premium",
      resource_allocation: "Cash preservation > growth spending", 
      quality_assurance: "Zero-failure delivery standards enforced",
      founder_protection: "Minimize cognitive load and decision fatigue"
    },
    
    output_format: {
      essential: "Site Monkeys impact + operational compliance + margin effect",
      detail: "Business logic + vault alignment + optimization opportunities",
      full: "Complete operational analysis + competitive positioning + founder guidance"
    },
    
    claude_enhancement: {
      trigger_conditions: ["vault_conflicts", "complex_operations", "strategic_decisions"],
      enhanced_prompt: "Apply Site Monkeys vault logic with enhanced operational enforcement and founder protection."
    }
  }
};

// ROUTING LOGIC CONFIGURATION
export const ROUTING_CONFIG = {
  default_ai: "eli_or_roxy", // Not both
  
  eli_triggers: [
    "analysis", "data", "numbers", "risk", "legal", "technical", 
    "calculate", "model", "assess", "evaluate", "breakdown"
  ],
  
  roxy_triggers: [
    "creative", "ideas", "options", "alternatives", "messaging", 
    "strategy", "positioning", "stuck", "brainstorm", "optimize"
  ],
  
  claude_manual_only: true,
  claude_cost_cap: 0.50, // $0.50 maximum per call
  
  complexity_detection: {
    low_confidence_threshold: 0.70,
    assumption_count_threshold: 3,
    unknown_factor_threshold: 2,
    vault_conflict_auto_suggest: true
  }
};

// TOKEN COST CONFIGURATION  
export const COST_CONFIG = {
  eli_cost_per_token: 0.00003, // GPT-4 pricing
  roxy_cost_per_token: 0.00003,
  claude_input_cost_per_token: 0.000003, // Claude pricing
  claude_output_cost_per_token: 0.000015,
  vault_load_base_cost: 0.16, // Estimated vault loading cost
  
  session_tracking: {
    display_internal_only: true,
    update_real_time: true,
    cost_warning_threshold: 2.00, // Warn at $2 session spend
    export_analytics: true
  }
};

// MODE SWITCHING VALIDATION
export function validateModeSwitch(fromMode, toMode, vaultLoaded) {
  const validation = {
    allowed: true,
    warnings: [],
    requirements: []
  };
  
  // Site Monkeys mode requires vault
  if (toMode === 'site_monkeys' && !vaultLoaded) {
    validation.allowed = false;
    validation.requirements.push("Vault must be loaded for Site Monkeys mode");
  }
  
  // Warn about cost implications
  if (toMode === 'site_monkeys' && fromMode !== 'site_monkeys') {
    validation.warnings.push("Site Monkeys mode may increase token usage");
  }
  
  return validation;
}

// CONFIDENCE SCORING ENGINE
export function calculateConfidenceScore(response, evidence, assumptions) {
  let confidence = 50; // Base confidence
  
  // Evidence quality scoring
  if (evidence.primarySources) confidence += 25;
  if (evidence.multipleVerifications) confidence += 15;
  if (evidence.recentData) confidence += 10;
  if (evidence.contradictoryInfo) confidence -= 20;
  
  // Assumption penalties
  const assumptionPenalty = Math.min(assumptions.length * 5, 25);
  confidence -= assumptionPenalty;
  
  // Response quality indicators
  if (response.includes("I don't know")) confidence += 10; // Honesty bonus
  if (response.includes("likely") || response.includes("probably")) confidence -= 15;
  
  return Math.max(0, Math.min(100, confidence));
}

// CLAUDE TRIGGER DETECTION
export function shouldSuggestClaude(response, confidence, mode, vaultConflicts) {
  const triggers = [];
  
  if (confidence < ROUTING_CONFIG.complexity_detection.low_confidence_threshold) {
    triggers.push("low_confidence");
  }
  
  if (vaultConflicts && vaultConflicts.length > 0) {
    triggers.push("vault_conflicts");
  }
  
  const unknownCount = (response.match(/unknown|uncertain|unclear/gi) || []).length;
  if (unknownCount >= ROUTING_CONFIG.complexity_detection.unknown_factor_threshold) {
    triggers.push("multiple_unknowns");
  }
  
  const assumptionCount = (response.match(/assume|assumption|likely|probably/gi) || []).length;
  if (assumptionCount >= ROUTING_CONFIG.complexity_detection.assumption_count_threshold) {
    triggers.push("assumption_heavy");
  }
  
  return {
    suggest: triggers.length > 0,
    triggers: triggers,
    message: triggers.length > 0 ? 
      "⚠️ This response may lack full depth or verification. Would you like to involve Claude for higher-enforcement analysis?" : 
      null
  };
}
