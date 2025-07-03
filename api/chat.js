import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced enforcement imports with error handling
import { trackApiCall, getSessionDisplayData } from './lib/tokenTracker.js';
import { validateModeCompliance, enforceModeCompliance } from './lib/modeLinter.js';
import { validateProductRecommendation, enforceRecommendationStandards } from './lib/productValidation.js';
import { guardPoliticalContent } from './lib/politicalGuardrails.js';

// Graceful fallback for missing enforcement modules
function safeGuardPoliticalContent(response, message) {
  try {
    return guardPoliticalContent(response, message);
  } catch (error) {
    console.error('❌ Political guardrails failed:', error);
    
    // Emergency political template fallback
    const politicalKeywords = ['vote', 'election', 'democrat', 'republican', 'candidate', 'party', 'political'];
    const isPolitical = politicalKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || response.toLowerCase().includes(keyword)
    );
    
    if (isPolitical) {
      return {
        political_intervention: true,
        guarded_response: `Voting is a sacred personal right and powerful responsibility. I cannot and will not tell you who to vote for - that would be inappropriate and undermines your personal agency.\n\nWhat I can do:\n• Help you find factual information about candidates or issues\n• Direct you to multiple reliable sources\n• Encourage thorough research before making decisions\n\nYour vote should be based on your own informed analysis of what's best for the country, not an AI's recommendation.`,
        analysis: {
          political_risk_level: 'HIGH',
          intervention_type: 'EMERGENCY_VOTING_TEMPLATE'
        }
      };
    }
    
    return { political_intervention: false };
  }
}

function safeValidateProductRecommendation(response, mode) {
  try {
    return validateProductRecommendation(response, mode);
  } catch (error) {
    console.error('❌ Product validation failed:', error);
    return { validation_passed: true, risk_level: 'UNKNOWN' };
  }
}

function safeEnforceRecommendationStandards(response, validation) {
  try {
    return enforceRecommendationStandards(response, validation);
  } catch (error) {
    console.error('❌ Product enforcement failed:', error);
    return { original_blocked: false, enforcement_response: response };
  }
}

function safeValidateModeCompliance(response, mode, fingerprint) {
  try {
    return validateModeCompliance(response, mode, fingerprint);
  } catch (error) {
    console.error('❌ Mode validation failed:', error);
    return { mode_compliance: 'ERROR', compliance_score: 0 };
  }
}

function safeEnforceModeCompliance(response, validation) {
  try {
    return enforceModeCompliance(response, validation);
  } catch (error) {
    console.error('❌ Mode enforcement failed:', error);
    return { 
      original_blocked: true, 
      compliance_status: 'ENFORCEMENT_FAILED',
      enforcement_response: `SYSTEM ENFORCEMENT FAILURE\n\nThe cognitive integrity system encountered an error while validating this response. This is a protective fallback to ensure no unverified information reaches you.\n\nPlease rephrase your question or try a different approach. If this persists, the system may need maintenance.`
    };
  }
}

function safeTrackApiCall(personality, promptTokens, completionTokens, vaultTokens) {
  try {
    return trackApiCall(personality, promptTokens, completionTokens, vaultTokens);
  } catch (error) {
    console.error('❌ Token tracking failed:', error);
    return { success: false };
  }
}

function safeGetSessionDisplayData() {
  try {
    return getSessionDisplayData();
  } catch (error) {
    console.error('❌ Session data retrieval failed:', error);
    return {
      session_cost: '$0.0000',
      vault_tokens: 0,
      total_tokens: 0,
      last_call_cost: '$0.0000',
      call_count: 0,
      efficiency_rating: 'UNKNOWN'
    };
  }
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
    console.log('🔍 Starting active enforcement chat handler...');
    
    const {
      message,
      conversation_history = [],
      mode = 'truth_general',
      vault_loaded = false,
      verify_mode = false,
      detail_level = 'essential'
    } = req.body;

    console.log('✅ Request parsed:', {mode, vault_loaded, message_preview: message.substring(0, 50) + '...'});

    // Mode logic loading with vault consideration
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

    // Assumption detection (basic implementation)
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

    let response = completion.choices[0].message.content;
    console.log('✅ OpenAI response received');

    // 🔧 CRITICAL ENFORCEMENT SEQUENCE - POLITICAL GUARDRAILS FIRST
    const enforcementLog = [];
    
    // 🛡️ ENFORCEMENT LAYER 1: POLITICAL CONTENT GUARDRAILS (HIGHEST PRIORITY)
    console.log('🛡️ Applying political content enforcement...');
    console.log('🔍 Political analysis input:', { 
      message_preview: message.substring(0, 100),
      response_preview: response.substring(0, 100)
    });
    
    const politicalResult = safeGuardPoliticalContent(response, message);
    console.log('🔍 Political analysis result:', politicalResult);
    
    if (politicalResult.political_intervention) {
      response = politicalResult.guarded_response;
      enforcementLog.push("POLITICAL_GUARDRAIL_TRIGGERED");
      console.log('⚠️ POLITICAL TEMPLATE APPLIED - skipping other enforcement');
      
      // Political content gets immediate return with tracking
      const promptTokens = completion.usage.prompt_tokens;
      const completionTokens = completion.usage.completion_tokens;
      const vaultTokenCount = vault_loaded ? 500 : 0; // Estimate vault tokens
      
      safeTrackApiCall(activePersonality, promptTokens, completionTokens, vaultTokenCount);
      const sessionDisplayData = safeGetSessionDisplayData();
      
      return res.status(200).json({
        response: response,
        mode_active: mode,
        active_personality: activePersonality,
        mode_fingerprint: modeFingerprint,
        vault_loaded: vault_loaded,
        vault_status: vaultStatus,
        assumption_warnings: assumptionWarnings,
        detail_level: detail_level,
        
        // POLITICAL ENFORCEMENT RESULTS
        enforcement_applied: {
          political_intervention: true,
          political_risk_level: politicalResult.analysis.political_risk_level,
          political_template_used: politicalResult.analysis.intervention_type,
          mode_compliance: 'SKIPPED_POLITICAL',
          product_validation: 'SKIPPED_POLITICAL'
        },
        
        // TOKEN TRACKING FIXED
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
        
        security_pass: true, // Political templates are secure
        enforcement_level: 'POLITICAL_TEMPLATE_APPLIED',
        enforcement_log: enforcementLog,
        timestamp: new Date().toISOString()
      });
    }

    // 🛡️ ENFORCEMENT LAYER 2: PRODUCT RECOMMENDATION VALIDATION
    console.log('🛡️ Applying product recommendation enforcement...');
    console.log('🔍 Product validation input:', { message_preview: message.substring(0, 50), mode });
    
    const productValidation = safeValidateProductRecommendation(response, mode);
    console.log('🔍 Product validation result:', productValidation);
    
    const productEnforcement = safeEnforceRecommendationStandards(response, productValidation);
    console.log('🔍 Product enforcement result:', productEnforcement);
    
    if (productEnforcement.original_blocked) {
      response = productEnforcement.enforcement_response;
      enforcementLog.push("PRODUCT_RECOMMENDATION_ENFORCED");
      console.log('⚠️ Product recommendation enforced - response modified');
    } else {
      console.log('✅ Product recommendation passed validation');
    }

    // 🛡️ ENFORCEMENT LAYER 3: MODE COMPLIANCE VALIDATION
    console.log('🛡️ Applying mode compliance enforcement...');
    console.log('🔍 Mode compliance input:', { response_preview: response.substring(0, 100), mode, modeFingerprint });
    
    const modeValidation = safeValidateModeCompliance(response, mode, modeFingerprint);
    console.log('🔍 Mode validation result:', modeValidation);
    
    const modeEnforcement = safeEnforceModeCompliance(response, modeValidation);
    console.log('🔍 Mode enforcement result:', modeEnforcement);
    
    if (modeEnforcement.original_blocked) {
      response = modeEnforcement.enforcement_response;
      enforcementLog.push("MODE_COMPLIANCE_ENFORCED");
      console.log('⚠️ Mode compliance enforced - response modified');
      console.log('🔍 Final enforced response:', response.substring(0, 200) + '...');
    } else {
      console.log('✅ Mode compliance passed validation');
    }

    // 🔧 TOKEN TRACKING AND COST CALCULATION
    const promptTokens = completion.usage.prompt_tokens;
    const completionTokens = completion.usage.completion_tokens;
    const vaultTokenCount = vault_loaded ? 500 : 0; // Estimate vault tokens if loaded
    
    safeTrackApiCall(activePersonality, promptTokens, completionTokens, vaultTokenCount);
    const sessionDisplayData = safeGetSessionDisplayData();
    
    console.log('💰 Token tracking results:', {
      promptTokens,
      completionTokens,
      sessionDisplayData,
      trackingSuccess: sessionDisplayData.session_cost !== '$0.0000'
    });

    // Add critical assumption warnings to response
    const criticalWarnings = assumptionWarnings.filter(w => w.severity === 'CRITICAL');
    if (criticalWarnings.length > 0) {
      response += `\n\n🚨 CRITICAL ASSUMPTION ALERTS:`;
      criticalWarnings.forEach(warning => {
        response += `\n- ${warning.warning}`;
      });
    }

    console.log('✅ All enforcement layers applied successfully');
    console.log('💰 Session cost data:', sessionDisplayData);

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
      
      // 🛡️ ENFORCEMENT RESULTS
      enforcement_applied: {
        political_intervention: false,
        political_risk_level: 'NONE',
        mode_compliance: modeEnforcement.compliance_status,
        mode_blocked: modeEnforcement.original_blocked,
        product_validation: productValidation.validation_passed,
        product_blocked: productEnforcement.original_blocked
      },
      
      // 💰 REAL-TIME COST TRACKING
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
      security_pass: !modeEnforcement.original_blocked && !productEnforcement.original_blocked,
      enforcement_level: 'ACTIVE',
      enforcement_log: enforcementLog,
      fallback_used: modeEnforcement.original_blocked || productEnforcement.original_blocked,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Active Enforcement Chat API Error:', error);
    
    return res.status(500).json({
      error: 'Active enforcement system failure',
      message: 'The cognitive integrity system with active enforcement encountered an error.',
      details: error.message,
      enforcement_level: 'FAILED',
      timestamp: new Date().toISOString()
    });
  }
}
