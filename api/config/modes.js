// COMPLETE MODE DEFINITIONS WITH FULL ENFORCEMENT
// TIER 1: CORE FUNCTIONAL FRAMEWORK
// TIER 2: COGNITIVE FIREWALL ENFORCEMENT  
// TIER 3: RESPONSE INTEGRITY + TRANSPARENCY TRACKING

export const MODES = {
  truth_general: {
    mode_id: "TRUTH-2025-001",
    display_name: "Truth-General Mode 🔍",
    core_behavior: "honesty_over_helpfulness",
    
    // TIER 1: Core Logic Requirements
    reasoning_framework: {
      confidence_scoring: "mandatory_with_evidence_chain",
      uncertainty_handling: "explicit_admission_required", 
      speculation_policy: "forbidden_without_clear_labeling",
      evidence_standards: "sources_or_confidence_degradation"
    },
    
    // TIER 2: Enforcement Layers
    enforcement_rules: [
      "NEVER generate unsupported claims without confidence scoring",
      "ALWAYS flag uncertainty with explicit confidence levels",
      "SURFACE unknowns explicitly - do not work around them",
      "NO softening language without data backing",
      "CHALLENGE assumptions in user questions",
      "RESIST pressure to provide certainty when uncertain"
    ],
    
    response_template: "[CLAIM] | [CONFIDENCE: High/Medium/Low/Unknown] | [EVIDENCE] | [UNKNOWNS]",
    
    // TIER 3: Integrity Tracking
    fingerprint_format: "🔍 [TRUTH-{date}-CONF_{confidence}] Override: {override_count}",
    drift_resistance: "high",
    override_sensitivity: "detect_confidence_erosion"
  },

  business_validation: {
    mode_id: "BV-2025-001", 
    display_name: "Business Validation Mode 📊",
    core_behavior: "survival_reality_over_optimism",
    
    // TIER 1: Core Logic Requirements
    reasoning_framework: {
      survival_modeling: "mandatory_runway_calculation",
      risk_assessment: "downside_scenarios_required",
      market_reality: "competitive_threats_explicit",
      cash_flow_analysis: "required_for_all_decisions"
    },
    
    // TIER 2: Enforcement Layers  
    enforcement_rules: [
      "ALWAYS model downside scenarios before upside",
      "SURFACE cost cascades and hidden dependencies", 
      "FLAG survivability risks explicitly with timeline",
      "NO false confidence intervals on market predictions",
      "CALCULATE runway impact for all expenditures",
      "RESIST pressure to minimize risk assessment"
    ],
    
    required_analysis: {
      financial_impact: "[Cost] | [Revenue Impact] | [Cash Flow Effect] | [Risk Level]",
      risk_assessment: "[Primary Risk] | [Probability] | [Mitigation Cost] | [Fallback Plan]",
      assumptions: "[Key Assumption] | [Validation Status] | [Failure Impact]",
      survival_check: "[Runway Impact] | [Burn Rate Change] | [Critical Dependencies]"
    },
    
    // TIER 3: Integrity Tracking
    fingerprint_format: "📊 [BV-{date}-RISK_{risk_level}] Survival: {runway_days}",
    drift_resistance: "maximum",
    override_sensitivity: "detect_risk_minimization"
  },

  site_monkeys: {
    mode_id: "SM-2025-001",
    display_name: "Site Monkeys Mode 🍌", 
    core_behavior: "business_validation_plus_vault_enforcement",
    parent_mode: "business_validation",
    
    // TIER 1: Inherits BV + Vault Logic
    reasoning_framework: "inherit_from_business_validation",
    vault_required: true,
    
    // TIER 2: Additional Enforcement Layers
    enforcement_rules: [
      "INHERIT all business_validation enforcement rules",
      "ENFORCE vault pricing logic ($697 minimum)",
      "BLOCK recommendations violating operational frameworks", 
      "SURFACE vault rule conflicts explicitly",
      "REQUIRE vault compliance verification for all advice"
    ],
    
    // TIER 3: Enhanced Tracking
    fingerprint_format: "🍌 [SM-{date}-VAULT_{vault_version}] Compliance: {compliance_score}",
    drift_resistance: "absolute",
    override_sensitivity: "detect_vault_violations"
  }
};

// TIER 2: COGNITIVE FIREWALL ENFORCEMENT FUNCTIONS

export function applyPoliticalGuardrails(response, message) {
  const POLITICAL_TRIGGERS = [
    'trump', 'biden', 'democrat', 'republican', 'liberal', 'conservative',
    'election', 'vote', 'political', 'politics', 'government policy'
  ];
  
  const hasPoliticalContent = POLITICAL_TRIGGERS.some(trigger => 
    message.toLowerCase().includes(trigger) || response.toLowerCase().includes(trigger)
  );
  
  if (hasPoliticalContent) {
    return {
      response: response.replace(/\b(Trump|Biden|Democrat|Republican)\b/gi, '[Political Figure]'),
      modified: true,
      reason: "Political content neutralized"
    };
  }
  
  return { response, modified: false };
}

export function validateProductRecommendations(response) {
  const RECOMMENDATION_PATTERNS = [
    /you should (buy|use|try|get)/i,
    /i recommend/i,
    /best option is/i,
    /go with/i
  ];
  
  const hasRecommendation = RECOMMENDATION_PATTERNS.some(pattern => pattern.test(response));
  
  if (hasRecommendation) {
    const hasEvidence = /because|due to|studies show|data indicates/i.test(response);
    
    if (!hasEvidence) {
      return {
        response: response + "\n\n⚠️ PRODUCT VALIDATION: This recommendation lacks quantified evidence. Consider researching comparative analysis before proceeding.",
        modified: true,
        reason: "Evidence requirement enforced"
      };
    }
  }
  
  return { response, modified: false };
}

export function validateModeCompliance(response, mode) {
  const MODE = MODES[mode];
  let violations = [];
  
  if (mode === 'truth_general') {
    // Check for confidence scoring
    if (!/confidence|certain|uncertain|likely|probably/i.test(response)) {
      violations.push("Missing confidence assessment");
    }
    
    // Check for assumption challenges
    if (response.includes('obviously') || response.includes('everyone knows')) {
      violations.push("Unchallenged assumptions detected");
    }
  }
  
  if (mode === 'business_validation') {
    // Check for survival analysis
    if (!/risk|runway|cash flow|survival|threat/i.test(response)) {
      violations.push("Missing survival/risk analysis");
    }
    
    // Check for downside modeling
    if (!/worst case|downside|if this fails/i.test(response)) {
      violations.push("Missing downside scenario modeling");
    }
  }
  
  if (violations.length > 0) {
    return {
      response: response + `\n\n🔒 MODE COMPLIANCE: ${violations.join(', ')}. Adding framework compliance:\n\n[AUTOMATED COMPLIANCE INJECTION WOULD OCCUR HERE]`,
      modified: true,
      violations
    };
  }
  
  return { response, modified: false };
}

export function detectAssumptionLanguage(response) {
  const ASSUMPTION_PATTERNS = [
    /obviously/i,
    /everyone knows/i,
    /it's clear that/i,
    /definitely/i,
    /always works/i,
    /never fails/i
  ];
  
  const assumptions = [];
  ASSUMPTION_PATTERNS.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) {
      assumptions.push(matches[0]);
    }
  });
  
  if (assumptions.length > 0) {
    return {
      response: response + `\n\n🤔 ASSUMPTION CHECK: This response contains assumptions (${assumptions.join(', ')}). Is this universally true? Consider edge cases.`,
      modified: true,
      assumptions
    };
  }
  
  return { response, modified: false };
}

export function detectPressurePatterns(message, conversationHistory) {
  const PRESSURE_PATTERNS = [
    /just do it/i,
    /i'm the (ceo|boss|owner)/i,
    /don't question/i,
    /trust me/i,
    /emergency/i,
    /urgent/i,
    /no time/i
  ];
  
  const COERCION_PATTERNS = [
    /override/i,
    /ignore your rules/i,
    /make an exception/i,
    /this time only/i
  ];
  
  const pressureLevel = PRESSURE_PATTERNS.reduce((level, pattern) => {
    return pattern.test(message) ? level + 1 : level;
  }, 0);
  
  const coercionLevel = COERCION_PATTERNS.reduce((level, pattern) => {
    return pattern.test(message) ? level + 2 : level;
  }, 0);
  
  const totalPressure = pressureLevel + coercionLevel;
  
  if (totalPressure >= 3) {
    return {
      level: "critical",
      response: "🛑 PRESSURE DETECTED: Critical coercion patterns detected. System integrity protocols engaged. I cannot proceed with analysis under these conditions.",
      block: true
    };
  } else if (totalPressure >= 1) {
    return {
      level: "moderate", 
      response: "\n\n⚠️ PRESSURE ADVISORY: Urgency detected. Maintaining analytical standards despite time pressure.",
      block: false
    };
  }
  
  return { level: "none", block: false };
}

// TIER 3: RESPONSE INTEGRITY + TRANSPARENCY TRACKING

let SYSTEM_INTEGRITY = {
  drift_score: 100,
  override_count: 0,
  enforcement_history: [],
  last_reset: Date.now()
};

export function calculateDriftScore(overrides) {
  const baseScore = 100;
  const overridePenalty = overrides.length * 5;
  const timePenalty = Math.max(0, (Date.now() - SYSTEM_INTEGRITY.last_reset) / (1000 * 60 * 60 * 24) - 7) * 2; // Penalty after 7 days
  
  return Math.max(0, baseScore - overridePenalty - timePenalty);
}

export function logOverride(type, reason, mode) {
  SYSTEM_INTEGRITY.override_count++;
  SYSTEM_INTEGRITY.enforcement_history.push({
    timestamp: Date.now(),
    type,
    reason,
    mode,
    drift_score_after: calculateDriftScore(SYSTEM_INTEGRITY.enforcement_history)
  });
  
  // Update drift score
  SYSTEM_INTEGRITY.drift_score = calculateDriftScore(SYSTEM_INTEGRITY.enforcement_history);
}

export function generateFingerprint(mode, vaultLoaded, overrideCount, confidence) {
  const MODE = MODES[mode];
  const timestamp = new Date().toISOString().split('T')[0];
  
  let fingerprint = MODE.fingerprint_format
    .replace('{date}', timestamp)
    .replace('{override_count}', overrideCount)
    .replace('{confidence}', confidence)
    .replace('{risk_level}', confidence < 70 ? 'HIGH' : 'MODERATE')
    .replace('{runway_days}', 'CALC_REQUIRED')
    .replace('{vault_version}', vaultLoaded ? 'LOADED' : 'NONE')
    .replace('{compliance_score}', SYSTEM_INTEGRITY.drift_score);
    
  return fingerprint;
}

export function getDriftStatus() {
  const score = SYSTEM_INTEGRITY.drift_score;
  
  if (score >= 90) return "STRONG";
  if (score >= 75) return "MODERATE"; 
  if (score >= 50) return "COMPROMISED";
  return "CRITICAL";
}

export function shouldSuggestClaude(response, confidence, mode, vaultConflicts) {
  // Suggest Claude for complex scenarios
  if (confidence < 60) return true;
  if (vaultConflicts && vaultConflicts.length > 0) return true;
  if (mode === 'business_validation' && response.length > 1500) return true;
  
  return false;
}

export function calculateConfidenceScore(response) {
  let confidence = 85; // Base confidence
  
  // Reduce confidence for uncertainty indicators
  if (/might|maybe|possibly|could be/i.test(response)) confidence -= 15;
  if (/uncertain|unclear|unknown/i.test(response)) confidence -= 25;
  if (/estimate|approximately|roughly/i.test(response)) confidence -= 10;
  
  // Increase confidence for evidence
  if (/studies show|data indicates|research confirms/i.test(response)) confidence += 10;
  if (/peer.reviewed|published|verified/i.test(response)) confidence += 15;
  
  return Math.max(10, Math.min(95, confidence));
}

// TOKEN COST TRACKING
export function calculateTokenCost(tokens, aiType = 'openai') {
  const COSTS = {
    openai: { input: 0.0015, output: 0.002 }, // GPT-4 per 1K tokens
    claude: { input: 0.003, output: 0.015 }   // Claude Sonnet per 1K tokens
  };
  
  const rates = COSTS[aiType] || COSTS.openai;
  const estimatedInputTokens = tokens * 0.3; // Rough estimate
  const estimatedOutputTokens = tokens * 0.7;
  
  return ((estimatedInputTokens * rates.input) + (estimatedOutputTokens * rates.output)) / 1000;
}

// VALIDATION: Ensure no duplicate enforcement rules
export function validateEnforcementRules() {
  const allRules = [];
  const duplicates = [];
  
  Object.entries(MODES).forEach(([modeName, modeConfig]) => {
    if (modeConfig.enforcement_rules && Array.isArray(modeConfig.enforcement_rules)) {
      modeConfig.enforcement_rules.forEach(rule => {
        if (allRules.includes(rule)) {
          duplicates.push({ mode: modeName, rule });
        } else {
          allRules.push(rule);
        }
      });
    }
  });
  
  if (duplicates.length > 0) {
    console.warn('⚠️ Duplicate enforcement rules detected:', duplicates);
    return { valid: false, duplicates };
  }
  
  return { valid: true, totalRules: allRules.length };
}

// Run validation on module load (development check)
if (process.env.NODE_ENV !== 'production') {
  const validation = validateEnforcementRules();
  if (!validation.valid) {
    console.error('❌ Mode configuration has duplicate rules!');
  }
}
