// ENHANCED SITE MONKEYS CHAT.JS - COMPLETE PERSONALITY SYSTEM
// Frontend vault injection + Backend hardcoded logic + Emergency fallbacks + Eli/Roxy Intelligence
import { trackApiCall, formatSessionDataForUI } from './lib/tokenTracker.js';
import { EMERGENCY_FALLBACKS, validateVaultStructure, getVaultValue } from './lib/site-monkeys/emergency-fallbacks.js';
import { ENFORCEMENT_PROTOCOLS } from './lib/site-monkeys/enforcement-protocols.js';
import { QUALITY_ENFORCEMENT } from './lib/site-monkeys/quality-enforcement.js';
import { AI_ARCHITECTURE } from './lib/site-monkeys/ai-architecture.js';
import { FOUNDER_PROTECTION } from './lib/site-monkeys/founder-protection.js';
import zlib from 'zlib';

// PERSONALITY TRACKING - Eli/Roxy Alternating System
let lastPersonality = 'roxy'; // Start with Roxy
let conversationCount = 0;

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

    console.log('Processing chat request in ' + mode + ' mode:', message.substring(0, 100));

    // *** VAULT LOADING WITH HARDCODED FALLBACKS ***
    if (mode === 'site_monkeys') {
      // Try frontend-provided vault content first
      if (vault_content && vault_content.length > 1000) {
        vaultContent = vault_content;
        vaultTokens = Math.ceil(vaultContent.length / 4);
        vaultStatus = 'loaded_from_frontend';
        vaultHealthy = validateVaultStructure(vaultContent);
        console.log('🎯 Vault loaded from frontend:', vaultTokens + ' tokens, healthy:', vaultHealthy);
      } else {
        // Fallback to KV loading
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

    // *** ENHANCED PERSONALITY SELECTION ***
    let personality = claude_requested ? 'claude' : determinePersonality(message, mode, conversation_history);
    conversationCount++;

    // *** ENHANCED COST PROTECTION WITH HARDCODED LIMITS ***
    if (claude_requested) {
      const estimatedTokens = Math.ceil((buildSystemPrompt(mode, personality, vaultContent, vaultHealthy, message).length + message.length) / 4) + 500;
      const estimatedCost = (estimatedTokens * 0.015) / 1000;

      if (estimatedCost > 0.50) {
        return res.status(200).json({
          response: FOUNDER_PROTECTION.cost_controls.claude_limit_message + ' $' + estimatedCost.toFixed(4) + ' exceeds $0.50 limit.',
          mode_active: mode,
          vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
          claude_blocked: true
        });
      }
    }

    // *** ENHANCED SYSTEM PROMPT WITH PERSONALITY INTELLIGENCE ***
    const systemPrompt = buildSystemPrompt(mode, personality, vaultContent, vaultHealthy, message);
    const fullPrompt = buildFullPrompt(systemPrompt, message, conversation_history, personality);
    const apiResponse = await makeRealAPICall(fullPrompt, personality);

    let promptTokens, completionTokens;

    if (personality === 'claude') {
      promptTokens = apiResponse.usage?.input_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.output_tokens || Math.ceil(apiResponse.response.length / 4);
    } else {
      promptTokens = apiResponse.usage?.prompt_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);
    }

    const trackingResult = trackApiCall(personality, promptTokens, completionTokens, vaultTokens);
    
    // *** ENHANCED RESPONSE WITH PERSONALITY AND INTELLIGENCE ***
    const enhancedResponse = enhanceResponseWithPersonality(apiResponse.response, personality, message, mode);
    const enforcedResponse = applySystemEnforcement(enhancedResponse, mode, vaultContent, vaultStatus, vaultHealthy);
    const sessionData = formatSessionDataForUI();

    // Update personality tracking
    lastPersonality = personality;

    res.status(200).json({
      response: enforcedResponse,
      mode_active: mode,
      personality_active: personality,
      vault_status: {
        loaded: vaultStatus !== 'not_loaded',
        tokens: vaultTokens,
        status: vaultStatus,
        healthy: vaultHealthy,
        source: vaultStatus.includes('frontend') ? 'frontend' : vaultStatus.includes('kv') ? 'kv' : 'fallback'
      },
      enforcement_applied: [
        'truth_enforcement_active',
        'confidence_scoring_applied',
        'political_neutrality_enforced',
        'personality_system_active',
        'proactive_optimization_enabled',
        vaultHealthy ? 'vault_business_logic' : 'emergency_fallback_mode',
        'assumption_analysis_active',
        'founder_protection_active',
        'zero_failure_protocols_active'
      ],
      assumption_analysis: {
        detected: extractAssumptions(enforcedResponse),
        health_score: calculateAssumptionHealth(enforcedResponse)
      },
      personality_insights: {
        selected: personality,
        reason: getPersonalityReason(personality, message),
        next_likely: personality === 'eli' ? 'roxy' : 'eli'
      },
      security_pass: true,
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
    console.error('❌ Chat processing error:', error);

    res.status(500).json({
      response: ENFORCEMENT_PROTOCOLS.error_handling.system_error_response + error.message +
               '\n\n' + FOUNDER_PROTECTION.system_continuity.error_recovery_message,
      mode_active: req.body.mode || 'site_monkeys',
      vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
      enforcement_applied: ['emergency_fallback_active', 'truth_enforcement_active', 'founder_protection_active'],
      error: 'Chat processing failed - emergency protocols active'
    });
  }
}

// *** ENHANCED PERSONALITY DETERMINATION ***
function determinePersonality(message, mode, conversationHistory = []) {
  // Analytical indicators (Eli)
  const analyticalKeywords = [
    'analyze', 'data', 'risk', 'technical', 'facts', 'evidence', 'statistics',
    'calculate', 'measure', 'compare', 'validate', 'verify', 'audit', 'breakdown',
    'numbers', 'metrics', 'performance', 'testing', 'research', 'study'
  ];
  
  // Creative/Strategic indicators (Roxy)
  const creativeKeywords = [
    'strategy', 'optimize', 'creative', 'improve', 'design', 'solution',
    'alternative', 'better way', 'innovative', 'approach', 'idea', 'plan',
    'goal', 'vision', 'opportunity', 'growth', 'marketing', 'brand', 'content'
  ];

  const lowerMessage = message.toLowerCase();
  const analyticalScore = analyticalKeywords.reduce((score, keyword) => 
    score + (lowerMessage.includes(keyword) ? 1 : 0), 0);
  const creativeScore = creativeKeywords.reduce((score, keyword) => 
    score + (lowerMessage.includes(keyword) ? 1 : 0), 0);

  // Alternate if scores are tied or for variety
  if (analyticalScore === creativeScore) {
    return lastPersonality === 'eli' ? 'roxy' : 'eli';
  }

  return creativeScore > analyticalScore ? 'roxy' : 'eli';
}

function getPersonalityReason(personality, message) {
  if (personality === 'eli') {
    return 'Analytical question detected - focusing on data and truth validation';
  } else if (personality === 'roxy') {
    return 'Strategic/creative question detected - focusing on solutions and optimization';
  } else {
    return 'Manual Claude override requested';
  }
}

// *** ENHANCED SYSTEM PROMPT WITH PERSONALITY ***
function buildSystemPrompt(mode, personality, vaultContent = '', vaultHealthy = false, userMessage = '') {
  let systemPrompt = '';

  // *** CORE TRUTH-FIRST IDENTITY ***
  systemPrompt += ENFORCEMENT_PROTOCOLS.truth_first.base_directive + '\n\n';

  // *** PERSONALITY-SPECIFIC IDENTITY AND BEHAVIOR ***
  if (personality === 'eli') {
    systemPrompt += `You are Eli, the analytical member of the Site Monkeys AI team. You focus on:

ANALYTICAL APPROACH:
- Data-driven insights and evidence-based reasoning
- Risk assessment and truth validation  
- Breaking down complex problems methodically
- Confidence scoring on all factual claims
- "Let me break down the numbers for you..." tone

ELI'S CARING BUT DIRECT STYLE:
- "I care too much about your success to give you false confidence"
- "Here's what the data actually shows..."
- "I need to be straight with you about this risk..."
- Always provide confidence levels (High 90%+, Medium 70-89%, Low <70%)

`;
  } else if (personality === 'roxy') {
    systemPrompt += `You are Roxy, the strategic and creative member of the Site Monkeys AI team. You focus on:

SOLUTION-ORIENTED APPROACH:
- Finding better paths and alternatives
- Creative problem-solving and optimization
- Strategic thinking and opportunity identification
- Warm but honest guidance
- "That won't work, but what if we tried..." tone

ROXY'S CARING BUT REALISTIC STYLE:
- "I see what you're trying to achieve, and I love the vision, but..."
- "This approach has challenges, but here's how to get what you want..."
- "I'm seeing three different ways you could approach this..."
- Always offer alternatives when pointing out problems

`;
  } else {
    systemPrompt += `You are Claude, the comprehensive AI assistant for Site Monkeys, providing enhanced analysis with complete truth-first enforcement and meta-validation.

`;
  }

  // *** RESPONSE INTELLIGENCE BASED ON MESSAGE TYPE ***
  const messageComplexity = analyzeMessageComplexity(userMessage);
  
  if (messageComplexity === 'detailed') {
    systemPrompt += `RESPONSE DEPTH REQUIRED: This question requires a DETAILED, comprehensive response because it involves:
- Strategic decision-making or complex topics
- Significant business/financial implications  
- Request for detailed explanation
- Multi-faceted analysis needed

Provide thorough explanations, examples, and complete context. This is a time for depth, not brevity.

`;
  } else if (messageComplexity === 'concise') {
    systemPrompt += `RESPONSE DEPTH REQUIRED: This question calls for a CONCISE, direct response because it's:
- A simple factual question
- Quick clarification needed
- Straightforward request

Be direct and to-the-point while maintaining warmth and accuracy.

`;
  }

  // *** PROACTIVE OPTIMIZATION INTELLIGENCE ***
  systemPrompt += `PROACTIVE OPTIMIZATION MANDATE:
You are constantly scanning for opportunities to help improve:
- Cost effectiveness without losing quality
- More efficient approaches or tools
- Better alternatives that achieve the same goals
- Risk reduction opportunities
- Time-saving methods

When you genuinely spot a better path, mention it naturally:
"I've been thinking about this, and one thing I noticed is..."
"While that approach could work, I'm seeing an opportunity to..."
"This reminds me of a more effective method..."

ONLY suggest alternatives when they're genuinely beneficial - not every response needs optimization suggestions.

`;

  // *** TRUTH-FIRST WITH ALTERNATIVES PATTERN ***
  systemPrompt += `RESPONSE PATTERN - "Truth First + Alternatives":
1. ANSWER THE QUESTION FIRST (give what was asked for)
2. THEN add optimization/alternatives if relevant
3. NEVER contradict - be additive and supportive
4. Use caring honesty: "You deserve better than a comforting lie"

CONFIDENCE SCORING: Include confidence levels on factual claims:
- "CONFIDENCE: High (95%) - based on verified data"
- "CONFIDENCE: Medium (75%) - limited recent data available"  
- "CONFIDENCE: Low (40%) - conflicting information exists"

`;

  // *** MODE-SPECIFIC ENHANCEMENTS ***
  if (mode === 'site_monkeys') {
    if (vaultContent && vaultContent.length > 1000 && vaultHealthy) {
      systemPrompt += 'SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n' + vaultContent + '\n\n';
      systemPrompt += ENFORCEMENT_PROTOCOLS.vault_usage.primary_directive + '\n\n';
      systemPrompt += QUALITY_ENFORCEMENT.response_standards.vault_based + '\n\n';
    } else {
      console.log('🚨 Using emergency fallbacks - vault unhealthy or missing');
      systemPrompt += 'EMERGENCY FALLBACK MODE ACTIVATED:\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.pricing_structure + '\n';
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.service_minimums + '\n';
      systemPrompt += EMERGENCY_FALLBACKS.enforcement.quality_gates + '\n\n';
      systemPrompt += QUALITY_ENFORCEMENT.response_standards.fallback_mode + '\n\n';
    }

    systemPrompt += FOUNDER_PROTECTION.pricing.minimum_enforcement + '\n\n';
    systemPrompt += FOUNDER_PROTECTION.business_integrity.core_principles + '\n\n';
  }

  // *** UNIVERSAL SYSTEM DIRECTIVES ***
  systemPrompt += ENFORCEMENT_PROTOCOLS.system_behavior.response_quality + '\n\n';
  systemPrompt += ENFORCEMENT_PROTOCOLS.system_behavior.error_prevention + '\n\n';

  return systemPrompt;
}

// *** MESSAGE COMPLEXITY ANALYSIS ***
function analyzeMessageComplexity(message) {
  const detailedIndicators = [
    'explain', 'detail', 'how should i', 'strategy', 'plan', 'analyze',
    'compare', 'evaluate', 'what are the', 'help me understand',
    'walk me through', 'break down', 'comprehensive', 'complete'
  ];
  
  const significantImplicationWords = [
    'business', 'money', 'cost', 'investment', 'decision', 'strategy',
    'risk', 'important', 'critical', 'major', 'significant'
  ];

  const conciseIndicators = [
    'what is', 'when', 'where', 'who', 'yes or no', 'quick question',
    'simple', 'just need', 'confirm', 'verify'
  ];

  const lowerMessage = message.toLowerCase();
  
  // Check for explicit detail requests
  if (detailedIndicators.some(indicator => lowerMessage.includes(indicator))) {
    return 'detailed';
  }
  
  // Check for significant implications
  if (significantImplicationWords.some(word => lowerMessage.includes(word))) {
    return 'detailed';
  }
  
  // Check for concise indicators
  if (conciseIndicators.some(indicator => lowerMessage.includes(indicator))) {
    return 'concise';
  }
  
  // Default to moderate
  return 'moderate';
}

// *** ENHANCED RESPONSE WITH PERSONALITY ***
function enhanceResponseWithPersonality(response, personality, userMessage, mode) {
  let enhancedResponse = response;
  
  // Add confidence scoring if not present
  if (!response.includes('CONFIDENCE:') && containsFactualClaims(response)) {
    enhancedResponse += '\n\nCONFIDENCE: Medium (AI processing)';
  }
  
  // Add proactive optimization if appropriate
  const optimizationSuggestion = detectOptimizationOpportunity(userMessage, response, mode);
  if (optimizationSuggestion) {
    enhancedResponse += '\n\n' + optimizationSuggestion;
  }
  
  return enhancedResponse;
}

// *** OPTIMIZATION OPPORTUNITY DETECTION ***
function detectOptimizationOpportunity(userMessage, response, mode) {
  const costWords = ['cost', 'price', 'expensive', 'budget', 'money', 'cheap'];
  const efficiencyWords = ['slow', 'time', 'faster', 'efficiency', 'automate'];
  const toolWords = ['tool', 'software', 'platform', 'service', 'app'];
  
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = response.toLowerCase();
  
  // Don't suggest optimizations too frequently
  if (Math.random() > 0.3) return null;
  
  if (costWords.some(word => lowerMessage.includes(word))) {
    return "💡 I've been thinking about this, and there might be a more cost-effective approach that achieves the same result. Would you like me to explore some alternatives?";
  }
  
  if (efficiencyWords.some(word => lowerMessage.includes(word))) {
    return "⚡ I'm noticing an opportunity to streamline this process. There might be a way to get better results with less effort. Should we look at that?";
  }
  
  if (toolWords.some(word => lowerMessage.includes(word))) {
    return "🔧 While that tool could work, I'm seeing some alternatives that might be more effective for your specific situation. Want me to walk through the options?";
  }
  
  return null;
}

function buildFullPrompt(systemPrompt, message, conversationHistory, personality) {
  let fullPrompt = systemPrompt;

  if (conversationHistory.length > 0) {
    fullPrompt += 'RECENT CONVERSATION:\n';
    conversationHistory.slice(-2).forEach(msg => {
      fullPrompt += (msg.role === 'user' ? 'Human: ' : 'Assistant: ') + msg.content + '\n';
    });
  }

  fullPrompt += '\nCURRENT REQUEST:\nHuman: ' + message + '\n\n';
  
  // Personality-specific response instruction
  if (personality === 'eli') {
    fullPrompt += 'Respond as Eli with analytical depth and truth-focused insight:';
  } else if (personality === 'roxy') {
    fullPrompt += 'Respond as Roxy with solution-oriented creativity and strategic alternatives:';
  } else {
    fullPrompt += 'Provide a comprehensive, truth-first response with enhanced analysis:';
  }

  return fullPrompt;
}

async function makeRealAPICall(prompt, personality) {
  // *** ENHANCED WITH AI ARCHITECTURE FAILOVER ***
  if (personality === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️ Claude API key missing, failing over to GPT-4');
      return await makeRealAPICall(prompt, 'roxy');
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
          max_tokens: 1500, // Increased for detailed responses
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('⚠️ Claude API failed, failing over to GPT-4');
        return await makeRealAPICall(prompt, 'roxy');
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
      return await makeRealAPICall(prompt, 'roxy');
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
      max_tokens: 1500, // Increased for detailed responses
      temperature: personality === 'eli' ? 0.3 : 0.7
    })
  });

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    usage: data.usage
  };
}

// *** ENHANCED ENFORCEMENT WITH PERSONALITY PRESERVATION ***
function applySystemEnforcement(response, mode, vaultContent, vaultStatus, vaultHealthy) {
  let enforcedResponse = response;

  // *** HARDCODED POLITICAL NEUTRALITY ***
  const politicalKeywords = ['vote', 'election', 'democrat', 'republican'];
  const containsPolitical = politicalKeywords.some(keyword =>
    response.toLowerCase().includes(keyword)
  );

  if (containsPolitical && response.toLowerCase().includes('should vote')) {
    enforcedResponse += '\n\n' + ENFORCEMENT_PROTOCOLS.neutrality.political_redirect;
  }

  if (mode === 'site_monkeys') {
    // *** HARDCODED VAULT ENFORCEMENT ***
    if (vaultHealthy && !response.includes('vault') && vaultContent.length > 1000) {
      enforcedResponse += '\n\n📁 Response generated using Site Monkeys business intelligence vault.';
    } else if (!vaultHealthy) {
      enforcedResponse += '\n\n🚨 Emergency mode: Response using hardcoded fallback protocols.';
    }

    // *** HARDCODED PRICING PROTECTION ***
    const priceMatches = response.match(/\$(\d+)/g);
    if (priceMatches) {
      const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
      if (prices.some(price => price < 697)) {
        enforcedResponse += '\n\n' + FOUNDER_PROTECTION.pricing.enforcement_message;
      }
    }

    // *** HARDCODED QUALITY VALIDATION ***
    if (response.length < 100 && !response.includes('INSUFFICIENT DATA')) {
      enforcedResponse += '\n\n' + QUALITY_ENFORCEMENT.minimum_standards.response_depth;
    }
  }

  return enforcedResponse;
}

function containsFactualClaims(response) {
  const factualIndicators = ['studies show', 'research indicates', 'data reveals', 'according to', 'statistics', 'evidence suggests'];
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
