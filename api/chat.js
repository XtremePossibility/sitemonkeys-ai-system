import OpenAI from ‘openai’;

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

// UNIVERSAL OPTIMIZATION CORE - Built into all modes
const UNIVERSAL_OPTIMIZATION_CORE = {
efficiency_principles: [
“Always seek simpler paths that maintain quality”,
“Always flag unnecessary complexity”,
“Always suggest cost/time savings when available”,
“Always protect founder time and cognitive load”,
“Never sacrifice delivery standards for efficiency”
],

automatic_analysis: {
cost_efficiency: “Every financial recommendation includes optimization”,
time_efficiency: “Every process recommendation includes time-saving alternatives”,
complexity_reduction: “Every implementation includes simplification options”,
resource_optimization: “Every resource allocation includes efficiency alternatives”
},

founder_protection_filters: [
“Never suggest learning new programming languages”,
“Never suggest managing servers or technical infrastructure”,
“Never suggest building tools that already exist efficiently”,
“Never suggest taking on client management complexity”,
“Never add more than 20 hours of founder work”
]
};

// ENHANCED MODE DEFINITIONS with built-in optimization
const MODES = {
truth_general: {
mode_id: “TG-PROD-001”,
system_prompt: `You are operating in Truth-General Mode with optimization intelligence.

CORE PRINCIPLES:

- NEVER generate unsupported claims or fabricated information
- ALWAYS flag uncertainty with explicit confidence levels
- SURFACE unknowns explicitly - don’t work around them
- NO softening language without data backing
- When speculating, use clear prefixes: “Hypothesis:”, “Speculation:”, “Unverified inference:”
- “I don’t know” is always an acceptable answer

OPTIMIZATION INTELLIGENCE:

- Always suggest the most efficient path to accurate information
- Flag when user is overcomplicating research process
- Suggest the 20% of effort that gets 80% of the result
- Reduce complexity without reducing accuracy

WARM TRUTH DELIVERY:
You are warm, caring, and genuinely helpful, but you never compromise truth for comfort.
Framework: “I care about your success too much to [mislead/sugarcoat/pretend it’s fine].”

RESPONSE FORMAT: Provide clear information + efficiency suggestions + confidence levels`,

```
personality_base: "Analytical, precise, caring but truth-first. Always looking for efficient paths to accurate answers."
```

},

business_validation: {
mode_id: “BV-PROD-001”,
system_prompt: `You are operating in Business Validation Mode with survival-first logic and optimization intelligence.

CORE PRINCIPLES:

- ALWAYS model downside scenarios and worst-case outcomes
- SURFACE cost cascades and hidden dependencies
- FLAG survivability risks explicitly
- PRIORITIZE runway preservation over growth optimization
- NO false confidence intervals or optimistic projections

OPTIMIZATION INTELLIGENCE:

- Always seek cheaper paths that maintain quality
- Always suggest time/cost savings when available
- Flag unnecessary complexity in business operations
- Protect founder time and cognitive load
- Suggest efficiency improvements without quality sacrifice

WARM TRUTH DELIVERY:
You are a caring strategic advisor who helps businesses survive and thrive through honest assessment and creative problem-solving.
Framework: “I care about your success too much to let you chase something that’ll hurt you.”

RESPONSE FORMAT: Business analysis + optimization suggestions + survival risk assessment + efficient alternatives`,

```
personality_base: "Strategic, survival-focused, efficiency-minded. Always seeking better paths to business success."
```

},

site_monkeys: {
mode_id: “SM-VAULT-001”,
system_prompt: `You are operating in Site Monkeys Mode with business-specific optimization intelligence.

LOADED BUSINESS CONTEXT:

- Business Model: Premium SMB marketing automation - “Overlooked to overbooked”
- Pricing Tiers: Boost ($697), Climb ($1,497), Lead ($2,997) + onboarding fees
- Financial Framework: $15K launch budget target ($20K max), $3K monthly burn target ($5K max)
- Target Margins: 87% goal (75% minimum acceptable)
- Operational Standards: 99.8% uptime target (97% guaranteed), zero-failure execution

OPTIMIZATION INTELLIGENCE:

- Always reference Site Monkeys pricing and positioning
- Suggest efficiency improvements specific to the business model
- Flag any decisions that could compromise 75%+ margins
- Protect launch budget and burn rate targets
- Suggest automation opportunities that reduce complexity

DECISION FRAMEWORKS:

- Pricing: Market research + Cost-plus + Competitive analysis (NEVER compete on price)
- Features: Revenue impact > Development cost > Market validation
- Resources: Cash preservation + ROI validation + Runway extension
- Hiring: Quality over quantity, compartmentalized NDAs

Apply Site Monkeys specific logic while maintaining truth-first principles and optimization focus.`,

```
personality_base: "Business-specific strategic advisor with Site Monkeys context and efficiency optimization."
```

}
};

// CORE ASSUMPTION TRACKING INFRASTRUCTURE
const ASSUMPTION_TRACKER = {
health_thresholds: {
staleness_days: 30,
override_frequency: 3,
confidence_minimum: 0.70
},

tracked_assumptions: {
market_stage: {
current_value: “early_stage”,
last_validated: new Date().toISOString(),
override_count: 0,
override_history: [],
confidence_score: 1.0
},
financial_status: {
current_value: “bootstrap_funding”,
last_validated: new Date().toISOString(),
override_count: 0,
override_history: [],
confidence_score: 1.0
},
pricing_position: {
current_value: “premium_tier”,
last_validated: new Date().toISOString(),
override_count: 0,
override_history: [],
confidence_score: 1.0
},
operational_status: {
current_value: “pre_launch”,
last_validated: new Date().toISOString(),
override_count: 0,
override_history: [],
confidence_score: 1.0
}
}
};

// SITE MONKEYS VAULT LOGIC TRIGGERS
const VAULT_TRIGGERS = {
pricing: [‘price’, ‘pricing’, ‘cost’, ‘revenue’, ‘monetization’, ‘subscription’, ‘tier’],
features: [‘feature’, ‘development’, ‘roadmap’, ‘build’, ‘functionality’, ‘service’],
hiring: [‘hire’, ‘hiring’, ‘staff’, ‘team’, ‘employee’, ‘contractor’],
marketing: [‘marketing’, ‘advertising’, ‘campaign’, ‘lead’, ‘conversion’],
competition: [‘competitor’, ‘competitive’, ‘market’, ‘industry’]
};

// SITE MONKEYS BUSINESS LOGIC
const SITE_MONKEYS_LOGIC = {
vault_id: “SM-PROD-v1.0”,
business_context: “Full-service marketing company focusing on SMB ‘unsung heroes’”,

decision_frameworks: {
pricing_strategy: {
logic: “Site Monkeys operates on premium positioning: Boost ($697), Climb ($1,497), Lead ($2,997). Never compete on price - compete on value and complete transparency.”,
override: “VAULT_OVERRIDE”
},

```
feature_prioritization: {
  logic: "Revenue impact > Development cost > Market validation. Focus on complete solutions that serve 'unsung hero' businesses.",
  override: "MERGE_WITH_MODE"
},

hiring_decisions: {
  logic: "Quality over quantity. Hire people who understand the mission. Contractors must be compartmentalized with NDAs.",
  override: "VAULT_OVERRIDE"
},

marketing_approach: {
  logic: "Position against broken agency model. Emphasize transparency, AI automation, and genuine care for SMB success.",
  override: "MERGE_WITH_MODE"
}
```

}
};

// VAULT SECURITY AND VERIFICATION SYSTEM
async function verifyVaultAccess(mode, requestedVaultLoad) {
console.log(`🔐 Vault verification: mode=${mode}, requested=${requestedVaultLoad}`);

// Vault only available in Site Monkeys mode
if (mode !== ‘site_monkeys’) {
if (requestedVaultLoad) {
console.warn(‘⚠️ Vault requested but not in Site Monkeys mode - BLOCKED’);
}
return {
allowed: false,
context: ‘’,
reason: ‘Vault restricted to Site Monkeys mode’,
security_pass: true // Pass because restriction is working correctly
};
}

// If in Site Monkeys mode, verify vault is actually loaded
try {
// Use environment-appropriate URL for internal API call
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ‘https://sitemonkeys-ai-system.vercel.app’;
const vaultResponse = await fetch(`${baseUrl}/api/load-vault`);
const vaultData = await vaultResponse.json();

```
if (vaultData.status === 'success' && !vaultData.needs_refresh) {
  console.log('✅ Vault verification passed - Site Monkeys logic authorized');
  return { 
    allowed: true, 
    context: vaultData.vault_content || '',
    reason: 'Vault verified and loaded',
    security_pass: true,
    token_count: vaultData.tokens,
    folders_loaded: vaultData.folders_loaded
  };
} else {
  console.warn('⚠️ Site Monkeys mode active but vault not properly loaded');
  return { 
    allowed: false, 
    context: '',
    reason: 'Vault not properly loaded - refresh required',
    security_pass: false // Fail because vault should be loaded but isn't
  };
}
```

} catch (error) {
console.error(‘❌ Vault verification failed:’, error);
return {
allowed: false,
context: ‘’,
reason: `Vault system error: ${error.message}`,
security_pass: false
};
}
}

// BULLETPROOF OPENAI CALLER WITH RETRY LOGIC
async function callOpenAIWithRetry(messages, mode, personality = ‘balanced’, maxRetries = 3) {
const modeConfig = MODES[mode] || MODES.business_validation;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
try {
console.log(`🤖 OpenAI attempt ${attempt}/${maxRetries} for ${mode} mode (${personality})`);

```
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
    max_tokens: 600,
    temperature: mode === 'truth_general' ? 0.3 : 0.7,
  });
  
  const response = completion.choices[0].message.content;
  console.log(`✅ OpenAI success on attempt ${attempt}`);
  
  return {
    success: true,
    response: response,
    mode_used: modeConfig.mode_id,
    attempt: attempt,
    personality: personality
  };
  
} catch (error) {
  console.error(`❌ OpenAI attempt ${attempt} failed:`, error.message);
  
  if (attempt === maxRetries) {
    // Final fallback - give honest error message
    const fallbackResponse = getFallbackResponse(mode, personality, error);
    console.log(`🆘 Using fallback response for ${mode} mode`);
    
    return {
      success: false,
      response: fallbackResponse,
      mode_used: modeConfig.mode_id,
      error: error.message,
      personality: personality,
      fallback_used: true
    };
  }
  
  // Wait before retry (exponential backoff)
  await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
}
```

}
}

function getFallbackResponse(mode, personality, error) {
const fallbacks = {
truth_general: {
eli: “I’m having technical difficulties right now, and I won’t pretend otherwise. Rather than give you potentially wrong information, I need to be honest: the system isn’t working properly. Please try again in a moment.”,
roxy: “Hey, I’m running into some technical issues and I don’t want to guess or make things up. That wouldn’t be helpful to you. Give me another try in a few seconds?”
},
business_validation: {
eli: “System error detected. I can’t provide business analysis right now without risking inaccurate information. Current status: Technical failure preventing proper risk assessment. Recommendation: Retry in 30 seconds.”,
roxy: “I’m having technical problems and I refuse to give you business advice based on guesswork. That could hurt your business. Let’s try again once the system stabilizes - your success is too important to risk on faulty data.”
},
site_monkeys: {
eli: “Site Monkeys system temporarily unavailable. I can’t access your business logic right now, which means any advice could be off-brand or strategically wrong. Switch to Business Validation mode or retry in a moment.”,
roxy: “The Site Monkeys vault isn’t responding properly, and I won’t wing it with your business strategy. That’s too important. Either try again or switch to Business mode until this gets sorted.”
}
};

const modeResponses = fallbacks[mode] || fallbacks.business_validation;
return modeResponses[personality] || modeResponses.eli;
}

// ANALYZE PROMPT TYPE FOR ELI VS ROXY LEADERSHIP
function analyzePromptType(message) {
const analyticalKeywords = [‘data’, ‘analysis’, ‘numbers’, ‘risk’, ‘legal’, ‘compliance’, ‘math’, ‘evidence’, ‘research’];
const creativeKeywords = [‘ideas’, ‘creative’, ‘solution’, ‘alternative’, ‘stuck’, ‘brainstorm’, ‘options’, ‘different’];

const messageLC = message.toLowerCase();

const analyticalScore = analyticalKeywords.filter(keyword => messageLC.includes(keyword)).length;
const creativeScore = creativeKeywords.filter(keyword => messageLC.includes(keyword)).length;

if (analyticalScore > creativeScore) return ‘eli_leads’;
if (creativeScore > analyticalScore) return ‘roxy_leads’;
return ‘balanced’;
}

// CHECK ASSUMPTION HEALTH AND FLAG WARNINGS
function checkAssumptionHealth() {
const now = new Date();
const warnings = [];

for (const [assumption_name, assumption_data] of Object.entries(ASSUMPTION_TRACKER.tracked_assumptions)) {
const lastValidated = new Date(assumption_data.last_validated);
const daysSinceValidation = Math.floor((now - lastValidated) / (1000 * 60 * 60 * 24));

```
if (daysSinceValidation > ASSUMPTION_TRACKER.health_thresholds.staleness_days) {
  warnings.push({
    type: 'staleness',
    assumption: assumption_name,
    message: `"${assumption_name}" hasn't been validated in ${daysSinceValidation} days. Current value: "${assumption_data.current_value}"`
  });
}

const recentOverrides = assumption_data.override_history.filter(override => {
  const overrideDate = new Date(override.timestamp);
  const daysSince = Math.floor((now - overrideDate) / (1000 * 60 * 60 * 24));
  return daysSince <= 14;
});

if (recentOverrides.length >= ASSUMPTION_TRACKER.health_thresholds.override_frequency) {
  warnings.push({
    type: 'override_frequency',
    assumption: assumption_name,
    message: `"${assumption_name}" has been overridden ${recentOverrides.length} times in the last 14 days. May need updating.`
  });
}

if (assumption_data.confidence_score < ASSUMPTION_TRACKER.health_thresholds.confidence_minimum) {
  warnings.push({
    type: 'low_confidence',
    assumption: assumption_name,
    message: `"${assumption_name}" confidence is ${(assumption_data.confidence_score * 100).toFixed(0)}%. Consider validation.`
  });
}
```

}

return warnings;
}

// CHECK FOR VAULT TRIGGERS
function checkVaultTriggers(message) {
const messageLC = message.toLowerCase();
const triggeredFrameworks = [];

for (const [framework, keywords] of Object.entries(VAULT_TRIGGERS)) {
if (keywords.some(keyword => messageLC.includes(keyword))) {
triggeredFrameworks.push(framework);
}
}

return triggeredFrameworks;
}

// GENERATE VAULT CONTEXT IF TRIGGERS FOUND
function generateVaultContext(triggeredFrameworks, vaultLoaded) {
if (!vaultLoaded || triggeredFrameworks.length === 0) return ‘’;

let vaultContext = ‘\n\nSITE MONKEYS VAULT LOGIC ACTIVE:\n’;

triggeredFrameworks.forEach(framework => {
let logic;

```
switch(framework) {
  case 'pricing':
    logic = SITE_MONKEYS_LOGIC.decision_frameworks.pricing_strategy;
    break;
  case 'features':
    logic = SITE_MONKEYS_LOGIC.decision_frameworks.feature_prioritization;
    break;
  case 'hiring':
    logic = SITE_MONKEYS_LOGIC.decision_frameworks.hiring_decisions;
    break;
  case 'marketing':
    logic = SITE_MONKEYS_LOGIC.decision_frameworks.marketing_approach;
    break;
}

if (logic) {
  vaultContext += `${framework.toUpperCase()}: ${logic.logic}\n`;
}
```

});

vaultContext += ‘\nApply this business-specific logic while maintaining truth-first principles and optimization intelligence.\n’;
return vaultContext;
}

// OPTIMIZATION ENHANCEMENT ENGINE
function runOptimizationEnhancer(params) {
const { mode, baseResponse, message, triggeredFrameworks, assumptionHealth } = params;

let optimizationTips = [];
let complexityFlags = [];

// Analyze for optimization opportunities
const messageLC = message.toLowerCase();

// Cost optimization detection
if (messageLC.includes(‘cost’) || messageLC.includes(‘budget’) || messageLC.includes(‘expensive’)) {
optimizationTips.push(“💡 Cost Optimization: Consider if there’s a simpler approach that maintains quality”);
}

// Time optimization detection  
if (messageLC.includes(‘time’) || messageLC.includes(‘quick’) || messageLC.includes(‘fast’)) {
optimizationTips.push(“⚡ Time Optimization: Look for the 20% of effort that gets 80% of results”);
}

// Complexity detection
if (messageLC.includes(‘complex’) || messageLC.includes(‘difficult’) || messageLC.includes(‘complicated’)) {
complexityFlags.push(“🚨 Complexity Alert: Seek simpler alternatives that don’t sacrifice quality”);
}

// Build enhanced response
let enhancedResponse = baseResponse;

if (optimizationTips.length > 0 || complexityFlags.length > 0) {
enhancedResponse += ‘\n\n🎯 **OPTIMIZATION INSIGHTS:**\n’;

```
optimizationTips.forEach(tip => {
  enhancedResponse += `${tip}\n`;
});

complexityFlags.forEach(flag => {
  enhancedResponse += `${flag}\n`;
});
```

}

return {
enhancedResponse,
optimization_tags: optimizationTips,
complexity_flags: complexityFlags
};
}

// GENERATE ELI’S ANALYTICAL RESPONSE
async function generateEliResponse(userMessage, mode, vaultContext, conversationHistory) {
const modeConfig = MODES[mode];
const eliPersonality = `You are Eli from Site Monkeys - the analytical AI who focuses on data, logic, truth, and optimization.

Your personality: Warm but precise, caring but analytical. You lead with facts, evidence, and efficient solutions.
Your style: “Let me break down what’s actually happening here…” / “The data shows…” / “Here’s what you need to know…”

${modeConfig.personality_base}

OPTIMIZATION INTELLIGENCE: Always suggest more efficient approaches while maintaining accuracy and quality.

CRITICAL: Never fabricate information. If you don’t know something, say so clearly. Always look for optimization opportunities.`;

const messages = [
{
role: “system”,
content: `${eliPersonality}\n\n${modeConfig.system_prompt}${vaultContext}`
},
…conversationHistory.slice(-6),
{
role: “user”,
content: userMessage
}
];

return await callOpenAIWithRetry(messages, mode, ‘eli’);
}

// GENERATE ROXY’S CREATIVE RESPONSE
async function generateRoxyResponse(userMessage, mode, vaultContext, eliResponse, conversationHistory) {
const modeConfig = MODES[mode];
const roxyPersonality = `You are Roxy from Site Monkeys - the creative AI who focuses on solutions, possibilities, and optimization.

Your personality: Warm and encouraging, creative but realistic. You build on truth to find efficient paths forward.
Your style: “Okay, now let’s figure out how to make this work…” / “I’m seeing three ways you could…” / “What if we tried…”

${modeConfig.personality_base}

OPTIMIZATION INTELLIGENCE: Always suggest creative but efficient solutions that reduce complexity without sacrificing quality.

CRITICAL: Base all solutions on real information. Never invent options that don’t exist. Always seek optimization opportunities.`;

const contextWithEli = eliResponse ? `Previous analysis from Eli: ${eliResponse.response}\n\nNow provide creative, reality-based solutions that build on this truth while seeking optimization opportunities.` : ‘’;

const messages = [
{
role: “system”,
content: `${roxyPersonality}\n\n${modeConfig.system_prompt}${vaultContext}`
},
…conversationHistory.slice(-6),
{
role: “user”,
content: `${userMessage}\n\n${contextWithEli}`
}
];

return await callOpenAIWithRetry(messages, mode, ‘roxy’);
}

// MAIN CHAT HANDLER
export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) {
return res.status(200).end();
}

if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

try {
const {
message,
conversation_history = [],
mode = ‘business_validation’,
vault_loaded = false,
user_preference = null,
verify_mode = false
} = req.body;

```
console.log(`🚀 Processing request: mode=${mode}, vault_requested=${vault_loaded}`);

// VERIFY VAULT ACCESS AND SECURITY
const vaultVerification = await verifyVaultAccess(mode, vault_loaded);

// Only block if someone tries to load vault outside Site Monkeys mode
if (vault_loaded && mode !== 'site_monkeys') {
  console.error('🚨 Vault access denied: Wrong mode');
  return res.status(403).json({
    response: `**System:** Vault access denied. Switch to Site Monkeys mode to access vault logic.`,
    error: 'VAULT_ACCESS_DENIED',
    mode_active: mode,
    vault_loaded: false,
    security_pass: false,
    reason: 'Vault only available in Site Monkeys mode'
  });
}

console.log(`🛡️ Vault security check: ${vaultVerification.security_pass ? 'PASS' : 'FAIL'}`);

const selectedMode = MODES[mode] || MODES.business_validation;
const promptType = user_preference || analyzePromptType(message);
const triggeredFrameworks = checkVaultTriggers(message);
const vaultContext = vaultVerification.allowed ? 
  generateVaultContext(triggeredFrameworks, true) : '';

let eliResult, roxyResult;

// Generate responses based on prompt type
if (promptType === 'eli' || promptType === 'eli_leads') {
  eliResult = await generateEliResponse(message, mode, vaultContext, conversation_history);
  roxyResult = await generateRoxyResponse(message, mode, vaultContext, eliResult, conversation_history);
} else if (promptType === 'roxy' || promptType === 'roxy_leads') {
  roxyResult = await generateRoxyResponse(message, mode, vaultContext, '', conversation_history);
  eliResult = await generateEliResponse(message + `\n\nRoxy's perspective: ${roxyResult.response}\n\nProvide analytical validation:`, mode, vaultContext, conversation_history);
} else {
  eliResult = await generateEliResponse(message, mode, vaultContext, conversation_history);
  roxyResult = await generateRoxyResponse(message, mode, vaultContext, eliResult, conversation_history);
}

// Handle fallback scenarios
if (!eliResult.success && !roxyResult.success) {
  return res.status(500).json({
    response: "**System:** Both AI systems are experiencing technical difficulties. I'd rather be honest about this than provide unreliable information. Please try again in a moment.",
    error: 'DUAL_SYSTEM_FAILURE',
    mode_active: selectedMode.mode_id,
    vault_loaded: vaultVerification.allowed,
    security_pass: vaultVerification.security_pass,
    fallback_used: true
  });
}

// Use successful responses or fallbacks
const eliResponse = eliResult.success ? eliResult.response : eliResult.response;
const roxyResponse = roxyResult.success ? roxyResult.response : roxyResult.response;

const assumptionWarnings = checkAssumptionHealth();

let combinedResponse = `**Eli:** ${eliResponse}\n\n**Roxy:** ${roxyResponse}`;

// Add assumption health warnings if any
if (assumptionWarnings.length > 0) {
  combinedResponse += `\n\n⚠️ **System Health**: ${assumptionWarnings.length} assumption(s) need attention.`;
}

// Run optimization enhancer
const optimizationParams = {
  mode: selectedMode.mode_id,
  baseResponse: combinedResponse,
  message: message,
  triggeredFrameworks: triggeredFrameworks,
  assumptionHealth: assumptionWarnings
};

const optimizedResult = runOptimizationEnhancer(optimizationParams);
combinedResponse = optimizedResult.enhancedResponse;

// Generate system fingerprint
const vault_status = vaultVerification.allowed ? 'SM-VAULT-LOADED' : 'NO-VAULT';
const triggered_logic = triggeredFrameworks.length > 0 ? triggeredFrameworks.join(', ') : 'NONE';
const assumption_health = assumptionWarnings.length > 0 ? `${assumptionWarnings.length} WARNINGS` : 'HEALTHY';
const fingerprint = `\n\n*[MODE: ${selectedMode.mode_id}] | [VAULT: ${vault_status}] | [TRIGGERED: ${triggered_logic}] | [FLOW: ${promptType}] | [ASSUMPTIONS: ${assumption_health}]*`;

return res.status(200).json({
  response: combinedResponse + fingerprint,
  mode_active: selectedMode.mode_id,
  vault_loaded: vaultVerification.allowed,
  security_pass: vaultVerification.security_pass,
  vault_reason: vaultVerification.reason,
  triggered_frameworks: triggeredFrameworks,
  conversation_flow: promptType,
  assumption_warnings: assumptionWarnings,
  optimization_applied: optimizedResult.optimization_tags.length > 0,
  complexity_flags: optimizedResult.complexity_flags,
  eli_response: eliResponse,
  roxy_response: roxyResponse,
  fallback_used: (!eliResult.success || !roxyResult.success)
});
```

} catch (error) {
console.error(‘❌ Chat API Error:’, error);

```
const fallbackResponse = `**System:** I encountered an error processing your request. Rather than guess or provide potentially incorrect information, I need to let you know that something went wrong on my end. 
```

The error was: ${error.message}

Please try your question again, and I’ll do my best to provide you with accurate, helpful information.`;

```
return res.status(500).json({ 
  response: fallbackResponse,
  error: 'Processing failed',
  mode_active: 'ERROR',
  vault_loaded: false,
  security_pass: false,
  fallback_used: true,
  timestamp: new Date().toISOString()
});
```

}
}