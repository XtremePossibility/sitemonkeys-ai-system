// assumptions.js - Assumption Health Monitoring

export function checkAssumptionHealth(message, conversationHistory) {
  const warnings = [];
  
  // Check for common cognitive biases
  const biasPatterns = [
    {
      pattern: /(definitely|certainly|guaranteed|always works)/i,
      warning: "Overconfidence detected - consider uncertainty and edge cases"
    },
    {
      pattern: /(everyone|all customers|users always)/i,
      warning: "Overgeneralization - market segments vary significantly"
    },
    {
      pattern: /(just|simply|easy|quick)/i,
      warning: "Complexity minimization - implementation often more complex than expected"
    },
    {
      pattern: /(competitors won't|market can't|impossible for)/i,
      warning: "Competitive blind spot - underestimating market dynamics"
    }
  ];
  
  biasPatterns.forEach(({ pattern, warning }) => {
    if (pattern.test(message)) {
      warnings.push(warning);
    }
  });
  
  // Check conversation history for pattern drift
  if (conversationHistory.length > 3) {
    const recentMessages = conversationHistory.slice(-3);
    const hasEscalatingCommitment = checkEscalatingCommitment(recentMessages);
    if (hasEscalatingCommitment) {
      warnings.push("Escalating commitment detected - reassess core assumptions");
    }
  }
  
  // Financial assumption checks
  const financialAssumptions = checkFinancialAssumptions(message);
  warnings.push(...financialAssumptions);
  
  return warnings;
}

function checkEscalatingCommitment(messages) {
  // Look for increasing investment/commitment language
  const commitmentKeywords = ['invest', 'double down', 'all in', 'commit', 'spend more'];
  
  let commitmentScore = 0;
  messages.forEach(msg => {
    commitmentKeywords.forEach(keyword => {
      if (msg.toLowerCase().includes(keyword)) {
        commitmentScore++;
      }
    });
  });
  
  return commitmentScore >= 2;
}

function checkFinancialAssumptions(message) {
  const warnings = [];
  
  // Check for optimistic financial assumptions
  const optimisticPatterns = [
    {
      pattern: /(viral|exponential growth|hockey stick)/i,
      warning: "Viral growth assumption - 99% of products don't achieve viral adoption"
    },
    {
      pattern: /(just need 1%|tiny market share)/i,
      warning: "Market size fallacy - 1% of a large market is still extremely difficult"
    },
    {
      pattern: /(recurring revenue|passive income)/i,
      warning: "Revenue model assumption - recurring revenue requires ongoing value delivery"
    },
    {
      pattern: /(break even|profitable) (in|within) \d+ (month|week)/i,
      warning: "Timeline optimism - most businesses take 2-3x longer than expected to break even"
    }
  ];
  
  optimisticPatterns.forEach(({ pattern, warning }) => {
    if (pattern.test(message)) {
      warnings.push(warning);
    }
  });
  
  return warnings;
}

export function validateLogicConsistency(currentMode, vaultLogic, userMessage) {
  const conflicts = [];
  
  // Check for mode-vault conflicts
  if (currentMode === 'truth_general' && vaultLogic && vaultLogic.includes('aggressive')) {
    conflicts.push({
      type: 'MODE_VAULT_CONFLICT',
      description: 'Truth mode conflicts with aggressive vault strategies',
      resolution: 'Vault logic takes precedence for business decisions'
    });
  }
  
  // Check for internal logic conflicts in user message
  if (userMessage.includes('safe') && userMessage.includes('aggressive')) {
    conflicts.push({
      type: 'USER_LOGIC_CONFLICT',
      description: 'Conflicting risk preferences in same request',
      resolution: 'Clarification needed on risk tolerance'
    });
  }
  
  return conflicts;
}

export function trackAssumptionEvolution(conversationHistory) {
  // Track how assumptions change over conversation
  const assumptionChanges = [];
  
  if (conversationHistory.length < 2) return assumptionChanges;
  
  // Look for assumption reversals
  const recentMessages = conversationHistory.slice(-5);
  
  // Simple pattern: "I thought X, but now Y"
  recentMessages.forEach((message, index) => {
    if (message.includes('thought') && message.includes('but')) {
      assumptionChanges.push({
        type: 'ASSUMPTION_REVERSAL',
        message_index: index,
        confidence: 'MEDIUM'
      });
    }
  });
  
  return assumptionChanges;
}

export function generateAssumptionChallenges(message, mode) {
  const challenges = [];
  
  if (mode === 'business_validation') {
    // Business-specific assumption challenges
    if (message.includes('customers will')) {
      challenges.push("How do you know customers will behave this way? What evidence supports this?");
    }
    
    if (message.includes('market is')) {
      challenges.push("What market research validates this claim? How might the market change?");
    }
    
    if (message.includes('cost') || message.includes('price')) {
      challenges.push("What hidden costs aren't accounted for? How might costs escalate?");
    }
  } else {
    // Truth-general assumption challenges
    if (message.includes('always') || message.includes('never')) {
      challenges.push("Are there exceptions to this absolute statement?");
    }
    
    if (message.includes('because')) {
      challenges.push("What alternative explanations might exist for this causal relationship?");
    }
  }
  
  return challenges.slice(0, 2); // Return top 2 most relevant
}
