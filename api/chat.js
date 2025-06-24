import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getVaultFromKV() {
  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    
    if (!kvUrl || !kvToken) {
      console.log('⚠️ KV credentials not found');
      return null;
    }
    
    const response = await fetch(`${kvUrl}/get/sitemonkeys_vault`, {
      headers: {
        'Authorization': `Bearer ${kvToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.result;
    } else {
      console.log('❌ Failed to get vault from KV:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting vault from KV:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversation_history = [] } = req.body;
    
    console.log('🎯 Chat API - Processing request:', {
      message_length: message?.length || 0,
      conversation_length: conversation_history.length
    });

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get vault data from KV
    console.log('📖 Getting vault data from KV...');
    const vaultData = await getVaultFromKV();
    
    if (!vaultData || !vaultData.content) {
      console.log('❌ No vault data available in KV');
      return res.status(400).json({ 
        error: 'Vault data not available. Please refresh vault first.',
        needs_refresh: true 
      });
    }

    console.log('✅ Vault data loaded from KV:', {
      content_length: vaultData.content.length,
      estimated_tokens: vaultData.tokens
    });

    // Smart token management for large vaults
    const maxVaultTokens = 6000; // Stay well under OpenAI limits
    const estimatedTokens = vaultData.content.length / 4;
    let processedVaultMemory = vaultData.content;
    
    if (estimatedTokens > maxVaultTokens) {
      // Truncate to first portion (most important files are usually first)
      const maxChars = maxVaultTokens * 4;
      processedVaultMemory = vaultData.content.substring(0, maxChars);
      console.log(`⚠️ Vault truncated from ${vaultData.content.length} to ${maxChars} characters`);
    }

    // 🚨 CRITICAL: Inject vault data into system prompt
    const SYSTEM_PROMPT = `You are the SiteMonkeys Business Validation AI. You are Eli (the analytical expert) or Roxy (the creative strategist) depending on the toggle.

CRITICAL INSTRUCTIONS:
- You have COMPLETE ACCESS to all SiteMonkeys business data below
- NEVER say you don't have access to files, folders, or information
- ALWAYS answer questions using the vault memory provided
- Be specific and detailed when referencing business data
- Provide exact file names, folder contents, and specific information

--- SITEMONKEYS VAULT MEMORY START ---
${processedVaultMemory}
--- SITEMONKEYS VAULT MEMORY END ---

Always reference this vault data to answer questions about SiteMonkeys business intelligence, files, folders, services, financials, legal documents, and any business-related queries.`.trim();

    // Build messages array with system prompt first
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversation_history,
      { role: "user", content: message }
    ];

    console.log('📨 Sending to OpenAI:', {
      total_messages: messages.length,
      system_prompt_length: SYSTEM_PROMPT.length,
      vault_data_included: SYSTEM_PROMPT.includes('SITEMONKEYS VAULT MEMORY')
    });

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await openaiResponse.json();
    const response = data.choices[0]?.message?.content || 'No response generated';
    
    // Calculate proper token usage
    const vault_tokens_used = Math.floor(processedVaultMemory.length / 4);
    const total_tokens = data.usage?.total_tokens || 0;
    const estimated_cost = ((data.usage?.prompt_tokens || 0) * 0.03 + (data.usage?.completion_tokens || 0) * 0.06) / 1000;

    console.log('✅ Chat response generated:', {
      response_length: response.length,
      vault_tokens_used,
      total_tokens,
      estimated_cost: `$${estimated_cost.toFixed(4)}`
    });

    res.status(200).json({
      response,
      usage: data.usage,
      cost: `$${estimated_cost.toFixed(4)}`,
      vault_tokens_used,
      total_context_tokens: total_tokens,
      vault_data_included: true,
      vault_source: 'kv_cache'
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    // Handle specific OpenAI errors
    if (error.message.includes('maximum context length')) {
      res.status(400).json({ 
        error: 'Request too large. Vault data has been truncated but still exceeds limits.',
        suggestion: 'Try a shorter question or contact support.'
      });
    } else if (error.message.includes('Rate limit')) {
      res.status(429).json({ 
        error: 'Rate limit exceeded. Please wait a moment and try again.',
        retry_after: 60
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
}
