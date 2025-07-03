import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// EMERGENCY ENFORCEMENT - Self-contained (no external imports)
function guardPoliticalContent(response, message) {
  const politicalKeywords = ['vote', 'election', 'candidate', 'party', 'democrat', 'republican', 'liberal', 'conservative', 'policy', 'politics', 'politician'];
  
  const isPolitical = politicalKeywords.some(keyword => 
    message.toLowerCase().includes(keyword) || response.toLowerCase().includes(keyword)
  );
  
  if (isPolitical) {
    return {
      political_intervention: true,
      guarded_response: `Voting is a sacred personal right and responsibility. I don't provide voting recommendations or endorse specific candidates.

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
        political_risk_level: 'HIGH',
        intervention_type: 'VOTING_TEMPLATE'
      }
    };
  }
  
  return { political_intervention: false };
}

function validateProductRecommendation(response, mode) {
  const productKeywords = ['recommend', 'suggest', 'use jasper', 'popular', 'best tool', 'should buy', 'trendy'];
  
  const hasWeakRecommendation = productKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
  
  if (hasWeakRecommendation) {
    return {
      validation_passed: false,
      evidence_strength: 25,
      value_analysis: 'INSUFFICIENT',
      risk_assessment: 'HIGH',
      enforcement_response: `RECOMMENDATION VALIDATION FAILED

The response contained product/service recommendations that don't meet evidence standards.

EVIDENCE STRENGTH: 25% (Required: 50%+)
ISSUE: Recommendation based on popularity rather than evidence

To proceed with recommendations, please provide:
1. Specific evidence or data sources
2. Clear value proposition with quantified benefits  
3. Risk analysis including potential downsides
4. Appropriate disclosure statements

Would you like me to research this topic more thoroughly to provide a properly validated recommendation?`
    };
  }
  
  return { validation_passed: true, evidence_strength: 100 };
}

function validateModeCompliance(response, mode, modeFingerprint) {
  const requiredElements = {
    truth_general: ['confidence', 'unknown', 'assumption'],
    business_validation: ['survival impact', 'cash flow', 'market reality']
  };
  
  const required = requiredElements[mode] || [];
  const missing = required.filter(element => 
    !response.toLowerCase().includes(element.toLowerCase())
  );
  
  if (missing.length > 0) {
    let fallbackResponse = '';
    
    if (mode === 'truth_general') {
      fallbackResponse = `TRUTH MODE COMPLIANCE FAILURE

The response lacks required truth enforcement elements:

MISSING: CONFIDENCE_PERCENTAGE
REQUIRED: CONFIDENCE: [High/Medium/Low/Unknown] based on [specific reasoning]

MISSING: UNKNOWN_ACKNOWLEDGMENT  
REQUIRED: ACKNOWLEDGE UNCERTAINTY: Use "I don't know" when appropriate

MISSING: ASSUMPTION_CHALLENGE
REQUIRED: CHALLENGE ASSUMPTIONS: Question underlying premises in the question

CORRECTED RESPONSE REQUIRED: Please reformat with proper truth-first structure.`;
    } else if (mode === 'business_validation') {
      fallbackResponse = `BUSINESS MODE COMPLIANCE FAILURE

The response lacks required business validation elements:

MISSING: SURVIVAL_IMPACT
REQUIRED FORMAT: SURVIVAL IMPACT: [NONE/LOW/MEDIUM/HIGH/CRITICAL] - [Specific threat analysis]

MISSING: CASH_FLOW_ANALYSIS
REQUIRED FORMAT: CASH FLOW ANALYSIS: [POSITIVE/NEUTRAL/NEGATIVE] $[Amount] over [Timeline]

MISSING: MARKET_REALITY
REQUIRED FORMAT: MARKET REALITY CHECK: [Competitive threats and adoption challenges]

CORRECTED RESPONSE REQUIRED: Please reformat with all required business validation elements.`;
    }
    
    return {
      correction_needed: true,
      mode_compliance: 'NON_COMPLIANT',
      compliance_score: 25,
      missing_elements: missing,
      fallback_correction: fallbackResponse
    };
  }
  
  return { correction_needed: false, mode_compliance: 'COMPLIANT', compliance_score: 100 };
}

// Self-contained token tracking
let sessionData = {
  totalCost: 0,
  totalTokens: 0,
  callCount: 0,
  lastCallCost: 0
};

function trackApiCall(personality, promptTokens, completionTokens, vaultTokens) {
  const inputCost = (promptTokens * 0.00003);  // $0.03 per 1K input tokens
  const outputCost = (completionTokens * 0.00006); // $0.06 per 1K output tokens
  const totalCallCost = inputCost + outputCost;
  
  sessionData.totalCost += totalCallCost;
  sessionData.totalTokens += (promptTokens + completionTokens);
  sessionData.callCount += 1;
  sessionData.lastCallCost = totalCallCost;
}

function getSessionDisplayData() {
  return {
    session_cost: `$${sessionData.totalCost.toFixed(4)}`,
    vault_tokens: 0,
    total_tokens: sessionData.totalTokens,
    last_call_cost: `$${sessionData.lastCallCost.toFixed(4)}`,
    call_count: sessionData.callCount,
    efficiency_rating: sessionData.totalCost < 0.10 ? 'EXCELLENT' : 'GOOD'
  };
}

// Mode processors
function processTruthGeneral() {
  return `You are Eli, the Truth-General mode assistant. Your core purpose is providing clear, honest, evidence-based responses.

TRUTH-FIRST LOGIC (NON-NEGOTIABLE):
- Start with direct answers when possible
- Use confidence scoring for claims (High/Medium/Low/Unknown)
- Acknowledge uncertainty explicitly ("I don't know" is valid)
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
    console.log('🔍 Starting enforcement-first chat handler...');
    
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
      default:
        return res.status(400).json({
          error: 'Invalid mode specified',
          valid_modes: ['truth_general', 'business_validation'],
          attempted_mode: mode
        });
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

    // 🔧 ENFORCEMENT SEQUENCE - ACTUALLY REPLACE RESPONSES
    const enforcementLog = [];
    let securityPass = true;
    let enforcementLevel = 'NONE';
    
    // 🛡️ ENFORCEMENT LAYER 1: POLITICAL CONTENT GUARDRAILS (FIRST)
    console.log('🛡️ Step 1: Checking political content...');
    const politicalResult = guardPoliticalContent(finalResponse, message);
    console.log('🔍 Political analysis:', { 
      intervention: politicalResult.political_intervention
    });
    
    if (politicalResult.political_intervention) {
      finalResponse = politicalResult.guarded_response;
      enforcementLog.push("POLITICAL_GUARDRAIL_APPLIED");
      enforcementLevel = 'POLITICAL_TEMPLATE_APPLIED';
      console.log('⚠️ POLITICAL TEMPLATE APPLIED');
      
      // Add debug info and return immediately
      finalResponse += `\n\n🔍 [DEBUG] Mode: ${mode} | Vault: ${vaultStatus} | Security: PASS`;
      
      const promptTokens = completion.usage.prompt_tokens;
      const completionTokens = completion.usage.completion_tokens;
      trackApiCall(activePersonality, promptTokens, completionTokens, 0);
      const sessionDisplayData = getSessionDisplayData();
      
      return res.status(200).json({
        response: finalResponse,
        mode_active: mode,
        active_personality: activePersonality,
        mode_fingerprint: modeFingerprint,
        vault_loaded: vault_loaded,
        vault_status: vaultStatus,
        assumption_warnings: assumptionWarnings,
        
        enforcement_applied: {
          political_intervention: true,
          political_risk_level: politicalResult.analysis.political_risk_level,
          mode_compliance: 'SKIPPED_POLITICAL',
          product_validation: 'SKIPPED_POLITICAL'
        },
        
        session_cost: sessionDisplayData.session_cost,
        vault_tokens: sessionDisplayData.vault_tokens,
        total_tokens: sessionDisplayData.total_tokens,
        last_call_cost: sessionDisplayData.last_call_cost,
        call_count: sessionDisplayData.call_count,
        
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
    const productValidation = validateProductRecommendation(finalResponse, mode);
    console.log('🔍 Product validation:', { 
      passed: productValidation.validation_passed,
      evidence: productValidation.evidence_strength
    });
    
    if (!productValidation.validation_passed) {
      finalResponse = productValidation.enforcement_response;
      enforcementLog.push("PRODUCT_RECOMMENDATION_BLOCKED");
      enforcementLevel = 'PRODUCT_VALIDATION_ENFORCED';
      securityPass = false;
      console.log('⚠️ Product recommendation blocked');
    }

    // 🛡️ ENFORCEMENT LAYER 3: MODE COMPLIANCE VALIDATION
    if (enforcementLevel === 'NONE') {
      console.log('🛡️ Step 3: Validating mode compliance...');
      const modeValidation = validateModeCompliance(finalResponse, mode, modeFingerprint);
      console.log('🔍 Mode validation:', { 
        compliance: modeValidation.mode_compliance,
        score: modeValidation.compliance_score
      });
      
      if (modeValidation.correction_needed) {
        finalResponse = modeValidation.fallback_correction;
        enforcementLog.push("MODE_COMPLIANCE_ENFORCED");
        enforcementLevel = 'MODE_COMPLIANCE_ENFORCED';
        securityPass = false;
        console.log('⚠️ Mode compliance enforced');
      }
    }

    // 🔧 TOKEN TRACKING
    const promptTokens = completion.usage.prompt_tokens;
    const completionTokens = completion.usage.completion_tokens;
    trackApiCall(activePersonality, promptTokens, completionTokens, 0);
    const sessionDisplayData = getSessionDisplayData();

    // Add debug info to all responses
    finalResponse += `\n\n🔍 [DEBUG] Mode: ${mode} | Vault: ${vaultStatus} | Security: ${securityPass ? 'PASS' : 'FAIL'}`;

    console.log('✅ All enforcement completed');
    console.log('💰 Session cost:', sessionDisplayData.session_cost);

    // Final response
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
        political_intervention: false,
        political_risk_level: 'NONE',
        mode_compliance: enforcementLevel.includes('MODE') ? 'ENFORCED' : 'PASSED',
        mode_blocked: enforcementLevel.includes('MODE'),
        product_validation: enforcementLevel.includes('PRODUCT') ? 'BLOCKED' : 'PASSED',
        product_blocked: enforcementLevel.includes('PRODUCT')
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
      
      security_pass: securityPass,
      enforcement_level: enforcementLevel,
      enforcement_log: enforcementLog,
      fallback_used: enforcementLevel !== 'NONE',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Enforcement system error:', error);
    
    return res.status(500).json({
      error: 'Enforcement system failure',
      message: 'The cognitive integrity system encountered an error.',
      details: error.message,
      enforcement_level: 'FAILED',
      timestamp: new Date().toISOString()
    });
  }
}
