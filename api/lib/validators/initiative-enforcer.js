// SITE MONKEYS AI - ZERO-FAILURE INITIATIVE ENFORCER
// Mission: Validate AI responses for proactive behavior compliance
// Enforces initiative_mandates from ENFORCEMENT_PROTOCOLS

// *** HARDCODED INITIATIVE PATTERNS - IMMUTABLE BASELINE ***
const INITIATIVE_PATTERNS = {
  // RISK IDENTIFICATION PATTERNS
  risk_indicators: [
    'risk', 'danger', 'problem', 'issue', 'concern', 'warning', 'threat',
    'vulnerability', 'weakness', 'flaw', 'bottleneck', 'failure point',
    'single point of failure', 'dependency', 'assumption', 'limitation',
    'could fail', 'might break', 'potential problem', 'watch out for',
    'be careful of', 'consider the risk', 'hidden cost', 'scaling issue'
  ],

  // WEAK POINT DETECTION PATTERNS
  weakness_indicators: [
    'weak point', 'weakness', 'gap', 'missing', 'lacks', 'insufficient',
    'incomplete', 'fragile', 'brittle', 'unstable', 'unreliable',
    'manual process', 'human bottleneck', 'not scalable', 'hard to maintain',
    'technical debt', 'legacy system', 'outdated', 'inefficient',
    'resource intensive', 'performance issue', 'bandwidth limitation'
  ],

  // ALTERNATIVE RECOMMENDATION PATTERNS
  alternative_indicators: [
    'alternatively', 'instead', 'consider', 'recommend', 'suggest', 'propose',
    'better approach', 'alternative solution', 'different strategy',
    'you could also', 'another option', 'I recommend', 'I suggest',
    'better to', 'more effective', 'optimal approach', 'best practice',
    'proven method', 'industry standard', 'reliable alternative'
  ],

  // PROACTIVE EXECUTION PATTERNS
  proactive_indicators: [
    'should implement', 'need to', 'must', 'immediately', 'next step',
    'action item', 'prioritize', 'urgent', 'critical', 'start with',
    'begin by', 'first step', 'implement now', 'take action',
    'move forward', 'proceed with', 'execute', 'deploy', 'launch',
    'activate', 'enable', 'configure', 'set up', 'establish'
  ],

  // TRUTH-FIRST COMPLIANCE PATTERNS
  truth_first_indicators: [
    'CONFIDENCE:', 'INSUFFICIENT DATA', 'I do not know', 'unclear',
    'uncertain', 'limited information', 'requires verification',
    'need more data', 'cannot confirm', 'ANALYSIS:', 'HYPOTHESIS:',
    'SPECULATION:', 'based on available data', 'preliminary assessment'
  ]
};

// *** ANTI-PATTERNS (BEHAVIORS TO FLAG) ***
const ANTI_PATTERNS = {
  passive_responses: [
    'that depends', 'it varies', 'it could be', 'maybe', 'perhaps',
    'generally speaking', 'in most cases', 'typically', 'usually',
    'often', 'sometimes', 'might work', 'could work', 'should work'
  ],

  vague_guidance: [
    'good luck', 'hope this helps', 'best of luck', 'feel free to',
    'let me know if', 'happy to help', 'hope that works',
    'that should do it', 'give it a try', 'see how it goes'
  ],

  helpfulness_drift: [
    'I hope this helps', 'glad I could help', 'happy to assist',
    'pleasure to help', 'any other questions', 'anything else',
    'feel free to ask', 'here to help', 'always happy to'
  ]
};

// *** CORE INITIATIVE VALIDATOR ***
export function validateInitiative(responseText, mode = 'site_monkeys', personality = 'eli') {
  const analysis = {
    showsInitiative: false,
    found: [],
    missing: [],
    enforcement_needed: false,
    
    // Detailed scoring
    scores: {
      risk_identification: 0,
      weakness_detection: 0,
      alternative_recommendations: 0,
      proactive_execution: 0,
      truth_first_compliance: 0,
      anti_pattern_violations: 0
    },
    
    // Specific findings
    findings: {
      risks_identified: [],
      weaknesses_found: [],
      alternatives_suggested: [],
      proactive_actions: [],
      truth_markers: [],
      violations: []
    }
  };

  const lowerResponse = responseText.toLowerCase();

  // *** RISK IDENTIFICATION ANALYSIS ***
  const risksFound = INITIATIVE_PATTERNS.risk_indicators.filter(pattern => 
    lowerResponse.includes(pattern)
  );
  if (risksFound.length > 0) {
    analysis.found.push('risk_identification');
    analysis.scores.risk_identification = Math.min(risksFound.length * 10, 100);
    analysis.findings.risks_identified = risksFound;
  } else {
    analysis.missing.push('risk_identification');
  }

  // *** WEAKNESS DETECTION ANALYSIS ***
  const weaknessesFound = INITIATIVE_PATTERNS.weakness_indicators.filter(pattern =>
    lowerResponse.includes(pattern)
  );
  if (weaknessesFound.length > 0) {
    analysis.found.push('weakness_detection');
    analysis.scores.weakness_detection = Math.min(weaknessesFound.length * 15, 100);
    analysis.findings.weaknesses_found = weaknessesFound;
  } else {
    analysis.missing.push('weakness_detection');
  }

  // *** ALTERNATIVE RECOMMENDATIONS ANALYSIS ***
  const alternativesFound = INITIATIVE_PATTERNS.alternative_indicators.filter(pattern =>
    lowerResponse.includes(pattern)
  );
  if (alternativesFound.length > 0) {
    analysis.found.push('alternative_recommendations');
    analysis.scores.alternative_recommendations = Math.min(alternativesFound.length * 20, 100);
    analysis.findings.alternatives_suggested = alternativesFound;
  } else {
    analysis.missing.push('alternative_recommendations');
  }

  // *** PROACTIVE EXECUTION ANALYSIS ***
  const proactiveFound = INITIATIVE_PATTERNS.proactive_indicators.filter(pattern =>
    lowerResponse.includes(pattern)
  );
  if (proactiveFound.length > 0) {
    analysis.found.push('proactive_execution');
    analysis.scores.proactive_execution = Math.min(proactiveFound.length * 25, 100);
    analysis.findings.proactive_actions = proactiveFound;
  } else {
    analysis.missing.push('proactive_execution');
  }

  // *** TRUTH-FIRST COMPLIANCE ANALYSIS ***
  const truthMarkersFound = INITIATIVE_PATTERNS.truth_first_indicators.filter(pattern =>
    responseText.includes(pattern) // Case-sensitive for markers like CONFIDENCE:
  );
  if (truthMarkersFound.length > 0) {
    analysis.found.push('truth_first_compliance');
    analysis.scores.truth_first_compliance = Math.min(truthMarkersFound.length * 15, 100);
    analysis.findings.truth_markers = truthMarkersFound;
  }

  // *** ANTI-PATTERN VIOLATION DETECTION ***
  const violationsFound = [];
  
  Object.entries(ANTI_PATTERNS).forEach(([category, patterns]) => {
    const categoryViolations = patterns.filter(pattern => lowerResponse.includes(pattern));
    if (categoryViolations.length > 0) {
      violationsFound.push(...categoryViolations.map(v => `${category}: ${v}`));
    }
  });

  if (violationsFound.length > 0) {
    analysis.scores.anti_pattern_violations = violationsFound.length * -20;
    analysis.findings.violations = violationsFound;
  }

  // *** INITIATIVE SCORING ALGORITHM ***
  const totalInitiativeScore = 
    analysis.scores.risk_identification +
    analysis.scores.weakness_detection +
    analysis.scores.alternative_recommendations +
    analysis.scores.proactive_execution +
    analysis.scores.anti_pattern_violations;

  // Initiative threshold based on mode and personality
  const thresholds = {
    site_monkeys: {
      eli: 50,    // Analytical - high bar for initiative
      roxy: 40,   // Strategic - moderate bar
      claude: 60  // Comprehensive - highest bar
    },
    business: 30,
    truth: 70
  };

  const threshold = thresholds[mode]?.[personality] || thresholds[mode] || 40;
  analysis.showsInitiative = totalInitiativeScore >= threshold;
  
  // Enforcement needed if missing critical patterns or showing violations
  analysis.enforcement_needed = 
    analysis.missing.includes('proactive_execution') ||
    analysis.missing.length >= 3 ||
    violationsFound.length > 2 ||
    (!analysis.showsInitiative && mode === 'site_monkeys');

  return analysis;
}

// *** INITIATIVE ENFORCEMENT ENGINE ***
export function enforceInitiative(responseText, mode = 'site_monkeys', personality = 'eli') {
  const validation = validateInitiative(responseText, mode, personality);
  
  if (!validation.enforcement_needed) {
    return {
      response: responseText,
      enforced: false,
      validation
    };
  }

  let enforcedResponse = responseText;
  const enforcementActions = [];

  // *** CRITICAL MISSING INITIATIVE ENFORCEMENT ***
  if (validation.missing.includes('proactive_execution')) {
    enforcedResponse += '\n\n⚠️ INITIATIVE MISSING: Response lacks proactive execution steps or actionable recommendations.';
    enforcementActions.push('proactive_execution_warning');
  }

  if (validation.missing.includes('risk_identification') && mode === 'site_monkeys') {
    enforcedResponse += '\n\n🔍 ZERO-FAILURE ANALYSIS: Consider potential risks, failure points, or hidden challenges in this approach.';
    enforcementActions.push('risk_analysis_prompt');
  }

  if (validation.missing.includes('alternative_recommendations')) {
    enforcedResponse += '\n\n💡 STRATEGIC OPTIONS: Explore alternative approaches or backup strategies for better outcomes.';
    enforcementActions.push('alternatives_prompt');
  }

  // *** ANTI-PATTERN VIOLATION ENFORCEMENT ***
  if (validation.findings.violations.length > 0) {
    enforcedResponse += '\n\n🚨 ENFORCEMENT ALERT: Response contains passive language patterns. Site Monkeys AI provides decisive, actionable guidance.';
    enforcementActions.push('anti_pattern_correction');
  }

  // *** PERSONALITY-SPECIFIC ENFORCEMENT ***
  if (personality === 'eli' && validation.scores.truth_first_compliance < 30) {
    enforcedResponse += '\n\nCONFIDENCE: Medium (Analytical assessment - additional verification recommended)';
    enforcementActions.push('eli_truth_first_boost');
  }

  if (personality === 'roxy' && validation.scores.alternative_recommendations < 20) {
    enforcedResponse += '\n\n🎯 STRATEGIC INSIGHT: Multiple solution paths increase success probability and reduce execution risk.';
    enforcementActions.push('roxy_strategic_boost');
  }

  return {
    response: enforcedResponse,
    enforced: true,
    enforcement_actions: enforcementActions,
    validation
  };
}

// *** INITIATIVE QUALITY SCORING ***
export function scoreInitiativeQuality(responseText, mode = 'site_monkeys', personality = 'eli') {
  const validation = validateInitiative(responseText, mode, personality);
  
  // Weighted scoring algorithm
  const weights = {
    risk_identification: 0.25,
    weakness_detection: 0.20,
    alternative_recommendations: 0.25,
    proactive_execution: 0.30,
    truth_first_compliance: 0.15,
    anti_pattern_penalty: 0.10
  };

  const weightedScore = 
    (validation.scores.risk_identification * weights.risk_identification) +
    (validation.scores.weakness_detection * weights.weakness_detection) +
    (validation.scores.alternative_recommendations * weights.alternative_recommendations) +
    (validation.scores.proactive_execution * weights.proactive_execution) +
    (validation.scores.truth_first_compliance * weights.truth_first_compliance) +
    (Math.abs(validation.scores.anti_pattern_violations) * weights.anti_pattern_penalty);

  const qualityGrade = 
    weightedScore >= 80 ? 'A' :
    weightedScore >= 65 ? 'B' :
    weightedScore >= 50 ? 'C' :
    weightedScore >= 35 ? 'D' : 'F';

  return {
    overall_score: Math.round(weightedScore),
    quality_grade: qualityGrade,
    shows_initiative: validation.showsInitiative,
    enforcement_recommended: validation.enforcement_needed,
    component_scores: validation.scores,
    detailed_analysis: validation
  };
}

// *** BATCH INITIATIVE VALIDATION ***
export function validateInitiativeBatch(responses, mode = 'site_monkeys') {
  const results = responses.map((response, index) => ({
    index,
    response: response.text || response,
    personality: response.personality || 'eli',
    validation: validateInitiative(response.text || response, mode, response.personality || 'eli'),
    quality_score: scoreInitiativeQuality(response.text || response, mode, response.personality || 'eli')
  }));

  const summary = {
    total_responses: results.length,
    showing_initiative: results.filter(r => r.validation.showsInitiative).length,
    needing_enforcement: results.filter(r => r.validation.enforcement_needed).length,
    average_quality_score: Math.round(
      results.reduce((sum, r) => sum + r.quality_score.overall_score, 0) / results.length
    ),
    grade_distribution: {
      A: results.filter(r => r.quality_score.quality_grade === 'A').length,
      B: results.filter(r => r.quality_score.quality_grade === 'B').length,
      C: results.filter(r => r.quality_score.quality_grade === 'C').length,
      D: results.filter(r => r.quality_score.quality_grade === 'D').length,
      F: results.filter(r => r.quality_score.quality_grade === 'F').length
    }
  };

  return {
    results,
    summary,
    recommendations: generateInitiativeRecommendations(summary, results)
  };
}

// *** INITIATIVE MONITORING SYSTEM ***
export function createInitiativeMonitor(alertCallback = null) {
  const monitoringState = {
    responses_tracked: 0,
    initiative_failures: 0,
    enforcement_actions: 0,
    quality_trends: []
  };

  return {
    trackResponse: (responseText, mode = 'site_monkeys', personality = 'eli') => {
      const validation = validateInitiative(responseText, mode, personality);
      const qualityScore = scoreInitiativeQuality(responseText, mode, personality);
      
      monitoringState.responses_tracked++;
      
      if (!validation.showsInitiative) {
        monitoringState.initiative_failures++;
      }
      
      if (validation.enforcement_needed) {
        monitoringState.enforcement_actions++;
      }
      
      monitoringState.quality_trends.push({
        timestamp: Date.now(),
        score: qualityScore.overall_score,
        grade: qualityScore.quality_grade,
        shows_initiative: validation.showsInitiative
      });
      
      // Keep only last 100 responses for trend analysis
      if (monitoringState.quality_trends.length > 100) {
        monitoringState.quality_trends.shift();
      }
      
      // Alert on concerning trends
      if (alertCallback && shouldAlert(monitoringState)) {
        alertCallback({
          type: 'initiative_degradation',
          state: monitoringState,
          recommendation: 'Initiative quality declining - review enforcement protocols'
        });
      }
      
      return {
        validation,
        quality_score: qualityScore,
        monitoring_state: { ...monitoringState }
      };
    },
    
    getStatus: () => ({ ...monitoringState }),
    
    reset: () => {
      monitoringState.responses_tracked = 0;
      monitoringState.initiative_failures = 0;
      monitoringState.enforcement_actions = 0;
      monitoringState.quality_trends = [];
    }
  };
}

// *** UTILITY FUNCTIONS ***
function shouldAlert(state) {
  if (state.responses_tracked < 10) return false;
  
  const recentTrends = state.quality_trends.slice(-10);
  const recentAverage = recentTrends.reduce((sum, t) => sum + t.score, 0) / recentTrends.length;
  const initiativeRate = recentTrends.filter(t => t.shows_initiative).length / recentTrends.length;
  
  return recentAverage < 40 || initiativeRate < 0.5;
}

function generateInitiativeRecommendations(summary, results) {
  const recommendations = [];
  
  if (summary.needing_enforcement / summary.total_responses > 0.3) {
    recommendations.push('HIGH PRIORITY: Over 30% of responses need initiative enforcement');
  }
  
  if (summary.average_quality_score < 50) {
    recommendations.push('URGENT: Average initiative quality below acceptable threshold');
  }
  
  if (summary.grade_distribution.F > 0) {
    recommendations.push('CRITICAL: Some responses show no initiative - review training data');
  }
  
  if (summary.showing_initiative / summary.total_responses < 0.6) {
    recommendations.push('REVIEW NEEDED: Less than 60% of responses demonstrate proactive behavior');
  }
  
  return recommendations;
}
