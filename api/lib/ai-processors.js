// COMPLETE AI PROCESSORS - FIXED VERSION
import { analyzePromptType, generateEliResponse, generateRoxyResponse } from './personalities.js';
import { runOptimizationEnhancer } from './optimization.js';
import { checkAssumptionHealth, detectAssumptionConflicts } from './assumptions.js';
import { generateVaultContext, checkVaultTriggers } from './vault.js';

export async function processWithEliAndRoxy({
  message,
  mode,
  vaultVerification, 
  conversationHistory,
  userPreference,
  openai
}) {
  try {
    const promptType = userPreference || analyzePromptType(message);
    const triggeredFrameworks = checkVaultTriggers(message);
    const vaultContext = vaultVerification.allowed ? 
      generateVaultContext(triggeredFrameworks) : '';

    // ROUTE TO APPROPRIATE AI PERSONALITY
    let response;
    if (promptType === 'eli' || mode === 'business_validation') {
      response = await generateEliResponse(message, mode, vaultContext, openai);
    } else {
      response = await generateRoxyResponse(message, mode, vaultContext, openai);
    }

    // ENHANCEMENT AND VALIDATION
    const enhanced = runOptimizationEnhancer(response, mode);
    const assumptionHealth = checkAssumptionHealth(enhanced.response);
    const conflicts = detectAssumptionConflicts(enhanced.response, vaultContext);

    return {
      response: enhanced.response,
      mode_active: mode,
      vault_loaded: vaultVerification.allowed,
      confidence: enhanced.confidence || 85,
      ai_used: promptType === 'eli' ? 'Eli' : 'Roxy',
      optimization_applied: enhanced.optimization_applied || false,
      assumption_health: assumptionHealth,
      conflicts_detected: conflicts.length > 0 ? conflicts : null,
      processing_time: Date.now(),
      tokens_used: response.tokens || 0
    };

  } catch (error) {
    console.error('AI Processing Error:', error);
    return {
      response: "**System Error:** Technical difficulties with AI processing. Please try again.",
      mode_active: mode,
      vault_loaded: false,
      error: true,
      fallback_used: true,
      ai_used: 'System'
    };
  }
}
