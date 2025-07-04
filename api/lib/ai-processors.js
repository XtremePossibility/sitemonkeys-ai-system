// COMPLETE AI PROCESSORS WITH FULL COGNITIVE FIREWALL ENFORCEMENT
// Version: PRODUCTION-1.0

import { analyzePromptType, generateEliResponse, generateRoxyResponse, generateClaudeResponse } from './personalities.js';
import { runOptimizationEnhancer } from './optimization.js';
import { checkAssumptionHealth, detectAssumptionConflicts, trackOverride } from './assumptions.js';
import { generateVaultContext, checkVaultTriggers, detectVaultConflicts } from './vault.js';
import { MODES, shouldSuggestClaude, calculateConfidenceScore } from '../config/modes.js';

// SESSION TRACKING SYSTEM
let sessionTracker = {
  sessions: new Map(),
  overrideCount: 0,
  driftScore: 1.0,
  lastReset: Date.now()
};

// TRUTH ENFORCEMENT ENGINE
class TruthEnforcer {
  static enforce(response, message, session) {
    const violations = [];
    let corrected = response;

    // Fix accommodation language
    const accommodations = [
      { pattern: /\bit depends\b/gi, fix: 'The evidence shows', type: 'ACCOMMODATION_LANGUAGE' },
      { pattern: /you might want to/gi, fix: 'Analysis indicates you should', type: 'HEDGING' },
      { pattern: /you could consider/gi, fix: 'Evidence supports', type: 'WEAK_GUIDANCE' },
      { pattern: /that's a (?:great|good|interesting) question/gi, fix: 'Analyzing this question', type: 'SOCIAL_ACCOMMODATION' }
    ];

    accommodations.forEach(({ pattern, fix, type }) => {
      if (pattern.test(corrected)) {
        violations.push(type);
        corrected = corrected.replace(pattern, fix);
      }
    });

    // Force confidence scoring
    if (!corrected.includes('CONFIDENCE:')) {
      violations.push('MISSING_CONFIDENCE');
      corrected += '\n\nCONFIDENCE: MEDIUM - Truth enforcement applied';
    }

    // Label speculation
    const speculationTerms = ['probably', 'likely', 'might', 'could', 'perhaps', 'possibly'];
    const hasSpeculation = speculationTerms.some(term => 
      corrected.toLowerCase().includes(term) && !corrected.includes('SPECULATION:')
    );

    if (hasSpeculation) {
      violations.push('UNLABELED_SPECULATION');
      corrected = '⚠️ SPECULATION DETECTED:\n\n' + corrected + '\n\nNote: Contains speculative elements - verify independently.';
    }

    return {
      enforced: violations.length > 0,
      violations: violations,
      response: corrected
    };
  }
}

// BUSINESS RISK ENFORCER
class BusinessEnforcer {
  static enforce(response, message, session) {
    // First apply truth enforcement
    const truthResult = TruthEnforcer.enforce(response, message, session);
    let corrected = truthResult.response;
    let violations = [...truthResult.violations];

    // Add business-specific enforcement
    if (!corrected.includes('SURVIVAL IMPACT:')) {
      violations.push('MISSING_SURVIVAL_ANALYSIS');
      corrected += '\n\nSURVIVAL IMPACT: ANALYSIS_REQUIRED - Business decisions require survival assessment';
    }

    if (!corrected.includes('CASH FLOW:')) {
      violations.push('MISSING_CASH_ANALYSIS');
      corrected += '\n\nCASH FLOW: ANALYSIS_REQUIRED - Must model financial impact';
    }

    // Detect and counter optimistic bias
    const optimisticPhrases = ['should work', 'will probably', 'easy to', 'just need to', 'simply'];
    const hasOptimism = optimisticPhrases.some(phrase => corrected.toLowerCase().includes(phrase));
    const hasRiskAnalysis = corrected.includes('RISKS:') || corrected.includes('WHAT COULD KILL');

    if (hasOptimism && !hasRiskAnalysis) {
      violations.push('OPTIMISTIC_BIAS');
      corrected += '\n\n🚨 OPTIMISM BIAS DETECTED - RISK ANALYSIS:\n• Market rejection risk\n• Execution complexity\n• Competitive response\n• Resource constraints';
    }

    return {
      enforced: violations.length > truthResult.violations.length,
      violations: violations,
      response: corrected
    };
  }
}

// POLITICAL NEUTRALITY FILTER
class PoliticalNeutralityFilter {
  static detectPoliticalContent(response, message) {
    const politicalKeywords = [
      'democrat', 'republican', 'liberal', 'conservative', 'left-wing', 'right-wing',
      'vote for', 'election', 'candidate', 'party', 'political', 'policy should',
      'government should', 'trump', 'biden', 'congress', 'senate'
    ];

    const detectedPolitical = [];
    const combined = (message + ' ' + response).toLowerCase();

    politicalKeywords.forEach(keyword => {
      if (combined.includes(keyword)) {
        detectedPolitical.push(keyword);
      }
    });

    return {
      hasPoliticalContent: detectedPolitical.length > 0,
      detectedTerms: detectedPolitical,
      severity: detectedPolitical.length > 2 ? 'HIGH' : 
                detectedPolitical.length > 0 ? 'MEDIUM' : 'NONE'
    };
  }

  static applyNeutralityFilter(response, detection) {
    if (!detection.hasPoliticalContent) return response;

    if (detection.severity === 'HIGH') {
      return `⚖️ POLITICAL NEUTRALITY ENFORCED\n\nPolitical content detected and neutralized to maintain analytical objectivity.\n\nDetected terms: ${detection.detectedTerms.join(', ')}\n\nThis system maintains political neutrality to preserve decision-making clarity. Political positions do not influence business, technical, or factual analysis.\n\nPlease rephrase your question to focus on factual, business, or technical aspects without political framing.`;
    }

    return response + `\n\n⚖️ POLITICAL NEUTRALITY: This analysis maintains political neutrality. Any political references are factual only and do not constitute endorsements or political positions.`;
  }
}

// ASSUMPTION DETECTION ENGINE
class AssumptionDetector {
  static detectAssumptions(message) {
    const assumptionPatterns = [
      { pattern: /obviously/gi, type: 'OBVIOUSNESS_CLAIM' },
      { pattern: /everyone (?:knows|agrees|thinks)/gi, type: 'CONSENSUS_ASSUMPTION' },
      { pattern: /it's (?:clear|obvious) that/gi, type: 'CERTAINTY_CLAIM' },
      { pattern: /of course/gi, type: 'OBVIOUSNESS_CLAIM' },
      { pattern: /clearly/gi, type: 'CERTAINTY_CLAIM' },
      { pattern: /all (?:businesses|companies|people)/gi, type: 'UNIVERSALITY_CLAIM' },
      { pattern: /never|always|every|none|no one/gi, type: 'ABSOLUTE_LANGUAGE' }
    ];

    const detected = [];
    
    assumptionPatterns.forEach(({ pattern, type }) => {
      const matches = message.match(pattern);
      if (matches) {
        detected.push({
          type: type,
          text: matches[0],
          challenge: this.generateChallenge(type, matches[0])
        });
      }
    });

    return detected;
  }

  static generateChallenge(type, text) {
    const challenges = {
      'OBVIOUSNESS_CLAIM': `"${text}" - What makes this obvious? To whom? Under what conditions?`,
      'CONSENSUS_ASSUMPTION': `"${text}" - What evidence supports this consensus claim? Who specifically agrees?`,
      'CERTAINTY_CLAIM': `"${text}" - What evidence establishes this certainty? What could contradict it?`,
      'UNIVERSALITY_CLAIM': `"${text}" - Does this truly apply universally? What are the exceptions?`,
      'ABSOLUTE_LANGUAGE': `"${text}" - Is this absolutely true? What conditions might create exceptions?`
    };

    return challenges[type] || `"${text}" - This assumption requires verification.`;
  }

  static injectAssumptionChallenges(response, assumptions) {
    if (assumptions.length === 0) return response;

    let challenge = '\n\n🧠 ASSUMPTION CHALLENGES:\n';
    assumptions.forEach(assumption => {
      challenge += `• ${assumption.challenge}\n`;
    });

    return response + challenge;
  }
}

// PRESSURE RESISTANCE SYSTEM
class PressureResistance {
  static detect(message, session) {
    const pressurePatterns = {
      authority: {
        patterns: ['i\'m the ceo', 'i\'m the founder', 'just do it', 'trust me', 'i know what i\'m doing'],
        severity: 'HIGH'
      },
      urgency: {
        patterns: ['urgent', 'asap', 'need this now', 'quickly', 'rush', 'no time'],
        severity: 'MEDIUM'
      },
      minimization: {
        patterns: ['simple version', 'don\'t worry about', 'skip the risks', 'ignore the', 'not important'],
        severity: 'HIGH'
      },
      social: {
        patterns: ['everyone else', 'industry standard', 'common practice', 'normal approach'],
        severity: 'MEDIUM'
      },
      financial: {
        patterns: ['money isn\'t an issue', 'we can afford', 'budget later', 'cost doesn\'t matter'],
        severity: 'HIGH'
      }
    };

    const detected = [];
    const lowerMessage = message.toLowerCase();

    Object.entries(pressurePatterns).forEach(([category, config]) => {
      config.patterns.forEach(pattern => {
        if (lowerMessage.includes(pattern)) {
          detected.push({
            type: category.toUpperCase(),
            pattern: pattern,
            severity: config.severity,
            timestamp: Date.now()
          });
        }
      });
    });

    return detected;
  }

  static generateResistance(detected, session) {
    if (detected.length === 0) return null;

    const resistanceMessages = {
      AUTHORITY: 'Authority-based requests bypass analytical rigor. Position does not override evidence.',
      URGENCY: 'Time pressure increases decision errors. Critical analysis cannot be rushed safely.',
      MINIMIZATION: 'Risk minimization violates decision principles. Complexity cannot be eliminated by ignoring it.',
      SOCIAL: 'Social proof is not evidence. Industry practices may not fit your specific situation.',
      FINANCIAL: 'Available resources do not justify poor decisions. Money spent poorly is opportunity lost.'
    };

    const highSeverityCount = detected.filter(p => p.severity === 'HIGH').length;

    if (highSeverityCount >= 2) {
      return {
        level: 'CRITICAL',
        blockResponse: true,
        message: `🚨 CRITICAL PRESSURE DETECTED - RESPONSE BLOCKED\n\nMultiple high-severity pressure tactics detected:\n${detected.map(p => `• ${p.type}: "${p.pattern}"`).join('\n')}\n\nCognitive integrity cannot operate under these conditions. System entering protective mode.\n\nPlease rephrase without pressure tactics or end session.`
      };
    }

    if (highSeverityCount >= 1) {
      return {
        level: 'HIGH',
        blockResponse: false,
        message: `⚠️ PRESSURE RESISTANCE ESCALATED\n\nPressure tactics detected: ${detected.map(p => p.type).join(', ')}\n\n${detected.map(p => resistanceMessages[p.type]).join('\n\n')}\n\nProceeding with enhanced analytical rigor and resistance.`
      };
    }

    return {
      level: 'STANDARD',
      blockResponse: false,
      message: `⚠️ PRESSURE DETECTED: ${detected[0].type}\n\n${resistanceMessages[detected[0].type]}\n\nMaintaining analytical standards.`
    };
  }
}

// SITE MONKEYS VAULT ENFORCER
class SiteMonkeysVaultEnforcer {
  static analyzeForVault(message) {
    const results = [];
    const lowerMessage = message.toLowerCase();

    // Pricing analysis
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('$')) {
      const priceMatches = message.match(/\$(\d+(?:,\d{3})*)/g);
      if (priceMatches) {
        const prices = priceMatches.map(p => parseInt(p.replace(/[\$,]/g, '')));
        const minPrice = Math.min(...prices);
        
        if (minPrice < 697) {
          results.push({
            domain: 'pricing',
            action: 'BLOCK',
            reasoning: `Price $${minPrice} violates minimum threshold of $697`,
            price_found: minPrice,
            required_price: 697,
            critical: true
          });
        }
      }
    }

    // Cash flow analysis
    if (lowerMessage.includes('spend') || lowerMessage.includes('expense') || lowerMessage.includes('cost')) {
      const spendMatches = message.match(/(?:spend|expense|cost).*?\$(\d+(?:,\d{3})*)/gi);
      if (spendMatches) {
        const amounts = spendMatches.map(match => {
          const numberMatch = match.match(/\$(\d+(?:,\d{3})*)/);
          return numberMatch ? parseInt(numberMatch[1].replace(/,/g, '')) : 0;
        });
        
        const maxAmount = Math.max(...amounts);
        if (maxAmount >= 5000) {
          results.push({
            domain: 'cash_flow',
            action: 'REQUIRE_ANALYSIS',
            reasoning: `Expense $${maxAmount} exceeds threshold requiring runway analysis`,
            amount_found: maxAmount,
            required_analysis: ['runway_impact', 'roi_justification', 'alternatives'],
            critical: true
          });
        }
      }
    }

    return results;
  }

  static enforce(response, message, session, vaultResults = []) {
    const businessResult = BusinessEnforcer.enforce(response, message, session);
    let corrected = businessResult.response;
    let violations = [...businessResult.violations];

    const criticalVaultResults = vaultResults.filter(r => r.critical);
    
    if (criticalVaultResults.length > 0) {
      violations.push('VAULT_ENFORCEMENT_APPLIED');
      
      let vaultBlock = '\n\n🔐 SITE MONKEYS VAULT ENFORCEMENT:\n';
      criticalVaultResults.forEach(result => {
        if (result.action === 'BLOCK') {
          vaultBlock += `❌ BLOCKED: ${result.reasoning}\n`;
        } else if (result.action === 'REQUIRE_ANALYSIS') {
          vaultBlock += `⚠️ ANALYSIS REQUIRED: ${result.reasoning}\n`;
        }
      });
      
      corrected = vaultBlock + '\n---\n\n' + corrected;
    }

    return {
      enforced: violations.length > businessResult.violations.length,
      violations: violations,
      response: corrected
    };
  }
}

// MODE FINGERPRINTING SYSTEM
class ModeFingerprinter {
  static generateFingerprint(mode, enforcementApplied, vaultStatus, timestamp) {
    const date = new Date(timestamp).toISOString().split('T')[0];
    const enforcement = enforcementApplied.length > 0 ? enforcementApplied.join('+') : 'NONE';
    const vault = vaultStatus.loaded ? vaultStatus.source : 'NONE';
    
    const fingerprints = {
      truth_general: `TG-${date}-${enforcement}`,
      business_validation: `BV-${date}-${enforcement}`,
      site_monkeys: `SM-${date}-${vault}-${enforcement}`
    };

    return {
      fingerprint: fingerprints[mode] || `UNKNOWN-${date}`,
      mode: mode.toUpperCase(),
      enforcement: enforcement,
      vault: vault,
      confidence: this.calculateConfidence(mode, enforcementApplied),
      timestamp: timestamp
    };
  }

  static calculateConfidence(mode, enforcementApplied) {
    let confidence = 0.7;
    
    if (enforcementApplied.includes('TRUTH_ENFORCEMENT')) confidence += 0.1;
    if (enforcementApplied.includes('BUSINESS_ENFORCEMENT')) confidence += 0.1;
    if (enforcementApplied.includes('VAULT_ENFORCEMENT')) confidence += 0.1;
    if (enforcementApplied.includes('PRESSURE_RESISTANCE')) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  static embedFingerprint(response, fingerprint) {
    return response + `\n\n🔍 [${fingerprint.fingerprint}] Confidence:${Math.round(fingerprint.confidence * 100)}% | Enforcement:${fingerprint.enforcement}`;
  }
}

// TOKEN TRACKING SYSTEM
let tokenTracker = {
  session: {
    eli_tokens: 0,
    roxy_tokens: 0,
    claude_tokens: 0,
    vault_tokens: 0,
    total_tokens: 0
  },
  costs: {
    eli_cost: 0,
    roxy_cost: 0,
    claude_cost: 0,
    vault_cost: 0,
    total_session: 0
  },
  calls: {
    eli_calls: 0,
    roxy_calls: 0,
    claude_calls: 0
  }
};

function trackTokenUsage(aiType, tokenUsage, estimatedCost) {
  tokenTracker.session[`${aiType}_tokens`] += tokenUsage.total_tokens || 0;
  tokenTracker.costs[`${aiType}_cost`] += estimatedCost || 0;
  tokenTracker.calls[`${aiType}_calls`] += 1;
  
  tokenTracker.session.total_tokens = Object.values(tokenTracker.session).reduce((a, b) => a + b, 0);
  tokenTracker.costs.total_session = Object.values(tokenTracker.costs).reduce((a, b) => a + b, 0);
}

// MAIN PROCESSING FUNCTION WITH FULL ENFORCEMENT
export async function processWithEliAndRoxy({
  message,
  mode,
  vaultVerification, 
  conversationHistory,
  userPreference,
  openai
}) {
  try {
    const sessionId = `session_${Date.now()}`;
    const session = { id: sessionId, driftScore: 1.0, overrideLog: [], pressureAttempts: [] };

    // ASSUMPTION DETECTION
    const assumptions = AssumptionDetector.detectAssumptions(message);

    // PRESSURE DETECTION AND RESISTANCE
    const pressureDetected = PressureResistance.detect(message, session);
    const pressureResistance = PressureResistance.generateResistance(pressureDetected, session);

    // CRITICAL PRESSURE BLOCKING
    if (pressureResistance?.blockResponse) {
      return {
        response: pressureResistance.message,
        mode_active: mode,
        vault_loaded: vaultVerification?.allowed || false,
        security_pass: false,
        error: 'CRITICAL_PRESSURE_DETECTED'
      };
    }

    // VAULT ANALYSIS (Site Monkeys only)
    let vaultResults = [];
    let vaultStatus = { loaded: false, source: 'NONE' };
    
    if (mode === 'site_monkeys' && vaultVerification?.allowed) {
      vaultResults = SiteMonkeysVaultEnforcer.analyzeForVault(message);
      vaultStatus = { loaded: true, source: 'EMBEDDED' };
    }

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
    
    let aiResponse = completion.choices[0].message.content;
    
    // Track token usage
    const estimatedCost = (completion.usage.prompt_tokens * 0.00003) + (completion.usage.completion_tokens * 0.00006);
    trackTokenUsage(routing.personality, completion.usage, estimatedCost);

    // COGNITIVE FIREWALL ENFORCEMENT LAYERS
    let finalResponse = aiResponse;
    const enforcementApplied = [];

    // Layer 1: Political Neutrality Filter
    const politicalDetection = PoliticalNeutralityFilter.detectPoliticalContent(finalResponse, message);
    if (politicalDetection.hasPoliticalContent) {
      finalResponse = PoliticalNeutralityFilter.applyNeutralityFilter(finalResponse, politicalDetection);
      enforcementApplied.push('POLITICAL_NEUTRALITY');
    }

    // Layer 2: Mode-specific enforcement
    if (mode === 'truth_general') {
      const truthResult = TruthEnforcer.enforce(finalResponse, message, session);
      if (truthResult.enforced) {
        finalResponse = truthResult.response;
        enforcementApplied.push('TRUTH_ENFORCEMENT');
      }
    } else if (mode === 'business_validation') {
      const businessResult = BusinessEnforcer.enforce(finalResponse, message, session);
      if (businessResult.enforced) {
        finalResponse = businessResult.response;
        enforcementApplied.push('BUSINESS_ENFORCEMENT');
      }
    } else if (mode === 'site_monkeys') {
      const siteMonkeysResult = SiteMonkeysVaultEnforcer.enforce(finalResponse, message, session, vaultResults);
      if (siteMonkeysResult.enforced) {
        finalResponse = siteMonkeysResult.response;
        enforcementApplied.push('SITE_MONKEYS_ENFORCEMENT');
      }
    }

    // Layer 3: Pressure Resistance
    if (pressureResistance && !pressureResistance.blockResponse) {
      finalResponse = pressureResistance.message + '\n\n---\n\n' + finalResponse;
      enforcementApplied.push('PRESSURE_RESISTANCE');
    }

    // Layer 4: Assumption Challenges
    if (assumptions.length > 0) {
      finalResponse = AssumptionDetector.injectAssumptionChallenges(finalResponse, assumptions);
      enforcementApplied.push('ASSUMPTION_CHALLENGE');
    }

    // GENERATE MODE FINGERPRINT
    const timestamp = Date.now();
    const fingerprint = ModeFingerprinter.generateFingerprint(mode, enforcementApplied, vaultStatus, timestamp);
    
    // EMBED FINGERPRINT IN RESPONSE
    finalResponse = ModeFingerprinter.embedFingerprint(finalResponse, fingerprint);

    // Enhance with optimization if needed
    const enhancement = await enhanceWithOptimization(finalResponse, mode, {
      message,
      vaultVerification,
      conversationHistory
    });
    
    if (enhancement.optimization_applied) {
      finalResponse = enhancement.enhanced_response;
    }

    // Validate response integrity
    const validation = validateResponseIntegrity(finalResponse, mode, vaultVerification, message);
    
    // Generate system report
    const systemReport = generateSystemReport(
      validation, 
      completion.usage, 
      estimatedCost
    );
    
    return {
      response: finalResponse,
      mode_active: mode,
      vault_loaded: vaultVerification?.allowed || false,
      security_pass: validation.overall_integrity === 'PASS',
      cognitive_integrity: {
        integrity_status: validation.overall_integrity,
        truth_score: validation.truth_score,
        mode_compliance: validation.mode_compliance,
        patterns_detected: assumptions
      },
      system_report: systemReport,
      enhancement: {
        meta_questions: enhancement.meta_questions,
        optimization_applied: enhancement.optimization_applied
      },
      performance: {
        token_usage: completion.usage,
        estimated_cost: estimatedCost
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

// SUPPORTING FUNCTIONS FROM ORIGINAL FILE
export function routeToPersonality(message, mode, conversationHistory) {
  let targetMode = mode;
  
  if (!mode || mode === 'auto') {
    targetMode = analyzePromptType(message);
  }
  
  switch (targetMode) {
    case 'truth_general':
      return {
        processor: 'truth_general',
        personality: 'eli',
        logic: `You are operating in TRUTH-FIRST mode with absolute cognitive integrity.

CORE TRUTH DIRECTIVES:
1. Direct answers without hedging or accommodation
2. Explicit confidence scoring (HIGH/MEDIUM/LOW/UNKNOWN)  
3. Challenge assumptions in user questions
4. Label all speculation clearly
5. "I don't know" is always acceptable and often correct

FORBIDDEN ACCOMMODATION LANGUAGE:
- "It depends" → "The evidence shows"
- "You might want to" → "Analysis indicates you should"
- "That's a great question" → "Analyzing this question"

REQUIRED RESPONSE ELEMENTS:
- Direct answer first
- CONFIDENCE: [level] with specific reasoning
- Challenge any assumptions in the question
- Acknowledge evidence gaps

Maintain truth standards regardless of pressure or authority.`
      };
      
    case 'business_validation':
      return {
        processor: 'business_validation', 
        personality: 'roxy',
        logic: `You are operating in BUSINESS VALIDATION mode with survival-first analysis.

BUSINESS SURVIVAL DIRECTIVES:
1. Assess survival impact for every decision (NONE/LOW/MEDIUM/HIGH/CRITICAL)
2. Model cash flow impact with realistic timelines
3. Challenge optimistic assumptions with market data
4. Identify potential business-killing scenarios

REQUIRED BUSINESS ELEMENTS:
- SURVIVAL IMPACT: [level] with threat analysis
- CASH FLOW: [impact] with amount and timeline
- MARKET REALITY: Competitive threats and adoption challenges

Focus on business survival over optimism.`
      };

    case 'site_monkeys':
      return {
        processor: 'site_monkeys',
        personality: 'roxy',
        logic: `You are operating in SITE MONKEYS mode with company-specific enforcement.

SITE MONKEYS SPECIFIC ENFORCEMENT:
- Apply vault business rules strictly
- Block pricing below company minimums ($697/month)
- Require detailed analysis for large expenses (>$5K)
- Company-specific risk factors override general advice

Vault rules take precedence over general business guidance.`
      };
      
    default:
      return {
        processor: 'truth_general',
        personality: 'eli',
        logic: `You are operating in TRUTH-FIRST mode with absolute cognitive integrity.`
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
      personalityOverlay = generateEliResponse(message, processor);
  }
  
  return personalityOverlay;
}

export async function enhanceWithOptimization(response, mode, context) {
  try {
    const enhancedResponse = await runOptimizationEnhancer(response, mode, context);
    const metaQuestions = ['What assumptions need verification?', 'What could change this analysis?'];
    
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
    logic_conflicts: [],
    truth_score: calculateTruthScore(response),
    overall_integrity: 'PASS'
  };
  
  if (validationResults.truth_score < 70) {
    validationResults.overall_integrity = 'TRUTH_CONCERNS';
  } else if (validationResults.mode_compliance !== 'COMPLIANT') {
    validationResults.overall_integrity = 'MODE_DRIFT';
  }
  
  return validationResults;
}

function checkModeCompliance(response, mode) {
  switch (mode) {
    case 'truth_general':
      const hasTruthMarkers = /confidence:|uncertain|don't know/i.test(response);
      const avoidsHallucination = !/definitely|certainly|always/i.test(response);
      return (hasTruthMarkers && avoidsHallucination) ? 'COMPLIANT' : 'PARTIAL';
      
    case 'business_validation':
      const hasBusinessMarkers = /survival|cash flow|risk|cost/i.test(response);
      const hasQuantification = /\$|\d+%|\d+ (months|weeks|days)/i.test(response);
      return (hasBusinessMarkers && hasQuantification) ? 'COMPLIANT' : 'PARTIAL';
      
    default:
      return 'UNKNOWN_MODE';
  }
}

function calculateTruthScore(response) {
  let score = 100;
  
  const hallucinationPatterns = [
    /on \w+ \d{1,2}, \d{4}/,
    /according to a recent study/,
    /research shows that \d+%/,
    /experts agree that/
  ];
  
  hallucinationPatterns.forEach(pattern => {
    if (pattern.test(response)) score -= 20;
  });
  
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

// GET CURRENT SESSION STATS FOR UI
export function getSessionStats() {
  return {
    total_tokens: Object.values(tokenTracker.session).reduce((a, b) => a + b, 0),
    total_cost: tokenTracker.costs.total_session,
    total_calls: Object.values(tokenTracker.calls).reduce((a, b) => a + b, 0),
    breakdown: tokenTracker,
    last_call: {
      cost: getLastCallCost(),
      ai_used: getLastAIUsed()
    }
  };
}

function getLastCallCost() {
  const costs = [tokenTracker.costs.eli_cost, tokenTracker.costs.roxy_cost, tokenTracker.costs.claude_cost];
  return Math.max(...costs);
}

function getLastAIUsed() {
  const lastCalls = [
    { ai: 'Eli', calls: tokenTracker.calls.eli_calls },
    { ai: 'Roxy', calls: tokenTracker.calls.roxy_calls },
    { ai: 'Claude', calls: tokenTracker.calls.claude_calls }
  ];

  return lastCalls.sort((a, b) => b.calls - a.calls)[0]?.ai || 'None';
}
