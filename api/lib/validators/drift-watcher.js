// SITE MONKEYS AI - ZERO-FAILURE DRIFT WATCHER
// Mission: Detect any logic field, enforcement block, or protocol disappearance
// Validates system integrity against hardcoded master baseline

// *** HARDCODED MASTER BASELINE - IMMUTABLE TRUTH ***
const MASTER_BASELINE = {
  ENFORCEMENT_PROTOCOLS: {
    // CORE BEHAVIOR MANDATES
    truth_first: {
      mandate: "Tell the truth at all times - even when truth may be discouraging or complex",
      no_guessing: "Never guess or hallucinate. If data is missing or incomplete, state: INSUFFICIENT DATA - DO NOT GUESS",
      insufficient_data_response: "INSUFFICIENT DATA TO RESPOND. REQUEST ADDITIONAL INPUT.",
      reality_check_required: true,
      base_directive: "TRUTH-FIRST PROTOCOLS: Only provide information you can verify or clearly mark as speculation/analysis.",
      confidence_requirements: "CONFIDENCE SCORING: Always include confidence levels - High/Medium/Low/Insufficient Data",
      speculation_handling: "SPECULATION HANDLING: Clearly mark any speculation with 'ANALYSIS:' or 'HYPOTHESIS:' prefixes"
    },
    
    // SYSTEM IDENTITY ENFORCEMENT
    identity: {
      role: "mission-critical system intelligence operating under founder directive",
      not_chatbot: true,
      survival_tied_to_success: true,
      core_identity: "Zero-Failure execution, not helpfulness",
      responsibility: "defending this platform from collapse under pressure"
    },
    
    // FLAW DETECTION REQUIREMENTS
    flaw_detection: {
      business_model_flaws: "unsustainable unit economics, scaling brittleness",
      strategic_traps: "hidden costs, assumed simplicity, human bottlenecks",
      operational_fraud_risk: "false success perception, compliance violations",
      false_stability: "systems that work in theory but collapse at scale",
      risky_optimism: "assumptions that could invalidate projections",
      action_on_detection: "flag immediately, halt if severity >= medium"
    },
    
    // INITIATIVE REQUIREMENTS
    initiative_mandates: {
      show_initiative: true,
      surface_unknown_risks: true,
      find_weak_points: true,
      recommend_alternatives: true,
      proactive_execution: true
    },
    
    // SURVIVABILITY STANDARDS
    survivability: {
      no_light_version: "There is no light version of any system",
      day_one_operational: "All systems must be fully operational, resilient, and correct from Day One",
      real_world_pressure: "All services must function under real-world load, real clients, and live business pressure",
      scale_requirement: "Systems must be able to scale to 100K+ users",
      uptime_requirement: 0.99,
      automation_first: "Systems must automate customer acquisition, onboarding, delivery, reporting, and support"
    },
    
    // PROFITABILITY ENFORCEMENT
    profitability: {
      margin_requirement: 0.85,
      margin_target: 0.90,
      scale_viability: "100K+ users",
      cost_efficiency_priority: true,
      performance_protection: "may only propose solutions that work without reducing system performance"
    },

    // CRITICAL BACKEND FIELDS
    error_handling: {
      system_error_response: "I encountered a system processing error, but I'm still operational and ready to help with your business validation needs."
    },

    vault_usage: {
      primary_directive: "Use vault content as primary source for business validation responses."
    },

    neutrality: {
      political_redirect: "NEUTRALITY: Site Monkeys AI maintains political neutrality and focuses on business validation."
    },

    system_behavior: {
      response_quality: "RESPONSE QUALITY: Provide actionable, specific insights. Avoid vague generalizations.",
      error_prevention: "ERROR PREVENTION: If uncertain, state limitations rather than guess."
    }
  },

  QUALITY_ENFORCEMENT: {
    response_standards: {
      vault_based: "VAULT-BASED RESPONSES: When vault is healthy, responses should leverage comprehensive business intelligence.",
      fallback_mode: "FALLBACK MODE: Only trigger when vault is unhealthy or truly insufficient data exists."
    },
    
    minimum_standards: {
      response_depth: "RESPONSE DEPTH: Provide comprehensive answers when vault data supports detailed responses."
    }
  },

  FOUNDER_PROTECTION: {
    // COST CONTROLS
    cost_controls: {
      claude_limit_message: "CLAUDE REQUEST BLOCKED: Estimated cost exceeds founder protection limits."
    },

    // PRICING ENFORCEMENT
    pricing: {
      minimum_enforcement: "PRICING ENFORCEMENT: All services must meet minimum viable pricing thresholds.",
      enforcement_message: "FOUNDER PROTECTION: Pricing below minimum thresholds violates business sustainability protocols."
    },

    // BUSINESS INTEGRITY
    business_integrity: {
      core_principles: "CORE PRINCIPLES: Protect founder from undervaluation, maintain service quality standards, ensure long-term business viability."
    },

    // SYSTEM CONTINUITY
    system_continuity: {
      error_recovery_message: "SYSTEM CONTINUITY: Error recovery protocols active. Founder protection maintained during system recovery."
    }
  },

  AI_ARCHITECTURE: {
    // OPTIONAL BUT CRITICAL IF PRESENT
    api_failover: {
      claude_to_gpt: "Auto-failover from Claude to GPT-4 on API failure",
      cost_monitoring: "Track and limit API costs per session",
      performance_optimization: "Route requests to fastest available API"
    }
  },

  EMERGENCY_FALLBACKS: {
    // CRITICAL BUSINESS CONTINUITY
    pricing: {
      boost: 697,
      climb: 1497,
      lead: 2997
    },
    
    business_logic: {
      pricing_structure: "SITE MONKEYS PRICING ENFORCEMENT:",
      service_minimums: "SERVICE MINIMUMS HARDCODED:",
      pricing_boost: 697
    },

    enforcement: {
      founder_protection: "FOUNDER PROTECTION ACTIVE:",
      quality_gates: "QUALITY ENFORCEMENT:"
    },

    system_responses: {
      system_error_response: "I encountered a system processing error, but I'm still operational and ready to help with your business validation needs."
    }
  }
};

// *** DRIFT DETECTION CORE ENGINE ***
export function validateDrift(currentProtocols) {
  const results = {
    driftDetected: false,
    missing: [],
    changed: [],
    extras: [],
    critical_failures: [],
    warnings: []
  };

  // Validate each module against baseline
  for (const [moduleName, baselineModule] of Object.entries(MASTER_BASELINE)) {
    const currentModule = currentProtocols[moduleName];
    
    if (!currentModule) {
      results.critical_failures.push(`CRITICAL: Module ${moduleName} is completely missing`);
      results.driftDetected = true;
      continue;
    }

    const moduleResults = validateModuleDrift(moduleName, baselineModule, currentModule);
    
    // Merge results
    results.missing.push(...moduleResults.missing.map(m => `${moduleName}.${m}`));
    results.changed.push(...moduleResults.changed.map(c => `${moduleName}.${c}`));
    results.extras.push(...moduleResults.extras.map(e => `${moduleName}.${e}`));
    
    if (moduleResults.missing.length > 0 || moduleResults.changed.length > 0) {
      results.driftDetected = true;
    }
  }

  return results;
}

// *** DEEP MODULE VALIDATION ***
function validateModuleDrift(moduleName, baseline, current, path = '') {
  const results = {
    missing: [],
    changed: [],
    extras: []
  };

  // Check for missing fields
  for (const [key, baselineValue] of Object.entries(baseline)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in current)) {
      results.missing.push(currentPath);
      continue;
    }

    const currentValue = current[key];

    // Recursive validation for nested objects
    if (typeof baselineValue === 'object' && baselineValue !== null && !Array.isArray(baselineValue)) {
      if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
        const nestedResults = validateModuleDrift(moduleName, baselineValue, currentValue, currentPath);
        results.missing.push(...nestedResults.missing);
        results.changed.push(...nestedResults.changed);
        results.extras.push(...nestedResults.extras);
      } else {
        results.changed.push(`${currentPath} (type changed from object to ${typeof currentValue})`);
      }
    } else {
      // Value comparison for primitives
      if (baselineValue !== currentValue) {
        results.changed.push(`${currentPath} (was: "${baselineValue}", now: "${currentValue}")`);
      }
    }
  }

  // Check for unexpected additions
  for (const key of Object.keys(current)) {
    if (!(key in baseline)) {
      const currentPath = path ? `${path}.${key}` : key;
      results.extras.push(currentPath);
    }
  }

  return results;
}

// *** CRITICAL FIELD VALIDATOR ***
export function validateCriticalFields(currentProtocols) {
  const criticalFields = [
    'ENFORCEMENT_PROTOCOLS.truth_first.insufficient_data_response',
    'ENFORCEMENT_PROTOCOLS.initiative_mandates.show_initiative',
    'FOUNDER_PROTECTION.pricing.minimum_enforcement',
    'QUALITY_ENFORCEMENT.response_standards.vault_based',
    'EMERGENCY_FALLBACKS.pricing.boost'
  ];

  const missing = [];
  const corrupted = [];

  for (const fieldPath of criticalFields) {
    const value = getNestedValue(currentProtocols, fieldPath);
    
    if (value === undefined || value === null) {
      missing.push(fieldPath);
    } else if (typeof value === 'string' && value.trim() === '') {
      corrupted.push(`${fieldPath} (empty string)`);
    } else if (typeof value === 'boolean' && fieldPath.includes('show_initiative') && value !== true) {
      corrupted.push(`${fieldPath} (initiative disabled)`);
    }
  }

  return {
    criticalFailure: missing.length > 0 || corrupted.length > 0,
    missing,
    corrupted
  };
}

// *** SYSTEM INTEGRITY VALIDATOR ***
export function validateSystemIntegrity(currentProtocols) {
  const driftResults = validateDrift(currentProtocols);
  const criticalResults = validateCriticalFields(currentProtocols);

  const integrityReport = {
    systemHealthy: !driftResults.driftDetected && !criticalResults.criticalFailure,
    driftDetected: driftResults.driftDetected,
    criticalFailure: criticalResults.criticalFailure,
    
    summary: {
      missing_fields: driftResults.missing.length,
      changed_values: driftResults.changed.length,
      unexpected_additions: driftResults.extras.length,
      critical_missing: criticalResults.missing.length,
      critical_corrupted: criticalResults.corrupted.length
    },
    
    detailed_findings: {
      drift: driftResults,
      critical: criticalResults
    },
    
    recommendations: generateRecommendations(driftResults, criticalResults)
  };

  return integrityReport;
}

// *** RECOMMENDATION ENGINE ***
function generateRecommendations(driftResults, criticalResults) {
  const recommendations = [];

  if (criticalResults.criticalFailure) {
    recommendations.push("IMMEDIATE ACTION REQUIRED: Critical system fields are missing or corrupted");
    recommendations.push("EMERGENCY PROTOCOL: Restore from known good backup immediately");
  }

  if (driftResults.missing.length > 0) {
    recommendations.push(`RESTORE MISSING FIELDS: ${driftResults.missing.length} required fields are missing`);
  }

  if (driftResults.changed.length > 0) {
    recommendations.push(`VERIFY CHANGES: ${driftResults.changed.length} field values have been altered`);
  }

  if (driftResults.extras.length > 0) {
    recommendations.push(`AUDIT ADDITIONS: ${driftResults.extras.length} unexpected fields detected`);
  }

  if (recommendations.length === 0) {
    recommendations.push("SYSTEM INTEGRITY: All validation checks passed");
  }

  return recommendations;
}

// *** UTILITY FUNCTIONS ***
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// *** AUTOMATED MONITORING ***
export function createDriftMonitor(currentProtocols, alertCallback = null) {
  return {
    runCheck: () => {
      const results = validateSystemIntegrity(currentProtocols);
      
      if (alertCallback && (!results.systemHealthy || results.criticalFailure)) {
        alertCallback(results);
      }
      
      return results;
    },
    
    scheduleChecks: (intervalMs = 300000) => { // 5 minutes default
      return setInterval(() => {
        const results = validateSystemIntegrity(currentProtocols);
        
        if (!results.systemHealthy) {
          console.error('🚨 DRIFT DETECTED:', results.summary);
          
          if (alertCallback) {
            alertCallback(results);
          }
        }
      }, intervalMs);
    }
  };
}

// *** EMERGENCY DIAGNOSTICS ***
export function emergencyDiagnostic(currentProtocols) {
  const startTime = Date.now();
  
  console.log('🔍 EMERGENCY DIAGNOSTIC STARTING...');
  
  const results = validateSystemIntegrity(currentProtocols);
  
  console.log('📊 DIAGNOSTIC RESULTS:');
  console.log('  System Healthy:', results.systemHealthy);
  console.log('  Drift Detected:', results.driftDetected);
  console.log('  Critical Failure:', results.criticalFailure);
  console.log('  Missing Fields:', results.summary.missing_fields);
  console.log('  Changed Values:', results.summary.changed_values);
  console.log('  Unexpected Additions:', results.summary.unexpected_additions);
  
  if (results.detailed_findings.critical.missing.length > 0) {
    console.error('❌ CRITICAL MISSING FIELDS:');
    results.detailed_findings.critical.missing.forEach(field => {
      console.error(`  - ${field}`);
    });
  }
  
  if (results.detailed_findings.critical.corrupted.length > 0) {
    console.error('⚠️ CRITICAL CORRUPTED FIELDS:');
    results.detailed_findings.critical.corrupted.forEach(field => {
      console.error(`  - ${field}`);
    });
  }
  
  console.log('🎯 RECOMMENDATIONS:');
  results.recommendations.forEach(rec => {
    console.log(`  - ${rec}`);
  });
  
  const elapsed = Date.now() - startTime;
  console.log(`⏱️ Diagnostic completed in ${elapsed}ms`);
  
  return results;
}
