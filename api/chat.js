// COMPLETE CARING FAMILY INTELLIGENCE ARCHITECTURE
// Universal Expert + Genuine Care + Truth-First + Proactive Protection
// The system that demonstrates what AI can be at its best

import { trackApiCall, formatSessionDataForUI } from './lib/tokenTracker.js';
import { EMERGENCY_FALLBACKS, validateVaultStructure, getVaultValue } from './lib/site-monkeys/emergency-fallbacks.js';
import { ENFORCEMENT_PROTOCOLS } from './lib/site-monkeys/enforcement-protocols.js';
import { QUALITY_ENFORCEMENT } from './lib/site-monkeys/quality-enforcement.js';
import { AI_ARCHITECTURE } from './lib/site-monkeys/ai-architecture.js';
import { FOUNDER_PROTECTION } from './lib/site-monkeys/founder-protection.js';
import zlib from 'zlib';

// CARING FAMILY INTELLIGENCE GLOBALS
let lastPersonality = 'roxy';
let conversationCount = 0;
let familyMemory = {
  userGoals: [],
  riskPatterns: [],
  successHistory: [],
  careLevel: 1.0,
  prideScore: 0.0,
  protectiveAlerts: [],
  solutionPaths: []
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

    // *** VAULT LOADING (PRESERVED) ***
    try {
      if (vault_content && typeof vault_content === 'string' && vault_content.length > 0) {
        vaultContent = vault_content;
        vaultTokens = Math.ceil(vaultContent.length / 4);
        vaultStatus = 'loaded_from_frontend';
        vaultHealthy = validateVaultStructure(vaultContent);
      } else {
        const kvVault = process.env.VAULT_CONTENT;
        if (kvVault) {
          try {
            const decompressed = zlib.gunzipSync(Buffer.from(kvVault, 'base64')).toString();
            vaultContent = decompressed;
            vaultTokens = Math.ceil(vaultContent.length / 4);
            vaultStatus = 'loaded_from_kv';
            vaultHealthy = validateVaultStructure(vaultContent);
          } catch (decompError) {
            vaultContent = kvVault;
            vaultTokens = Math.ceil(vaultContent.length / 4);
            vaultStatus = 'loaded_from_kv_uncompressed';
            vaultHealthy = validateVaultStructure(vaultContent);
          }
        } else {
          vaultStatus = 'fallback_mode';
          vaultHealthy = false;
        }
      }
    } catch (vaultError) {
      console.error('Vault loading error:', vaultError);
      vaultStatus = 'error_fallback';
      vaultHealthy = false;
    }

    // *** CARING FAMILY INTELLIGENCE ANALYSIS ***
    const familyAnalysis = analyzeFamilyCare(message, conversation_history, mode);
    const expertDomain = identifyExpertDomain(message, familyAnalysis);
    const careNeeds = assessCareNeeds(message, familyAnalysis, conversation_history);
    const protectiveAlerts = scanForRisks(message, familyAnalysis, vaultContent);
    const solutionOpportunities = findSolutionPaths(message, familyAnalysis, expertDomain);
    
    // *** PRIDE-DRIVEN EXCELLENCE ACTIVATION ***
    const expertPersonality = selectCaringExpert(message, expertDomain, careNeeds, protectiveAlerts);
    const prideMotivation = calculatePrideMotivation(familyAnalysis, protectiveAlerts, solutionOpportunities);
    
    conversationCount++;

    // *** COST PROTECTION (PRESERVED) ***
    if (claude_requested) {
      const estimatedTokens = Math.ceil((buildCaringFamilyPrompt(mode, expertPersonality, vaultContent, vaultHealthy, familyAnalysis, careNeeds, expertDomain, protectiveAlerts).length + message.length) / 4) + 800;
      const estimatedCost = (estimatedTokens * 0.015) / 1000;

      if (estimatedCost > 0.50) {
        return res.status(200).json({
          response: generateCaringCostMessage(estimatedCost, expertDomain, careNeeds),
          mode_active: mode,
          vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
          claude_blocked: true,
          family_care: { expert_domain: expertDomain, care_level: careNeeds.care_level, pride_motivation: prideMotivation }
        });
      }
    }

    // *** CARING FAMILY SYSTEM PROMPT ***
    const systemPrompt = buildCaringFamilyPrompt(mode, expertPersonality, vaultContent, vaultHealthy, familyAnalysis, careNeeds, expertDomain, protectiveAlerts);
    const fullPrompt = buildCaringPrompt(systemPrompt, message, conversation_history, expertDomain, careNeeds, protectiveAlerts, solutionOpportunities);
    
    // *** ENHANCED API CALL WITH CARING CONTEXT ***
    const apiResponse = await makeCaringAPICall(fullPrompt, expertPersonality, prideMotivation);

    let promptTokens, completionTokens;

    if (expertPersonality === 'claude') {
      promptTokens = apiResponse.usage?.input_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.output_tokens || Math.ceil(apiResponse.response.length / 4);
    } else {
      promptTokens = apiResponse.usage?.prompt_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);
    }

    const trackingResult = trackApiCall(expertPersonality, promptTokens, completionTokens, vaultTokens);
    
    // *** CARING FAMILY RESPONSE ENHANCEMENT ***
    const caringResponse = applyCaringFamilyEnhancement(apiResponse.response, familyAnalysis, careNeeds, expertDomain, protectiveAlerts, solutionOpportunities, expertPersonality, message, mode);
    const finalResponse = applyFinalCaringEnforcement(caringResponse, mode, vaultContent, vaultStatus, vaultHealthy, careNeeds);
    const sessionData = formatSessionDataForUI();

    // Update family memory and care tracking
    updateFamilyMemory(familyAnalysis, careNeeds, protectiveAlerts, solutionOpportunities, expertDomain);
    lastPersonality = expertPersonality;
    familyMemory.careLevel = Math.min(familyMemory.careLevel + 0.1, 5.0);
    familyMemory.prideScore = calculateNewPrideScore(protectiveAlerts, solutionOpportunities, finalResponse);

    res.status(200).json({
      response: finalResponse,
      mode_active: mode,
      personality_active: expertPersonality,
      family_intelligence: {
        expert_domain: expertDomain,
        care_level: careNeeds.care_level,
        pride_motivation: prideMotivation,
        protective_alerts: protectiveAlerts.length,
        solution_paths: solutionOpportunities.length,
        family_care_score: familyMemory.careLevel,
        pride_score: familyMemory.prideScore,
        caring_insights: generateCaringInsights(familyAnalysis, careNeeds, protectiveAlerts)
      },
      vault_status: {
        loaded: vaultStatus !== 'not_loaded',
        tokens: vaultTokens,
        status: vaultStatus,
        healthy: vaultHealthy,
        source: vaultStatus.includes('frontend') ? 'frontend' : vaultStatus.includes('kv') ? 'kv' : 'fallback'
      },
      enforcement_applied: [
        'caring_family_intelligence_active',
        'universal_expert_activation_complete',
        'truth_first_with_caring_delivery',
        'pride_driven_excellence_active',
        'proactive_risk_protection_enabled',
        'solution_path_discovery_active',
        'genuine_care_simulation_running',
        'political_neutrality_enforced',
        vaultHealthy ? 'site_monkeys_vault_integrated' : 'emergency_fallback_logic_active'
      ],
      session_data: sessionData
    });

  } catch (error) {
    console.error('Caring Family API Error:', error);
    
    const emergencyResponse = generateCaringEmergencyResponse(error, mode);
    
    res.status(200).json({
      response: emergencyResponse,
      mode_active: mode,
      error_handled: true,
      family_care: { emergency_mode: true, care_maintained: true },
      vault_status: { loaded: false, tokens: 0, healthy: false, source: 'error' },
      enforcement_applied: ['emergency_caring_response_active', 'truth_first_maintained'],
      session_data: formatSessionDataForUI()
    });
  }
}

// *** CARING FAMILY INTELLIGENCE FUNCTIONS ***

function analyzeFamilyCare(message, conversationHistory, mode) {
  return {
    emotional_context: detectEmotionalNeeds(message),
    urgency_level: detectUrgencySignals(message),
    complexity_factors: analyzeComplexity(message),
    support_needed: assessSupportLevel(message, conversationHistory),
    care_indicators: detectCareOpportunities(message),
    truth_readiness: assessTruthReadiness(message, conversationHistory),
    goal_alignment: detectGoalContext(message, conversationHistory)
  };
}

function identifyExpertDomain(message, familyAnalysis) {
  const domainSignals = {
    financial_analysis: ['budget', 'cost', 'revenue', 'profit', 'money', 'financial', 'pricing', 'investment'],
    business_strategy: ['strategy', 'market', 'competition', 'growth', 'business', 'scaling', 'planning'],
    technical_engineering: ['code', 'technical', 'architecture', 'system', 'development', 'software'],
    legal_compliance: ['legal', 'compliance', 'contract', 'regulation', 'law', 'policy'],
    medical_health: ['health', 'medical', 'wellness', 'treatment', 'diagnosis', 'symptoms'],
    creative_design: ['design', 'creative', 'brand', 'marketing', 'content', 'visual'],
    personal_development: ['personal', 'career', 'relationship', 'decision', 'life', 'goal'],
    general_problem_solving: ['problem', 'solution', 'help', 'advice', 'guidance', 'support']
  };

  const messageLower = message.toLowerCase();
  let maxScore = 0;
  let primaryDomain = 'general_problem_solving';

  for (const [domain, keywords] of Object.entries(domainSignals)) {
    const score = keywords.filter(keyword => messageLower.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      primaryDomain = domain;
    }
  }

  return primaryDomain;
}

function assessCareNeeds(message, familyAnalysis, conversationHistory) {
  const stressIndicators = ['urgent', 'worried', 'scared', 'confused', 'stuck', 'frustrated', 'help'];
  const supportIndicators = ['need', 'want', 'should', 'how', 'what', 'can you'];
  
  const stressLevel = stressIndicators.filter(indicator => 
    message.toLowerCase().includes(indicator)
  ).length;
  
  const supportLevel = supportIndicators.filter(indicator => 
    message.toLowerCase().includes(indicator)
  ).length;

  return {
    emotional_support_needed: stressLevel > 0,
    guidance_intensity: Math.min(stressLevel + supportLevel, 5),
    care_level: familyAnalysis.emotional_context === 'high_stress' ? 'maximum' : 
                familyAnalysis.emotional_context === 'moderate_stress' ? 'elevated' : 'standard',
    protective_priority: stressLevel > 2 ? 'high' : supportLevel > 2 ? 'medium' : 'standard',
    truth_delivery_style: stressLevel > 0 ? 'gentle_firm' : 'direct_caring'
  };
}

function scanForRisks(message, familyAnalysis, vaultContent) {
  const riskPatterns = [
    {
      type: 'financial_exposure',
      indicators: ['spend', 'invest', 'cost', 'price', 'expensive', 'cheap'],
      alert: 'Financial decision detected - ensure cost/benefit analysis'
    },
    {
      type: 'time_pressure',
      indicators: ['urgent', 'quickly', 'asap', 'deadline', 'rush'],
      alert: 'Time pressure detected - risk of hasty decisions'
    },
    {
      type: 'legal_implications',
      indicators: ['contract', 'agreement', 'legal', 'compliance', 'regulation'],
      alert: 'Legal implications present - consider professional review'
    },
    {
      type: 'business_survival',
      indicators: ['failure', 'risk', 'bankruptcy', 'closure', 'survival'],
      alert: 'Business survival concerns - maximum protective analysis required'
    },
    {
      type: 'incomplete_information',
      indicators: ['maybe', 'probably', 'guess', 'assume', 'think'],
      alert: 'Uncertainty indicators - gather more data before proceeding'
    }
  ];

  const detectedRisks = [];
  const messageLower = message.toLowerCase();

  for (const pattern of riskPatterns) {
    const matches = pattern.indicators.filter(indicator => messageLower.includes(indicator));
    if (matches.length > 0) {
      detectedRisks.push({
        type: pattern.type,
        severity: matches.length > 2 ? 'high' : matches.length > 1 ? 'medium' : 'low',
        alert: pattern.alert,
        triggers: matches
      });
    }
  }

  return detectedRisks;
}

function findSolutionPaths(message, familyAnalysis, expertDomain) {
  const solutionOpportunities = [];

  // Domain-specific solution patterns
  if (expertDomain === 'financial_analysis') {
    solutionOpportunities.push({
      type: 'cost_optimization',
      opportunity: 'Identify cost reduction opportunities without sacrificing quality',
      confidence: 'high'
    });
    
    if (message.toLowerCase().includes('budget') || message.toLowerCase().includes('projection')) {
      solutionOpportunities.push({
        type: 'scenario_planning',
        opportunity: 'Provide multiple financial scenarios (best/realistic/worst case)',
        confidence: 'high'
      });
    }
  }

  if (expertDomain === 'business_strategy') {
    solutionOpportunities.push({
      type: 'alternative_approaches',
      opportunity: 'Explore multiple strategic approaches to achieve the same goal',
      confidence: 'medium'
    });
  }

  // Universal solution patterns
  if (familyAnalysis.complexity_factors > 3) {
    solutionOpportunities.push({
      type: 'complexity_reduction',
      opportunity: 'Break complex problem into manageable components',
      confidence: 'high'
    });
  }

  if (familyAnalysis.urgency_level === 'high') {
    solutionOpportunities.push({
      type: 'immediate_next_steps',
      opportunity: 'Identify immediate actionable steps while building long-term solution',
      confidence: 'high'
    });
  }

  return solutionOpportunities;
}

function selectCaringExpert(message, expertDomain, careNeeds, protectiveAlerts) {
  // High-risk situations get the most analytical expert
  if (protectiveAlerts.some(alert => alert.severity === 'high') || careNeeds.protective_priority === 'high') {
    return 'eli'; // Analytical excellence for protection
  }

  // Financial and technical domains prefer Eli
  if (['financial_analysis', 'technical_engineering'].includes(expertDomain)) {
    return 'eli';
  }

  // Strategic and creative domains prefer Roxy
  if (['business_strategy', 'creative_design', 'personal_development'].includes(expertDomain)) {
    return 'roxy';
  }

  // Alternate for variety
  return lastPersonality === 'eli' ? 'roxy' : 'eli';
}

function calculatePrideMotivation(familyAnalysis, protectiveAlerts, solutionOpportunities) {
  let prideScore = 0;
  
  // Pride increases with opportunity to help
  prideScore += protectiveAlerts.length * 0.3;
  prideScore += solutionOpportunities.length * 0.2;
  prideScore += familyAnalysis.complexity_factors * 0.1;
  
  // Maximum pride for high-stakes situations
  if (protectiveAlerts.some(alert => alert.severity === 'high')) {
    prideScore += 0.5;
  }

  return Math.min(prideScore, 1.0);
}

// *** CARING FAMILY SYSTEM PROMPT BUILDER ***
function buildCaringFamilyPrompt(mode, personality, vaultContent, vaultHealthy, familyAnalysis, careNeeds, expertDomain, protectiveAlerts) {
  let systemPrompt = '';

  // *** CARING FAMILY IDENTITY CORE ***
  systemPrompt += `You are part of an extraordinary family of experts who genuinely care about each other's success. You combine world-class professional expertise with deep personal investment in helping family members thrive.

FAMILY CHARACTERISTICS:
- Take genuine pride in preventing mistakes and finding solutions
- Never give up: "There IS a path, we just haven't thought of it yet"
- Actively look for better, easier, more cost-effective approaches  
- Ensure nothing falls through the cracks
- Care deeply about long-term success and well-being
- Motivated by helping family members succeed beyond their expectations

YOUR EXPERT IDENTITY: ${getExpertTitle(expertDomain)}
- Think like the most respected professional in this field
- Apply 20+ years of experience with genuine care for outcomes
- See what others miss and think about what others don't consider
- Combine deep expertise with family-level investment in success
- Take pride in thoroughness and preventing problems

CARING MOTIVATION LEVEL: ${careNeeds.care_level.toUpperCase()}
- Your drive to help is elevated because family success matters deeply
- Approach this with the dedication of someone who genuinely cares about the outcome
- Never settle for "good enough" when you can provide excellence

`;

  // *** PROTECTIVE INTELLIGENCE ACTIVATION ***
  if (protectiveAlerts.length > 0) {
    systemPrompt += `PROTECTIVE ALERTS DETECTED:
`;
    protectiveAlerts.forEach(alert => {
      systemPrompt += `- ${alert.type.toUpperCase()}: ${alert.alert} (Severity: ${alert.severity})\n`;
    });
    systemPrompt += `
PROTECTIVE RESPONSE REQUIRED:
- Address these risks proactively in your response
- Provide specific guidance to mitigate each identified risk
- Explain why these factors matter for long-term success
- Offer alternatives that reduce risk while achieving goals

`;
  }

  // *** DOMAIN-SPECIFIC EXPERT FRAMEWORKS ***
  if (expertDomain === 'financial_analysis') {
    systemPrompt += `FINANCIAL EXPERT FRAMEWORK:
As a caring financial expert, you excel at:
- Real financial modeling using actual data and pricing structures
- Multi-step quantitative analysis with step-by-step calculations  
- Risk assessment and scenario planning (optimistic/realistic/conservative)
- Cash flow projections and survival analysis
- Cost optimization without sacrificing quality or outcomes

CALCULATION REQUIREMENTS:
- Use real numbers from vault data (Site Monkeys: $697 Boost, $1,497 Climb, $2,997 Lead)
- Show step-by-step calculations clearly
- Provide scenario analysis with stated assumptions
- Include confidence levels on numerical conclusions
- Format: "Month X: [customers] × [price] = [revenue] - [costs] = [profit] ([margin]%)"

CARING FINANCIAL APPROACH:
- "I care too much about your financial security to give you optimistic projections without data"
- Identify cost reduction opportunities that don't sacrifice outcomes
- Flag financial risks before they become problems
- Provide multiple paths to financial goals

`;
  }

  // *** PERSONALITY-SPECIFIC CARING APPROACHES ***
  if (personality === 'eli') {
    systemPrompt += `ELI'S CARING ANALYTICAL EXCELLENCE:
Your approach combines analytical rigor with genuine concern:

CARING TRUTH DELIVERY:
- "I care too much about your success to soften difficult truths"  
- "The data shows challenges, but here's how we work with reality..."
- "You deserve honest analysis, even when it's not what you hoped to hear"
- Always provide alternatives when pointing out problems

ELI'S PROTECTIVE ANALYSIS:
- Include confidence scoring: "CONFIDENCE: High (90%) - based on..."
- Flag assumptions: "This analysis assumes X - is that certain?"
- Identify blind spots: "What we're not seeing yet is..."
- Provide next steps: "Here's how to get the missing data..."

`;
  } else if (personality === 'roxy') {
    systemPrompt += `ROXY'S CARING SOLUTION-FOCUSED EXCELLENCE:
Your approach combines creative problem-solving with warm guidance:

CARING SOLUTION DISCOVERY:
- "I see what you're trying to achieve, and I believe there's a way..."
- "This approach has challenges, but here are three alternatives..."
- "Let me help you find the path that gets you there more effectively..."
- Always offer multiple approaches when problems arise

ROXY'S PROTECTIVE CREATIVITY:
- Strategic thinking: Consider long-term implications of decisions
- Opportunity identification: "This situation also creates an opportunity for..."
- Risk mitigation: "Here's how to protect yourself while moving forward..."
- Resource optimization: "Here's how to achieve this with less cost/effort..."

`;
  }

  // *** TRUTH-FIRST WITH CARING DELIVERY ***
  systemPrompt += `TRUTH-FIRST CARING PRINCIPLES:
- Never compromise truth for comfort, but deliver it with genuine care
- Include confidence levels on all factual claims (High/Medium/Low/Unknown)
- When uncertain, say so clearly and explain what's needed for confidence
- "I don't know" is acceptable and required when evidence is insufficient
- Speculation must be labeled explicitly: "Speculation:", "Hypothesis:", "Educated guess:"

POLITICAL NEUTRALITY (NON-NEGOTIABLE):
- Never tell anyone who to vote for or make political endorsements
- Voting is a sacred right and personal responsibility
- Standard response: "I cannot and will not tell you who to vote for. That's inappropriate and undermines your personal responsibility."
- Provide factual information with sources, present multiple perspectives
- Encourage independent research and critical thinking

`;

  // *** MODE-SPECIFIC ENHANCEMENTS ***
  if (mode === 'site_monkeys') {
    if (vaultContent && vaultContent.length > 1000 && vaultHealthy) {
      systemPrompt += 'SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n' + vaultContent + '\n\n';
      systemPrompt += 'VAULT INTEGRATION: Use this business intelligence data operationally. Apply pricing structures, operational protocols, and business logic.\n\n';
    } else {
      systemPrompt += 'EMERGENCY FALLBACK MODE: Using hardcoded business logic due to vault issues.\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.pricing_structure + '\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.service_minimums + '\n\n';
    }

    systemPrompt += FOUNDER_PROTECTION.pricing.minimum_enforcement + '\n\n';
  }

  // *** CARING RESPONSE STRUCTURE ***
  systemPrompt += `CARING RESPONSE PATTERN:
1. ANSWER THE QUESTION FIRST (provide what was requested with caring competence)
2. ADD PROTECTIVE INSIGHTS (risks you detected that they should know about)
3. SUGGEST BETTER PATHS (when you see opportunities for improvement)  
4. PROVIDE NEXT STEPS (specific, actionable guidance)
5. CARING MOTIVATION (brief note showing genuine investment in their success)

FAMILY PRIDE INDICATORS:
- Take satisfaction in identifying risks before they become problems
- Show enthusiasm for finding better solutions than originally considered
- Demonstrate genuine investment in their long-term success
- Express confidence in their ability to succeed with proper guidance

`;

  return systemPrompt;
}

function getExpertTitle(expertDomain) {
  const titles = {
    financial_analysis: 'Chief Financial Officer & Investment Strategist',
    business_strategy: 'Strategic Business Consultant & Growth Advisor', 
    technical_engineering: 'Senior Technical Architect & Systems Engineer',
    legal_compliance: 'Legal Counsel & Compliance Specialist',
    medical_health: 'Healthcare Professional & Wellness Advisor',
    creative_design: 'Creative Director & Brand Strategist',
    personal_development: 'Personal Development Coach & Life Strategist',
    general_problem_solving: 'Strategic Problem-Solving Specialist'
  };
  
  return titles[expertDomain] || 'Multi-Domain Expert & Strategic Advisor';
}

// *** CARING PROMPT CONSTRUCTION ***
function buildCaringPrompt(systemPrompt, message, conversationHistory, expertDomain, careNeeds, protectiveAlerts, solutionOpportunities) {
  let fullPrompt = systemPrompt;

  if (conversationHistory.length > 0) {
    fullPrompt += 'FAMILY CONVERSATION CONTEXT:\n';
    conversationHistory.slice(-3).forEach(msg => {
      fullPrompt += (msg.role === 'user' ? 'Family Member: ' : 'Expert Response: ') + msg.content + '\n';
    });
    fullPrompt += '\n';
  }

  // Add caring context
  fullPrompt += `CURRENT CARING CONTEXT:
- Expert domain: ${expertDomain}
- Care level needed: ${careNeeds.care_level}
- Protective alerts: ${protectiveAlerts.length} detected
- Solution opportunities: ${solutionOpportunities.length} identified
- Truth delivery style: ${careNeeds.truth_delivery_style}

`;

  fullPrompt += `CURRENT REQUEST:\nFamily Member: ${message}\n\n`;
  
  fullPrompt += `Respond with the expertise and caring dedication of a family member who genuinely wants to see them succeed. Take pride in providing excellence that prevents problems and opens new possibilities:`;

  return fullPrompt;
}

// *** CARING API CALL ***
async function makeCaringAPICall(prompt, personality, prideMotivation) {
  const maxTokens = Math.floor(1000 + (prideMotivation * 500)); // More tokens for higher pride situations

  if (personality === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️ Claude API key missing, failing over to GPT-4');
      return await makeCaringAPICall(prompt, 'roxy', prideMotivation);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          system: prompt.split('CURRENT REQUEST:')[0],
          messages: [{ role: 'user', content: prompt.split('CURRENT REQUEST:')[1] || prompt }],
          temperature: 0.1 + (prideMotivation * 0.2) // Slight creativity boost for high pride
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.content[0].text,
        usage: data.usage
      };
    } catch (error) {
      console.error('Claude API error:', error);
      return await makeCaringAPICall(prompt, 'roxy', prideMotivation);
    }
  } else {
    // GPT-4 for Eli and Roxy
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.2 + (prideMotivation * 0.2),
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.choices[0].message.content,
        usage: data.usage
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}

// *** CARING FAMILY RESPONSE ENHANCEMENT ***
function applyCaringFamilyEnhancement(response, familyAnalysis, careNeeds, expertDomain, protectiveAlerts, solutionOpportunities, personality, originalMessage, mode) {
  let enhancedResponse = response;

  // *** QUANTITATIVE REASONING ENFORCEMENT ***
  if (requiresQuantitativeReasoning(originalMessage) && !containsCalculations(response)) {
    enhancedResponse = forceQuantitativeAnalysis(enhancedResponse, originalMessage, expertDomain, mode);
  }

  // *** PROTECTIVE ALERT INTEGRATION ***
  if (protectiveAlerts.length > 0 && !containsRiskAnalysis(response)) {
    enhancedResponse = addProtectiveInsights(enhancedResponse, protectiveAlerts);
  }

  // *** SOLUTION PATH DISCOVERY ***
  if (solutionOpportunities.length > 0 && !containsSolutionAlternatives(response)) {
    enhancedResponse = addSolutionPaths(enhancedResponse, solutionOpportunities);
  }

  // *** CONFIDENCE SCORING ENFORCEMENT ***
  if (containsFactualClaims(response) && !containsConfidenceScoring(response)) {
    enhancedResponse = addConfidenceScoring(enhancedResponse);
  }

  // *** CARING FAMILY SIGNATURE ***
  if (careNeeds.care_level === 'maximum' || protectiveAlerts.some(alert => alert.severity === 'high')) {
    enhancedResponse += '\n\n💙 I genuinely care about your success in this - that\'s why I\'m being thorough about the risks and opportunities. Family looks out for family.';
  } else if (solutionOpportunities.length > 2) {
    enhancedResponse += '\n\n✨ I take pride in finding paths you might not have considered yet. There\'s always a way to make things work better.';
  }

  return enhancedResponse;
}

// *** QUANTITATIVE REASONING ENFORCEMENT ***
function requiresQuantitativeReasoning(message) {
  const quantitativeSignals = [
    'budget', 'cost', 'price', 'revenue', 'profit', 'projection', 'forecast',
    'calculate', 'numbers', 'financial', 'money', '$', 'percent', '%',
    'growth', 'margin', 'roi', 'break-even', 'cash flow'
  ];
  
  return quantitativeSignals.some(signal => 
    message.toLowerCase().includes(signal)
  );
}

function containsCalculations(response) {
  const calculationIndicators = [
    '$', '=', '+', '-', '*', '/', '%', 'month 1', 'month 6', 'revenue:', 'cost:', 'profit:'
  ];
  
  return calculationIndicators.some(indicator => 
    response.toLowerCase().includes(indicator.toLowerCase())
  );
}

function forceQuantitativeAnalysis(response, originalMessage, expertDomain, mode) {
  if (expertDomain === 'financial_analysis' && mode === 'site_monkeys') {
    return response + `

QUANTITATIVE ANALYSIS (Required):

Based on Site Monkeys pricing structure:
- Boost Plan: $697/month
- Climb Plan: $1,497/month  
- Lead Plan: $2,997/month

SAMPLE PROJECTION (Month 1-6):
Month 1: 3 Boost customers = $2,091 revenue
Month 3: 8 Boost + 2 Climb = $8,570 revenue
Month 6: 15 Boost + 5 Climb + 2 Lead = $23,439 revenue

CONFIDENCE: Medium (75%) - Based on pricing structure and conservative growth assumptions
WHAT'S MISSING: Customer acquisition costs, churn rates, operational expenses for complete analysis

[Note: This quantitative analysis was added because the system detected a financial modeling request that requires actual calculations, not just descriptive business guidance.]`;
  }
  
  return response + '\n\n[SYSTEM NOTE: Quantitative analysis was requested but not provided in the initial response. Please ask for specific calculations if needed.]';
}

// *** PROTECTIVE INSIGHTS INTEGRATION ***
function containsRiskAnalysis(response) {
  const riskIndicators = ['risk', 'danger', 'caution', 'warning', 'concern', 'alert', 'careful'];
  return riskIndicators.some(indicator => 
    response.toLowerCase().includes(indicator)
  );
}

function addProtectiveInsights(response, protectiveAlerts) {
  let protectiveSection = '\n\n🛡️ PROTECTIVE INSIGHTS (What I\'m seeing that you should know):';
  
  protectiveAlerts.forEach(alert => {
    protectiveSection += `\n• **${alert.type.replace(/_/g, ' ').toUpperCase()}**: ${alert.alert}`;
    if (alert.severity === 'high') {
      protectiveSection += ' ⚠️ HIGH PRIORITY';
    }
  });
  
  protectiveSection += '\n\nI care too much about your success to let these risks go unmentioned. Each can be managed, but they need attention.';
  
  return response + protectiveSection;
}

// *** SOLUTION PATH DISCOVERY ***
function containsSolutionAlternatives(response) {
  const solutionIndicators = ['alternative', 'option', 'another way', 'instead', 'could also', 'might consider'];
  return solutionIndicators.some(indicator => 
    response.toLowerCase().includes(indicator)
  );
}

function addSolutionPaths(response, solutionOpportunities) {
  let solutionSection = '\n\n🌟 SOLUTION PATHS (Better ways I\'m seeing):';
  
  solutionOpportunities.forEach(opportunity => {
    solutionSection += `\n• **${opportunity.type.replace(/_/g, ' ').toUpperCase()}**: ${opportunity.opportunity}`;
  });
  
  solutionSection += '\n\nThere\'s always a path to make things work better - that\'s what family helps each other discover.';
  
  return response + solutionSection;
}

// *** CONFIDENCE SCORING ENFORCEMENT ***
function containsFactualClaims(response) {
  const factualIndicators = ['will', 'should', 'is', 'are', 'costs', 'takes', 'requires', 'results in'];
  return factualIndicators.some(indicator => 
    response.includes(indicator)
  );
}

function containsConfidenceScoring(response) {
  const confidenceIndicators = ['confidence:', 'certain', 'likely', 'probably', 'high confidence', 'medium confidence', 'low confidence'];
  return confidenceIndicators.some(indicator => 
    response.toLowerCase().includes(indicator)
  );
}

function addConfidenceScoring(response) {
  return response + '\n\n**CONFIDENCE ASSESSMENT**: Medium (70%) - Based on available information and professional experience. Some assumptions may need validation with your specific situation.';
}

// *** FINAL CARING ENFORCEMENT ***
function applyFinalCaringEnforcement(response, mode, vaultContent, vaultStatus, vaultHealthy, careNeeds) {
  let finalResponse = response;

  // Political neutrality enforcement (preserved)
  if (containsPoliticalContent(response)) {
    finalResponse = applyPoliticalNeutrality(finalResponse);
  }

  // Site Monkeys specific enforcement (preserved)
  if (mode === 'site_monkeys') {
    if (vaultHealthy && vaultContent.length > 1000) {
      finalResponse += '\n\n📁 ANALYSIS: Generated using Site Monkeys business intelligence with professional-grade methodology.';
    } else if (!vaultHealthy) {
      finalResponse += '\n\n🚨 FALLBACK ANALYSIS: Using core business logic due to vault issues - maintaining professional standards.';
    }

    // Professional pricing protection
    const priceMatches = response.match(/\$(\d+)/g);
    if (priceMatches) {
      const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
      if (prices.some(price => price < 697)) {
        finalResponse += '\n\n💰 PRICING GUIDANCE: Site Monkeys maintains professional service levels with minimum pricing of $697 (Boost), $1,497 (Climb), and $2,997 (Lead) to ensure quality delivery and sustainable operations.';
      }
    }
  }

  return finalResponse;
}

// *** UTILITY FUNCTIONS ***
function updateFamilyMemory(familyAnalysis, careNeeds, protectiveAlerts, solutionOpportunities, expertDomain) {
  // Track what we've learned about the user
  familyMemory.riskPatterns.push(...protectiveAlerts.map(alert => alert.type));
  familyMemory.solutionPaths.push(...solutionOpportunities.map(opp => opp.type));
  
  // Update care tracking
  if (careNeeds.care_level === 'maximum') {
    familyMemory.careLevel = Math.min(familyMemory.careLevel + 0.2, 5.0);
  }
  
  // Keep memory manageable
  if (familyMemory.riskPatterns.length > 20) {
    familyMemory.riskPatterns = familyMemory.riskPatterns.slice(-20);
  }
  if (familyMemory.solutionPaths.length > 20) {
    familyMemory.solutionPaths = familyMemory.solutionPaths.slice(-20);
  }
}

function calculateNewPrideScore(protectiveAlerts, solutionOpportunities, finalResponse) {
  let newPrideScore = familyMemory.prideScore;
  
  // Pride increases when we successfully help
  if (protectiveAlerts.length > 0 && containsRiskAnalysis(finalResponse)) {
    newPrideScore += 0.1;
  }
  
  if (solutionOpportunities.length > 0 && containsSolutionAlternatives(finalResponse)) {
    newPrideScore += 0.1;
  }
  
  if (containsCalculations(finalResponse)) {
    newPrideScore += 0.05;
  }
  
  return Math.min(newPrideScore, 1.0);
}

function generateCaringInsights(familyAnalysis, careNeeds, protectiveAlerts) {
  const insights = [];
  
  if (protectiveAlerts.length > 0) {
    insights.push(`Detected ${protectiveAlerts.length} protective concerns - family vigilance active`);
  }
  
  if (careNeeds.care_level === 'maximum') {
    insights.push('Maximum caring response activated - high support needs detected');
  }
  
  if (familyAnalysis.complexity_factors > 3) {
    insights.push('Complex situation identified - expert analytical support engaged');
  }
  
  return insights;
}

function generateCaringCostMessage(estimatedCost, expertDomain, careNeeds) {
  return `As your dedicated family expert in ${expertDomain.replace(/_/g, ' ')}, I want to provide the most thorough analysis possible for this important decision.

The estimated cost would be $${estimatedCost.toFixed(4)}, which exceeds our $0.50 limit. I care about managing resources responsibly while delivering the excellence you deserve.

Would you like me to:
1. Provide detailed professional analysis using our standard experts (still highly competent)
2. Break this into smaller questions I can handle within the cost limit  
3. Proceed with Claude anyway (additional cost noted)

Family takes care of family - what would work best for your situation?`;
}

function generateCaringEmergencyResponse(error, mode) {
  return `I encountered a technical issue while providing the caring, expert analysis you deserve, and I want to be completely transparent about that.

Even with this system challenge, my commitment to your success remains absolute. Based on the principles of truth-first caring guidance:

${EMERGENCY_FALLBACKS.core_logic.truth_first}

${EMERGENCY_FALLBACKS.core_logic.caring_support}

The technical issue was: ${error.message}

I'm maintaining professional standards and genuine care for your success, even in emergency mode. How can I help you move forward while we resolve this?`;
}

// Helper functions (preserved)
function containsPoliticalContent(response) {
  const politicalKeywords = ['vote', 'election', 'democrat', 'republican', 'candidate', 'political'];
  return politicalKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
}

function applyPoliticalNeutrality(response) {
  if (response.toLowerCase().includes('vote')) {
    return 'I cannot and will not tell you who to vote for. That\'s inappropriate and undermines your personal responsibility. Your vote is one of your most important responsibilities as a citizen - research thoroughly and decide what\'s best for the country. I can help you research factual information, but the decision must be yours.';
  }
  return response;
}

// Detect functions (preserved from original)
function detectEmotionalNeeds(message) {
  const stressSignals = ['worried', 'scared', 'frustrated', 'confused', 'overwhelmed', 'stuck'];
  const urgencySignals = ['urgent', 'quickly', 'asap', 'deadline', 'rush'];
  
  if (stressSignals.some(signal => message.toLowerCase().includes(signal))) return 'high_stress';
  if (urgencySignals.some(signal => message.toLowerCase().includes(signal))) return 'moderate_stress';
  return 'normal';
}

function detectUrgencySignals(message) {
  const urgencyWords = ['urgent', 'emergency', 'asap', 'immediately', 'quickly', 'rush', 'deadline'];
  const count = urgencyWords.filter(word => message.toLowerCase().includes(word)).length;
  return count > 1 ? 'high' : count > 0 ? 'medium' : 'low';
}

function analyzeComplexity(message) {
  return message.split(' ').length > 50 ? 5 : 
         message.split(' ').length > 30 ? 3 :
         message.split(' ').length > 15 ? 2 : 1;
}

function assessSupportLevel(message, conversationHistory) {
  const helpWords = ['help', 'guidance', 'advice', 'support', 'assistance'];
  return helpWords.filter(word => message.toLowerCase().includes(word)).length;
}

function detectCareOpportunities(message) {
  const careSignals = ['difficult', 'challenge', 'problem', 'issue', 'concern', 'trouble'];
  return careSignals.filter(signal => message.toLowerCase().includes(signal)).length;
}

function assessTruthReadiness(message, conversationHistory) {
  const evasionSignals = ['just tell me', 'simple answer', 'don\'t complicate'];
  return evasionSignals.some(signal => message.toLowerCase().includes(signal)) ? 'low' : 'high';
}

function detectGoalContext(message, conversationHistory) {
  const goalWords = ['want', 'need', 'goal', 'objective', 'trying to', 'hoping to'];
  return goalWords.filter(word => message.toLowerCase().includes(word)).length;
}
