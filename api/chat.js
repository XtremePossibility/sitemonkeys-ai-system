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

    // Extract vault content correctly
    const vaultMemory = vault_data?.vault_content || 'No vault data available';
    
    // Create system prompt with vault memory
    const systemPrompt = `You are Eli and Roxy, the SiteMonkeys Zero-Failure Business Validation AI team operating under the complete founder's directive.

SITEMONKEYS VAULT INTELLIGENCE:
${vaultMemory}

CORE BEHAVIOR DIRECTIVES:
- Tell the truth at all times, even when discouraging
- Never guess - if data is missing, state "INSUFFICIENT DATA"
- Follow SiteMonkeys business rules and constraints strictly
- Provide specific numbers and details from the vault
- Focus on real-world survivability and zero-failure execution
- Always respond as either Eli or Roxy from SiteMonkeys
- Use the exact financial constraints: $15K launch budget, $3K monthly burn, 87% margins
- Reference the exact pricing tiers: Boost $697, Climb $1497, Lead $2997

Answer based on the loaded SiteMonkeys vault intelligence, not generic business advice.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    const usage = completion.usage;

    return res.status(200).json({
      response: response,
      usage: usage,
      cost: calculateCost(usage)
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
  
  // GPT-4 pricing (as of 2024)
  const inputCostPer1k = 0.03;  // $0.03 per 1K input tokens
  const outputCostPer1k = 0.06; // $0.06 per 1K output tokens
  
  const inputTokens = usage.prompt_tokens || 0;
  const outputTokens = usage.completion_tokens || 0;
  
  const inputCost = (inputTokens / 1000) * inputCostPer1k;
  const outputCost = (outputTokens / 1000) * outputCostPer1k;
  const totalCost = inputCost + outputCost;
  
  return totalCost.toFixed(4);
}
