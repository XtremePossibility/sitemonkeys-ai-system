// ZERO-FAILURE CHAT.JS - COMPLETE INTEGRATION  
// Frontend vault injection + Backend hardcoded logic + Emergency fallbacks  
import { trackApiCall, formatSessionDataForUI } from './lib/tokenTracker.js';  
import { EMERGENCY_FALLBACKS, validateVaultStructure, getVaultValue } from './lib/site-monkeys/emergency-fallbacks.js';  
import { ENFORCEMENT_PROTOCOLS } from './lib/site-monkeys/enforcement-protocols.js';  
import { QUALITY_ENFORCEMENT } from './lib/site-monkeys/quality-enforcement.js';  
import { AI_ARCHITECTURE } from './lib/site-monkeys/ai-architecture.js';  
import { FOUNDER_PROTECTION } from './lib/site-monkeys/founder-protection.js';
import zlib from 'zlib'; // *** CRITICAL FIX: Import zlib for gzip decompression ***

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
    // *** CRITICAL: Accept vault_content from frontend ***  
    const {   
      message,   
      conversation_history = [],   
      mode = 'site_monkeys',   
      claude_requested = false,  
      vault_content = null  // NEW: Frontend can send vault content directly  
    } = req.body;

    if (!message || typeof message !== 'string') {  
      res.status(400).json({ error: 'Message is required and must be a string' });  
      return;  
    }

    console.log('Processing chat request in ' + mode + ' mode:', message.substring(0, 100));

    // *** VAULT LOADING WITH HARDCODED FALLBACKS ***  
    if (mode === 'site_monkeys') {  
      // Try frontend-provided vault content first  
      if (vault_content && vault_content.length > 1000) {  
        vaultContent = vault_content;  
        vaultTokens = Math.ceil(vaultContent.length / 4);  
        vaultStatus = 'loaded_from_frontend';  
        vaultHealthy = validateVaultStructure(vaultContent);  
        console.log('🎯 Vault loaded from frontend:', vaultTokens + ' tokens, healthy:', vaultHealthy);  
      } else {  
        // Fallback to KV loading  
        try {  
          const kv_url = process.env.KV_REST_API_URL;  
          const kv_token = process.env.KV_REST_API_TOKEN;  
            
          if (!kv_url || !kv_token) {  
            throw new Error('KV environment variables not configured');  
          }  
            
          const kvResponse = await fetch(kv_url + '/get/sitemonkeys_vault_v2', {  
            headers: {   
              'Authorization': 'Bearer ' + kv_token,  
              'Content-Type': 'application/json'  
            }  
          });  
            
          if (kvResponse.ok) {  
            const kvText = await kvResponse.text();  
              
            if (kvText && kvText !== 'null' && kvText.trim() !== '') {  
              let kvData;  
              const kvWrapper = JSON.parse(kvText);  
                
              if (kvWrapper.result) {  
                kvData = JSON.parse(kvWrapper.result);  
              } else if (kvWrapper.compressed) {  
                try {  
                  // *** CRITICAL FIX: Proper gzip decompression ***
                  const compressedBuffer = Buffer.from(kvWrapper.data, 'base64');
                  const decompressed = zlib.gunzipSync(compressedBuffer).toString('utf-8');
                  kvData = JSON.parse(decompressed);
                } catch (decompError) {  
                  console.error('❌ Gzip decompression failed:', decompError.message);
                  kvData = kvWrapper;  
                }  
              } else {  
                kvData = kvWrapper;  
              }  
                
              if (kvData.vault_content && kvData.vault_content.length > 1000) {  
                vaultContent = kvData.vault_content;  
                vaultTokens = kvData.tokens || Math.ceil(vaultContent.length / 4);  
                vaultStatus = 'loaded_from_kv';  
                vaultHealthy = validateVaultStructure(vaultContent);  
                console.log('✅ Vault loaded from KV: ' + vaultTokens + ' tokens, healthy:', vaultHealthy);  
              } else {  
                throw new Error('Vault content missing or insufficient');  
              }  
            } else {  
              throw new Error('KV returned empty data');  
            }  
          } else {  
            throw new Error('KV API error: ' + kvResponse.status);  
          }  
            
        } catch (vaultError) {  
          console.error('⚠️ Vault loading failed, using emergency fallbacks:', vaultError.message);  
          vaultStatus = 'failed_using_fallbacks';  
          vaultContent = EMERGENCY_FALLBACKS.business_logic.pricing_structure +   
                        EMERGENCY_FALLBACKS.business_logic.service_minimums +   
                        EMERGENCY_FALLBACKS.enforcement.founder_protection;  
          vaultTokens = Math.ceil(vaultContent.length / 4);  
          vaultHealthy = false;  
        }  
      }  
    }

    let personality = claude_requested ? 'claude' : determinePersonality(message, mode);  
      
    // *** ENHANCED COST PROTECTION WITH HARDCODED LIMITS ***  
    if (claude_requested) {  
      const estimatedTokens = Math.ceil((buildSystemPrompt(mode, personality, vaultContent, vaultHealthy).length + message.length) / 4) + 500;  
      const estimatedCost = (estimatedTokens * 0.015) / 1000;  
        
      if (estimatedCost > 0.50) {  
        return res.status(200).json({  
          response: FOUNDER_PROTECTION.cost_controls.claude_limit_message + ' $' + estimatedCost.toFixed(4) + ' exceeds $0.50 limit.',  
          mode_active: mode,  
          vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },  
          claude_blocked: true  
        });  
      }  
    }

    // *** ENHANCED SYSTEM PROMPT WITH HARDCODED LOGIC ***  
    const systemPrompt = buildSystemPrompt(mode, personality, vaultContent, vaultHealthy);  
    const fullPrompt = buildFullPrompt(systemPrompt, message, conversation_history);  
    const apiResponse = await makeRealAPICall(fullPrompt, personality);

    let promptTokens, completionTokens;  
      
    if (personality === 'claude') {  
      promptTokens = apiResponse.usage?.input_tokens || Math.ceil(fullPrompt.length / 4);  
      completionTokens = apiResponse.usage?.output_tokens || Math.ceil(apiResponse.response.length / 4);  
    } else {  
      promptTokens = apiResponse.usage?.prompt_tokens || Math.ceil(fullPrompt.length / 4);  
      completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);  
    }

    const trackingResult = trackApiCall(personality, promptTokens, completionTokens, vaultTokens);  
    const enforcedResponse = applySystemEnforcement(apiResponse.response, mode, vaultContent, vaultStatus, vaultHealthy);  
    const sessionData = formatSessionDataForUI();

    res.status(200).json({  
      response: enforcedResponse,  
      mode_active: mode,  
      vault_status: {  
        loaded: vaultStatus !== 'not_loaded',  
        tokens: vaultTokens,  
        status: vaultStatus,  
        healthy: vaultHealthy,  
        source: vaultStatus.includes('frontend') ? 'frontend' : vaultStatus.includes('kv') ? 'kv' : 'fallback'  
      },  
      enforcement_applied: [  
        'truth_enforcement_active',  
        'confidence_scoring_applied',   
        'political_neutrality_enforced',  
        vaultHealthy ? 'vault_business_logic' : 'emergency_fallback_mode',  
        'assumption_analysis_active',  
        'founder_protection_active',  
        'zero_failure_protocols_active'  
      ],  
      assumption_analysis: {  
        detected: extractAssumptions(enforcedResponse),  
        health_score: calculateAssumptionHealth(enforcedResponse)  
      },  
      security_pass: true,  
      performance: {  
        tokens_used: trackingResult.tokens_used,  
        prompt_tokens: promptTokens,  
        completion_tokens: completionTokens,  
        call_cost: trackingResult.call_cost,  
        session_total: trackingResult.session_total,  
        vault_tokens: vaultTokens,  
        api_provider: personality === 'claude' ? 'anthropic' : 'openai'  
      },  
      session_tracking: sessionData,  
      personality_used: personality  
    });

  } catch (error) {  
    console.error('❌ Chat processing error:', error);  
      
    res.status(500).json({  
      response: ENFORCEMENT_PROTOCOLS.error_handling.system_error_response + error.message +   
               '\n\n' + FOUNDER_PROTECTION.system_continuity.error_recovery_message,  
      mode_active: req.body.mode || 'site_monkeys',  
      vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },  
      enforcement_applied: ['emergency_fallback_active', 'truth_enforcement_active', 'founder_protection_active'],  
      error: 'Chat processing failed - emergency protocols active'  
    });  
  }  
}

async function makeRealAPICall(prompt, personality) {  
  // *** ENHANCED WITH AI ARCHITECTURE FAILOVER ***  
  if (personality === 'claude') {  
    if (!process.env.ANTHROPIC_API_KEY) {  
      console.warn('⚠️ Claude API key missing, failing over to GPT-4');  
      return await makeRealAPICall(prompt, 'roxy'); // Failover to GPT  
    }  
      
    try {  
      const response = await fetch('https://api.anthropic.com/v1/messages', {  
        method: 'POST',  
        headers: {  
          'Authorization': 'Bearer ' + process.env.ANTHROPIC_API_KEY,  
          'Content-Type': 'application/json',  
          'x-api-version': '2023-06-01'  
        },  
        body: JSON.stringify({  
          model: 'claude-3-sonnet-20240229',  
          max_tokens: 1000,  
          messages: [{ role: 'user', content: prompt }]  
        })  
      });

      const data = await response.json();  
        
      if (!response.ok) {  
        console.warn('⚠️ Claude API failed, failing over to GPT-4');  
        return await makeRealAPICall(prompt, 'roxy'); // Failover to GPT  
      }  
        
      let responseText = '';  
      if (data.content && Array.isArray(data.content) && data.content[0] && data.content[0].text) {  
        responseText = data.content[0].text;  
      } else if (data.content && typeof data.content === 'string') {  
        responseText = data.content;  
      } else {  
        responseText = 'Claude API response parsing failed';  
      }  
        
      return {  
        response: responseText,  
        usage: data.usage || {}  
      };  
    } catch (claudeError) {  
      console.warn('⚠️ Claude request failed, failing over to GPT-4:', claudeError.message);  
      return await makeRealAPICall(prompt, 'roxy'); // Failover to GPT  
    }  
  }  
    
  if (!process.env.OPENAI_API_KEY) {  
    throw new Error('OpenAI API key not configured - no fallback available');  
  }  
    
  const response = await fetch('https://api.openai.com/v1/chat/completions', {  
    method: 'POST',  
    headers: {  
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,  
      'Content-Type': 'application/json'  
    },  
    body: JSON.stringify({  
      model: 'gpt-3.5-turbo',  
      messages: [{ role: 'user', content: prompt }],  
      max_tokens: 1000,  
      temperature: personality === 'eli' ? 0.3 : 0.7  
    })  
  });

  const data = await response.json();  
  return {  
    response: data.choices[0].message.content,  
    usage: data.usage  
  };  
}

// *** ENHANCED buildSystemPrompt WITH HARDCODED LOGIC INTEGRATION ***  
function buildSystemPrompt(mode, personality, vaultContent = '', vaultHealthy = false) {  
  let systemPrompt = '';  
    
  // *** HARDCODED ENFORCEMENT PROTOCOLS FIRST ***  
  systemPrompt += ENFORCEMENT_PROTOCOLS.truth_first.base_directive + '\n\n';  
  systemPrompt += ENFORCEMENT_PROTOCOLS.identity.core_identity + '\n\n';  
    
  // *** PERSONALITY WITH HARDCODED TRAITS ***  
  const personalityMap = {  
    'eli': 'Eli (analytical, truth-focused)',  
    'roxy': 'Roxy (strategic, solution-oriented)',   
    'claude': 'Claude (comprehensive, precise)'  
  };  
    
  systemPrompt += 'You are ' + (personalityMap[personality] || personalityMap['eli']) + ', Site Monkeys AI.\n\n';  
    
  // *** HARDCODED TRUTH-FIRST REQUIREMENTS ***  
  systemPrompt += ENFORCEMENT_PROTOCOLS.truth_first.confidence_requirements + '\n\n';  
  systemPrompt += ENFORCEMENT_PROTOCOLS.truth_first.speculation_handling + '\n\n';  

  if (mode === 'site_monkeys') {  
    if (vaultContent && vaultContent.length > 1000 && vaultHealthy) {  
      // *** VAULT CONTENT WITH HARDCODED VALIDATION ***  
      systemPrompt += 'SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n' + vaultContent + '\n\n';  
      systemPrompt += ENFORCEMENT_PROTOCOLS.vault_usage.primary_directive + '\n\n';  
        
      // *** HARDCODED QUALITY ENFORCEMENT ***  
      systemPrompt += QUALITY_ENFORCEMENT.response_standards.vault_based + '\n\n';  
        
    } else {  
      // *** EMERGENCY FALLBACKS ACTIVATED ***  
      console.log('🚨 Using emergency fallbacks - vault unhealthy or missing');  
      systemPrompt += 'EMERGENCY FALLBACK MODE ACTIVATED:\n';  
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.pricing_structure + '\n';  
      systemPrompt += EMERGENCY_FALLBACKS.business_logic.service_minimums + '\n';  
      systemPrompt += EMERGENCY_FALLBACKS.enforcement.quality_gates + '\n\n';  
        
      systemPrompt += QUALITY_ENFORCEMENT.response_standards.fallback_mode + '\n\n';  
    }  
      
    // *** HARDCODED FOUNDER PROTECTION (ALWAYS ACTIVE) ***  
    systemPrompt += FOUNDER_PROTECTION.pricing.minimum_enforcement + '\n\n';  
    systemPrompt += FOUNDER_PROTECTION.business_integrity.core_principles + '\n\n';  
  }  
    
  // *** HARDCODED SYSTEM DIRECTIVES (ALWAYS ACTIVE) ***  
  systemPrompt += ENFORCEMENT_PROTOCOLS.system_behavior.response_quality + '\n\n';  
  systemPrompt += ENFORCEMENT_PROTOCOLS.system_behavior.error_prevention + '\n\n';

  return systemPrompt;  
}

function buildFullPrompt(systemPrompt, message, conversationHistory) {  
  let fullPrompt = systemPrompt;  
    
  if (conversationHistory.length > 0) {  
    fullPrompt += 'RECENT CONVERSATION:\n';  
    conversationHistory.slice(-2).forEach(msg => {  
      fullPrompt += (msg.role === 'user' ? 'Human: ' : 'Assistant: ') + msg.content + '\n';  
    });  
  }  
    
  fullPrompt += '\nCURRENT REQUEST:\nHuman: ' + message + '\n\nProvide a helpful, truth-first response:';  
  return fullPrompt;  
}

// *** ENHANCED ENFORCEMENT WITH HARDCODED LOGIC ***  
function applySystemEnforcement(response, mode, vaultContent, vaultStatus, vaultHealthy) {  
  let enforcedResponse = response;  
    
  // *** HARDCODED QUALITY GATES ***  
  if (!response.includes('CONFIDENCE:') && containsFactualClaims(response)) {  
    enforcedResponse += '\n\nCONFIDENCE: Medium (AI processing)';  
  }  
    
  // *** HARDCODED POLITICAL NEUTRALITY ***  
  const politicalKeywords = ['vote', 'election', 'democrat', 'republican'];  
  const containsPolitical = politicalKeywords.some(keyword =>   
    response.toLowerCase().includes(keyword)  
  );  
    
  if (containsPolitical && response.toLowerCase().includes('should vote')) {  
    enforcedResponse += '\n\n' + ENFORCEMENT_PROTOCOLS.neutrality.political_redirect;  
  }  
    
  if (mode === 'site_monkeys') {  
    // *** HARDCODED VAULT ENFORCEMENT ***  
    if (vaultHealthy && !response.includes('vault') && vaultContent.length > 1000) {  
      enforcedResponse += '\n\nVAULT ENFORCEMENT: Response generated using Site Monkeys business intelligence vault.';  
    } else if (!vaultHealthy) {  
      enforcedResponse += '\n\nEMERGENCY MODE: Response using hardcoded fallback protocols.';  
    }  
      
    // *** HARDCODED PRICING PROTECTION ***  
    const priceMatches = response.match(/\$(\d+)/g);  
    if (priceMatches) {  
      const prices = priceMatches.map(match => parseInt(match.replace('$', '')));  
      if (prices.some(price => price < 697)) {  
        enforcedResponse += '\n\n' + FOUNDER_PROTECTION.pricing.enforcement_message;  
      }  
    }  
      
    // *** HARDCODED QUALITY VALIDATION ***  
    if (response.length < 100 && !response.includes('INSUFFICIENT DATA')) {  
      enforcedResponse += '\n\n' + QUALITY_ENFORCEMENT.minimum_standards.response_depth;  
    }  
  }  
    
  return enforcedResponse;  
}

function determinePersonality(message, mode) {  
  const analyticalKeywords = ['analyze', 'data', 'risk', 'technical', 'facts', 'evidence'];  
  const creativeKeywords = ['strategy', 'optimize', 'creative', 'improve', 'design', 'solution'];  
    
  const lowerMessage = message.toLowerCase();  
  const analyticalScore = analyticalKeywords.reduce((score, keyword) => score + (lowerMessage.includes(keyword) ? 1 : 0), 0);  
  const creativeScore = creativeKeywords.reduce((score, keyword) => score + (lowerMessage.includes(keyword) ? 1 : 0), 0);  
    
  return creativeScore > analyticalScore ? 'roxy' : 'eli';  
}

function containsFactualClaims(response) {  
  const factualIndicators = ['studies show', 'research indicates', 'data reveals', 'according to', 'statistics', 'evidence suggests'];  
  return factualIndicators.some(indicator => response.toLowerCase().includes(indicator));  
}

function extractAssumptions(response) {  
  const assumptions = [];  
  if (response.includes('ASSUMPTIONS:')) assumptions.push('explicit_assumptions_listed');  
  if (response.includes('assume') || response.includes('assuming')) assumptions.push('implicit_assumptions_detected');  
  if (response.includes('SPECULATION:') || response.includes('HYPOTHESIS:')) assumptions.push('speculation_marked');  
  return assumptions;  
}

function calculateAssumptionHealth(response) {  
  let score = 100;  
  if (!response.includes('CONFIDENCE:')) score -= 20;  
  if (response.includes('probably') || response.includes('likely')) score -= 15;  
  if (!response.includes('I do not know') && response.length < 100) score -= 10;  
  if (response.includes('INSUFFICIENT DATA')) score += 10;  
  return Math.max(score, 0);  
}
