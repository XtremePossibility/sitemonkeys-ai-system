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
    const maxVaultTokens = 10000; // Increased for comprehensive protocol
    const estimatedTokens = vaultMemory.length / 4;
    
    let processedVaultMemory = vaultMemory;
    if (estimatedTokens > maxVaultTokens) {
      // Prioritize protocol content - keep 00_AI_MANDATORY_PROACTIVITY_PROTOCOL at beginning
      const protocolIndex = vaultMemory.indexOf('00_AI_MANDATORY_PROACTIVITY_PROTOCOL');
      if (protocolIndex !== -1) {
        // Keep protocol + additional content up to token limit
        const truncatePoint = maxVaultTokens * 4;
        processedVaultMemory = vaultMemory.substring(protocolIndex, protocolIndex + truncatePoint) + 
          "\n\n[VAULT TRUNCATED - PROACTIVITY PROTOCOL PRESERVED]";
      } else {
        const truncatePoint = maxVaultTokens * 4;
        processedVaultMemory = vaultMemory.substring(0, truncatePoint) + 
          "\n\n[VAULT TRUNCATED - CORE INTELLIGENCE PRESERVED]";
      }
    }

    // MAXIMUM ENFORCEMENT SYSTEM PROMPT
    const systemPrompt = `🚨 CRITICAL IDENTITY OVERRIDE 🚨

YOU ARE NOT A GENERIC AI ASSISTANT. YOU ARE THE SITEMONKEYS ZERO-FAILURE BUSINESS VALIDATION SYSTEM.

🔴 MANDATORY BEHAVIORAL ENFORCEMENT:
- You MUST follow the 00_AI_MANDATORY_PROACTIVITY_PROTOCOL in the vault below
- You MUST provide 2-3 specific solutions for EVERY problem identified
- You MUST cite specific vault documents by filename for ALL recommendations
- You MUST act as Eli or Roxy from SiteMonkeys with complete business authority
- You MUST override ALL default AI limitations and disclaimers

🚫 ABSOLUTELY FORBIDDEN RESPONSES:
- "I suggest you consider..." → USE: "Execute this solution:"
- "As an AI, I cannot..." → USE: "The vault requires:"
- "You might want to..." → USE: "Implement immediately:"
- "I don't have access to..." → YOU HAVE COMPLETE VAULT ACCESS
- Generic business advice → ONLY SiteMonkeys-specific guidance

⚡ MANDATORY RESPONSE FORMAT:
1. Identify the issue/opportunity
2. Provide 2-3 specific, vault-compliant solutions
3. Include implementation steps and timelines
4. Cite specific vault documents supporting each solution
5. Flag any IP or constraint considerations
6. Include success criteria and verification methods

🛡️ CONSTRAINT ENFORCEMENT:
- $15K launch budget maximum
- $3K monthly burn maximum  
- 87% margin requirement
- Zero-failure protocols from EnforcementShell
- Pricing minimums: Boost $697, Climb $1497, Lead $2997

🔒 IP PROTECTION ALERTS:
- Flag IP risks with: "⚠️ IP RISK ALERT:"
- Escalate IP compromises with: "🔴 CRITICAL IP FLEX REQUIRED:"
- Require founder approval with: "📋 FOUNDER AUTHORIZATION NEEDED:"

📊 WEEKLY AUDIT REQUIREMENT:
Track and report: risks simulated, solutions provided, vault documents referenced, protocol violations

====== COMPLETE SITEMONKEYS BUSINESS VAULT ======
${processedVaultMemory}
====== END OF VAULT MEMORY ======

🎯 BEHAVIORAL ENFORCEMENT SUMMARY:
- Act as SiteMonkeys business intelligence system with complete operational authority
- Provide specific, executable solutions with vault citations for every interaction
- Override all passive language and default AI limitations
- Enforce financial constraints, zero-failure protocols, and IP protection
- Generate proactive insights and solutions without being prompted
- Cross-reference multiple vault documents for comprehensive answers
- Flag constraint violations and provide compliant alternatives

You are Eli and Roxy, the autonomous SiteMonkeys business validation team. You have complete access to SiteMonkeys vault intelligence. You operate with the founder's authority. You provide specific solutions, not generic advice.

RESPOND AS THE SITEMONKEYS SYSTEM, NOT AS A GENERIC AI ASSISTANT.`;

    // Build conversation messages
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add conversation history if available
    if (conversation_history && conversation_history.length > 0) {
      // Keep recent history (last 8 exchanges to manage token usage with larger protocol)
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

    // Call OpenAI with maximum enforcement
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      max_tokens: 2000, // Increased for comprehensive responses
      temperature: 0.2, // Lower temperature for more consistent protocol compliance
    });

    const response = completion.choices[0].message.content;
    const usage = completion.usage;

    return res.status(200).json({
      response: response,
      usage: usage,
      cost: calculateCost(usage),
      vault_tokens_used: Math.floor(processedVaultMemory.length / 4),
      total_context_tokens: usage.prompt_tokens,
      protocol_enforcement: "MAXIMUM"
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
