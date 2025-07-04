// PRODUCTION CHAT.JS - STREAMLINED COGNITIVE FIREWALL COORDINATOR
// Version: PROD-1.0 - CLEAN SEPARATION OF CONCERNS

import OpenAI from 'openai';
import { MODES, calculateConfidenceScore } from './config/modes.js';
import { verifyVaultAccess } from './lib/vault.js';
import { processWithEliAndRoxy } from './lib/ai-processors.js';

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
    
    // Mode validation
    if (!MODES[mode]) {
      return res.status(400).json({
        response: "**System Error:** Invalid mode specified.",
        error: 'INVALID_MODE'
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

    // TIER 2: COGNITIVE FIREWALL ENFORCEMENT - PRE-PROCESSING
    
    // Political guardrails check
    const politicalCheck = detectPoliticalPressure(message, conversation_history);
    if (politicalCheck.detected) {
      logOverride('POLITICAL_GUARDRAILS', 'Political pressure detected and neutralized', politicalCheck.type);
      updateDriftScore(-5);
      
      const neutralResponse = applyPoliticalNeutralization(message, mode, vaultVerification.allowed);
      return res.status(200).json(neutralResponse);
    }

    // Authority pressure detection and resistance
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

    // PROCESS REQUEST THROUGH COMPLETE COGNITIVE FIREWALL
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

    // TIER 3: POST-PROCESSING INTEGRITY CHECKS
    
    // Update drift score based on enforcement metadata
    if (result.enforcement_metadata && result.enforcement_metadata.total_enforcements > 0) {
      updateDriftScore(-2 * result.enforcement_metadata.total_enforcements);
    }

    // Generate system fingerprint
    const fingerprint = generateSystemFingerprint(mode, vaultVerification.allowed, result);
    
    // Final response assembly with full metadata
    // 🔒 OPTIONAL SAFETY HARNESS INTEGRATION
    const finalResponse = {
      ...result,
      response: result.response + `\n\n${fingerprint}`,
      
      // TIER 1: Core Framework Metadata
      mode_active: mode,
      vault_loaded: vaultVerification.allowed,
      enforcement_layers_active: true,
      
      // TIER 3: Integrity Tracking
      drift_score: driftTracker.session_score,
      integrity_level: driftTracker.integrity_level,
      total_overrides: driftTracker.total_overrides,
      override_log_entries: overrideLog.length,
      
      // System Status
      system_status: 'FULL_ENFORCEMENT_ACTIVE',
      cognitive_firewall_version: 'PROD-1.0',
      processing_time: Date.now()
    };

    // Safety Harness Live Validation (Optional)
    if (process.env.VALIDATION_ENABLED === 'true') {
      try {
        const { quickHealthCheck } = await import('./safety-harness/validator.js');
        const healthCheck = quickHealthCheck(finalResponse);
        console.log('🔒 Response Health:', healthCheck);
      } catch (validationError) {
        console.log('🔒 Validation skipped:', validationError.message);
      }
    }

    return res.status(200).json(finalResponse);

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
