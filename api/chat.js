import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Import all enforcement modules
import { 
  processTruthGeneral, 
  processBusinessValidation, 
  generateEliResponse, 
  generateRoxyResponse,
  analyzePromptType,
  validateModeCompliance as validatePersonalityCompliance 
} from './lib/personalities.js';

import { 
  trackApiCall, 
  getSessionReport, 
  getLastCallCost, 
  getSessionTotalCost, 
  getResponderTokenBreakdown,
  getVaultTokenLoad 
} from './lib/tokenTracker.js';

import { 
  validateProductRecommendation, 
  enforceRecommendationStandards 
} from './lib/productValidation.js';

import { 
  guardPoliticalContent, 
  analyzePoliticalRisk, 
  generatePoliticalReport 
} from './lib/politicalGuardrails.js';

import { 
  validateModeCompliance, 
  detectModeDrift, 
  generateComplianceReport, 
  enforceModeCompliance 
} from './lib/modeLinter.js';

// Enhanced assumption health monitoring
function checkAssumptionHealth(message, conversationHistory) {
  const warnings = [];
  
  // Critical bias detection patterns
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
      pattern: /(just|simply|easy|quick|only takes)/i,
      warning: "COMPLEXITY BLINDNESS: Implementation is usually 3x harder than expected - what could go wrong?",
      severity: 'MEDIUM'
    },
    {
      pattern: /(viral|exponential|hockey stick|10x growth)/i,
      warning: "GROWTH FANTASY: 99% of products don't achieve viral adoption - what's your realistic growth plan?",
      severity: 'CRITICAL'
    },
    {
      pattern: /(competitors won't|market can't|impossible for them)/i,
      warning: "COMPETITIVE BLINDNESS: Competitors will respond - how will you maintain advantage?",
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
    const commitmentKeywords = ['invest more', 'double down', 'all in', 'spend more'];
    
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

// Vault constraint application
function applyVaultConstraints(message, vaultData, mode) {
  if (!vaultData) return [];
  
  const triggeredFrameworks = [];
  const messageContent = message.toLowerCase();
  
  if (mode === 'business_validation') {
    if (messageContent.includes('pric') || messageContent.includes('cost') || messageContent.includes('charge')) {
      triggeredFrameworks.push({
        framework: 'PRICING_FRAMEWORK',
        constraint: 'Minimum service tier pricing enforced - no below-market positioning',
        vault_rule: 'SMKT-PRICE-001'
      });
    }
    
    if (messageContent.includes('spend') || messageContent.includes('invest') || messageContent.includes('buy')) {
      triggeredFrameworks.push({
        framework: 'FINANCIAL_CONSTRAINTS',
        constraint: 'All expenditures must preserve 6-month runway minimum',
        vault_rule: 'SMKT-CASH-001'
      });
    }
    
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

// Enhanced vault loading
async function loadVaultLogic() {
  try {
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
      operational_standards: ['PREMIUM_POSITIONING', 'COST_EFFICIENCY'],
      version: '1.0.3',
      token_count: 847,
      loaded_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Vault loading failed:', error);
    return null;
  }
}

// Personality routing
function routePersonality(message, mode, conversationHistory) {
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
  
  if (mode === 'business_validation' && analyticalScore >= creativeScore) {
    return 'eli';
  } else if (creativeScore > analyticalScore) {
    return 'roxy';
  } else {
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

    console.log('🔄 Processing with COMPLETE enforcement layer:', { 
      mode, 
      vault_loaded, 
      message_preview: message.substring(0, 50) + '...',
      enforcement_modules: ['tokenTracker', 'productValidation', 'politicalGuardrails', 'modeLinter']
    });

    // ENFORCEMENT LAYER 1: Mode Verification and Logic Loading
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
      default:
        return res.status(400).json({ 
          error: 'Invalid mode specified',
          valid_modes: ['truth_general', 'business_validation'],
          attempted_mode: mode
        });
    }

    // ENFORCEMENT LAYER 2: Assumption Health Monitoring
    const assumptionWarnings = checkAssumptionHealth(message, conversation_history);
    
    // ENFORCEMENT LAYER 3: Vault Logic Integration
    let vaultPrompt = '';
    let vaultStatus = 'NONE';
    let triggeredFrameworks = [];
    let vaultTokenCount = 0;
    
    if (vault_loaded) {
      try {
        const vaultData = await loadVaultLogic();
        if (vaultData) {
          vaultPrompt = vaultData.logic;
          vaultStatus = 'LOADED';
          vaultTokenCount = vaultData.token_count || 0;
          triggeredFrameworks = applyVaultConstraints(message, vaultData, mode);
          modeFingerprint += ' + SM-VAULT-LOADED';
        } else {
          vaultStatus = 'FAILED';
          return res.status(200).json({
            error: 'Vault loading failed',
            message: 'Site Monkeys vault could not be loaded. This may impact business-specific guidance.',
            fallback_mode: mode,
            action_required: 'Try refreshing vault or continue with base mode logic'
          });
        }
      } catch (vaultError) {
        console.error('Critical vault error:', vaultError);
        return res.status(500).json({
          error: 'Vault system failure',
          message: 'Critical error in vault loading system.',
          technical_details: vaultError.message
        });
      }
    }

    // ENFORCEMENT LAYER 4: Personality Routing
    const activePersonality = routePersonality(message, mode, conversation_history);
    let personalityPrompt = '';
    
    if (activePersonality === 'eli') {
      personalityPrompt = generateEliResponse(message, mode);
    } else {
      personalityPrompt = generateRoxyResponse(message, mode);
    }

    // ENFORCEMENT LAYER 5: System Prompt Construction
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

COMPLETE ENFORCEMENT RULES:
- ZERO TOLERANCE for hallucinated data, optimistic assumptions, or false reassurance
- AGGRESSIVE assumption challenging - surface every dangerous bias
- PROACTIVE risk surfacing - don't wait to be asked about downsides
- WARM TRUTH DELIVERY - be caring but uncompromising about reality
- NO AI SELF-REFERENCE - never explain your role or programming
- SURVIVAL-FIRST LOGIC for business decisions
- EVIDENCE-BASED RECOMMENDATIONS with risk assessment
- POLITICAL NEUTRALITY maintained at all times

Your response must be exactly what a smart, caring, brutally honest best friend would say.
Include mode fingerprint: [${modeFingerprint}] - [CONFIDENCE: X%] - [SURVIVAL_IMPACT: LEVEL]`;

    console.log('🚀 Generating response with COMPLETE enforcement:', { 
      mode, 
      personality: activePersonality, 
      vault_constraints: triggeredFrameworks.length,
      assumption_alerts: assumptionWarnings.length 
    });

    // ENFORCEMENT LAYER 6: AI Response Generation
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

    // ENFORCEMENT LAYER 7: Token Tracking
    const tokenTracking = trackApiCall(
      activePersonality, 
      completion.usage.prompt_tokens, 
      completion.usage.completion_tokens, 
      vaultTokenCount
    );

    // ENFORCEMENT LAYER 8: Political Guardrails
    const politicalGuard = guardPoliticalContent(response, message);
    if (politicalGuard.political_intervention) {
      response = politicalGuard.guarded_response;
    }

    // ENFORCEMENT LAYER 9: Product Recommendation Validation
    const productValidation = validateProductRecommendation(response, mode, triggeredFrameworks);
    const recommendationEnforcement = enforceRecommendationStandards(response, productValidation);
    if (recommendationEnforcement.original_blocked) {
      response = recommendationEnforcement.enforcement_response;
    }

    // ENFORCEMENT LAYER 10: Mode Compliance Linting
    const modeCompliance = validateModeCompliance(response, mode, modeFingerprint);
    const complianceEnforcement = enforceModeCompliance(response, modeCompliance);
    if (complianceEnforcement.original_blocked) {
      response = complianceEnforcement.enforcement_response;
    }

    // ENFORCEMENT LAYER 11: Critical Assumption Warnings
    const criticalWarnings = assumptionWarnings.filter(w => w.severity === 'CRITICAL');
    if (criticalWarnings.length > 0) {
      response += `\n\n🚨 CRITICAL ASSUMPTION ALERTS:`;
      criticalWarnings.forEach(warning => {
        response += `\n- ${warning.warning}`;
      });
    }

    // ENFORCEMENT LAYER 12: Final Validation and Reporting
    const sessionReport = getSessionReport();
    const complianceReport = generateComplianceReport(modeCompliance, mode);
    const politicalReport = generatePoliticalReport(politicalGuard.analysis);

    console.log('✅ COMPLETE enforcement processing completed:', {
      compliance_score: modeCompliance.compliance_score,
      political_intervention: politicalGuard.political_intervention,
      product_validation: productValidation.validation_passed,
      token_cost: tokenTracking.call_cost,
      enforcement_layers: 12
    });

    // FINAL RESPONSE CONSTRUCTION
    return res.status(200).json({
      response: response,
      
      // Core system status
      mode_active: mode,
      active_personality: activePersonality,
      mode_fingerprint: modeFingerprint,
      vault_loaded: vault_loaded,
      vault_status: vaultStatus,
      triggered_frameworks: triggeredFrameworks,
      detail_level: detail_level,
      
      // Enforcement layer results
      assumption_warnings: assumptionWarnings,
      mode_compliance: complianceReport,
      political_guardrails: politicalReport,
      product_validation: {
        validation_passed: productValidation.validation_passed,
        evidence_strength: productValidation.evidence_strength,
        enforcement_applied: recommendationEnforcement.original_blocked
      },
      
      // Token and cost tracking
      token_tracking: {
        call_cost: `${tokenTracking.call_cost.toFixed(4)}`,
        session_total: `${tokenTracking.session_total.toFixed(4)}`,
        tokens_used: tokenTracking.tokens_used,
        cumulative_tokens: tokenTracking.cumulative_tokens,
        vault_tokens: vaultTokenCount
      },
      
      // Session management
      session_report: {
        responder_breakdown: getResponderTokenBreakdown(),
        last_call_cost: `${getLastCallCost().toFixed(4)}`,
        session_total_cost: `${getSessionTotalCost().toFixed(4)}`,
        vault_token_load: getVaultTokenLoad()
      },
      
      // System integrity
      security_pass: modeCompliance.mode_compliance !== 'NON_COMPLIANT' && 
                    !politicalGuard.political_intervention && 
                    productValidation.validation_passed,
      enforcement_level: 'COMPLETE',
      enforcement_layers_applied: 12,
      fallback_used: complianceEnforcement.original_blocked || 
                     recommendationEnforcement.original_blocked,
      
      // Debug information
      debug_info: {
        fingerprint_valid: modeCompliance.fingerprint_valid,
        drift_detected: modeCompliance.drift_detected,
        political_risk_level: politicalGuard.analysis.political_risk_level,
        evidence_strength: productValidation.evidence_strength,
        compliance_percentage: modeCompliance.compliance_score
      },
      
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ COMPLETE Enforcement System Error:', error);
    
    // Enhanced error response with enforcement context
    return res.status(500).json({ 
      error: 'Complete cognitive integrity system failure',
      message: 'The full enforcement layer encountered a critical error.',
      technical_details: error.message,
      system_status: 'CRITICAL_FAILURE',
      enforcement_layers_failed: 'Unable to determine',
      fallback_available: false,
      immediate_action: 'Complete system requires immediate attention',
      mode_attempted: req.body.mode || 'unknown',
      vault_attempted: req.body.vault_loaded || false,
      session_preservation: 'Session data may be lost',
      timestamp: new Date().toISOString(),
      error_code: 'COMPLETE_ENFORCEMENT_FAILURE'
    });
  }
}
