import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { message, vault_memory } = req.body;

    if (!message || !vault_memory) {
      return res.status(400).json({ success: false, error: 'Missing message or vault data' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: vault_memory },
        { role: 'user', content: message }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const reply = completion.choices?.[0]?.message?.content || 'No response.';
    const usage = completion.usage || { total_tokens: 0 };

    const estimatedCost = (usage.total_tokens * 0.002 / 1000).toFixed(4);

    return res.status(200).json({
      success: true,
      response: reply,
      cost_info: {
        total_tokens: usage.total_tokens,
        estimated_cost: estimatedCost
      }
    });

  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
}
