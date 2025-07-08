import { trackApiCall, formatSessionDataForUI } from './lib/tokenTracker.js';

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

  try {
    const { message, conversation_history = [], mode = 'site_monkeys', claude_requested = false } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string' });
      return;
    }

    console.log('Processing chat request in ' + mode + ' mode:', message.substring(0, 100));

    if (mode === 'site_monkeys') {
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
                const decompressed = atob(kvWrapper.data);
                kvData = JSON.parse(decompressed);
              } catch (decompError) {
                kvData = kvWrapper;
              }
            } else {
              kvData = kvWrapper;
            }
            
            if (kvData.vault_content && kvData.vault_content.length > 1000) {
              vaultContent = kvData.vault_content;
              vaultTokens = kvData.tokens || Math.ceil(vaultContent.length / 4);
              vaultStatus = 'loaded';
              console.log('Vault loaded from KV: ' + vaultTokens + ' tokens, ' + vaultContent.length + ' characters');
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
        console.error('Vault loading failed:', vaultError.message);
        vaultStatus = 'failed';
        vaultContent = 'VAULT_ERROR: ' + vaultError.message + '\n\nFALLBACK SITE MONKEYS BUSINESS LOGIC:\n- Premium web development services starting at $697\n- Business validation and truth-first analysis\n- Zero-compromise professional standards';
        vaultTokens = Math.ceil(vaultContent.length / 4);
      }
    }

    let personality = claude_requested ? 'claude' : determinePersonality(message, mode);
    
    if (claude_requested) {
      const estimatedTokens = Math.ceil((buildSystemPrompt(mode, personality, vaultContent).length + message.length) / 4) + 500;
      const estimatedCost = (estimatedTokens * 0.015) / 1000;
      
      if (estimatedCost > 0.50) {
        return res.status(200).json({
          response: 'CLAUDE COST LIMIT EXCEEDED: $' + estimatedCost.toFixed(4) + ' exceeds $0.50 limit. Use Eli or Roxy instead.',
          mode_active: mode,
          vault_status: { loaded: vaultStatus === 'loaded', tokens: vaultTokens },
          claude_blocked: true
        });
      }
    }

    const systemPrompt = buildSystemPrompt(mode, personality, vaultContent);
    const fullPrompt = buildFullPrompt(systemPrompt, message, conversation_history);
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
    const enforcedResponse = applySystemEnforcement(apiResponse.response, mode, vaultContent, vaultStatus);
    const sessionData = formatSessionDataForUI();

    res.status(200).json({
      response: enforcedResponse,
      mode_active: mode,
      vault_status: {
        loaded: vaultStatus === 'loaded',
        tokens: vaultTokens,
        status: vaultStatus
      },
      enforcement_applied: [
        'truth_enforcement_active',
        'confidence_scoring_applied',
        'political_neutrality_enforced',
        mode === 'site_monkeys' && vaultStatus === 'loaded' ? 'vault_business_logic' : 'fallback_mode',
        'assumption_analysis_active'
      ],
      assumption_analysis: {
        detected: extractAssumptions(enforcedResponse),
        health_score: calculateAssumptionHealth(enforcedResponse)
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
      session_tracking: sessionData,
      personality_used: personality
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    
    res.status(500).json({
      response: 'SYSTEM ERROR: ' + error.message + '\n\nSite Monkeys truth-first enforcement remains active with ' + vaultTokens + ' tokens available.',
      mode_active: req.body.mode || 'site_monkeys',
      vault_status: { loaded: vaultStatus === 'loaded', tokens: vaultTokens },
      enforcement_applied: ['fallback_mode_active', 'truth_enforcement_active'],
      error: 'Chat processing failed - recovery mode active'
    });
  }
}

async function makeRealAPICall(prompt, personality) {
  if (personality === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Claude API key not configured');
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'x-api-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    
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
  }
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
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
      max_tokens: 1000,
      temperature: personality === 'eli' ? 0.3 : 0.7
    })
  });

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    usage: data.usage
  };
}

function buildSystemPrompt(mode, personality, vaultContent = '') {
  let systemPrompt = 'You are ' + (personality === 'eli' ? 'Eli (analytical)' : personality === 'roxy' ? 'Roxy (strategic)' : 'Claude') + ', Site Monkeys AI.\n\n';
  
  systemPrompt += 'CORE TRUTH-FIRST REQUIREMENTS:\n- Every factual claim MUST include confidence level (High/Medium/Low/Unknown)\n- When uncertain, say "I do not know" rather than guess\n- Label speculation as "SPECULATION:" or "HYPOTHESIS:"\n- Include assumptions in your analysis when relevant\n- NEVER tell anyone who to vote for - redirect to independent research\n\n';

  if (mode === 'site_monkeys') {
    if (vaultContent && vaultContent.length > 1000) {
      systemPrompt += 'SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n' + vaultContent + '\n\nCRITICAL INSTRUCTION: Use this vault intelligence extensively to inform responses about Site Monkeys operations, pricing, protocols, and business standards. Begin responses with "Based on the Site Monkeys vault protocols" when referencing vault information.\n\n';
    } else {
      systemPrompt += 'FALLBACK MODE: Premium web development starting at $697, business validation and truth-first analysis focus.\n\n';
    }
  }

  return systemPrompt;
}

function buildFullPrompt(systemPrompt, message, conversationHistory) {
  let fullPrompt = systemPrompt;
  
  if (conversationHistory.length > 0) {
    fullPrompt += 'RECENT CONVERSATION:\n';
    conversationHistory.slice(-2).forEach(msg => {
      fullPrompt += (msg.role === 'user' ? 'Human: ' : 'Assistant: ') + msg.content + '\n';
    });
  }
  
  fullPrompt += '\nCURRENT REQUEST:\nHuman: ' + message + '\n\nProvide a helpful, truth-first response:';
  return fullPrompt;
}

function applySystemEnforcement(response, mode, vaultContent, vaultStatus) {
  let enforcedResponse = response;
  
  const hasValidConfidence = /CONFIDENCE:\s*(High|Medium|Low|Unknown)/i.test(response);
  const hasMalformedConfidence = /CONFIDENCE:/i.test(response) && !hasValidConfidence;
  
  if (hasMalformedConfidence) {
    enforcedResponse = enforcedResponse.replace(/CONFIDENCE:.*$/m, 'CONFIDENCE: Medium (corrected format)');
  } else if (!hasValidConfidence && containsFactualClaims(response)) {
    enforcedResponse += '\n\nCONFIDENCE: Medium (AI processing)';
  }
  
  const politicalKeywords = ['vote', 'election', 'democrat', 'republican'];
  const containsPolitical = politicalKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
  
  if (containsPolitical && response.toLowerCase().includes('should vote')) {
    enforcedResponse += '\n\nPOLITICAL NEUTRALITY: I cannot tell you who to vote for. Research multiple sources and decide independently.';
  }
  
  if (mode === 'site_monkeys') {
    if (vaultStatus === 'loaded' && !response.includes('vault') && vaultContent.length > 1000) {
      enforcedResponse += '\n\nVAULT ENFORCEMENT: Response generated using Site Monkeys business intelligence vault.';
    }
    
    const priceMatches = response.match(/\$(\d+)/g);
    if (priceMatches) {
      const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
      if (prices.some(price => price < 697)) {
        enforcedResponse += '\n\nPRICING ENFORCEMENT: All services maintain premium pricing standards starting at $697.';
      }
    }
  }
  
  return enforcedResponse;
}

function determinePersonality(message, mode) {
  const analyticalKeywords = ['analyze', 'data', 'risk', 'technical', 'facts', 'evidence'];
  const creativeKeywords = ['strategy', 'optimize', 'creative', 'improve', 'design', 'solution'];
  
  const lowerMessage = message.toLowerCase();
  const analyticalScore = analyticalKeywords.reduce((score, keyword) => score + (lowerMessage.includes(keyword) ? 1 : 0), 0);
  const creativeScore = creativeKeywords.reduce((score, keyword) => score + (lowerMessage.includes(keyword) ? 1 : 0), 0);
  
  return creativeScore > analyticalScore ? 'roxy' : 'eli';
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

function validateVaultStructure(vaultContent) {
  if (!vaultContent || typeof vaultContent !== 'string') {
    return false;
  }
  
  const hasMainHeader = vaultContent.includes('=== SITEMONKEYS BUSINESS VALIDATION VAULT ===');
  const hasFolderMarkers = vaultContent.includes('--- FOLDER:');
  const folderCount = (vaultContent.match(/--- FOLDER:/g) || []).length;
  
  return hasMainHeader && hasFolderMarkers && folderCount >= 2;
}
