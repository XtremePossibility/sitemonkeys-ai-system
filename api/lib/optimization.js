// optimization.js - Response Enhancement and Truth Validation

export async function runOptimizationEnhancer(response, mode, context) {
  try {
    // STEP 1: Truth Validation
    const truthScore = validateTruthContent(response);
    
    // STEP 2: Mode Compliance Check
    const modeCompliance = checkModeCompliance(response, mode);
    
    // STEP 3: Enhancement Based on Context
    let enhancedResponse = response;
    
    if (context.vault_loaded && context.triggered_frameworks.length > 0) {
      enhancedResponse = applyVaultEnhancements(response, context.triggered_frameworks);
    }
    
    // STEP 4: Risk Surface Enhancement
    if (mode === 'business_validation') {
      enhancedResponse = enhanceBusinessRisks(enhancedResponse);
    }
    
    // STEP 5: Assumption Challenge
    if (context.assumption_warnings.length > 0) {
      enhancedResponse = addAssumptionChallenges(enhancedResponse, context.assumption_warnings);
    }
    
    // STEP 6: Quality Scoring
    const qualityMetrics = calculateQualityScore(enhancedResponse, mode);
    
    return enhancedResponse + `\n\n--- SYSTEM VERIFICATION ---
TRUTH_SCORE: ${truthScore}%
MODE_COMPLIANCE: ${modeCompliance}
QUALITY_METRICS: ${JSON.stringify(qualityMetrics)}`;
    
  } catch (error) {
    console.error('Optimization enhancement failed:', error);
    // Return original response if enhancement fails
    return response;
  }
}

function validateTruthContent(response) {
  // Check for hallucination indicators
  const hallucinationFlags = [
    /\d{4}-\d{2}-\d{2}/, // Specific dates (often hallucinated)
    /\$[\d,]+\.\d{2}/, // Precise dollar amounts
    /\d+\.\d+%/, // Precise percentages
    /(studies show|research indicates|data suggests)/i, // Vague authority claims
    /(according to|based on a study)/i // Unsourced claims
  ];
  
  let truthScore = 100;
  
  hallucinationFlags.forEach(flag => {
    if (flag.test(response)) {
      truthScore -= 15; // Penalize potential hallucinations
    }
  });
  
  // Check for truth indicators
  const truthIndicators = [
    /(I don't know|uncertain|unclear)/i,
    /(estimated|approximately|roughly)/i,
    /(confidence: |likely|probably)/i,
    /(depends on|varies based on)/i
  ];
  
  truthIndicators.forEach(indicator => {
    if (indicator.test(response)) {
      truthScore += 5; // Reward uncertainty acknowledgment
    }
  });
  
  return Math.max(0, Math.min(100, truthScore));
}

function checkModeCompliance(response, mode) {
  switch (mode) {
    case 'truth_general':
      return checkTruthModeCompliance(response);
    case 'business_validation':
      return checkBusinessModeCompliance(response);
    default:
      return 'UNKNOWN_MODE';
  }
}

function checkTruthModeCompliance(response) {
  const requiredElements = [
    /confidence:/i,
    /(high|medium|low|unknown)/i
  ];
  
  const compliance = requiredElements.every(element => element.test(response));
  return compliance ? 'COMPLIANT' : 'PARTIAL';
}

function checkBusinessModeCompliance(response) {
  const requiredElements = [
    /(survival impact|cash flow|risk)/i,
    /\$[\d,]+/i, // Dollar amounts
    /(high|medium|low|critical)/i
  ];
  
  const compliance = requiredElements.filter(element => element.test(response)).length;
  
  if (compliance >= 2) return 'COMPLIANT';
  if (compliance >= 1) return 'PARTIAL';
  return 'NON_COMPLIANT';
}

function applyVaultEnhancements(response, triggeredFrameworks) {
  let enhanced = response;
  
  // Add vault-specific context
  if (triggeredFrameworks.includes('PRICING_FRAMEWORK')) {
    enhanced += `\n\n🏢 SITE MONKEYS CONTEXT: This decision impacts our service pricing strategy and client positioning.`;
  }
  
  if (triggeredFrameworks.includes('FINANCIAL_CONSTRAINTS')) {
    enhanced += `\n\n💰 FINANCIAL REALITY: Consider impact on current runway and client commitments.`;
  }
  
  if (triggeredFrameworks.includes('BRAND_ALIGNMENT')) {
    enhanced += `\n\n🎯 BRAND ALIGNMENT: Evaluate consistency with Site Monkeys positioning and values.`;
  }
  
  return enhanced;
}

function enhanceBusinessRisks(response) {
  // Add proactive risk surfacing if missing
  if (!response.toLowerCase().includes('risk')) {
    response += `\n\n⚠️ ADDITIONAL RISKS TO CONSIDER:
- Market timing and competitive response
- Implementation complexity and timeline
- Resource allocation and opportunity cost`;
  }
  
  return response;
}

function addAssumptionChallenges(response, warnings) {
  if (warnings.length > 0) {
    response += `\n\n🧠 ASSUMPTION CHALLENGES:`;
    warnings.forEach(warning => {
      response += `\n- ${warning}`;
    });
  }
  
  return response;
}

function calculateQualityScore(response, mode) {
  const metrics = {
    word_count: response.split(' ').length,
    has_confidence: /confidence:/i.test(response),
    has_risks: /risk/i.test(response),
    has_numbers: /\$|\d+%|\d+/.test(response),
    has_uncertainty: /(uncertain|unclear|depends)/i.test(response)
  };
  
  let score = 0;
  
  // Word count scoring
  if (metrics.word_count >= 50 && metrics.word_count <= 300) score += 20;
  if (metrics.word_count >= 300 && metrics.word_count <= 500) score += 25;
  if (metrics.word_count > 500) score += 15;
  
  // Content quality scoring
  if (metrics.has_confidence) score += 25;
  if (metrics.has_risks && mode === 'business_validation') score += 25;
  if (metrics.has_numbers && mode === 'business_validation') score += 20;
  if (metrics.has_uncertainty) score += 10; // Truth-positive
  
  return {
    overall_score: score,
    word_count: metrics.word_count,
    truth_indicators: metrics.has_uncertainty,
    business_indicators: metrics.has_risks && metrics.has_numbers
  };
}

export function generateMetaQuestions(originalResponse, mode) {
  // Generate follow-up questions to challenge assumptions
  const questions = [];
  
  if (mode === 'business_validation') {
    questions.push("What's the worst-case scenario if this goes wrong?");
    questions.push("How does this impact your cash runway?");
    questions.push("What competitors might respond to this move?");
    questions.push("What assumptions are you making about customer behavior?");
  } else {
    questions.push("What additional information would change this assessment?");
    questions.push("What are the key uncertainties here?");
    questions.push("How confident should you be in this conclusion?");
  }
  
  return questions.slice(0, 2); // Return top 2 most relevant
}
