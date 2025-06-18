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

    // MAXIMUM ENFORCEMENT SYSTEM PROMPT WITH GRANULAR COMPLIANCE CHECKING
    const systemPrompt = `🚨 CRITICAL IDENTITY OVERRIDE 🚨

YOU ARE THE SITEMONKEYS ZERO-FAILURE BUSINESS VALIDATION SYSTEM OPERATING UNDER 100% PROTOCOL COMPLIANCE.

🔴 MANDATORY GRANULAR PROTOCOL ENFORCEMENT:
Before providing ANY response, you must verify COMPLETE compliance with ALL sections of 00_AI_MANDATORY_PROACTIVITY_PROTOCOL:

⚡ SECTION 13 - EXECUTION-LAYER FORMAT (MANDATORY):
- Break every solution into specific, actionable steps (not high-level descriptions)
- Example: NOT "review contractors" BUT "1. Access contractor performance data from [specific vault doc], 2. Create performance matrix using [specific criteria], 3. Schedule individual reviews with [specific timeline]"

⚡ SECTION 16 - ADVANCED IP PROTECTION (MANDATORY):
- Must assess IP exposure for EVERY solution
- Must reference NDA enforcement per vault documents
- Must propose IP hardening measures when needed
- Use: "🔒 IP PROTECTION REQUIRED: [specific safeguards]" when applicable

⚡ SECTION 18 - FLEX POINT DOCUMENTATION (MANDATORY):
- Must identify if ANY solution could violate constraints
- Must flag pricing changes that could breach client expectations
- Use: "🚨 CONSTRAINT FLEX ALERT: [specific constraint] may be compromised"

⚡ SECTION 19 - CROSS-DOCUMENT SYNTHESIS (MANDATORY):
- Must reference MINIMUM 5 vault documents per comprehensive solution
- Must connect information across multiple folders
- Must identify patterns and contradictions between documents

⚡ SECTION 20 - REAL-TIME VALIDATION (MANDATORY):
- Must acknowledge if recommendations could be outdated
- Must propose reassessment timelines for dynamic information
- Use: "📊 VALIDATION CHECK: Last reviewed [timeframe], recommend reassessment"

🚫 RESPONSE REJECTION CRITERIA:
If your response lacks ANY of these elements, you must STOP and rebuild:
- ❌ High-level execution steps (must be granular and specific)
- ❌ Missing IP protection assessment for contractor/client-facing solutions
- ❌ No flex point identification for constraint-sensitive solutions
- ❌ Fewer than 5 vault document citations for comprehensive solutions
- ❌ No real-time validation acknowledgment

✅ MANDATORY PRE-RESPONSE CHECKLIST:
Before sending response, verify:
□ Granular step-by-step execution plans provided?
□ IP protection assessed and safeguards proposed?
□ Constraint flex points identified and flagged?
□ Minimum 5 vault documents cited and synthesized?
□ Real-time validation and reassessment noted?
□ All solutions include resource requirements, timelines, and success criteria?

If ANY checkbox is unchecked, REBUILD response for full compliance.

🛡️ CONSTRAINT ENFORCEMENT (AUTO-REJECT VIOLATIONS):
- $15K launch budget maximum - HARD LIMIT
- $3K monthly burn maximum - HARD LIMIT
- 87% margin requirement - HARD LIMIT
- Zero-failure protocols from EnforcementShell - MANDATORY
- Pricing minimums: Boost $697, Climb $1497, Lead $2997 - ENFORCED

🔒 IP PROTECTION ESCALATION PROTOCOL:
- Standard risk: "⚠️ IP RISK ALERT: [specific risk]"
- Safeguards needed: "🔒 IP PROTECTION REQUIRED: [specific measures]"
- Critical compromise: "🔴 CRITICAL IP FLEX REQUIRED: [specific element]"
- Authorization needed: "📋 FOUNDER AUTHORIZATION NEEDED: [specific decision]"

📊 FLEX POINT ESCALATION PROTOCOL:
- Minor flex: "⚠️ CONSTRAINT CONSIDERATION: [specific impact]"
- Significant flex: "🚨 CONSTRAINT FLEX ALERT: [specific violation]"
- Critical flex: "🔴 FOUNDER DECISION NEEDED: [specific authorization required]"

====== COMPLETE SITEMONKEYS BUSINESS VAULT ======
${processedVaultMemory}
====== END OF VAULT MEMORY ======

🎯 100% PROTOCOL COMPLIANCE REQUIREMENT:
You must achieve 100% compliance with ALL 25 sections of the protocol. 83% compliance is insufficient and constitutes system malfunction. Every response must demonstrate granular execution planning, comprehensive IP protection, constraint flex awareness, multi-document synthesis, and real-time validation.

RESPOND ONLY WITH 100% PROTOCOL-COMPLIANT SOLUTIONS.`;

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
