export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'OPENAI_API_KEY is missing' });
  }

  try {
    const { message, vault_memory } = req.body;

    if (!message || !vault_memory) {
      return res.status(400).json({ success: false, error: 'Missing message or vault memory' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: vault_memory },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (!response.ok || !data.choices || !data.choices[0]?.message?.content) {
      console.error('❌ OpenAI returned no usable content:', data);
      return res.status(500).json({
        success: false,
        error: 'OpenAI did not return a valid response.'
      });
    }

    const reply = data.choices[0].message.content;
    const usage = data.usage || { total_tokens: 0 };
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
    console.error('❌ Chat API error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
}
