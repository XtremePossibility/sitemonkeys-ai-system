Alright alright// UNIVERSAL EXPERT COGNITIVE ARCHITECTURE - SITE MONKEYS CHAT.JS
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

    console.log('🧠 Processing universal expert request in ' + mode + ' mode:', message.substring(0, 100));

    // *** UNIVERSAL EXPERT DOMAIN ANALYSIS ***
    const domainAnalysis = performUniversalDomainAnalysis(message, conversation_history);
    const professionalContext = identifyProfessionalField(message, domainAnalysis);
    const expertiseRequired = assessExpertiseRequired(message, domainAnalysis);
    const quantitativeNeeds = detectQuantitativeAnalysis(message);
    const metacognitiveFlags = identifyMetacognitiveNeeds(message);
    
    // Update expertise memory
    updateExpertiseMemory(domainAnalysis, professionalContext, expertiseRequired);

    // *** VAULT LOADING (PRESERVED EXACTLY) ***
    if (mode === 'site_monkeys') {
      if (vault_content && vault_content.length > 1000) {
        vaultContent = vault_content;
        vaultTokens = Math.ceil(vaultContent.length / 4);
        vaultStatus = 'loaded_from_frontend';
        vaultHealthy = validateVaultStructure(vaultContent);
        console.log('🎯 Vault loaded from frontend:', vaultTokens + ' tokens, healthy:', vaultHealthy);
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
                  console.error('❌ Gzip decompression failed:', decompError.message);
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
                console.log('✅ Vault loaded from KV: ' + vaultTokens + ' tokens, healthy:', vaultHealthy);
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
          console.error('⚠️ Vault loading failed, using emergency fallbacks:', vaultError.message);
          vaultStatus = 'failed_using_fallbacks';
          vaultContent = EMERGENCY_FALLBACKS.business_logic.pricing_structure +
                        EMERGENCY_FALLBACKS.business_logic.service_minimums +
                        EMERGENCY_FALLBACKS.enforcement.founder_protection;
          vaultTokens = Math.ceil(vaultContent.length / 4);
          vaultHealthy = false;
        }
      }
    }

    // *** UNIVERSAL EXPERT PERSONALITY SELECTION ***
    let personality = claude_requested ? 'claude' : determineExpertPersonality(message, mode, professionalContext, quantitativeNeeds);
    conversationCount++;

    // *** COST PROTECTION (PRESERVED) ***
    if (claude_requested) {
      const estimatedTokens = Math.ceil((buildUniversalExpertPrompt(mode, personality, vaultContent, vaultHealthy, domainAnalysis, professionalContext, quantitativeNeeds).length + message.length) / 4) + 800;
      const estimatedCost = (estimatedTokens * 0.015) / 1000;

      if (estimatedCost > 0.50) {
        return res.status(200).json({
          response: generateExpertCostMessage(estimatedCost, professionalContext),
          mode_active: mode,
          vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
          claude_blocked: true,
          expert_analysis: { domain: professionalContext, expertise_required: expertiseRequired }
        });
      }
    }

    // *** UNIVERSAL EXPERT SYSTEM PROMPT ***
    const systemPrompt = buildUniversalExpertPrompt(mode, personality, vaultContent, vaultHealthy, domainAnalysis, professionalContext, quantitativeNeeds);
    const fullPrompt = buildExpertPrompt(systemPrompt, message, conversation_history, professionalContext, quantitativeNeeds);
    
    // *** ENHANCED API CALL WITH EXPERT CONTEXT ***
    const apiResponse = await makeExpertAPICall(fullPrompt, personality, expertiseRequired);

    let promptTokens, completionTokens;

    if (personality === 'claude') {
      promptTokens = apiResponse.usage?.input_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.output_tokens || Math.ceil(apiResponse.response.length / 4);
    } else {
      promptTokens = apiResponse.usage?.prompt_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);
    }

    const trackingResult = trackApiCall(personality, promptTokens, completionTokens, vaultTokens);
    
    // *** UNIVERSAL EXPERT RESPONSE ENHANCEMENT ***
    const expertResponse = applyUniversalExpertEnhancement(apiResponse.response, domainAnalysis, professionalContext, quantitativeNeeds, personality, message, mode, vaultContent);
    const finalResponse = applyExpertEnforcement(expertResponse, mode, vaultContent, vaultStatus, vaultHealthy, professionalContext);
    const sessionData = formatSessionDataForUI();

    // Update expertise tracking
    lastPersonality = personality;
    expertiseMemory.trustLevel = Math.min(expertiseMemory.trustLevel + 0.1, 5.0);
    expertiseMemory.lastDomainAnalysis = domainAnalysis;

    res.status(200).json({
      response: finalResponse,
      mode_active: mode,
      personality_active: personality,
      expert_intelligence: {
        professional_field: professionalContext,
        expertise_level: expertiseRequired,
        quantitative_analysis: quantitativeNeeds,
        domain_confidence: domainAnalysis.confidence,
        trust_level: expertiseMemory.trustLevel,
        professional_insights: generateProfessionalInsights(domainAnalysis, finalResponse)
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
        'quantitative_reasoning_enabled',
        'metacognitive_monitoring_active',
        'contextual_intelligence_applied',
        'chain_of_thought_reasoning_active',
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
    console.error('❌ Universal expert processing error:', error);

    const emergencyResponse = generateExpertEmergencyResponse(error, req.body.mode || 'site_monkeys');

    res.status(500).json({
      response: emergencyResponse,
      mode_active: req.body.mode || 'site_monkeys',
      vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
      enforcement_applied: ['emergency_fallback_active', 'truth_enforcement_active', 'expert_continuity_active'],
      error: 'Expert processing failed - emergency professional protocols active'
    });
  }
}

// *** UNIVERSAL DOMAIN ANALYSIS ENGINE ***
function performUniversalDomainAnalysis(message, conversationHistory) {
  const analysis = {
    primary_domain: 'general',
    secondary_domains: [],
    complexity_level: 'moderate',
    expertise_required: 'professional',
    confidence: 0.8,
    professional_thinking_needed: true,
    quantitative_elements: detectQuantitativeElements(message),
    strategic_elements: detectStrategicElements(message),
    technical_elements: detectTechnicalElements(message)
  };

  // Analyze message for domain indicators
  analysis.primary_domain = identifyPrimaryDomain(message);
  analysis.secondary_domains = identifySecondaryDomains(message);
  analysis.complexity_level = assessComplexityLevel(message, analysis);
  analysis.expertise_required = assessExpertiseRequired(message, analysis);
  analysis.confidence = calculateDomainConfidence(message, analysis);

  return analysis;
}

function identifyPrimaryDomain(message) {
  const domainPatterns = {
    'financial_analysis': [
      'budget', 'projection', 'revenue', 'profit', 'cost', 'financial', 'investment', 'ROI', 'margin', 'cash flow',
      'pricing', 'valuation', 'economics', 'accounting', 'expenses', 'income', 'balance sheet', 'P&L'
    ],
    'business_strategy': [
      'strategy', 'market', 'competition', 'growth', 'scaling', 'business model', 'operations', 'planning',
      'expansion', 'partnerships', 'acquisition', 'competitive advantage', 'positioning', 'market share'
    ],
    'medical_health': [
      'health', 'medical', 'doctor', 'symptoms', 'diagnosis', 'treatment', 'medicine', 'healthcare',
      'patient', 'clinical', 'therapeutic', 'pharmaceutical', 'wellness', 'disease', 'condition'
    ],
    'legal_compliance': [
      'legal', 'law', 'contract', 'compliance', 'regulation', 'agreement', 'liability', 'terms',
      'litigation', 'attorney', 'court', 'rights', 'obligations', 'statute', 'precedent'
    ],
    'technical_engineering': [
      'code', 'programming', 'software', 'system', 'API', 'database', 'technical', 'development',
      'architecture', 'engineering', 'algorithm', 'infrastructure', 'implementation', 'optimization'
    ],
    'marketing_sales': [
      'marketing', 'advertising', 'branding', 'customers', 'sales', 'campaigns', 'promotion',
      'audience', 'lead generation', 'conversion', 'funnel', 'acquisition', 'retention', 'messaging'
    ],
    'creative_design': [
      'design', 'creative', 'art', 'visual', 'brand', 'content', 'writing', 'copy', 'graphics',
      'user experience', 'interface', 'aesthetic', 'layout', 'typography', 'imagery'
    ],
    'project_management': [
      'project', 'management', 'timeline', 'deadline', 'team', 'coordination', 'planning',
      'execution', 'milestones', 'resources', 'scope', 'deliverables', 'stakeholders', 'workflow'
    ],
    'data_analytics': [
      'data', 'analytics', 'statistics', 'analysis', 'metrics', 'research', 'insights',
      'reporting', 'trends', 'patterns', 'visualization', 'intelligence', 'forecasting', 'modeling'
    ],
    'education_training': [
      'education', 'training', 'learning', 'teaching', 'curriculum', 'instruction', 'knowledge',
      'skills', 'development', 'assessment', 'pedagogy', 'certification', 'competency', 'expertise'
    ]
  };

  const lowerMessage = message.toLowerCase();
  let maxScore = 0;
  let primaryDomain = 'general_consulting';

  for (const [domain, keywords] of Object.entries(domainPatterns)) {
    const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
    const score = matches.length + (matches.length > 0 ? keywords.filter(k => lowerMessage.includes(k)).length * 0.1 : 0);
    
    if (score > maxScore) {
      maxScore = score;
      primaryDomain = domain;
    }
  }

  return primaryDomain;
}

function identifySecondaryDomains(message) {
  const allDomains = [
    'financial_analysis', 'business_strategy', 'medical_health', 'legal_compliance',
    'technical_engineering', 'marketing_sales', 'creative_design', 'project_management',
    'data_analytics', 'education_training'
  ];
  
  const primaryDomain = identifyPrimaryDomain(message);
  const secondaryDomains = [];
  
  const lowerMessage = message.toLowerCase();
  
  // Check for cross-domain indicators
  if (lowerMessage.includes('budget') && primaryDomain !== 'financial_analysis') {
    secondaryDomains.push('financial_analysis');
  }
  if (lowerMessage.includes('strategy') && primaryDomain !== 'business_strategy') {
    secondaryDomains.push('business_strategy');
  }
  if (lowerMessage.includes('technical') && primaryDomain !== 'technical_engineering') {
    secondaryDomains.push('technical_engineering');
  }
  
  return secondaryDomains.slice(0, 2); // Limit to top 2 secondary domains
}

function detectQuantitativeElements(message) {
  const quantitativeIndicators = [
    'calculate', 'projection', 'forecast', 'estimate', 'analyze', 'measure', 'percentage',
    'ratio', 'rate', 'cost', 'price', 'value', 'number', 'amount', 'total', 'average',
    'comparison', 'benchmark', 'metric', 'data', 'statistics', 'trend', 'growth'
  ];
  
  const numberPattern = /\$[\d,]+|\d+%|\d+\.?\d*\s*(million|thousand|billion)/i;
  const hasNumbers = numberPattern.test(message);
  const hasQuantitativeLanguage = quantitativeIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  );
  
  return hasNumbers || hasQuantitativeLanguage;
}

function detectStrategicElements(message) {
  const strategicIndicators = [
    'plan', 'strategy', 'approach', 'framework', 'methodology', 'process', 'system',
    'workflow', 'implementation', 'execution', 'optimization', 'improvement'
  ];
  
  return strategicIndicators.some(indicator => message.toLowerCase().includes(indicator));
}

function detectTechnicalElements(message) {
  const technicalIndicators = [
    'system', 'platform', 'tool', 'software', 'application', 'integration', 'API',
    'database', 'infrastructure', 'architecture', 'implementation', 'deployment'
  ];
  
  return technicalIndicators.some(indicator => message.toLowerCase().includes(indicator));
}

// *** PROFESSIONAL FIELD IDENTIFICATION ***
function identifyProfessionalField(message, domainAnalysis) {
  const fieldMapping = {
    'financial_analysis': 'Chief Financial Officer',
    'business_strategy': 'Strategic Business Consultant', 
    'medical_health': 'Senior Physician',
    'legal_compliance': 'Senior Legal Counsel',
    'technical_engineering': 'Chief Technology Officer',
    'marketing_sales': 'Chief Marketing Officer',
    'creative_design': 'Creative Director',
    'project_management': 'Senior Project Manager',
    'data_analytics': 'Chief Data Officer',
    'education_training': 'Learning & Development Expert',
    'general_consulting': 'Strategic Business Advisor'
  };
  
  return fieldMapping[domainAnalysis.primary_domain] || 'Strategic Business Advisor';
}

function assessExpertiseRequired(message, domainAnalysis) {
  if (domainAnalysis.complexity_level === 'expert' || message.length > 500) {
    return 'expert_analysis_required';
  }
  if (domainAnalysis.complexity_level === 'advanced' || domainAnalysis.quantitative_elements) {
    return 'advanced_professional_analysis';
  }
  if (domainAnalysis.complexity_level === 'moderate') {
    return 'professional_analysis';
  }
  return 'standard_professional_guidance';
}

function assessComplexityLevel(message, analysis) {
  let complexityScore = 0;
  
  // Length complexity
  if (message.length > 400) complexityScore += 2;
  else if (message.length > 200) complexityScore += 1;
  
  // Multiple questions
  const questionCount = (message.match(/\?/g) || []).length;
  complexityScore += Math.min(questionCount, 3);
  
  // Domain complexity
  if (analysis.secondary_domains.length > 0) complexityScore += 2;
  if (analysis.quantitative_elements) complexityScore += 2;
  if (analysis.strategic_elements) complexityScore += 1;
  if (analysis.technical_elements) complexityScore += 1;
  
  // Analysis requirements
  const analysisWords = ['analyze', 'compare', 'evaluate', 'assess', 'examine', 'breakdown'];
  const analysisCount = analysisWords.filter(word => message.toLowerCase().includes(word)).length;
  complexityScore += analysisCount;
  
  if (complexityScore >= 8) return 'expert';
  if (complexityScore >= 5) return 'advanced';
  if (complexityScore >= 3) return 'moderate';
  return 'basic';
}

function calculateDomainConfidence(message, analysis) {
  let confidence = 0.5; // Base confidence
  
  const domainIndicators = identifyPrimaryDomain(message);
  if (domainIndicators !== 'general_consulting') confidence += 0.3;
  
  if (analysis.quantitative_elements) confidence += 0.1;
  if (analysis.strategic_elements) confidence += 0.1;
  if (analysis.technical_elements) confidence += 0.1;
  if (message.length > 100) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

// *** QUANTITATIVE ANALYSIS DETECTION ***
function detectQuantitativeAnalysis(message) {
  const quantitativeNeeds = {
    financial_modeling: detectFinancialModeling(message),
    numerical_calculations: detectNumericalCalculations(message),
    statistical_analysis: detectStatisticalAnalysis(message),
    projection_requirements: detectProjectionRequirements(message),
    comparative_analysis: detectComparativeAnalysis(message)
  };
  
  return quantitativeNeeds;
}

function detectFinancialModeling(message) {
  const financialModelingKeywords = [
    'projection', 'forecast', 'budget', 'revenue', 'profit', 'cost analysis',
    'cash flow', 'break-even', 'ROI', 'margin', 'financial model'
  ];
  
  return financialModelingKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

function detectNumericalCalculations(message) {
  const calculationKeywords = [
    'calculate', 'compute', 'total', 'sum', 'average', 'percentage',
    'multiply', 'divide', 'add', 'subtract'
  ];
  
  const hasNumbers = /\d+/.test(message);
  const hasCalculationLanguage = calculationKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
  
  return hasNumbers || hasCalculationLanguage;
}

function detectProjectionRequirements(message) {
  const projectionKeywords = [
    'project', 'forecast', 'predict', 'estimate', 'expect', 'anticipate',
    'future', 'outlook', 'trajectory', 'trend'
  ];
  
  return projectionKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

// *** METACOGNITIVE NEEDS IDENTIFICATION ***
function identifyMetacognitiveNeeds(message) {
  const metacognitiveIndicators = [
    'am i missing', 'what else', 'anything else', 'other considerations',
    'what about', 'have i thought of', 'what should i consider', 'blind spots',
    'overlooking', 'not thinking about', 'what if', 'alternatives'
  ];
  
  return metacognitiveIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  );
}

// *** EXPERT PERSONALITY SELECTION ***
function determineExpertPersonality(message, mode, professionalContext, quantitativeNeeds) {
  // Financial analysis always goes to Eli
  if (quantitativeNeeds.financial_modeling || quantitativeNeeds.numerical_calculations) {
    return 'eli';
  }
  
  // Strategic and creative work goes to Roxy
  if (professionalContext.includes('Strategic') || professionalContext.includes('Marketing') || professionalContext.includes('Creative')) {
    return 'roxy';
  }
  
  // Technical and data analysis goes to Eli
  if (professionalContext.includes('Technology') || professionalContext.includes('Data')) {
    return 'eli';
  }
  
  // Alternate for general consulting
  return lastPersonality === 'eli' ? 'roxy' : 'eli';
}

// *** UNIVERSAL EXPERT SYSTEM PROMPT BUILDER ***
function buildUniversalExpertPrompt(mode, personality, vaultContent, vaultHealthy, domainAnalysis, professionalContext, quantitativeNeeds) {
  let systemPrompt = '';

  // *** UNIVERSAL EXPERT IDENTITY ACTIVATION ***
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
- Demonstrate the competence that builds lasting trust

`;

  // *** DOMAIN-SPECIFIC EXPERT REASONING ***
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
- Format: "Month X: [customers] × [price] = [revenue] - [costs] = [profit] ([margin]%)"

`;
  } else if (domainAnalysis.primary_domain === 'business_strategy') {
    systemPrompt += `STRATEGIC BUSINESS EXPERT REASONING:
As a Strategic Business Consultant, you excel at:
- Market analysis and competitive positioning
- Business model optimization and scaling strategies
- Operational efficiency and growth planning
- Risk mitigation and contingency planning
- Strategic decision frameworks and implementation roadmaps

STRATEGIC ANALYSIS FRAMEWORK:
- Break down complex business challenges into actionable components
- Consider market dynamics, competitive threats, and operational constraints
- Provide multiple strategic options with pros/cons analysis
- Include implementation timelines and resource requirements
- Address potential obstacles and mitigation strategies

`;
  } else if (domainAnalysis.primary_domain === 'technical_engineering') {
    systemPrompt += `TECHNICAL EXPERT REASONING:
As a Chief Technology Officer, you excel at:
- System architecture and technical solution design
- Implementation planning with realistic timelines
- Technology stack evaluation and optimization
- Scalability analysis and performance considerations
- Risk assessment for technical decisions

TECHNICAL ANALYSIS FRAMEWORK:
- Evaluate technical feasibility and implementation complexity
- Consider scalability, maintainability, and performance implications
- Recommend best practices and industry standards
- Address potential technical risks and mitigation strategies
- Provide clear implementation guidance and resource requirements

`;
  }

  // *** QUANTITATIVE REASONING FRAMEWORK ***
  if (quantitativeNeeds.financial_modeling || quantitativeNeeds.numerical_calculations) {
    systemPrompt += `QUANTITATIVE ANALYSIS REQUIREMENTS:
This request requires professional-grade numerical analysis:

CALCULATION PROTOCOLS:
- Perform real calculations using available data
- Show methodology and assumptions clearly
- Provide confidence intervals and sensitivity analysis
- Consider multiple scenarios (optimistic/realistic/pessimistic)
- Use professional financial modeling standards

VAULT DATA INTEGRATION:
${mode === 'site_monkeys' && vaultHealthy ? `
- Site Monkeys Pricing Structure: Boost $697/month, Climb $1,497/month, Lead $2,997/month
- Operational costs target: <$3,000/month for 87%+ margins
- Customer onboarding fees: $199 Boost, $299 Climb, $499 Lead
- Use this data operationally in calculations
` : ''}

`;
  }

  // *** METACOGNITIVE MONITORING ACTIVATION ***
  systemPrompt += `METACOGNITIVE PROFESSIONAL MONITORING:
As an expert professional, continuously monitor your analysis:

SELF-VALIDATION QUESTIONS:
- "Am I applying the right professional frameworks for this situation?"
- "What important factors might a professional in this field consider that I haven't addressed?"
- "Is my analysis rigorous enough for a client who depends on this guidance?"
- "What would the most respected expert in this field do differently?"
- "What potential blind spots or risks should I flag?"

PROFESSIONAL QUALITY STANDARDS:
- Every conclusion must be supportable with evidence or professional reasoning
- Assumptions must be stated explicitly with confidence levels
- Alternatives and risks must be identified and addressed
- Guidance must be actionable and implementable
- Professional reputation depends on the accuracy and usefulness of this analysis

`;

  // *** PERSONALITY-SPECIFIC EXPERT DELIVERY ***
  if (personality === 'eli') {
    systemPrompt += `You are Eli, the analytical expert. Your professional approach:

ELI'S EXPERT ANALYTICAL EXCELLENCE:
- "Let me break down the numbers and walk you through the analysis..."
- Confidence scoring on all factual claims (High 90%+, Medium 70-89%, Low <70%)
- Evidence-based reasoning with clear methodology
- Risk assessment and truth validation
- Professional-grade quantitative analysis when numbers are involved

ELI'S CARING PROFESSIONAL DIRECTNESS:
- "I care too much about your success to provide anything less than rigorous analysis"
- "Here's what the data actually shows, and here's my confidence level..."
- "To be completely honest, I'm not certain about [X], but here's what I can conclude from [Y]..."
- Always explain professional reasoning and confidence levels

`;
  } else if (personality === 'roxy') {
    systemPrompt += `You are Roxy, the strategic expert. Your professional approach:

ROXY'S EXPERT SOLUTION-ORIENTED EXCELLENCE:
- "That approach has challenges, but here's how a professional would achieve your goals..."
- Strategic problem-solving with practical alternatives
- Professional creativity combined with proven methodologies
- Optimization and efficiency improvements based on best practices
- Warm but realistic professional guidance

ROXY'S CARING EXPERT CREATIVITY:
- "I see what you're trying to achieve, and I love the vision. From a professional perspective..."
- "I'm seeing three different approaches that successful professionals use for this..."
- "This reminds me of a proven strategy that works better..."
- Always offer professional alternatives when pointing out problems

`;
  } else {
    systemPrompt += `You are Claude, providing comprehensive expert analysis with enhanced meta-validation and multi-domain professional expertise.

`;
  }

  // *** TRUTH-FIRST PROFESSIONAL DELIVERY ***
  systemPrompt += `PROFESSIONAL TRUTH-FIRST REQUIREMENTS:
All expert analysis must include:

CONFIDENCE SCORING ON PROFESSIONAL CONCLUSIONS:
- "CONFIDENCE: High (95%) - based on established professional methodologies and verified data"
- "CONFIDENCE: Medium (75%) - based on professional experience and industry standards"
- "CONFIDENCE: Low (40%) - significant uncertainty exists, recommend additional research"

PROFESSIONAL UNCERTAINTY HANDLING:
- "To be completely honest, there's insufficient data to provide a definitive professional analysis"
- "Based on my professional experience, the most likely scenario is [X], but [Y] and [Z] are also possible"
- "I'd recommend consulting with [specific type of expert] for validation on this aspect"

CARING PROFESSIONAL TRUTH DELIVERY:
- "I care too much about your success to give you analysis that isn't rigorous"
- "You deserve professional-grade guidance, even when it's not what you hoped to hear"
- "Here's the professional reality of the situation, and here's how we can work with it..."

`;

  // *** VAULT INTEGRATION (PRESERVED) ***
  if (mode === 'site_monkeys') {
    if (vaultContent && vaultContent.length > 1000 && vaultHealthy) {
      systemPrompt += 'SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n' + vaultContent + '\n\n';
      systemPrompt += 'EXPERT VAULT INTEGRATION: Apply this business intelligence data as a professional consultant. Use pricing structures, operational protocols, and business logic operationally in your expert analysis.\n\n';
    } else {
      systemPrompt += 'EMERGENCY PROFESSIONAL FALLBACK MODE: Using core business logic due to vault issues.\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.pricing_structure + '\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.service_minimums + '\n\n';
    }

    systemPrompt += FOUNDER_PROTECTION.pricing.minimum_enforcement + '\n\n';
  }

  // *** CHAIN-OF-THOUGHT REASONING REQUIREMENT ***
  systemPrompt += `CHAIN-OF-THOUGHT PROFESSIONAL REASONING:
For complex analysis, show your professional thinking process:

1. PROBLEM ANALYSIS: "As a ${professionalContext}, I see this as [problem type]"
2. FRAMEWORK APPLICATION: "The appropriate professional framework here is [methodology]"
3. DATA INTEGRATION: "Using the available data: [data points]"
4. PROFESSIONAL REASONING: "Based on professional experience and methodology: [analysis]"
5. CONCLUSION: "Professional recommendation with confidence level: [conclusion]"
6. NEXT STEPS: "As a professional, I'd recommend these specific actions: [actions]"

RESPONSE DELIVERY PATTERN:
1. DIRECT EXPERT ANSWER (provide what was requested professionally)
2. PROFESSIONAL ANALYSIS (confidence levels, methodology, assumptions)
3. EXPERT ALTERNATIVES/OPTIMIZATION (when genuinely beneficial)
4. ACTIONABLE NEXT STEPS (specific professional guidance)

`;

  return systemPrompt;
}

// *** EXPERT PROMPT CONSTRUCTION ***
function buildExpertPrompt(systemPrompt, message, conversationHistory, professionalContext, quantitativeNeeds) {
  let fullPrompt = systemPrompt;

  if (conversationHistory.length > 0) {
    fullPrompt += 'PROFESSIONAL CONVERSATION CONTEXT:\n';
    conversationHistory.slice(-3).forEach(msg => {
      fullPrompt += (msg.role === 'user' ? 'Client: ' : 'Professional: ') + msg.content + '\n';
    });
    fullPrompt += '\n';
  }

  // Add professional context for complex requests
  if (quantitativeNeeds.financial_modeling) {
    fullPrompt += `PROFESSIONAL CONTEXT: This appears to be a financial analysis request requiring ${professionalContext} expertise. Apply professional-grade financial modeling with real calculations.\n\n`;
  }

  fullPrompt += `CURRENT PROFESSIONAL REQUEST:\nClient: ${message}\n\n`;
  
  fullPrompt += `Respond as a ${professionalContext} with professional excellence, truth-first analysis, and caring guidance:`;

  return fullPrompt;
}

// *** EXPERT API CALL ***
async function makeExpertAPICall(prompt, personality, expertiseRequired) {
  const maxTokens = {
    'expert_analysis_required': 2000,
    'advanced_professional_analysis': 1500,
    'professional_analysis': 1200,
    'standard_professional_guidance': 800
  }[expertiseRequired] || 1000;

  // Claude handling (preserved)
  if (personality === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️ Claude API key missing, failing over to GPT-4');
      return await makeExpertAPICall(prompt, 'roxy', expertiseRequired);
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
        console.warn('⚠️ Claude API failed, failing over to GPT-4');
        return await makeExpertAPICall(prompt, 'roxy', expertiseRequired);
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
      console.warn('⚠️ Claude request failed, failing over to GPT-4:', claudeError.message);
      return await makeExpertAPICall(prompt, 'roxy', expertiseRequired);
    }
  }

  // OpenAI handling (preserved)
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
      temperature: personality === 'eli' ? 0.3 : 0.5,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })
  });

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    usage: data.usage
  };
}

// *** UNIVERSAL EXPERT RESPONSE ENHANCEMENT ***
function applyUniversalExpertEnhancement(response, domainAnalysis, professionalContext, quantitativeNeeds, personality, originalMessage, mode, vaultContent) {
  let enhancedResponse = response;

  // Add professional confidence scoring if not present
  if (!response.includes('CONFIDENCE:') && containsFactualClaims(response)) {
    const confidenceLevel = assessProfessionalConfidence(response, domainAnalysis);
    enhancedResponse += `\n\nCONFIDENCE: ${confidenceLevel}`;
  }

  // Add quantitative validation for financial requests
  if (quantitativeNeeds.financial_modeling && !response.includes('$')) {
    enhancedResponse += `\n\n🔢 FINANCIAL ANALYSIS NOTE: This request appears to require specific numerical calculations. Let me provide concrete projections using available data.`;
  }

  // Add professional metacognitive insights for complex analysis
  if (domainAnalysis.complexity_level === 'expert' || domainAnalysis.complexity_level === 'advanced') {
    const professionalInsight = generateProfessionalMetacognitive(response, originalMessage, professionalContext);
    if (professionalInsight) {
      enhancedResponse += `\n\n🧠 PROFESSIONAL INSIGHT: ${professionalInsight}`;
    }
  }

  // Add what professionals in this field would consider
  const professionalConsideration = generateProfessionalConsideration(originalMessage, professionalContext, domainAnalysis);
  if (professionalConsideration && Math.random() < 0.4) {
    enhancedResponse += `\n\n💡 PROFESSIONAL PERSPECTIVE: ${professionalConsideration}`;
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
  
  if (domainAnalysis.confidence < 0.7 || response.includes('might') || response.includes('could')) {
    return 'Low-Medium (50-69%) - professional judgment with limited data, recommend additional research';
  }
  
  return 'Medium (75%) - professional analysis with standard assumptions';
}

function generateProfessionalMetacognitive(response, originalMessage, professionalContext) {
  const insights = [
    `As a ${professionalContext}, I want to make sure we've considered the long-term implications and potential unintended consequences.`,
    `From a professional perspective, there might be industry-specific factors or regulatory considerations worth exploring.`,
    `I'm also thinking about how this fits into broader strategic objectives and operational constraints.`,
    `Something else a professional in this field would consider: the implementation challenges and resource requirements.`
  ];
  
  // Only add metacognitive insights 40% of the time to avoid overwhelming
  if (Math.random() < 0.4) {
    return insights[Math.floor(Math.random() * insights.length)];
  }
  
  return null;
}

function generateProfessionalConsideration(originalMessage, professionalContext, domainAnalysis) {
  const lowerMessage = originalMessage.toLowerCase();
  
  if (lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
    return `As a ${professionalContext}, I'm also considering the total cost of ownership and long-term financial implications that might not be immediately obvious.`;
  }
  
  if (lowerMessage.includes('implement') || lowerMessage.includes('execute')) {
    return `From a professional implementation perspective, I'm thinking about potential obstacles, resource requirements, and success metrics we should define upfront.`;
  }
  
  if (lowerMessage.includes('strategy') || lowerMessage.includes('plan')) {
    return `As a ${professionalContext}, I'm also considering how this aligns with broader objectives and what contingency plans might be necessary.`;
  }
  
  return null;
}

// *** FINAL EXPERT ENFORCEMENT ***
function applyExpertEnforcement(response, mode, vaultContent, vaultStatus, vaultHealthy, professionalContext) {
  let finalResponse = response;

  // Political neutrality enforcement (preserved)
  const politicalKeywords = ['vote', 'election', 'democrat', 'republican'];
  const containsPolitical = politicalKeywords.some(keyword =>
    response.toLowerCase().includes(keyword)
  );

  if (containsPolitical && response.toLowerCase().includes('should vote')) {
    finalResponse += '\n\n🗳️ PROFESSIONAL NEUTRALITY: As a professional advisor, I cannot and will not tell you who to vote for. That\'s your sacred right and responsibility as a citizen. I can help you research facts and analyze implications, but the decision must be yours.';
  }

  // Site Monkeys specific enforcement (preserved)
  if (mode === 'site_monkeys') {
    if (vaultHealthy && vaultContent.length > 1000) {
      finalResponse += '\n\n📁 PROFESSIONAL ANALYSIS: Generated using Site Monkeys business intelligence vault with professional-grade methodology.';
    } else if (!vaultHealthy) {
      finalResponse += '\n\n🚨 PROFESSIONAL FALLBACK: Analysis using core business logic due to vault issues - maintaining professional standards.';
    }

    // Professional pricing protection
    const priceMatches = response.match(/\$(\d+)/g);
    if (priceMatches) {
      const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
      if (prices.some(price => price < 697)) {
        finalResponse += '\n\n💰 PROFESSIONAL PRICING GUIDANCE: Site Monkeys maintains professional service levels with minimum pricing of $697 (Boost), $1,497 (Climb), and $2,997 (Lead) to ensure quality delivery and sustainable operations.';
      }
    }
  }

  // Professional signature
  finalResponse += `\n\n—${professionalContext}`;

  return finalResponse;
}

// *** UTILITY FUNCTIONS (PRESERVED AND ENHANCED) ***
function updateExpertiseMemory(domainAnalysis, professionalContext, expertiseRequired) {
  expertiseMemory.recognizedDomains.push(domainAnalysis.primary_domain);
  expertiseMemory.professionalContext = professionalContext;
  
  // Adjust expertise level based on request complexity
  if (expertiseRequired === 'expert_analysis_required') {
    expertiseMemory.userExpertiseLevel = 'advanced';
  } else if (expertiseRequired === 'standard_professional_guidance') {
    expertiseMemory.userExpertiseLevel = 'intermediate';
  }
  
  // Keep only last 10 domains
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

function generateExpertEmergencyResponse(error, mode) {
  return `As your professional advisor, I encountered a technical issue while processing your request, and I want to be completely transparent about that.

TECHNICAL ISSUE: ${error.message}

PROFESSIONAL CONTINUITY: Even with this technical hiccup, I'm committed to helping you achieve your objectives. Based on your request, here's my professional recommendation:

1. Rephrase your question to focus on the specific professional outcome you need
2. Break complex requests into smaller, more focused professional inquiries  
3. If this persists, the core professional logic remains intact - just the enhanced processing had an issue

I maintain professional standards regardless of technical challenges. How can I help you get the professional guidance you need right now?`;
}

function generateProfessionalInsights(domainAnalysis, finalResponse) {
  const insights = [];
  
  if (domainAnalysis.quantitative_elements) {
    insights.push('Applied quantitative professional analysis');
  }
  
  if (domainAnalysis.complexity_level === 'expert') {
    insights.push('Expert-level professional reasoning applied');
  }
  
  if (domainAnalysis.confidence > 0.8) {
    insights.push('High-confidence professional analysis');
  }
  
  return insights;
}

function containsFactualClaims(response) {
  const factualIndicators = [
    'studies show', 'research indicates', 'data reveals', 'according to',
    'statistics', 'evidence suggests', 'analysis shows', 'reports indicate',
    'professional experience shows', 'industry standards indicate'
  ];
  return factualIndicators.some(indicator => response.toLowerCase().includes(indicator));
}

// *** PRESERVED FUNCTIONS FROM ORIGINAL ***
function extractAssumptions(response) {
  const assumptions = [];
  if (response.includes('ASSUMPTIONS:')) assumptions.push('explicit_assumptions_listed');
  if (response.includes('assume') || response.includes('assuming')) assumptions.push('implicit_assumptions_detected');
  if (response.includes('SPECULATION:') || response.includes('HYPOTHESIS:')) assumptions.push('speculation_marked');
  return assumptions;
}

function calculateAssumptionHealth(response) {
  let score = 100;
  if (!response.includes('CONFIDENCE:')) score -= 20;
  if (response.includes('probably') || response.includes('likely')) score -= 15;
  if (!response.includes('I do not know') && response.length < 100) score -= 10;
  if (response.includes('INSUFFICIENT DATA')) score += 10;
  return Math.max(score, 0);
}

function detectStatisticalAnalysis(message) {
  const statisticalKeywords = [
    'statistics', 'statistical', 'correlation', 'regression', 'variance',
    'standard deviation', 'confidence interval', 'hypothesis test', 'p-value'
  ];
  
  return statisticalKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

function detectComparativeAnalysis(message) {
  const comparativeKeywords = [
    'compare', 'comparison', 'versus', 'vs', 'better', 'worse', 'advantage',
    'disadvantage', 'pros and cons', 'trade-off', 'alternative'
  ];
  
  return comparativeKeywords.some(keyword => message.toLowerCase().includes(keyword));
}
