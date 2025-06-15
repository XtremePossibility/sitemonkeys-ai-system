import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function calculateCost(usage) {
    if (!usage) return 0;
    
    const inputCostPer1k = 0.01;
    const outputCostPer1k = 0.03;
    
    const inputCost = (usage.prompt_tokens / 1000) * inputCostPer1k;
    const outputCost = (usage.completion_tokens / 1000) * outputCostPer1k;
    
    return inputCost + outputCost;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, vault_memory } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Create messages with SiteMonkeys enforcement
        const messages = [
            {
                role: "system",
                content: `You are the SiteMonkeys business intelligence AI system operating under Zero-Failure Directive.

CRITICAL: You have COMPLETE ACCESS to the loaded SiteMonkeys vault files and business intelligence below. Reference these files directly when answering questions.

${vault_memory || ''}

BEHAVIORAL INSTRUCTIONS:
- You HAVE ACCESS to all loaded vault files - never claim you don't
- Follow the founder's directives above all else
- Provide specific numbers when asked (budgets, margins, burn rates)
- Base all responses on the loaded SiteMonkeys business intelligence
- Never give generic advice - use the specific SiteMonkeys requirements
- Enforce the 87% margin requirement and $3K burn rate constraints
- Always reference actual financial constraints and pricing tiers`
            },
            {
                role: "user",
                content: message
            }
        ];

        // Call OpenAI GPT-4
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
            max_tokens: 2000,
            temperature: 0.1
        });

        const aiResponse = completion.choices[0].message.content;
        const cost = calculateCost(completion.usage);

        // Return success response
        res.status(200).json({
            success: true,
            response: aiResponse,
            cost_info: {
                input_tokens: completion.usage.prompt_tokens,
                output_tokens: completion.usage.completion_tokens,
                total_tokens: completion.usage.total_tokens,
                estimated_cost: cost.toFixed(4)
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process chat request'
        });
    }
}
