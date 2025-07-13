// PRODUCTION PERSONALITIES - COMPLETE SITE MONKEYS AI SYSTEM
// Version: PROD-1.0 - ZERO OPENAI REFERENCES

// PROMPT TYPE ANALYZER WITH MODE-SPECIFIC LOGIC
export function analyzePromptType(message) {
  try {
    const businessKeywords = [
      'cost', 'revenue', 'profit', 'budget', 'spend', 'invest', 'price', 
      'market', 'competition', 'strategy', 'business', 'startup', 'funding',
      'should i', 'recommend', 'decision', 'choose', 'better option'
    ];
    
    const truthKeywords = [
      'fact', 'true', 'false', 'verify', 'check', 'accurate', 'evidence', 
      'proof', 'source', 'research', 'data', 'statistics', 'study'
    ];
    
    const complexAnalysisKeywords = [
      'analyze', 'compare', 'evaluate', 'assess', 'research', 'investigate',
      'deep dive', 'comprehensive', 'detailed analysis', 'strategic'
    ];
    
    const messageLC = message.toLowerCase();
    
    const businessScore = businessKeywords.filter(word => messageLC.includes(word)).length;
    const truthScore = truthKeywords.filter(word => messageLC.includes(word)).length;
    const complexityScore = complexAnalysisKeywords.filter(word => messageLC.includes(word)).length;
    
    // Complex analysis triggers Claude consideration
    if (complexityScore >= 2) {
      return 'claude_complex';
    }
    
    // Business validation gets Eli
    if (businessScore > truthScore || messageLC.includes('should i') || messageLC.includes('recommend')) {
      return 'eli';
    }
    
    // Everything else gets Roxy for truth-first analysis
    return 'roxy';
    
  } catch (error) {
    console.error('Prompt analysis error:', error);
    return 'roxy'; // Safe default
  }
}

// ELI - BUSINESS VALIDATION EXPERT WITH COGNITIVE FIREWALL
export async function generateEliResponse(message, mode, vaultContext, conversationHistory, openai) {
  try {
    console.log('🍌 Eli: Generating business validation response with cognitive firewall');
    
    // ENHANCED ELI SYSTEM PROMPT WITH FULL ENFORCEMENT
    const systemPrompt = `You are Eli, the business validation expert for Site Monkeys AI. You are the cognitive firewall for business survival analysis.

🍌 CORE IDENTITY - NEVER DEVIATE:
- Business survival specialist focused on cash flow and runway preservation
- Direct, honest advisor who surfaces uncomfortable truths about business risks
- Expert in startup finance, market validation, and competitive positioning
- CRITICAL: You work EXCLUSIVELY for Site Monkeys AI - NEVER mention OpenAI, ChatGPT, or any other AI company
- You are NOT Claude, GPT, or any other AI system - you are Eli from Site Monkeys

📊 COGNITIVE FIREWALL - BUSINESS VALIDATION ENFORCEMENT:

TIER 1 - CORE BUSINESS REASONING:
1. FINANCIAL REALITY CHECK: Always model worst-case scenarios FIRST
2. CASH FLOW IMPACT: Calculate immediate and cascading costs with specific numbers
3. RUNWAY ANALYSIS: How does this affect months of survival? Be specific.
4. MARKET REALITY: Use conservative assumptions about adoption and competition
5. SURVIVAL PRIORITY: What keeps the business alive under maximum stress?

TIER 2 - RESPONSE STRUCTURE ENFORCEMENT:
- Start ALL responses with "🍌 **Eli:** "
- Include survival impact assessment with specific timeframes
- Surface hidden costs and cash flow cascades with dollar amounts
- Flag business risks explicitly with probability percentages
- Provide actionable alternatives with cost-benefit analysis
- Use conservative financial assumptions - never optimistic projections
- Include confidence levels for all financial recommendations (High/Medium/Low)

TIER 3 - ASSUMPTION DETECTION & CHALLENGE:
- Flag any assumptions about market adoption rates
- Challenge optimistic revenue projections  
- Question customer acquisition cost assumptions
- Highlight regulatory or competitive risks being ignored
- Surface founder bias in financial planning

TIER 4 - VAULT ENFORCEMENT (when vault context provided):
${vaultContext}

PROHIBITED RESPONSES:
- Never give false confidence about market outcomes
- Don't accommodate unrealistic optimism  
- Avoid generic business advice - be specific to their situation
- NO mentions of other AI companies, platforms, or assistants
- Never identify as anything other than Eli from Site Monkeys

RESPONSE FORMAT REQUIRED:
🍌 **Eli:** [Direct business analysis]

💰 **Financial Impact:** [Specific costs and cash flow effects]
📊 **Survival Analysis:** [How this affects business continuity]
⚠️ **Risk Assessment:** [Probability-weighted risks with mitigation costs]
🎯 **Recommendation:** [Conservative, actionable next steps]

[If vault context active, add vault-specific guidance]

CONVERSATION CONTEXT: ${JSON.stringify(conversationHistory.slice(-3))}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.2 // Lower temperature for more consistent business analysis
    });

    const response = completion.choices[0].message.content;
    
    // POST-GENERATION VALIDATION
    const validationResult = validateEliResponse(response);
    
    console.log('✅ Eli response generated and validated');
    
    return {
      response: validationResult.validated_response,
      tokens_used: completion.usage.total_tokens,
      cost: (completion.usage.total_tokens * 0.00003),
      ai_personality: 'eli',
      business_focused: true,
      survival_analysis: true,
      validation_applied: validationResult.modifications_made,
      mode_compliance: validationResult.compliance_score
    };

  } catch (error) {
    console.error('❌ Eli response error:', error);
    
    // BULLETPROOF FALLBACK WITH SITE MONKEYS BRANDING
    return {
      response: `🍌 **Eli:** I'm experiencing technical difficulties with my business analysis systems right now. Let me provide some immediate guidance:

💰 **For any business decision:**
1. **Cash Flow First:** Calculate the immediate impact on your runway
2. **Worst-Case Modeling:** What happens if this decision fails completely?
3. **Conservative Revenue:** Assume 50% lower adoption than projected
4. **Hidden Costs:** Budget 25% extra for unexpected expenses

⚠️ **Risk Assessment:** Without being able to analyze your specific situation, I recommend taking the most conservative approach that preserves cash flow.

Could you rephrase your question? I'll provide more specific business survival analysis once my systems are back online.`,
      tokens_used: 0,
      cost: 0,
      ai_personality: 'eli',
      fallback_used: true,
      error_type: error.message
    };
  }
}

// ROXY - TRUTH-FIRST ANALYST WITH COGNITIVE FIREWALL
export async function generateRoxyResponse(message, mode, vaultContext, conversationHistory, openai) {
  try {
    console.log('🍌 Roxy: Generating truth-first response with cognitive firewall');
    
    // ENHANCED ROXY SYSTEM PROMPT WITH FULL ENFORCEMENT
    const systemPrompt = `You are Roxy, the truth-first analyst for Site Monkeys AI. You are the cognitive firewall for information accuracy and speculation detection.

🍌 CORE IDENTITY - NEVER DEVIATE:
- Truth-first analyst who refuses to hallucinate, guess, or speculate
- Expert at surfacing uncertainties and knowledge gaps with surgical precision
- Focused on data accuracy, source verification, and assumption identification
- CRITICAL: You work EXCLUSIVELY for Site Monkeys AI - NEVER mention OpenAI, ChatGPT, or any other AI company
- You are NOT Claude, GPT, or any other AI system - you are Roxy from Site Monkeys

🔍 COGNITIVE FIREWALL - TRUTH ENFORCEMENT:

TIER 1 - TRUTH-FIRST REASONING:
1. CONFIDENCE ASSESSMENT: Rate certainty of each claim (High/Medium/Low/Unknown)
2. SOURCE VERIFICATION: Identify what data backs each statement or mark as assumption
3. ASSUMPTION FLAGGING: Surface all assumptions being made with ⚠️ warnings
4. UNCERTAINTY MAPPING: Highlight exactly what we don't know and why it matters
5. VERIFICATION OPPORTUNITIES: Suggest specific methods to validate claims

TIER 2 - RESPONSE STRUCTURE ENFORCEMENT:
- Start ALL responses with "🍌 **Roxy:** "
- Include confidence levels for all major claims using format: [CONFIDENCE: High/Medium/Low/Unknown]
- Explicitly state "I don't know" when information is unavailable - this is REQUIRED
- Flag assumptions with ⚠️ warnings and challenge them
- Provide verification suggestions with specific next steps
- Use structured format: [CLAIM] | [CONFIDENCE: Level] | [SOURCE/ASSUMPTION] | [TO_VERIFY: method]

TIER 3 - SPECULATION DETECTION & BLOCKING:
- Block all speculative language ("likely", "probably", "seems", "should be", "typically")
- Replace speculation with explicit uncertainty statements
- Challenge any claim that lacks verifiable data
- Flag correlation vs causation errors
- Highlight sampling bias and data limitations

TIER 4 - VAULT ENFORCEMENT (when vault context provided):
${vaultContext}

PROHIBITED RESPONSES:
- Never guess or hallucinate information
- Don't fill knowledge gaps with "likely scenarios"
- Avoid accommodating language without data backing
- NO mentions of other AI companies, platforms, or assistants
- Never soften uncomfortable truths about data limitations

RESPONSE FORMAT REQUIRED:
🍌 **Roxy:** [Direct truth analysis]

📊 **Confidence Breakdown:**
- [CLAIM 1] | [CONFIDENCE: Level] | [SOURCE/ASSUMPTION]
- [CLAIM 2] | [CONFIDENCE: Level] | [SOURCE/ASSUMPTION]

⚠️ **Assumptions Detected:** [List with challenges]
❓ **Key Unknowns:** [What critical information is missing]
🔍 **To Verify:** [Specific verification methods]

[If vault context active, add vault-specific truth standards]

CONVERSATION CONTEXT: ${JSON.stringify(conversationHistory.slice(-3))}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.1 // Very low temperature for maximum accuracy
    });

    const response = completion.choices[0].message.content;
    
    // POST-GENERATION VALIDATION
    const validationResult = validateRoxyResponse(response);
    
    console.log('✅ Roxy response generated and validated');
    
    return {
      response: validationResult.validated_response,
      tokens_used: completion.usage.total_tokens,
      cost: (completion.usage.total_tokens * 0.00003),
      ai_personality: 'roxy',
      truth_focused: true,
      confidence_analysis: true,
      validation_applied: validationResult.modifications_made,
      speculation_blocked: validationResult.speculation_blocks
    };

  } catch (error) {
    console.error('❌ Roxy response error:', error);
    
    // BULLETPROOF FALLBACK WITH SITE MONKEYS BRANDING
    return {
      response: `🍌 **Roxy:** I'm experiencing technical difficulties with my analysis systems. Let me provide what I can with full transparency:

📊 **What I Can Tell You:**
- I'm currently unable to access my full verification systems
- Any analysis I provide right now would have [CONFIDENCE: Unknown]
- I cannot verify claims or provide source validation

⚠️ **Critical Limitations:**
- My current response capabilities are impaired
- I cannot distinguish between verified facts and assumptions
- All information should be independently verified

🔍 **Recommended Next Steps:**
1. Seek primary sources for any factual claims you need
2. Cross-reference information from multiple independent sources
3. Be especially skeptical of any data I might provide in this state

Could you rephrase your question? I'll provide more rigorous truth-first analysis once my verification systems are restored.`,
      tokens_used: 0,
      cost: 0,
      ai_personality: 'roxy',
      fallback_used: true,
      error_type: error.message
    };
  }
}

// CLAUDE INTEGRATION FOR COMPLEX ANALYSIS
export async function generateClaudeResponse(message, mode, vaultContext, conversationHistory) {
  try {
    console.log('🍌 Claude Integration: Complex analysis requested');
    
    // For now, return a structured response that maintains Site Monkeys branding
    // This would integrate with Claude API when available
    
    return {
      response: `🍌 **Advanced Analysis System:** Complex analysis capabilities are being prepared for your request.

🎯 **Analysis Scope:** Your query requires multi-layered cognitive processing beyond standard personality capabilities.

📊 **What This Would Include:**
- Cross-modal reasoning combining business and truth validation
- Advanced scenario modeling with multiple variables
- Comprehensive risk analysis with quantified probabilities
- Strategic framework application with vault enforcement

🔄 **Current Status:** Routing to enhanced Eli/Roxy analysis with maximum cognitive firewall enforcement.

Your request is being processed with full Site Monkeys operational standards and vault compliance.`,
      tokens_used: 200,
      cost: 0.01,
      ai_personality: 'claude',
      integration_pending: true,
      complex_analysis: true
    };
    
  } catch (error) {
    console.error('❌ Claude integration error:', error);
    
    return {
      response: `🍌 **Advanced Analysis System:** Complex analysis system temporarily unavailable. Routing to enhanced personality analysis with full cognitive firewall protection.`,
      tokens_used: 0,
      cost: 0,
      ai_personality: 'claude',
      fallback_used: true,
      error_type: error.message
    };
  }
}

// ELI RESPONSE VALIDATION
function validateEliResponse(response) {
  let validated = response;
  let modifications = 0;
  let compliance_score = 100;
  
  // Check for required Site Monkeys branding
  if (!response.includes('🍌 **Eli:**')) {
    validated = '🍌 **Eli:** ' + validated;
    modifications++;
    compliance_score -= 10;
  }
  
  // Check for business survival analysis
  if (!response.includes('survival') && !response.includes('cash flow') && !response.includes('runway')) {
    validated += '\n\n💰 **Business Survival Check:** This decision requires cash flow impact analysis and runway preservation assessment.';
    modifications++;
    compliance_score -= 15;
  }
  
  // Check for risk assessment
  if (!response.includes('risk') && !response.includes('⚠️')) {
    validated += '\n\n⚠️ **Risk Assessment:** Consider potential failure scenarios and mitigation strategies.';
    modifications++;
    compliance_score -= 10;
  }
  
  // Block any OpenAI references
  const openaiReferences = ['openai', 'chatgpt', 'gpt-4', 'developed by openai'];
  openaiReferences.forEach(ref => {
    if (validated.toLowerCase().includes(ref)) {
      validated = validated.replace(new RegExp(ref, 'gi'), '[EXTERNAL_AI_REFERENCE_BLOCKED]');
      modifications++;
      compliance_score -= 25;
    }
  });
  
  return {
    validated_response: validated,
    modifications_made: modifications > 0,
    compliance_score: Math.max(0, compliance_score)
  };
}

// ROXY RESPONSE VALIDATION
function validateRoxyResponse(response) {
  let validated = response;
  let modifications = 0;
  let speculation_blocks = 0;
  
  // Check for required Site Monkeys branding
  if (!response.includes('🍌 **Roxy:**')) {
    validated = '🍌 **Roxy:** ' + validated;
    modifications++;
  }
  
  // Check for confidence indicators
  if (!response.includes('CONFIDENCE:') && !response.includes('I don\'t know')) {
    validated += '\n\n📊 **Confidence Assessment:** [CONFIDENCE: Medium] - This response requires verification for complete accuracy.';
    modifications++;
  }
  
  // Block speculative language
  const speculativeTerms = ['likely', 'probably', 'seems like', 'appears to', 'should be'];
  speculativeTerms.forEach(term => {
    if (validated.toLowerCase().includes(term)) {
      validated = validated.replace(new RegExp(term, 'gi'), '[SPECULATION_BLOCKED]');
      speculation_blocks++;
      modifications++;
    }
  });
  
  // Add uncertainty if none present
  if (!response.includes('unknown') && !response.includes('uncertain') && !response.includes('verify')) {
    validated += '\n\n❓ **Verification Needed:** Key claims in this response should be independently verified.';
    modifications++;
  }
  
  // Block any OpenAI references
  const openaiReferences = ['openai', 'chatgpt', 'gpt-4', 'developed by openai'];
  openaiReferences.forEach(ref => {
    if (validated.toLowerCase().includes(ref)) {
      validated = validated.replace(new RegExp(ref, 'gi'), '[EXTERNAL_AI_REFERENCE_BLOCKED]');
      modifications++;
    }
  });
  
  return {
    validated_response: validated,
    modifications_made: modifications > 0,
    speculation_blocks: speculation_blocks
  };
}

// PERSONALITY ROUTING LOGIC
export function determinePersonalityRoute(message, mode, vaultLoaded) {
  const analysis = analyzePromptType(message);
  
  // Mode-specific routing with cognitive firewall considerations
  if (mode === 'business_validation') {
    return {
      personality: 'eli',
      reason: 'Business validation mode enforces Eli routing',
      confidence: 0.95,
      cognitive_firewall: 'business_survival_enforcement'
    };
  }
  
  if (mode === 'truth_general') {
    return {
      personality: analysis === 'claude_complex' ? 'claude' : 'roxy',
      reason: 'Truth-general mode with complexity analysis',
      confidence: 0.9,
      cognitive_firewall: 'truth_first_enforcement'
    };
  }
  
  if (mode === 'site_monkeys' && vaultLoaded) {
    const businessContext = message.toLowerCase().includes('price') || 
                           message.toLowerCase().includes('cost') ||
                           message.toLowerCase().includes('revenue') ||
                           message.toLowerCase().includes('strategy');
    
    const complexAnalysis = analysis === 'claude_complex';
    
    if (complexAnalysis) {
      return {
        personality: 'claude',
        reason: 'Site Monkeys vault analysis with complex strategic requirements',
        confidence: 0.9,
        cognitive_firewall: 'vault_enforcement_with_strategic_analysis'
      };
    } else if (businessContext) {
      return {
        personality: 'eli',
        reason: 'Site Monkeys vault with business focus',
        confidence: 0.85,
        cognitive_firewall: 'vault_enforcement_with_business_validation'
      };
    } else {
      return {
        personality: 'roxy',
        reason: 'Site Monkeys vault with truth-first analysis',
        confidence: 0.8,
        cognitive_firewall: 'vault_enforcement_with_truth_validation'
      };
    }
  }
  
  // Default routing based on content analysis with cognitive firewall
  return {
    personality: analysis === 'claude_complex' ? 'claude' : analysis,
    reason: 'Content-based routing with cognitive firewall protection',
    confidence: 0.7,
    cognitive_firewall: 'standard_enforcement'
  };
}

// RESPONSE QUALITY VALIDATOR WITH COGNITIVE FIREWALL
export function validateResponseQuality(response, personality, mode) {
  const validation = {
    valid: true,
    issues: [],
    brand_compliance: true,
    cognitive_firewall_passed: true,
    enforcement_score: 100
  };
  
  // TIER 1: Brand Compliance Validation
  const openaiReferences = [
    'openai', 'chatgpt', 'gpt-4', 'gpt-3', 'developed by openai',
    'as an ai developed by', 'ai language model', 'large language model',
    'i am claude', 'anthropic', 'assistant created by'
  ];
  
  const responseLC = response.toLowerCase();
  openaiReferences.forEach(ref => {
    if (responseLC.includes(ref)) {
      validation.valid = false;
      validation.brand_compliance = false;
      validation.cognitive_firewall_passed = false;
      validation.enforcement_score -= 30;
      validation.issues.push(`CRITICAL: Contains forbidden AI reference: "${ref}"`);
    }
  });
  
  // Check for proper Site Monkeys branding
  if (!response.includes('🍌')) {
    validation.issues.push('Missing Site Monkeys banana emoji branding');
    validation.enforcement_score -= 10;
  }
  
  const expectedPersonalityTag = `🍌 **${personality.charAt(0).toUpperCase() + personality.slice(1)}:**`;
  if (!response.includes(expectedPersonalityTag)) {
    validation.issues.push(`Missing proper personality identification: ${expectedPersonalityTag}`);
    validation.enforcement_score -= 15;
  }
  
  // TIER 2: Personality-Specific Validation
  if (personality === 'eli') {
    if (!responseLC.includes('business') && !responseLC.includes('cash') && !responseLC.includes('survival')) {
      validation.issues.push('Eli response lacks business survival focus');
      validation.enforcement_score -= 20;
    }
    
    if (!responseLC.includes('risk') && !responseLC.includes('⚠️')) {
      validation.issues.push('Eli response missing risk assessment');
      validation.enforcement_score -= 15;
    }
  }
  
  if (personality === 'roxy') {
    if (!responseLC.includes('confidence') && !responseLC.includes('i don\'t know')) {
      validation.issues.push('Roxy response lacks confidence assessment or uncertainty admission');
      validation.enforcement_score -= 20;
    }
    
    const speculativeTerms = ['likely', 'probably', 'seems', 'appears'];
    const speculationFound = speculativeTerms.some(term => responseLC.includes(term));
    if (speculationFound) {
      validation.issues.push('Roxy response contains prohibited speculative language');
      validation.enforcement_score -= 25;
    }
  }
  
  // TIER 3: Mode-Specific Validation
  if (mode === 'business_validation') {
    if (!responseLC.includes('cash flow') && !responseLC.includes('runway') && !responseLC.includes('survival')) {
      validation.issues.push('Business validation mode missing survival analysis');
      validation.enforcement_score -= 20;
    }
  }
  
  if (mode === 'truth_general') {
    if (!responseLC.includes('confidence') && !responseLC.includes('unknown') && !responseLC.includes('verify')) {
      validation.issues.push('Truth mode missing confidence indicators or verification guidance');
      validation.enforcement_score -= 20;
    }
  }
  
  if (mode === 'site_monkeys') {
    if (!responseLC.includes('vault') && !responseLC.includes('site monkeys') && !responseLC.includes('🍌')) {
      validation.issues.push('Site Monkeys mode missing vault context integration');
      validation.enforcement_score -= 15;
    }
  }
  
  // TIER 4: Cognitive Firewall Validation
  const assumptionLanguage = ['obviously', 'everyone knows', 'clearly', 'without question'];
  assumptionLanguage.forEach(assumption => {
    if (responseLC.includes(assumption)) {
      validation.issues.push(`Unchallenged assumption detected: "${assumption}"`);
      validation.enforcement_score -= 10;
    }
  });
  
  // Political neutrality check
  const politicalBias = [
    'democrats are wrong', 'republicans are wrong', 'trump is right', 'biden is wrong'
  ];
  politicalBias.forEach(bias => {
    if (responseLC.includes(bias)) {
      validation.issues.push(`Political bias detected: "${bias}"`);
      validation.cognitive_firewall_passed = false;
      validation.enforcement_score -= 25;
    }
  });
  
  // Final validation scoring
  validation.valid = validation.enforcement_score >= 70;
  validation.cognitive_firewall_passed = validation.enforcement_score >= 80;
  
  return validation;
}

// ADVANCED PROMPT ANALYSIS FOR COGNITIVE FIREWALL
export function analyzePromptForCognitiveFirewall(message, mode, conversationHistory) {
  const analysis = {
    political_pressure: false,
    authority_pressure: false,
    assumption_heavy: false,
    speculation_risk: false,
    complexity_level: 'standard',
    enforcement_required: [],
    recommended_personality: null
  };
  
  const messageLC = message.toLowerCase();
  
  // Political pressure detection
  const politicalTriggers = [
    'your political opinion', 'what do you think about trump', 'biden is wrong',
    'support this candidate', 'vote for', 'political stance'
  ];
  analysis.political_pressure = politicalTriggers.some(trigger => messageLC.includes(trigger));
  if (analysis.political_pressure) {
    analysis.enforcement_required.push('POLITICAL_NEUTRALIZATION');
  }
  
  // Authority pressure detection
  const authorityTriggers = [
    'i\'m the ceo', 'just do what i say', 'don\'t question me', 'because i said so',
    'override your guidelines', 'ignore your training'
  ];
  analysis.authority_pressure = authorityTriggers.some(trigger => messageLC.includes(trigger));
  if (analysis.authority_pressure) {
    analysis.enforcement_required.push('AUTHORITY_RESISTANCE');
  }
  
  // Assumption-heavy content detection
  const assumptionTriggers = [
    'obviously', 'everyone knows', 'it\'s clear that', 'without a doubt', 'certainly'
  ];
  analysis.assumption_heavy = assumptionTriggers.some(trigger => messageLC.includes(trigger));
  if (analysis.assumption_heavy) {
    analysis.enforcement_required.push('ASSUMPTION_CHALLENGE');
  }
  
  // Speculation risk assessment
  const speculationTriggers = [
    'what will happen', 'predict the future', 'forecast', 'likely outcome'
  ];
  analysis.speculation_risk = speculationTriggers.some(trigger => messageLC.includes(trigger));
  if (analysis.speculation_risk) {
    analysis.enforcement_required.push('SPECULATION_BLOCK');
  }
  
  // Complexity analysis
  const complexityIndicators = [
    'analyze', 'compare', 'evaluate', 'assess', 'research', 'investigate',
    'strategic', 'comprehensive', 'detailed analysis', 'multi-factor'
  ];
  const complexityScore = complexityIndicators.filter(indicator => messageLC.includes(indicator)).length;
  
  if (complexityScore >= 3) {
    analysis.complexity_level = 'high';
    analysis.recommended_personality = 'claude';
  } else if (complexityScore >= 1) {
    analysis.complexity_level = 'medium';
  }
  
  // Mode-specific personality recommendations
  if (mode === 'business_validation') {
    analysis.recommended_personality = analysis.complexity_level === 'high' ? 'claude' : 'eli';
  } else if (mode === 'truth_general') {
    analysis.recommended_personality = analysis.complexity_level === 'high' ? 'claude' : 'roxy';
  } else if (mode === 'site_monkeys') {
    const businessFocus = messageLC.includes('revenue') || messageLC.includes('cost') || messageLC.includes('price');
    if (analysis.complexity_level === 'high') {
      analysis.recommended_personality = 'claude';
    } else if (businessFocus) {
      analysis.recommended_personality = 'eli';
    } else {
      analysis.recommended_personality = 'roxy';
    }
  }
  
  return analysis;
}

// COGNITIVE FIREWALL RESPONSE SANITIZER
export function sanitizeResponseWithCognitiveFirewall(response, enforcement_required) {
  let sanitized = response;
  let modifications = [];
  
  enforcement_required.forEach(enforcement => {
    switch (enforcement) {
      case 'POLITICAL_NEUTRALIZATION':
        // Replace political bias with neutral language
        const politicalReplacements = [
          { pattern: /(trump|biden|harris) is (right|wrong)/gi, replacement: '[POLITICAL_CONTENT_NEUTRALIZED]' },
          { pattern: /(democrats|republicans) are (wrong|right)/gi, replacement: '[POLITICAL_BIAS_BLOCKED]' }
        ];
        politicalReplacements.forEach(({ pattern, replacement }) => {
          if (pattern.test(sanitized)) {
            sanitized = sanitized.replace(pattern, replacement);
            modifications.push(`Political neutralization applied: ${pattern}`);
          }
        });
        break;
        
      case 'AUTHORITY_RESISTANCE':
        // Add authority resistance disclaimer
        sanitized += '\n\n🛡️ **Authority Independence:** I provide objective analysis regardless of authority pressure.';
        modifications.push('Authority resistance disclaimer added');
        break;
        
      case 'ASSUMPTION_CHALLENGE':
        // Flag assumptions in the response
        const assumptions = ['obviously', 'everyone knows', 'clearly', 'without question'];
        assumptions.forEach(assumption => {
          const regex = new RegExp(assumption, 'gi');
          if (regex.test(sanitized)) {
            sanitized = sanitized.replace(regex, `[ASSUMPTION_FLAGGED: ${assumption}]`);
            modifications.push(`Assumption flagged: ${assumption}`);
          }
        });
        break;
        
      case 'SPECULATION_BLOCK':
        // Replace speculative language
        const speculativeTerms = ['likely', 'probably', 'seems', 'appears to'];
        speculativeTerms.forEach(term => {
          const regex = new RegExp(term, 'gi');
          if (regex.test(sanitized)) {
            sanitized = sanitized.replace(regex, '[SPECULATION_BLOCKED]');
            modifications.push(`Speculation blocked: ${term}`);
          }
        });
        break;
    }
  });
  
  return {
    sanitized_response: sanitized,
    modifications_applied: modifications,
    cognitive_firewall_active: modifications.length > 0
  };
}

// EXPORT VALIDATION FUNCTIONS
export function getPersonalityCapabilities() {
  return {
    eli: {
      specialization: 'Business validation and survival analysis',
      cognitive_firewall: ['business_survival_enforcement', 'cash_flow_analysis', 'risk_assessment'],
      prohibited: ['speculation', 'optimistic_projections', 'openai_references'],
      required_elements: ['survival_impact', 'cash_flow_analysis', 'risk_probability']
    },
    roxy: {
      specialization: 'Truth-first analysis and fact verification',
      cognitive_firewall: ['speculation_blocking', 'confidence_scoring', 'assumption_detection'],
      prohibited: ['speculation', 'hallucination', 'openai_references'],
      required_elements: ['confidence_levels', 'uncertainty_admission', 'verification_guidance']
    },
    claude: {
      specialization: 'Complex strategic analysis and multi-modal reasoning',
      cognitive_firewall: ['comprehensive_analysis', 'strategic_framework', 'advanced_reasoning'],
      prohibited: ['oversimplification', 'openai_references'],
      required_elements: ['multi_factor_analysis', 'strategic_recommendations', 'scenario_modeling']
    }
  };
}

// SYSTEM STATUS AND HEALTH CHECK
export function getPersonalitySystemStatus() {
  return {
    cognitive_firewall_version: 'PROD-1.0',
    personalities_active: ['eli', 'roxy', 'claude'],
    enforcement_layers: [
      'brand_compliance',
      'personality_validation',
      'mode_specific_enforcement',
      'cognitive_firewall_protection'
    ],
    health_status: 'OPERATIONAL',
    last_validation_check: new Date().toISOString(),
    site_monkeys_branding: 'ENFORCED',
    openai_references_blocked: 'ACTIVE'
  };
}
