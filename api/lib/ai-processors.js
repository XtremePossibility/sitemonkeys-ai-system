// ai-processors.js - AI Processing Logic with Fixed Imports

import { processTruthGeneral, processBusinessValidation, analyzePromptType, generateEliResponse, generateRoxyResponse } from './personalities.js';
import { runOptimizationEnhancer, generateMetaQuestions } from './optimization.js';
import { checkAssumptionHealth, validateLogicConsistency } from './assumptions.js';

export function routeToPersonality(message, mode, conversationHistory) {
  // Determine which AI personality should handle the request
  let targetMode = mode;
  
  // If no mode specified, analyze message to determine appropriate mode
  if (!mode || mode === 'auto') {
    targetMode = analyzePromptType(message);
  }
  
  // Route based on determined mode
  switch (targetMode) {
    case 'truth_general':
      return {
        processor: 'truth_general',
        personality: 'eli', // Default to Eli for truth mode
        logic: processTruthGeneral()
      };
      
    case 'business_validation':
      return {
        processor: 'business_validation', 
        personality: 'roxy', // Default to Roxy for business mode
        logic: processBusinessValidation()
      };
      
    default:
      // Fallback to truth mode for unknown cases
      return {
        processor: 'truth_general',
        personality: 'eli',
        logic: processTruthGeneral()
      };
  }
}

export function processWithPersonality(message, processor, personality, conversationHistory) {
  let personalityOverlay = '';
  
  switch (personality) {
    case 'eli':
      personalityOverlay = generateEliResponse(message, processor);
      break;
    case 'roxy':
      personalityOverlay = generateRoxyResponse(message, processor);
      break;
    default:
      personalityOverlay = generateEliResponse(message, processor); // Default fallback
  }
  
  return personalityOverlay;
}

export async function enhanceWithOptimization(response, mode, context) {
  try {
    // Apply optimization enhancements
    const enhancedResponse = await runOptimizationEnhancer(response, mode, context);
    
    // Generate meta-questions for deeper thinking
    const metaQuestions = generateMetaQuestions(response, mode);
    
    return {
      enhanced_response: enhancedResponse,
      meta_questions: metaQuestions,
      optimization_applied: true
    };
  } catch (error) {
    console.error('Optimization enhancement failed:', error);
    return {
      enhanced_response: response,
      meta_questions: [],
      optimization_applied: false,
      error: error.message
    };
  }
}

export function validateResponseIntegrity(response, mode, vaultLogic, userMessage) {
  const validationResults = {
    mode_compliance: checkModeCompliance(response, mode),
    assumption_health: checkAssumptionHealth(userMessage, []),
    logic_conflicts: validateLogicConsistency(mode, vaultLogic, userMessage),
    truth_score: calculateTruthScore(response),
    overall_integrity: 'PASS'
  };
  
  // Determine overall integrity
  if (validationResults.logic_conflicts.length > 0) {
    validationResults.overall_integrity = 'CONFLICTS_DETECTED';
  } else if (validationResults.truth_score < 70) {
    validationResults.overall_integrity = 'TRUTH_CONCERNS';
  } else if (validationResults.mode_compliance !== 'COMPLIANT') {
    validationResults.overall_integrity = 'MODE_DRIFT';
  }
  
  return validationResults;
}

function checkModeCompliance(response, mode) {
  switch (mode) {
    case 'truth_general':
      // Check for truth mode compliance
      const hasTruthMarkers = /confidence:|uncertain|don't know/i.test(response);
      const avoidsHallucination = !/definitely|certainly|always/i.test(response);
      return (hasTruthMarkers && avoidsHallucination) ? 'COMPLIANT' : 'PARTIAL';
      
    case 'business_validation':
      // Check for business mode compliance  
      const hasBusinessMarkers = /survival|cash flow|risk|cost/i.test(response);
      const hasQuantification = /\$|\d+%|\d+ (months|weeks|days)/i.test(response);
      return (hasBusinessMarkers && hasQuantification) ? 'COMPLIANT' : 'PARTIAL';
      
    default:
      return 'UNKNOWN_MODE';
  }
}

function calculateTruthScore(response) {
  let score = 100;
  
  // Penalize potential hallucinations
  const hallucinationPatterns = [
    /on \w+ \d{1,2}, \d{4}/, // Specific dates
    /according to a recent study/, // Vague sources
    /research shows that \d+%/, // Unsourced statistics
    /experts agree that/ // Appeal to unnamed authority
  ];
  
  hallucinationPatterns.forEach(pattern => {
    if (pattern.test(response)) score -= 20;
  });
  
  // Reward truth indicators
  const truthPatterns = [
    /I don't know/i,
    /uncertain/i,
    /approximately|roughly/i,
    /depends on/i,
    /confidence: (low|medium)/i
  ];
  
  truthPatterns.forEach(pattern => {
    if (pattern.test(response)) score += 10;
  });
  
  return Math.max(0, Math.min(100, score));
}

export function generateSystemReport(validationResults, tokenUsage, sessionCost) {
  return {
    integrity_status: validationResults.overall_integrity,
    mode_compliance: validationResults.mode_compliance,
    truth_score: validationResults.truth_score,
    assumption_warnings: validationResults.assumption_health,
    logic_conflicts: validationResults.logic_conflicts,
    performance_metrics: {
      token_usage: tokenUsage,
      session_cost: sessionCost,
      response_quality: validationResults.truth_score
    },
    recommendations: generateRecommendations(validationResults)
  };
}

function generateRecommendations(validationResults) {
  const recommendations = [];
  
  if (validationResults.overall_integrity === 'CONFLICTS_DETECTED') {
    recommendations.push("Resolve logic conflicts before proceeding with decision");
  }
  
  if (validationResults.truth_score < 70) {
    recommendations.push("Request additional verification for key claims");
  }
  
  if (validationResults.mode_compliance !== 'COMPLIANT') {
    recommendations.push("Consider switching modes for better analysis framework");
  }
  
  if (validationResults.assumption_health.length > 2) {
    recommendations.push("Challenge core assumptions before committing to strategy");
  }
  
  return recommendations;
}

// MAIN CHAT.JS INTEGRATION FUNCTION
export async function processWithEliAndRoxy({
  message,
  mode,
  vaultVerification, 
  conversationHistory,
  userPreference,
  openai
}) {
  try {
    // Route to appropriate personality and processing logic
    const routing = routeToPersonality(message, mode, conversationHistory);
    
    // Process with the determined personality
    const personalityResponse = processWithPersonality(
      message, 
      routing.processor, 
      routing.personality, 
      conversationHistory
    );
    
    // Build the system prompt with personality and logic
    const systemPrompt = routing.logic + '\n\n' + personalityResponse;
    
    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6),
      { role: 'user', content: message }
    ];
    
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 1000,
      temperature: mode === 'truth_general' ? 0.3 : 0.7,
    });
    
    let response = completion.choices[0].message.content;
    
    // Enhance with optimization if needed
    const enhancement = await enhanceWithOptimization(response, mode, {
      message,
      vaultVerification,
      conversationHistory
    });
    
    if (enhancement.optimization_applied) {
      response = enhancement.enhanced_response;
    }
    
    // Validate response integrity
    const validation = validateResponseIntegrity(response, mode, vaultVerification, message);
    
    // Generate system report
    const systemReport = generateSystemReport(
      validation, 
      completion.usage, 
      (completion.usage.prompt_tokens * 0.00003) + (completion.usage.completion_tokens * 0.00006)
    );
    
    return {
      response: response,
      mode_active: mode,
      vault_loaded: vaultVerification?.allowed || false,
      security_pass: validation.overall_integrity === 'PASS',
      cognitive_integrity: {
        integrity_status: validation.overall_integrity,
        truth_score: validation.truth_score,
        mode_compliance: validation.mode_compliance
      },
      system_report: systemReport,
      enhancement: {
        meta_questions: enhancement.meta_questions,
        optimization_applied: enhancement.optimization_applied
      },
      performance: {
        token_usage: completion.usage,
        estimated_cost: systemReport.performance_metrics.session_cost
      }
    };
    
  } catch (error) {
    console.error('AI Processing error:', error);
    
    return {
      response: `🛡️ COGNITIVE INTEGRITY MAINTAINED\n\nProcessing error encountered: ${error.message}\n\nFallback mode activated - core decision-making principles preserved.`,
      mode_active: mode,
      vault_loaded: vaultVerification?.allowed || false,
      security_pass: false,
      error: error.message,
      fallback_used: true
    };
  }
}
