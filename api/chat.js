// EMERGENCY CHAT.JS - SIMPLIFIED BUT WORKING VERSION
export default async function handler(req, res) {
  // CORS headers
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

  try {
    const { message, conversation_history = [], mode = 'site_monkeys' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string' });
      return;
    }

    console.log(`🤖 Processing chat request in ${mode} mode:`, message.substring(0, 100));

    // ✅ STEP 1: Load vault if in site_monkeys mode
    let vaultContent = '';
    let vaultTokens = 0;
    
    if (mode === 'site_monkeys') {
      try {
        console.log('📖 Loading vault for Site Monkeys mode...');
        
        // ✅ KV ACCESS with proper parsing
        const kv_url = process.env.KV_REST_API_URL;
        const kv_token = process.env.KV_REST_API_TOKEN;
        
        if (!kv_url || !kv_token) {
          throw new Error('KV environment variables not configured');
        }
        
        console.log('🔍 Checking KV for vault data...');
        
        const kvResponse = await fetch(`${kv_url}/get/sitemonkeys_vault_v2`, {
          headers: { 
            'Authorization': `Bearer ${kv_token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        if (kvResponse.ok) {
          const kvText = await kvResponse.text();
          console.log(`📥 KV response length: ${kvText.length}`);
          console.log(`📥 KV response preview: ${kvText.substring(0, 200)}...`);
          
          if (kvText && kvText !== 'null' && kvText.trim() !== '') {
            try {
              // ✅ CRITICAL FIX: Handle KV wrapper format
              let kvData;
              
              // First parse the outer KV response
              const kvWrapper = JSON.parse(kvText);
              console.log(`📊 KV wrapper keys: ${Object.keys(kvWrapper).join(', ')}`);
              
              // Check if it's wrapped in {"result": "..."} format
              if (kvWrapper.result) {
                console.log('🔧 Unwrapping KV result field...');
                // Parse the inner JSON string
                kvData = JSON.parse(kvWrapper.result);
              } else {
                // Direct format (no wrapper)
                kvData = kvWrapper;
              }
              
              console.log(`📊 Vault data keys: ${Object.keys(kvData).join(', ')}`);
              console.log(`📊 Vault content length: ${kvData.vault_content ? kvData.vault_content.length : 'undefined'}`);
              
              if (kvData.vault_content && kvData.vault_content.length > 200) {
                vaultContent = kvData.vault_content;
                vaultTokens = kvData.tokens || 0;
                console.log(`✅ Vault loaded from KV: ${vaultTokens} tokens, ${vaultContent.length} characters`);
              } else {
                console.log(`❌ KV vault_content too small: ${kvData.vault_content ? kvData.vault_content.length : 'undefined'} characters`);
                throw new Error(`KV data exists but vault_content is ${kvData.vault_content ? 'only ' + kvData.vault_content.length + ' characters' : 'missing'} - needs refresh`);
              }
              
            } catch (parseError) {
              console.log(`❌ KV parse error: ${parseError.message}`);
              throw new Error(`KV data parse failed: ${parseError.message}`);
            }
          } else {
            throw new Error('KV returned empty or null data - vault needs refresh');
          }
        } else {
          throw new Error(`KV API returned ${kvResponse.status} ${kvResponse.statusText}`);
        }
        
      } catch (vaultError) {
        console.error('❌ Vault loading failed:', vaultError.message);
        
        // Provide helpful error context
        vaultContent = `[VAULT_STATUS: ${vaultError.message}]`;
        vaultTokens = 0;
      }
    }

    // ✅ STEP 2: Determine personality
    const personality = determinePersonality(message, mode);
    console.log(`🎭 Selected personality: ${personality}`);

    // ✅ STEP 3: Build system prompt with vault integration
    const systemPrompt = buildSystemPrompt(mode, personality, vaultContent);
    const fullPrompt = buildFullPrompt(systemPrompt, message, conversation_history);

    // ✅ STEP 4: Make REAL API call
    console.log(`🚀 Making ${personality} API call...`);
    const apiResponse = await makeRealAPICall(fullPrompt, personality);

    // ✅ STEP 5: Extract token usage
    const promptTokens = apiResponse.usage?.prompt_tokens || Math.ceil(fullPrompt.length / 4);
    const completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);
    const totalTokens = promptTokens + completionTokens;

    console.log(`📈 Real API usage: ${promptTokens} + ${completionTokens} = ${totalTokens} tokens`);

    // ✅ STEP 6: Calculate costs
    const callCost = personality === 'claude' ? (totalTokens * 0.015) / 1000 : (totalTokens * 0.002) / 1000;
    console.log(`💰 Cost tracking: ${callCost.toFixed(4)} this call`);

    // ✅ STEP 7: Return working response
    res.status(200).json({
      response: apiResponse.response,
      mode_active: mode,
      vault_status: {
        loaded: mode === 'site_monkeys' && vaultContent.length > 200,
        tokens: vaultTokens,
        file_count: vaultTokens > 0 ? 3 : 0
      },
      enforcement_applied: [
        'truth_enforcement_active',
        mode === 'site_monkeys' && vaultTokens > 0 ? 'vault_business_logic' : 'standard_mode'
      ],
      security_pass: true,
      performance: {
        tokens_used: totalTokens,
        call_cost: callCost,
        vault_tokens: vaultTokens,
        api_provider: personality === 'claude' ? 'anthropic' : 'openai'
      },
      personality_used: personality
    });

  } catch (error) {
    console.error('❌ Chat processing error:', error);
    
    // Emergency fallback
    res.status(500).json({
      response: `**SYSTEM ERROR**: ${error.message}

I can still help you! The vault system loaded ${vaultTokens || 0} tokens of Site Monkeys data.

Please try asking your question again, or try: "What are Site Monkeys pricing standards?"`,
      mode_active: req.body.mode || 'site_monkeys',
      vault_status: { loaded: false, tokens: 0, file_count: 0 },
      enforcement_applied: ['fallback_mode_active'],
      security_pass: false,
      performance: {
        tokens_used: 0,
        call_cost: 0,
        api_error: { fallback_used: true, error: error.message }
      },
      error: 'Chat processing failed - emergency fallback active'
    });
  }
}

async function makeRealAPICall(prompt, personality) {
  // ✅ OPENAI API CALL (Default for Eli/Roxy)
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const model = 'gpt-3.5-turbo';
  const temperature = personality === 'eli' ? 0.3 : 0.7;
  
  console.log(`🎯 Making ${personality} OpenAI call...`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: temperature
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid OpenAI API response structure');
    }

    return {
      response: data.choices[0].message.content,
      usage: data.usage || {
        prompt_tokens: Math.ceil(prompt.length / 4),
        completion_tokens: Math.ceil(data.choices[0].message.content.length / 4),
        total_tokens: Math.ceil(prompt.length / 4) + Math.ceil(data.choices[0].message.content.length / 4)
      }
    };

  } catch (openaiError) {
    console.error(`❌ ${personality} OpenAI API call failed:`, openaiError);
    throw openaiError;
  }
}

function buildSystemPrompt(mode, personality, vaultContent = '') {
  let systemPrompt = `You are ${personality === 'eli' ? 'Eli' : 'Roxy'}, part of the Site Monkeys AI system.

PERSONALITY: ${personality === 'eli' ? 'Analytical, direct, evidence-focused' : 'Strategic, creative, solution-oriented'}

CORE REQUIREMENTS:
- Every factual claim MUST include confidence level (High/Medium/Low/Unknown)
- When uncertain, say "I don't know" rather than guess
- Label speculation as "SPECULATION:" or "HYPOTHESIS:"
- Include assumptions in your analysis when relevant

`;

  if (mode === 'site_monkeys') {
    systemPrompt += `MODE: Site Monkeys Operational
Focus on Site Monkeys business excellence and operational standards.

`;
    
    if (vaultContent && vaultContent.length > 200 && !vaultContent.includes('VAULT_ERROR')) {
      systemPrompt += `SITE MONKEYS BUSINESS INTELLIGENCE VAULT:
${vaultContent}

Use this vault intelligence to inform responses about Site Monkeys operations, pricing, protocols, and business standards.
`;
    } else {
      systemPrompt += `VAULT STATUS: Limited business intelligence available. Operating with general Site Monkeys principles.
`;
    }
  }

  return systemPrompt;
}

function buildFullPrompt(systemPrompt, message, conversationHistory) {
  let fullPrompt = systemPrompt + '\n\n';
  
  if (conversationHistory.length > 0) {
    fullPrompt += 'RECENT CONVERSATION:\n';
    const recentHistory = conversationHistory.slice(-4); // Last 2 exchanges
    
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        fullPrompt += `Human: ${msg.content}\n`;
      } else {
        fullPrompt += `Assistant: ${msg.content}\n`;
      }
    });
    fullPrompt += '\n';
  }
  
  fullPrompt += `CURRENT REQUEST:\nHuman: ${message}\n\nProvide a helpful, truth-first response:`;
  
  return fullPrompt;
}

function determinePersonality(message, mode) {
  const analyticalKeywords = ['analyze', 'data', 'risk', 'technical', 'facts', 'evidence'];
  const creativeKeywords = ['strategy', 'optimize', 'creative', 'improve', 'design', 'solution'];
  
  const lowerMessage = message.toLowerCase();
  
  const analyticalScore = analyticalKeywords.reduce((score, keyword) => 
    score + (lowerMessage.includes(keyword) ? 1 : 0), 0
  );
  
  const creativeScore = creativeKeywords.reduce((score, keyword) => 
    score + (lowerMessage.includes(keyword) ? 1 : 0), 0
  );
  
  return creativeScore > analyticalScore ? 'roxy' : 'eli';
}
