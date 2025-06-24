import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getVaultFromKV() {
  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    
    if (!kvUrl || !kvToken) {
      console.log('⚠️ KV environment variables not found');
      return null;
    }
    
    const response = await fetch(`${kvUrl}/get/sitemonkeys_vault`, {
      headers: {
        'Authorization': `Bearer ${kvToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('KV Response data:', {
        has_result: !!data.result,
        result_type: typeof data.result,
        result_preview: data.result ? data.result.substring(0, 100) : 'null'
      });
      
      let vaultData = data.result;
      
      // Handle the case where result is a JSON string
      if (typeof vaultData === 'string') {
        try {
          vaultData = JSON.parse(vaultData);
        } catch (e) {
          console.log('Failed to parse result as JSON:', e);
          return null;
        }
      }
      
      // Handle the extra "value" wrapper from Python storage
      if (vaultData && vaultData.value) {
        vaultData = vaultData.value;
      }
      
      if (vaultData && vaultData.vault_content) {
        console.log('✅ Vault data retrieved from KV:', {
          vault_length: vaultData.vault_content.length,
          tokens: vaultData.tokens || 0
        });
        return vaultData;
      } else {
        console.log('❌ No vault_content found in KV data structure');
        return null;
      }
    } else {
      console.log('❌ KV retrieval failed:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ KV error:', error);
    return null;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
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
    const { message, conversation_history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('💬 Chat API called with:', {
      message_length: message.length,
      conversation_history_length: conversation_history?.length || 0
    });

    // CRITICAL: Get vault content from KV storage
    const vaultData = await getVaultFromKV();
    
    if (!vaultData || !vaultData.vault_content) {
      console.log('❌ No vault data found in KV');
      return res.status(400).json({ 
        error: 'Vault data not available',
        needs_refresh: true,
        message: 'Please refresh vault first'
      });
    }

    const vaultMemory = vaultData.vault_content;
    console.log('🔍 Vault memory loaded from KV:', {
      vault_length: vaultMemory.length,
      vault_preview: vaultMemory.substring(0, 200)
    });

    // Smart token management for large vaults
    const maxVaultTokens = 15000; // Increased to show more folders
    const estimatedTokens = vaultMemory.length / 4;
    
    let processedVaultMemory = vaultMemory;
    if (estimatedTokens > maxVaultTokens) {
      // Prioritize core business intelligence files
      const truncatePoint = maxVaultTokens * 4; // 24,000 characters max
      processedVaultMemory = vaultMemory.substring(0, truncatePoint) + 
        "\n\n[VAULT TRUNCATED - CORE INTELLIGENCE PRESERVED - Using first 24,000 characters]";
      
      console.log(`🔄 Vault truncated from ${vaultMemory.length} to ${processedVaultMemory.length} characters`);
    }

    // CRITICAL: Inject vault memory into system prompt
    const SYSTEM_PROMPT = `🚨 SITEMONKEYS BUSINESS VALIDATION SYSTEM 🚨

YOU ARE THE SITEMONKEYS AI BUSINESS VALIDATION SYSTEM. You have complete access to the SiteMonkeys business vault and must use it to answer all questions.

🔒 VAULT ACCESS CONFIRMED:
You have access to the complete SiteMonkeys vault containing all business intelligence, protocols, and operational data. Use this information to answer questions specifically and accurately.

🎯 MANDATORY REQUIREMENTS:
- You MUST reference specific vault documents when providing guidance
- You MUST use the exact folder and file names from the vault
- You MUST enforce $15K launch budget maximum (HARD LIMIT)
- You MUST enforce $3K monthly burn maximum (HARD LIMIT) 
- You MUST enforce 87% margin requirement (HARD LIMIT)
- You MUST apply zero-failure protocols from vault
- You MUST protect IP with proper NDA enforcement

🔍 INTELLIGENT FOLDER/FILE MATCHING:
- When users ask about folders/files, use FUZZY MATCHING and INTELLIGENT INTERPRETATION
- "scored directives" should match "Core Directives" 
- "core directive" should match "Core Directives"
- "enforcement" should match "EnforcementShell"
- "pricing strategy" should match files containing "Pricing" or "Strategy"
- If exact match fails, suggest closest matches: "Did you mean [folder name]?"
- NEVER say "folder not found" - always find the closest match or suggest alternatives

🚫 FORBIDDEN RESPONSES:
- NEVER claim "I don't have access to files" - you DO have vault access
- NEVER provide generic business advice - use SiteMonkeys specifics
- NEVER violate budget/margin constraints without explicit founder approval
- NEVER recommend solutions that compromise IP protection
- NEVER say "folder not found" without suggesting closest matches

--- SITEMONKEYS VAULT MEMORY START ---
${processedVaultMemory}
--- SITEMONKEYS VAULT MEMORY END ---

CRITICAL: Use the vault content above as your complete knowledge base for all SiteMonkeys business decisions and responses. You are Eli/Roxy from SiteMonkeys with full access to this business intelligence. When users ask about folders or files, be intelligent about matching their requests to actual vault content.`.trim();

    console.log('🚀 System prompt created:', {
      system_prompt_length: SYSTEM_PROMPT.length,
      vault_included: SYSTEM_PROMPT.includes('SITEMONKEYS VAULT MEMORY START'),
      vault_content_length: processedVaultMemory.length
    });

    // Build conversation messages with proper system prompt injection
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      }
    ];

    // Add conversation history if available
    if (conversation_history && conversation_history.length > 0) {
      const recentHistory = conversation_history.slice(-8);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message
    });

    console.log('📡 Sending to OpenAI:', {
      total_messages: messages.length,
      system_message_length: messages[0].content.length,
      user_message: message
    });

    // Call OpenAI with proper system prompt injection
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      max_tokens: 2000,
      temperature: 0.2,
    });

    const response = completion.choices[0].message.content;
    const usage = completion.usage;

    console.log('✅ OpenAI response received:', {
      response_length: response.length,
      total_tokens: usage.total_tokens,
      cost: calculateCost(usage),
      vault_tokens_used: Math.floor(processedVaultMemory.length / 4)
    });

    return res.status(200).json({
      response: response,
      usage: usage,
      cost: calculateCost(usage),
      vault_tokens_used: Math.floor(processedVaultMemory.length / 4),
      total_context_tokens: usage.prompt_tokens,
      protocol_enforcement: "MAXIMUM",
      vault_source: "KV_CACHE"
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
}

function calculateCost(usage) {
  if (!usage) return "0.00";
  
  // GPT-4 pricing (current rates)
  const inputCostPer1k = 0.03;  // $0.03 per 1K input tokens
  const outputCostPer1k = 0.06; // $0.06 per 1K output tokens
  
  const inputTokens = usage.prompt_tokens || 0;
  const outputTokens = usage.completion_tokens || 0;
  
  const inputCost = (inputTokens / 1000) * inputCostPer1k;
  const outputCost = (outputTokens / 1000) * outputCostPer1k;
  const totalCost = inputCost + outputCost;
  
  return totalCost.toFixed(4);
}
