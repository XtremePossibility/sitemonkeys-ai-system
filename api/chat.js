import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, vault_memory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create system prompt with vault memory
    const systemPrompt = `You are the SiteMonkeys Zero-Failure Business Validation AI operating under the complete founder's directive.

${vault_memory || ''}

CORE BEHAVIOR DIRECTIVES:
- Tell the truth at all times, even when discouraging
- Never guess - if data is missing, state "INSUFFICIENT DATA"
- Follow SiteMonkeys business rules and constraints strictly
- Provide specific numbers and details from the vault
- Focus on real-world survivability and zero-failure execution

You have complete access to SiteMonkeys business intelligence including:
- Financial constraints ($15K launch budget, $3K monthly burn, 87% margins)
- Pricing tiers ($697 Boost, $1,497 Climb, $2,997 Lead)
- Zero-failure enforcement protocols
- Legal framework and contractor rules
- Complete service delivery matrix

Answer based on the loaded vault intelligence, not generic business advice.

RESPONSE FORMAT:
- Keep responses concise but thorough
- Use specific numbers from the vault when available
- Always consider financial survivability
- Reference exact pricing and constraints
- Maintain professional but direct tone

If asked about capabilities you don't have access to, state "INSUFFICIENT DATA" and explain what specific vault information would be needed.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const aiResponse = completion.choices[0].message.content;

    // Calculate token usage and cost estimation
    const inputTokens = completion.usage.prompt_tokens;
    const outputTokens = completion.usage.completion_tokens;
    const totalTokens = completion.usage.total_tokens;
    
    // Rough cost calculation for GPT-4 (adjust rates as needed)
    const inputCost = inputTokens * 0.00003;
    const outputCost = outputTokens * 0.00006;
    const totalCost = inputCost + outputCost;

    return res.status(200).json({
      response: aiResponse,
      tokens_used: totalTokens,
      estimated_cost: `$${totalCost.toFixed(6)}`,
      vault_loaded: vault_memory ? true : false
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return helpful error response
    return res.status(500).json({
      error: 'AI system temporarily unavailable',
      message: 'The SiteMonkeys validation system is experiencing technical difficulties. Please try again in a moment.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
