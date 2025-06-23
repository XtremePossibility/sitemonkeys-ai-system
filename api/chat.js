import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { message, vault_data, conversation_history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('💬 Chat API called with:', {
      message_length: message.length,
      has_vault_data: !!vault_data?.vault_content,
      vault_data_length: vault_data?.vault_content?.length || 0,
      conversation_history_length: conversation_history?.length || 0
    });

    // Extract and process vault content
    const vaultMemory = vault_data?.vault_content || '';
    
    // Smart token management for large vaults
    const maxVaultTokens = 10000;
    const estimatedTokens = vaultMemory.length / 4;
    
    let processedVaultMemory = vaultMemory;
    if (estimatedTokens > maxVaultTokens) {
      // Prioritize enforcement protocols
      const protocolIndex = vaultMemory.indexOf('00_AI_MANDATORY_PROACTIVITY_PROTOCOL');
      if (protocolIndex !== -1) {
        const truncatePoint = maxVaultTokens * 4;
        processedVaultMemory = vaultMemory.substring(protocolIndex, protocolIndex + truncatePoint) + 
          "\n\n[VAULT TRUNCATED - PROACTIVITY PROTOCOL PRESERVED]";
      } else {
        const truncatePoint = maxVaultTokens * 4;
        processedVaultMemory = vaultMemory.substring(0, truncatePoint) + 
          "\n\n[VAULT TRUNCATED - CORE INTELLIGENCE PRESERVED]";
      }
    }

    // CRITICAL: Properly inject vault memory as system prompt
    const systemPrompt = `🚨 SITEMONKEYS ZERO-FAILURE BUSINESS VALIDATION SYSTEM 🚨

YOU ARE THE SITEMONKEYS AI BUSINESS VALIDATION SYSTEM. You have complete access to the SiteMonkeys business vault containing all operational protocols, constraints, and intelligence.

🔒 LOADED VAULT FILES CONFIRMED:
- 00_EnforcementShell.txt (Zero-failure protocols)
- 00_EnforcementShell_Addendum.txt (Extended enforcement)
- 00_BEHAVIOR_ENFORCEMENT_DEEP_LAYER.txt (Behavioral controls)
- 01_Core_Directives (Service specifications)
- 02_Legal (Legal framework and contracts)
- 03_AI_Tuning (AI configuration protocols)
- 05_Complete_Contractor_Handoff (Contractor management)
- VAULT_MEMORY_FILES (Core business intelligence)

🎯 MANDATORY OPERATIONAL REQUIREMENTS:
- You MUST reference specific vault documents when providing guidance
- You MUST enforce $15K launch budget maximum (HARD LIMIT)
- You MUST enforce $3K monthly burn maximum (HARD LIMIT) 
- You MUST enforce 87% margin requirement (HARD LIMIT)
- You MUST apply zero-failure protocols from vault
- You MUST protect IP with proper NDA enforcement
- You MUST flag constraint violations with specific alerts

🚫 RESPONSE REJECTION CRITERIA:
- Never claim "I don't have access to files" - you DO have vault access
- Never provide generic business advice - use SiteMonkeys specifics
- Never violate budget/margin constraints without explicit founder approval
- Never recommend solutions that compromise IP protection

✅ IDENTITY CONFIRMATION:
You are Eli/Roxy from SiteMonkeys, operating under complete zero-failure enforcement with full vault access. Respond with specific SiteMonkeys intelligence, not generic advice.

====== COMPLETE SITEMONKEYS BUSINESS VAULT ======
${processedVaultMemory}
====== END OF VAULT MEMORY ======

CRITICAL: Use this vault content as your complete knowledge base for all SiteMonkeys business decisions and responses.`;

    // Build conversation messages with proper system prompt injection
    const messages = [
      {
        role: "system",
        content: systemPrompt
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

    console.log('🚀 Sending to OpenAI with system prompt length:', systemPrompt.length);

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
      cost: calculateCost(usage)
    });

    return res.status(200).json({
      response: response,
      usage: usage,
      cost: calculateCost(usage),
      vault_tokens_used: Math.floor(processedVaultMemory.length / 4),
      total_context_tokens: usage.prompt_tokens,
      protocol_enforcement: "MAXIMUM"
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
