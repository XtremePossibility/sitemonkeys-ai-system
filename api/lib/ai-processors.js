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
  
  let eliResult, roxyResult;
  
  // GENERATE RESPONSES
  if (promptType === 'eli' || promptType === 'eli_leads') {
    eliResult = await generateEliResponse(message, mode, vaultContext, conversationHistory, openai);
    roxyResult = await generateRoxyResponse(message, mode, vaultContext, eliResult, conversationHistory, openai);
  } else {
    roxyResult = await generateRoxyResponse(message, mode, vaultContext, '', conversationHistory, openai);
    eliResult = await generateEliResponse(message, mode, vaultContext, roxyResult, conversationHistory, openai);
  }

  // COMBINE & OPTIMIZE
  let combinedResponse = `**Eli:** ${eliResult.response}\n\n**Roxy:** ${roxyResult.response}`;
  
  const optimizedResult = runOptimizationEnhancer({
    mode,
    baseResponse: combinedResponse,
    message,
    triggeredFrameworks
  });

  const assumptionWarnings = checkAssumptionHealth();
  const fingerprint = `\n[MODE: ${mode}] | [VAULT: ${vaultVerification.allowed ? 'LOADED' : 'NONE'}]`;

  return {
    response: optimizedResult.enhancedResponse + fingerprint,
    mode_active: mode,
    vault_loaded: vaultVerification.allowed,
    eli_success: eliResult.success,
    roxy_success: roxyResult.success,
    optimization_tags: optimizedResult.optimization_tags,
    triggered_frameworks: triggeredFrameworks,
    assumption_warnings: assumptionWarnings.length
  };
}
