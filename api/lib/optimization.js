// OPTIMIZATION ENGINE - SITE MONKEYS AI
// Version: PROD-1.0

import { SITE_MONKEYS_VAULT } from './vault.js';
import { MODES, calculateConfidenceScore } from '../config/modes.js';

// MAIN OPTIMIZATION ENHANCER
export function runOptimizationEnhancer({
  mode,
  baseResponse,
  message,
  triggeredFrameworks = [],
  vaultLoaded = false
}) {
  
  const optimizations = {
    cost_reduction: [],
    efficiency_gains: [],
    risk_mitigations: [],
    quality_improvements: [],
    revenue_opportunities: []
  };
  
  // MODE-SPECIFIC OPTIMIZATION
  switch (mode) {
    case 'truth_general':
      return optimizeTruthMode(baseResponse, message, optimizations);
    case 'business_validation':
      return optimizeBusinessMode(baseResponse, message, optimizations);
    case 'site_monkeys':
      return optimizeSiteMonkeysMode(baseResponse, message, optimizations, triggeredFrameworks);
    default:
      return { enhancedResponse: baseResponse, optimization_tags: [] };
  }
}

// TRUTH MODE OPTIMIZATION
function optimizeTruthMode(response, message, optimizations) {
  let enhancedResponse = response;
  const tags = [];
  
  // CONFIDENCE SCORING ENHANCEMENT
  const confidenceAnalysis = analyzeResponseConfidence(response);
  if (confidenceAnalysis.score < 70) {
    enhancedResponse += `\n\n⚠️ **Confidence Level: ${confidenceAnalysis.score}%** - This response contains uncertainties. Key unknowns: ${confidenceAnalysis.unknowns.join(', ')}`;
    tags.push('low_confidence_flagged');
  }
  
  // ASSUMPTION DETECTION
  const assumptions = detectAssumptions(response);
  if (assumptions.length > 0) {
    enhancedResponse += `\n\n🔍 **Assumptions Made:** ${assumptions.join(', ')}`;
    tags.push('assumptions_surfaced');
  }
  
  // TRUTH VERIFICATION OPPORTUNITIES
  const verificationOps = identifyVerificationOpportunities(response, message);
  if (verificationOps.length > 0) {
    enhancedResponse += `\n\n📋 **To Verify:** ${verificationOps.join(', ')}`;
    optimizations.quality_improvements.push(...verificationOps);
    tags.push('verification_opportunities');
  }
  
  return {
    enhancedResponse,
    optimization_tags: tags,
    optimizations
  };
}

// BUSINESS VALIDATION MODE OPTIMIZATION  
function optimizeBusinessMode(response, message, optimizations) {
  let enhancedResponse = response;
  const tags = [];
  
  // FINANCIAL IMPACT ANALYSIS
  const financialOps = identifyFinancialOptimizations(response, message);
  if (financialOps.length > 0) {
    enhancedResponse += `\n\n💰 **Financial Optimizations:** ${financialOps.join(', ')}`;
    optimizations.cost_reduction.push(...financialOps);
    tags.push('financial_optimization');
  }
  
  // RISK MITIGATION OPPORTUNITIES
  const riskOps = identifyRiskMitigations(response, message);
  if (riskOps.length > 0) {
    enhancedResponse += `\n\n🛡️ **Risk Mitigations:** ${riskOps.join(', ')}`;
    optimizations.risk_mitigations.push(...riskOps);
    tags.push('risk_mitigation');
  }
  
  // CASH FLOW OPTIMIZATION
  const cashFlowOps = identifyCashFlowOptimizations(response, message);
  if (cashFlowOps.length > 0) {
    enhancedResponse += `\n\n📈 **Cash Flow Opportunities:** ${cashFlowOps.join(', ')}`;
    optimizations.efficiency_gains.push(...cashFlowOps);
    tags.push('cash_flow_optimization');
  }
  
  // MARKET REALITY CHECK
  const marketOps = identifyMarketOptimizations(response, message);
  if (marketOps.length > 0) {
    enhancedResponse += `\n\n🎯 **Market Opportunities:** ${marketOps.join(', ')}`;
    optimizations.revenue_opportunities.push(...marketOps);
    tags.push('market_optimization');
  }
  
  return {
    enhancedResponse,
    optimization_tags: tags,
    optimizations
  };
}

// SITE MONKEYS MODE OPTIMIZATION
function optimizeSiteMonkeysMode(response, message, optimizations, triggeredFrameworks) {
  let enhancedResponse = response;
  const tags = [];
  
  // VAULT COMPLIANCE CHECK
  const complianceIssues = checkVaultCompliance(response, triggeredFrameworks);
  if (complianceIssues.length > 0) {
    enhancedResponse += `\n\n⚠️ **Vault Compliance Issues:** ${complianceIssues.join(', ')}`;
    tags.push('vault_compliance_issues');
  }
  
  // MARGIN OPTIMIZATION
  const marginOps = identifyMarginOptimizations(response, message);
  if (marginOps.length > 0) {
    enhancedResponse += `\n\n🎯 **Margin Optimizations:** ${marginOps.join(', ')}`;
    optimizations.revenue_opportunities.push(...marginOps);
    tags.push('margin_optimization');
  }
  
  // FOUNDER PROTECTION OPPORTUNITIES  
  const founderOps = identifyFounderProtectionOps(response, message);
  if (founderOps.length > 0) {
    enhancedResponse += `\n\n🛡️ **Founder Protection:** ${founderOps.join(', ')}`;
    optimizations.efficiency_gains.push(...founderOps);
    tags.push('founder_protection');
  }
  
  // OPERATIONAL EFFICIENCY
  const operationalOps = identifyOperationalOptimizations(response, message);
  if (operationalOps.length > 0) {
    enhancedResponse += `\n\n⚡ **Operational Efficiency:** ${operationalOps.join(', ')}`;
    optimizations.efficiency_gains.push(...operationalOps);
    tags.push('operational_efficiency');
  }
  
  // BRAND POSITIONING ALIGNMENT
  const brandingOps = identifyBrandingOptimizations(response, message);
  if (brandingOps.length > 0) {
    enhancedResponse += `\n\n🏆 **Brand Positioning:** ${brandingOps.join(', ')}`;
    optimizations.quality_improvements.push(...brandingOps);
    tags.push('brand_optimization');
  }
  
  return {
    enhancedResponse,
    optimization_tags: tags,
    optimizations
  };
}

// ANALYSIS HELPER FUNCTIONS

function analyzeResponseConfidence(response) {
  const uncertaintyIndicators = ['unknown', 'uncertain', 'unclear', 'might', 'could', 'may', 'possibly'];
  const certaintyIndicators = ['definitely', 'certainly', 'confirmed', 'verified', 'proven'];
  const assumptionIndicators = ['assume', 'likely', 'probably', 'typically', 'generally'];
  
  const uncertaintyCount = uncertaintyIndicators.filter(word => 
    response.toLowerCase().includes(word)
  ).length;
  
  const certaintyCount = certaintyIndicators.filter(word =>
    response.toLowerCase().includes(word)
  ).length;
  
  const assumptionCount = assumptionIndicators.filter(word =>
    response.toLowerCase().includes(word)
  ).length;
  
  // Calculate confidence score
  let confidence = 75; // Base confidence
  confidence -= (uncertaintyCount * 10);
  confidence += (certaintyCount * 5);
  confidence -= (assumptionCount * 8);
  
  confidence = Math.max(0, Math.min(100, confidence));
  
  return {
    score: confidence,
    unknowns: uncertaintyIndicators.filter(word => response.toLowerCase().includes(word)),
    assumptions: assumptionIndicators.filter(word => response.toLowerCase().includes(word))
  };
}

function detectAssumptions(response) {
  const assumptionPatterns = [
    /assum\w+/gi,
    /likely/gi,
    /probably/gi,
    /typically/gi,
    /generally/gi,
    /usually/gi,
    /tend to/gi,
    /expect\w*/gi
  ];
  
  const assumptions = [];
  assumptionPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) {
      assumptions.push(...matches.map(match => match.toLowerCase()));
    }
  });
  
  return [...new Set(assumptions)]; // Remove duplicates
}

function identifyVerificationOpportunities(response, message) {
  const opportunities = [];
  
  // Look for claims that could be verified
  if (response.includes('studies show') || response.includes('research indicates')) {
    opportunities.push('Source verification for research claims');
  }
  
  if (response.match(/\d+%/) && !response.includes('estimate')) {
    opportunities.push('Verify percentage statistics with original sources');
  }
  
  if (response.includes('industry standard') || response.includes('best practice')) {
    opportunities.push('Validate industry standards with current data');
  }
  
  const datePattern = /\d{4}/g;
  const dates = response.match(datePattern);
  if (dates && dates.some(date => parseInt(date) < 2022)) {
    opportunities.push('Update data sources - some information may be outdated');
  }
  
  return opportunities;
}

function identifyFinancialOptimizations(response, message) {
  const optimizations = [];
  
  // Cost reduction opportunities
  if (response.includes('cost') || response.includes('expense')) {
    optimizations.push('Explore cost reduction alternatives');
  }
  
  // Revenue enhancement
  if (response.includes('revenue') || response.includes('income')) {
    optimizations.push('Identify revenue diversification opportunities');
  }
  
  // Cash flow optimization
  if (response.includes('payment') || response.includes('billing')) {
    optimizations.push('Consider payment terms optimization');
  }
  
  // ROI improvement
  if (response.includes('investment') || response.includes('spending')) {
    optimizations.push('Calculate and optimize ROI timeline');
  }
  
  return optimizations;
}

function identifyRiskMitigations(response, message) {
  const mitigations = [];
  
  // Financial risk mitigations
  if (response.includes('risk') && response.includes('financial')) {
    mitigations.push('Develop financial contingency plans');
  }
  
  // Market risk mitigations  
  if (response.includes('market') && response.includes('uncertainty')) {
    mitigations.push('Create market scenario planning');
  }
  
  // Operational risk mitigations
  if (response.includes('operational') || response.includes('process')) {
    mitigations.push('Implement operational redundancy');
  }
  
  // Competitive risk mitigations
  if (response.includes('competitor') || response.includes('competition')) {
    mitigations.push('Develop competitive differentiation strategy');
  }
  
  return mitigations;
}

function identifyCashFlowOptimizations(response, message) {
  const optimizations = [];
  
  if (response.includes('cash flow') || response.includes('runway')) {
    optimizations.push('Optimize payment collection timing');
    optimizations.push('Negotiate extended payment terms with suppliers');
  }
  
  if (response.includes('subscription') || response.includes('recurring')) {
    optimizations.push('Increase recurring revenue percentage');
  }
  
  if (response.includes('seasonal') || response.includes('cyclical')) {
    optimizations.push('Develop counter-seasonal revenue streams');
  }
  
  return optimizations;
}

function identifyMarketOptimizations(response, message) {
  const optimizations = [];
  
  if (response.includes('market size') || response.includes('addressable market')) {
    optimizations.push('Segment market for targeted approach');
  }
  
  if (response.includes('customer acquisition') || response.includes('CAC')) {
    optimizations.push('Optimize customer acquisition channels');
  }
  
  if (response.includes('retention') || response.includes('churn')) {
    optimizations.push('Implement retention improvement strategies');
  }
  
  if (response.includes('pricing') || response.includes('price')) {
    optimizations.push('Test value-based pricing strategies');
  }
  
  return optimizations;
}

function checkVaultCompliance(response, triggeredFrameworks) {
  const issues = [];
  
  triggeredFrameworks.forEach(tf => {
    switch (tf.name) {
      case 'pricing_strategy':
        if (response.includes('discount') || response.includes('lower price')) {
          issues.push('Pricing strategy may undermine premium positioning');
        }
        break;
        
      case 'resource_allocation':
        if (response.includes('hire') && !response.includes('ROI')) {
          issues.push('Resource allocation missing ROI analysis');
        }
        break;
        
      case 'feature_prioritization':
        if (response.includes('feature') && !response.includes('revenue')) {
          issues.push('Feature discussion missing revenue impact analysis');
        }
        break;
    }
  });
  
  return issues;
}

function identifyMarginOptimizations(response, message) {
  const optimizations = [];
  
  if (response.includes('margin') || response.includes('profit')) {
    optimizations.push('Target 87% margin through value optimization');
  }
  
  if (response.includes('cost') && response.includes('reduction')) {
    optimizations.push('Maintain quality while reducing delivery costs');
  }
  
  if (response.includes('pricing') && response.includes('strategy')) {
    optimizations.push('Justify premium pricing with enhanced value delivery');
  }
  
  return optimizations;
}

function identifyFounderProtectionOps(response, message) {
  const opportunities = [];
  
  if (response.includes('decision') && response.includes('complex')) {
    opportunities.push('Simplify decision framework to reduce cognitive load');
  }
  
  if (response.includes('time') && response.includes('consuming')) {
    opportunities.push('Automate routine decisions');
  }
  
  if (response.includes('stress') || response.includes('overwhelm')) {
    opportunities.push('Implement decision delegation protocols');
  }
  
  if (response.includes('multiple') && response.includes('option')) {
    opportunities.push('Reduce options to prevent decision paralysis');
  }
  
  return opportunities;
}

function identifyOperationalOptimizations(response, message) {
  const optimizations = [];
  
  if (response.includes('process') || response.includes('workflow')) {
    optimizations.push('Streamline processes for zero-failure delivery');
  }
  
  if (response.includes('quality') && response.includes('control')) {
    optimizations.push('Implement automated quality assurance');
  }
  
  if (response.includes('efficiency') || response.includes('speed')) {
    optimizations.push('Optimize operational efficiency without quality compromise');
  }
  
  return optimizations;
}

function identifyBrandingOptimizations(response, message) {
  const optimizations = [];
  
  if (response.includes('positioning') || response.includes('brand')) {
    optimizations.push('Reinforce "Overlooked to Overbooked" messaging');
  }
  
  if (response.includes('premium') || response.includes('quality')) {
    optimizations.push('Emphasize premium positioning in all communications');
  }
  
  if (response.includes('competition') || response.includes('differentiation')) {
    optimizations.push('Highlight unique zero-failure delivery advantage');
  }
  
  return optimizations;
}

// COST OPTIMIZATION ANALYZER
export function analyzeCostOptimization(decision, mode, vaultLoaded) {
  const analysis = {
    current_approach: decision,
    cost_score: 5, // 1-10 scale
    optimization_opportunities: [],
    alternative_approaches: []
  };
  
  // Mode-specific cost analysis
  if (mode === 'site_monkeys' && vaultLoaded) {
    // Apply Site Monkeys specific cost optimization
    const marginImpact = calculateMarginImpact(decision);
    analysis.cost_score = marginImpact.score;
    analysis.optimization_opportunities = marginImpact.opportunities;
  }
  
  return analysis;
}

function calculateMarginImpact(decision) {
  // Simplified margin impact calculation
  let score = 7; // Default score
  const opportunities = [];
  
  if (decision.includes('discount') || decision.includes('lower price')) {
    score -= 3;
    opportunities.push('Avoid pricing reductions - focus on value enhancement');
  }
  
  if (decision.includes('premium') || decision.includes('value')) {
    score += 2;
    opportunities.push('Leverage premium positioning for margin expansion');
  }
  
  return { score, opportunities };
}
