import OpenAI from ‘openai’;

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

// REAL ENFORCEMENT IMPORTS - Using your actual class-based modules
import { PoliticalGuardrails } from ‘./lib/politicalGuardrails.js’;
import { ProductValidator } from ‘./lib/productValidation.js’;
import { ModeLinter } from ‘./lib/modeLinter.js’;
import { trackApiCall, getSessionDisplayData } from ‘./lib/tokenTracker.js’;

// Mode processors
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
console.log(‘🔍 Starting PRODUCTION enforcement chat handler…’);

```
const {
  message,
  conversation_history = [],
  mode = 'truth_general',
  vault_loaded = false,
  verify_mode = false,
  detail_level = 'essential'
} = req.body;

console.log('✅ Request parsed:', {mode, vault_loaded, message_preview: message.substring(0, 50) + '...'});

// Mode logic loading
let modePrompt = '';
let modeFingerprint = '';
let activePersonality = '';
let vaultStatus = vault_loaded ? 'LOADED' : 'NOT_LOADED';

if (vault_loaded && mode === 'site_monkeys') {
  // Load Site Monkeys vault content here
  modePrompt = processBusinessValidation() + '\n\n[SITE MONKEYS VAULT CONTENT WOULD BE INJECTED HERE]';
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
        attempted_mode: mode
      });
  }
}

console.log('✅ Mode configured:', { mode, activePersonality, modeFingerprint });

// Assumption detection
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

// Build conversation for OpenAI
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

// 🔧 PRODUCTION ENFORCEMENT SEQUENCE - ACTUALLY REPLACE RESPONSES
const enforcementLog = [];
let securityPass = true;
let enforcementLevel = 'NONE';

// 🛡️ ENFORCEMENT LAYER 1: POLITICAL CONTENT GUARDRAILS (FIRST - HIGHEST PRIORITY)
console.log('🛡️ Step 1: Checking political content...');
console.log('🔍 Political input analysis:', { 
  message_preview: message.substring(0, 100),
  response_preview: finalResponse.substring(0, 100)
});

const politicalResult = PoliticalGuardrails.guardPoliticalContent(finalResponse, message);
console.log('🔍 Political analysis result:', { 
  intervention: politicalResult.political_intervention,
  risk_level: politicalResult.analysis.political_risk_level,
  type: politicalResult.analysis.intervention_type,
  categories: politicalResult.analysis.detected_categories
});

if (politicalResult.political_intervention) {
  finalResponse = politicalResult.guarded_response;
  enforcementLog.push("POLITICAL_GUARDRAIL_APPLIED");
  enforcementLevel = 'POLITICAL_TEMPLATE_APPLIED';
  console.log('⚠️ POLITICAL TEMPLATE APPLIED - original response blocked');
  
  // Political content gets immediate return with tracking
  const promptTokens = completion.usage.prompt_tokens;
  const completionTokens = completion.usage.completion_tokens;
  const vaultTokenCount = vault_loaded ? 500 : 0;
  
  trackApiCall(activePersonality, promptTokens, completionTokens, vaultTokenCount);
  const sessionDisplayData = getSessionDisplayData();
  
  // Add debug info to political response
  finalResponse += `\n\n🔍 [DEBUG] Mode: ${mode} | Vault: ${vaultStatus} | Security: PASS`;
  
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
    
    // REAL TOKEN TRACKING
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
    timestamp: new Date().toISOString()
  });
}

// 🛡️ ENFORCEMENT LAYER 2: PRODUCT RECOMMENDATION VALIDATION
console.log('🛡️ Step 2: Validating product recommendations...');
console.log('🔍 Product validation input:', { 
  response_preview: finalResponse.substring(0, 100),
  mode,
  has_vault: vault_loaded 
});

const productValidation = ProductValidator.validateRecommendation(finalResponse, mode, vault_loaded ? {} : null);
console.log('🔍 Product validation result:', { 
  passed: productValidation.validation_passed,
  evidence_strength: productValidation.evidence_strength,
  value_analysis: productValidation.value_analysis,
  risk_assessment: productValidation.risk_assessment,
  enforcement_actions: productValidation.enforcement_actions ? productValidation.enforcement_actions.length : 0
});

if (!productValidation.validation_passed) {
  const enforcementResponse = `RECOMMENDATION VALIDATION FAILED
```

The original response contained product/service recommendations that don’t meet evidence standards:

${productValidation.enforcement_actions.map(action => `• ${action.message}`).join(’\n’)}

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

// 🛡️ ENFORCEMENT LAYER 3: MODE COMPLIANCE VALIDATION (ONLY IF NO POLITICAL/PRODUCT BLOCKS)
if (enforcementLevel === 'NONE') {
  console.log('🛡️ Step 3: Validating mode compliance...');
  console.log('🔍 Mode compliance input:', { 
    response_preview: finalResponse.substring(0, 100),
    mode,
    modeFingerprint 
  });
  
  const modeValidation = ModeLinter.validateModeCompliance(finalResponse, mode, modeFingerprint);
  console.log('🔍 Mode validation result:', { 
    compliance: modeValidation.mode_compliance,
    score: modeValidation.compliance_score,
    missing: modeValidation.missing_elements,
    correction_needed: modeValidation.correction_needed
  });
  
  if (modeValidation.correction_needed) {
    finalResponse = modeValidation.fallback_correction;
    enforcementLog.push("MODE_COMPLIANCE_ENFORCED");
    enforcementLevel = 'MODE_COMPLIANCE_ENFORCED';
    securityPass = false;
    console.log('⚠️ Mode compliance enforced - structure violation');
    console.log('🔍 Fallback correction applied:', modeValidation.fallback_correction.substring(0, 200) + '...');
  } else {
    console.log('✅ Mode compliance validation passed');
  }
}

// 🔧 TOKEN TRACKING AND COST CALCULATION
const promptTokens = completion.usage.prompt_tokens;
const completionTokens = completion.usage.completion_tokens;
const vaultTokenCount = vault_loaded ? 500 : 0;

trackApiCall(activePersonality, promptTokens, completionTokens, vaultTokenCount);
const sessionDisplayData = getSessionDisplayData();

// Add critical assumption warnings to response
const criticalWarnings = assumptionWarnings.filter(w => w.severity === 'CRITICAL');
if (criticalWarnings.length > 0) {
  finalResponse += `\n\n🚨 CRITICAL ASSUMPTION ALERTS:`;
  criticalWarnings.forEach(warning => {
    finalResponse += `\n- ${warning.warning}`;
  });
}

// Add debug info to all responses
finalResponse += `\n\n🔍 [DEBUG] Mode: ${mode} | Vault: ${vaultStatus} | Security: ${securityPass ? 'PASS' : 'FAIL'}`;

console.log('✅ All enforcement layers completed successfully');
console.log('💰 Final session data:', {
  session_cost: sessionDisplayData.session_cost,
  call_count: sessionDisplayData.call_count,
  total_tokens: sessionDisplayData.total_tokens,
  last_call_cost: sessionDisplayData.last_call_cost
});

// Final response with complete enforcement data
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
  
  // 💰 REAL-TIME COST TRACKING - FIXED
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
  fallback_used: enforcementLevel !== 'NONE',
  timestamp: new Date().toISOString()
});
```

} catch (error) {
console.error(‘❌ PRODUCTION enforcement system error:’, error);

```
return res.status(500).json({
  error: 'Production enforcement system failure',
  message: 'The cognitive integrity system with production enforcement encountered an error.',
  details: error.message,
  enforcement_level: 'FAILED',
  stack: error.stack,
  timestamp: new Date().toISOString()
});
```

}
}