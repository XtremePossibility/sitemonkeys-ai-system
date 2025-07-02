// tokenTracker.js - Session Token and Cost Management

class TokenTracker {
  constructor() {
    this.sessionData = {
      session_start: new Date().toISOString(),
      total_tokens: 0,
      total_cost: 0,
      last_call_cost: 0,
      vault_token_load: 0,
      responder_breakdown: {
        eli: { calls: 0, tokens: 0, cost: 0 },
        roxy: { calls: 0, tokens: 0, cost: 0 },
        claude: { calls: 0, tokens: 0, cost: 0 }
      },
      call_history: []
    };
  }

  trackCall(responder, promptTokens, completionTokens, vaultTokens = 0) {
    // Calculate costs based on responder type
    let callCost = 0;
    
    if (responder === 'claude') {
      // Claude API pricing: $0.03/1K prompt, $0.06/1K completion
      callCost = (promptTokens * 0.03 + completionTokens * 0.06) / 1000;
    } else {
      // Eli/Roxy (OpenAI GPT-4): $0.03/1K prompt, $0.06/1K completion
      callCost = (promptTokens * 0.03 + completionTokens * 0.06) / 1000;
    }
    
    const totalTokensThisCall = promptTokens + completionTokens;
    
    // Update session totals
    this.sessionData.total_tokens += totalTokensThisCall;
    this.sessionData.total_cost += callCost;
    this.sessionData.last_call_cost = callCost;
    this.sessionData.vault_token_load += vaultTokens;
    
    // Update responder breakdown
    if (this.sessionData.responder_breakdown[responder]) {
      this.sessionData.responder_breakdown[responder].calls += 1;
      this.sessionData.responder_breakdown[responder].tokens += totalTokensThisCall;
      this.sessionData.responder_breakdown[responder].cost += callCost;
    }
    
    // Log call details
    this.sessionData.call_history.push({
      timestamp: new Date().toISOString(),
      responder: responder,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      vault_tokens: vaultTokens,
      cost: callCost,
      cumulative_cost: this.sessionData.total_cost
    });
    
    // Enforce session limits (optional safety)
    this.enforceSessionLimits();
    
    return {
      call_cost: callCost,
      session_total: this.sessionData.total_cost,
      tokens_used: totalTokensThisCall,
      cumulative_tokens: this.sessionData.total_tokens
    };
  }
  
  enforceSessionLimits() {
    // Warning thresholds
    if (this.sessionData.total_cost > 5.00) {
      console.warn('🚨 Session cost exceeds $5.00 - consider session reset');
    }
    
    if (this.sessionData.total_tokens > 50000) {
      console.warn('🚨 Session tokens exceed 50K - performance may degrade');
    }
  }
  
  getSessionReport() {
    const efficiencyMetrics = this.calculateEfficiency();
    
    return {
      session_summary: {
        duration_minutes: this.getSessionDurationMinutes(),
        total_calls: this.getTotalCalls(),
        total_tokens: this.sessionData.total_tokens,
        total_cost: `$${this.sessionData.total_cost.toFixed(4)}`,
        last_call_cost: `$${this.sessionData.last_call_cost.toFixed(4)}`,
        vault_token_load: this.sessionData.vault_token_load
      },
      responder_breakdown: this.formatResponderBreakdown(),
      efficiency_metrics: efficiencyMetrics,
      cost_projections: this.generateCostProjections()
    };
  }
  
  formatResponderBreakdown() {
    const breakdown = {};
    
    Object.keys(this.sessionData.responder_breakdown).forEach(responder => {
      const data = this.sessionData.responder_breakdown[responder];
      breakdown[responder] = {
        calls: data.calls,
        tokens: data.tokens,
        cost: `$${data.cost.toFixed(4)}`,
        avg_tokens_per_call: data.calls > 0 ? Math.round(data.tokens / data.calls) : 0,
        avg_cost_per_call: data.calls > 0 ? `$${(data.cost / data.calls).toFixed(4)}` : '$0.0000'
      };
    });
    
    return breakdown;
  }
  
  calculateEfficiency() {
    const totalCalls = this.getTotalCalls();
    const sessionDuration = this.getSessionDurationMinutes();
    
    return {
      tokens_per_minute: sessionDuration > 0 ? Math.round(this.sessionData.total_tokens / sessionDuration) : 0,
      cost_per_minute: sessionDuration > 0 ? `$${(this.sessionData.total_cost / sessionDuration).toFixed(4)}` : '$0.0000',
      avg_tokens_per_call: totalCalls > 0 ? Math.round(this.sessionData.total_tokens / totalCalls) : 0,
      vault_efficiency: this.sessionData.vault_token_load > 0 ? 
        Math.round((this.sessionData.total_tokens - this.sessionData.vault_token_load) / this.sessionData.total_tokens * 100) : 100
    };
  }
  
  generateCostProjections() {
    const avgCostPerCall = this.getTotalCalls() > 0 ? this.sessionData.total_cost / this.getTotalCalls() : 0;
    
    return {
      next_10_calls: `$${(avgCostPerCall * 10).toFixed(4)}`,
      projected_hourly_burn: this.getSessionDurationMinutes() > 0 ? 
        `$${((this.sessionData.total_cost / this.getSessionDurationMinutes()) * 60).toFixed(4)}` : '$0.0000',
      session_limit_remaining: `$${Math.max(0, 10.00 - this.sessionData.total_cost).toFixed(4)}`
    };
  }
  
  getTotalCalls() {
    return Object.values(this.sessionData.responder_breakdown)
      .reduce((total, responder) => total + responder.calls, 0);
  }
  
  getSessionDurationMinutes() {
    const startTime = new Date(this.sessionData.session_start);
    const now = new Date();
    return Math.round((now - startTime) / 60000); // Convert to minutes
  }
  
  resetSession() {
    const oldSessionCost = this.sessionData.total_cost;
    this.sessionData = {
      session_start: new Date().toISOString(),
      total_tokens: 0,
      total_cost: 0,
      last_call_cost: 0,
      vault_token_load: 0,
      responder_breakdown: {
        eli: { calls: 0, tokens: 0, cost: 0 },
        roxy: { calls: 0, tokens: 0, cost: 0 },
        claude: { calls: 0, tokens: 0, cost: 0 }
      },
      call_history: []
    };
    
    console.log(`🔄 Session reset. Previous session cost: $${oldSessionCost.toFixed(4)}`);
    return { previous_session_cost: oldSessionCost, reset_timestamp: this.sessionData.session_start };
  }
  
  getVaultTokenLoad() {
    return this.sessionData.vault_token_load;
  }
  
  addVaultTokens(vaultTokens) {
    this.sessionData.vault_token_load += vaultTokens;
    return this.sessionData.vault_token_load;
  }
}

// Global session tracker instance
let globalSessionTracker = null;

export function getSessionTracker() {
  if (!globalSessionTracker) {
    globalSessionTracker = new TokenTracker();
  }
  return globalSessionTracker;
}

export function trackApiCall(responder, promptTokens, completionTokens, vaultTokens = 0) {
  const tracker = getSessionTracker();
  return tracker.trackCall(responder, promptTokens, completionTokens, vaultTokens);
}

export function getSessionReport() {
  const tracker = getSessionTracker();
  return tracker.getSessionReport();
}

export function resetSession() {
  const tracker = getSessionTracker();
  return tracker.resetSession();
}

export function getLastCallCost() {
  const tracker = getSessionTracker();
  return tracker.sessionData.last_call_cost;
}

export function getSessionTotalCost() {
  const tracker = getSessionTracker();
  return tracker.sessionData.total_cost;
}

export function getResponderTokenBreakdown() {
  const tracker = getSessionTracker();
  return tracker.formatResponderBreakdown();
}

// UI Integration hooks for live session display
export function getSessionDisplayData() {
  const tracker = getSessionTracker();
  return {
    session_cost: `${tracker.sessionData.total_cost.toFixed(4)}`,
    vault_tokens: tracker.sessionData.vault_token_load,
    total_tokens: tracker.sessionData.total_tokens,
    call_count: tracker.getTotalCalls(),
    last_call_cost: `${tracker.sessionData.last_call_cost.toFixed(4)}`,
    efficiency_rating: tracker.sessionData.total_cost > 0 ? 
      Math.round((tracker.sessionData.total_tokens / tracker.sessionData.total_cost) * 100) / 10000 : 0
  };
}

export function subscribeToSessionUpdates(callback) {
  // For real-time UI updates - call this function after each API response
  const tracker = getSessionTracker();
  const displayData = getSessionDisplayData();
  
  if (typeof callback === 'function') {
    callback(displayData);
  }
  
  return displayData;
}

export function formatSessionDataForUI() {
  const data = getSessionDisplayData();
  return {
    cost_display: data.session_cost,
    vault_display: `${data.vault_tokens} tokens`,
    efficiency_display: `${data.efficiency_rating} tokens/// tokenTracker.js - Session Token and Cost Management

class TokenTracker {
  constructor() {
    this.sessionData = {
      session_start: new Date().toISOString(),
      total_tokens: 0,
      total_cost: 0,
      last_call_cost: 0,
      vault_token_load: 0,
      responder_breakdown: {
        eli: { calls: 0, tokens: 0, cost: 0 },
        roxy: { calls: 0, tokens: 0, cost: 0 },
        claude: { calls: 0, tokens: 0, cost: 0 }
      },
      call_history: []
    };
  }

  trackCall(responder, promptTokens, completionTokens, vaultTokens = 0) {
    // Calculate costs based on responder type
    let callCost = 0;
    
    if (responder === 'claude') {
      // Claude API pricing: $0.03/1K prompt, $0.06/1K completion
      callCost = (promptTokens * 0.03 + completionTokens * 0.06) / 1000;
    } else {
      // Eli/Roxy (OpenAI GPT-4): $0.03/1K prompt, $0.06/1K completion
      callCost = (promptTokens * 0.03 + completionTokens * 0.06) / 1000;
    }
    
    const totalTokensThisCall = promptTokens + completionTokens;
    
    // Update session totals
    this.sessionData.total_tokens += totalTokensThisCall;
    this.sessionData.total_cost += callCost;
    this.sessionData.last_call_cost = callCost;
    this.sessionData.vault_token_load += vaultTokens;
    
    // Update responder breakdown
    if (this.sessionData.responder_breakdown[responder]) {
      this.sessionData.responder_breakdown[responder].calls += 1;
      this.sessionData.responder_breakdown[responder].tokens += totalTokensThisCall;
      this.sessionData.responder_breakdown[responder].cost += callCost;
    }
    
    // Log call details
    this.sessionData.call_history.push({
      timestamp: new Date().toISOString(),
      responder: responder,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      vault_tokens: vaultTokens,
      cost: callCost,
      cumulative_cost: this.sessionData.total_cost
    });
    
    // Enforce session limits (optional safety)
    this.enforceSessionLimits();
    
    return {
      call_cost: callCost,
      session_total: this.sessionData.total_cost,
      tokens_used: totalTokensThisCall,
      cumulative_tokens: this.sessionData.total_tokens
    };
  }
  
  enforceSessionLimits() {
    // Warning thresholds
    if (this.sessionData.total_cost > 5.00) {
      console.warn('🚨 Session cost exceeds $5.00 - consider session reset');
    }
    
    if (this.sessionData.total_tokens > 50000) {
      console.warn('🚨 Session tokens exceed 50K - performance may degrade');
    }
  }
  
  getSessionReport() {
    const efficiencyMetrics = this.calculateEfficiency();
    
    return {
      session_summary: {
        duration_minutes: this.getSessionDurationMinutes(),
        total_calls: this.getTotalCalls(),
        total_tokens: this.sessionData.total_tokens,
        total_cost: `$${this.sessionData.total_cost.toFixed(4)}`,
        last_call_cost: `$${this.sessionData.last_call_cost.toFixed(4)}`,
        vault_token_load: this.sessionData.vault_token_load
      },
      responder_breakdown: this.formatResponderBreakdown(),
      efficiency_metrics: efficiencyMetrics,
      cost_projections: this.generateCostProjections()
    };
  }
  
  formatResponderBreakdown() {
    const breakdown = {};
    
    Object.keys(this.sessionData.responder_breakdown).forEach(responder => {
      const data = this.sessionData.responder_breakdown[responder];
      breakdown[responder] = {
        calls: data.calls,
        tokens: data.tokens,
        cost: `$${data.cost.toFixed(4)}`,
        avg_tokens_per_call: data.calls > 0 ? Math.round(data.tokens / data.calls) : 0,
        avg_cost_per_call: data.calls > 0 ? `$${(data.cost / data.calls).toFixed(4)}` : '$0.0000'
      };
    });
    
    return breakdown;
  }
  
  calculateEfficiency() {
    const totalCalls = this.getTotalCalls();
    const sessionDuration = this.getSessionDurationMinutes();
    
    return {
      tokens_per_minute: sessionDuration > 0 ? Math.round(this.sessionData.total_tokens / sessionDuration) : 0,
      cost_per_minute: sessionDuration > 0 ? `$${(this.sessionData.total_cost / sessionDuration).toFixed(4)}` : '$0.0000',
      avg_tokens_per_call: totalCalls > 0 ? Math.round(this.sessionData.total_tokens / totalCalls) : 0,
      vault_efficiency: this.sessionData.vault_token_load > 0 ? 
        Math.round((this.sessionData.total_tokens - this.sessionData.vault_token_load) / this.sessionData.total_tokens * 100) : 100
    };
  }
  
  generateCostProjections() {
    const avgCostPerCall = this.getTotalCalls() > 0 ? this.sessionData.total_cost / this.getTotalCalls() : 0;
    
    return {
      next_10_calls: `$${(avgCostPerCall * 10).toFixed(4)}`,
      projected_hourly_burn: this.getSessionDurationMinutes() > 0 ? 
        `$${((this.sessionData.total_cost / this.getSessionDurationMinutes()) * 60).toFixed(4)}` : '$0.0000',
      session_limit_remaining: `$${Math.max(0, 10.00 - this.sessionData.total_cost).toFixed(4)}`
    };
  }
  
  getTotalCalls() {
    return Object.values(this.sessionData.responder_breakdown)
      .reduce((total, responder) => total + responder.calls, 0);
  }
  
  getSessionDurationMinutes() {
    const startTime = new Date(this.sessionData.session_start);
    const now = new Date();
    return Math.round((now - startTime) / 60000); // Convert to minutes
  }
  
  resetSession() {
    const oldSessionCost = this.sessionData.total_cost;
    this.sessionData = {
      session_start: new Date().toISOString(),
      total_tokens: 0,
      total_cost: 0,
      last_call_cost: 0,
      vault_token_load: 0,
      responder_breakdown: {
        eli: { calls: 0, tokens: 0, cost: 0 },
        roxy: { calls: 0, tokens: 0, cost: 0 },
        claude: { calls: 0, tokens: 0, cost: 0 }
      },
      call_history: []
    };
    
    console.log(`🔄 Session reset. Previous session cost: $${oldSessionCost.toFixed(4)}`);
    return { previous_session_cost: oldSessionCost, reset_timestamp: this.sessionData.session_start };
  }
  
  getVaultTokenLoad() {
    return this.sessionData.vault_token_load;
  }
  
  addVaultTokens(vaultTokens) {
    this.sessionData.vault_token_load += vaultTokens;
    return this.sessionData.vault_token_load;
  }
}

// Global session tracker instance
let globalSessionTracker = null;

export function getSessionTracker() {
  if (!globalSessionTracker) {
    globalSessionTracker = new TokenTracker();
  }
  return globalSessionTracker;
}

export function trackApiCall(responder, promptTokens, completionTokens, vaultTokens = 0) {
  const tracker = getSessionTracker();
  return tracker.trackCall(responder, promptTokens, completionTokens, vaultTokens);
}

export function getSessionReport() {
  const tracker = getSessionTracker();
  return tracker.getSessionReport();
}

export function resetSession() {
  const tracker = getSessionTracker();
  return tracker.resetSession();
}

export function getLastCallCost() {
  const tracker = getSessionTracker();
  return tracker.sessionData.last_call_cost;
}

export function getSessionTotalCost() {
  const tracker = getSessionTracker();
  return tracker.sessionData.total_cost;
}

export function getResponderTokenBreakdown() {
  const tracker = getSessionTracker();
  return tracker.formatResponderBreakdown();
}

,
    calls_display: `${data.call_count} calls`,
    status: data.session_cost > 5.0 ? 'HIGH_COST' : data.session_cost > 2.0 ? 'MEDIUM_COST' : 'NORMAL'
  };
}
