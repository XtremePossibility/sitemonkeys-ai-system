// FIXED AI PROCESSORS - WORKING VERSION
export async function processWithEliAndRoxy({
  message,
  mode,
  vaultVerification,
  conversationHistory,
  userPreference,
  openai
}) {
  try {
    // Basic processing logic
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: `You are ${mode === 'business_validation' ? 'a business strategist' : 'a helpful assistant'}. Be direct and factual.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return {
      response: response.choices[0].message.content,
      mode_active: mode,
      vault_loaded: vaultVerification?.allowed || false,
      confidence: 85,
      processing_time: Date.now(),
      tokens_used: response.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('AI Processing Error:', error);
    return {
      response: "System temporarily unavailable. Please try again.",
      mode_active: mode,
      vault_loaded: false,
      error: true,
      fallback_used: true
    };
  }
}
