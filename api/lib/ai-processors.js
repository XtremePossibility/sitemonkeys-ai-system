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
  const promptType = userPreference || analyzePromptType(message);
  const triggeredFrameworks = checkVaultTriggers(message);
  const vaultContext = vaultVerification.allowed ? 
    generateVaultContext(triggeredFrameworks) : '';
  
  // ASSUMPTION CHECKING
  const assumptionConflicts = detectAssumptionConflicts(message, mode);
  
  // DECIDE WHO RESPONDS (single speaker)
  const useEli = promptType === 'eli_leads' || promptType === 'balanced';
  
  let result;
  if (useEli) {
    result = await generateEliResponse(message, mode, vaultContext, conversationHistory, openai);
  } else {
    result = await generateRoxyResponse(message, mode, vaultContext, '', conversationHistory, openai);
  }
  
  // RETURN SINGLE RESPONSE
  return {
    response: result.response,
    mode_active: mode,
    vault_loaded: vaultVerification.allowed,
    security_pass: true,
    triggered_frameworks: triggeredFrameworks,
    assumption_warnings: []
  };
}
