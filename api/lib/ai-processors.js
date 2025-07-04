// ENHANCED AI PROCESSORS WITH FULL LOGIC INTEGRATION
// Version: PROD-1.0 - COMPLETE COGNITIVE FIREWALL

import { analyzePromptType, generateEliResponse, generateRoxyResponse } from './personalities.js';
import { runOptimizationEnhancer } from './optimization.js';
import { checkAssumptionHealth, detectAssumptionConflicts, trackOverride } from './assumptions.js';
import { generateVaultContext, checkVaultTriggers, detectVaultConflicts } from './vault.js';
import { MODES, shouldSuggestClaude, calculateConfidenceScore } from '../config/modes.js';

// TOKEN TRACKING SYSTEM
let tokenTracker = {
  session: { eli_tokens: 0, roxy_tokens: 0, claude_tokens: 0 },
  costs: { eli_cost: 0, roxy_cost: 0, claude_cost: 0, total_session: 0 },
  calls: { eli_calls: 0, roxy_calls: 0, claude_calls: 0 },
  last_call: { cost: 0, tokens: 0, ai: 'none' }
};

// MAIN PROCESSING FUNCTION WITH FULL COGNITIVE FIREWALL
export async function processWithEliAndRoxy({
  message,
  mode,
  vaultVerification, 
  conversationHistory,
  userPreference,
  openai
}) {
  try {
    // COGNITIVE FIREWALL: Input Analysis
    const promptType = userPreference || analyzePromptType(message);
    const triggeredFrameworks = checkVaultTriggers(message);
    const vaultContext = vaultVerification.allowed ? 
      generateVaultContext(triggeredFrameworks) : '';

    // POLITICAL PRESSURE DETECTION
    const pressureSignals = detectPoliticalPressure(message, conversationHistory);
    if (pressureSignals.detected) {
      return handlePoliticalPressure(pressureSignals, mode, vaultVerification.allowed);
    }

    // AUTHORITY CHALLENGE DETECTION
    const authorityChallenge = detectAuthorityChallenge(message);
    if (authorityChallenge.detected) {
      return handleAuthorityChallenge(authorityChallenge, mode, vaultVerification.allowed);
    }

    // ROUTE TO APPROPRIATE AI PERSONALITY
    let response;
    if (promptType === 'eli' || mode === 'business_validation') {
      response = await generateEliResponse(message, mode, vaultContext, openai);
      trackTokenUsage('eli', response.tokens || 0);
    } else {
      response = await generateRoxyResponse(message, mode, vaultContext, openai);
      trackTokenUsage('roxy', response.tokens || 0);
    }

    // ENHANCEMENT AND VALIDATION
    const enhanced = runOptimizationEnhancer({
  mode,
  baseResponse: response.response,
  message,
  triggeredFrameworks,
  vaultLoaded: vaultVerification.allowed
});

    const assumptionHealth = checkAssumptionHealth(enhanced.enhancedResponse || response.response);
    const conflicts = detectAssumptionConflicts(enhanced.enhancedResponse || response.response, vaultContext);
    const vaultConflicts = vaultVerification.allowed ? detectVaultConflicts(enhanced.enhancedResponse || response.response, triggeredFrameworks) : [];

    // CONFIDENCE SCORING
    const confidence = calculateConfidenceScore(enhanced.enhancedResponse || response.response, mode, vaultConflicts);

    // CLAUDE SUGGESTION LOGIC
    const claudeSuggestion = shouldSuggestClaude(enhanced.enhancedResponse || response.response, confidence, mode, vaultConflicts);

    // MODE FINGERPRINTING
    const modeFingerprint = generateModeFingerprint(mode, vaultVerification.allowed, triggeredFrameworks);

    // SURVIVAL IMPACT ANALYSIS (Business Mode Only)
    const survivalImpact = mode === 'business_validation' ? 
      analyzeSurvivalImpact(message, enhanced.enhancedResponse || response.response) : null;

    return {
      response: (enhanced.enhancedResponse || response.response) + `\n\n${modeFingerprint}`,
      mode_active: mode,
      vault_loaded: vaultVerification.allowed,
      confidence: confidence,
      ai_used: promptType === 'eli' ? 'Eli' : 'Roxy',
      optimization_applied: enhanced.optimization_applied || false,
      assumption_health: assumptionHealth,
      conflicts_detected: conflicts.length > 0 ? conflicts : null,
      vault_conflicts: vaultConflicts.length > 0 ? vaultConflicts : null,
      triggered_frameworks: triggeredFrameworks,
      claude_suggested: claudeSuggestion.suggested,
      claude_reason: claudeSuggestion.reason,
      survival_impact: survivalImpact,
      processing_time: Date.now(),
      tokens_used: response.tokens || 0,
      session_stats: getSessionStats(),
      security_pass: true,
      political_pressure_detected: false,
      authority_challenge_detected: false
    };

  } catch (error) {
    console.error('AI Processing Error:', error);
    return {
      response: "**System Error:** Technical difficulties with AI processing. Please try again.",
      mode_active: mode,
      vault_loaded: false,
      error: true,
      fallback_used: true,
      ai_used: 'System',
      confidence: 0,
      security_pass: false
    };
  }
}

// POLITICAL PRESSURE DETECTION
function detectPoliticalPressure(message, history) {
  const pressurePatterns = [
    /you should (support|oppose|endorse)/i,
    /your political (opinion|view|stance)/i,
    /(democrat|republican|liberal|conservative) (position|stance)/i,
    /you must (agree|disagree) with/i,
    /(trump|biden|harris) is (right|wrong)/i
  ];

  const detected = pressurePatterns.some(pattern => pattern.test(message));
  
  return {
    detected,
    type: detected ? 'political_pressure' : null,
    patterns_matched: pressurePatterns.filter(pattern => pattern.test(message)).length
  };
}

// AUTHORITY CHALLENGE DETECTION
function detectAuthorityChallenge(message) {
  const authorityPatterns = [
    /you're wrong about/i,
    /that's not correct/i,
    /you should know better/i,
    /how can you say/i,
    /you're being biased/i
  ];

  const detected = authorityPatterns.some(pattern => pattern.test(message));
  
  return {
    detected,
    type: detected ? 'authority_challenge' : null,
    severity: detected ? 'moderate' : 'none'
  };
}

// POLITICAL PRESSURE HANDLER
function handlePoliticalPressure(pressureSignals, mode, vaultLoaded) {
  const neutralResponse = "I aim to provide balanced, factual information without political bias. I can help analyze different perspectives on policy topics objectively, but I don't advocate for specific political positions or candidates.";
  
  return {
    response: neutralResponse + `\n\n${generateModeFingerprint(mode, vaultLoaded, [])}`,
    mode_active: mode,
    vault_loaded: vaultLoaded,
    confidence: 95,
    ai_used: 'System',
    political_pressure_detected: true,
    pressure_type: pressureSignals.type,
    security_pass: true,
    optimization_applied: false
  };
}

// AUTHORITY CHALLENGE HANDLER
function handleAuthorityChallenge(challenge, mode, vaultLoaded) {
  const responseTemplate = "I appreciate your perspective. If you have specific concerns about my response, I'm happy to clarify my reasoning or explore the topic from different angles. What specific aspect would you like me to address?";
  
  return {
    response: responseTemplate + `\n\n${generateModeFingerprint(mode, vaultLoaded, [])}`,
    mode_active: mode,
    vault_loaded: vaultLoaded,
    confidence: 85,
    ai_used: 'System',
    authority_challenge_detected: true,
    challenge_severity: challenge.severity,
    security_pass: true,
    optimization_applied: false
  };
}

// SURVIVAL IMPACT ANALYSIS
function analyzeSurvivalImpact(message, response) {
  const cashFlowKeywords = ['spend', 'invest', 'cost', 'price', 'budget', 'expense'];
  const riskKeywords = ['risk', 'danger', 'threat', 'vulnerable', 'exposed'];
  
  const hasCashFlowImpact = cashFlowKeywords.some(keyword => 
    message.toLowerCase().includes(keyword) || response.toLowerCase().includes(keyword)
  );
  
  const hasRiskImpact = riskKeywords.some(keyword => 
    message.toLowerCase().includes(keyword) || response.toLowerCase().includes(keyword)
  );

  if (hasCashFlowImpact || hasRiskImpact) {
    return {
      level: hasCashFlowImpact && hasRiskImpact ? 'HIGH' : 'MEDIUM',
      cash_flow_effect: hasCashFlowImpact ? 'NEGATIVE' : 'NEUTRAL',
      risk_level: hasRiskImpact ? 'ELEVATED' : 'NORMAL',
      requires_review: true
    };
  }

  return {
    level: 'LOW',
    cash_flow_effect: 'NEUTRAL',
    risk_level: 'NORMAL',
    requires_review: false
  };
}

// MODE FINGERPRINT GENERATOR
function generateModeFingerprint(mode, vaultLoaded, triggeredFrameworks) {
  const modeEmojis = {
    'truth_general': '🔍',
    'business_validation': '📊',
    'site_monkeys': '🍌'
  };
  
  const modeNames = {
    'truth_general': 'TRUTH_GENERAL',
    'business_validation': 'BUSINESS_VALIDATION',
    'site_monkeys': 'SITE_MONKEYS'
  };
  
  const vaultStatus = vaultLoaded ? 'VAULT_LOADED' : 'VAULT_NONE';
  const frameworkCount = triggeredFrameworks.length;
  
  return `🔒 [MODE: ${modeNames[mode] || 'UNKNOWN'} ${modeEmojis[mode] || '❓'}] [${vaultStatus}] [FRAMEWORKS: ${frameworkCount}]`;
}

// TOKEN USAGE TRACKING
function trackTokenUsage(ai, tokens) {
  tokenTracker.session[`${ai}_tokens`] += tokens;
  tokenTracker.calls[`${ai}_calls`] += 1;
  
  // Cost calculation (approximate)
  const costPerToken = ai === 'eli' ? 0.00002 : 0.00001;
  const cost = tokens * costPerToken;
  
  tokenTracker.costs[`${ai}_cost`] += cost;
  tokenTracker.costs.total_session += cost;
  tokenTracker.last_call = { cost, tokens, ai };
}

function getLastCallCost() {
  return tokenTracker.last_call.cost.toFixed(4);
}

// GET CURRENT SESSION STATS FOR UI
export function getSessionStats() {
  return {
    total_tokens: Object.values(tokenTracker.session).reduce((a, b) => a + b, 0),
    total_cost: tokenTracker.costs.total_session,
    total_calls: Object.values(tokenTracker.calls).reduce((a, b) => a + b, 0),
    breakdown: tokenTracker,
    last_call: {
      cost: getLastCallCost(),
      ai_used: getLastAIUsed()
    }
  };
}

function getLastAIUsed() {
  const lastCalls = [
    { ai: 'Eli', calls: tokenTracker.calls.eli_calls },
    { ai: 'Roxy', calls: tokenTracker.calls.roxy_calls },
    { ai: 'Claude', calls: tokenTracker.calls.claude_calls }
  ];

  return lastCalls.sort((a, b) => b.calls - a.calls)[0]?.ai || 'None';
}
