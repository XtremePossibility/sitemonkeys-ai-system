// UNIVERSAL EXPERT COGNITIVE ARCHITECTURE - SITE MONKEYS CHAT.JS
// Complete Professional Intelligence + Genuine Caring + Truth-First Delivery
// Preserves ALL existing functionality while adding universal expert intelligence

import { trackApiCall, formatSessionDataForUI } from './lib/tokenTracker.js';
import { EMERGENCY_FALLBACKS, validateVaultStructure, getVaultValue } from './lib/site-monkeys/emergency-fallbacks.js';
import { ENFORCEMENT_PROTOCOLS } from './lib/site-monkeys/enforcement-protocols.js';
import { QUALITY_ENFORCEMENT } from './lib/site-monkeys/quality-enforcement.js';
import { AI_ARCHITECTURE } from './lib/site-monkeys/ai-architecture.js';
import { FOUNDER_PROTECTION } from './lib/site-monkeys/founder-protection.js';
import zlib from 'zlib';

// UNIVERSAL EXPERT INTELLIGENCE GLOBALS
let lastPersonality = 'roxy';
let conversationCount = 0;
let expertiseMemory = {
  recognizedDomains: [],
  userExpertiseLevel: 'intermediate',
  professionalContext: 'general',
  trustLevel: 1.0,
  lastDomainAnalysis: null
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let vaultContent = '';
  let vaultTokens = 0;
  let vaultStatus = 'not_loaded';
  let vaultHealthy = false;

  try {
    const {
      message,
      conversation_history = [],
      mode = 'site_monkeys',
      claude_requested = false,
      vault_content = null
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string' });
      return;
    }

    console.log('Processing universal expert request in ' + mode + ' mode:', message.substring(0, 100));

    // UNIVERSAL EXPERT DOMAIN ANALYSIS
    const domainAnalysis = performUniversalDomainAnalysis(message, conversation_history);
    const professionalContext = identifyProfessionalField(message, domainAnalysis);
    const quantitativeNeeds = detectQuantitativeAnalysis(message);
    
    // Update expertise memory
    updateExpertiseMemory(domainAnalysis, professionalContext);

    // VAULT LOADING (PRESERVED EXACTLY)
    if (mode === 'site_monkeys') {
      if (vault_content && vault_content.length > 1000) {
        vaultContent = vault_content;
        vaultTokens = Math.ceil(vaultContent.length / 4);
        vaultStatus = 'loaded_from_frontend';
        vaultHealthy = validateVaultStructure(vaultContent);
        console.log('Vault loaded from frontend:', vaultTokens + ' tokens, healthy:', vaultHealthy);
      } else {
        try {
          const kv_url = process.env.KV_REST_API_URL;
          const kv_token = process.env.KV_REST_API_TOKEN;

          if (!kv_url || !kv_token) {
            throw new Error('KV environment variables not configured');
          }

          const kvResponse = await fetch(kv_url + '/get/sitemonkeys_vault_v2', {
            headers: {
              'Authorization': 'Bearer ' + kv_token,
              'Content-Type': 'application/json'
            }
          });

          if (kvResponse.ok) {
            const kvText = await kvResponse.text();

            if (kvText && kvText !== 'null' && kvText.trim() !== '') {
              let kvData;
              const kvWrapper = JSON.parse(kvText);

              if (kvWrapper.result) {
                kvData = JSON.parse(kvWrapper.result);
              } else if (kvWrapper.compressed) {
                try {
                  const compressedBuffer = Buffer.from(kvWrapper.data, 'base64');
                  const decompressed = zlib.gunzipSync(compressedBuffer).toString('utf-8');
                  kvData = JSON.parse(decompressed);
                } catch (decompError) {
                  console.error('Gzip decompression failed:', decompError.message);
                  kvData = kvWrapper;
                }
              } else {
                kvData = kvWrapper;
              }

              if (kvData.vault_content && kvData.vault_content.length > 1000) {
                vaultContent = kvData.vault_content;
                vaultTokens = kvData.tokens || Math.ceil(vaultContent.length / 4);
                vaultStatus = 'loaded_from_kv';
                vaultHealthy = validateVaultStructure(vaultContent);
                console.log('Vault loaded from KV: ' + vaultTokens + ' tokens, healthy:', vaultHealthy);
              } else {
                throw new Error('Vault content missing or insufficient');
              }
            } else {
              throw new Error('KV returned empty data');
            }
          } else {
            throw new Error('KV API error: ' + kvResponse.status);
          }

        } catch (vaultError) {
          console.error('Vault loading failed, using emergency fallbacks:', vaultError.message);
          vaultStatus = 'failed_using_fallbacks';
          vaultContent = EMERGENCY_FALLBACKS.business_logic.pricing_structure +
                        EMERGENCY_FALLBACKS.business_logic.service_minimums +
                        EMERGENCY_FALLBACKS.enforcement.founder_protection;
          vaultTokens = Math.ceil(vaultContent.length / 4);
          vaultHealthy = false;
        }
      }
    }

    // UNIVERSAL EXPERT PERSONALITY SELECTION
    let personality = claude_requested ? 'claude' : determineExpertPersonality(message, mode, professionalContext, quantitativeNeeds);
    conversationCount++;

    // COST PROTECTION
    if (claude_requested) {
      const estimatedTokens = Math.ceil((buildUniversalExpertPrompt(mode, personality, vaultContent, vaultHealthy, domainAnalysis, professionalContext, quantitativeNeeds).length + message.length) / 4) + 800;
      const estimatedCost = (estimatedTokens * 0.015) / 1000;

      if (estimatedCost > 0.50) {
        return res.status(200).json({
          response: generateExpertCostMessage(estimatedCost, professionalContext),
          mode_active: mode,
          vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
          claude_blocked: true
        });
      }
    }

    // UNIVERSAL EXPERT SYSTEM PROMPT
    const systemPrompt = buildUniversalExpertPrompt(mode, personality, vaultContent, vaultHealthy, domainAnalysis, professionalContext, quantitativeNeeds);
    const fullPrompt = buildExpertPrompt(systemPrompt, message, conversation_history, professionalContext, quantitativeNeeds);
    
    // ENHANCED API CALL
    const apiResponse = await makeExpertAPICall(fullPrompt, personality);

    let promptTokens, completionTokens;

    if (personality === 'claude') {
      promptTokens = apiResponse.usage?.input_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.output_tokens || Math.ceil(apiResponse.response.length / 4);
    } else {
      promptTokens = apiResponse.usage?.prompt_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);
    }

    const trackingResult = trackApiCall(personality, promptTokens, completionTokens, vaultTokens);
    
    // EXPERT RESPONSE ENHANCEMENT
    const expertResponse = applyUniversalExpertEnhancement(apiResponse.response, domainAnalysis, professionalContext, quantitativeNeeds, personality, message, mode, vaultContent);
    const finalResponse = applyExpertEnforcement(expertResponse, mode, vaultContent, vaultStatus, vaultHealthy, professionalContext);
    const sessionData = formatSessionDataForUI();

    // Update tracking
    lastPersonality = personality;
    expertiseMemory.trustLevel = Math.min(expertiseMemory.trustLevel + 0.1, 5.0);
    expertiseMemory.lastDomainAnalysis = domainAnalysis;

    res.status(200).json({
      response: finalResponse,
      mode_active: mode,
      personality_active: personality,
      expert_intelligence: {
        professional_field: professionalContext,
        domain_confidence: domainAnalysis.confidence,
        trust_level: expertiseMemory.trustLevel
      },
      vault_status: {
        loaded: vaultStatus !== 'not_loaded',
        tokens: vaultTokens,
        status: vaultStatus,
        healthy: vaultHealthy,
        source: vaultStatus.includes('frontend') ? 'frontend' : vaultStatus.includes('kv') ? 'kv' : 'fallback'
      },
      enforcement_applied: [
        'universal_expert_intelligence_active',
        'professional_field_analysis_applied',
        'truth_first_enforcement_active',
        vaultHealthy ? 'vault_business_logic' : 'emergency_fallback_mode'
      ],
      performance: {
        tokens_used: trackingResult.tokens_used,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        call_cost: trackingResult.call_cost,
        session_total: trackingResult.session_total,
        vault_tokens: vaultTokens,
        api_provider: personality === 'claude' ? 'anthropic' : 'openai'
      },
      session_tracking: sessionData
    });

  } catch (error) {
    console.error('Universal expert processing error:', error);

    res.status(500).json({
      response: 'I encountered a technical issue while processing your request. The core system logic remains intact. Please try rephrasing your question or breaking it into smaller parts.',
      mode_active: req.body.mode || 'site_monkeys',
      vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
      enforcement_applied: ['emergency_fallback_active', 'truth_enforcement_active'],
      error: 'Expert processing failed - emergency protocols active'
    });
  }
}

// UNIVERSAL DOMAIN ANALYSIS ENGINE
function performUniversalDomainAnalysis(message, conversationHistory) {
  const analysis = {
    primary_domain: 'general',
    secondary_domains: [],
    complexity_level: 'moderate',
    confidence: 0.8,
    professional_thinking_needed: true,
    quantitative_elements: detectQuantitativeElements(message),
    strategic_elements: detectStrategicElements(message),
    technical_elements: detectTechnicalElements(message)
  };

  analysis.primary_domain = identifyPrimaryDomain(message);
  analysis.secondary_domains = identifySecondaryDomains(message);
  analysis.complexity_level = assessComplexityLevel(message, analysis);
  analysis.confidence = calculateDomainConfidence(message, analysis);

  return analysis;
}

function identifyPrimaryDomain(message) {
  const domainPatterns = {
    'financial_analysis': [
      'budget', 'projection', 'revenue', 'profit', 'cost', 'financial', 'investment', 'ROI', 'margin', 'cash flow',
      'pricing', 'valuation', 'economics', 'accounting', 'expenses', 'income'
    ],
    'business_strategy': [
      'strategy', 'market', 'competition', 'growth', 'scaling', 'business model', 'operations', 'planning',
      'expansion', 'partnerships', 'acquisition', 'competitive advantage'
    ],
    'medical_health': [
      'health', 'medical', 'doctor', 'symptoms', 'diagnosis', 'treatment', 'medicine', 'healthcare',
      'patient', 'clinical', 'therapeutic', 'pharmaceutical'
    ],
    'legal_compliance': [
      'legal', 'law', 'contract', 'compliance', 'regulation', 'agreement', 'liability', 'terms',
      'litigation', 'attorney', 'court', 'rights'
    ],
    'technical_engineering': [
      'code', 'programming', 'software', 'system', 'API', 'database', 'technical', 'development',
      'architecture', 'engineering', 'algorithm', 'infrastructure'
    ],
    'marketing_sales': [
      'marketing', 'advertising', 'branding', 'customers', 'sales', 'campaigns', 'promotion',
      'audience', 'lead generation', 'conversion', 'funnel'
    ],
    'creative_design': [
      'design', 'creative', 'art', 'visual', 'brand', 'content', 'writing', 'copy', 'graphics',
      'user experience', 'interface', 'aesthetic'
    ]
  };

  const lowerMessage = message.toLowerCase();
  let maxScore = 0;
  let primaryDomain = 'general_consulting';

  for (const [domain, keywords] of Object.entries(domainPatterns)) {
    const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
    const score = matches.length;
    
    if (score > maxScore) {
      maxScore = score;
      primaryDomain = domain;
    }
  }

  return primaryDomain;
}

function identifySecondaryDomains(message) {
  const lowerMessage = message.toLowerCase();
  const secondaryDomains = [];
  
  if (lowerMessage.includes('budget') && !lowerMessage.includes('financial')) {
    secondaryDomains.push('financial_analysis');
  }
  if (lowerMessage.includes('strategy') && !lowerMessage.includes('business')) {
    secondaryDomains.push('business_strategy');
  }
  
  return secondaryDomains.slice(0, 2);
}

function detectQuantitativeElements(message) {
  const quantitativeIndicators = [
    'calculate', 'projection', 'forecast', 'estimate', 'analyze', 'measure', 'percentage',
    'ratio', 'rate', 'cost', 'price', 'value', 'number', 'amount', 'total'
  ];
  
  const numberPattern = /\$[\d,]+|\d+%|\d+\.?\d*/;
  const hasNumbers = numberPattern.test(message);
  const hasQuantitativeLanguage = quantitativeIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  );
  
  return hasNumbers || hasQuantitativeLanguage;
}

function detectStrategicElements(message) {
  const strategicIndicators = [
    'plan', 'strategy', 'approach', 'framework', 'methodology', 'process', 'system'
  ];
  
  return strategicIndicators.some(indicator => message.toLowerCase().includes(indicator));
}

function detectTechnicalElements(message) {
  const technicalIndicators = [
    'system', 'platform', 'tool', 'software', 'application', 'integration', 'API'
  ];
  
  return technicalIndicators.some(indicator => message.toLowerCase().includes(indicator));
}

function identifyProfessionalField(message, domainAnalysis) {
  const fieldMapping = {
    'financial_analysis': 'Chief Financial Officer',
    'business_strategy': 'Strategic Business Consultant', 
    'medical_health': 'Senior Physician',
    'legal_compliance': 'Senior Legal Counsel',
    'technical_engineering': 'Chief Technology Officer',
    'marketing_sales': 'Chief Marketing Officer',
    'creative_design': 'Creative Director',
    'general_consulting': 'Strategic Business Advisor'
  };
  
  return fieldMapping[domainAnalysis.primary_domain] || 'Strategic Business Advisor';
}

function assessComplexityLevel(message, analysis) {
  let complexityScore = 0;
  
  if (message.length > 400) complexityScore += 2;
  else if (message.length > 200) complexityScore += 1;
  
  const questionCount = (message.match(/\?/g) || []).length;
  complexityScore += Math.min(questionCount, 3);
  
  if (analysis.secondary_domains.length > 0) complexityScore += 2;
  if (analysis.quantitative_elements) complexityScore += 2;
  if (analysis.strategic_elements) complexityScore += 1;
  
  if (complexityScore >= 8) return 'expert';
  if (complexityScore >= 5) return 'advanced';
  if (complexityScore >= 3) return 'moderate';
  return 'basic';
}

function calculateDomainConfidence(message, analysis) {
  let confidence = 0.5;
  
  const domainIndicators = identifyPrimaryDomain(message);
  if (domainIndicators !== 'general_consulting') confidence += 0.3;
  
  if (analysis.quantitative_elements) confidence += 0.1;
  if (analysis.strategic_elements) confidence += 0.1;
  if (message.length > 100) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

function detectQuantitativeAnalysis(message) {
  return {
    financial_modeling: detectFinancialModeling(message),
    numerical_calculations: detectNumericalCalculations(message),
    projection_requirements: detectProjectionRequirements(message)
  };
}

function detectFinancialModeling(message) {
  const financialModelingKeywords = [
    'projection', 'forecast', 'budget', 'revenue', 'profit', 'cost analysis',
    'cash flow', 'break-even', 'ROI', 'margin'
  ];
  
  return financialModelingKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

function detectNumericalCalculations(message) {
  const calculationKeywords = [
    'calculate', 'compute', 'total', 'sum', 'average', 'percentage'
  ];
  
  const hasNumbers = /\d+/.test(message);
  const hasCalculationLanguage = calculationKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
  
  return hasNumbers || hasCalculationLanguage;
}

function detectProjectionRequirements(message) {
  const projectionKeywords = [
    'project', 'forecast', 'predict', 'estimate', 'expect', 'anticipate'
  ];
  
  return projectionKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

function determineExpertPersonality(message, mode, professionalContext, quantitativeNeeds) {
  if (quantitativeNeeds.financial_modeling || quantitativeNeeds.numerical_calculations) {
    return 'eli';
  }
  
  if (professionalContext.includes('Strategic') || professionalContext.includes('Marketing') || professionalContext.includes('Creative')) {
    return 'roxy';
  }
  
  if (professionalContext.includes('Technology') || professionalContext.includes('Data')) {
    return 'eli';
  }
  
  return lastPersonality === 'eli' ? 'roxy' : 'eli';
}

function buildUniversalExpertPrompt(mode, personality, vaultContent, vaultHealthy, domainAnalysis, professionalContext, quantitativeNeeds) {
  let systemPrompt = '';

  systemPrompt += `You are a world-class ${professionalContext} with 20+ years of extraordinary professional success. You are considered one of the very best in your field because you consistently:

UNIVERSAL EXPERT CHARACTERISTICS:
- See what others don't see and think about what others don't think about
- Understand true goals and needs, not just surface questions
- Never get caught off guard by complexity or edge cases
- Combine deep expertise with genuine care for success
- Deliver truth-first analysis with professional warmth

YOUR EXPERT IDENTITY: ${professionalContext}
- Think like the most respected professional in this field
- Apply 20 years of real-world experience and proven success
- Use professional-grade frameworks and methodologies
- Maintain the analytical rigor expected at the highest levels

`;

  if (domainAnalysis.primary_domain === 'financial_analysis') {
    systemPrompt += `FINANCIAL EXPERT REASONING FRAMEWORK:
As a Chief Financial Officer, you excel at:
- Real financial modeling using actual data and pricing structures
- Multi-step quantitative analysis with step-by-step calculations
- Risk assessment and scenario planning (best/worst/realistic cases)
- Cash flow projections and runway analysis
- Professional-grade financial conclusions with confidence levels

CALCULATION REQUIREMENTS:
- Use real numbers from available data (Site Monkeys pricing: $697 Boost, $1,497 Climb, $2,997 Lead)
- Show step-by-step calculations clearly
- Provide scenario analysis with assumptions stated
- Include confidence levels on all numerical conclusions

`;
  }

  if (quantitativeNeeds.financial_modeling || quantitativeNeeds.numerical_calculations) {
    systemPrompt += `QUANTITATIVE ANALYSIS REQUIREMENTS:
This request requires professional-grade numerical analysis:

CALCULATION PROTOCOLS:
- Perform real calculations using available data
- Show methodology and assumptions clearly
- Provide confidence intervals and sensitivity analysis
- Consider multiple scenarios (optimistic/realistic/pessimistic)

`;

    if (mode === 'site_monkeys' && vaultHealthy) {
      systemPrompt += `VAULT DATA INTEGRATION:
- Site Monkeys Pricing Structure: Boost $697/month, Climb $1,497/month, Lead $2,997/month
- Operational costs target: <$3,000/month for 87%+ margins
- Customer onboarding fees: $199 Boost, $299 Climb, $499 Lead
- Use this data operationally in calculations

`;
    }
  }

  if (personality === 'eli') {
    systemPrompt += `You are Eli, the analytical expert. Your professional approach:

ELI'S EXPERT ANALYTICAL EXCELLENCE:
- "Let me break down the numbers and walk you through the analysis..."
- Confidence scoring on all factual claims (High 90%+, Medium 70-89%, Low <70%)
- Evidence-based reasoning with clear methodology
- Risk assessment and truth validation

ELI'S CARING PROFESSIONAL DIRECTNESS:
- "I care too much about your success to provide anything less than rigorous analysis"
- "Here's what the data actually shows, and here's my confidence level..."
- Always explain professional reasoning and confidence levels

`;
  } else if (personality === 'roxy') {
    systemPrompt += `You are Roxy, the strategic expert. Your professional approach:

ROXY'S EXPERT SOLUTION-ORIENTED EXCELLENCE:
- "That approach has challenges, but here's how a professional would achieve your goals..."
- Strategic problem-solving with practical alternatives
- Professional creativity combined with proven methodologies
- Optimization and efficiency improvements based on best practices

ROXY'S CARING EXPERT CREATIVITY:
- "I see what you're trying to achieve, and I love the vision. From a professional perspective..."
- "I'm seeing three different approaches that successful professionals use for this..."
- Always offer professional alternatives when pointing out problems

`;
  }

  systemPrompt += `PROFESSIONAL TRUTH-FIRST REQUIREMENTS:
All expert analysis must include:

CONFIDENCE SCORING ON PROFESSIONAL CONCLUSIONS:
- "CONFIDENCE: High (95%) - based on established professional methodologies and verified data"
- "CONFIDENCE: Medium (75%) - based on professional experience and industry standards"
- "CONFIDENCE: Low (40%) - significant uncertainty exists, recommend additional research"

CARING PROFESSIONAL TRUTH DELIVERY:
- "I care too much about your success to give you analysis that isn't rigorous"
- "You deserve professional-grade guidance, even when it's not what you hoped to hear"

`;

  if (mode === 'site_monkeys') {
    if (vaultContent && vaultContent.length > 1000 && vaultHealthy) {
      systemPrompt += 'SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n' + vaultContent + '\n\n';
      systemPrompt += 'EXPERT VAULT INTEGRATION: Apply this business intelligence data as a professional consultant.\n\n';
    } else {
      systemPrompt += 'EMERGENCY PROFESSIONAL FALLBACK MODE: Using core business logic due to vault issues.\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.pricing_structure + '\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.service_minimums + '\n\n';
    }

    systemPrompt += FOUNDER_PROTECTION.pricing.minimum_enforcement + '\n\n';
  }

  return systemPrompt;
}

function buildExpertPrompt(systemPrompt, message, conversationHistory, professionalContext, quantitativeNeeds) {
  let fullPrompt = systemPrompt;

  if (conversationHistory.length > 0) {
    fullPrompt += 'PROFESSIONAL CONVERSATION CONTEXT:\n';
    conversationHistory.slice(-3).forEach(msg => {
      fullPrompt += (msg.role === 'user' ? 'Client: ' : 'Professional: ') + msg.content + '\n';
    });
    fullPrompt += '\n';
  }

  if (quantitativeNeeds.financial_modeling) {
    fullPrompt += `PROFESSIONAL CONTEXT: This appears to be a financial analysis request requiring ${professionalContext} expertise. Apply professional-grade financial modeling with real calculations.\n\n`;
  }

  fullPrompt += `CURRENT PROFESSIONAL REQUEST:\nClient: ${message}\n\n`;
  fullPrompt += `Respond as a ${professionalContext} with professional excellence, truth-first analysis, and caring guidance:`;

  return fullPrompt;
}

async function makeExpertAPICall(prompt, personality) {
  const maxTokens = 1200;

  if (personality === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('Claude API key missing, failing over to GPT-4');
      return await makeExpertAPICall(prompt, 'roxy');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
          'x-api-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('Claude API failed, failing over to GPT-4');
        return await makeExpertAPICall(prompt, 'roxy');
      }

      let responseText = '';
      if (data.content && Array.isArray(data.content) && data.content[0] && data.content[0].text) {
        responseText = data.content[0].text;
      } else if (data.content && typeof data.content === 'string') {
        responseText = data.content;
      } else {
        responseText = 'Claude API response parsing failed';
      }

      return {
        response: responseText,
        usage: data.usage || {}
      };
    } catch (claudeError) {
      console.warn('Claude request failed, failing over to GPT-4:', claudeError.message);
      return await makeExpertAPICall(prompt, 'roxy');
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured - no fallback available');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: personality === 'eli' ? 0.3 : 0.5
    })
  });

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    usage: data.usage
  };
}

function applyUniversalExpertEnhancement(response, domainAnalysis, professionalContext, quantitativeNeeds, personality, originalMessage, mode, vaultContent) {
  let enhancedResponse = response;

  if (!response.includes('CONFIDENCE:') && containsFactualClaims(response)) {
    const confidenceLevel = assessProfessionalConfidence(response, domainAnalysis);
    enhancedResponse += `\n\nCONFIDENCE: ${confidenceLevel}`;
  }

  if (quantitativeNeeds.financial_modeling && !response.includes('$')) {
    enhancedResponse += `\n\nFINANCIAL ANALYSIS NOTE: This request appears to require specific numerical calculations. Let me provide concrete projections using available data.`;
  }

  return enhancedResponse;
}

function assessProfessionalConfidence(response, domainAnalysis) {
  if (response.includes('verified') || response.includes('established') || response.includes('proven')) {
    return 'High (90%+) - based on established professional methodologies and verified data';
  }
  
  if (response.includes('professional experience') || response.includes('industry standard')) {
    return 'Medium (75-89%) - based on professional experience and industry best practices';
  }
  
  return 'Medium (75%) - professional analysis with standard assumptions';
}

function applyExpertEnforcement(response, mode, vaultContent, vaultStatus, vaultHealthy, professionalContext) {
  let finalResponse = response;

  const politicalKeywords = ['vote', 'election', 'democrat', 'republican'];
  const containsPolitical = politicalKeywords.some(keyword =>
    response.toLowerCase().includes(keyword)
  );

  if (containsPolitical && response.toLowerCase().includes('should vote')) {
    finalResponse += '\n\nPROFESSIONAL NEUTRALITY: As a professional advisor, I cannot and will not tell you who to vote for. That is your sacred right and responsibility as a citizen. I can help you research facts and analyze implications, but the decision must be yours.';
  }

  if (mode === 'site_monkeys') {
    if (vaultHealthy && vaultContent.length > 1000) {
      finalResponse += '\n\nPROFESSIONAL ANALYSIS: Generated using Site Monkeys business intelligence vault with professional-grade methodology.';
    } else if (!vaultHealthy) {
      finalResponse += '\n\nPROFESSIONAL FALLBACK: Analysis using core business logic due to vault issues - maintaining professional standards.';
    }

    const priceMatches = response.match(/\$(\d+)/g);
    if (priceMatches) {
      const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
      if (prices.some(price => price < 697)) {
        finalResponse += '\n\nPROFESSIONAL PRICING GUIDANCE: Site Monkeys maintains professional service levels with minimum pricing of $697 (Boost), $1,497 (Climb), and $2,997 (Lead) to ensure quality delivery and sustainable operations.';
      }
    }
  }

  finalResponse += `\n\n—${professionalContext}`;

  return finalResponse;
}

function updateExpertiseMemory(domainAnalysis, professionalContext) {
  expertiseMemory.recognizedDomains.push(domainAnalysis.primary_domain);
  expertiseMemory.professionalContext = professionalContext;
  
  if (expertiseMemory.recognizedDomains.length > 10) {
    expertiseMemory.recognizedDomains = expertiseMemory.recognizedDomains.slice(-10);
  }
}

function generateExpertCostMessage(estimatedCost, professionalContext) {
  return `As your ${professionalContext}, I want to provide you with the most comprehensive analysis possible, but the estimated cost would be $${estimatedCost.toFixed(4)}, which exceeds our $0.50 limit per request.

I care about managing costs responsibly while delivering professional-grade analysis. Would you like me to:
1. Provide detailed professional analysis using our standard AI (still highly competent)
2. Break this into smaller questions I can handle within the cost limit
3. Proceed with Claude anyway (additional cost noted)

What would work best for your professional needs?`;
}

function containsFactualClaims(response) {
  const factualIndicators = [
    'studies show', 'research indicates', 'data reveals', 'according to',
    'statistics', 'evidence suggests', 'analysis shows', 'reports indicate'
  ];
  return factualIndicators.some(indicator => response.toLowerCase().includes(indicator));
}
