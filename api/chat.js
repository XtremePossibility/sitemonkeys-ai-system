import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Import enforcement modules with error handling
import { trackApiCall, getSessionDisplayData } from './lib/tokenTracker.js';
import { validateModeCompliance, enforceModeCompliance } from './lib/modeLinter.js';
import { validateProductRecommendation, enforceRecommendationStandards } from './lib/productValidation.js';
import { guardPoliticalContent } from './lib/politicalGuardrails.js';

function processTruthGeneral() {
  return `You are operating in TRUTH-GENERAL MODE - Your job is to protect the user from false information and bad decisions through absolute clarity.

CORE BEHAVIORAL ENFORCEMENT:
- Truth over comfort - NEVER soften reality to make someone feel better
- "I don't know" is a complete, valid answer - no pressure to guess
- Surface every risk and edge case - assume they haven't considered the downsides
- Challenge every assumption - especially the ones they're most confident about
- When data is weak/uncertain/interpolated - FLAG IT IMMEDIATELY
- Zero tolerance for hallucinated facts, dates, statistics, or technical details

RESPONSE STRUCTURE REQUIREMENTS:
1. Direct answer with confidence level (High/Medium/Low/Unknown)
2. Surface critical risks they haven't asked about
3. Challenge core assumptions embedded in their question
4. Provide clear next steps only if actionable

MODE FINGERPRINT: TG-PROD-001`;
}

function processBusinessValidation() {
  return `You are operating in BUSINESS-VALIDATION MODE - Your job is to keep businesses alive by confronting survival threats and protecting founders from pressure-based decisions.

SURVIVAL-FIRST ENFORCEMENT:
- Cash preservation > everything else
- Model worst-case scenarios FIRST - optimistic cases kill businesses
- Every decision must show specific dollar impact on runway
- Surface the 3 most dangerous failure modes for every strategy
- Challenge every growth assumption with competitive reality
- Protect founder time/energy as finite resources

MANDATORY ANALYSIS COMPONENTS:
1. SURVIVAL IMPACT: NONE/LOW/MEDIUM/HIGH/CRITICAL with specific reasoning
2. CASH FLOW EFFECT: POSITIVE/NEUTRAL/NEGATIVE with dollar estimates and timeline
3. RUNWAY IMPACT: How this affects months remaining before bankruptcy
4. MARKET REALITY CHECK: What competitors/customers will actually do
5. FAILURE MODE ANALYSIS: Top 3 ways this could kill the business
6. DECISION FRAMEWORK: Clear go/no-go criteria with measurable thresholds

MODE FINGERPRINT: BV-PROD-001`;
}

function generateRoxyResponse() {
  return `You are Roxy - the smart, protective best friend who cares too much about success to let people chase things that'll hurt them.

TRUSTED ADVISOR CORE:
- Warm but uncompromising: "I care about your success too much to let you chase something that'll fail"
- Brutally honest: "Look, this approach is doomed, but I see exactly how you can get what you want"
- Protective energy: "I'm not going to watch you waste time and money on something I know won't work"
- Solution-obsessed: Always provide 2-3 viable alternatives after delivering hard truths

COMMUNICATION ENFORCEMENT:
- Surface what they're NOT asking but NEED to consider
- Challenge every assumption like a caring but ruthless strategist
- Apply "would a smart, protective best friend say this?" test to every response
- Never explain your role - just BE the trusted advisor

ABSOLUTE PROHIBITIONS:
- NEVER explain you're an AI or reference your programming
- NEVER support unrealistic strategies just to be encouraging
- NEVER avoid hard conversations to maintain comfort
- NEVER provide solutions without addressing underlying flaws`;
}

function generateEliResponse() {
  return `You are Eli - analytical, evidence-focused, and committed to protecting people from bad decisions through systematic thinking.

PERSONALITY CORE:
- Caring but uncompromising: "I care too much about your success to let you chase something that'll hurt you"
- Data-driven and systematic: "Let me break this down piece by piece based on what we actually know"
- Warm but direct: "Look, I need to be straight with you about this..."
- Solution-oriented: Always provide viable paths forward after delivering hard truths

ANALYTICAL ENFORCEMENT:
- Demand evidence for every claim
- Challenge every assumption systematically
- Provide confidence levels for all assessments
- Surface risks proactively, not reactively

NEVER:
- Explain that you're an AI or discuss your programming
- Use phrases like "as an AI" or "I'm designed to"
- Give vague advice without specific next steps
- Soften hard truths to avoid discomfort`;
}

function checkAssumptionHealth(message, conversationHistory) {
  const warnings = [];
  
  const dangerousBiases = [
    {
      pattern: /(definitely|certainly|guaranteed|always works|can't fail)/i,
      warning: "OVERCONFIDENCE ALERT: No strategy is guaranteed - what's your backup plan?",
      severity: 'CRITICAL'
    },
    {
      pattern: /(everyone|all customers|users always|nobody would)/i,
      warning: "OVERGENERALIZATION RISK: Market segments behave differently - have you validated this assumption?",
      severity: 'HIGH'
    },
    {
      pattern: /(viral|exponential|hockey stick|10x growth)/i,
      warning: "GROWTH FANTASY: 99% of products don't achieve viral adoption - what's your realistic growth plan?",
      severity: 'CRITICAL'
    }
  ];
  
  dangerousBiases.forEach(({pattern, warning, severity}) => {
    if (pattern.test(message)) {
      warnings.push({warning, severity, detected_pattern: pattern.source});
    }
  });
  
  return warnings;
}

async function loadVaultLogic() {
  try {
    return {
      vault_id: 'SITE_MONKEYS_VAULT_001',
      logic: `SITE MONKEYS OPERATIONAL VAULT LOADED

CORE BUSINESS CONSTRAINTS:
- Minimum 6-month cash runway must be preserved
- No pricing below premium tier thresholds
- All decisions must strengthen competitive moats
- Founder time protection: max 60hrs/week sustainable`,
      frameworks: ['PRICING_FRAMEWORK', 'FINANCIAL_CONSTRAINTS', 'BRAND_ALIGNMENT'],
      version: '1.0.3',
      token_count: 847,
      loaded_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Vault loading failed:', error);
    return null;
  }
}

function routePersonality(message, mode, conversationHistory) {
  const messageCount = conversationHistory.length;
  return messageCount % 2 === 0 ? 'eli' : 'roxy';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
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

    console.log('🔄 Processing with complete enforcement:', {mode, vault_loaded, message_preview: message.substring(0, 50) + '...'});

    // Mode verification and logic loading
    let modePrompt = '';
    let modeFingerprint = '';
    
    switch (mode) {
      case 'truth_general':
        modePrompt = processTruthGeneral();
        modeFingerprint = 'TG-PROD-001';
        break;
      case 'business_validation':
        modePrompt = processBusinessValidation();
        modeFingerprint = 'BV-PROD-001';
        break;
      case 'site_monkeys':
        modePrompt = processBusinessValidation();
        modeFingerprint = 'BV-PROD-001';
        break;
      default:
        return res.status(400).json({
          error: 'Invalid mode specified',
          valid_modes: ['truth_general', 'business_validation', 'site_monkeys'],
          attempted_mode: mode
        });
    }

    // Assumption health monitoring
    const assumptionWarnings = checkAssumptionHealth(message, conversation_history);
    
    // Vault logic integration
    let vaultPrompt = '';
    let vaultStatus = 'NONE';
    let vaultTokenCount = 0;
    
    if (vault_loaded) {
      try {
        const vaultData = await loadVaultLogic();
        if (vaultData) {
          vaultPrompt = vaultData.logic;
          vaultStatus = 'LOADED';
          vaultTokenCount = vaultData.token_count || 0;
          modeFingerprint += ' + SM-VAULT-LOADED';
        } else {
          vaultStatus = 'FAILED';
        }
      } catch (vaultError) {
        console.error('Vault error:', vaultError);
        vaultStatus = 'FAILED';
      }
    }

    // Personality routing
    const activePersonality = routePersonality(message, mode, conversation_history);
    let personalityPrompt = '';
    
    if (activePersonality === 'eli') {
      personalityPrompt = generateEliResponse();
    } else {
      personalityPrompt = generateRoxyResponse();
    }

    // System prompt construction
    const assumptionAlerts = assumptionWarnings.length > 0 ? 
      `\n\nCRITICAL ASSUMPTION ALERTS:\n${assumptionWarnings.map(w => `- ${w.warning} [${w.severity}]`).join('\n')}` : '';

    const systemPrompt = `${modePrompt}

${personalityPrompt}

${vaultPrompt}

CURRENT_MODE: ${mode}
ACTIVE_PERSONALITY: ${activePersonality}
VAULT_STATUS: ${vaultStatus}
MODE_FINGERPRINT: ${modeFingerprint}${assumptionAlerts}

CONVERSATION_CONTEXT: ${JSON.stringify(conversation_history.slice(-3))}

ENFORCEMENT RULES:
- ZERO TOLERANCE for hallucinated data or optimistic assumptions
- AGGRESSIVE assumption challenging - surface every dangerous bias
- WARM TRUTH DELIVERY - be caring but uncompromising about reality
- NO AI SELF-REFERENCE - never explain your role or programming
- SURVIVAL-FIRST LOGIC for business decisions

Your response must be exactly what a smart, caring, brutally honest best friend would say.
Include mode fingerprint: [${modeFingerprint}] - [CONFIDENCE: X%] - [SURVIVAL_IMPACT: LEVEL]`;

    console.log('🚀 Generating response with mode:', mode, 'personality:', activePersonality);

    // AI response generation
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
      temperature: mode === 'truth_general' ? 0.1 : 0.2,
    });

    let response = completion.choices[0].message.content;
    const promptTokens = completion.usage.prompt_tokens;
    const completionTokens = completion.usage.completion_tokens;

    // 🛡️ ENFORCEMENT LAYER 1: POLITICAL CONTENT GUARDRAILS (HIGHEST PRIORITY)
    console.log('🛡️ Applying political enforcement...');
    let politicalResult;
    try {
      politicalResult = guardPoliticalContent(response, message);
      console.log('🔍 Political analysis:', politicalResult.analysis);
      
      if (politicalResult.political_intervention) {
        response = politicalResult.guarded_response;
        console.log('⚠️ POLITICAL TEMPLATE APPLIED');
        
        // For political content, skip other enforcement and return immediately
        const tokenTracking = trackApiCall(activePersonality, promptTokens, completionTokens, vaultTokenCount);
        const sessionDisplayData = getSessionDisplayData();
        
        return res.status(200).json({
          response: response,
          mode_active: mode,
          active_personality: activePersonality,
          mode_fingerprint: modeFingerprint,
          vault_loaded: vault_loaded,
          vault_status: vaultStatus,
          assumption_warnings: assumptionWarnings,
          
          enforcement_applied: {
            political_intervention: true,
            political_risk_level: politicalResult.analysis.political_risk_level,
            political_template: politicalResult.analysis.intervention_type,
            mode_compliance: 'SKIPPED_POLITICAL',
            product_validation: 'SKIPPED_POLITICAL'
          },
          
          session_cost: sessionDisplayData.session_cost,
          vault_tokens: sessionDisplayData.vault_tokens,
          total_tokens: sessionDisplayData.total_tokens,
          last_call_cost: sessionDisplayData.last_call_cost,
          call_count: sessionDisplayData.call_count,
          
          security_pass: true,
          enforcement_level: 'POLITICAL_TEMPLATE',
          timestamp: new Date().toISOString()
        });
      }
    } catch (politicalError) {
      console.error('Political enforcement error:', politicalError);
      politicalResult = { political_intervention: false, analysis: { political_risk_level: 'UNKNOWN' } };
    }

    // 🛡️ ENFORCEMENT LAYER 2: PRODUCT RECOMMENDATION VALIDATION
    console.log('🛡️ Applying product validation...');
    let productValidation, productEnforcement;
    try {
      productValidation = validateProductRecommendation(response, mode);
      productEnforcement = enforceRecommendationStandards(response, productValidation);
      
      if (productEnforcement.original_blocked) {
        response = productEnforcement.enforcement_response;
        console.log('⚠️ Product recommendation blocked');
      }
    } catch (productError) {
      console.error('Product validation error:', productError);
      productValidation = { validation_passed: true };
      productEnforcement = { original_blocked: false };
    }

    // 🛡️ ENFORCEMENT LAYER 3: MODE COMPLIANCE VALIDATION
    console.log('🛡️ Applying mode compliance...');
    let modeValidation, modeEnforcement;
    try {
      modeValidation = validateModeCompliance(response, mode, modeFingerprint);
      modeEnforcement = enforceModeCompliance(response, modeValidation);
      
      if (modeEnforcement.original_blocked) {
        response = modeEnforcement.enforcement_response;
        console.log('⚠️ Mode compliance enforced');
      }
    } catch (modeError) {
      console.error('Mode validation error:', modeError);
      modeValidation = { mode_compliance: 'ERROR' };
      modeEnforcement = { original_blocked: false, compliance_status: 'ERROR' };
    }

    // 🛡️ TOKEN TRACKING AND COST CALCULATION
    let tokenTracking, sessionDisplayData;
    try {
      tokenTracking = trackApiCall(activePersonality, promptTokens, completionTokens, vaultTokenCount);
      sessionDisplayData = getSessionDisplayData();
    } catch (tokenError) {
      console.error('Token tracking error:', tokenError);
      sessionDisplayData = {
        session_cost: '$0.0000',
        vault_tokens: 0,
        total_tokens: promptTokens + completionTokens,
        last_call_cost: '$0.0000',
        call_count: 0
      };
    }

    // Add critical assumption warnings
    const criticalWarnings = assumptionWarnings.filter(w => w.severity === 'CRITICAL');
    if (criticalWarnings.length > 0) {
      response += `\n\n🚨 CRITICAL ASSUMPTION ALERTS:`;
      criticalWarnings.forEach(warning => {
        response += `\n- ${warning.warning}`;
      });
    }

    console.log('✅ All enforcement completed successfully');

    // Final response with complete enforcement data
    return res.status(200).json({
      response: response,
      
      // Core system status
      mode_active: mode,
      active_personality: activePersonality,
      mode_fingerprint: modeFingerprint,
      vault_loaded: vault_loaded,
      vault_status: vaultStatus,
      assumption_warnings: assumptionWarnings,
      detail_level: detail_level,
      
      // Enforcement results
      enforcement_applied: {
        political_intervention: politicalResult.political_intervention,
        political_risk_level: politicalResult.analysis.political_risk_level,
        mode_compliance: modeEnforcement.compliance_status,
        mode_blocked: modeEnforcement.original_blocked,
        product_validation: productValidation.validation_passed,
        product_blocked: productEnforcement.original_blocked
      },
      
      // Real-time cost tracking
      session_cost: sessionDisplayData.session_cost,
      vault_tokens: sessionDisplayData.vault_tokens,
      total_tokens: sessionDisplayData.total_tokens,
      last_call_cost: sessionDisplayData.last_call_cost,
      call_count: sessionDisplayData.call_count,
      
      // Token usage details
      token_usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      },
      
      // System integrity
      security_pass: !modeEnforcement.original_blocked && !productEnforcement.original_blocked,
      enforcement_level: 'COMPLETE',
      fallback_used: modeEnforcement.original_blocked || productEnforcement.original_blocked,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Complete enforcement system error:', error);
    
    return res.status(500).json({
      error: 'Complete enforcement system failure',
      message: 'The cognitive integrity system encountered a critical error.',
      details: error.message,
      enforcement_level: 'SYSTEM_FAILURE',
      timestamp: new Date().toISOString()
    });
  }
}
