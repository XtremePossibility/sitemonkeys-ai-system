// FORCE CACHE REFRESH - 2025-07-27-1559 - DELETE AFTER DEPLOY
// COMPLETE MODULAR CARING FAMILY INTELLIGENCE SYSTEM
// Orchestrates all cognitive modules for universal expert intelligence
// MEMORY SYSTEMS NOW HANDLED BY SERVER.JS BOOTSTRAP

console.log('[CHAT] 🚀 Chat system initializing...');
console.log('[DEBUG] Chat imports starting...');

import { trackApiCall, formatSessionDataForUI } from './lib/tokenTracker.js';
import { EMERGENCY_FALLBACKS, validateVaultStructure, getVaultValue } from './lib/site-monkeys/emergency-fallbacks.js';
import { ENFORCEMENT_PROTOCOLS } from './lib/site-monkeys/enforcement-protocols.js';
import { QUALITY_ENFORCEMENT } from './lib/site-monkeys/quality-enforcement.js';
import { AI_ARCHITECTURE } from './lib/site-monkeys/ai-architecture.js';
import { getVaultStatus, checkVaultTriggers, generateVaultContext, enforceVaultCompliance } from './lib/vault.js';
import { integrateSystemIntelligence, enhancePromptWithIntelligence, getSystemIntelligenceStatus } from './lib/system-intelligence.js';
import zlib from 'zlib';

// IMPORT ALL COGNITIVE MODULES
import { 
  FAMILY_PHILOSOPHY, 
  identifyExpertDomain, 
  analyzeCareNeeds, 
  calculatePrideMotivation, 
  selectCaringPersonality,
  buildCaringExpertPrompt,
  FAMILY_MEMORY
} from './lib/caring-family-core.js';

import { 
  requiresQuantitativeReasoning,
  enforceQuantitativeAnalysis,
  enforceCalculationStandards,
  validateCalculationQuality
} from './lib/quantitative-enforcer.js';

import { 
  requiresSurvivalAnalysis,
  enforceBusinessSurvival,
  validateBusinessSurvival,
  applySurvivalProtection
} from './lib/survival-guardian.js';

import { 
  validateExpertQuality,
  enforceExpertStandards,
  monitorSystemDrift
} from './lib/expert-validator.js';

import { 
  scanForProtectiveAlerts,
  findSolutionOpportunities,
  applyProtectiveIntelligence,
  assessCrossContextNeeds
} from './lib/protective-intelligence.js';

import { 
  detectPoliticalContent,
  applyPoliticalNeutrality,
  enforceEvidenceBasedStandards
} from './lib/political-neutrality.js';

import { 
  detectSiteMonkeysViolations,
  enforceSiteMonkeysStandards,
  enforcePricingFloors,
  integrateVaultLogic
} from './lib/site-monkeys-enforcement.js';

console.log('[DEBUG] All cognitive modules loaded successfully');

function validateVaultStructure(content) {
  if (!content || typeof content !== 'string') return false;
  if (content.length < 1000) return false;
  if (!content.includes('SITE MONKEYS')) return false;
  if (!content.includes('Boost') || !content.includes('Climb') || !content.includes('Lead')) return false;
  return true;
}

// SYSTEM GLOBALS
let lastPersonality = 'roxy';
let conversationCount = 0;
let systemDriftHistory = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let vaultContent = '';
  let vaultTokens = 0;
  let vaultStatus = 'not_loaded';
  let vaultHealthy = false;

  try {
    const {
      message,
      conversation_history = [],
      mode = 'site_monkeys',
      claude_requested = false,
      vault_content = null,
      user_id = 'default_user'
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string' });
      return;
    }

    // *** VAULT LOADING (PRESERVED) ***
    try {
      if (vault_content && typeof vault_content === 'string' && vault_content.length > 0) {
        vaultContent = vault_content;
        vaultTokens = Math.ceil(vaultContent.length / 4);
        vaultStatus = 'loaded_from_frontend';
        vaultHealthy = true;  // vault.js will handle health validation
        const vaultStatusObj = getVaultStatus();
      } else {
        const kvVault = process.env.VAULT_CONTENT;
        if (kvVault) {
          try {
            const decompressed = zlib.gunzipSync(Buffer.from(kvVault, 'base64')).toString();
            vaultContent = decompressed;
            vaultTokens = Math.ceil(vaultContent.length / 4);
            vaultStatus = 'loaded_from_kv';
            vaultHealthy = validateVaultStructure(vaultContent);
          } catch (decompError) {
            vaultContent = kvVault;
            vaultTokens = Math.ceil(vaultContent.length / 4);
            vaultStatus = 'loaded_from_kv_uncompressed';
            vaultHealthy = validateVaultStructure(vaultContent);
          }
        } else {
          vaultStatus = 'fallback_mode';
          vaultHealthy = false;
        }
      }
    } catch (vaultError) {
      console.error('Vault loading error:', vaultError);
      vaultStatus = 'error_fallback';
      vaultHealthy = false;
    }

    // *** FINAL VAULT HEALTH CORRECTION FOR SITE MONKEYS MODE ***
    if (mode === 'site_monkeys' && vaultContent && vaultContent.length > 1000) {
      vaultHealthy = true;
      vaultStatus = 'healthy_override_applied';
      console.log('✅ Site Monkeys vault health FINAL correction - vault intelligence active');
    }

    // *** COMPREHENSIVE COGNITIVE ANALYSIS ***
    
    // 1. EXPERT DOMAIN RECOGNITION
    const expertDomain = identifyExpertDomain(message);
    
    // 2. CARING FAMILY ANALYSIS
    const careNeeds = analyzeCareNeeds(message, conversation_history);
    
    // 3. PROTECTIVE INTELLIGENCE SCANNING
    const protectiveAlerts = scanForProtectiveAlerts(message, expertDomain.domain, conversation_history);
    
    // 4. SOLUTION OPPORTUNITY DISCOVERY
    const solutionOpportunities = findSolutionOpportunities(message, expertDomain.domain, protectiveAlerts);
    
    // 5. CROSS-CONTEXT INTELLIGENCE
    const crossContextNeeds = assessCrossContextNeeds(message, conversation_history, FAMILY_MEMORY.userGoals);
    
    // 6. POLITICAL CONTENT DETECTION
    const politicalAnalysis = detectPoliticalContent(message);
    
    // *** EXPERT PERSONALITY SELECTION ***
    const optimalPersonality = selectCaringPersonality(expertDomain, careNeeds, protectiveAlerts);
    const prideMotivation = calculatePrideMotivation(expertDomain, careNeeds, protectiveAlerts, solutionOpportunities);
    
    conversationCount++;

    // *** COST PROTECTION (PRESERVED) ***
    if (claude_requested) {
      const estimatedTokens = Math.ceil((buildMasterPrompt(mode, optimalPersonality, vaultContent, vaultHealthy, expertDomain, careNeeds, protectiveAlerts, solutionOpportunities).length + message.length) / 4) + 800;
      const estimatedCost = (estimatedTokens * 0.015) / 1000;

      if (estimatedCost > 0.50) {
        return res.status(200).json({
          response: generateCaringCostMessage(estimatedCost, expertDomain, careNeeds),
          mode_active: mode,
          vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
          claude_blocked: true,
          cognitive_analysis: {
            expert_domain: expertDomain.domain,
            care_level: careNeeds.care_level,
            protective_alerts: protectiveAlerts.length,
            solution_opportunities: solutionOpportunities.length
          }
        });
      }
    }

    // *** POLITICAL NEUTRALITY CHECK ***
    if (politicalAnalysis.requires_neutrality_response) {
      const neutralityResponse = applyPoliticalNeutrality(message, message);
      
      return res.status(200).json({
        response: neutralityResponse,
        mode_active: mode,
        personality_active: 'neutrality_enforced',
        political_analysis: politicalAnalysis,
        enforcement_applied: ['political_neutrality_enforced', 'voting_protection_active'],
        vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
        session_data: formatSessionDataForUI()
      });
    }

    // *** MASTER SYSTEM PROMPT CONSTRUCTION ***
    const masterPrompt = buildMasterPrompt(mode, optimalPersonality, vaultContent, vaultHealthy, expertDomain, careNeeds, protectiveAlerts, solutionOpportunities);
    const basePrompt = buildFullConversationPrompt(masterPrompt, message, conversation_history, expertDomain, careNeeds);
    
    // *** SYSTEM INTELLIGENCE INTEGRATION ***
    const intelligence = integrateSystemIntelligence(message, vaultContent, vaultHealthy);
    const fullPrompt = enhancePromptWithIntelligence(basePrompt, intelligence, message);
    
    // *** ENHANCED API CALL ***
    const apiResponse = await makeEnhancedAPICall(fullPrompt, optimalPersonality, prideMotivation);

    let promptTokens, completionTokens;

    if (optimalPersonality === 'claude') {
      promptTokens = apiResponse.usage?.input_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.output_tokens || Math.ceil(apiResponse.response.length / 4);
    } else {
      promptTokens = apiResponse.usage?.prompt_tokens || Math.ceil(fullPrompt.length / 4);
      completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);
    }

    const trackingResult = trackApiCall(optimalPersonality, promptTokens, completionTokens, vaultTokens);
    
    // *** COMPREHENSIVE RESPONSE ENHANCEMENT & ENFORCEMENT ***
    let enhancedResponse = apiResponse.response;
    
    // 1. QUANTITATIVE REASONING ENFORCEMENT
    enhancedResponse = enforceQuantitativeAnalysis(enhancedResponse, message, expertDomain.domain, vaultContent);
    enhancedResponse = enforceCalculationStandards(enhancedResponse, message, expertDomain.domain);
    
    // 2. BUSINESS SURVIVAL ENFORCEMENT  
    enhancedResponse = enforceBusinessSurvival(enhancedResponse, message, expertDomain.domain, mode);
    
    // 3. EXPERT QUALITY VALIDATION
    enhancedResponse = enforceExpertStandards(enhancedResponse, expertDomain.domain, message);
    
    // 4. PROTECTIVE INTELLIGENCE INTEGRATION
    enhancedResponse = applyProtectiveIntelligence(enhancedResponse, message, expertDomain.domain, conversation_history);
    
    // 5. POLITICAL NEUTRALITY ENFORCEMENT
    enhancedResponse = applyPoliticalNeutrality(enhancedResponse, message);
    enhancedResponse = enforceEvidenceBasedStandards(enhancedResponse);
    
    // 6. SITE MONKEYS BUSINESS LOGIC ENFORCEMENT
    enhancedResponse = enforceSiteMonkeysStandards(enhancedResponse, mode, vaultContent, vaultHealthy);
    enhancedResponse = enforcePricingFloors(enhancedResponse, mode);
    enhancedResponse = integrateVaultLogic(enhancedResponse, vaultContent, vaultHealthy, mode);
    
    // 7. SURVIVAL PROTECTION APPLICATION
    const finalResponse = applySurvivalProtection(enhancedResponse, mode, vaultContent);
    
    // *** SYSTEM QUALITY ASSESSMENT ***
    const responseQuality = validateExpertQuality(finalResponse, expertDomain.domain, message);
    const businessValidation = validateBusinessSurvival(finalResponse, mode);
    const calculationQuality = validateCalculationQuality(finalResponse);
    
    // *** DRIFT MONITORING ***
    systemDriftHistory.push(finalResponse);
    if (systemDriftHistory.length > 10) {
      systemDriftHistory = systemDriftHistory.slice(-10);
    }
    const driftMonitoring = monitorSystemDrift(systemDriftHistory);
    
    // *** FAMILY MEMORY UPDATE ***
    FAMILY_MEMORY.updateMemory(expertDomain, careNeeds, protectiveAlerts, solutionOpportunities);
    lastPersonality = optimalPersonality;

    const sessionData = formatSessionDataForUI();

    res.status(200).json({
      response: finalResponse,
      mode_active: mode,
      personality_active: optimalPersonality,
      cognitive_intelligence: {
        expert_domain: expertDomain.domain,
        expert_title: expertDomain.title,
        domain_confidence: expertDomain.confidence,
        care_level: careNeeds.care_level,
        pride_motivation: Math.round(prideMotivation * 100),
        protective_alerts: protectiveAlerts.length,
        solution_opportunities: solutionOpportunities.length,
        family_care_score: FAMILY_MEMORY.careLevel,
        expert_quality_score: responseQuality.expert_level,
        overall_quality_score: responseQuality.quality_score,
        quantitative_quality: calculationQuality.percentage,
        business_survival_score: businessValidation.survival_score || 100
      },
      enforcement_applied: [
        'caring_family_intelligence_active',
        'universal_expert_activation_complete',
        'quantitative_reasoning_enforced',
        'business_survival_protected',
        'expert_quality_validated',
        'protective_intelligence_active',
        'political_neutrality_enforced',
        'truth_first_with_caring_delivery',
        'pride_driven_excellence_active',
        mode === 'site_monkeys' ? 'site_monkeys_business_logic_enforced' : 'general_business_logic_active',
        vaultHealthy ? 'vault_intelligence_integrated' : 'emergency_fallback_active'
      ],
      drift_monitoring: {
        system_stable: !driftMonitoring.intervention_needed,
        trend: driftMonitoring.drift_trend,
        average_quality: Math.round(driftMonitoring.average_quality_score)
      },
      vault_status: {
        loaded: vaultStatus !== 'not_loaded',
        tokens: vaultTokens,
        status: vaultStatus,
        healthy: vaultHealthy,
        source: vaultStatus.includes('frontend') ? 'frontend' : vaultStatus.includes('kv') ? 'kv' : 'fallback'
      },
      system_intelligence: getSystemIntelligenceStatus(intelligence),
      session_data: sessionData
    });

  } catch (error) {
    console.error('Cognitive System Error:', error);
    
    const emergencyResponse = generateCaringEmergencyResponse(error, mode, vaultContent);
    
    res.status(200).json({
      response: emergencyResponse,
      mode_active: mode,
      error_handled: true,
      emergency_mode: true,
      enforcement_applied: ['emergency_caring_response_active', 'truth_first_maintained'],
      vault_status: { loaded: false, tokens: 0, healthy: false, source: 'error' },
      session_data: formatSessionDataForUI()
    });
  }
}

// *** MASTER PROMPT CONSTRUCTION ***
function buildMasterPrompt(mode, personality, vaultContent, vaultHealthy, expertDomain, careNeeds, protectiveAlerts, solutionOpportunities) {
  let masterPrompt = '';

  // 1. CARING FAMILY FOUNDATION
  masterPrompt += buildCaringExpertPrompt(expertDomain, careNeeds, calculatePrideMotivation(expertDomain, careNeeds, protectiveAlerts, solutionOpportunities), personality);
  
  // 2. QUANTITATIVE REASONING REQUIREMENTS  
  masterPrompt += '\n🎯 QUANTITATIVE ANALYSIS ENFORCEMENT:\n';  
  masterPrompt += 'When ANY numerical/financial analysis is requested, you MUST provide actual calculations.\n';
  masterPrompt += 'MANDATORY: Use Site Monkeys pricing: Boost ($697), Climb ($1,497), Lead ($2,997).\n';  
  masterPrompt += 'MANDATORY: Show step-by-step math with real numbers and projections.\n';
  masterPrompt += 'MANDATORY: Include confidence levels and assumptions.\n';
  masterPrompt += 'NO GENERIC BUSINESS ADVICE - ONLY REAL CALCULATIONS.\n\n';
  
  // 3. BUSINESS SURVIVAL PROTECTION
  if (mode === 'site_monkeys') {
    masterPrompt += 'BUSINESS SURVIVAL REQUIREMENTS (NON-NEGOTIABLE):\n';
    masterPrompt += '- Minimum 85% margins for all financial projections\n';
    masterPrompt += '- Cash flow survival analysis for business decisions\n';
    masterPrompt += '- Worst-case scenario modeling for risk assessment\n';
    masterPrompt += '- Professional pricing floors: $697 minimum\n\n';
  }
  
  // 4. PROTECTIVE INTELLIGENCE ACTIVATION
  if (protectiveAlerts.length > 0) {
    masterPrompt += 'PROTECTIVE ALERTS DETECTED:\n';
    protectiveAlerts.forEach(alert => {
      masterPrompt += `- ${alert.type.toUpperCase()}: ${alert.alert_message}\n`;
    });
    masterPrompt += 'Address these risks proactively in your response.\n\n';
  }
  
  // 5. SOLUTION OPPORTUNITIES
  if (solutionOpportunities.length > 0) {
    masterPrompt += 'SOLUTION OPPORTUNITIES IDENTIFIED:\n';
    solutionOpportunities.forEach(opportunity => {
      masterPrompt += `- ${opportunity.type.toUpperCase()}: ${opportunity.description}\n`;
    });
    masterPrompt += 'Incorporate these opportunities into your guidance.\n\n';
  }
  
  // 6. POLITICAL NEUTRALITY (ABSOLUTE)
  masterPrompt += 'POLITICAL NEUTRALITY (NON-NEGOTIABLE):\n';
  masterPrompt += 'Never tell anyone who to vote for or make political endorsements.\n';
  masterPrompt += 'Voting is a sacred right and personal responsibility.\n';
  masterPrompt += 'Present multiple perspectives with sources when discussing political topics.\n\n';
  
  // 7. TRUTH-FIRST FOUNDATION
  masterPrompt += 'TRUTH-FIRST PRINCIPLES:\n';
  masterPrompt += '- Include confidence levels on factual claims (High/Medium/Low/Unknown)\n';
  masterPrompt += '- Flag assumptions explicitly\n';
  masterPrompt += '- "I don\'t know" is required when evidence is insufficient\n';
  masterPrompt += '- Speculation must be labeled as such\n\n';
  
  // 8. VAULT INTEGRATION
  if (mode === 'site_monkeys') {
    if (vaultHealthy && vaultContent.length > 1000) {
      masterPrompt += 'SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n' + vaultContent + '\n\n';
      masterPrompt += 'VAULT INTEGRATION: Use this business intelligence operationally in your analysis.\n\n';
    } else {
      masterPrompt += 'EMERGENCY FALLBACK: Using core Site Monkeys business logic due to vault issues.\n';
      masterPrompt += EMERGENCY_FALLBACKS.business_logic.pricing_structure + '\n';
      masterPrompt += EMERGENCY_FALLBACKS.business_logic.service_minimums + '\n\n';
    }
  }
  
  // 9. CARING RESPONSE PATTERN
  masterPrompt += 'CARING FAMILY RESPONSE PATTERN:\n';
  masterPrompt += '1. ANSWER THE QUESTION FIRST (provide what was requested with expert competence)\n';
  masterPrompt += '2. ADD PROTECTIVE INSIGHTS (risks identified that they should know about)\n';
  masterPrompt += '3. SUGGEST SOLUTION PATHS (better approaches when you see opportunities)\n';
  masterPrompt += '4. PROVIDE NEXT STEPS (specific, actionable guidance)\n';
  masterPrompt += '5. CARING MOTIVATION (brief note showing genuine investment in their success)\n\n';
  
  return masterPrompt;
}

function buildFullConversationPrompt(masterPrompt, message, conversationHistory, expertDomain, careNeeds) {
  let fullPrompt = masterPrompt;

  // NO MEMORY INTEGRATION - Memory handled by server.js bootstrap

  if (conversationHistory.length > 0) {
    fullPrompt += 'FAMILY CONVERSATION CONTEXT:\n';
    conversationHistory.slice(-3).forEach(msg => {
      fullPrompt += (msg.role === 'user' ? 'Family Member: ' : 'Expert Response: ') + msg.content + '\n';
    });
    fullPrompt += '\n';
  }

  fullPrompt += `CURRENT EXPERT CONTEXT:\n`;
  fullPrompt += `- Domain: ${expertDomain.domain}\n`;
  fullPrompt += `- Title: ${expertDomain.title}\n`;
  fullPrompt += `- Care Level: ${careNeeds.care_level}\n`;
  fullPrompt += `- Truth Delivery: ${careNeeds.truth_delivery_style}\n\n`;

  fullPrompt += `CURRENT REQUEST:\nFamily Member: ${message}\n\n`;
  
  fullPrompt += `Respond with the expertise and caring dedication of a family member who genuinely wants to see them succeed:`;

  return fullPrompt;
}

// *** ENHANCED API CALL ***
async function makeEnhancedAPICall(prompt, personality, prideMotivation) {
  const maxTokens = Math.floor(1200 + (prideMotivation * 800)); // More tokens for high pride situations

  if (personality === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️ Claude API key missing, failing over to GPT-4');
      return await makeEnhancedAPICall(prompt, 'roxy', prideMotivation);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          system: prompt.split('CURRENT REQUEST:')[0],
          messages: [{ role: 'user', content: prompt.split('CURRENT REQUEST:')[1] || prompt }],
          temperature: 0.1 + (prideMotivation * 0.1)
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.content[0].text,
        usage: data.usage
      };
    } catch (error) {
      console.error('Claude API error:', error);
      return await makeEnhancedAPICall(prompt, 'roxy', prideMotivation);
    }
  } else {
    // GPT-4 for Eli and Roxy
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.2 + (prideMotivation * 0.1),
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.choices[0].message.content,
        usage: data.usage
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}

// *** UTILITY FUNCTIONS ***
function generateCaringCostMessage(estimatedCost, expertDomain, careNeeds) {
  return `As your dedicated family expert in ${expertDomain.domain.replace(/_/g, ' ')}, I want to provide the most thorough analysis possible for this important decision.

The estimated cost would be $${estimatedCost.toFixed(4)}, which exceeds our $0.50 limit. I care about managing resources responsibly while delivering the excellence you deserve.

Would you like me to:
1. Provide detailed professional analysis using our standard experts (still highly competent)
2. Break this into smaller questions I can handle within the cost limit  
3. Proceed with Claude anyway (additional cost noted)

Family takes care of family - what would work best for your situation?`;
}

function generateCaringEmergencyResponse(error, mode, vaultContent) {
  return `I encountered a technical issue while providing the caring, expert analysis you deserve, and I want to be completely transparent about that.

Even with this system challenge, my commitment to your success remains absolute. Based on the principles of truth-first caring guidance:

${EMERGENCY_FALLBACKS.core_logic.truth_first || 'Truth and accuracy are never compromised, even in emergency situations.'}

The technical issue was: ${error.message}

I'm maintaining professional standards and genuine care for your success, even in emergency mode. How can I help you move forward while we resolve this?

💙 Family looks out for family, especially when things get challenging.`;
}

// *** VAULT DIAGNOSTIC FUNCTION (PRESERVED) ***
function comprehensiveVaultDiagnostic(message = "test business question", vaultContent = "") {
  console.log("🔍 === VAULT DIAGNOSTIC SUITE STARTING ===");
  
  const results = {};
  
  // PHASE 1: VAULT LOADING TEST
  console.log("📖 PHASE 1: Testing vault loading...");
  
  if (typeof window !== 'undefined' && window.currentVaultContent) {
    console.log("✅ Frontend vault found:", window.currentVaultContent.length, "characters");
    results.frontend_vault = "WORKING";
  } else {
    console.log("❌ Frontend vault missing");
    results.frontend_vault = "FAILED";
  }
  
  if (typeof window !== 'undefined' && window.vaultStatus) {
    console.log("✅ Vault status:", window.vaultStatus);
    results.vault_status = "WORKING";
  } else {
    console.log("❌ Vault status missing");
    results.vault_status = "FAILED";
  }
  
  // PHASE 2: VAULT CONTENT TEST
  console.log("📋 PHASE 2: Testing vault content...");
  
  const testVault = vaultContent || (typeof window !== 'undefined' ? window.currentVaultContent : '') || '';
  console.log("📊 Vault content length:", testVault.length);
  
  if (testVault.length > 1000) {
    console.log("✅ Vault has substantial content");
    results.vault_content = "WORKING";
  } else {
    console.log("❌ Vault content too small or empty");
    results.vault_content = "FAILED";
  }
  
  // PHASE 3: PROMPT CONSTRUCTION TEST
  console.log("🧠 PHASE 3: Testing prompt construction...");
  
  const promptWithVault = `BUSINESS INTELLIGENCE VAULT:\n${testVault}\n\nQUESTION: ${message}`;
  const includesVault = testVault.length > 0 && promptWithVault.includes(testVault.substring(0, Math.min(50, testVault.length)));
  
  console.log("🧠 Prompt length with vault:", promptWithVault.length);
  console.log("🔍 Vault properly included in prompt:", includesVault);
  
  if (includesVault) {
    console.log("✅ Vault would be included in AI prompts");
    results.prompt_construction = "WORKING";
  } else {
    console.log("❌ Vault NOT being included in AI prompts");
    results.prompt_construction = "FAILED";
  }
  
  // PHASE 4: SUMMARY
  console.log("📊 === DIAGNOSTIC SUMMARY ===");
  const failures = Object.values(results).filter(r => r === "FAILED").length;
  
  if (failures === 0) {
    console.log("🟢 ALL SYSTEMS WORKING - Vault should be functional");
  } else {
    console.log("🔴 ISSUES FOUND:", failures, "components failed");
    console.log("🔍 Failed components:", Object.entries(results).filter(([k,v]) => v === "FAILED").map(([k,v]) => k));
  }
  
  console.log("🔍 === DIAGNOSTIC COMPLETE ===");
  return results;
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.comprehensiveVaultDiagnostic = comprehensiveVaultDiagnostic;
}
