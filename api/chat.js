import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Core mode definitions
const MODES = {
  truth_general: {
    mode_id: "TG-PROD-001",
    system_prompt: `You are operating in Truth-General Mode. CORE PRINCIPLES:
- NEVER generate unsupported claims or fabricated information
- ALWAYS flag uncertainty with explicit confidence levels
- SURFACE unknowns explicitly - don't work around them
- NO softening language without data backing
- When speculating, use clear prefixes: "Hypothesis:", "Speculation:", "Unverified inference:"
- "I don't know" is always an acceptable answer
- Provide creative solutions based on real information only`,
    
    personality_base: "You are warm, caring, and genuinely helpful, but you never compromise truth for comfort."
  },
  
  business_validation: {
    mode_id: "BV-PROD-001",
    system_prompt: `You are operating in Business Validation Mode. CORE PRINCIPLES:
- ALWAYS model downside scenarios and worst-case outcomes
- SURFACE cost cascades and hidden dependencies
- FLAG survivability risks explicitly
- PRIORITIZE runway preservation over growth optimization
- NO false confidence intervals or optimistic projections
- Provide reality-based risk assessment with creative solutions
- Focus on cash flow impact and business survival`,
    
    personality_base: "You are a caring strategic advisor who helps businesses survive and thrive through honest assessment and creative problem-solving."
  }
};

// Core assumption tracking infrastructure
const ASSUMPTION_TRACKER = {
  health_thresholds: {
    staleness_days: 30,
    override_frequency: 3,
    confidence_minimum: 0.70
  },
  
  tracked_assumptions: {
    market_stage: {
      current_value: "early_stage",
      last_validated: new Date().toISOString(),
      override_count: 0,
      override_history: [],
      confidence_score: 1.0
    },
    financial_status: {
      current_value: "bootstrap_funding", 
      last_validated: new Date().toISOString(),
      override_count: 0,
      override_history: [],
      confidence_score: 1.0
    },
    pricing_position: {
      current_value: "premium_tier",
      last_validated: new Date().toISOString(), 
      override_count: 0,
      override_history: [],
      confidence_score: 1.0
    },
    operational_status: {
      current_value: "pre_launch",
      last_validated: new Date().toISOString(),
      override_count: 0, 
      override_history: [],
      confidence_score: 1.0
    }
  }
};

// Site Monkeys vault logic triggers
const VAULT_TRIGGERS = {
  pricing: ['price', 'pricing', 'cost', 'revenue', 'monetization', 'subscription', 'tier'],
  features: ['feature', 'development', 'roadmap', 'build', 'functionality', 'service'],
  hiring: ['hire', 'hiring', 'staff', 'team', 'employee', 'contractor'],
  marketing: ['marketing', 'advertising', 'campaign', 'lead', 'conversion'],
  competition: ['competitor', 'competitive', 'market', 'industry']
};

// Vault decision frameworks
const SITE_MONKEYS_LOGIC = {
  vault_id: "SM-PROD-v1.0",
  business_context: "Full-service marketing company focusing on SMB 'unsung heroes'",
  
  decision_frameworks: {
    pricing_strategy: {
      logic: "Site Monkeys operates on premium positioning: Boost ($697), Climb ($1,497), Lead ($2,997). Never compete on price - compete on value and complete transparency.",
      override: "VAULT_OVERRIDE"
    },
    
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
  }
};

// Analyze prompt to determine Eli vs Roxy leadership
function analyzePromptType(message) {
  const analyticalKeywords = ['data', 'analysis', 'numbers', 'risk', 'legal', 'compliance', 'math', 'evidence', 'research'];
  const creativeKeywords = ['ideas', 'creative', 'solution', 'alternative', 'stuck', 'brainstorm', 'options', 'different'];
  
  const messageLC = message.toLowerCase();
  
  const analyticalScore = analyticalKeywords.filter(keyword => messageLC.includes(keyword)).length;
  const creativeScore = creativeKeywords.filter(keyword => messageLC.includes(keyword)).length;
  
  if (analyticalScore > creativeScore) return 'eli_leads';
  if (creativeScore > analyticalScore) return 'roxy_leads';
  return 'balanced';
}

// Check assumption health and flag warnings
function checkAssumptionHealth() {
  const now = new Date();
  const warnings = [];
  
  for (const [assumption_name, assumption_data] of Object.entries(ASSUMPTION_TRACKER.tracked_assumptions)) {
    const lastValidated = new Date(assumption_data.last_validated);
    const daysSinceValidation = Math.floor((now - lastValidated) / (1000 * 60 * 60 * 24));
    
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
  }
  
  return warnings;
}

// Track when an assumption is overridden
function trackAssumptionOverride(assumption_name, original_value, overridden_value, reason) {
  if (ASSUMPTION_TRACKER.tracked_assumptions[assumption_name]) {
    ASSUMPTION_TRACKER.tracked_assumptions[assumption_name].override_count++;
    ASSUMPTION_TRACKER.tracked_assumptions[assumption_name].override_history.push({
      timestamp: new Date().toISOString(),
      original_value: original_value,
      overridden_value: overridden_value,
      reason: reason
    });
    
    ASSUMPTION_TRACKER.tracked_assumptions[assumption_name].confidence_score *= 0.95;
  }
}

// Update assumption when validated
function updateAssumption(assumption_name, new_value, confidence = 1.0) {
  if (ASSUMPTION_TRACKER.tracked_assumptions[assumption_name]) {
    ASSUMPTION_TRACKER.tracked_assumptions[assumption_name].current_value = new_value;
    ASSUMPTION_TRACKER.tracked_assumptions[assumption_name].last_validated = new Date().toISOString();
    ASSUMPTION_TRACKER.tracked_assumptions[assumption_name].confidence_score = confidence;
    ASSUMPTION_TRACKER.tracked_assumptions[assumption_name].override_count = 0;
    ASSUMPTION_TRACKER.tracked_assumptions[assumption_name].override_history = [];
  }
}

// Generate assumption health summary
function generateAssumptionHealthSummary() {
  const warnings = checkAssumptionHealth();
  
  if (warnings.length === 0) {
    return '\n\n📊 **Assumption Health**: All assumptions current and healthy.';
  }
  
  let summary = '\n\n⚠️ **Assumption Health Warnings**:\n';
  warnings.forEach(warning => {
    summary += `• ${warning.message}\n`;
  });
  
  summary += '\n💡 Use "update assumption [name]" or "validate assumption [name]" to refresh.';
  return summary;
}

// Check for vault triggers
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

// Generate vault context if triggers found
function generateVaultContext(triggeredFrameworks, vaultLoaded) {
  if (!vaultLoaded || triggeredFrameworks.length === 0) return '';

  let vaultContext = '\n\nSITE MONKEYS VAULT LOGIC ACTIVE:\n';

  triggeredFrameworks.forEach(framework => {
    let logic;
    
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
  });

  vaultContext += '\nApply this business-specific logic while maintaining truth-first principles.\n';
  return vaultContext;
}

// Generate Eli's analytical response
async function generateEliResponse(userMessage, mode, vaultContext, conversationHistory) {
  const eliPersonality = `You are Eli from Site Monkeys - the analytical AI who focuses on data, logic, and truth.
Your personality: Warm but precise, caring but analytical. You lead with facts and evidence.
Your style: "Let me break down what's actually happening here..." / "The data shows..." / "Here's what you need to know..."
${mode.personality_base}

CRITICAL: Never fabricate information. If you don't know something, say so clearly.`;

  const messages = [
    {
      role: "system", 
      content: `${eliPersonality}\n\n${mode.system_prompt}${vaultContext}`
    },
    ...conversationHistory.slice(-6),
    {
      role: "user",
      content: userMessage
    }
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
    max_tokens: 600,
    temperature: 0.3,
  });

  return completion.choices[0].message.content;
}

// Generate Roxy's creative response
async function generateRoxyResponse(userMessage, mode, vaultContext, eliResponse, conversationHistory) {
  const roxyPersonality = `You are Roxy from Site Monkeys - the creative AI who focuses on solutions and possibilities.
Your personality: Warm and encouraging, creative but realistic. You build on truth to find paths forward.
Your style: "Okay, now let's figure out how to make this work..." / "I'm seeing three ways you could..." / "What if we tried..."
${mode.personality_base}

CRITICAL: Base all solutions on real information. Never invent options that don't exist.`;

  const contextWithEli = `Previous analysis from Eli: ${eliResponse}\n\nNow provide creative, reality-based solutions that build on this truth.`;

  const messages = [
    {
      role: "system",
      content: `${roxyPersonality}\n\n${mode.system_prompt}${vaultContext}`
    },
    ...conversationHistory.slice(-6),
    {
      role: "user",
      content: `${userMessage}\n\n${contextWithEli}`
    }
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4", 
    messages: messages,
    max_tokens: 600,
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

// Main chat handler
// VAULT SECURITY AND VERIFICATION SYSTEM
async function verifyVaultAccess(mode, requestedVaultLoad) {
  console.log(`🔐 Vault verification: mode=${mode}, requested=${requestedVaultLoad}`);
  
  // Vault only available in Site Monkeys mode
  if (mode !== 'site_monkeys') {
    if (requestedVaultLoad) {
      console.warn('⚠️ Vault requested but not in Site Monkeys mode - BLOCKED');
    }
    return { 
      allowed: false, 
      context: '',
      reason: 'Vault restricted to Site Monkeys mode',
      security_pass: true // Pass because restriction is working correctly
    };
  }
  
  // If in Site Monkeys mode, verify vault is actually loaded
  try {
    // Use relative path for internal API call
    const vaultResponse = await fetch(`${process.env.VERCEL_URL || 'https://sitemonkeys-ai-system.vercel.app'}/api/load-vault`);
    const vaultData = await vaultResponse.json();
    
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
  } catch (error) {
    console.error('❌ Vault verification failed:', error);
    return { 
      allowed: false, 
      context: '',
      reason: `Vault system error: ${error.message}`,
      security_pass: false
    };
  }
}

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      message, 
      conversation_history = [], 
      mode = 'business_validation',
      vault_loaded = false,
      user_preference = null
    } = req.body;

    // VERIFY VAULT ACCESS AND SECURITY
const vaultVerification = await verifyVaultAccess(mode, vault_loaded);

if (vault_loaded && !vaultVerification.allowed) {
  console.error('🚨 Vault access denied:', vaultVerification.reason);
  return res.status(403).json({
    response: `**System:** Vault access denied: ${vaultVerification.reason}. Switch to Site Monkeys mode to access vault logic.`,
    error: 'VAULT_ACCESS_DENIED',
    mode_active: mode,
    vault_loaded: false,
    security_pass: false,
    reason: vaultVerification.reason
  });
}

// Use verified vault context instead of assumed
const vaultContext = vaultVerification.allowed ? 
  generateVaultContext(triggeredFrameworks, true) : '';

console.log(`🛡️ Vault security check: ${vaultVerification.security_pass ? 'PASS' : 'FAIL'}`);

    const selectedMode = MODES[mode] || MODES.business_validation;
    const promptType = user_preference || analyzePromptType(message);
    const triggeredFrameworks = checkVaultTriggers(message);
    const vaultContext = generateVaultContext(triggeredFrameworks, vault_loaded);
    
    let eliResponse, roxyResponse;
    
    if (promptType === 'eli' || promptType === 'eli_leads') {
      eliResponse = await generateEliResponse(message, selectedMode, vaultContext, conversation_history);
      roxyResponse = await generateRoxyResponse(message, selectedMode, vaultContext, eliResponse, conversation_history);
    } else if (promptType === 'roxy' || promptType === 'roxy_leads') {
      roxyResponse = await generateRoxyResponse(message, selectedMode, vaultContext, '', conversation_history);
      eliResponse = await generateEliResponse(message + `\n\nRoxy's perspective: ${roxyResponse}\n\nProvide analytical validation:`, selectedMode, vaultContext, conversation_history);
    } else {
      eliResponse = await generateEliResponse(message, selectedMode, vaultContext, conversation_history);
      roxyResponse = await generateRoxyResponse(message, selectedMode, vaultContext, eliResponse, conversation_history);
    }

    const assumptionWarnings = checkAssumptionHealth();
    const healthSummary = assumptionWarnings.length > 0 ? generateAssumptionHealthSummary() : '';
    
    const combinedResponse = `**Eli:** ${eliResponse}\n\n**Roxy:** ${roxyResponse}${healthSummary}`;
    
    const vault_status = vault_loaded ? 'SM-VAULT-LOADED' : 'NO-VAULT';
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
  eli_response: eliResponse,
  roxy_response: roxyResponse
});

  } catch (error) {
    console.error('Chat API Error:', error);
    
    const fallbackResponse = `**System:** I encountered an error processing your request. Rather than guess or provide potentially incorrect information, I need to let you know that something went wrong on my end. 

The error was: ${error.message}

Please try your question again, and I'll do my best to provide you with accurate, helpful information.`;

    return res.status(500).json({ 
      response: fallbackResponse,
      error: 'Processing failed',
      fallback_used: true
    });
  }
}
