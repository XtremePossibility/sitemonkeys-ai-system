import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Import hardened logic enforcement modules
import { 
  processTruthGeneral, 
  processBusinessValidation, 
  generateEliResponse, 
  generateRoxyResponse,
  analyzePromptType,
  validateModeCompliance 
} from './lib/personalities.js';

// Hardened assumption health monitoring
function checkAssumptionHealth(message, conversationHistory) {
  const warnings = [];
  
  // Aggressive bias detection patterns
  const dangerousBiases = [
    {
      pattern: /(definitely|certainly|guaranteed|always works|can't fail)/i,
      warning: "OVERCONFIDENCE ALERT: No business strategy is guaranteed - what's your backup plan?",
      severity: 'HIGH'
    },
    {
      pattern: /(everyone|all customers|users always|nobody would)/i,
      warning: "OVERGENERALIZATION RISK: Market segments behave differently - have you validated this assumption?",
      severity: 'HIGH'
    },
    {
      pattern: /(just|simply|easy|quick|only takes)/i,
      warning: "COMPLEXITY BLINDNESS: Implementation is usually 3x harder than expected - what could go wrong?",
      severity: 'MEDIUM'
    },
    {
      pattern: /(competitors won't|market can't|impossible for them)/i,
      warning: "COMPETITIVE BLINDNESS: Competitors will respond - how will you maintain advantage?",
      severity: 'HIGH'
    },
    {
      pattern: /(viral|exponential|hockey stick|10x growth)/i,
      warning: "GROWTH FANTASY: 99% of products don't achieve viral adoption - what's your realistic growth plan?",
      severity: 'CRITICAL'
    },
    {
      pattern: /(just need 1%|tiny market share|if we get even)/i,
      warning: "MARKET SIZE FALLACY: 1% of a large market is still extremely difficult to capture",
      severity: 'HIGH'
    }
  ];
  
  dangerousBiases.forEach(({ pattern, warning, severity }) => {
    if (pattern.test(message)) {
      warnings.push({ warning, severity, detected_pattern: pattern.source });
    }
  });
  
  // Escalating commitment detection
  if (conversationHistory.length > 2) {
    const recentMessages = conversationHistory.slice(-3);
    const commitmentKeywords = ['invest more', 'double down', 'all in', 'commit everything', 'spend more'];
    
    let commitmentEscalation = 0;
    recentMessages.forEach(msg => {
      commitmentKeywords.forEach(keyword => {
        if (msg.toLowerCase().includes(keyword)) commitmentEscalation++;
      });
    });
    
    if (commitmentEscalation >= 2) {
      warnings.push({ 
        warning: "ESCALATING COMMITMENT DETECTED: You're increasing investment without validating core assumptions",
        severity: 'CRITICAL',
        detected_pattern: 'escalating_commitment'
      });
    }
  }
  
  return warnings;
}

// Vault-aware constraint application
function applyVaultConstraints(message, vaultData, mode) {
  if (!vaultData) return [];
  
  const triggeredFrameworks = [];
  const messageContent = message.toLowerCase();
  
  // Site Monkeys specific business logic
  if (mode === 'business_validation') {
    // Pricing framework constraints
    if (messageContent.includes('pric') || messageContent.includes('cost') || messageContent.includes('charge')) {
      triggeredFrameworks.push({
        framework: 'PRICING_FRAMEWORK',
        constraint: 'Minimum service tier pricing enforced - no below-market positioning',
        vault_rule: 'SMKT-PRICE-001'
      });
    }
    
    // Financial decision constraints
    if (messageContent.includes('spend') || messageContent.includes('invest') || messageContent.includes('buy')) {
      triggeredFrameworks.push({
        framework: 'FINANCIAL_CONSTRAINTS',
        constraint: 'All expenditures must preserve 6-month runway minimum',
        vault_rule: 'SMKT-CASH-001'
      });
    }
    
    // Brand positioning constraints
    if (messageContent.includes('position') || messageContent.includes('brand') || messageContent.includes('market')) {
      triggeredFrameworks.push({
        framework: 'BRAND_ALIGNMENT',
        constraint: 'Premium positioning required - avoid commodity market competition',
        vault_rule: 'SMKT-BRAND-001'
      });
    }
  }
  
  return triggeredFrameworks;
}

// Enhanced vault loading with KV integration
async function loadVaultLogic() {
  try {
    // This would integrate with your existing KV vault system
    // For now, return structured vault logic
    return {
      vault_id: 'SITE_MONKEYS_VAULT_001',
      logic: `
SITE MONKEYS OPERATIONAL VAULT LOADED

CORE BUSINESS CONSTRAINTS:
- Minimum 6-month cash runway must be preserved
- No pricing below premium tier thresholds
- All decisions must strengthen competitive moats
- Founder time protection: max 60hrs/week sustainable

DECISION FRAMEWORKS:
- PRICING: Tier-based, premium positioning, no discounting
- HIRING: Revenue-per-employee ratios must exceed targets
- MARKETING: ROI measurement required within 30 days
- PRODUCT: Feature additions must reduce support burden

SURVIVAL PRIORITIES:
1. Cash preservation
2. Customer retention  
3. Operational efficiency
4. Market position defense`,
      frameworks: ['PRICING_FRAMEWORK', 'FINANCIAL_CONSTRAINTS', 'BRAND_ALIGNMENT'],
      version: '1.0.3',
      loaded_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Vault loading failed:', error);
    return null;
  }
}

// Personality routing with pressure resistance
function routePersonality(message, mode, conversationHistory) {
  // Determine if Eli (analytical) or Roxy (creative) should respond
  const analyticalIndicators = [
    'analyze', 'data', 'numbers', 'calculate', 'research', 'facts', 'evidence'
  ];
  
  const creativeIndicators = [
    'alternative', 'options', 'different way', 'stuck', 'help me think', 'ideas'
  ];
  
  const messageWords = message.toLowerCase().split(' ');
  
  const analyticalScore = analyticalIndicators.reduce((score, indicator) => {
    return score + (messageWords.some(word => word.includes(indicator)) ? 1 : 0);
  }, 0);
  
  const creativeScore = creativeIndicators.reduce((score, indicator) => {
    return score + (messageWords.some(word => word.includes(indicator)) ? 1 : 0);
  }, 0);
  
  // Default routing: Eli for business analysis, Roxy for creative solutions
  if (mode === 'business_validation' && analyticalScore >= creativeScore) {
    return 'eli';
  } else if (creativeScore > analyticalScore) {
    return 'roxy';
  } else {
    // Alternate between personalities to maintain engagement
    const messageCount = conversationHistory.length;
    return messageCount % 2 === 0 ? 'eli' : 'roxy';
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
      mode = 'truth_general', 
      vault_loaded = false,
      verify_mode = false,
      detail_level = 'essential'
    } = req.body;

    console.log('🔄 Processing with hardened enforcement:', { 
      mode, 
      vault_loaded, 
      message_preview: message.substring(0, 50) + '...',
      assumption_check_active: true
    });

    // STEP 1: Mode Verification and Logic Loading
    let modePrompt = '';
    let modeFingerprint = '';
    
    switch (mode) {
      case 'truth_general':
        modePrompt = processTruthGeneral();
        modeFingerprint = 'TG-2024-001';
        break;
      case 'business_validation':
        modePrompt = processBusinessValidation();
        modeFingerprint = 'BV-2024-001';
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid mode specified',
          valid_modes: ['truth_general', 'business_validation'],
          attempted_mode: mode
        });
    }

    // STEP 2: Aggressive Assumption Health Monitoring
    const assumptionWarnings = checkAssumptionHealth(message, conversation_history);
    
    // STEP 3: Vault Logic Integration with Constraint Enforcement
    let vaultPrompt = '';
    let vaultStatus = 'NONE';
    let triggeredFrameworks = [];
    
    if (vault_loaded) {
      try {
        const vaultData = await loadVaultLogic();
        if (vaultData) {
          vaultPrompt = vaultData.logic;
          vaultStatus = 'LOADED';
          triggeredFrameworks = applyVaultConstraints(message, vaultData, mode);
          modeFingerprint += ' + SM-VAULT-LOADED';
        } else {
          vaultStatus = 'FAILED';
          return res.status(200).json({
            error: 'Vault loading failed',
            message: 'Site Monkeys vault could not be loaded. This may impact business-specific guidance.',
            fallback_mode: mode,
            action_required: 'Try refreshing vault or continue with base mode logic',
            security_implications: 'Operating without brand-specific constraints'
          });
        }
      } catch (vaultError) {
        console.error('Critical vault error:', vaultError);
        return res.status(500).json({
          error: 'Vault system failure',
          message: 'Critical error in vault loading system.',
          technical_details: vaultError.message,
          immediate_action: 'System requires attention - contact support'
        });
      }
    }

    // STEP 4: Personality Routing with Pressure Resistance
    const activePersonality = routePersonality(message, mode, conversation_history);
    let personalityPrompt = '';
    
    if (activePersonality === 'eli') {
      personalityPrompt = generateEliResponse(message, mode);
    } else {
      personalityPrompt = generateRoxyResponse(message, mode);
    }

    // STEP 5: Construct Hardened System Prompt
    const assumptionAlerts = assumptionWarnings.length > 0 ? 
      `\n\nCRITICAL ASSUMPTION ALERTS:\n${assumptionWarnings.map(w => `- ${w.warning} [${w.severity}]`).join('\n')}` : '';
    
    const vaultConstraints = triggeredFrameworks.length > 0 ? 
      `\n\nVAULT CONSTRAINTS TRIGGERED:\n${triggeredFrameworks.map(f => `- ${f.framework}: ${f.constraint}`).join('\n')}` : '';

    const systemPrompt = `${modePrompt}

${personalityPrompt}

${vaultPrompt}

CURRENT_MODE: ${mode}
ACTIVE_PERSONALITY: ${activePersonality}
VAULT_STATUS: ${vaultStatus}
DETAIL_LEVEL: ${detail_level}
MODE_FINGERPRINT: ${modeFingerprint}${assumptionAlerts}${vaultConstraints}

CONVERSATION_CONTEXT: ${JSON.stringify(conversation_history.slice(-3))}

HARDENED ENFORCEMENT RULES:
- ZERO TOLERANCE for hallucinated data, optimistic assumptions, or false reassurance
- AGGRESSIVE assumption challenging - surface every dangerous bias
- PROACTIVE risk surfacing - don't wait to be asked about downsides
- WARM TRUTH DELIVERY - be caring but uncompromising about reality
- NO AI SELF-REFERENCE - never explain your role or programming
- SURVIVAL-FIRST LOGIC for business decisions

Your response must be exactly what a smart, caring, brutally honest best friend would say.
Include mode fingerprint: [${modeFingerprint}] - [CONFIDENCE: X%] - [SURVIVAL_IMPACT: LEVEL]`;

    console.log('🚀 Generating hardened response with:', { 
      mode, 
      personality: activePersonality, 
      vault_constraints: triggeredFrameworks.length,
      assumption_alerts: assumptionWarnings.length 
    });

    // STEP 6: Generate AI Response with Hardened Enforcement
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: detail_level === 'full' ? 1500 : detail_level === 'detailed' ? 800 : 400,
      temperature: mode === 'truth_general' ? 0.1 : 0.2, // Lower temp for more consistent enforcement
    });

    let response = completion.choices[0].message.content;

    // STEP 7: Post-Processing Validation
    const complianceCheck = validateModeCompliance(response, mode, modeFingerprint);
    
    // Add critical assumption warnings to response if high severity
    const criticalWarnings = assumptionWarnings.filter(w => w.severity === 'CRITICAL');
    if (criticalWarnings.length > 0) {
      response += `\n\n🚨 CRITICAL ASSUMPTION ALERTS:`;
      criticalWarnings.forEach(warning => {
        response += `\n- ${warning.warning}`;
      });
    }

    // STEP 8: Calculate Token Usage and Costs
    const promptTokens = completion.usage.prompt_tokens;
    const completionTokens = completion.usage.completion_tokens;
    const totalTokens = promptTokens + completionTokens;
    const cost = (promptTokens * 0.03 + completionTokens * 0.06) / 1000;

    console.log('✅ Hardened response generated:', {
      compliance_score: complianceCheck.mode_compliance,
      truth_score: complianceCheck.truth_score,
      violations: complianceCheck.violations.length
    });

    // STEP 9: Construct Response Object with Full Validation Data
    return res.status(200).json({
      response: response,
      mode_active: mode,
      active_personality: activePersonality,
      mode_fingerprint: modeFingerprint,
      vault_loaded: vault_loaded,
      vault_status: vaultStatus,
      triggered_frameworks: triggeredFrameworks,
      assumption_warnings: assumptionWarnings,
      detail_level: detail_level,
      compliance_check: complianceCheck,
      token_usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens, 
        total_tokens: totalTokens
      },
      session_cost: `$${cost.toFixed(4)}`,
      security_pass: complianceCheck.violations.length === 0,
      fallback_used: false,
      enforcement_level: 'HARDENED',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Hardened Chat API Error:', error);
    
    // Hardened error response - never fail silently
    return res.status(500).json({ 
      error: 'Cognitive integrity system failure',
      message: 'The hardened enforcement system encountered a critical error.',
      technical_details: error.message,
      system_status: 'DEGRADED',
      fallback_available: false,
      immediate_action: 'System requires immediate attention',
      mode_attempted: req.body.mode || 'unknown',
      vault_attempted: req.body.vault_loaded || false,
      timestamp: new Date().toISOString(),
      error_code: 'HARD_SYSTEM_FAILURE'
    });
  }
}
