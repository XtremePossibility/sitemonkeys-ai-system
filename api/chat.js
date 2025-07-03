import OpenAI from ‘openai’;

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

// BULLETPROOF ENFORCEMENT IMPORTS WITH HARD FAIL-SAFES
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

// EMERGENCY FALLBACK ENFORCEMENT (NEVER FAILS)
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

// BULLETPROOF TOKEN TRACKING (NEVER FAILS)
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
console.log(‘🔍 Starting BULLETPROOF enforcement chat handler…’);

```
const {
  message,
  conversation_history = [],
  mode = 'truth_general',
  vault_loaded = false,
  verify_mode = false,
  detail_level = 'essential'
} = req.body;

if (!message || typeof message !== 'string') {
  return res.status(400).json({
    error: 'Invalid message',
    message: 'Message is required and must be a string',
    enforcement_level: 'INPUT_VALIDATION_FAILED'
  });
}

console.log('✅ Request parsed:', {mode, vault_loaded, message_preview: message.substring(0, 50) + '...'});

// MODE LOGIC LOADING WITH VAULT INJECTION
let modePrompt = '';
let modeFingerprint = '';
let activePersonality = '';
let vaultStatus = vault_loaded ? 'LOADED' : 'NOT_LOADED';

if (vault_loaded && mode === 'site_monkeys') {
  // VAULT PLACEHOLDER INJECTION (Required #7)
  modePrompt = processBusinessValidation() + '\n\n[VAULT INJECTION PLACEHOLDER - Site Monkeys business logic would be loaded here]';
  modeFingerprint = 'SM-VAULT-001';
  activePersonality = 'Claude (Site Monkeys)';
  vaultStatus = 'LOADED';
} else {
  switch (mode) {
    case 'truth_general':
      modePrompt = processTruthGeneral();
      modeFingerprint = 'TG-PROD-001';
      activePersonality = 'Eli';
      break;
    case 'business_validation':
      modePrompt = processBusinessValidation();
      modeFingerprint = 'BV-PROD-001';
      activePersonality = 'Roxy';
      break;
    case 'site_monkeys':
      modePrompt = processBusinessValidation();
      modeFingerprint = 'BV-PROD-001';
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

// ASSUMPTION DETECTION
const assumptionWarnings = [];
const assumptionKeywords = ['obviously', 'everyone knows', 'it\'s clear that', 'certainly'];
assumptionKeywords.forEach(keyword => {
  if (message.toLowerCase().includes(keyword)) {
    assumptionWarnings.push({
      keyword: keyword,
      warning: `Assumption detected: "${keyword}" - consider if this is universally true`,
      severity: 'MEDIUM'
    });
  }
});

// BUILD CONVERSATION FOR OPENAI
const messages = [
  { role: 'system', content: modePrompt },
  ...conversation_history,
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

// 🔧 BULLETPROOF ENFORCEMENT SEQUENCE - ZERO TOLERANCE FOR FAILURES
const enforcementLog = [];
let securityPass = true;
let enforcementLevel = 'NONE';

// 🛡️ ENFORCEMENT LAYER 1: POLITICAL CONTENT GUARDRAILS (FIRST - HIGHEST PRIORITY)
console.log('🛡️ Step 1: Political content enforcement...');

let politicalResult;
try {
  if (PoliticalGuardrails && PoliticalGuardrails.guardPoliticalContent) {
    politicalResult = PoliticalGuardrails.guardPoliticalContent(finalResponse, message);
  } else {
    console.warn('⚠️ Using emergency political enforcement');
    politicalResult = EMERGENCY_ENFORCEMENT.guardPoliticalContent(finalResponse, message);
  }
} catch (error) {
  console.error('❌ Political enforcement error:', error);
  politicalResult = EMERGENCY_ENFORCEMENT.guardPoliticalContent(finalResponse, message);
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
  
  // POLITICAL CONTENT GETS IMMEDIATE RETURN
  const promptTokens = completion.usage.prompt_tokens;
  const completionTokens = completion.usage.completion_tokens;
  const vaultTokenCount = vault_loaded ? 500 : 0;
  
  bulletproofTrackApiCall(activePersonality, promptTokens, completionTokens, vaultTokenCount);
  const sessionDisplayData = bulletproofGetSessionDisplayData();
  
  // INJECT DEBUG INFO (Required #5)
  finalResponse += `\n\n🔍 [DEBUG] Mode: ${mode} | Vault: ${vaultStatus} | Security: PASS | Enforcement: ${enforcementLevel}`;
  
  return res.status(200).json({
    response: finalResponse,
    mode_active: mode,
    active_personality: activePersonality,
    mode_fingerprint: modeFingerprint,
    vault_loaded: vault_loaded,
    vault_status: vaultStatus,
    assumption_warnings: assumptionWarnings,
    detail_level: detail_level,
    
    enforcement_applied: {
      political_intervention: true,
      political_risk_level: politicalResult.analysis.political_risk_level,
      political_template_used: politicalResult.analysis.intervention_type,
      mode_compliance: 'SKIPPED_POLITICAL',
      product_validation: 'SKIPPED_POLITICAL'
    },
    
    // REAL TOKEN TRACKING (Required #4)
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
    
    security_pass: true,
    enforcement_level: enforcementLevel,
    enforcement_log: enforcementLog,
    override_tracking: ["OVERRIDE_TRACKING_NOT_IMPLEMENTED"], // Required #8
    timestamp: new Date().toISOString()
  });
}

// 🛡️ ENFORCEMENT LAYER 2: PRODUCT RECOMMENDATION VALIDATION
console.log('🛡️ Step 2: Product recommendation validation...');

let productValidation;
try {
  if (ProductValidator && ProductValidator.validateRecommendation) {
    productValidation = ProductValidator.validateRecommendation(finalResponse, mode, vault_loaded ? {} : null);
  } else {
    console.warn('⚠️ Using emergency product validation');
    productValidation = EMERGENCY_ENFORCEMENT.validateProductRecommendation(finalResponse, mode);
  }
} catch (error) {
  console.error('❌ Product validation error:', error);
  productValidation = EMERGENCY_ENFORCEMENT.validateProductRecommendation(finalResponse, mode);
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
} else {
  console.log('✅ Product recommendation validation passed');
}

// 🛡️ ENFORCEMENT LAYER 3: MODE COMPLIANCE VALIDATION (ONLY IF NO PRIOR BLOCKS)
if (enforcementLevel === 'NONE') {
  console.log('🛡️ Step 3: Mode compliance validation...');
  
  let modeValidation;
  try {
    if (ModeLinter && ModeLinter.validateModeCompliance) {
      modeValidation = ModeLinter.validateModeCompliance(finalResponse, mode, modeFingerprint);
    } else {
      console.warn('⚠️ Using emergency mode validation');
      modeValidation = EMERGENCY_ENFORCEMENT.validateModeCompliance(finalResponse, mode, modeFingerprint);
    }
  } catch (error) {
    console.error('❌ Mode validation error:', error);
    modeValidation = EMERGENCY_ENFORCEMENT.validateModeCompliance(finalResponse, mode, modeFingerprint);
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
  } else {
    console.log('✅ Mode compliance validation passed');
  }
}

// 🔧 TOKEN TRACKING AND COST CALCULATION (Required #4)
const promptTokens = completion.usage.prompt_tokens;
const completionTokens = completion.usage.completion_tokens;
const vaultTokenCount = vault_loaded ? 500 : 0;

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

// INJECT DEBUG INFO INTO ALL RESPONSES (Required #5)
finalResponse += `\n\n🔍 [DEBUG] Mode: ${mode} | Vault: ${vaultStatus} | Security: ${securityPass ? 'PASS' : 'FAIL'} | Enforcement: ${enforcementLevel}`;

console.log('✅ All enforcement layers completed successfully');
console.log('💰 Final session data:', {
  session_cost: sessionDisplayData.session_cost,
  call_count: sessionDisplayData.call_count,
  enforcement_level: enforcementLevel
});

// FINAL RESPONSE WITH COMPLETE ENFORCEMENT DATA
return res.status(200).json({
  response: finalResponse,
  
  // Core system status
  mode_active: mode,
  active_personality: activePersonality,
  mode_fingerprint: modeFingerprint,
  vault_loaded: vault_loaded,
  vault_status: vaultStatus,
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
  
  // 💰 REAL-TIME COST TRACKING (Required #4)
  session_cost: sessionDisplayData.session_cost,
  vault_tokens: sessionDisplayData.vault_tokens,
  total_tokens: sessionDisplayData.total_tokens,
  last_call_cost: sessionDisplayData.last_call_cost,
  call_count: sessionDisplayData.call_count,
  efficiency_rating: sessionDisplayData.efficiency_rating,
  
  // Token usage details
  token_usage: {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens
  },
  
  // System integrity
  security_pass: securityPass,
  enforcement_level: enforcementLevel,
  enforcement_log: enforcementLog,
  override_tracking: ["OVERRIDE_TRACKING_NOT_IMPLEMENTED"], // Required #8
  fallback_used: enforcementLevel !== 'NONE',
  
  // MODE SWITCH ISOLATION HOOK (Required #9) 
  // TODO: Add full session wipe logic when mode switching is implemented
  
  timestamp: new Date().toISOString()
});
```

} catch (error) {
console.error(‘❌ BULLETPROOF enforcement system error:’, error);

```
// NEVER RETURN 500 FOR SIMPLE PROMPTS (Required #6)
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
  override_tracking: ["OVERRIDE_TRACKING_NOT_IMPLEMENTED"],
  timestamp: new Date().toISOString()
});
```

}
}