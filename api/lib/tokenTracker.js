```javascript
// PRODUCTION TOKEN TRACKER - Site Monkeys AI System
// Zero-failure session tracking with cost management and enforcement

let sessionData = {
  totalCalls: 0,
  totalTokens: 0,
  totalCost: 0,
  sessionStart: Date.now(),
  lastCall: null,
  costs: {
    eli: 0,
    roxy: 0,
    claude: 0
  },
  tokens: {
    eli: 0,
    roxy: 0,
    claude: 0
  },
  calls: {
    eli: 0,
    roxy: 0,
    claude: 0
  },
  vaultTokensUsed: 0,
  errorCount: 0,
  lastError: null
};

// Pricing constants (per 1K tokens)
const PRICING = {
  eli: {
    input: 0.001,
    output: 0.002
  },
  roxy: {
    input: 0.001,
    output: 0.002
  },
  claude: {
    input: 0.003,
    output: 0.015
  }
};

/**
 * Track API call with detailed cost and token analysis
 * @param {string} personality - 'eli', 'roxy', or 'claude'
 * @param {number} promptTokens - Input tokens used
 * @param {number} completionTokens - Output tokens generated
 * @param {number} vaultTokens - Vault context tokens included
 * @returns {object} Complete tracking result with costs and session data
 */
export function trackApiCall(personality, promptTokens, completionTokens, vaultTokens = 0) {
  try {
    if (!personality || !['eli', 'roxy', 'claude'].includes(personality)) {
      throw new Error('Invalid personality: ' + personality);
    }
    
    if (typeof promptTokens !== 'number' || promptTokens < 0) {
      throw new Error('Invalid promptTokens: ' + promptTokens);
    }
    
    if (typeof completionTokens !== 'number' || completionTokens < 0) {
      throw new Error('Invalid completionTokens: ' + completionTokens);
    }
    
    const totalTokens = promptTokens + completionTokens;
    
    const pricing = PRICING[personality];
    const inputCost = (promptTokens * pricing.input) / 1000;
    const outputCost = (completionTokens * pricing.output) / 1000;
    const callCost = inputCost + outputCost;
    
    sessionData.totalCalls++;
    sessionData.totalTokens += totalTokens;
    sessionData.totalCost += callCost;
    sessionData.lastCall = {
      timestamp: Date.now(),
      personality,
      promptTokens,
      completionTokens,
      totalTokens,
      callCost,
      vaultTokens
    };
    
    sessionData.costs[personality] += callCost;
    sessionData.tokens[personality] += totalTokens;
    sessionData.calls[personality]++;
    sessionData.vaultTokensUsed += vaultTokens;
    
    const warnings = [];
    
    if (callCost > 0.25) {
      warnings.push('High cost call: $' + callCost.toFixed(4));
    }
    
    if (sessionData.totalCost > 2.00) {
      warnings.push('Session cost high: $' + sessionData.totalCost.toFixed(4));
    }
    
    if (personality === 'claude' && callCost > 0.50) {
      warnings.push('Claude cost exceeded limit: $' + callCost.toFixed(4));
    }
    
    console.log('💰 Token Tracking - ' + personality + ': ' + promptTokens + '+' + completionTokens + '=' + totalTokens + ' tokens, $' + callCost.toFixed(4));
    console.log('📊 Session Total: ' + sessionData.totalCalls + ' calls, ' + sessionData.totalTokens + ' tokens, $' + sessionData.totalCost.toFixed(4));
    
    if (warnings.length > 0) {
      console.log('⚠️ Cost Warnings: ' + warnings.join(', '));
    }
    
    return {
      tokens_used: totalTokens,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      call_cost: callCost,
      input_cost: inputCost,
      output_cost: outputCost,
      vault_tokens: vaultTokens,
      session_total: sessionData.totalCost,
      session_calls: sessionData.totalCalls,
      cumulative_tokens: sessionData.totalTokens,
      warnings: warnings,
      cost_warning: callCost > 0.25,
      session_warning: sessionData.totalCost > 2.00,
      success: true,
      tracked_at: Date.now()
    };
    
  } catch (error) {
    sessionData.errorCount++;
    sessionData.lastError = {
      timestamp: Date.now(),
      error: error.message,
      personality,
      promptTokens,
      completionTokens
    };
    
    console.error('❌ Token tracking error:', error.message);
    
    return {
      tokens_used: promptTokens + completionTokens,
      prompt_tokens: promptTokens || 0,
      completion_tokens: completionTokens || 0,
      call_cost: 0,
      session_total: sessionData.totalCost,
      session_calls: sessionData.totalCalls,
      cumulative_tokens: sessionData.totalTokens,
      warnings: ['Tracking error: ' + error.message],
      success: false,
      error: error.message,
      tracked_at: Date.now()
    };
  }
}

/**
 * Get current session data formatted for UI display
 * @returns {object} Session data formatted for frontend consumption
 */
export function formatSessionDataForUI() {
  try {
    const sessionDuration = Date.now() - sessionData.sessionStart;
    const sessionHours = sessionDuration / (1000 * 60 * 60);
    
    return {
      session: {
        total_calls: sessionData.totalCalls,
        total_tokens: sessionData.totalTokens,
        total_cost: '$' + sessionData.totalCost.toFixed(4),
        session_duration_minutes: Math.round(sessionDuration / (1000 * 60)),
        vault_tokens_used: sessionData.vaultTokensUsed,
        error_count: sessionData.errorCount
      },
      personalities: {
        eli: {
          calls: sessionData.calls.eli,
          tokens: sessionData.tokens.eli,
          cost: '$' + sessionData.costs.eli.toFixed(4)
        },
        roxy: {
          calls: sessionData.calls.roxy,
          tokens: sessionData.tokens.roxy,
          cost: '$' + sessionData.costs.roxy.toFixed(4)
        },
        claude: {
          calls: sessionData.calls.claude,
          tokens: sessionData.tokens.claude,
          cost: '$' + sessionData.costs.claude.toFixed(4)
        }
      },
      last_call: sessionData.lastCall ? {
        personality: sessionData.lastCall.personality,
        tokens: sessionData.lastCall.totalTokens,
        cost: '$' + sessionData.lastCall.callCost.toFixed(4),
        timestamp: new Date(sessionData.lastCall.timestamp).toISOString()
      } : null,
      cost_efficiency: {
        cost_per_token: sessionData.totalTokens > 0 ? (sessionData.totalCost / sessionData.totalTokens) : 0,
        tokens_per_hour: sessionHours > 0 ? (sessionData.totalTokens / sessionHours) : 0,
        calls_per_hour: sessionHours > 0 ? (sessionData.totalCalls / sessionHours) : 0
      },
      warnings: {
        high_session_cost: sessionData.totalCost > 2.00,
        high_error_rate: sessionData.errorCount > 3,
        claude_usage_high: sessionData.costs.claude > 1.00
      }
    };
    
  } catch (error) {
    console.error('❌ Session data formatting error:', error.message);
    
    return {
      session: {
        total_calls: sessionData.totalCalls || 0,
        total_tokens: sessionData.totalTokens || 0,
        total_cost: '$' + (sessionData.totalCost || 0).toFixed(4),
        error: error.message
      },
      personalities: {
        eli: { calls: 0, tokens: 0, cost: '$0.0000' },
        roxy: { calls: 0, tokens: 0, cost: '$0.0000' },
        claude: { calls: 0, tokens: 0, cost: '$0.0000' }
      },
      last_call: null,
      warnings: {
        formatting_error: true
      }
    };
  }
}

/**
 * Reset session data for testing or new sessions
 * @returns {object} Reset confirmation with previous session data
 */
export function resetSessionData() {
  const oldSessionData = {
    totalCalls: sessionData.totalCalls,
    totalTokens: sessionData.totalTokens,
    totalCost: sessionData.totalCost
  };
  
  sessionData.totalCalls = 0;
  sessionData.totalTokens = 0;
  sessionData.totalCost = 0;
  sessionData.sessionStart = Date.now();
  sessionData.lastCall = null;
  sessionData.costs = { eli: 0, roxy: 0, claude: 0 };
  sessionData.tokens = { eli: 0, roxy: 0, claude: 0 };
  sessionData.calls = { eli: 0, roxy: 0, claude: 0 };
  sessionData.vaultTokensUsed = 0;
  sessionData.errorCount = 0;
  sessionData.lastError = null;
  
  console.log('🔄 Session data reset');
  console.log('📊 Previous session: ' + oldSessionData.totalCalls + ' calls, $' + oldSessionData.totalCost.toFixed(4));
  
  return {
    reset: true,
    previous_session: {
      calls: oldSessionData.totalCalls,
      cost: oldSessionData.totalCost,
      tokens: oldSessionData.totalTokens
    },
    new_session_start: Date.now()
  };
}

/**
 * Get cost estimate for a planned API call
 * @param {string} personality - 'eli', 'roxy', or 'claude'
 * @param {number} estimatedTokens - Estimated total tokens for the call
 * @returns {object} Cost estimation data
 */
export function estimateCallCost(personality, estimatedTokens) {
  try {
    if (!personality || !['eli', 'roxy', 'claude'].includes(personality)) {
      throw new Error('Invalid personality: ' + personality);
    }
    
    if (typeof estimatedTokens !== 'number' || estimatedTokens < 0) {
      throw new Error('Invalid estimatedTokens: ' + estimatedTokens);
    }
    
    const pricing = PRICING[personality];
    
    const estimatedInput = Math.ceil(estimatedTokens * 0.7);
    const estimatedOutput = Math.ceil(estimatedTokens * 0.3);
    
    const inputCost = (estimatedInput * pricing.input) / 1000;
    const outputCost = (estimatedOutput * pricing.output) / 1000;
    const totalCost = inputCost + outputCost;
    
    return {
      personality,
      estimated_tokens: estimatedTokens,
      estimated_input_tokens: estimatedInput,
      estimated_output_tokens: estimatedOutput,
      estimated_cost: totalCost,
      input_cost: inputCost,
      output_cost: outputCost,
      cost_per_token: totalCost / estimatedTokens,
      affordable: totalCost < (personality === 'claude' ? 0.50 : 0.25),
      warning: totalCost > (personality === 'claude' ? 0.25 : 0.10)
    };
    
  } catch (error) {
    console.error('❌ Cost estimation error:', error.message);
    
    return {
      personality,
      estimated_tokens: estimatedTokens || 0,
      estimated_cost: 0,
      error: error.message,
      affordable: false,
      warning: true
    };
  }
}

/**
 * Get session health metrics
 * @returns {object} Health and performance metrics
 */
export function getSessionHealth() {
  const sessionDuration = Date.now() - sessionData.sessionStart;
  const errorRate = sessionData.totalCalls > 0 ? (sessionData.errorCount / sessionData.totalCalls) : 0;
  const avgCostPerCall = sessionData.totalCalls > 0 ? (sessionData.totalCost / sessionData.totalCalls) : 0;
  const avgTokensPerCall = sessionData.totalCalls > 0 ? (sessionData.totalTokens / sessionData.totalCalls) : 0;
  
  let healthScore = 100;
  
  if (errorRate > 0.1) healthScore -= 30;
  if (avgCostPerCall > 0.15) healthScore -= 20;
  if (sessionData.totalCost > 3.00) healthScore -= 25;
  if (sessionData.costs.claude > 2.00) healthScore -= 15;
  
  healthScore = Math.max(0, healthScore);
  
  return {
    health_score: healthScore,
    session_duration_minutes: Math.round(sessionDuration / (1000 * 60)),
    error_rate: errorRate,
    avg_cost_per_call: avgCostPerCall,
    avg_tokens_per_call: avgTokensPerCall,
    total_calls: sessionData.totalCalls,
    total_cost: sessionData.totalCost,
    recommendations: generateHealthRecommendations(healthScore, errorRate, avgCostPerCall),
    status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical',
    last_updated: Date.now()
  };
}

/**
 * Generate health recommendations based on metrics
 * @param {number} healthScore - Current health score
 * @param {number} errorRate - Current error rate
 * @param {number} avgCostPerCall - Average cost per call
 * @returns {Array} Array of recommendation strings
 */
function generateHealthRecommendations(healthScore, errorRate, avgCostPerCall) {
  const recommendations = [];
  
  if (healthScore < 70) {
    recommendations.push('Session health is degraded - consider reviewing usage patterns');
  }
  
  if (errorRate > 0.1) {
    recommendations.push('High error rate detected - check API configurations and network stability');
  }
  
  if (avgCostPerCall > 0.15) {
    recommendations.push('High cost per call - consider using Eli/Roxy instead of Claude for routine queries');
  }
  
  if (sessionData.totalCost > 2.00) {
    recommendations.push('Session cost is high - monitor usage and consider cost controls');
  }
  
  if (sessionData.costs.claude > 1.00) {
    recommendations.push('Claude usage is expensive - reserve for complex queries requiring advanced reasoning');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Session performance is healthy - continue current usage patterns');
  }
  
  return recommendations;
}

/**
 * Export session data for debugging (non-production)
 * @returns {object} Complete debug data including session state and health
 */
export function getDebugSessionData() {
  return {
    totalCalls: sessionData.totalCalls,
    totalTokens: sessionData.totalTokens,
    totalCost: sessionData.totalCost,
    sessionStart: sessionData.sessionStart,
    lastCall: sessionData.lastCall,
    costs: sessionData.costs,
    tokens: sessionData.tokens,
    calls: sessionData.calls,
    vaultTokensUsed: sessionData.vaultTokensUsed,
    errorCount: sessionData.errorCount,
    lastError: sessionData.lastError,
    pricing: PRICING,
    health: getSessionHealth()
  };
}
```