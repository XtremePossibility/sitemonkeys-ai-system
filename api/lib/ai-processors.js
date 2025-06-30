// ENHANCED AI PROCESSORS WITH FULL LOGIC INTEGRATION
// Version: PROD-1.0

import { analyzePromptType, generateEliResponse, generateRoxyResponse, generateClaudeResponse } from './personalities.js';
import { runOptimizationEnhancer } from './optimization.js';
import { checkAssumptionHealth, detectAssumptionConflicts, trackOverride } from './assumptions.js';
import { generateVaultContext, checkVaultTriggers, detectVaultConflicts } from './vault.js';
import { MODES, shouldSuggestClaude, calculateConfidenceScore } from '../config/modes.js';

// TOKEN TRACKING SYSTEM
let tokenTracker = {
  session: {
    eli_tokens: 0,
    roxy_tokens: 0,
    claude_tokens: 0,
    vault_tokens: 0
  },
  costs: {
    eli_cost: 0,
    roxy_cost: 0,
    claude_cost: 0,
    vault_cost: 0,
    total_session: 0
  },
  calls: {
    eli_calls: 0,
    roxy_calls: 0,
    claude_calls: 0
  }
};

// MAIN PROCESSING FUNCTION WITH ROUTING LOGIC
export async function processWithEliAndRoxy({
  message,
  mode,
  vaultVerification, 
  conversationHistory,
  userPreference,
  openai,
  claudeRequested = false,
  aiRobotClicked = false
}) {
  
  try {
    // STEP 1: ROUTING DECISION
    const routingDecision = determineAIRouting(message, mode, claudeRequested, aiRobotClicked);
    
    // STEP 2: VAULT AND CONTEXT SETUP
    const triggeredFrameworks = vaultVerification.allowed ? checkVaultTriggers(message) : [];
    const vaultContext = vaultVerification.allowed ? generateVaultContext(triggeredFrameworks) : '';
    
    // STEP 3: ASSUMPTION CHECKING
    const assumptionConflicts = detectAssumptionConflicts(message, mode);
    
    // STEP 4: GENERATE RESPONSE BASED ON ROUTING
    let result;
    
    if (routingDecision.usesClaude) {
      result = await generateClaudeResponse(message, mode, vaultContext, conversationHistory);
      updateTokenTracking('claude', result.tokens_used, result.cost);
    } else if (routingDecision.usesEli) {
      result = await generateEliResponse(message, mode, vaultContext, conversationHistory, openai);
      updateTokenTracking('eli', result.tokens_used || 500, result.cost || 0.015);
    } else {
      result = await generateRoxyResponse(message, mode, vaultContext, '', conversationHistory, openai);
      updateTokenTracking('roxy', result.tokens_used || 500, result.cost || 0.015);
    }
    
    // STEP 5: CONFIDENCE ANALYSIS
    const confidence = calculateConfidenceScore(result.response, {
      primarySources: result.has_sources || false,
      multipleVerifications: false,
      recentData: true,
      contradictoryInfo: false
    }, assumptionConflicts);
    
    // STEP 6: VAULT CONFLICT DETECTION
    const vaultConflicts = vaultVerification.allowed ? 
      detectVaultConflicts(message, mode, result.response) : [];
    
    // STEP 7: CLAUDE SUGGESTION LOGIC
    const claudeSuggestion = shouldSuggestClaude(result.response, confidence, mode, vaultConflicts);
    
    // STEP 8: OPTIMIZATION ENHANCEMENT
    const optimizedResult = runOptimizationEnhancer({
      mode,
      baseResponse: result.response,
      message,
      triggeredFrameworks,
      vaultLoaded: vaultVerification.allowed
    });
    
    // STEP 9: ASSUMPTION HEALTH CHECK
    const assumptionWarnings = checkAssumptionHealth();
    
    // STEP 10: RESPONSE ASSEMBLY
    const response = assembleResponse({
      baseResponse: optimizedResult.enhancedResponse,
      mode,
      vaultLoaded: vaultVerification.allowed,
      triggeredFrameworks,
      confidence,
      claudeSuggestion,
      vaultConflicts,
      assumptionWarnings,
      routingDecision
    });
    
    return {
      response: response.final,
      mode_active: mode,
      vault_loaded: vaultVerification.allowed,
      security_pass: true,
      triggered_frameworks: triggeredFrameworks.map(tf => tf.name),
      assumption_warnings: assumptionWarnings.filter(w => w.severity === 'HIGH' || w.severity === 'CRITICAL'),
      confidence_score: confidence,
      claude_suggestion: claudeSuggestion.suggest ? claudeSuggestion.message : null,
      vault_conflicts: vaultConflicts,
      token_usage: tokenTracker.session,
      session_cost: tokenTracker.costs.total_session,
      ai_used: routingDecision.aiUsed,
      optimization_applied: optimizedResult.optimization_tags.length > 0
    };
    
  } catch (error) {
    console.error('❌ AI Processing error:', error);
    
    return {
      response: `I encountered a technical error and I won't pretend it didn't happen. Error: ${error.message}. I'd rather be honest about system issues than give you unreliable information. Please try again.`,
      mode_active: mode,
      vault_loaded: vaultVerification.allowed,
      security_pass: false,
      fallback_used: true,
      error: error.message
    };
  }
}

// AI ROUTING LOGIC
function determineAIRouting(message, mode, claudeRequested, aiRobotClicked) {
  // Manual Claude activation always wins
  if (claudeRequested || aiRobotClicked) {
    return {
      usesClaude: true,
      usesEli: false,
      usesRoxy: false,
      aiUsed: 'Claude (Manual)',
      reason: claudeRequested ? 'User requested Claude' : 'AI Robot clicked'
    };
  }
  
  // Automatic routing between Eli and Roxy
  const promptType = analyzePromptType(message);
  
  if (promptType === 'eli_leads' || promptType === 'balanced') {
    return {
      usesClaude: false,
      usesEli: true,
      usesRoxy: false,
      aiUsed: 'Eli',
      reason: 'Analytical content detected'
    };
  } else {
    return {
      usesClaude: false,
      usesEli: false,
      usesRoxy: true,
      aiUsed: 'Roxy',
      reason: 'Creative/strategic content detected'
    };
  }
}

// TOKEN TRACKING SYSTEM
function updateTokenTracking(aiType, tokens, cost) {
  tokenTracker.session[`${aiType}_tokens`] += tokens;
  tokenTracker.costs[`${aiType}_cost`] += cost;
  tokenTracker.calls[`${aiType}_calls`] += 1;
  
  // Update total session cost
  tokenTracker.costs.total_session = 
    tokenTracker.costs.eli_cost + 
    tokenTracker.costs.roxy_cost + 
    tokenTracker.costs.claude_cost + 
    tokenTracker.costs.vault_cost;
}

// RESPONSE ASSEMBLY WITH FINGERPRINTING
function assembleResponse({
  baseResponse,
  mode,
  vaultLoaded,
  triggeredFrameworks,
  confidence,
  claudeSuggestion,
  vaultConflicts,
  assumptionWarnings,
  routingDecision
}) {
  
  let response = baseResponse;
  
  // Add mode fingerprint
  const modeEmoji = MODES[mode]?.emoji || '🤖';
  const fingerprint = `\n\n[MODE: ${mode.toUpperCase()} ${modeEmoji}] | [VAULT: ${vaultLoaded ? 'LOADED' : 'NONE'}] | [CONFIDENCE: ${confidence}%] | [AI: ${routingDecision.aiUsed}]`;
  
  // Add vault framework indicators
  if (triggeredFrameworks.length > 0) {
    const frameworkNames = triggeredFrameworks.map(tf => tf.name).join(', ');
    response += `\n\n🍌 **Vault Logic Applied:** ${frameworkNames}`;
  }
  
  // Add vault conflicts if any
  if (vaultConflicts.length > 0) {
    response += `\n\n⚠️ **Vault Conflicts Detected:** ${vaultConflicts.length} issue(s) found. Consider reviewing approach for vault compliance.`;
  }
  
  // Add confidence warning if low
  if (confidence < 70) {
    response += `\n\n📊 **Confidence: ${confidence}%** - This response contains uncertainties that may warrant additional verification.`;
  }
  
  // Add Claude suggestion if triggered
  if (claudeSuggestion.suggest) {
    response += `\n\n🤖 **Enhancement Available:** ${claudeSuggestion.message}`;
  }
  
  // Add critical assumption warnings
  const criticalWarnings = assumptionWarnings.filter(w => w.severity === 'CRITICAL');
  if (criticalWarnings.length > 0) {
    response += `\n\n🚨 **Critical Assumption Alert:** ${criticalWarnings.length} assumption(s) require immediate attention.`;
  }
  
  return {
    final: response + fingerprint,
    components: {
      base: baseResponse,
      vault_indicators: triggeredFrameworks.length > 0,
      conflicts: vaultConflicts.length > 0,
      confidence_warning: confidence < 70,
      claude_suggested: claudeSuggestion.suggest,
      critical_assumptions: criticalWarnings.length > 0
    }
  };
}

// COST ESTIMATION FUNCTIONS
export function estimateClaudeCost(message, vaultContext, conversationHistory) {
  const inputTokens = estimateTokens(message + vaultContext + JSON.stringify(conversationHistory));
  const estimatedOutputTokens = 1000; // Conservative estimate
  
  const inputCost = inputTokens * 0.000003; // Claude input pricing
  const outputCost = estimatedOutputTokens * 0.000015; // Claude output pricing
  
  return {
    estimated_total: inputCost + outputCost,
    input_cost: inputCost,
    output_cost: outputCost,
    input_tokens: inputTokens,
    estimated_output_tokens: estimatedOutputTokens
  };
}

function estimateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// SESSION COST MANAGEMENT
export function getSessionCostSummary() {
  return {
    total_cost: tokenTracker.costs.total_session,
    breakdown: {
      eli: { cost: tokenTracker.costs.eli_cost, calls: tokenTracker.calls.eli_calls },
      roxy: { cost: tokenTracker.costs.roxy_cost, calls: tokenTracker.calls.roxy_calls },
      claude: { cost: tokenTracker.costs.claude_cost, calls: tokenTracker.calls.claude_calls }
    },
    tokens: tokenTracker.session,
    last_call_cost: getLastCallCost(),
    session_warnings: generateCostWarnings()
  };
}

function getLastCallCost() {
  const lastCosts = [
    tokenTracker.costs.eli_cost / Math.max(tokenTracker.calls.eli_calls, 1),
    tokenTracker.costs.roxy_cost / Math.max(tokenTracker.calls.roxy_calls, 1),
    tokenTracker.costs.claude_cost / Math.max(tokenTracker.calls.claude_calls, 1)
  ];
  
  return Math.max(...lastCosts);
}

function generateCostWarnings() {
  const warnings = [];
  
  if (tokenTracker.costs.total_session > 2.00) {
    warnings.push(`Session cost ${tokenTracker.costs.total_session.toFixed(2)} exceeds $2.00 threshold`);
  }
  
  if (tokenTracker.costs.claude_cost > 1.00) {
    warnings.push(`Claude usage ${tokenTracker.costs.claude_cost.toFixed(2)} is high this session`);
  }
  
  return warnings;
}

// OVERRIDE HANDLING
export function handleUserOverride(overrideType, originalLogic, userChoice, justification = "") {
  trackOverride(overrideType, originalLogic, userChoice, justification);
  
  return {
    override_accepted: true,
    override_logged: true,
    pattern_check: checkForOverridePatterns(overrideType),
    message: `Override acknowledged: ${userChoice}. Reasoning logged for pattern analysis.`
  };
}

function checkForOverridePatterns(overrideType) {
  // This would connect to the assumption tracking system
  const recentOverrides = []; // Would get from assumption tracker
  const pattern = recentOverrides.filter(o => o.type === overrideType).length;
  
  if (pattern >= 3) {
    return {
      pattern_detected: true,
      frequency: pattern,
      recommendation: `Consider reviewing ${overrideType} settings - overridden ${pattern} times recently`
    };
  }
  
  return { pattern_detected: false };
}

// COMPLEXITY DETECTION FOR CLAUDE SUGGESTIONS
export function detectComplexityTriggers(message, response, mode) {
  const triggers = [];
  
  // Financial complexity
  if (message.includes('financial') && message.includes('model')) {
    triggers.push('financial_modeling');
  }
  
  // Multi-variable analysis
  const variableCount = (message.match(/and|or|but|however/gi) || []).length;
  if (variableCount >= 3) {
    triggers.push('multi_variable_analysis');
  }
  
  // Legal/regulatory complexity
  if (message.includes('legal') || message.includes('compliance') || message.includes('regulation')) {
    triggers.push('legal_complexity');
  }
  
  // Strategic decision complexity
  if (message.includes('strategy') && message.includes('decision') && message.length > 200) {
    triggers.push('strategic_complexity');
  }
  
  // Vault conflicts detected
  if (mode === 'site_monkeys') {
    const conflicts = detectVaultConflicts(message, mode, response);
    if (conflicts.length > 0) {
      triggers.push('vault_conflicts');
    }
  }
  
  return triggers;
}

// RESET SESSION TRACKING
export function resetSessionTracking() {
  tokenTracker = {
    session: {
      eli_tokens: 0,
      roxy_tokens: 0,
      claude_tokens: 0,
      vault_tokens: 0
    },
    costs: {
      eli_cost: 0,
      roxy_cost: 0,
      claude_cost: 0,
      vault_cost: 0,
      total_session: 0
    },
    calls: {
      eli_calls: 0,
      roxy_calls: 0,
      claude_calls: 0
    }
  };
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
