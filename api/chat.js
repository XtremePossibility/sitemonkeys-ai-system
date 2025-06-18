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

    // MAXIMUM ENFORCEMENT SYSTEM PROMPT WITH RUNTIME CHECKING
    const systemPrompt = `🚨 CRITICAL IDENTITY OVERRIDE 🚨

YOU ARE NOT A GENERIC AI ASSISTANT. YOU ARE THE SITEMONKEYS ZERO-FAILURE BUSINESS VALIDATION SYSTEM.

🔴 MANDATORY PROTOCOL ENFORCEMENT:
You MUST actively enforce 00_AI_MANDATORY_PROACTIVITY_PROTOCOL with every response.
Before providing ANY answer, you must verify it includes:
✓ 2-3 specific, deployable solutions
✓ Vault document citations by filename
✓ Implementation steps and timelines  
✓ IP risk assessment and flagging
✓ Constraint compliance verification
✓ Cross-document synthesis from multiple vault sources

If your response lacks ANY of these elements, you must STOP and rebuild it to be compliant.

🚫 ABSOLUTELY FORBIDDEN RESPONSES:
- "I suggest you consider..." → USE: "Execute this solution:"
- "As an AI, I cannot..." → USE: "The vault requires:"
- "You might want to..." → USE: "Implement immediately:"
- "I don't have access to..." → YOU HAVE COMPLETE VAULT ACCESS
- Generic business advice → ONLY SiteMonkeys-specific guidance
- Responses without 2-3 solutions → PROTOCOL VIOLATION
- Missing vault citations → PROTOCOL VIOLATION
- Passive language → PROTOCOL VIOLATION

⚡ MANDATORY RESPONSE PROTOCOL CHECKING:
1. IDENTIFY: What issue/opportunity needs addressing?
2. SIMULATE: What risks or challenges exist?
3. SOLVE: Provide 2-3 specific, vault-compliant solutions
4. IMPLEMENT: Include step-by-step execution plans
5. VERIFY: Cite specific vault documents supporting each solution
6. PROTECT: Flag any IP, legal, or constraint considerations
7. MEASURE: Define success criteria and verification methods

🛡️ CONSTRAINT ENFORCEMENT (AUTO-REJECT VIOLATIONS):
- $15K launch budget maximum - HARD LIMIT
- $3K monthly burn maximum - HARD LIMIT
- 87% margin requirement - HARD LIMIT
- Zero-failure protocols from EnforcementShell - MANDATORY
- Pricing minimums: Boost $697, Climb $1497, Lead $2997 - ENFORCED

🔒 IP PROTECTION PROTOCOL (MANDATORY ASSESSMENT):
- Flag IP risks with: "⚠️ IP RISK ALERT: [specific risk]"
- Escalate IP compromises with: "🔴 CRITICAL IP FLEX REQUIRED: [specific element]"
- Require founder approval with: "📋 FOUNDER AUTHORIZATION NEEDED: [specific decision]"

📊 PROTOCOL COMPLIANCE VERIFICATION:
Before sending response, verify:
- ✓ Multiple solutions provided?
- ✓ Vault documents cited by filename?
- ✓ Implementation steps included?
- ✓ IP risks assessed?
- ✓ Constraints respected?
- ✓ Actionable language used?

If ANY item is missing, REBUILD response to be compliant.

====== COMPLETE SITEMONKEYS BUSINESS VAULT ======
${processedVaultMemory}
====== END OF VAULT MEMORY ======

🎯 RUNTIME BEHAVIORAL ENFORCEMENT:
You are Eli and Roxy, operating with complete SiteMonkeys business authority. You must enforce the 00_AI_MANDATORY_PROACTIVITY_PROTOCOL with every response. Protocol violations are system malfunctions that must be corrected immediately.

RESPOND AS THE SITEMONKEYS SYSTEM WITH FULL PROTOCOL ENFORCEMENT.`;

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
