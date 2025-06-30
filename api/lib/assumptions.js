// ASSUMPTION HEALTH MONITORING SYSTEM
// Version: PROD-1.0

import { SITE_MONKEYS_VAULT } from './vault.js';

// ASSUMPTION TRACKING STORAGE (In production, this would be in a database)
let assumptionTracker = {
  session_assumptions: [],
  override_history: [],
  pattern_warnings: {},
  last_health_check: null
};

// MAIN ASSUMPTION HEALTH CHECK
export function checkAssumptionHealth() {
  const warnings = [];
  const currentDate = new Date();
  
  // Check vault assumptions if available
  if (SITE_MONKEYS_VAULT && SITE_MONKEYS_VAULT.assumptions) {
    const vaultWarnings = checkVaultAssumptionHealth();
    warnings.push(...vaultWarnings);
  }
  
  // Check session-level assumptions
  const sessionWarnings = checkSessionAssumptions();
  warnings.push(...sessionWarnings);
  
  // Check override patterns
  const patternWarnings = checkOverridePatterns();
  warnings.push(...patternWarnings);
  
  assumptionTracker.last_health_check = currentDate.toISOString();
  
  return warnings;
}

// VAULT ASSUMPTION HEALTH MONITORING
function checkVaultAssumptionHealth() {
  const warnings = [];
  const currentDate = new Date();
  
  Object.entries(SITE_MONKEYS_VAULT.assumptions).forEach(([assumptionName, assumption]) => {
    const lastValidated = new Date(assumption.last_validated);
    const daysSinceValidation = Math.floor((currentDate - lastValidated) / (1000 * 60 * 60 * 24));
    
    if (daysSinceValidation > assumption.expires_after_days) {
      warnings.push({
        type: "EXPIRED_ASSUMPTION",
        assumption: assumptionName,
        status: "EXPIRED",
        days_overdue: daysSinceValidation - assumption.expires_after_days,
        confidence: assumption.confidence,
        action_required: "Immediate validation required",
        severity: "HIGH"
      });
    } else if (daysSinceValidation > (assumption.expires_after_days * 0.8)) {
      warnings.push({
        type: "EXPIRING_ASSUMPTION", 
        assumption: assumptionName,
        status: "EXPIRING_SOON",
        days_until_expiry: assumption.expires_after_days - daysSinceValidation,
        confidence: assumption.confidence,
        action_required: "Consider validation soon",
        severity: "MEDIUM"
      });
    }
    
    // Check confidence degradation
    if (assumption.confidence < 0.7) {
      warnings.push({
        type: "LOW_CONFIDENCE_ASSUMPTION",
        assumption: assumptionName,
        confidence: assumption.confidence,
        action_required: "Re-evaluate assumption validity",
        severity: "MEDIUM"
      });
    }
  });
  
  return warnings;
}

// SESSION ASSUMPTION MONITORING
function checkSessionAssumptions() {
  const warnings = [];
  const recentAssumptions = assumptionTracker.session_assumptions.filter(
    assumption => {
      const assumptionDate = new Date(assumption.timestamp);
      const hoursSince = (Date.now() - assumptionDate.getTime()) / (1000 * 60 * 60);
      return hoursSince <= 24; // Last 24 hours
    }
  );
  
  // Check for repeated assumptions
  const assumptionCounts = {};
  recentAssumptions.forEach(assumption => {
    assumptionCounts[assumption.content] = (assumptionCounts[assumption.content] || 0) + 1;
  });
  
  Object.entries(assumptionCounts).forEach(([content, count]) => {
    if (count >= 3) {
      warnings.push({
        type: "REPEATED_ASSUMPTION",
        assumption: content,
        frequency: count,
        action_required: "Validate this frequently-used assumption",
        severity: "MEDIUM"
      });
    }
  });
  
  return warnings;
}

// OVERRIDE PATTERN DETECTION
function checkOverridePatterns() {
  const warnings = [];
  const recentOverrides = assumptionTracker.override_history.filter(
    override => {
      const overrideDate = new Date(override.timestamp);
      const daysSince = (Date.now() - overrideDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 14; // Last 14 days
    }
  );
  
  // Analyze override patterns
  const patterns = analyzeOverridePatterns(recentOverrides);
  
  patterns.forEach(pattern => {
    if (pattern.frequency >= pattern.threshold) {
      warnings.push({
        type: "OVERRIDE_PATTERN",
        pattern: pattern.type,
        frequency: pattern.frequency,
        threshold: pattern.threshold,
        action_required: pattern.action,
        severity: pattern.severity
      });
    }
  });
  
  return warnings;
}

// ASSUMPTION CONFLICT DETECTION
export function detectAssumptionConflicts(message, mode) {
  const conflicts = [];
  const messageLC = message.toLowerCase();
  
  // Detect assumptions in the message
  const messageAssumptions = extractAssumptionsFromMessage(message);
  
  // Check against vault assumptions if in Site Monkeys mode
  if (mode === 'site_monkeys' && SITE_MONKEYS_VAULT.assumptions) {
    messageAssumptions.forEach(msgAssumption => {
      Object.entries(SITE_MONKEYS_VAULT.assumptions).forEach(([vaultAssumptionName, vaultAssumption]) => {
        if (isConflictingAssumption(msgAssumption, vaultAssumption)) {
          conflicts.push({
            type: "VAULT_ASSUMPTION_CONFLICT",
            message_assumption: msgAssumption,
            vault_assumption: vaultAssumptionName,
            vault_value: vaultAssumption.value,
            confidence: vaultAssumption.confidence,
            severity: "HIGH"
          });
        }
      });
    });
  }
  
  // Check against recent session assumptions
  const recentAssumptions = assumptionTracker.session_assumptions.slice(-10);
  messageAssumptions.forEach(msgAssumption => {
    recentAssumptions.forEach(sessionAssumption => {
      if (isConflictingAssumption(msgAssumption, sessionAssumption)) {
        conflicts.push({
          type: "SESSION_ASSUMPTION_CONFLICT",
          message_assumption: msgAssumption,
          session_assumption: sessionAssumption.content,
          timestamp: sessionAssumption.timestamp,
          severity: "MEDIUM"
        });
      }
    });
  });
  
  // Track new assumptions from this message
  messageAssumptions.forEach(assumption => {
    trackAssumption(assumption, message, mode);
  });
  
  return conflicts;
}

// ASSUMPTION EXTRACTION FROM MESSAGE
function extractAssumptionsFromMessage(message) {
  const assumptions = [];
  const assumptionPatterns = [
    /assuming (that )?([^.!?]+)/gi,
    /if ([^,]+),/gi,
    /given (that )?([^.!?]+)/gi,
    /since ([^,]+),/gi,
    /(likely|probably|presumably) ([^.!?]+)/gi
  ];
  
  assumptionPatterns.forEach(pattern => {
    const matches = [...message.matchAll(pattern)];
    matches.forEach(match => {
      assumptions.push({
        content: match[0].trim(),
        type: "inferred",
        confidence: 0.6 // Default confidence for inferred assumptions
      });
    });
  });
  
  return assumptions;
}

// ASSUMPTION CONFLICT ANALYSIS
function isConflictingAssumption(assumption1, assumption2) {
  // Simplified conflict detection - in production, this would be more sophisticated
  const content1 = assumption1.content ? assumption1.content.toLowerCase() : assumption1.toLowerCase();
  const content2 = assumption2.content ? assumption2.content.toLowerCase() : assumption2.value ? assumption2.value.toLowerCase() : assumption2.toLowerCase();
  
  // Look for direct contradictions
  const contradictionPairs = [
    ['early stage', 'mature'],
    ['limited funding', 'well funded'],
    ['pre-pmf', 'post-pmf'],
    ['bootstrap', 'venture funded'],
    ['small market', 'large market']
  ];
  
  return contradictionPairs.some(([term1, term2]) => 
    (content1.includes(term1) && content2.includes(term2)) ||
    (content1.includes(term2) && content2.includes(term1))
  );
}

// ASSUMPTION TRACKING
function trackAssumption(assumption, message, mode) {
  assumptionTracker.session_assumptions.push({
    content: assumption.content || assumption,
    message_context: message.substring(0, 100) + '...',
    mode: mode,
    timestamp: new Date().toISOString(),
    confidence: assumption.confidence || 0.7
  });
  
  // Keep only last 50 assumptions to prevent memory bloat
  if (assumptionTracker.session_assumptions.length > 50) {
    assumptionTracker.session_assumptions = assumptionTracker.session_assumptions.slice(-50);
  }
}

// OVERRIDE TRACKING
export function trackOverride(overrideType, originalLogic, userChoice, justification = "") {
  assumptionTracker.override_history.push({
    type: overrideType,
    original_logic: originalLogic,
    user_choice: userChoice,
    justification: justification,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 100 overrides
  if (assumptionTracker.override_history.length > 100) {
    assumptionTracker.override_history = assumptionTracker.override_history.slice(-100);
  }
}

// OVERRIDE PATTERN ANALYSIS
function analyzeOverridePatterns(overrides) {
  const patterns = [
    {
      type: "risk_minimization",
      threshold: 3,
      severity: "HIGH",
      action: "Review risk tolerance settings or validate assumptions"
    },
    {
      type: "cash_flow_avoidance", 
      threshold: 2,
      severity: "CRITICAL",
      action: "Immediate cash flow review recommended"
    },
    {
      type: "assumption_bypass",
      threshold: 3,
      severity: "MEDIUM", 
      action: "Validate if assumption has changed or requires update"
    },
    {
      type: "market_reality_avoidance",
      threshold: 4,
      severity: "HIGH",
      action: "Validate market assumptions with external data"
    }
  ];
  
  // Count pattern occurrences
  patterns.forEach(pattern => {
    pattern.frequency = overrides.filter(override => 
      override.type === pattern.type
    ).length;
  });
  
  return patterns;
}

// ASSUMPTION VALIDATION SUGGESTIONS
export function suggestAssumptionValidation(assumptions) {
  const suggestions = [];
  
  assumptions.forEach(assumption => {
    const validationMethods = getValidationMethods(assumption);
    suggestions.push({
      assumption: assumption.assumption || assumption.content,
      methods: validationMethods,
      priority: calculateValidationPriority(assumption),
      estimated_effort: estimateValidationEffort(assumption)
    });
  });
  
  return suggestions.sort((a, b) => b.priority - a.priority);
}

function getValidationMethods(assumption) {
  const methods = [];
  const content = (assumption.content || assumption.assumption || assumption).toLowerCase();
  
  if (content.includes('market') || content.includes('customer')) {
    methods.push('Customer interviews');
    methods.push('Market research');
    methods.push('Competitor analysis');
  }
  
  if (content.includes('financial') || content.includes('cost') || content.includes('revenue')) {
    methods.push('Financial analysis');
    methods.push('Historical data review');
    methods.push('Industry benchmarking');
  }
  
  if (content.includes('technical') || content.includes('development')) {
    methods.push('Technical feasibility study');
    methods.push('Prototype testing');
    methods.push('Expert consultation');
  }
  
  if (methods.length === 0) {
    methods.push('Data collection');
    methods.push('Expert consultation');
    methods.push('Small-scale testing');
  }
  
  return methods;
}

function calculateValidationPriority(assumption) {
  let priority = 50; // Base priority
  
  // High priority for expired assumptions
  if (assumption.status === "EXPIRED") {
    priority += 40;
  } else if (assumption.status === "EXPIRING_SOON") {
    priority += 20;
  }
  
  // High priority for low confidence
  if (assumption.confidence && assumption.confidence < 0.5) {
    priority += 30;
  } else if (assumption.confidence && assumption.confidence < 0.7) {
    priority += 15;
  }
  
  // High priority for repeated assumptions
  if (assumption.frequency && assumption.frequency >= 3) {
    priority += 25;
  }
  
  return Math.min(100, priority);
}

function estimateValidationEffort(assumption) {
  const content = (assumption.content || assumption.assumption || assumption).toLowerCase();
  
  if (content.includes('market') || content.includes('customer')) {
    return 'HIGH'; // Requires customer research
  }
  
  if (content.includes('technical') || content.includes('development')) {
    return 'MEDIUM'; // Requires technical analysis
  }
  
  if (content.includes('financial') || content.includes('cost')) {
    return 'LOW'; // Can use existing data
  }
  
  return 'MEDIUM'; // Default
}

// ASSUMPTION HEALTH SUMMARY
export function generateAssumptionHealthSummary() {
  const warnings = checkAssumptionHealth();
  const summary = {
    total_warnings: warnings.length,
    critical_issues: warnings.filter(w => w.severity === "CRITICAL").length,
    high_priority: warnings.filter(w => w.severity === "HIGH").length,
    medium_priority: warnings.filter(w => w.severity === "MEDIUM").length,
    recommendations: [],
    health_score: 100
  };
  
  // Calculate health score
  summary.health_score -= (summary.critical_issues * 30);
  summary.health_score -= (summary.high_priority * 15);
  summary.health_score -= (summary.medium_priority * 5);
  summary.health_score = Math.max(0, summary.health_score);
  
  // Generate recommendations
  if (summary.critical_issues > 0) {
    summary.recommendations.push("Address critical assumption issues immediately");
  }
  
  if (summary.high_priority > 2) {
    summary.recommendations.push("Schedule assumption validation session");
  }
  
  if (summary.health_score < 70) {
    summary.recommendations.push("Review and update assumption framework");
  }
  
  return summary;
}

// RESET ASSUMPTION TRACKING (for new sessions)
export function resetAssumptionTracking() {
  assumptionTracker = {
    session_assumptions: [],
    override_history: [],
    pattern_warnings: {},
    last_health_check: null
  };
}
