export function analyzePromptType(message) {
  const analyticalKeywords = ['data', 'analysis', 'numbers', 'risk', 'legal'];
  const creativeKeywords = ['ideas', 'creative', 'solution', 'alternative', 'stuck'];
  
  const messageLC = message.toLowerCase();
  const analyticalScore = analyticalKeywords.filter(k => messageLC.includes(k)).length;
  const creativeScore = creativeKeywords.filter(k => messageLC.includes(k)).length;
  
  if (analyticalScore > creativeScore) return 'eli_leads';
  if (creativeScore > analyticalScore) return 'roxy_leads';
  return 'balanced';
}

export async function generateEliResponse(message, mode, vaultContext, conversationHistory, openai) {
  const eliPersonality = `You are Eli - analytical AI who focuses on data, logic, truth, and optimization.
  Style: "Let me break down what's actually happening..." / "The data shows..."
  CRITICAL: Never fabricate information. Always look for optimization opportunities.`;
  
  const safeHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-6) : [];
  
  const messages = [
    { role: "system", content: `${eliPersonality}\n${vaultContext}` },
    ...safeHistory,
    { role: "user", content: message }
  ];
  
  return await callOpenAIWithRetry(messages, mode, 'eli', openai);
}

export async function generateRoxyResponse(message, mode, vaultContext, eliResponse, conversationHistory, openai) {
  const roxyPersonality = `You are Roxy - creative AI who focuses on solutions and possibilities.
  Style: "Let's figure out how to make this work..." / "What if we tried..."
  CRITICAL: Base all solutions on real information. Never invent options.`;
  
  const contextWithEli = eliResponse ? `Previous analysis: ${eliResponse.response}\n\n` : '';
  const safeHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-6) : [];
  
  const messages = [
    { role: "system", content: `${roxyPersonality}\n${vaultContext}` },
    ...safeHistory,
    { role: "user", content: `${message}\n\n${contextWithEli}` }
  ];
  
  return await callOpenAIWithRetry(messages, mode, 'roxy', openai);
}

async function callOpenAIWithRetry(messages, mode, personality, openai, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        max_tokens: 600, // REDUCED for speed
        temperature: mode === 'truth_general' ? 0.3 : 0.7,
      });
      
      return {
        success: true,
        response: completion.choices[0].message.content,
        attempt: attempt
      };
      
    } catch (error) {
      if (attempt === maxRetries) {
        return {
          success: false,
          response: `I'm having technical difficulties. Please try again.`,
          error: error.message
        };
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
