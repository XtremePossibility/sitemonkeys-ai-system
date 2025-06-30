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
    optimizations.efficiency_gains.push(...founderOps
