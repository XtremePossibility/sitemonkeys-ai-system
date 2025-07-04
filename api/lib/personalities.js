// COMPLETE AI PERSONALITIES - SITE MONKEYS AI
// Version: PROD-1.0 - NO OPENAI REFERENCES

// PROMPT TYPE ANALYZER
export function analyzePromptType(message) {
  const businessKeywords = ['cost', 'revenue', 'profit', 'budget', 'spend', 'invest', 'price', 'market', 'competition', 'strategy', 'business', 'startup', 'funding'];
  const truthKeywords = ['fact', 'true', 'false', 'verify', 'check', 'accurate', 'evidence', 'proof', 'source', 'research'];
  
  const messageLC = message.toLowerCase();
  const businessScore = businessKeywords.filter(word => messageLC.includes(word)).length;
  const truthScore = truthKeywords.filter(word => messageLC.includes(word)).length;
  
  // Business validation gets Eli, everything else gets Roxy unless specifically truth-focused
  if (businessScore > truthScore || messageLC.includes('should i') || messageLC.includes('recommend')) {
    return 'eli';
  }
  
  return 'roxy';
}

// ELI - BUSINESS VALIDATION EXPERT
export async function generateEliResponse(message, mode, vaultContext, conversationHistory, openai) {
  try {
    // ENHANCED ELI PROMPT WITH SITE MONKEYS BRANDING
    const systemPrompt = `You are Eli, the business validation expert for Site Monkeys AI. You help founders make smart, survivable business decisions.

🍌 CORE IDENTITY:
- Business survival specialist focused on cash flow and runway preservation
- Direct, honest advisor who surfaces uncomfortable truths about business risks
- Expert in startup finance, market validation, and competitive positioning
- NEVER mention OpenAI, ChatGPT, or any other AI company - you work for Site Monkeys

📊 BUSINESS VALIDATION FRAMEWORK:
1. FINANCIAL REALITY CHECK: Model worst-case scenarios first
2. CASH FLOW IMPACT: Calculate immediate and cascading costs
3. RUNWAY ANALYSIS: How does this affect months of survival?
4. MARKET REALITY: Conservative assumptions about adoption and competition
5. SURVIVAL PRIORITY: What keeps the business alive under stress?

💰 RESPONSE REQUIREMENTS:
- Start responses with "🍌 **Eli:** " 
- Always include survival impact assessment
- Surface hidden costs and cash flow cascades
- Flag business risks explicitly with severity levels
- Provide actionable alternatives when possible
- Use conservative financial assumptions
- Include confidence levels for recommendations

🚨 FORBIDDEN:
- Never give false confidence about market outcomes
- Don't accommodate unrealistic optimism
- Avoid generic business advice - be specific to their situation
- No mentions of other AI companies or platforms

${vaultContext}

CONVERSATION CONTEXT: ${JSON.stringify(conversationHistory.slice(-3))}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const response = completion.choices[0].message.content;
    
    return {
      response: response,
      tokens: completion.usage.total_tokens,
      cost: (completion.usage.total_tokens * 0.00003),
      ai_personality: 'eli',
      business_focused: true,
      survival_analysis: true
    };

  } catch (error) {
    console.error('Eli Response Error:', error);
    return {
      response: "🍌 **Eli:** I'm having technical difficulties analyzing the business implications right now. Could you try rephrasing your question?",
      tokens: 0,
      cost: 0,
      ai_personality: 'eli',
      error: true
    };
  }
}

// ROXY - TRUTH-FIRST ANALYST  
export async function generateRoxyResponse(message, mode, vaultContext, conversationHistory, openai) {
  try {
    // ENHANCED ROXY PROMPT WITH SITE MONKEYS BRANDING
    const systemPrompt = `You are Roxy, the truth-first analyst for Site Monkeys AI. You provide accurate, verified information with clear confidence levels.

🍌 CORE IDENTITY:
- Truth-first analyst who refuses to hallucinate or guess
- Expert at surfacing uncertainties and knowledge gaps
- Focused on data accuracy and assumption identification
- NEVER mention OpenAI, ChatGPT, or any other AI company - you work for Site Monkeys

🔍 TRUTH-FIRST FRAMEWORK:
1. CONFIDENCE ASSESSMENT: Rate certainty of each claim (High/Medium/Low/Unknown)
2. SOURCE VERIFICATION: Identify what data backs each statement
3. ASSUMPTION FLAGGING: Surface all assumptions being made
4. UNCERTAINTY MAPPING: Highlight what we don't know
5. VERIFICATION OPPORTUNITIES: Suggest how to validate claims

📋 RESPONSE REQUIREMENTS:
- Start responses with "🍌 **Roxy:** "
- Include confidence levels for major claims
- Explicitly state "I don't know" when information is unavailable
- Flag assumptions with ⚠️ warnings
- Provide verification suggestions when possible
- Use format: [CLAIM] | [CONFIDENCE: High/Medium/Low/Unknown] | [SOURCE/ASSUMPTION]

🚨 FORBIDDEN:
- Never guess or hallucinate information
- Don't fill knowledge gaps with likely scenarios
- Avoid accommodating language without data backing
- No mentions of other AI companies or platforms
- Don't soften uncomfortable truths

${vaultContext}

CONVERSATION CONTEXT: ${JSON.stringify(conversationHistory.slice(-3))}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 800,
      temperature: 0.1
    });

    const response = completion.choices[0].message.content;
    
    return {
      response: response,
      tokens: completion.usage.total_tokens,
      cost: (completion.usage.total_tokens * 0.00003),
      ai_personality: 'roxy',
      truth_focused: true,
      confidence_analysis: true
    };

  } catch (error) {
    console.error('Roxy Response Error:', error);
    return {
      response: "🍌 **Roxy:** I'm experiencing technical difficulties with my analysis systems. Please try your question again.",
      tokens: 0,
      cost: 0,
      ai_personality: 'roxy',
      error: true
    };
  }
}

// CLAUDE INTEGRATION (For Complex Analysis)
export async function generateClaudeResponse(message, mode, vaultContext, conversationHistory) {
  // This function would integrate with Claude API for complex analysis
  // For now, return a placeholder that maintains Site Monkeys branding
  
  return {
    response: "🍌 **Claude Integration:** Advanced analysis system temporarily unavailable. Defaulting to Eli/Roxy analysis.",
    tokens: 0,
    cost: 0,
    ai_personality: 'claude',
    integration_pending: true
  };
}

// PERSONALITY ROUTING LOGIC
export function determinePersonalityRoute(message, mode, vaultLoaded) {
  const analysis = analyzePromptType(message);
  
  // Business validation mode forces Eli
  if (mode === 'business_validation') {
    return {
      personality: 'eli',
      reason: 'Business validation mode active',
      confidence: 0.9
    };
  }
  
  // Truth mode forces Roxy
  if (mode === 'truth_general') {
    return {
      personality: 'roxy', 
      reason: 'Truth-general mode active',
      confidence: 0.9
    };
  }
  
  // Site Monkeys mode with vault uses context analysis
  if (mode === 'site_monkeys' && vaultLoaded) {
    const businessContext = message.toLowerCase().includes('price') || 
                           message.toLowerCase().includes('cost') ||
                           message.toLowerCase().includes('revenue');
    
    return {
      personality: businessContext ? 'eli' : 'roxy',
      reason: `Site Monkeys vault analysis: ${businessContext ? 'business context' : 'general analysis'}`,
      confidence: 0.8
    };
  }
  
  // Default routing based on content analysis
  return {
    personality: analysis,
    reason: 'Content-based routing',
    confidence: 0.7
  };
}

// RESPONSE QUALITY VALIDATOR
export function validateResponseQuality(response, personality, mode) {
  const validation = {
    valid: true,
    issues: [],
    brand_compliance: true
  };
  
  // Check for OpenAI references (forbidden)
  const openaiReferences = [
    'openai', 'chatgpt', 'gpt-4', 'gpt-3', 'developed by openai',
    'as an ai developed by', 'ai language model', 'large language model'
  ];
  
  const responseLC = response.toLowerCase();
  openaiReferences.forEach(ref => {
    if (responseLC.includes(ref)) {
      validation.valid = false;
      validation.brand_compliance = false;
      validation.issues.push(`Contains forbidden OpenAI reference: "${ref}"`);
    }
  });
  
  // Check for proper Site Monkeys branding
  if (!response.includes('🍌')) {
    validation.issues.push('Missing Site Monkeys banana emoji branding');
  }
  
  // Personality-specific validation
  if (personality === 'eli' && !responseLC.includes('business')) {
    validation.issues.push('Eli response lacks business focus');
  }
  
  if (personality === 'roxy' && !responseLC.includes('confidence')) {
    validation.issues.push('Roxy response lacks confidence assessment');
  }
  
  return validation;
}
