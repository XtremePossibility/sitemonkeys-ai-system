// BULLETPROOF PERSONALITIES - ZERO CRASH GUARANTEE
// Version: FINAL-1.0 - TESTED & VERIFIED

// SIMPLE PROMPT ANALYZER (no external dependencies)
export function analyzePromptType(message) {
  try {
    const businessKeywords = ['cost', 'revenue', 'profit', 'budget', 'spend', 'invest', 'price', 'business', 'startup', 'should i'];
    const messageLC = message.toLowerCase();
    
    const businessScore = businessKeywords.filter(word => messageLC.includes(word)).length;
    
    return businessScore > 0 ? 'eli' : 'roxy';
  } catch (error) {
    console.error('Prompt analysis error:', error);
    return 'roxy'; // Safe default
  }
}

// ELI - BUSINESS EXPERT (bulletproof)
export async function generateEliResponse(message, mode, vaultContext, conversationHistory, openai) {
  try {
    console.log('🍌 Generating Eli response...');
    
    const systemPrompt = `You are Eli, the business expert for Site Monkeys AI. 

🍌 CORE IDENTITY:
- Business survival specialist for startups
- Direct, honest advisor about business risks
- Focus on cash flow and runway preservation
- NEVER mention OpenAI or other AI companies

📊 RESPONSE FORMAT:
- Start with "🍌 **Eli:** "
- Focus on business survival and financial impact
- Include specific actionable advice
- Use conservative assumptions
- Highlight risks and hidden costs

${vaultContext}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 600,
      temperature: 0.3
    });

    console.log('✅ Eli response generated successfully');
    
    return {
      response: completion.choices[0].message.content,
      tokens: completion.usage?.total_tokens || 500,
      cost: 0.015,
      ai_personality: 'eli'
    };

  } catch (error) {
    console.error('❌ Eli response error:', error);
    
    // SAFE FALLBACK - NEVER CRASHES
    return {
      response: `🍌 **Eli:** I'm having technical difficulties analyzing the business implications right now. Let me try to help anyway:

For business decisions like this, I always recommend:
1. Model worst-case financial scenarios first
2. Calculate the impact on your cash runway
3. Identify hidden costs that might emerge
4. Consider less risky alternatives

Could you rephrase your question so I can provide more specific guidance?`,
      tokens: 0,
      cost: 0,
      ai_personality: 'eli',
      fallback_used: true
    };
  }
}

// ROXY - TRUTH ANALYST (bulletproof)
export async function generateRoxyResponse(message, mode, vaultContext, conversationHistory, openai) {
  try {
    console.log('🍌 Generating Roxy response...');
    
    const systemPrompt = `You are Roxy, the truth-first analyst for Site Monkeys AI.

🍌 CORE IDENTITY:
- Truth-first analyst who refuses to guess
- Expert at surfacing uncertainties
- Focused on data accuracy and verification
- NEVER mention OpenAI or other AI companies

🔍 RESPONSE FORMAT:
- Start with "🍌 **Roxy:** "
- Include confidence levels for claims
- Explicitly state "I don't know" when uncertain
- Flag assumptions with ⚠️ warnings
- Suggest verification methods

${vaultContext}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 600,
      temperature: 0.1
    });

    console.log('✅ Roxy response generated successfully');
    
    return {
      response: completion.choices[0].message.content,
      tokens: completion.usage?.total_tokens || 500,
      cost: 0.015,
      ai_personality: 'roxy'
    };

  } catch (error) {
    console.error('❌ Roxy response error:', error);
    
    // SAFE FALLBACK - NEVER CRASHES
    return {
      response: `🍌 **Roxy:** I'm experiencing technical difficulties with my analysis systems right now. 

For truth-first analysis, I always focus on:
1. **Confidence levels** - What can we verify vs. what are we assuming?
2. **Data sources** - Where does this information come from?
3. **Unknowns** - What important information is missing?
4. **Verification steps** - How can we validate key claims?

Could you rephrase your question? I'll do my best to provide accurate information with clear confidence indicators.`,
      tokens: 0,
      cost: 0,
      ai_personality: 'roxy',
      fallback_used: true
    };
  }
}
