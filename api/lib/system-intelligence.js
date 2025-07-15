// SYSTEM INTELLIGENCE INTEGRATION - CONNECTS ALL MODULES
// This file restores the connection between vault data and cognitive modules
// ADD THIS FILE: api/lib/system-intelligence.js

import { requiresQuantitativeReasoning } from './quantitative-enforcer.js';
import { getVaultStatus, checkVaultTriggers, generateVaultContext } from './vault.js';
import { identifyExpertDomain } from './caring-family-core.js';

/**
 * MASTER INTEGRATION FUNCTION
 * Connects vault intelligence to cognitive processing
 * Preserves all existing functionality while adding intelligence
 */
export function integrateSystemIntelligence(message, vaultContent, vaultHealthy) {
  const integration = {
    vaultIntelligenceActive: false,
    expertDomain: 'general',
    quantitativeRequired: false,
    intelligenceContext: '',
    vaultStatus: 'inactive'
  };

  try {
    // 1. EXPERT DOMAIN RECOGNITION
    if (typeof identifyExpertDomain === 'function') {
      integration.expertDomain = identifyExpertDomain(message);
    }

    // 2. QUANTITATIVE ANALYSIS DETECTION  
    if (typeof requiresQuantitativeReasoning === 'function') {
      integration.quantitativeRequired = requiresQuantitativeReasoning(message);
    }

    // 3. VAULT INTELLIGENCE ACTIVATION
    if (vaultContent && vaultHealthy && typeof checkVaultTriggers === 'function') {
      const vaultTriggers = checkVaultTriggers(message);
      if (vaultTriggers.shouldActivate) {
        integration.vaultIntelligenceActive = true;
        integration.vaultStatus = 'operational';
        
        // Generate vault context for this specific request
        if (typeof generateVaultContext === 'function') {
          integration.intelligenceContext = generateVaultContext(message, integration.expertDomain);
        }
      }
    }

    // 4. FALLBACK PROTECTION
    if (!integration.vaultIntelligenceActive && vaultContent && vaultContent.length > 1000) {
      integration.vaultIntelligenceActive = true;
      integration.vaultStatus = 'fallback_active';
      integration.intelligenceContext = 'SITE MONKEYS PRICING: Boost ($697), Climb ($1,497), Lead ($2,997)';
    }

  } catch (error) {
    console.warn('System intelligence integration error:', error.message);
    // Graceful degradation - system still works without intelligence
  }

  return integration;
}

/**
 * PROMPT ENHANCEMENT FUNCTION
 * Adds intelligence context to AI prompts when appropriate
 */
export function enhancePromptWithIntelligence(basePrompt, intelligence, message) {
  let enhancedPrompt = basePrompt;

  try {
    // Add quantitative requirements if needed
    if (intelligence.quantitativeRequired && intelligence.vaultIntelligenceActive) {
      enhancedPrompt += `\n\n🎯 QUANTITATIVE ANALYSIS REQUIRED:
This request requires actual numerical calculations. Use Site Monkeys pricing data:
- Boost: $697/month
- Climb: $1,497/month  
- Lead: $2,997/month

Provide step-by-step calculations with real numbers, confidence levels, and assumptions.
Target margins: 85%+ for business survival.`;
    }

    // Add vault intelligence context if available
    if (intelligence.vaultIntelligenceActive && intelligence.intelligenceContext) {
      enhancedPrompt += `\n\nVAULT INTELLIGENCE CONTEXT:\n${intelligence.intelligenceContext}`;
    }

    // Add expert domain guidance
    if (intelligence.expertDomain !== 'general') {
      enhancedPrompt += `\n\nEXPERT DOMAIN: ${intelligence.expertDomain} - Think like a 20-year professional in this field.`;
    }

  } catch (error) {
    console.warn('Prompt enhancement error:', error.message);
    // Return base prompt if enhancement fails
  }

  return enhancedPrompt;
}

/**
 * RESPONSE VALIDATION FUNCTION
 * Validates responses meet intelligence requirements
 */
export function validateIntelligentResponse(response, intelligence, message) {
  const validation = {
    valid: true,
    issues: [],
    enhancements: []
  };

  try {
    // Check quantitative requirements
    if (intelligence.quantitativeRequired) {
      const hasNumbers = /\$[\d,]+|\d+%|\d+\s*(months?|years?)/.test(response);
      if (!hasNumbers) {
        validation.valid = false;
        validation.issues.push('Missing required numerical calculations');
      }
    }

    // Check vault intelligence application
    if (intelligence.vaultIntelligenceActive && intelligence.vaultStatus === 'operational') {
      const hasVaultData = /697|1497|2997|Boost|Climb|Lead/.test(response);
      if (!hasVaultData && intelligence.quantitativeRequired) {
        validation.issues.push('Vault pricing data not applied to calculations');
      }
    }

  } catch (error) {
    console.warn('Response validation error:', error.message);
  }

  return validation;
}

/**
 * SYSTEM STATUS REPORTING
 * Provides detailed status for debugging and monitoring
 */
export function getSystemIntelligenceStatus(intelligence) {
  return {
    vault_intelligence_active: intelligence.vaultIntelligenceActive,
    vault_status: intelligence.vaultStatus,
    expert_domain: intelligence.expertDomain,
    quantitative_analysis_applied: intelligence.quantitativeRequired && intelligence.vaultIntelligenceActive,
    intelligence_context_length: intelligence.intelligenceContext.length,
    system_health: intelligence.vaultIntelligenceActive ? 'operational' : 'degraded'
  };
}
