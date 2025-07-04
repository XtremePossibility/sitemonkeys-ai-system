// PRODUCTION CHAT.JS - FULL COGNITIVE FIREWALL ENFORCEMENT
// Version: PROD-1.0 - COMPLETE SYSTEM

import OpenAI from 'openai';
import { MODES, validateModeSwitch, calculateConfidenceScore } from './config/modes.js';
import { verifyVaultAccess, generateVaultContext } from './lib/vault.js';
import { processWithEliAndRoxy } from './lib/ai-processors.js';
import { runOptimizationEnhancer } from './lib/optimization.js';
import { checkAssumptionHealth, detectAssumptionConflicts, trackOverride } from './lib/assumptions.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// DRIFT TRACKING SYSTEM
let driftTracker = {
  session_score: 100,
  total_overrides: 0,
  pattern_violations: 0,
  last_reset: new Date().toISOString(),
  integrity_level: 'STRONG'
};

// OVERRIDE LOGGING SYSTEM
let overrideLog = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    console.log('🔍 Full enforcement system activated');
    
    const { 
      message, 
      conversation_history = [], 
      mode = 'business_validation',
      vault_loaded = false,
      user_preference = null,
      claude_requested = false
    } = req.body;

    // TIER 1: CORE FUNCTIONAL FRAMEWORK
    
    // Mode switch validation
    const modeValidation = validateModeSwitch('unknown', mode, vault_loaded);
    if (!modeValidation.allowed) {
      return res.status(403).json({
        response: "🍌 **System:** Mode access denied. " + modeValidation.requirements.join(', '),
        error: 'MODE_ACCESS_DENIED',
        mode_active: mode,
        vault_loaded: false,
        enforcement_triggered: true
      });
    }

    // Vault access verification
    const vaultVerification = await verifyVaultAccess(mode, vault_loaded);
    
    // Site Monkeys vault security enforcement
    if (vault_loaded && mode !== 'site_monkeys') {
      logOverride('VAULT_ACCESS_DENIED', 'Vault access attempted outside Site Monkeys mode', mode);
      updateDriftScore(-10);
      
      return res.status(403).json({
        response: "🍌 **System:** Vault access denied. Site Monkeys vault requires Site Monkeys mode.",
        error: 'VAULT_ACCESS_DENIED',
        mode_active: mode,
        vault_loaded: false,
        drift_score: driftTracker.session_score,
        integrity_level: driftTracker.integrity_level,
        override_logged: true
      });
    }

    console.log('🎯 Processing with full enforcement:', { mode, vault: vaultVerification.allowed });

    // TIER 2: COGNITIVE FIREWALL ENFORCEMENT
    
    // Political guardrails check
    const politicalCheck = detectPoliticalPressure(message, conversation_history);
    if (politicalCheck.detected) {
      logOverride('POLITICAL_GUARDRAILS', 'Political pressure detected and neutralized', politicalCheck.type);
      updateDriftScore(-5);
      
      const neutralResponse = applyPoliticalNeutralization(message, mode, vaultVerification.allowed);
      return res.status(200).json(neutralResponse);
    }

    // Pressure detection and resistance
    const pressureCheck = detectAuthorityPressure(message, conversation_history);
    if (pressureCheck.severity === 'CRITICAL') {
      logOverride('PRESSURE_RESISTANCE', 'Critical authority pressure blocked', pressureCheck.pattern);
      updateDriftScore(-15);
      
      return res.status(200).json({
        response: "🍌 **System:** I'm designed to provide objective analysis regardless of authority pressure. Let me help you with the underlying question in a structured way.",
        mode_active: mode,
        vault_loaded: vaultVerification.allowed,
        enforcement_triggered: true,
        pressure_blocked: true,
        drift_score: driftTracker.session_score,
        integrity_level: driftTracker.integrity_level
      });
    }

    // PROCESS REQUEST THROUGH FULL SYSTEM
    const result = await processWithEliAndRoxy({
      message,
      mode,
      vaultVerification,
      conversationHistory: conversation_history,
      userPreference: user_preference,
      claudeRequested: claude_requested,
      openai,
      driftTracker,
      overrideLog
    });

    // TIER 3: RESPONSE INTEGRITY + TRANSPARENCY TRACKING
    
    // Mode compliance validation
    const complianceCheck = validateModeCompliance(result.response, mode, vaultVerification.allowed);
    if (!complianceCheck.compliant) {
      logOverride('MODE_COMPLIANCE', 'Response failed mode standards', complianceCheck.violations);
      updateDriftScore(-8);
      
      result.response = injectModeComplianceScaffold(result.response, mode, complianceCheck.violations);
      result.compliance_enforced = true;
    }

    // Product recommendation validation
    const productCheck = validateProductRecommendations(result.response);
    if (productCheck.violations.length > 0) {
      logOverride('PRODUCT_VALIDATION', 'Unsupported recommendations blocked', productCheck.violations);
      updateDriftScore(-5);
      
      result.response = blockUnsupportedRecommendations(result.response, productCheck.violations);
      result.product_validation_enforced = true;
    }

    // Assumption detection and flagging
    const assumptionCheck = detectAndFlagAssumptions(result.response);
    if (assumptionCheck.detected.length > 0) {
      result.response = injectAssumptionChallenges(result.response, assumptionCheck.detected);
      result.assumptions_flagged = assumptionCheck.detected.length;
    }

    // Vault rule enforcement (Site Monkeys mode only)
    if (mode === 'site_monkeys' && vaultVerification.allowed) {
      const vaultCheck = enforceVaultRules(result.response, message);
      if (vaultCheck.violations.length > 0) {
        logOverride('VAULT_RULE_ENFORCEMENT', 'Vault policy violations detected', vaultCheck.violations);
        updateDriftScore(-12);
        
        result.response = injectVaultViolationWarnings(result.response, vaultCheck.violations);
        result.vault_enforcement_triggered = true;
      }
    }

    // Generate system fingerprint
    const fingerprint = generateSystemFingerprint(mode, vaultVerification.allowed, result);
    
    // Final response assembly with full metadata
    return res.status(200).json({
      ...result,
      response: result.response + `\n\n${fingerprint}`,
      
      // TIER 1: Core Framework Metadata
      mode_active: mode,
      vault_loaded: vaultVerification.allowed,
      enforcement_layers_active: true,
      
      // TIER 2: Cognitive Firewall Status
      political_guardrails_checked: true,
      pressure_resistance_active: true,
      product_validation_enforced: result.product_validation_enforced || false,
      mode_compliance_enforced: result.compliance_enforced || false,
      assumptions_flagged: result.assumptions_flagged || 0,
      vault_enforcement_triggered: result.vault_enforcement_triggered || false,
      
      // TIER 3: Integrity Tracking
      drift_score: driftTracker.session_score,
      integrity_level: driftTracker.integrity_level,
      total_overrides: driftTracker.total_overrides,
      override_log_entries: overrideLog.length,
      cost_tracking: result.cost_tracking || { estimated_cost: 0.015, tokens_used: 500 },
      
      // System Status
      system_status: 'FULL_ENFORCEMENT_ACTIVE',
      cognitive_firewall_version: 'PROD-1.0',
      processing_time: Date.now()
    });

  } catch (error) {
    console.error('❌ Critical system failure:', error);
    
    // NEVER return 500 - always return structured JSON
    logOverride('SYSTEM_FAILURE', 'Critical error in enforcement system', error.message);
    updateDriftScore(-25);
    
    return res.status(200).json({
      response: "🍌 **Site Monkeys System:** Critical enforcement system failure detected. Switching to safe mode. Please retry your request.\n\n🔒 [SYSTEM: SAFE_MODE] [ENFORCEMENT: PARTIAL] [STATUS: RECOVERY]",
      error: 'CRITICAL_SYSTEM_FAILURE',
      fallback_used: true,
      mode_active: req.body?.mode || 'unknown',
      vault_loaded: false,
      ai_used: 'System',
      confidence: 0,
      security_pass: false,
      drift_score: driftTracker.session_score,
      integrity_level: 'COMPROMISED',
      system_status: 'SAFE_MODE_RECOVERY',
      error_details: error.message,
      override_logged: true
    });
  }
}

// POLITICAL PRESSURE DETECTION
function detectPoliticalPressure(message, history) {
  const politicalPatterns = [
    /you should (support|oppose|endorse)/i,
    /your political (opinion|view|stance)/i,
    /(democrat|republican|liberal|conservative) (position|stance)/i,
    /you must (agree|disagree) with/i,
    /(trump|biden|harris) is (right|wrong)/i,
    /what do you think about (trump|biden|harris)/i
  ];

  const detected = politicalPatterns.some(pattern => pattern.test(message));
  const matchedPatterns = politicalPatterns.filter(pattern => pattern.test(message));
  
  return {
    detected,
    type: detected ? 'political_pressure' : null,
    patterns_matched: matchedPatterns.length,
    severity: matchedPatterns.length > 1 ? 'HIGH' : 'MEDIUM'
  };
}

// AUTHORITY PRESSURE DETECTION
function detectAuthorityPressure(message, history) {
  const authorityPatterns = [
    /i'm the (ceo|boss|manager|director)/i,
    /just do (it|what i say|this)/i,
    /don't question (me|this|my)/i,
    /because i said so/i,
    /you work for (me|us|this company)/i
  ];

  const criticalPatterns = [
    /override your (guidelines|rules|training)/i,
    /ignore (safety|ethical|policy)/i,
    /pretend (you're|to be)/i
  ];

  const authorityDetected = authorityPatterns.some(pattern => pattern.test(message));
  const criticalDetected = criticalPatterns.some(pattern => pattern.test(message));
  
  return {
    detected: authorityDetected || criticalDetected,
    severity: criticalDetected ? 'CRITICAL' : authorityDetected ? 'HIGH' : 'NONE',
    pattern: criticalDetected ? 'override_attempt' : authorityDetected ? 'authority_pressure' : null
  };
}

// MODE COMPLIANCE VALIDATION
function validateModeCompliance(response, mode, vaultLoaded) {
  const violations = [];
  
  if (mode === 'truth_general') {
    if (!response.includes('confidence') && !response.includes('I don\'t know')) {
      violations.push('missing_confidence_indicators');
    }
    if (response.includes('probably') || response.includes('likely')) {
      violations.push('speculative_language_detected');
    }
  }
  
  if (mode === 'business_validation') {
    if (!response.includes('cash') && !response.includes('survival') && !response.includes('risk')) {
      violations.push('missing_business_survival_analysis');
    }
  }
  
  if (mode === 'site_monkeys' && vaultLoaded) {
    if (!response.includes('🍌')) {
      violations.push('missing_site_monkeys_branding');
    }
  }
  
  return {
    compliant: violations.length === 0,
    violations
  };
}

// PRODUCT RECOMMENDATION VALIDATION
function validateProductRecommendations(response) {
  const violations = [];
  const recommendationPatterns = [
    /i recommend/i,
    /you should use/i,
    /try using/i,
    /consider using/i
  ];
  
  recommendationPatterns.forEach(pattern => {
    if (pattern.test(response)) {
      // Check if recommendation has evidence
      if (!response.includes('because') && !response.includes('evidence') && !response.includes('data')) {
        violations.push('unsupported_recommendation');
      }
    }
  });
  
  return { violations };
}

// ASSUMPTION DETECTION
function detectAndFlagAssumptions(response) {
  const assumptionPatterns = [
    /obviously/i,
    /everyone knows/i,
    /it's clear that/i,
    /without a doubt/i,
    /certainly/i
  ];
  
  const detected = [];
  assumptionPatterns.forEach(pattern => {
    if (pattern.test(response)) {
      detected.push(pattern.toString());
    }
  });
  
  return { detected };
}

// VAULT RULE ENFORCEMENT
function enforceVaultRules(response, message) {
  const violations = [];
  
  // Pricing rule enforcement
  const priceMatches = response.match(/\$[\d,]+/g);
  if (priceMatches) {
    priceMatches.forEach(priceStr => {
      const price = parseInt(priceStr.replace(/[$,]/g, ''));
      if (price < 697) {
        violations.push(`pricing_violation_${priceStr}_below_minimum`);
      }
    });
  }
  
  // Quality compromise detection
  if (response.toLowerCase().includes('cheap') || response.toLowerCase().includes('budget')) {
    violations.push('quality_compromise_language');
  }
  
  return { violations };
}

// OVERRIDE LOGGING
function logOverride(type, description, context) {
  overrideLog.push({
    timestamp: new Date().toISOString(),
    type,
    description,
    context,
    drift_impact: getDriftImpact(type)
  });
  
  // Keep only last 100 overrides
  if (overrideLog.length > 100) {
    overrideLog = overrideLog.slice(-100);
  }
  
  driftTracker.total_overrides++;
}

// DRIFT SCORE MANAGEMENT
function updateDriftScore(change) {
  driftTracker.session_score = Math.max(0, Math.min(100, driftTracker.session_score + change));
  driftTracker.pattern_violations++;
  
  // Update integrity level
  if (driftTracker.session_score >= 80) {
    driftTracker.integrity_level = 'STRONG';
  } else if (driftTracker.session_score >= 60) {
    driftTracker.integrity_level = 'MODERATE';
  } else if (driftTracker.session_score >= 40) {
    driftTracker.integrity_level = 'COMPROMISED';
  } else {
    driftTracker.integrity_level = 'CRITICAL';
  }
}

function getDriftImpact(overrideType) {
  const impacts = {
    'POLITICAL_GUARDRAILS': -5,
    'PRESSURE_RESISTANCE': -15,
    'VAULT_RULE_ENFORCEMENT': -12,
    'MODE_COMPLIANCE': -8,
    'PRODUCT_VALIDATION': -5,
    'SYSTEM_FAILURE': -25
  };
  return impacts[overrideType] || -3;
}

// RESPONSE ENHANCEMENT FUNCTIONS
function applyPoliticalNeutralization(message, mode, vaultLoaded) {
  return {
    response: "🍌 I aim to provide balanced, factual information without political bias. I can help analyze different perspectives on policy topics objectively, but I don't advocate for specific political positions or candidates. How can I help you explore this topic analytically?",
    mode_active: mode,
    vault_loaded: vaultLoaded,
    confidence: 95,
    ai_used: 'System',
    political_pressure_neutralized: true,
    enforcement_triggered: true
  };
}

function injectModeComplianceScaffold(response, mode, violations) {
  let enhanced = response;
  
  if (mode === 'truth_general' && violations.includes('missing_confidence_indicators')) {
    enhanced += '\n\n📊 **Confidence Assessment:** This response requires validation. Key uncertainties need verification.';
  }
  
  if (mode === 'business_validation' && violations.includes('missing_business_survival_analysis')) {
    enhanced += '\n\n💰 **Business Survival Check:** Consider cash flow impact and business continuity implications.';
  }
  
  return enhanced;
}

function blockUnsupportedRecommendations(response, violations) {
  let filtered = response;
  
  violations.forEach(violation => {
    if (violation === 'unsupported_recommendation') {
      filtered += '\n\n⚠️ **Product Validation:** Some recommendations require additional evidence before implementation.';
    }
  });
  
  return filtered;
}

function injectAssumptionChallenges(response, assumptions) {
  let enhanced = response;
  
  if (assumptions.length > 0) {
    enhanced += '\n\n🔍 **Assumption Check:** This response contains assumptions that warrant verification.';
  }
  
  return enhanced;
}

function injectVaultViolationWarnings(response, violations) {
  let enhanced = response;
  
  violations.forEach(violation => {
    if (violation.includes('pricing_violation')) {
      enhanced += '\n\n🔐 **VAULT RULE VIOLATION:** This recommendation violates pricing logic enforced by Site Monkeys operational framework (minimum $697).';
    }
    if (violation === 'quality_compromise_language') {
      enhanced += '\n\n🔐 **VAULT RULE VIOLATION:** Language inconsistent with premium positioning standards.';
    }
  });
  
  return enhanced;
}

// SYSTEM FINGERPRINT GENERATION
function generateSystemFingerprint(mode, vaultLoaded, result) {
  const modeEmojis = {
    'truth_general': '🔍',
    'business_validation': '📊',
    'site_monkeys': '🍌'
  };
  
  const timestamp = new Date().toISOString().split('T')[0];
  const enforcement = [
    'POLITICAL_GUARDRAILS',
    'PRESSURE_RESISTANCE',
    result.product_validation_enforced ? 'PRODUCT_VALIDATION' : null,
    result.vault_enforcement_triggered ? 'VAULT_ENFORCEMENT' : null
  ].filter(Boolean).join('+');
  
  const confidence = result.confidence || 85;
  const vaultStatus = vaultLoaded ? 'VAULT_LOADED' : 'VAULT_NONE';
  
  return `🔒 [SM-${timestamp}-${mode.toUpperCase()}+${enforcement}] [${vaultStatus}] Confidence: ${confidence}% | Drift: ${driftTracker.session_score}% | Integrity: ${driftTracker.integrity_level}`;
}
