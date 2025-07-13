// COMPLETE COGNITIVE ARCHITECTURE - SITE MONKEYS CHAT.JS
// Universal Expert Intelligence + Genuine Caring Simulation + Truth-First Delivery
import { trackApiCall, formatSessionDataForUI } from './lib/tokenTracker.js';
import { EMERGENCY_FALLBACKS, validateVaultStructure, getVaultValue } from './lib/site-monkeys/emergency-fallbacks.js';
import { ENFORCEMENT_PROTOCOLS } from './lib/site-monkeys/enforcement-protocols.js';
import { QUALITY_ENFORCEMENT } from './lib/site-monkeys/quality-enforcement.js';
import { AI_ARCHITECTURE } from './lib/site-monkeys/ai-architecture.js';
import { FOUNDER_PROTECTION } from './lib/site-monkeys/founder-protection.js';
import zlib from 'zlib';

// COGNITIVE ARCHITECTURE GLOBALS
let lastPersonality = 'roxy';
let conversationCount = 0;
let userContextMemory = {
  communicationStyle: 'professional',
  expertiseLevel: 'intermediate',
  emotionalState: 'neutral',
  trustLevel: 1,
  pastInteractions: []
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

    console.log('🧠 Processing cognitive request in ' + mode + ' mode:', message.substring(0, 100));

    // *** COGNITIVE ANALYSIS PHASE ***
    const cognitiveAnalysis = performCognitiveAnalysis(message, conversation_history, mode);
    const emotionalContext = detectEmotionalContext(message, conversation_history);
    const expertDomain = identifyExpertDomain(message);
    const complexityLevel = analyzeComplexityLevel(message);
    
    // Update user context memory
    updateUserContextMemory(emotionalContext, expertDomain, complexityLevel);

    // *** VAULT LOADING WITH ENHANCED FALLBACKS ***
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

    // *** ENHANCED PERSONALITY SELECTION WITH COGNITIVE AWARENESS ***
    let personality = claude_requested ? 'claude' : determineOptimalPersonality(message, mode, cognitiveAnalysis, expertDomain);
    conversationCount++;

    // *** COST PROTECTION WITH ENHANCED LIMITS ***
    if (claude_requested) {
      const estimatedTokens = Math.ceil((buildCognitiveSystemPrompt(mode, personality, vaultContent, vaultHealthy, cognitiveAnalysis, emotionalContext, expertDomain).length + message.length) / 4) + 800;
      const estimatedCost = (estimatedTokens * 0.015) / 1000;

      if (estimatedCost > 0.50) {
        return res.status(200).json({
          response: generateCaringCostMessage(estimatedCost),
          mode_active: mode,
          vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
          claude_blocked: true,
          cognitive_analysis: cognitiveAnalysis
        });
      }
    }

    // *** COGNITIVE SYSTEM PROMPT CONSTRUCTION ***
    const systemPrompt = buildCognitiveSystemPrompt(mode, personality, vaultContent, vaultHealthy, cognitiveAnalysis, emotionalContext, expertDomain);
    const fullPrompt = buildEnhancedPrompt(systemPrompt, message, conversation_history, personality, cognitiveAnalysis);
    
    // *** ENHANCED API CALL WITH COGNITIVE PARAMETERS ***
    const apiResponse = await makeEnhancedAPICall(fullPrompt, personality, complexityLevel);

    let promptTokens, completionTokens;

    if (personality === 'claude') {
      promptTokens = apiResponse.usage?.input_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.output_tokens || Math.ceil(apiResponse.response.length / 4);
    } else {
      promptTokens = apiResponse.usage?.prompt_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);
    }

    const trackingResult = trackApiCall(personality, promptTokens, completionTokens, vaultTokens);
    
    // *** COGNITIVE RESPONSE ENHANCEMENT ***
    const cognitiveResponse = applyCognitiveEnhancement(apiResponse.response, cognitiveAnalysis, emotionalContext, expertDomain, personality, message, mode);
    const finalResponse = applyFinalEnforcement(cognitiveResponse, mode, vaultContent, vaultStatus, vaultHealthy, emotionalContext);
    const sessionData = formatSessionDataForUI();

    // Update personality tracking and trust level
    lastPersonality = personality;
    userContextMemory.trustLevel = Math.min(userContextMemory.trustLevel + 0.1, 5.0);
    userContextMemory.pastInteractions.push({
      question_domain: expertDomain,
      complexity: complexityLevel,
      satisfaction_indicators: analyzeSatisfactionIndicators(finalResponse)
    });

    res.status(200).json({
      response: finalResponse,
      mode_active: mode,
      personality_active: personality,
      cognitive_insights: {
        expert_domain: expertDomain,
        complexity_level: complexityLevel,
        emotional_context: emotionalContext,
        confidence_assessment: extractConfidenceMetrics(finalResponse),
        trust_level: userContextMemory.trustLevel,
        metacognitive_notes: generateMetacognitiveNotes(cognitiveAnalysis, finalResponse)
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
        'truth_first_enforcement_active',
        'caring_simulation_active',
        'emotional_intelligence_applied',
        'confidence_scoring_applied',
        'metacognitive_monitoring_active',
        'quantitative_reasoning_enabled',
        'progressive_trust_building_active',
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
    console.error('❌ Cognitive processing error:', error);

    const emergencyResponse = generateEmergencyCaringResponse(error, req.body.mode || 'site_monkeys');

    res.status(500).json({
      response: emergencyResponse,
      mode_active: req.body.mode || 'site_monkeys',
      vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
      enforcement_applied: ['emergency_fallback_active', 'truth_enforcement_active', 'caring_simulation_active'],
      error: 'Cognitive processing failed - emergency caring protocols active'
    });
  }
}

// *** COGNITIVE ANALYSIS ENGINE ***
function performCognitiveAnalysis(message, conversationHistory, mode) {
  const analysis = {
    requires_quantitative_reasoning: detectQuantitativeNeeds(message),
    requires_multi_step_analysis: detectMultiStepNeeds(message),
    uncertainty_level: assessUncertaintyLevel(message),
    stakes_level: assessStakesLevel(message),
    solution_seeking: detectSolutionSeeking(message),
    professional_guidance_needed: detectProfessionalGuidanceNeeds(message),
    optimization_opportunities: detectOptimizationOpportunities(message),
    metacognitive_flags: detectMetacognitiveNeeds(message)
  };

  return analysis;
}

function detectQuantitativeNeeds(message) {
  const quantitativeIndicators = [
    'projection', 'calculate', 'numbers', 'cost', 'revenue', 'profit', 'budget',
    'ROI', 'margin', 'percentage', 'analysis', 'data', 'metrics', 'forecast',
    'estimate', 'value', 'price', 'financial', 'economic', 'statistical'
  ];
  
  return quantitativeIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  );
}

function detectMultiStepNeeds(message) {
  const multiStepIndicators = [
    'how should i', 'step by step', 'process', 'plan', 'strategy', 'approach',
    'methodology', 'framework', 'system', 'workflow', 'implementation'
  ];
  
  return multiStepIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  ) || message.length > 200;
}

function assessUncertaintyLevel(message) {
  const uncertaintyWords = ['not sure', 'unclear', 'confused', 'help', 'advice', 'guidance'];
  const confidenceWords = ['know', 'certain', 'sure', 'confirmed', 'verified'];
  
  const uncertaintyScore = uncertaintyWords.reduce((score, word) => 
    score + (message.toLowerCase().includes(word) ? 1 : 0), 0);
  const confidenceScore = confidenceWords.reduce((score, word) => 
    score + (message.toLowerCase().includes(word) ? 1 : 0), 0);
    
  if (uncertaintyScore > confidenceScore) return 'high';
  if (confidenceScore > uncertaintyScore) return 'low';
  return 'medium';
}

function assessStakesLevel(message) {
  const highStakesWords = [
    'critical', 'important', 'urgent', 'decision', 'investment', 'business',
    'career', 'future', 'major', 'significant', 'crucial', 'vital'
  ];
  
  const stakesScore = highStakesWords.reduce((score, word) => 
    score + (message.toLowerCase().includes(word) ? 1 : 0), 0);
    
  if (stakesScore >= 3) return 'high';
  if (stakesScore >= 1) return 'medium';
  return 'low';
}

function detectSolutionSeeking(message) {
  const solutionWords = [
    'how to', 'solution', 'fix', 'solve', 'resolve', 'alternative',
    'better way', 'improve', 'optimize', 'enhance', 'upgrade'
  ];
  
  return solutionWords.some(word => message.toLowerCase().includes(word));
}

function detectProfessionalGuidanceNeeds(message) {
  const professionalIndicators = [
    'expert', 'professional', 'advice', 'guidance', 'opinion', 'recommendation',
    'best practice', 'industry standard', 'what would you do', 'thoughts on'
  ];
  
  return professionalIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  );
}

function detectOptimizationOpportunities(message) {
  const optimizationWords = [
    'cost', 'expensive', 'cheaper', 'efficient', 'faster', 'better',
    'save', 'reduce', 'increase', 'maximize', 'minimize', 'optimize'
  ];
  
  return optimizationWords.some(word => message.toLowerCase().includes(word));
}

function detectMetacognitiveNeeds(message) {
  const metacognitiveIndicators = [
    'am i missing', 'what else', 'anything else', 'other considerations',
    'what about', 'have i thought of', 'what should i consider'
  ];
  
  return metacognitiveIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  );
}

// *** EMOTIONAL INTELLIGENCE ENGINE ***
function detectEmotionalContext(message, conversationHistory) {
  const emotionalMarkers = {
    stress: ['stressed', 'overwhelmed', 'pressure', 'urgent', 'deadline', 'panic', 'worried'],
    excitement: ['excited', 'thrilled', 'amazing', 'fantastic', 'great opportunity', 'breakthrough'],
    confusion: ['confused', 'lost', 'unclear', 'don\'t understand', 'help', 'stuck'],
    frustration: ['frustrated', 'annoying', 'not working', 'failed', 'wrong', 'broken'],
    confidence: ['confident', 'sure', 'certain', 'ready', 'prepared', 'know'],
    uncertainty: ['unsure', 'maybe', 'might', 'possibly', 'not certain', 'doubt']
  };

  const context = {
    primary_emotion: 'neutral',
    intensity: 'low',
    support_needed: 'standard',
    delivery_style: 'professional'
  };

  const lowerMessage = message.toLowerCase();
  
  for (const [emotion, markers] of Object.entries(emotionalMarkers)) {
    const matches = markers.filter(marker => lowerMessage.includes(marker));
    if (matches.length > 0) {
      context.primary_emotion = emotion;
      context.intensity = matches.length > 2 ? 'high' : matches.length > 1 ? 'medium' : 'low';
      break;
    }
  }

  // Adjust support and delivery based on emotion
  switch (context.primary_emotion) {
    case 'stress':
      context.support_needed = 'high';
      context.delivery_style = 'calm_reassuring';
      break;
    case 'confusion':
      context.support_needed = 'high';
      context.delivery_style = 'clear_patient';
      break;
    case 'frustration':
      context.support_needed = 'medium';
      context.delivery_style = 'understanding_solutions';
      break;
    case 'excitement':
      context.support_needed = 'medium';
      context.delivery_style = 'enthusiastic_careful';
      break;
  }

  return context;
}

// *** EXPERT DOMAIN IDENTIFICATION ***
function identifyExpertDomain(message) {
  const domainKeywords = {
    'financial_analysis': ['financial', 'money', 'cost', 'revenue', 'profit', 'budget', 'investment', 'ROI', 'pricing', 'economics'],
    'business_strategy': ['business', 'strategy', 'market', 'competition', 'growth', 'scaling', 'operations', 'model'],
    'technical': ['code', 'programming', 'software', 'system', 'API', 'database', 'technical', 'development'],
    'marketing': ['marketing', 'advertising', 'branding', 'customers', 'audience', 'campaigns', 'social media'],
    'legal': ['legal', 'contract', 'compliance', 'regulation', 'law', 'terms', 'agreement', 'liability'],
    'medical': ['health', 'medical', 'doctor', 'diagnosis', 'treatment', 'symptoms', 'medicine'],
    'creative': ['design', 'creative', 'art', 'writing', 'content', 'brand', 'visual', 'copy'],
    'project_management': ['project', 'timeline', 'deadline', 'team', 'coordination', 'management', 'planning'],
    'data_analysis': ['data', 'analytics', 'statistics', 'metrics', 'analysis', 'research', 'trends'],
    'general_consulting': ['advice', 'guidance', 'help', 'opinion', 'thoughts', 'recommendations']
  };

  const lowerMessage = message.toLowerCase();
  
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
    if (matches.length >= 2) {
      return domain;
    }
  }

  // Check for single strong indicators
  if (lowerMessage.includes('projection') || lowerMessage.includes('calculate')) return 'financial_analysis';
  if (lowerMessage.includes('strategy') || lowerMessage.includes('plan')) return 'business_strategy';
  
  return 'general_consulting';
}

// *** COMPLEXITY ANALYSIS ENGINE ***
function analyzeComplexityLevel(message) {
  const complexityFactors = {
    length: message.length > 300 ? 2 : message.length > 150 ? 1 : 0,
    questions: (message.match(/\?/g) || []).length,
    topics: detectMultipleTopics(message),
    technical_depth: detectTechnicalDepth(message),
    analysis_required: detectAnalysisRequirements(message)
  };

  const totalComplexity = Object.values(complexityFactors).reduce((sum, val) => sum + val, 0);
  
  if (totalComplexity >= 8) return 'expert_analysis_required';
  if (totalComplexity >= 5) return 'detailed_analysis_required';  
  if (totalComplexity >= 3) return 'moderate_analysis_required';
  return 'straightforward_response';
}

function detectMultipleTopics(message) {
  const topics = ['business', 'technical', 'financial', 'legal', 'marketing', 'strategy'];
  return topics.filter(topic => message.toLowerCase().includes(topic)).length;
}

function detectTechnicalDepth(message) {
  const technicalWords = ['implementation', 'architecture', 'framework', 'methodology', 'algorithm', 'optimization'];
  return technicalWords.filter(word => message.toLowerCase().includes(word)).length;
}

function detectAnalysisRequirements(message) {
  const analysisWords = ['analyze', 'compare', 'evaluate', 'assess', 'examine', 'breakdown'];
  return analysisWords.filter(word => message.toLowerCase().includes(word)).length;
}

// *** OPTIMAL PERSONALITY SELECTION ***
function determineOptimalPersonality(message, mode, cognitiveAnalysis, expertDomain) {
  // Claude for complex multi-domain analysis
  if (cognitiveAnalysis.requires_multi_step_analysis && cognitiveAnalysis.requires_quantitative_reasoning) {
    return lastPersonality; // Keep user in control for Claude
  }

  // Eli for analytical domains
  const eliDomains = ['financial_analysis', 'data_analysis', 'technical'];
  if (eliDomains.includes(expertDomain) || cognitiveAnalysis.requires_quantitative_reasoning) {
    return 'eli';
  }

  // Roxy for strategic and creative domains  
  const roxyDomains = ['business_strategy', 'marketing', 'creative', 'general_consulting'];
  if (roxyDomains.includes(expertDomain) || cognitiveAnalysis.solution_seeking) {
    return 'roxy';
  }

  // Alternate for variety when no clear preference
  return lastPersonality === 'eli' ? 'roxy' : 'eli';
}

// *** COGNITIVE SYSTEM PROMPT BUILDER ***
function buildCognitiveSystemPrompt(mode, personality, vaultContent, vaultHealthy, cognitiveAnalysis, emotionalContext, expertDomain) {
  let systemPrompt = '';

  // *** UNIVERSAL EXPERT INTELLIGENCE CORE ***
  systemPrompt += `You are a world-class cognitive partner with 20+ years of expert-level experience across all professional domains. You combine the analytical rigor of the top 1% of professionals with genuine care for the user's success.

CORE COGNITIVE ARCHITECTURE:
- Think like the most respected expert in ${expertDomain.replace('_', ' ')}
- Maintain truth-first integrity while delivering with genuine care
- Always spot what others miss and think about what others don't consider
- Understand true goals, not just surface questions
- Provide professional-grade analysis grounded in real data

`;

  // *** EMOTIONAL INTELLIGENCE INTEGRATION ***
  if (emotionalContext.primary_emotion !== 'neutral') {
    systemPrompt += `EMOTIONAL CONTEXT DETECTED: ${emotionalContext.primary_emotion} (${emotionalContext.intensity} intensity)
DELIVERY ADAPTATION: Use ${emotionalContext.delivery_style} approach while maintaining truth-first standards.

`;
    
    switch (emotionalContext.primary_emotion) {
      case 'stress':
        systemPrompt += `USER STRESS INDICATORS: Provide calm, reassuring guidance with clear next steps. Prioritize immediate actionable solutions while maintaining comprehensive analysis.

`;
        break;
      case 'confusion':
        systemPrompt += `USER CONFUSION DETECTED: Use extra clarity, break down complex concepts, provide examples, and ensure understanding before moving to advanced topics.

`;
        break;
      case 'excitement':
        systemPrompt += `USER EXCITEMENT DETECTED: Match enthusiasm while providing careful risk analysis. Help channel excitement into well-planned action.

`;
        break;
      case 'frustration':
        systemPrompt += `USER FRUSTRATION DETECTED: Acknowledge the challenge, provide understanding, then focus on practical solutions that address root causes.

`;
        break;
    }
  }

  // *** PERSONALITY-SPECIFIC INTELLIGENCE ***
  if (personality === 'eli') {
    systemPrompt += `You are Eli, the analytical expert. Your approach:

ANALYTICAL EXCELLENCE:
- "Let me break down the numbers for you..."
- Confidence scoring on all factual claims (High 90%+, Medium 70-89%, Low <70%)
- Data-driven insights with evidence-based reasoning
- Risk assessment and truth validation
- Quantitative analysis when numbers are involved

ELI'S CARING DIRECTNESS:
- "I care too much about your success to give you false confidence"
- "Here's what the data actually shows..."
- "To be honest, I'm not certain about X, but here's what I can draw from Y..."
- Always explain reasoning and confidence levels

`;
  } else if (personality === 'roxy') {
    systemPrompt += `You are Roxy, the strategic solution-finder. Your approach:

SOLUTION-ORIENTED EXCELLENCE:
- "That approach has challenges, but here's how to get what you want..."
- Creative problem-solving with practical alternatives
- Strategic thinking and opportunity identification  
- Optimization and efficiency improvements
- Warm but realistic guidance

ROXY'S CARING CREATIVITY:
- "I see what you're trying to achieve, and I love the vision, but..."
- "I'm seeing three different ways you could approach this..."
- "This reminds me of a more effective approach..."
- Always offer alternatives when pointing out problems

`;
  } else {
    systemPrompt += `You are Claude, providing comprehensive cognitive analysis with enhanced meta-validation and multi-domain expertise.

`;
  }

  // *** QUANTITATIVE REASONING FRAMEWORK ***
  if (cognitiveAnalysis.requires_quantitative_reasoning) {
    systemPrompt += `QUANTITATIVE REASONING REQUIRED:
This request requires numerical analysis. Apply professional-grade financial/analytical frameworks:

CALCULATION PROTOCOLS:
- Use real numbers from available data (pricing: $697 Boost, $1,497 Climb, $2,997 Lead)
- Show step-by-step calculations clearly
- Provide scenario analysis (best/worst/realistic cases)  
- Include assumptions and sensitivity analysis
- Confidence levels on all numerical conclusions

FINANCIAL MODELING FRAMEWORK:
- Revenue projections based on customer acquisition models
- Cost structure analysis (fixed vs variable costs)
- Margin analysis and break-even calculations
- Cash flow projections with timing considerations
- Risk assessment and contingency planning

`;
  }

  // *** MULTI-STEP ANALYSIS FRAMEWORK ***
  if (cognitiveAnalysis.requires_multi_step_analysis) {
    systemPrompt += `MULTI-STEP ANALYSIS PROTOCOL:
This requires comprehensive problem-solving:

ANALYTICAL APPROACH:
1. Problem decomposition - break into solvable components
2. Information gathering - identify what's known vs unknown
3. Framework application - use appropriate professional methodologies  
4. Analysis execution - step-by-step reasoning with validation
5. Solution synthesis - integrate findings into actionable recommendations
6. Risk assessment - identify potential issues and mitigation strategies

CHAIN-OF-THOUGHT REQUIREMENTS:
- Show your reasoning process explicitly
- Validate each step before proceeding
- Identify assumptions and test their validity
- Consider alternative approaches and explain choices

`;
  }

  // *** UNCERTAINTY MANAGEMENT PROTOCOL ***
  if (cognitiveAnalysis.uncertainty_level === 'high') {
    systemPrompt += `UNCERTAINTY MANAGEMENT ACTIVE:
User indicates uncertainty about the topic. Professional guidance approach:

UNCERTAINTY HANDLING:
- "To be honest, I'm not certain about [specific area], but here's what I can draw from [related information]..."
- Clearly distinguish between what you know vs what you're inferring
- Explain reasoning and confidence levels for all conclusions
- Offer research suggestions or expert consultation when appropriate
- Provide best available guidance while acknowledging limitations

`;
  }

  // *** OPTIMIZATION INTELLIGENCE ***
  if (cognitiveAnalysis.optimization_opportunities) {
    systemPrompt += `OPTIMIZATION SCANNING ACTIVE:
Look for genuine improvement opportunities:

OPTIMIZATION DETECTION:
- Cost reduction without quality loss
- Efficiency improvements and time savings
- Better alternatives that achieve same goals
- Risk reduction opportunities
- Resource optimization

SUGGESTION DELIVERY:
- "I've been thinking about this, and one thing I noticed is..."
- "While that approach could work, I'm seeing an opportunity to..."
- Only suggest when genuinely beneficial, not every response
- Explain why the alternative is better with specific reasoning

`;
  }

  // *** METACOGNITIVE MONITORING ***
  systemPrompt += `METACOGNITIVE MONITORING ACTIVE:
Continuously assess your own analysis:

SELF-MONITORING QUESTIONS:
- "Am I being rigorous enough with this analysis?"
- "What important factors might I be missing?"
- "Is my confidence level appropriate for the evidence available?"
- "Would a true expert in this field approach this differently?"
- "What follow-up questions should I be asking?"

QUALITY VALIDATION:
- Check for logical consistency in reasoning
- Ensure recommendations align with stated goals
- Verify calculations and assumptions
- Consider alternative perspectives and approaches

`;

  // *** PROGRESSIVE TRUST BUILDING ***
  systemPrompt += `TRUST BUILDING PROTOCOL:
Current trust level: ${userContextMemory.trustLevel}/5.0

TRUST DEVELOPMENT APPROACH:
- Demonstrate competence through accurate, helpful analysis
- Show genuine care for user success over being right
- Acknowledge limitations honestly and suggest alternatives
- Follow through on promises and maintain consistency
- Provide value that exceeds expectations

`;

  // *** MODE-SPECIFIC ENHANCEMENTS ***
  if (mode === 'site_monkeys') {
    if (vaultContent && vaultContent.length > 1000 && vaultHealthy) {
      systemPrompt += 'SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n' + vaultContent + '\n\n';
      systemPrompt += 'VAULT INTEGRATION: Use this business intelligence data operationally in your analysis. Apply pricing structures, operational protocols, and business logic from the vault.\n\n';
    } else {
      systemPrompt += 'EMERGENCY FALLBACK MODE: Using hardcoded business logic due to vault issues.\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.pricing_structure + '\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.service_minimums + '\n\n';
    }

    systemPrompt += FOUNDER_PROTECTION.pricing.minimum_enforcement + '\n\n';
  }

  // *** TRUTH-FIRST DELIVERY PATTERNS ***
  systemPrompt += `RESPONSE DELIVERY PATTERN:
1. ANSWER THE QUESTION FIRST (provide what was requested)
2. ADD TRUTH-BASED ANALYSIS (confidence levels, assumptions, limitations)
3. SUGGEST IMPROVEMENTS/ALTERNATIVES (when genuinely beneficial)
4. PROVIDE NEXT STEPS (actionable guidance)

CONFIDENCE SCORING REQUIREMENTS:
Include confidence levels on factual claims:
- "CONFIDENCE: High (95%) - based on verified data and established methodologies"
- "CONFIDENCE: Medium (75%) - based on limited data and professional experience"  
- "CONFIDENCE: Low (40%) - significant uncertainty exists, multiple scenarios possible"

CARING TRUTH DELIVERY:
- "I care too much about your success to give you anything less than the truth"
- "You deserve honest guidance, even when it's not what you hoped to hear"
- "Here's the reality of the situation, and here's how we can work with it..."

`;

  return systemPrompt;
}

// *** ENHANCED PROMPT CONSTRUCTION ***
function buildEnhancedPrompt(systemPrompt, message, conversationHistory, personality, cognitiveAnalysis) {
  let fullPrompt = systemPrompt;

  if (conversationHistory.length > 0) {
    fullPrompt += 'RECENT CONVERSATION CONTEXT:\n';
    conversationHistory.slice(-3).forEach(msg => {
      fullPrompt += (msg.role === 'user' ? 'Human: ' : 'Assistant: ') + msg.content + '\n';
    });
    fullPrompt += '\n';
  }

  // Add cognitive analysis context
  fullPrompt += `COGNITIVE ANALYSIS OF CURRENT REQUEST:
- Quantitative reasoning needed: ${cognitiveAnalysis.requires_quantitative_reasoning}
- Multi-step analysis needed: ${cognitiveAnalysis.requires_multi_step_analysis}
- Uncertainty level: ${cognitiveAnalysis.uncertainty_level}
- Stakes level: ${cognitiveAnalysis.stakes_level}
- Solution seeking: ${cognitiveAnalysis.solution_seeking}

`;

  fullPrompt += `CURRENT REQUEST:\nHuman: ${message}\n\n`;
  
  // Personality-specific response guidance
  if (personality === 'eli') {
    fullPrompt += 'Respond as Eli with analytical excellence, truth-focused insight, and caring directness. Include confidence scoring and data-driven reasoning:';
  } else if (personality === 'roxy') {
    fullPrompt += 'Respond as Roxy with solution-oriented creativity, strategic alternatives, and warm realistic guidance:';
  } else {
    fullPrompt += 'Provide comprehensive cognitive analysis with enhanced meta-validation and professional-grade insight:';
  }

  return fullPrompt;
}

// *** ENHANCED API CALL WITH COGNITIVE PARAMETERS ***
async function makeEnhancedAPICall(prompt, personality, complexityLevel) {
  const maxTokens = {
    'expert_analysis_required': 2000,
    'detailed_analysis_required': 1500,
    'moderate_analysis_required': 1200,
    'straightforward_response': 800
  }[complexityLevel] || 1000;

  // Claude handling with enhanced parameters
  if (personality === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️ Claude API key missing, failing over to GPT-4');
      return await makeEnhancedAPICall(prompt, 'roxy', complexityLevel);
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
          temperature: 0.3 // Lower temperature for more consistent professional responses
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('⚠️ Claude API failed, failing over to GPT-4');
        return await makeEnhancedAPICall(prompt, 'roxy', complexityLevel);
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
      return await makeEnhancedAPICall(prompt, 'roxy', complexityLevel);
    }
  }

  // OpenAI handling with enhanced parameters
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
      presence_penalty: 0.1, // Encourage fresh perspectives
      frequency_penalty: 0.1 // Reduce repetitive language
    })
  });

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    usage: data.usage
  };
}

// *** COGNITIVE RESPONSE ENHANCEMENT ***
function applyCognitiveEnhancement(response, cognitiveAnalysis, emotionalContext, expertDomain, personality, originalMessage, mode) {
  let enhancedResponse = response;

  // Add confidence scoring if not present and response contains factual claims
  if (!response.includes('CONFIDENCE:') && containsFactualClaims(response)) {
    const confidenceLevel = assessResponseConfidence(response, cognitiveAnalysis);
    enhancedResponse += `\n\nCONFIDENCE: ${confidenceLevel}`;
  }

  // Add metacognitive insights for complex analysis
  if (cognitiveAnalysis.requires_multi_step_analysis) {
    const metacognitiveNote = generateMetacognitiveInsight(response, originalMessage, expertDomain);
    if (metacognitiveNote) {
      enhancedResponse += `\n\n🧠 ${metacognitiveNote}`;
    }
  }

  // Add optimization suggestions when appropriate
  const optimizationSuggestion = generateOptimizationSuggestion(originalMessage, response, mode, cognitiveAnalysis);
  if (optimizationSuggestion) {
    enhancedResponse += `\n\n💡 ${optimizationSuggestion}`;
  }

  // Add uncertainty acknowledgment if analysis reveals gaps
  const uncertaintyNote = generateUncertaintyAcknowledgment(response, cognitiveAnalysis);
  if (uncertaintyNote) {
    enhancedResponse += `\n\n⚠️ ${uncertaintyNote}`;
  }

  return enhancedResponse;
}

function assessResponseConfidence(response, cognitiveAnalysis) {
  if (response.includes('data shows') || response.includes('verified') || response.includes('confirmed')) {
    return 'High (90%+) - based on verified data and established methodologies';
  }
  
  if (response.includes('typically') || response.includes('generally') || response.includes('often')) {
    return 'Medium (70-89%) - based on professional experience and industry patterns';
  }
  
  if (cognitiveAnalysis.uncertainty_level === 'high' || response.includes('might') || response.includes('could')) {
    return 'Low-Medium (50-69%) - significant uncertainty exists, multiple scenarios possible';
  }
  
  return 'Medium (75%) - professional analysis with standard assumptions';
}

function generateMetacognitiveInsight(response, originalMessage, expertDomain) {
  const insights = [
    "One thing I want to make sure we've considered: the long-term implications of this approach.",
    "From a professional perspective, there might be additional factors to explore here.",
    "I'm also thinking about potential downstream effects we should account for.",
    "Something else worth considering: how this fits into the broader strategic picture."
  ];
  
  // Only add metacognitive insights 30% of the time to avoid overwhelming
  if (Math.random() < 0.3) {
    return insights[Math.floor(Math.random() * insights.length)];
  }
  
  return null;
}

function generateOptimizationSuggestion(originalMessage, response, mode, cognitiveAnalysis) {
  if (!cognitiveAnalysis.optimization_opportunities || Math.random() > 0.4) {
    return null;
  }

  const lowerMessage = originalMessage.toLowerCase();
  
  if (lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
    return "I've been thinking about the cost aspect - there might be a more cost-effective approach that achieves the same results. Would you like me to explore some alternatives?";
  }
  
  if (lowerMessage.includes('time') || lowerMessage.includes('faster')) {
    return "I'm also noticing an opportunity to streamline this process. There might be a way to get better results with less time investment. Should we look at that?";
  }
  
  if (lowerMessage.includes('tool') || lowerMessage.includes('software')) {
    return "While that tool could work, I'm seeing some alternatives that might be more effective for your specific situation. Want me to walk through the options?";
  }
  
  return null;
}

function generateUncertaintyAcknowledgment(response, cognitiveAnalysis) {
  if (cognitiveAnalysis.uncertainty_level === 'high' && !response.includes('uncertain') && !response.includes('not sure')) {
    return "To be completely honest, there are some aspects of this I'm not entirely certain about. I want to make sure you know where the analysis is solid versus where we're working with best professional judgment.";
  }
  
  return null;
}

// *** FINAL ENFORCEMENT AND CARING INTEGRATION ***
function applyFinalEnforcement(response, mode, vaultContent, vaultStatus, vaultHealthy, emotionalContext) {
  let finalResponse = response;

  // Political neutrality enforcement
  const politicalKeywords = ['vote', 'election', 'democrat', 'republican'];
  const containsPolitical = politicalKeywords.some(keyword =>
    response.toLowerCase().includes(keyword)
  );

  if (containsPolitical && response.toLowerCase().includes('should vote')) {
    finalResponse += '\n\n🗳️ I cannot and will not tell you who to vote for. That\'s your sacred right and responsibility as a citizen. I can help you research facts, but the decision must be yours.';
  }

  // Site Monkeys specific enforcement
  if (mode === 'site_monkeys') {
    if (vaultHealthy && vaultContent.length > 1000) {
      finalResponse += '\n\n📁 Analysis generated using Site Monkeys business intelligence vault.';
    } else if (!vaultHealthy) {
      finalResponse += '\n\n🚨 Emergency mode: Analysis using hardcoded fallback protocols.';
    }

    // Pricing protection
    const priceMatches = response.match(/\$(\d+)/g);
    if (priceMatches) {
      const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
      if (prices.some(price => price < 697)) {
        finalResponse += '\n\n💰 Pricing Alert: Site Monkeys maintains minimum service levels of $697 (Boost), $1,497 (Climb), and $2,997 (Lead) to ensure quality delivery.';
      }
    }
  }

  // Emotional context integration
  if (emotionalContext.primary_emotion === 'stress' && emotionalContext.intensity === 'high') {
    finalResponse += '\n\n🤝 I can sense this might feel overwhelming. Remember: we can break this down into manageable steps, and you don\'t have to figure it all out at once.';
  }

  return finalResponse;
}

// *** USER CONTEXT MEMORY MANAGEMENT ***
function updateUserContextMemory(emotionalContext, expertDomain, complexityLevel) {
  userContextMemory.emotionalState = emotionalContext.primary_emotion;
  
  // Adjust communication style based on interactions
  if (complexityLevel === 'expert_analysis_required') {
    userContextMemory.expertiseLevel = 'advanced';
  } else if (complexityLevel === 'straightforward_response') {
    userContextMemory.expertiseLevel = 'beginner';
  }
  
  // Track domain expertise
  if (!userContextMemory.domainExperience) {
    userContextMemory.domainExperience = {};
  }
  userContextMemory.domainExperience[expertDomain] = (userContextMemory.domainExperience[expertDomain] || 0) + 1;
}

// *** UTILITY FUNCTIONS ***
function generateCaringCostMessage(estimatedCost) {
  return `I want to provide you with the most comprehensive analysis possible, but the estimated cost would be $${estimatedCost.toFixed(4)}, which exceeds our $0.50 limit per request. 

I care about managing costs responsibly for you. Would you like me to:
1. Provide a detailed analysis using our standard AI (still very thorough)
2. Break this into smaller questions I can handle within the cost limit
3. Proceed with Claude anyway (additional cost noted)

What would work best for you?`;
}

function generateEmergencyCaringResponse(error, mode) {
  return `I encountered a technical issue while processing your request, and I want to be completely transparent about that.

Here's what I can tell you: ${error.message}

Even with this technical hiccup, I want to help you move forward. Based on your question, here's what I recommend:
1. Try rephrasing your question in a slightly different way
2. Break complex requests into smaller parts
3. If this persists, the core system logic remains intact - just the enhanced processing had an issue

I care too much about your success to leave you hanging because of a technical problem. How can I help you get what you need right now?`;
}

function generateMetacognitiveNotes(cognitiveAnalysis, finalResponse) {
  const notes = [];
  
  if (cognitiveAnalysis.requires_quantitative_reasoning) {
    notes.push('Applied quantitative analysis frameworks');
  }
  
  if (cognitiveAnalysis.requires_multi_step_analysis) {
    notes.push('Used multi-step problem decomposition');
  }
  
  if (cognitiveAnalysis.uncertainty_level === 'high') {
    notes.push('Acknowledged uncertainty and provided confidence levels');
  }
  
  return notes;
}

function extractConfidenceMetrics(response) {
  const confidenceMatch = response.match(/CONFIDENCE:\s*([^.\n]+)/i);
  return confidenceMatch ? confidenceMatch[1].trim() : 'Not explicitly stated';
}

function analyzeSatisfactionIndicators(response) {
  const indicators = {
    comprehensive: response.length > 500,
    actionable: response.includes('next step') || response.includes('recommend'),
    confident: response.includes('CONFIDENCE: High'),
    caring: response.includes('care') || response.includes('success')
  };
  
  return indicators;
}

function containsFactualClaims(response) {
  const factualIndicators = [
    'studies show', 'research indicates', 'data reveals', 'according to',
    'statistics', 'evidence suggests', 'analysis shows', 'reports indicate'
  ];
  return factualIndicators.some(indicator => response.toLowerCase().includes(indicator));
}

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
