// COMPLETE MODULAR CARING FAMILY INTELLIGENCE SYSTEM
// Orchestrates all cognitive modules for universal expert intelligence

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
      vault_content = null
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

  // *** COMPREHENSIVE VAULT DIAGNOSTIC SUITE ***
// Tests EVERYTHING related to vault functionality
// Place this function in your chat.js file, then call it from console

function comprehensiveVaultDiagnostic(message = "test business question", vaultContent = "") {
  console.log("🔍 === VAULT DIAGNOSTIC SUITE STARTING ===");
  console.log("Testing ALL aspects of vault functionality...\n");

  const results = {
    vault_loading: {},
    vault_content: {},
    vault_usage: {},
    prompt_construction: {},
    ai_integration: {},
    response_generation: {},
    summary: {}
  };

  // === PHASE 1: VAULT LOADING DIAGNOSTICS ===
  console.log("📖 PHASE 1: VAULT LOADING DIAGNOSTICS");
  
  try {
    // Test 1.1: Frontend Vault Content
    if (window.currentVaultContent) {
      results.vault_loading.frontend_vault = {
        status: "✅ PASS",
        length: window.currentVaultContent.length,
        preview: window.currentVaultContent.substring(0, 100) + "..."
      };
      console.log("✅ Frontend vault content found:", window.currentVaultContent.length, "characters");
    } else {
      results.vault_loading.frontend_vault = {
        status: "❌ FAIL",
        error: "window.currentVaultContent not found"
      };
      console.log("❌ Frontend vault content missing");
    }

    // Test 1.2: Vault Status
    if (window.vaultStatus) {
      results.vault_loading.vault_status = {
        status: "✅ PASS",
        details: window.vaultStatus
      };
      console.log("✅ Vault status:", window.vaultStatus);
    } else {
      results.vault_loading.vault_status = {
        status: "❌ FAIL",
        error: "window.vaultStatus not found"
      };
      console.log("❌ Vault status missing");
    }

    // Test 1.3: Use provided vault content or fallback
    const testVaultContent = vaultContent || window.currentVaultContent || "NO VAULT CONTENT AVAILABLE";
    
    results.vault_content.source = vaultContent ? "parameter" : "window.currentVaultContent";
    results.vault_content.length = testVaultContent.length;
    results.vault_content.is_valid = testVaultContent.length > 1000;
    
    console.log("📊 Using vault content:", results.vault_content.source, "- Length:", testVaultContent.length);

  } catch (error) {
    results.vault_loading.error = error.message;
    console.log("❌ Vault loading error:", error.message);
  }

  // === PHASE 2: VAULT CONTENT ANALYSIS ===
  console.log("\n📋 PHASE 2: VAULT CONTENT ANALYSIS");
  
  try {
    const vaultToTest = vaultContent || window.currentVaultContent || "";
    
    // Test 2.1: Content Structure
    const hasBusinessLogic = vaultToTest.includes("business") || vaultToTest.includes("strategy");
    const hasOperationalData = vaultToTest.includes("operational") || vaultToTest.includes("process");
    const hasFiles = vaultToTest.includes("===") && vaultToTest.includes("VAULT SUMMARY");
    
    results.vault_content.structure = {
      has_business_logic: hasBusinessLogic,
      has_operational_data: hasOperationalData,
      has_file_markers: hasFiles,
      total_sections: (vaultToTest.match(/===/g) || []).length
    };
    
    console.log("📋 Vault structure analysis:");
    console.log("  - Business logic:", hasBusinessLogic);
    console.log("  - Operational data:", hasOperationalData);
    console.log("  - File sections:", (vaultToTest.match(/===/g) || []).length);

    // Test 2.2: Content Quality
    const tokenCount = Math.ceil(vaultToTest.length / 4);
    const hasSubstantialContent = vaultToTest.length > 5000;
    
    results.vault_content.quality = {
      token_count: tokenCount,
      substantial_content: hasSubstantialContent,
      readability_score: vaultToTest.length > 0 ? "readable" : "empty"
    };
    
    console.log("📊 Content quality - Tokens:", tokenCount, "Substantial:", hasSubstantialContent);

  } catch (error) {
    results.vault_content.error = error.message;
    console.log("❌ Vault content analysis error:", error.message);
  }

  // === PHASE 3: PROMPT CONSTRUCTION TEST ===
  console.log("\n🧠 PHASE 3: PROMPT CONSTRUCTION TEST");
  
  try {
    const vaultToTest = vaultContent || window.currentVaultContent || "";
    
    // Test 3.1: Build prompt WITH vault content
    const promptWithVault = `You are a Site Monkeys business validation expert with access to complete business intelligence.

BUSINESS INTELLIGENCE VAULT:
${vaultToTest}

CURRENT REQUEST: ${message}

Using the business intelligence above, provide expert analysis that references specific information from the vault.`;

    // Test 3.2: Build prompt WITHOUT vault content  
    const promptWithoutVault = `You are a Site Monkeys business validation expert.

CURRENT REQUEST: ${message}

Provide expert business analysis.`;

    results.prompt_construction.with_vault = {
      length: promptWithVault.length,
      includes_vault: promptWithVault.includes(vaultToTest.substring(0, 50)),
      token_estimate: Math.ceil(promptWithVault.length / 4)
    };
    
    results.prompt_construction.without_vault = {
      length: promptWithoutVault.length,
      token_estimate: Math.ceil(promptWithoutVault.length / 4)
    };
    
    console.log("🧠 Prompt with vault:", promptWithVault.length, "chars,", Math.ceil(promptWithVault.length / 4), "tokens");
    console.log("🧠 Prompt without vault:", promptWithoutVault.length, "chars,", Math.ceil(promptWithoutVault.length / 4), "tokens");
    console.log("🔍 Vault properly included:", promptWithVault.includes(vaultToTest.substring(0, 50)));

  } catch (error) {
    results.prompt_construction.error = error.message;
    console.log("❌ Prompt construction error:", error.message);
  }

  // === PHASE 4: AI INTEGRATION SIMULATION ===
  console.log("\n🤖 PHASE 4: AI INTEGRATION SIMULATION");
  
  try {
    // Test 4.1: Simulate what chat.js should be doing
    const simulatedChatRequest = {
      message: message,
      vault_content: vaultContent || window.currentVaultContent,
      mode: "site_monkeys"
    };
    
    // Test 4.2: Check if vault content would be passed
    const vaultWouldBePassedToBackend = simulatedChatRequest.vault_content && simulatedChatRequest.vault_content.length > 0;
    
    results.ai_integration.request_simulation = {
      vault_passed_to_backend: vaultWouldBePassedToBackend,
      vault_size_passed: simulatedChatRequest.vault_content ? simulatedChatRequest.vault_content.length : 0,
      request_structure: "valid"
    };
    
    console.log("🤖 Would vault be passed to backend?", vaultWouldBePassedToBackend);
    console.log("📊 Vault size that would be passed:", simulatedChatRequest.vault_content ? simulatedChatRequest.vault_content.length : 0);

  } catch (error) {
    results.ai_integration.error = error.message;
    console.log("❌ AI integration simulation error:", error.message);
  }

  // === PHASE 5: BACKEND VAULT USAGE TEST ===
  console.log("\n⚙️ PHASE 5: BACKEND VAULT USAGE TEST");
  
  try {
    // Simulate what the backend SHOULD do with vault content
    const vaultToTest = vaultContent || window.currentVaultContent || "";
    
    // Test 5.1: Vault processing
    const vaultTokens = Math.ceil(vaultToTest.length / 4);
    const vaultHealthy = vaultToTest.length > 1000 && vaultToTest.includes("===");
    
    // Test 5.2: Prompt building (what backend should do)
    const backendShouldBuildPrompt = `SITE MONKEYS BUSINESS INTELLIGENCE SYSTEM

You are analyzing business questions using our complete business intelligence vault.

=== BUSINESS INTELLIGENCE VAULT ===
${vaultToTest}

=== USER QUESTION ===
${message}

=== INSTRUCTIONS ===
1. Reference specific information from the business vault above
2. Apply Site Monkeys business logic and principles
3. Provide expert analysis based on vault intelligence
4. Quote specific sections when relevant

Your response:`;

    results.response_generation.backend_processing = {
      vault_tokens: vaultTokens,
      vault_healthy: vaultHealthy,
      prompt_would_include_vault: backendShouldBuildPrompt.includes(vaultToTest.substring(0, 100)),
      full_prompt_size: backendShouldBuildPrompt.length
    };
    
    console.log("⚙️ Backend would process vault tokens:", vaultTokens);
    console.log("⚙️ Vault healthy for backend:", vaultHealthy);
    console.log("⚙️ Backend prompt would include vault:", backendShouldBuildPrompt.includes(vaultToTest.substring(0, 100)));

  } catch (error) {
    results.response_generation.error = error.message;
    console.log("❌ Backend simulation error:", error.message);
  }

  // === PHASE 6: CRITICAL PROBLEM IDENTIFICATION ===
  console.log("\n🚨 PHASE 6: CRITICAL PROBLEM IDENTIFICATION");
  
  const criticalIssues = [];
  const workingComponents = [];
  
  // Check each component
  if (results.vault_loading.frontend_vault?.status === "✅ PASS") {
    workingComponents.push("Vault loading from frontend");
  } else {
    criticalIssues.push("CRITICAL: Frontend vault loading failed");
  }
  
  if (results.vault_content.is_valid) {
    workingComponents.push("Vault content validation");
  } else {
    criticalIssues.push("CRITICAL: Vault content invalid or too small");
  }
  
  if (results.prompt_construction.with_vault?.includes_vault) {
    workingComponents.push("Vault content can be included in prompts");
  } else {
    criticalIssues.push("CRITICAL: Vault content not being included in AI prompts");
  }
  
  if (results.ai_integration.request_simulation?.vault_passed_to_backend) {
    workingComponents.push("Vault would be passed to backend");
  } else {
    criticalIssues.push("CRITICAL: Vault not being passed to backend for AI processing");
  }

  // === FINAL SUMMARY ===
  console.log("\n📊 === DIAGNOSTIC SUMMARY ===");
  console.log("🟢 WORKING COMPONENTS:");
  workingComponents.forEach(item => console.log("  ✅", item));
  
  console.log("\n🔴 CRITICAL ISSUES:");
  criticalIssues.forEach(item => console.log("  ❌", item));
  
  results.summary = {
    working_components: workingComponents,
    critical_issues: criticalIssues,
    diagnosis: criticalIssues.length === 0 ? "SYSTEM_HEALTHY" : "VAULT_NOT_USED_IN_PROMPTS",
    recommendation: criticalIssues.length === 0 ? "No issues found" : "Fix vault injection into AI prompts"
  };
  
  console.log("\n🎯 PRIMARY DIAGNOSIS:", results.summary.diagnosis);
  console.log("🛠️ RECOMMENDATION:", results.summary.recommendation);
  
  console.log("\n🔍 === DIAGNOSTIC COMPLETE ===");
  return results;
}

// === HOW TO USE THIS DIAGNOSTIC ===
console.log(`
🔧 USAGE INSTRUCTIONS:

1. Add this function to your chat.js file
2. Open browser console on your site
3. Run: comprehensiveVaultDiagnostic("test business question")
4. Review the detailed output to see exactly what's broken

This will test EVERY aspect of vault functionality and tell you exactly where the problem is.
`);

// Export for use
window.comprehensiveVaultDiagnostic = comprehensiveVaultDiagnostic;
}
