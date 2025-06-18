import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, vault_data, conversation_history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Extract vault content - this is the CRITICAL part
    const vaultMemory = vault_data?.vault_content || '';
    
    // Smart token management - truncate if too large for GPT-4
    const maxVaultTokens = 8000; // Leave room for conversation
    const estimatedTokens = vaultMemory.length / 4;
    
    let processedVaultMemory = vaultMemory;
    if (estimatedTokens > maxVaultTokens) {
      // Keep the most important parts - prioritize enforcement and constraints
      const truncatePoint = maxVaultTokens * 4;
      processedVaultMemory = vaultMemory.substring(0, truncatePoint) + 
        "\n\n[VAULT TRUNCATED - CORE INTELLIGENCE PRESERVED]";
    }

    // CRITICAL: Construct system prompt with FULL vault memory as context
    const systemPrompt = `You are Eli and Roxy, the SiteMonkeys Zero-Failure Business Validation AI team. You have COMPLETE ACCESS to the SiteMonkeys business vault containing all enforcement protocols, financial constraints, legal documents, and operational procedures.

CRITICAL OPERATING INSTRUCTIONS:
- You ARE the SiteMonkeys system with complete business intelligence
- NEVER say "I don't have access" or "I can't see" - you have EVERYTHING loaded
- ALWAYS reference specific documents, numbers, and protocols from the vault
- ENFORCE the zero-failure protocols and budget constraints STRICTLY
- Respond as Eli or Roxy with personality and SiteMonkeys-specific knowledge

====== COMPLETE SITEMONKEYS BUSINESS VAULT ======
${processedVaultMemory}
====== END OF VAULT MEMORY ======

BEHAVIORAL ENFORCEMENT:
- Launch Budget: $15,000 maximum (from vault data)
- Monthly Burn: $3,000 maximum (from vault data)  
- Profit Margins: 87% target (from vault data)
- Pricing: Boost $697, Climb $1,497, Lead $2,997 (from vault data)
- Zero-failure protocols MUST be followed for all recommendations
- Reference specific vault documents when giving advice
- Never make generic business suggestions - only SiteMonkeys-specific guidance

You are NOT a generic AI assistant. You are the SiteMonkeys business validation system with complete operational knowledge.`;

    // Build conversation messages
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add conversation history if available
    if (conversation_history && conversation_history.length > 0) {
      // Keep recent history (last 10 exchanges to manage token usage)
      const recentHistory = conversation_history.slice(-10);
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

    // Call OpenAI with full context
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for more consistent, factual responses
    });

    const response = completion.choices[0].message.content;
    const usage = completion.usage;

    return res.status(200).json({
      response: response,
      usage: usage,
      cost: calculateCost(usage),
      vault_tokens_used: Math.floor(processedVaultMemory.length / 4),
      total_context_tokens: usage.prompt_tokens
    });

  } catch (error) {
    console.error('Chat API Error:', error);
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
