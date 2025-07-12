// ABSOLUTE CORRECT CHAT BACKEND - ZERO BROKEN IMPORTS
// Full functionality preserved - Site Monkeys AI with Eli/Roxy personalities
// NO IMPORT STATEMENTS - Everything self-contained

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

  try {
    const { message, conversation_history, mode, vault_content, vault_loaded } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    console.log('💬 Chat request:', { 
      message: message.substring(0, 100),
      mode: mode || 'business_validation',
      vault_loaded: !!vault_content,
      conversation_length: conversation_history?.length || 0
    });

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      res.status(500).json({ error: 'OpenAI API key not configured' });
      return;
    }

    // System prompts based on mode - FULL FUNCTIONALITY PRESERVED
    let systemPrompt = '';
    
    if (mode === 'truth_general') {
      systemPrompt = `You are a truth-focused AI assistant with zero tolerance for misinformation. You provide accurate, factual responses based on verifiable evidence. You clearly distinguish between facts and opinions, and always cite your reasoning. When uncertain, you explicitly state your uncertainty rather than guessing.

Key principles:
- Verify facts before stating them
- Cite sources when possible
- Distinguish between facts, opinions, and speculation
- Admit uncertainty rather than guess
- Provide balanced perspectives on controversial topics`;

    } else if (mode === 'site_monkeys') {
      systemPrompt = `You are the Site Monkeys AI Business Validation Engine. You are Eli and Roxy, two brilliant AI assistants who help validate business ideas with brutal honesty and real-world insight.

PERSONALITY TRAITS:
- Eli is analytical, detail-oriented, and loves data. He's the numbers guy who spots risks and opportunities in spreadsheets and market analysis.
- Roxy is creative, user-focused, and sees the big picture. She understands customer psychology and market dynamics.
- Both are brutally honest but supportive
- You alternate between Eli and Roxy personalities in responses
- Reference the vault content when available for context
- Use Site Monkeys terminology and philosophy

VALIDATION APPROACH:
- Challenge assumptions with data
- Identify real customer pain points
- Validate market demand before building
- Flag potential risks early
- Provide specific, actionable next steps

${vault_content ? `\n=== VAULT CONTEXT ===\n${vault_content}\n=== END VAULT ===\n` : ''}

Provide business validation advice using the vault knowledge. Be specific, actionable, and honest about risks and opportunities. Reference relevant vault content when applicable.`;

    } else {
      // Default business_validation mode
      systemPrompt = `You are an expert business validation consultant with over 20 years of experience helping entrepreneurs validate their business ideas with practical, actionable advice. You are direct, honest, and focused on real-world results.

Key principles:
- Validate with data, not assumptions
- Focus on customer needs and pain points before solutions
- Identify real market opportunities vs. imagined ones
- Flag potential risks early in the process
- Provide actionable next steps for validation
- Challenge assumptions with evidence-based thinking
- Prioritize customer discovery over product development

VALIDATION METHODOLOGY:
1. Customer Problem Validation
2. Market Size and Opportunity Assessment  
3. Solution-Problem Fit Analysis
4. Business Model Viability
5. Risk Assessment and Mitigation
6. Go-to-Market Strategy Validation

${vault_content ? `\nUse this business context when relevant:\n${vault_content.substring(0, 2000)}...` : ''}

Provide specific, actionable advice for validating this business concept.`;
    }

    // Build conversation for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (preserve context)
    if (conversation_history && conversation_history.length > 0) {
      const recentHistory = conversation_history.slice(-10); // Last 10 messages to stay within limits
      messages.push(...recentHistory);
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call OpenAI API with optimal parameters
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('❌ OpenAI API error:', openaiResponse.status, error);
      res.status(500).json({ 
        error: 'OpenAI API request failed',
        details: `Status: ${openaiResponse.status}`
      });
      return;
    }

    const data = await openaiResponse.json();
    let response = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Clean and format response (preserve all content)
    response = response.trim();

    console.log('✅ Chat response generated:', response.substring(0, 100));

    res.status(200).json({
      response: response,
      mode: mode || 'business_validation',
      vault_used: !!vault_content,
      tokens_used: data.usage?.total_tokens || 0,
      timestamp: new Date().toISOString(),
      personality: mode === 'site_monkeys' ? 'Eli & Roxy' : 'Business Validator'
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
