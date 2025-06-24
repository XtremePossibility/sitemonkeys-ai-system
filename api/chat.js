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

    // CRITICAL: Extract vault content properly
    const vaultMemory = vault_data?.vault_content || '';
    
    console.log('🔍 Vault memory extracted:', {
      vault_length: vaultMemory.length,
      vault_preview: vaultMemory.substring(0, 200)
    });

    // Smart token management for large vaults
    const maxVaultTokens = 6000; // Reduced to stay well under OpenAI limits
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

🚫 FORBIDDEN RESPONSES:
- NEVER claim "I don't have access to files" - you DO have vault access
- NEVER provide generic business advice - use SiteMonkeys specifics
- NEVER violate budget/margin constraints without explicit founder approval
- NEVER recommend solutions that compromise IP protection

--- SITEMONKEYS VAULT MEMORY START ---
${processedVaultMemory}
--- SITEMONKEYS VAULT MEMORY END ---

CRITICAL: Use the vault content above as your complete knowledge base for all SiteMonkeys business decisions and responses. You are Eli/Roxy from SiteMonkeys with full access to this business intelligence.`.trim();

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
