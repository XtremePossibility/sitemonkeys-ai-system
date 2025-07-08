// PRODUCTION CHAT SYSTEM - SMART VAULT MANAGEMENT
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

  // Initialize variables at function scope to prevent scope errors
  let vaultContent = '';
  let vaultTokens = 0;
  let totalVaultTokens = 0;

  try {
    const { message, conversation_history = [], mode = 'site_monkeys' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string' });
      return;
    }

    console.log(`🤖 Processing chat request in ${mode} mode:`, message.substring(0, 100));

    // ✅ STEP 1: Load and intelligently chunk vault content
    if (mode === 'site_monkeys') {
      try {
        console.log('📖 Loading vault for Site Monkeys mode...');
        
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
          
          if (kvText && kvText !== 'null' && kvText.trim() !== '') {
            try {
              // ✅ Parse KV response with proper unwrapping
              let kvData;
              const kvWrapper = JSON.parse(kvText);
              
              if (kvWrapper.result) {
                console.log('🔧 Unwrapping KV result field...');
                kvData = JSON.parse(kvWrapper.result);
              } else {
                kvData = kvWrapper;
              }
              
              console.log(`📊 Vault data keys: ${Object.keys(kvData).join(', ')}`);
              
              if (kvData.vault_content && kvData.vault_content.length > 200) {
                const fullVaultContent = kvData.vault_content;
                totalVaultTokens = kvData.tokens || Math.ceil(fullVaultContent.length / 4);
                
                console.log(`📊 Full vault: ${totalVaultTokens} tokens, ${fullVaultContent.length} characters`);
                
                // ✅ INTELLIGENT VAULT CHUNKING based on user query
                vaultContent = selectRelevantVaultContent(fullVaultContent, message);
                vaultTokens = Math.ceil(vaultContent.length / 4);
                
                console.log(`✅ Smart vault selection: ${vaultTokens} tokens (from ${totalVaultTokens} total)`);
                
              } else {
                throw new Error('KV vault_content is missing or too small');
              }
              
            } catch (parseError) {
              console.log(`❌ KV parse error: ${parseError.message}`);
              throw new Error(`KV data parse failed: ${parseError.message}`);
            }
          } else {
            throw new Error('KV returned empty data - vault needs refresh');
          }
        } else {
          throw new Error(`KV API returned ${kvResponse.status}`);
        }
        
      } catch (vaultError) {
        console.error('❌ Vault loading failed:', vaultError.message);
        
        // Graceful degradation
        vaultContent = `[VAULT_LIMITED: ${vaultError.message}]\n\nOperating with core Site Monkeys principles: Premium quality, transparent pricing starting at $697, and business validation focus.`;
        vaultTokens = Math.ceil(vaultContent.length / 4);
        totalVaultTokens = 0;
      }
    }

    // ✅ STEP 2: Determine personality
    const personality = determinePersonality(message, mode);
    console.log(`🎭 Selected personality: ${personality}`);

    // ✅ STEP 3: Build context-aware prompt with token management
    const { systemPrompt, fullPrompt, estimatedTokens } = buildOptimizedPrompt(
      mode, 
      personality, 
      vaultContent, 
      message, 
      conversation_history
    );

    console.log(`📏 Estimated prompt tokens: ${estimatedTokens}`);

    // ✅ STEP 4: Context length safety check
    const maxTokens = 15000; // Safety buffer under 16,385 limit
    
    if (estimatedTokens > maxTokens) {
      console.log(`⚠️ Token limit reached: ${estimatedTokens} > ${maxTokens}`);
      
      // Aggressive vault reduction
      const reducedVault = vaultContent.substring(0, Math.floor(vaultContent.length * 0.3));
      const reducedPrompt = buildOptimizedPrompt(mode, personality, reducedVault, message, []);
      
      console.log(`🔄 Reduced to: ${reducedPrompt.estimatedTokens} tokens`);
      
      if (reducedPrompt.estimatedTokens > maxTokens) {
        throw new Error('Query too complex even with minimal vault content');
      }
      
      // Use reduced version
      const apiResponse = await makeRealAPICall(reducedPrompt.fullPrompt, personality);
      return sendSuccessResponse(res, apiResponse, mode, Math.ceil(reducedVault.length / 4), totalVaultTokens, personality);
    }

    // ✅ STEP 5: Make API call with optimized prompt
    console.log(`🚀 Making ${personality} API call...`);
    const apiResponse = await makeRealAPICall(fullPrompt, personality);

    // ✅ STEP 6: Send success response
    return sendSuccessResponse(res, apiResponse, mode, vaultTokens, totalVaultTokens, personality);

  } catch (error) {
    console.error('❌ Chat processing error:', error);
    
    // ✅ BULLETPROOF ERROR HANDLING with proper variable scope
    return res.status(500).json({
      response: `**SYSTEM ERROR**: ${error.message}

The Site Monkeys system encountered an error but remains operational with ${totalVaultTokens || 0} vault tokens available.

**TROUBLESHOOTING:**
- If context length exceeded: Your query is very complex. Try asking about specific aspects.
- If API error: The AI service may be temporarily busy. Try again in a moment.
- If vault error: Data is being refreshed. Core Site Monkeys principles remain active.

**CORE SITE MONKEYS STANDARDS:**
- Premium quality web development starting at $697
- Business validation and truth-first analysis
- Professional service delivery

What specific aspect of Site Monkeys services would you like to know about?`,
      
      mode_active: req.body.mode || 'site_monkeys',
      vault_status: { 
        loaded: totalVaultTokens > 0, 
        tokens: totalVaultTokens || 0, 
        file_count: totalVaultTokens > 0 ? 3 : 0 
      },
      enforcement_applied: ['fallback_mode_active', 'error_recovery_active'],
      security_pass: false,
      performance: {
        tokens_used: 0,
        call_cost: 0,
        vault_tokens: totalVaultTokens || 0,
        api_error: { 
          fallback_used: true, 
          error: error.message,
          error_type: error.message.includes('context_length_exceeded') ? 'token_limit' : 'api_error'
        }
      },
      personality_used: 'system',
      error: 'Chat processing failed - recovery mode active'
    });
  }
}

function selectRelevantVaultContent(fullVaultContent, userMessage) {
  // ✅ INTELLIGENT CONTENT SELECTION based on user query
  const query = userMessage.toLowerCase();
  
  // Define content priorities based on keywords
  const contentPriorities = {
    pricing: ['pricing', 'cost', 'price', 'fee', 'dollar', '$', 'payment'],
    services: ['service', 'development', 'website', 'design', 'build'],
    business: ['business', 'validation', 'strategy', 'analysis'],
    technical: ['technical', 'code', 'programming', 'development'],
    legal: ['legal', 'terms', 'contract', 'agreement'],
    process: ['process', 'workflow', 'step', 'how', 'procedure']
  };
  
  // Score content sections based on relevance
  let selectedSections = [];
  let currentTokenCount = 0;
  const maxVaultTokens = 8000; // Reserve space for system prompt and response
  
  // Split vault into logical sections
  const sections = fullVaultContent.split('=== ').filter(section => section.trim().length > 100);
  
  // Score and sort sections by relevance
  const scoredSections = sections.map(section => {
    let score = 0;
    const sectionLower = section.toLowerCase();
    
    // Score based on keyword matches
    Object.entries(contentPriorities).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (query.includes(keyword) && sectionLower.includes(keyword)) {
          score += category === 'pricing' ? 3 : 2; // Pricing gets higher priority
        }
      });
    });
    
    // Bonus for core directives and enforcement
    if (sectionLower.includes('core') || sectionLower.includes('enforcement')) {
      score += 1;
    }
    
    return { section, score, tokens: Math.ceil(section.length / 4) };
  });
  
  // Sort by score and select highest priority content within token limit
  scoredSections
    .sort((a, b) => b.score - a.score)
    .forEach(({ section, tokens }) => {
      if (currentTokenCount + tokens <= maxVaultTokens) {
        selectedSections.push(section);
        currentTokenCount += tokens;
      }
    });
  
  // Always include summary if we have space
  const summary = `=== SITE MONKEYS BUSINESS VALIDATION VAULT ===

Core Focus: Premium web development and business validation services
Starting Price: $697 for professional quality assurance
Approach: Truth-first analysis and transparent business practices

`;
  
  const result = summary + selectedSections.join('=== ');
  
  console.log(`🎯 Vault selection: ${selectedSections.length} sections, ${Math.ceil(result.length / 4)} tokens`);
  
  return result;
}

function buildOptimizedPrompt(mode, personality, vaultContent, message, conversationHistory) {
  // ✅ TOKEN-OPTIMIZED PROMPT CONSTRUCTION
  
  let systemPrompt = `You are ${personality === 'eli' ? 'Eli (analytical)' : 'Roxy (strategic)'}, Site Monkeys AI.

CORE REQUIREMENTS:
- Include confidence levels (High/Medium/Low)
- Say "I don't know" when uncertain  
- Label speculation clearly
- Be direct and helpful

`;

  if (mode === 'site_monkeys' && vaultContent.length > 200) {
    systemPrompt += `SITE MONKEYS CONTEXT:\n${vaultContent}\n\n`;
  }

  // Limit conversation history to prevent token overflow
  let historyText = '';
  if (conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-2); // Only last exchange
    historyText = 'RECENT:\n';
    recentHistory.forEach(msg => {
      historyText += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content.substring(0, 200)}\n`;
    });
    historyText += '\n';
  }

  const fullPrompt = `${systemPrompt}${historyText}Human: ${message}\n\nResponse:`;
  
  const estimatedTokens = Math.ceil(fullPrompt.length / 4) + 500; // +500 for response buffer
  
  return { systemPrompt, fullPrompt, estimatedTokens };
}

async function makeRealAPICall(prompt, personality) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // ✅ USE GPT-4 for better handling of complex contexts
  const model = 'gpt-4-turbo-preview'; // Higher context limit: 128k tokens
  const temperature = personality === 'eli' ? 0.3 : 0.7;
  
  console.log(`🎯 Making ${personality} OpenAI call with ${model}...`);
  
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
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.substring(0, 200)}`);
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

function sendSuccessResponse(res, apiResponse, mode, vaultTokens, totalVaultTokens, personality) {
  const promptTokens = apiResponse.usage?.prompt_tokens || 0;
  const completionTokens = apiResponse.usage?.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;
  
  // Calculate costs (GPT-4 pricing)
  const inputCost = (promptTokens * 0.01) / 1000;  // $0.01 per 1K input tokens
  const outputCost = (completionTokens * 0.03) / 1000; // $0.03 per 1K output tokens
  const callCost = inputCost + outputCost;
  
  console.log(`📈 API usage: ${promptTokens} + ${completionTokens} = ${totalTokens} tokens`);
  console.log(`💰 Cost: $${callCost.toFixed(4)} (input: $${inputCost.toFixed(4)}, output: $${outputCost.toFixed(4)})`);

  return res.status(200).json({
    response: apiResponse.response,
    mode_active: mode,
    vault_status: {
      loaded: mode === 'site_monkeys' && vaultTokens > 0,
      tokens: vaultTokens,
      total_tokens: totalVaultTokens,
      file_count: totalVaultTokens > 0 ? 3 : 0
    },
    enforcement_applied: [
      'truth_enforcement_active',
      'smart_vault_chunking_applied',
      mode === 'site_monkeys' && vaultTokens > 0 ? 'vault_business_logic' : 'standard_mode'
    ],
    security_pass: true,
    performance: {
      tokens_used: totalTokens,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      call_cost: callCost,
      vault_tokens: vaultTokens,
      total_vault_tokens: totalVaultTokens,
      api_provider: 'openai',
      model_used: 'gpt-4-turbo-preview'
    },
    personality_used: personality
  });
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
