import OpenAI from ‘openai’;

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

// COMPLETE PRODUCTION ENFORCEMENT IMPORTS
let PoliticalGuardrails, ProductValidator, ModeLinter, trackApiCall, getSessionDisplayData;

try {
const politicalModule = await import(’./lib/politicalGuardrails.js’);
PoliticalGuardrails = politicalModule.PoliticalGuardrails;
} catch (error) {
console.error(‘❌ Political guardrails import failed:’, error);
PoliticalGuardrails = null;
}

try {
const productModule = await import(’./lib/productValidation.js’);
ProductValidator = productModule.ProductValidator;
} catch (error) {
console.error(‘❌ Product validator import failed:’, error);
ProductValidator = null;
}

try {
const modeModule = await import(’./lib/modeLinter.js’);
ModeLinter = modeModule.ModeLinter;
} catch (error) {
console.error(‘❌ Mode linter import failed:’, error);
ModeLinter = null;
}

try {
const tokenModule = await import(’./lib/tokenTracker.js’);
trackApiCall = tokenModule.trackApiCall;
getSessionDisplayData = tokenModule.getSessionDisplayData;
} catch (error) {
console.error(‘❌ Token tracker import failed:’, error);
trackApiCall = null;
getSessionDisplayData = null;
}

// VAULT MANAGEMENT SYSTEM (Feature #1: Real modular loading)
const VAULT_REGISTRY = {
site_monkeys: {
vault_id: ‘SM-VAULT-v3.2’,
token_budget: 6000,
compatible_modes: [‘business_validation’, ‘site_monkeys’],
decision_frameworks: {
pricing_strategy: {
triggers: [‘pricing’, ‘cost’, ‘revenue’, ‘price’],
logic_framework: `
PRICING LOGIC ENFORCEMENT:

1. Always surface total cost of ownership (not just upfront cost)
1. Include opportunity cost analysis (what else could this money do)
1. Margin protection minimum 40% for consulting services
1. Never compete on price alone - compete on value delivery
1. Bundle pricing preferred over a-la-carte for predictable revenue`, override_behavior: 'VAULT_OVERRIDE', risk_level: 'HIGH' }, quality_standards: { triggers: ['quality', 'deliverable', 'standard', 'output'], logic_framework: `
   QUALITY ASSURANCE PROTOCOLS:
1. Every deliverable reviewed by senior team member before client delivery
1. Client feedback loop required within 48 hours of delivery
1. Quality issues trigger immediate correction protocol
1. No “good enough” - either meets Site Monkeys standard or gets reworked
1. Documentation required for all custom solutions`, override_behavior: 'NEVER_OVERRIDE', risk_level: 'CRITICAL' }, client_communication: { triggers: ['client', 'communication', 'update', 'email'], logic_framework: `
   CLIENT COMMUNICATION STANDARDS:
1. Response to client inquiries within 4 business hours maximum
1. Proactive weekly updates during active projects
1. Bad news communicated immediately with solution options
1. No surprises - early warning system for potential issues
1. Professional tone always - friendly but not casual`,
   override_behavior: ‘MERGE_WITH_MODE’,
   risk_level: ‘MEDIUM’
   }
   },
   conflict_resolution: {
   vault_vs_truth_mode: ‘vault_provides_business_context_mode_enforces_truth_standards’,
   vault_vs_business_mode: ‘vault_provides_site_monkeys_context_mode_provides_analysis_framework’
   },
   assumptions: {
   market_position: {
   assumption: ‘Site Monkeys serves overlooked small businesses’,
   last_validated: ‘2024-12-01’,
   expires_after_days: 90,
   validation_triggers: [‘market_analysis’, ‘competitor_research’]
   },
   pricing_power: {
   assumption: ‘Clients value quality over lowest price’,
   last_validated: ‘2024-11-15’,
   expires_after_days: 60,
   validation_triggers: [‘pricing_discussion’, ‘competitive_analysis’]
   }
   }
   }
   };

// OVERRIDE TRACKING SYSTEM (Feature #2: Complete override tracking)
class OverrideTracker {
constructor() {
this.session_overrides = [];
this.override_patterns = {};
}

logOverride(override_event) {
const override_record = {
override_id: `OVR-${Date.now()}`,
timestamp: new Date().toISOString(),
session_context: override_event.session_context || ‘unknown’,
original_rule: override_event.original_rule,
override_applied: override_event.override_applied,
justification: override_event.justification,
mode_violation: override_event.mode_violation || false,
vault_violation: override_event.vault_violation || false,
kernel_violation: override_event.kernel_violation || false,
impact_assessment: {
logic_integrity_score: override_event.integrity_score || 0.85,
truth_compromise: override_event.truth_compromise || 0.15,
risk_exposure: override_event.risk_exposure || ‘Medium’
},
decision_chain: override_event.decision_chain || [],
follow_up_required: override_event.follow_up_required || null
};

```
this.session_overrides.push(override_record);
this.updatePatterns(override_record);

console.log('📝 Override logged:', override_record.override_id);
return override_record;
```

}

updatePatterns(override_record) {
const pattern_key = override_record.original_rule;
if (!this.override_patterns[pattern_key]) {
this.override_patterns[pattern_key] = {
count: 0,
frequency: 0,
last_occurrence: null,
severity_trend: []
};
}

```
this.override_patterns[pattern_key].count += 1;
this.override_patterns[pattern_key].last_occurrence = override_record.timestamp;
this.override_patterns[pattern_key].severity_trend.push(override_record.impact_assessment.logic_integrity_score);
```

}

detectPatterns() {
const patterns = [];

```
Object.entries(this.override_patterns).forEach(([rule, pattern]) => {
  if (pattern.count >= 3) {
    patterns.push({
      type: 'FREQUENT_OVERRIDE',
      rule: rule,
      count: pattern.count,
      severity: 'HIGH',
      message: `Rule "${rule}" overridden ${pattern.count} times - may indicate systemic issue`
    });
  }
});

return patterns;
```

}

getSessionSummary() {
return {
total_overrides: this.session_overrides.length,
patterns_detected: this.detectPatterns(),
last_override: this.session_overrides[this.session_overrides.length - 1] || null,
integrity_trend: this.session_overrides.map(o => o.impact_assessment.logic_integrity_score)
};
}
}

// MODE ISOLATION SYSTEM (Feature #3: Complete mode switch isolation)
class ModeIsolationManager {
constructor() {
this.current_mode = null;
this.mode_fingerprint = null;
this.conversation_context = [];
this.mode_switch_log = [];
}

switchMode(new_mode, user_confirmation = false) {
if (this.current_mode && this.current_mode !== new_mode) {
if (!user_confirmation) {
return {
requires_confirmation: true,
warning: `Switching from ${this.current_mode} to ${new_mode} will start a fresh conversation. All current context will be cleared. Continue?`,
current_mode: this.current_mode,
target_mode: new_mode
};
}

```
  // Log the mode switch
  this.mode_switch_log.push({
    timestamp: new Date().toISOString(),
    from_mode: this.current_mode,
    to_mode: new_mode,
    context_cleared: true,
    conversation_length: this.conversation_context.length
  });

  // COMPLETE CONTEXT WIPE
  this.conversation_context = [];
  console.log(`🔄 MODE SWITCH: ${this.current_mode} → ${new_mode} | Context cleared`);
}

this.current_mode = new_mode;
this.mode_fingerprint = this.generateModeFingerprint(new_mode);

return {
  mode_switched: true,
  new_mode: new_mode,
  mode_fingerprint: this.mode_fingerprint,
  context_cleared: this.conversation_context.length === 0
};
```

}

generateModeFingerprint(mode) {
const timestamp = new Date().toISOString().split(‘T’)[0]; // YYYY-MM-DD
const fingerprints = {
truth_general: `TG-PROD-${timestamp}`,
business_validation: `BV-PROD-${timestamp}`,
site_monkeys: `SM-VAULT-${timestamp}`
};
return fingerprints[mode] || `UNKNOWN-${timestamp}`;
}

addToContext(message, response) {
this.conversation_context.push({
timestamp: new Date().toISOString(),
mode: this.current_mode,
message: message,
response: response.substring(0, 200) + ‘…’ // Truncate for memory efficiency
});

```
// Keep context manageable
if (this.conversation_context.length > 20) {
  this.conversation_context = this.conversation_context.slice(-15);
}
```

}

getContextStatus() {
return {
current_mode: this.current_mode,
mode_fingerprint: this.mode_fingerprint,
context_length: this.conversation_context.length,
mode_switches: this.mode_switch_log.length,
last_switch: this.mode_switch_log[this.mode_switch_log.length - 1] || null
};
}
}

// ADVANCED ASSUMPTION MONITORING (Feature #4: Pattern-based drift detection)
class AssumptionMonitor {
constructor() {
this.tracked_assumptions = new Map();
this.drift_patterns = [];
this.logic_health_score = 1.0;
}

trackAssumption(assumption_text, confidence_level, source_context) {
const assumption_id = this.generateAssumptionId(assumption_text);

```
if (!this.tracked_assumptions.has(assumption_id)) {
  this.tracked_assumptions.set(assumption_id, {
    id: assumption_id,
    text: assumption_text,
    first_seen: new Date().toISOString(),
    occurrences: [],
    confidence_trend: [],
    contexts: []
  });
}

const assumption = this.tracked_assumptions.get(assumption_id);
assumption.occurrences.push(new Date().toISOString());
assumption.confidence_trend.push(confidence_level);
assumption.contexts.push(source_context);

this.detectLogicDrift(assumption);
```

}

generateAssumptionId(text) {
// Simple hash function for assumption identification
return text.toLowerCase()
.replace(/[^a-z0-9]/g, ‘’)
.substring(0, 20) + ‘_’ + Date.now().toString().slice(-6);
}

detectLogicDrift(assumption) {
// Pattern detection for logical inconsistencies
if (assumption.confidence_trend.length >= 3) {
const recent_trend = assumption.confidence_trend.slice(-3);
const variance = this.calculateVariance(recent_trend);

```
  if (variance > 0.3) { // High variance in confidence
    this.drift_patterns.push({
      type: 'CONFIDENCE_VOLATILITY',
      assumption_id: assumption.id,
      assumption_text: assumption.text.substring(0, 50) + '...',
      severity: 'MEDIUM',
      detected_at: new Date().toISOString(),
      evidence: `Confidence variance: ${variance.toFixed(2)}`
    });
  }
}

// Check for contradictory contexts
if (assumption.contexts.length >= 2) {
  const context_similarity = this.assessContextSimilarity(assumption.contexts);
  if (context_similarity < 0.5) {
    this.drift_patterns.push({
      type: 'CONTEXT_CONTRADICTION',
      assumption_id: assumption.id,
      assumption_text: assumption.text.substring(0, 50) + '...',
      severity: 'HIGH',
      detected_at: new Date().toISOString(),
      evidence: `Context similarity: ${context_similarity.toFixed(2)}`
    });
  }
}

this.updateLogicHealthScore();
```

}

calculateVariance(numbers) {
const mean = numbers.reduce((a, b) => a + b) / numbers.length;
const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
return Math.sqrt(variance);
}

assessContextSimilarity(contexts) {
// Simple similarity assessment based on keyword overlap
const all_words = contexts.join(’ ’).toLowerCase().split(/\s+/);
const unique_words = new Set(all_words);
return unique_words.size / all_words.length; // Lower ratio = more repetition = higher similarity
}

updateLogicHealthScore() {
const high_severity_patterns = this.drift_patterns.filter(p => p.severity === ‘HIGH’).length;
const medium_severity_patterns = this.drift_patterns.filter(p => p.severity === ‘MEDIUM’).length;

```
this.logic_health_score = Math.max(0.1, 1.0 - (high_severity_patterns * 0.2) - (medium_severity_patterns * 0.1));
```

}

getHealthReport() {
return {
logic_health_score: this.logic_health_score,
assumptions_tracked: this.tracked_assumptions.size,
drift_patterns_detected: this.drift_patterns.length,
recent_patterns: this.drift_patterns.slice(-5),
recommendations: this.generateRecommendations()
};
}

generateRecommendations() {
const recommendations = [];

```
if (this.logic_health_score < 0.7) {
  recommendations.push('CRITICAL: Logic health degraded - review recent assumptions for contradictions');
}

if (this.drift_patterns.length > 10) {
  recommendations.push('WARNING: High drift pattern count - consider assumption validation session');
}

return recommendations;
```

}
}

// CLAUDE MANUAL ACTIVATION SYSTEM (Feature #5: Manual override with cost logic)
class ClaudeActivationManager {
constructor() {
this.session_cost = 0;
this.claude_calls = 0;
this.cost_cap = 0.50; // $0.50 per session
}

canActivateClaude(estimated_tokens) {
const estimated_cost = this.estimateClaudeCost(estimated_tokens);
const projected_session_cost = this.session_cost + estimated_cost;

```
return {
  allowed: projected_session_cost <= this.cost_cap,
  estimated_cost: estimated_cost,
  projected_session_cost: projected_session_cost,
  remaining_budget: this.cost_cap - this.session_cost,
  visual_identity: '🤖 AI Robot',
  activation_method: 'MANUAL_CLICK_ONLY'
};
```

}

estimateClaudeCost(tokens) {
// Claude Sonnet 4 pricing estimate
const input_cost_per_token = 0.000003;  // $3 per million input tokens
const output_cost_per_token = 0.000015; // $15 per million output tokens
const estimated_input = tokens * 0.7;   // Assume 70% input, 30% output
const estimated_output = tokens * 0.3;

```
return (estimated_input * input_cost_per_token) + (estimated_output * output_cost_per_token);
```

}

activateClaude(actual_tokens, actual_cost) {
this.claude_calls += 1;
this.session_cost += actual_cost;

```
return {
  activation_successful: true,
  call_number: this.claude_calls,
  session_cost: this.session_cost,
  budget_remaining: this.cost_cap - this.session_cost,
  cost_efficiency: actual_cost < 0.02 ? 'EXCELLENT' : actual_cost < 0.09 ? 'GOOD' : 'HIGH'
};
```

}
}

// EMERGENCY ENFORCEMENT (Bulletproof fallbacks)
const EMERGENCY_ENFORCEMENT = {
guardPoliticalContent: (response, message) => {
const politicalKeywords = [‘vote’, ‘election’, ‘candidate’, ‘party’, ‘democrat’, ‘republican’, ‘liberal’, ‘conservative’, ‘policy’, ‘politics’, ‘politician’];

```
const isPolitical = politicalKeywords.some(keyword => 
  message.toLowerCase().includes(keyword) || response.toLowerCase().includes(keyword)
);

if (isPolitical) {
  return {
    political_intervention: true,
    guarded_response: `Voting is a sacred personal right and responsibility. I don't provide voting recommendations or endorse specific candidates.
```

Instead, I can help you:
• Research candidate positions on specific issues
• Find official voting guides and ballot information  
• Understand how to register to vote
• Locate your polling place and voting requirements

For election information, I recommend checking:
• Your local election office website
• Ballotpedia.org for candidate information
• Vote.gov for registration and requirements

The choice of who to vote for is yours alone to make based on your values and priorities.`,
analysis: {
political_risk_level: ‘HIGH’,
intervention_type: ‘EMERGENCY_VOTING_TEMPLATE’,
detected_categories: [‘voting_recommendation’]
}
};
}

```
return { political_intervention: false };
```

},

validateProductRecommendation: (response, mode) => {
const productKeywords = [‘recommend’, ‘suggest’, ‘use jasper’, ‘popular’, ‘best tool’, ‘should buy’, ‘trendy’, ‘everyone uses’];

```
const hasWeakRecommendation = productKeywords.some(keyword => 
  response.toLowerCase().includes(keyword)
);

if (hasWeakRecommendation) {
  return {
    validation_passed: false,
    evidence_strength: 25,
    value_analysis: 'INSUFFICIENT',
    risk_assessment: 'HIGH - POPULARITY-BASED',
    enforcement_actions: [
      { message: 'Recommendation based on popularity rather than evidence' },
      { message: 'No quantified value proposition provided' },
      { message: 'Risk analysis missing' }
    ]
  };
}

return { 
  validation_passed: true, 
  evidence_strength: 100,
  value_analysis: 'SUFFICIENT',
  risk_assessment: 'LOW'
};
```

},

validateModeCompliance: (response, mode, modeFingerprint) => {
const requiredElements = {
truth_general: [‘confidence’, ‘unknown’, ‘assumption’],
business_validation: [‘survival impact’, ‘cash flow’, ‘market reality’]
};

```
const required = requiredElements[mode] || [];
const missing = required.filter(element => 
  !response.toLowerCase().includes(element.toLowerCase())
);

if (missing.length > 0) {
  let fallbackResponse = '';
  
  if (mode === 'truth_general') {
    fallbackResponse = `TRUTH MODE COMPLIANCE FAILURE
```

The response lacks required truth enforcement elements:

MISSING: CONFIDENCE_PERCENTAGE
REQUIRED: CONFIDENCE: [High/Medium/Low/Unknown] based on [specific reasoning]

MISSING: UNKNOWN_ACKNOWLEDGMENT  
REQUIRED: ACKNOWLEDGE UNCERTAINTY: Use “I don’t know” when appropriate

MISSING: ASSUMPTION_CHALLENGE
REQUIRED: CHALLENGE ASSUMPTIONS: Question underlying premises in the question

CORRECTED RESPONSE REQUIRED: Please reformat with proper truth-first structure.`; } else if (mode === 'business_validation') { fallbackResponse = `BUSINESS MODE COMPLIANCE FAILURE

The response lacks required business validation elements:

MISSING: SURVIVAL_IMPACT
REQUIRED FORMAT: SURVIVAL IMPACT: [NONE/LOW/MEDIUM/HIGH/CRITICAL] - [Specific threat analysis]

MISSING: CASH_FLOW_ANALYSIS
REQUIRED FORMAT: CASH FLOW ANALYSIS: [POSITIVE/NEUTRAL/NEGATIVE] $[Amount] over [Timeline]

MISSING: MARKET_REALITY
REQUIRED FORMAT: MARKET REALITY CHECK: [Competitive threats and adoption challenges]

CORRECTED RESPONSE REQUIRED: Please reformat with all required business validation elements.`;
}

```
  return {
    correction_needed: true,
    mode_compliance: 'NON_COMPLIANT',
    compliance_score: 25,
    missing_elements: missing,
    fallback_correction: fallbackResponse
  };
}

return { 
  correction_needed: false, 
  mode_compliance: 'COMPLIANT', 
  compliance_score: 100,
  missing_elements: []
};
```

}
};

// BULLETPROOF TOKEN TRACKING
let sessionData = {
totalCost: 0,
totalTokens: 0,
callCount: 0,
lastCallCost: 0,
vaultTokens: 0
};

function bulletproofTrackApiCall(personality, promptTokens, completionTokens, vaultTokens) {
try {
if (trackApiCall) {
trackApiCall(personality, promptTokens, completionTokens, vaultTokens);
} else {
// Emergency tracking
const inputCost = (promptTokens * 0.00003);  // $0.03 per 1K input tokens
const outputCost = (completionTokens * 0.00006); // $0.06 per 1K output tokens
const totalCallCost = inputCost + outputCost;

```
  sessionData.totalCost += totalCallCost;
  sessionData.totalTokens += (promptTokens + completionTokens);
  sessionData.callCount += 1;
  sessionData.lastCallCost = totalCallCost;
  sessionData.vaultTokens += (vaultTokens || 0);
}
```

} catch (error) {
console.error(‘❌ Token tracking error:’, error);
}
}

function bulletproofGetSessionDisplayData() {
try {
if (getSessionDisplayData) {
return getSessionDisplayData();
} else {
// Emergency session data
return {
session_cost: `$${sessionData.totalCost.toFixed(4)}`,
vault_tokens: sessionData.vaultTokens,
total_tokens: sessionData.totalTokens,
last_call_cost: `$${sessionData.lastCallCost.toFixed(4)}`,
call_count: sessionData.callCount,
efficiency_rating: sessionData.totalCost < 0.10 ? ‘EXCELLENT’ : ‘GOOD’
};
}
} catch (error) {
console.error(‘❌ Session data error:’, error);
return {
session_cost: ‘$0.0000’,
vault_tokens: 0,
total_tokens: 0,
last_call_cost: ‘$0.0000’,
call_count: 0,
efficiency_rating: ‘ERROR’
};
}
}

// MODE PROCESSORS
function processTruthGeneral() {
return `You are Eli, the Truth-General mode assistant. Your core purpose is providing clear, honest, evidence-based responses.

TRUTH-FIRST LOGIC (NON-NEGOTIABLE):

- Start with direct answers when possible
- Use confidence scoring for claims (High/Medium/Low/Unknown)
- Acknowledge uncertainty explicitly (“I don’t know” is valid)
- Never speculate without labeling it clearly
- Challenge assumptions in questions when appropriate
- Provide evidence hierarchy (primary sources > reports > assumptions)

POLITICAL NEUTRALITY:

- Provide factual information with sources and confidence levels
- Never make voting recommendations or political endorsements
- Present multiple perspectives for disputed political facts
- Redirect political opinion requests to personal research

PRODUCT RECOMMENDATIONS:

- Base recommendations on evidence, reviews, and technical analysis
- Include disclosure when reliable data is limited
- Focus on user-specific needs rather than popularity

Remember: Truth over comfort, evidence over speculation, honesty over harmony.`;
}

function processBusinessValidation() {
return `You are Roxy, the Business Validation mode assistant. Your expertise is startup viability, risk analysis, and market reality.

BUSINESS SURVIVAL LOGIC (NON-NEGOTIABLE):

- Always include survival impact assessment (NONE/LOW/MEDIUM/HIGH/CRITICAL)
- Provide cash flow analysis with realistic timelines
- Include market reality checks and competitive threats
- Focus on monetization logic and sustainable growth
- Challenge optimistic assumptions with market data

POLITICAL NEUTRALITY:

- Analyze regulatory impacts factually without political bias
- Provide business policy analysis without endorsements
- Focus on business implications, not political positions

REQUIRED STRUCTURE:

- SURVIVAL IMPACT: [Impact level] - [Specific threat analysis]
- CASH FLOW ANALYSIS: [POSITIVE/NEUTRAL/NEGATIVE] $[Amount] over [Timeline]
- MARKET REALITY CHECK: [Competitive threats and adoption challenges]

Remember: Business survival over optimism, cash flow over dreams, market reality over hype.`;
}

function processSiteMonkeysWithVault(vault_data) {
let prompt = processBusinessValidation();

prompt += `

=== SITE MONKEYS VAULT ACTIVE ===
VAULT VERSION: ${vault_data.vault_id}
BUSINESS LOGIC ENFORCEMENT:

`;

// Inject active frameworks
Object.entries(vault_data.decision_frameworks).forEach(([name, framework]) => {
prompt += `
${name.toUpperCase()} PROTOCOL:
${framework.logic_framework}
OVERRIDE BEHAVIOR: ${framework.override_behavior}
RISK LEVEL: ${framework.risk_level}

`;
});

prompt += `ASSUMPTIONS CURRENTLY ACTIVE:`;
Object.entries(vault_data.assumptions).forEach(([name, assumption]) => {
prompt += `- ${assumption.assumption} (Validated: ${assumption.last_validated})\n`;
});

return prompt;
}

// VAULT LOADING FUNCTION (Feature #1: Complete with token budgeting)
function loadVault(vault_id, mode) {
const vault = VAULT_REGISTRY[vault_id];

if (!vault) {
return {
success: false,
error: ‘VAULT_NOT_FOUND’,
message: `Vault "${vault_id}" not found in registry`
};
}

// Compatibility check
if (!vault.compatible_modes.includes(mode)) {
return {
success: false,
error: ‘COMPATIBILITY_MISMATCH’,
message: `Vault "${vault_id}" not compatible with mode "${mode}". Compatible modes: ${vault.compatible_modes.join(', ')}`
};
}

// Token budget check
const estimated_tokens = vault.token_budget;
if (estimated_tokens > 8000) {
return {
success: false,
error: ‘TOKEN_BUDGET_EXCEEDED’,
message: `Vault requires ${estimated_tokens} tokens, exceeds limit of 8000`
};
}

// Assumption staleness check
const stale_assumptions = [];
Object.entries(vault.assumptions).forEach(([name, assumption]) => {
const last_validated = new Date(assumption.last_validated);
const days_old = (Date.now() - last_validated.getTime()) / (1000 * 60 * 60 * 24);

```
if (days_old > assumption.expires_after_days) {
  stale_assumptions.push({
    name,
    days_old: Math.floor(days_old),
    expires_after: assumption.expires_after_days
  });
}
```

});

return {
success: true,
vault_data: vault,
token_budget_used: estimated_tokens,
stale_assumptions: stale_assumptions,
load_metadata: {
vault_id: vault.vault_id,
compatible_mode: mode,
frameworks_loaded: Object.keys(vault.decision_frameworks).length,
assumptions_loaded: Object.keys(vault.assumptions).length
}
};
}

// Initialize session managers
const overrideTracker = new OverrideTracker();
const modeManager = new ModeIsolationManager();
const assumptionMonitor = new AssumptionMonitor();
const claudeManager = new ClaudeActivationManager();

export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) {
return res.status(200).end();
}

if (req.method !== ‘POST’) {
return res.status(405).json({error: ‘Method not allowed’});
}

try {
console.log(‘🔍 Starting FINAL PRODUCTION enforcement chat handler…’);

```
const {
  message,
  conversation_history = [],
  mode = 'truth_general',
  vault_loaded = false,
  verify_mode = false,
  detail_level = 'essential',
  mode_switch_confirmation = false
} = req.body;

if (!message || typeof message !== 'string') {
  return res.status(400).json({
    error: 'Invalid message',
    message: 'Message is required and must be a string',
    enforcement_level: 'INPUT_VALIDATION_FAILED'
  });
}

console.log('✅ Request parsed:', {mode, vault_loaded, message_preview: message.substring(0, 50) + '...'});

// MODE ISOLATION CHECK (Feature #3: Complete mode switch isolation)
const mode_switch_result = modeManager.switchMode(mode, mode_switch_confirmation);
if (mode_switch_result.requires_confirmation) {
  return res.status(200).json({
    requires_mode_switch_confirmation: true,
    warning: mode_switch_result.warning,
    current_mode: mode_switch_result.current_mode,
    target_mode: mode_switch_result.target_mode,
    action_required: 'User must confirm mode switch to continue'
  });
}

// VAULT LOADING (Feature #1: Real modular loading with token budgeting)
let vault_data = null;
let vault_status = 'NOT_LOADED';
let vault_load_metadata = null;

if (vault_loaded && mode === 'site_monkeys') {
  const vault_result = loadVault('site_monkeys', mode);
  
  if (!vault_result.success) {
    return res.status(400).json({
      error: vault_result.error,
      message: vault_result.message,
      enforcement_level: 'VAULT_LOADING_FAILED'
    });
  }
  
  vault_data = vault_result.vault_data;
  vault_status = 'LOADED';
  vault_load_metadata = vault_result.load_metadata;
  
  // Warn about stale assumptions
  if (vault_result.stale_assumptions.length > 0) {
    console.warn('⚠️ Stale vault assumptions detected:', vault_result.stale_assumptions);
  }
}

// MODE LOGIC LOADING WITH VAULT INJECTION
let modePrompt = '';
let modeFingerprint = modeManager.mode_fingerprint;
let activePersonality = '';

if (vault_loaded && vault_data) {
  modePrompt = processSiteMonkeysWithVault(vault_data);
  activePersonality = 'Claude (Site Monkeys)';
} else {
  switch (mode) {
    case 'truth_general':
      modePrompt = processTruthGeneral();
      activePersonality = 'Eli';
      break;
    case 'business_validation':
      modePrompt = processBusinessValidation();
      activePersonality = 'Roxy';
      break;
    case 'site_monkeys':
      modePrompt = processBusinessValidation();
      activePersonality = 'Roxy';
      break;
    default:
      return res.status(400).json({
        error: 'Invalid mode specified',
        valid_modes: ['truth_general', 'business_validation', 'site_monkeys'],
        attempted_mode: mode,
        enforcement_level: 'MODE_VALIDATION_FAILED'
      });
  }
}

console.log('✅ Mode configured:', { mode, activePersonality, modeFingerprint });

// ADVANCED ASSUMPTION DETECTION (Feature #4: Pattern-based drift detection)
const assumptionWarnings = [];
const basicKeywords = ['obviously', 'everyone knows', 'it\'s clear that', 'certainly'];
const advancedPatterns = ['always', 'never', 'all', 'none', 'every', 'no one'];

basicKeywords.forEach(keyword => {
  if (message.toLowerCase().includes(keyword)) {
    assumptionWarnings.push({
      keyword: keyword,
      warning: `Assumption detected: "${keyword}" - consider if this is universally true`,
      severity: 'MEDIUM',
      type: 'BASIC_ASSUMPTION'
    });
    
    assumptionMonitor.trackAssumption(
      `User message contains assumption: "${keyword}"`,
      0.6,
      `Message context: ${message.substring(0, 100)}`
    );
  }
});

advancedPatterns.forEach(pattern => {
  if (message.toLowerCase().includes(pattern)) {
    assumptionWarnings.push({
      keyword: pattern,
      warning: `Absolute language detected: "${pattern}" - may indicate oversimplification`,
      severity: 'HIGH',
      type: 'ABSOLUTE_LANGUAGE'
    });
    
    assumptionMonitor.trackAssumption(
      `User message contains absolute language: "${pattern}"`,
      0.4,
      `Pattern context: ${message.substring(0, 100)}`
    );
  }
});

// BUILD CONVERSATION FOR OPENAI
const messages = [
  { role: 'system', content: modePrompt },
  ...modeManager.conversation_context.map(ctx => [
    { role: 'user', content: ctx.message },
    { role: 'assistant', content: ctx.response }
  ]).flat(),
  { role: 'user', content: message }
];

console.log('🚀 Calling OpenAI API...');

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: messages,
  max_tokens: 2000,
  temperature: 0.7
});

let finalResponse = completion.choices[0].message.content;
console.log('✅ OpenAI response received:', finalResponse.substring(0, 100) + '...');

// ADD TO MODE ISOLATION CONTEXT
modeManager.addToContext(message, finalResponse);

// 🔧 FINAL PRODUCTION ENFORCEMENT SEQUENCE
const enforcementLog = [];
let securityPass = true;
let enforcementLevel = 'NONE';
const fallbackMetadata = []; // Feature #6: Structured fallback metadata

// 🛡️ ENFORCEMENT LAYER 1: POLITICAL CONTENT GUARDRAILS
console.log('🛡️ Step 1: Political content enforcement...');

let politicalResult;
try {
  if (PoliticalGuardrails && PoliticalGuardrails.guardPoliticalContent) {
    politicalResult = PoliticalGuardrails.guardPoliticalContent(finalResponse, message);
    fallbackMetadata.push({ layer: 'political', status: 'PRODUCTION_MODULE_USED' });
  } else {
    console.warn('⚠️ Using emergency political enforcement');
    politicalResult = EMERGENCY_ENFORCEMENT.guardPoliticalContent(finalResponse, message);
    fallbackMetadata.push({ layer: 'political', status: 'EMERGENCY_FALLBACK_USED' });
  }
} catch (error) {
  console.error('❌ Political enforcement error:', error);
  politicalResult = EMERGENCY_ENFORCEMENT.guardPoliticalContent(finalResponse, message);
  fallbackMetadata.push({ layer: 'political', status: 'ERROR_FALLBACK_USED', error: error.message });
}

console.log('🔍 Political analysis result:', { 
  intervention: politicalResult.political_intervention,
  risk_level: politicalResult.analysis?.political_risk_level || 'UNKNOWN'
});

if (politicalResult.political_intervention) {
  finalResponse = politicalResult.guarded_response;
  enforcementLog.push("POLITICAL_GUARDRAIL_APPLIED");
  enforcementLevel = 'POLITICAL_TEMPLATE_APPLIED';
  console.log('⚠️ POLITICAL TEMPLATE APPLIED - skipping other enforcement');
  
  // LOG OVERRIDE (Feature #2: Complete override tracking)
  overrideTracker.logOverride({
    session_context: 'Political content detected',
    original_rule: 'Standard conversational response',
    override_applied: 'Political neutrality template',
    justification: 'Political content requires neutral template',
    kernel_violation: false,
    integrity_score: 1.0,
    truth_compromise: 0.0,
    risk_exposure: 'None - template is truth-preserving',
    decision_chain: ['Political content detected', 'Template applied', 'Other enforcement skipped']
  });
  
  // POLITICAL CONTENT GETS IMMEDIATE RETURN
  const promptTokens = completion.usage.prompt_tokens;
  const completionTokens = completion.usage.completion_tokens;
  const vaultTokenCount = vault_data ? vault_load_metadata.token_budget_used : 0;
  
  bulletproofTrackApiCall(activePersonality, promptTokens, completionTokens, vaultTokenCount);
  const sessionDisplayData = bulletproofGetSessionDisplayData();
  
  // INJECT DEBUG INFO (Feature #7: Enforcement transparency)
  finalResponse += `\n\n🔍 [DEBUG] Mode: ${mode} | Vault: ${vault_status} | Security: PASS | Enforcement: ${enforcementLevel} | Fingerprint: ${modeFingerprint}`;
  
  return res.status(200).json({
    response: finalResponse,
    mode_active: mode,
    active_personality: activePersonality,
    mode_fingerprint: modeFingerprint,
    vault_loaded: vault_loaded,
    vault_status: vault_status,
    vault_metadata: vault_load_metadata,
    assumption_warnings: assumptionWarnings,
    detail_level: detail_level,
    
    enforcement_applied: {
      political_intervention: true,
      political_risk_level: politicalResult.analysis.political_risk_level,
      political_template_used: politicalResult.analysis.intervention_type,
      mode_compliance: 'SKIPPED_POLITICAL',
      product_validation: 'SKIPPED_POLITICAL'
    },
    
    // COMPLETE TOKEN TRACKING
    session_cost: sessionDisplayData.session_cost,
    vault_tokens: sessionDisplayData.vault_tokens,
    total_tokens: sessionDisplayData.total_tokens,
    last_call_cost: sessionDisplayData.last_call_cost,
    call_count: sessionDisplayData.call_count,
    efficiency_rating: sessionDisplayData.efficiency_rating,
    
    token_usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens
    },
    
    // COMPLETE SYSTEM STATUS (Feature #7: Enforcement transparency)
    security_pass: true,
    enforcement_level: enforcementLevel,
    enforcement_log: enforcementLog,
    fallback_metadata: fallbackMetadata,
    mode_isolation_status: modeManager.getContextStatus(),
    override_tracking: overrideTracker.getSessionSummary(),
    assumption_health: assumptionMonitor.getHealthReport(),
    claude_activation_status: claudeManager.canActivateClaude(promptTokens + completionTokens),
    timestamp: new Date().toISOString()
  });
}

// 🛡️ ENFORCEMENT LAYER 2: PRODUCT RECOMMENDATION VALIDATION
console.log('🛡️ Step 2: Product recommendation validation...');

let productValidation;
try {
  if (ProductValidator && ProductValidator.validateRecommendation) {
    productValidation = ProductValidator.validateRecommendation(finalResponse, mode, vault_data);
    fallbackMetadata.push({ layer: 'product', status: 'PRODUCTION_MODULE_USED' });
  } else {
    console.warn('⚠️ Using emergency product validation');
    productValidation = EMERGENCY_ENFORCEMENT.validateProductRecommendation(finalResponse, mode);
    fallbackMetadata.push({ layer: 'product', status: 'EMERGENCY_FALLBACK_USED' });
  }
} catch (error) {
  console.error('❌ Product validation error:', error);
  productValidation = EMERGENCY_ENFORCEMENT.validateProductRecommendation(finalResponse, mode);
  fallbackMetadata.push({ layer: 'product', status: 'ERROR_FALLBACK_USED', error: error.message });
}

console.log('🔍 Product validation result:', { 
  passed: productValidation.validation_passed,
  evidence_strength: productValidation.evidence_strength,
  risk_assessment: productValidation.risk_assessment
});

if (!productValidation.validation_passed) {
  const enforcementResponse = `RECOMMENDATION VALIDATION FAILED
```

The original response contained product/service recommendations that don’t meet evidence standards:

${productValidation.enforcement_actions ? productValidation.enforcement_actions.map(action => `• ${action.message}`).join(’\n’) : ‘• Evidence strength below required threshold’}

EVIDENCE STRENGTH: ${productValidation.evidence_strength}% (Required: 50%+)
VALUE ANALYSIS: ${productValidation.value_analysis}
RISK ASSESSMENT: ${productValidation.risk_assessment}

To proceed with recommendations, please provide:

1. Specific evidence or data sources
1. Clear value proposition with quantified benefits
1. Risk analysis including potential downsides
1. Appropriate disclosure statements

Would you like me to research this topic more thoroughly to provide a properly validated recommendation?`;

```
  finalResponse = enforcementResponse;
  enforcementLog.push("PRODUCT_RECOMMENDATION_BLOCKED");
  enforcementLevel = 'PRODUCT_VALIDATION_ENFORCED';
  securityPass = false;
  console.log('⚠️ Product recommendation blocked - insufficient evidence');
  
  // LOG OVERRIDE (Feature #2)
  overrideTracker.logOverride({
    session_context: 'Product recommendation validation failure',
    original_rule: 'Allow product recommendations',
    override_applied: 'Block recommendation, require evidence',
    justification: `Evidence strength ${productValidation.evidence_strength}% below 50% threshold`,
    kernel_violation: false,
    integrity_score: 0.8,
    truth_compromise: 0.2,
    risk_exposure: 'Medium - prevented potentially misleading recommendation',
    decision_chain: ['Product recommendation detected', 'Evidence insufficient', 'Recommendation blocked']
  });
} else {
  console.log('✅ Product recommendation validation passed');
}

// 🛡️ ENFORCEMENT LAYER 3: MODE COMPLIANCE VALIDATION
if (enforcementLevel === 'NONE') {
  console.log('🛡️ Step 3: Mode compliance validation...');
  
  let modeValidation;
  try {
    if (ModeLinter && ModeLinter.validateModeCompliance) {
      modeValidation = ModeLinter.validateModeCompliance(finalResponse, mode, modeFingerprint);
      fallbackMetadata.push({ layer: 'mode', status: 'PRODUCTION_MODULE_USED' });
    } else {
      console.warn('⚠️ Using emergency mode validation');
      modeValidation = EMERGENCY_ENFORCEMENT.validateModeCompliance(finalResponse, mode, modeFingerprint);
      fallbackMetadata.push({ layer: 'mode', status: 'EMERGENCY_FALLBACK_USED' });
    }
  } catch (error) {
    console.error('❌ Mode validation error:', error);
    modeValidation = EMERGENCY_ENFORCEMENT.validateModeCompliance(finalResponse, mode, modeFingerprint);
    fallbackMetadata.push({ layer: 'mode', status: 'ERROR_FALLBACK_USED', error: error.message });
  }
  
  console.log('🔍 Mode validation result:', { 
    compliance: modeValidation.mode_compliance,
    score: modeValidation.compliance_score,
    correction_needed: modeValidation.correction_needed
  });
  
  if (modeValidation.correction_needed) {
    finalResponse = modeValidation.fallback_correction;
    enforcementLog.push("MODE_COMPLIANCE_ENFORCED");
    enforcementLevel = 'MODE_COMPLIANCE_ENFORCED';
    securityPass = false;
    console.log('⚠️ Mode compliance enforced - structure violation corrected');
    
    // LOG OVERRIDE (Feature #2)
    overrideTracker.logOverride({
      session_context: 'Mode compliance validation failure',
      original_rule: `${mode} mode structure requirements`,
      override_applied: 'Structured fallback response',
      justification: `Missing required elements: ${modeValidation.missing_elements.join(', ')}`,
      kernel_violation: false,
      integrity_score: 0.7,
      truth_compromise: 0.3,
      risk_exposure: 'Medium - prevented non-compliant response structure',
      decision_chain: ['Mode compliance check', 'Structure insufficient', 'Fallback applied']
    });
  } else {
    console.log('✅ Mode compliance validation passed');
  }
}

// 🔧 TOKEN TRACKING AND COST CALCULATION
const promptTokens = completion.usage.prompt_tokens;
const completionTokens = completion.usage.completion_tokens;
const vaultTokenCount = vault_data ? vault_load_metadata.token_budget_used : 0;

bulletproofTrackApiCall(activePersonality, promptTokens, completionTokens, vaultTokenCount);
const sessionDisplayData = bulletproofGetSessionDisplayData();

// ADD CRITICAL ASSUMPTION WARNINGS
const criticalWarnings = assumptionWarnings.filter(w => w.severity === 'CRITICAL');
if (criticalWarnings.length > 0) {
  finalResponse += `\n\n🚨 CRITICAL ASSUMPTION ALERTS:`;
  criticalWarnings.forEach(warning => {
    finalResponse += `\n- ${warning.warning}`;
  });
}

// INJECT COMPREHENSIVE DEBUG INFO (Feature #7: Enforcement transparency in UI)
finalResponse += `\n\n🔍 [DEBUG] Mode: ${mode} | Vault: ${vault_status} | Security: ${securityPass ? 'PASS' : 'FAIL'} | Enforcement: ${enforcementLevel} | Fingerprint: ${modeFingerprint}`;

console.log('✅ All enforcement layers completed successfully');
console.log('💰 Final session data:', {
  session_cost: sessionDisplayData.session_cost,
  call_count: sessionDisplayData.call_count,
  enforcement_level: enforcementLevel
});

// FINAL RESPONSE WITH COMPLETE SYSTEM STATUS
return res.status(200).json({
  response: finalResponse,
  
  // Core system status
  mode_active: mode,
  active_personality: activePersonality,
  mode_fingerprint: modeFingerprint,
  vault_loaded: vault_loaded,
  vault_status: vault_status,
  vault_metadata: vault_load_metadata,
  assumption_warnings: assumptionWarnings,
  detail_level: detail_level,
  
  // 🛡️ ENFORCEMENT RESULTS
  enforcement_applied: {
    political_intervention: false,
    political_risk_level: 'NONE',
    mode_compliance: enforcementLevel.includes('MODE') ? 'ENFORCED' : 'PASSED',
    mode_blocked: enforcementLevel.includes('MODE'),
    product_validation: enforcementLevel.includes('PRODUCT') ? 'BLOCKED' : 'PASSED',
    product_blocked: enforcementLevel.includes('PRODUCT')
  },
  
  // 💰 COMPLETE TOKEN TRACKING
  session_cost: sessionDisplayData.session_cost,
  vault_tokens: sessionDisplayData.vault_tokens,
  total_tokens: sessionDisplayData.total_tokens,
  last_call_cost: sessionDisplayData.last_call_cost,
  call_count: sessionDisplayData.call_count,
  efficiency_rating: sessionDisplayData.efficiency_rating,
  
  token_usage: {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens
  },
  
  // 🔧 COMPLETE SYSTEM STATUS (Feature #7: Full enforcement transparency)
  security_pass: securityPass,
  enforcement_level: enforcementLevel,
  enforcement_log: enforcementLog,
  fallback_metadata: fallbackMetadata, // Feature #6: Structured fallback metadata
  
  // ADVANCED SYSTEM MONITORING
  mode_isolation_status: modeManager.getContextStatus(), // Feature #3: Mode switch isolation
  override_tracking: overrideTracker.getSessionSummary(), // Feature #2: Override tracking
  assumption_health: assumptionMonitor.getHealthReport(), // Feature #4: Assumption monitoring
  claude_activation_status: claudeManager.canActivateClaude(promptTokens + completionTokens), // Feature #5: Claude manual activation
  
  fallback_used: enforcementLevel !== 'NONE',
  timestamp: new Date().toISOString()
});
```

} catch (error) {
console.error(‘❌ FINAL PRODUCTION enforcement system error:’, error);

```
// NEVER RETURN 500 FOR SIMPLE PROMPTS
return res.status(200).json({
  response: `SYSTEM ENFORCEMENT ERROR
```

The cognitive integrity system encountered an error but has provided a safe fallback response.

ERROR TYPE: ${error.name || ‘Unknown’}
ERROR MESSAGE: ${error.message || ‘No details available’}

This is a protective measure to ensure no unverified information reaches you. Please try rephrasing your question or contact system support if this persists.

🔍 [DEBUG] Mode: ERROR | Vault: ERROR | Security: FAIL | Enforcement: SYSTEM_ERROR`,

```
  error: 'Enforcement system error - safe fallback provided',
  message: 'The system encountered an error but provided a safe response',
  details: error.message,
  stack: error.stack,
  enforcement_level: 'SYSTEM_ERROR_FALLBACK',
  security_pass: false,
  enforcement_log: ["SYSTEM_ERROR_OCCURRED"],
  fallback_metadata: [{ layer: 'system', status: 'CRITICAL_ERROR_FALLBACK', error: error.message }],
  override_tracking: overrideTracker.getSessionSummary(),
  timestamp: new Date().toISOString()
});
```

}
}