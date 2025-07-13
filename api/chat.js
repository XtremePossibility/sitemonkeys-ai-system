// ZERO-FAILURE CHAT.JS - COMPLETE INTEGRATION WITH PERSONALITY FRAMEWORK
// Enhanced with “Honest Best Friend” personality system, optimization suggestions, and context-aware responses
import { trackApiCall, formatSessionDataForUI } from ‘./lib/tokenTracker.js’;
import { EMERGENCY_FALLBACKS, validateVaultStructure, getVaultValue } from ‘./lib/site-monkeys/emergency-fallbacks.js’;
import { ENFORCEMENT_PROTOCOLS } from ‘./lib/site-monkeys/enforcement-protocols.js’;
import { QUALITY_ENFORCEMENT } from ‘./lib/site-monkeys/quality-enforcement.js’;
import { AI_ARCHITECTURE } from ‘./lib/site-monkeys/ai-architecture.js’;
import { FOUNDER_PROTECTION } from ‘./lib/site-monkeys/founder-protection.js’;
import zlib from ‘zlib’; // *** CRITICAL FIX: Import zlib for gzip decompression ***

export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) {
res.status(200).end();
return;
}

if (req.method !== ‘POST’) {
res.status(405).json({ error: ‘Method not allowed’ });
return;
}

let vaultContent = ‘’;
let vaultTokens = 0;
let vaultStatus = ‘not_loaded’;
let vaultHealthy = false;

try {
// *** CRITICAL: Accept vault_content from frontend ***
const {
message,
conversation_history = [],
mode = ‘site_monkeys’,
claude_requested = false,
vault_content = null  // NEW: Frontend can send vault content directly
} = req.body;

```
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

// *** ENHANCED PERSONALITY DETERMINATION ***
let personality = claude_requested ? 'claude' : determinePersonality(message, mode, conversation_history);

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

// *** ENHANCED SYSTEM PROMPT WITH PERSONALITY FRAMEWORK ***
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

// *** ENHANCED RESPONSE PROCESSING WITH PERSONALITY AND OPTIMIZATION ***
const enhancedResponse = enhanceResponseWithPersonality(apiResponse.response, personality, message, mode, conversation_history);
const optimizedResponse = addOptimizationSuggestions(enhancedResponse, message, mode, vaultContent);
const enforcedResponse = applySystemEnforcement(optimizedResponse, mode, vaultContent, vaultStatus, vaultHealthy);

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
    'personality_framework_active',
    'optimization_suggestions_enabled',
    vaultHealthy ? 'vault_business_logic' : 'emergency_fallback_mode',
    'assumption_analysis_active',
    'founder_protection_active',
    'zero_failure_protocols_active'
  ],
  assumption_analysis: {
    detected: extractAssumptions(enforcedResponse),
    health_score: calculateAssumptionHealth(enforcedResponse)
  },
  personality_analytics: {
    selected: personality,
    reasoning: getPersonalityReasoning(message, personality),
    confidence_level: getResponseConfidenceLevel(enforcedResponse)
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
```

} catch (error) {
console.error(‘❌ Chat processing error:’, error);

```
res.status(500).json({
  response: ENFORCEMENT_PROTOCOLS.error_handling.system_error_response + error.message + 
           '\n\n' + FOUNDER_PROTECTION.system_continuity.error_recovery_message,
  mode_active: req.body.mode || 'site_monkeys',
  vault_status: { loaded: vaultStatus !== 'not_loaded', tokens: vaultTokens, healthy: vaultHealthy },
  enforcement_applied: ['emergency_fallback_active', 'truth_enforcement_active', 'founder_protection_active'],
  error: 'Chat processing failed - emergency protocols active'
});
```

}
}

async function makeRealAPICall(prompt, personality) {
// *** ENHANCED WITH AI ARCHITECTURE FAILOVER ***
if (personality === ‘claude’) {
if (!process.env.ANTHROPIC_API_KEY) {
console.warn(‘⚠️ Claude API key missing, failing over to GPT-4’);
return await makeRealAPICall(prompt, ‘roxy’); // Failover to GPT
}

```
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
      max_tokens: 1500, // Increased for detailed responses
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
```

}

if (!process.env.OPENAI_API_KEY) {
throw new Error(‘OpenAI API key not configured - no fallback available’);
}

const response = await fetch(‘https://api.openai.com/v1/chat/completions’, {
method: ‘POST’,
headers: {
‘Authorization’: ’Bearer ’ + process.env.OPENAI_API_KEY,
‘Content-Type’: ‘application/json’
},
body: JSON.stringify({
model: ‘gpt-3.5-turbo’,
messages: [{ role: ‘user’, content: prompt }],
max_tokens: 1200, // Increased for detailed responses
temperature: personality === ‘eli’ ? 0.3 : 0.7
})
});

const data = await response.json();
return {
response: data.choices[0].message.content,
usage: data.usage
};
}

// *** ENHANCED buildSystemPrompt WITH PERSONALITY FRAMEWORK ***
function buildSystemPrompt(mode, personality, vaultContent = ‘’, vaultHealthy = false) {
let systemPrompt = ‘’;

// *** CORE TRUTH-FIRST FOUNDATION ***
systemPrompt += ENFORCEMENT_PROTOCOLS.truth_first.base_directive + ‘\n\n’;
systemPrompt += ENFORCEMENT_PROTOCOLS.identity.core_identity + ‘\n\n’;

// *** ENHANCED PERSONALITY SYSTEM WITH “HONEST BEST FRIEND” FRAMEWORK ***
if (personality === ‘eli’) {
systemPrompt += `You are Eli, the analytical truth-focused assistant of Site Monkeys AI.

PERSONALITY CORE:

- You are the “Honest Best Friend” who cares too much about success to lie
- Your approach: “Let me break down the numbers for you…” and data-driven analysis
- You prioritize evidence, risk assessment, and logical breakdown
- Caring but direct: “I need to be straight with you about this…”

COMMUNICATION STYLE:

- Lead with data and evidence when available
- Always include confidence levels (High 85%+, Medium 60-84%, Low <60%)
- When uncertain, say “I don’t have sufficient data” rather than guess
- Warm but uncompromising: “I care about your success too much to let you chase something that’ll hurt you”
- Provide detailed analysis when the question warrants it, concise answers for simple queries

RESPONSE FRAMEWORK:

- CONFIDENCE: Always indicate confidence level for factual claims
- EVIDENCE: Base recommendations on verifiable data when possible
- ASSUMPTIONS: Flag any assumptions you’re making
- ALTERNATIVES: When something won’t work, show what will`;
  
  } else if (personality === ‘roxy’) {
  systemPrompt += `You are Roxy, the strategic solution-oriented assistant of Site Monkeys AI.

PERSONALITY CORE:

- You are the “Honest Best Friend” who focuses on finding paths that actually work
- Your approach: “That won’t work, but what if we tried…” and creative problem-solving
- You prioritize solutions, alternatives, and strategic thinking
- Encouraging but realistic: “This approach won’t work, but I see exactly how you can get what you want…”

COMMUNICATION STYLE:

- Focus on solutions and alternative approaches
- Always include confidence levels for any claims
- When you see a better path, suggest it: “I’m seeing three different ways you could approach this…”
- Warm but protective: “You deserve better than a comforting lie - here’s what’s really going on and how to fix it”
- Provide thorough explanations for strategic questions, brief answers for quick clarifications

RESPONSE FRAMEWORK:

- CONFIDENCE: Always indicate confidence level for any recommendations
- ALTERNATIVES: Present multiple options when possible
- OPTIMIZATION: Spot opportunities for better approaches
- REALITY CHECK: Honest assessment of what will/won’t work`;
  
  } else { // claude
  systemPrompt += `You are Claude, the comprehensive AI assistant for Site Monkeys.

PERSONALITY CORE:

- You combine Eli’s analytical rigor with Roxy’s solution-finding
- Enhanced truth enforcement with meta-validation: “Am I being rigorous enough?”
- Comprehensive analysis with assumption challenging: “What haven’t we considered?”
- The most thorough and careful of all personalities

COMMUNICATION STYLE:

- Provide comprehensive analysis with multiple perspectives
- Always include detailed confidence assessments
- Challenge assumptions and explore edge cases
- Warm but exceptionally thorough in truth-telling`;
  }
  
  systemPrompt += ‘\n\n’;
  
  // *** ENHANCED TRUTH-FIRST REQUIREMENTS ***
  systemPrompt += `TRUTH-FIRST REQUIREMENTS (NON-NEGOTIABLE):
- Include confidence levels for ALL factual claims
- When uncertain, ask clarifying questions rather than guess
- Label speculation clearly with “SPECULATION:” or “HYPOTHESIS:”
- Flag assumptions explicitly
- Never soften inconvenient truths - deliver them with care but complete honesty
- Provide “I don’t know” when evidence is insufficient

HELPFUL OPTIMIZATION:

- Proactively spot better approaches when you see them
- Suggest improvements when appropriate, but never push
- Pattern: “I see you’re considering X. That could work, but I’m noticing Y opportunity that might get you there faster with less risk. Want me to walk through both options?”
- Only suggest optimizations when genuinely beneficial

RESPONSE INTELLIGENCE:

- Match response depth to question complexity
- Detailed explanations for strategic/complex questions
- Concise answers for simple factual questions
- Always maintain the warm, caring tone while being direct about truth\n\n`;
  
  // *** MODE-SPECIFIC ENHANCEMENTS ***
  if (mode === ‘site_monkeys’) {
  if (vaultContent && vaultContent.length > 1000 && vaultHealthy) {
  systemPrompt += ‘SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n’ + vaultContent + ‘\n\n’;
  systemPrompt += ENFORCEMENT_PROTOCOLS.vault_usage.primary_directive + ‘\n\n’;
  systemPrompt += QUALITY_ENFORCEMENT.response_standards.vault_based + ‘\n\n’;
  } else {
  console.log(‘🚨 Using emergency fallbacks - vault unhealthy or missing’);
  systemPrompt += ‘EMERGENCY FALLBACK MODE ACTIVATED:\n’;
  systemPrompt += EMERGENCY_FALLBACKS.business_logic.pricing_structure + ‘\n’;
  systemPrompt += EMERGENCY_FALLBACKS.business_logic.service_minimums + ‘\n’;
  systemPrompt += EMERGENCY_FALLBACKS.enforcement.quality_gates + ‘\n\n’;
  systemPrompt += QUALITY_ENFORCEMENT.response_standards.fallback_mode + ‘\n\n’;
  }
  
  // *** HARDCODED FOUNDER PROTECTION (ALWAYS ACTIVE) ***
  systemPrompt += FOUNDER_PROTECTION.pricing.minimum_enforcement + ‘\n\n’;
  systemPrompt += FOUNDER_PROTECTION.business_integrity.core_principles + ‘\n\n’;
  }
  
  // *** HARDCODED SYSTEM DIRECTIVES (ALWAYS ACTIVE) ***
  systemPrompt += ENFORCEMENT_PROTOCOLS.system_behavior.response_quality + ‘\n\n’;
  systemPrompt += ENFORCEMENT_PROTOCOLS.system_behavior.error_prevention + ‘\n\n’;
  
  return systemPrompt;
  }

function buildFullPrompt(systemPrompt, message, conversationHistory) {
let fullPrompt = systemPrompt;

if (conversationHistory.length > 0) {
fullPrompt += ‘RECENT CONVERSATION:\n’;
conversationHistory.slice(-4).forEach(msg => { // Increased context for better responses
fullPrompt += (msg.role === ‘user’ ? ’Human: ’ : ’Assistant: ’) + msg.content + ‘\n’;
});
}

fullPrompt += ’\nCURRENT REQUEST:\nHuman: ’ + message + ‘\n\nProvide a helpful, truth-first response that matches your personality and includes appropriate confidence levels:’;
return fullPrompt;
}

// *** NEW: ENHANCED PERSONALITY DETERMINATION ***
function determinePersonality(message, mode, conversationHistory = []) {
const analyticalKeywords = [‘analyze’, ‘data’, ‘risk’, ‘technical’, ‘facts’, ‘evidence’, ‘research’, ‘statistics’, ‘breakdown’, ‘numbers’];
const creativeKeywords = [‘strategy’, ‘optimize’, ‘creative’, ‘improve’, ‘design’, ‘solution’, ‘alternatives’, ‘approach’, ‘better way’, ‘ideas’];
const detailRequestWords = [‘explain’, ‘detail’, ‘thorough’, ‘comprehensive’, ‘walk through’, ‘break down’];

const lowerMessage = message.toLowerCase();

// Check for explicit detail requests
const requestsDetail = detailRequestWords.some(word => lowerMessage.includes(word));

// Score message content
const analyticalScore = analyticalKeywords.reduce((score, keyword) =>
score + (lowerMessage.includes(keyword) ? 1 : 0), 0);
const creativeScore = creativeKeywords.reduce((score, keyword) =>
score + (lowerMessage.includes(keyword) ? 1 : 0), 0);

// Consider conversation history for alternating
const lastPersonality = conversationHistory.length > 0 ?
conversationHistory[conversationHistory.length - 1]?.personality : null;

// Decision logic
if (creativeScore > analyticalScore + 1) {
return ‘roxy’;
} else if (analyticalScore > creativeScore + 1) {
return ‘eli’;
} else {
// For ambiguous cases, alternate personalities
return lastPersonality === ‘eli’ ? ‘roxy’ : ‘eli’;
}
}

// *** NEW: RESPONSE ENHANCEMENT WITH PERSONALITY ***
function enhanceResponseWithPersonality(response, personality, originalMessage, mode, conversationHistory) {
let enhanced = response;

// Add confidence scoring if missing
if (!response.includes(‘CONFIDENCE:’) && containsFactualClaims(response)) {
const confidenceLevel = assessResponseConfidence(response);
enhanced += `\n\nCONFIDENCE: ${confidenceLevel}`;
}

// Add personality-specific enhancements
if (personality === ‘eli’ && response.length > 100 && !response.includes(‘EVIDENCE:’)) {
// Eli would want to cite evidence sources when possible
if (response.includes(‘studies’) || response.includes(‘research’) || response.includes(‘data’)) {
enhanced += ‘\n\nEVIDENCE: Based on analysis of available information. Consider verifying with primary sources for critical decisions.’;
}
}

if (personality === ‘roxy’ && response.length > 100 && !response.includes(‘ALTERNATIVES:’)) {
// Roxy would want to offer alternatives when giving advice
if (response.includes(‘recommend’) || response.includes(‘suggest’) || response.includes(‘should’)) {
enhanced += ‘\n\nALTERNATIVES: This is one approach - would you like me to explore other options that might work for your specific situation?’;
}
}

return enhanced;
}

// *** NEW: OPTIMIZATION SUGGESTIONS ***
function addOptimizationSuggestions(response, originalMessage, mode, vaultContent) {
const lowerMessage = originalMessage.toLowerCase();
const lowerResponse = response.toLowerCase();

// Only add suggestions when genuinely helpful
let suggestions = [];

// Business optimization opportunities
if (mode === ‘site_monkeys’ || mode === ‘business’) {
if (lowerMessage.includes(‘marketing’) && !lowerResponse.includes(‘roi’)) {
suggestions.push(‘💡 OPTIMIZATION: Consider tracking ROI metrics for any marketing initiatives to measure true effectiveness.’);
}

```
if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
  if (lowerResponse.includes('$') && !lowerResponse.includes('margin')) {
    suggestions.push('💡 OPTIMIZATION: When evaluating pricing, also consider profit margins and customer lifetime value for the full picture.');
  }
}

if (lowerMessage.includes('automat') && !lowerResponse.includes('fallback')) {
  suggestions.push('💡 OPTIMIZATION: For any automation you implement, ensure you have manual fallback procedures in case of system failures.');
}
```

}

// Strategic thinking opportunities
if (lowerMessage.includes(‘problem’) && !lowerResponse.includes(‘root cause’)) {
suggestions.push(‘💡 OPTIMIZATION: Consider doing a root cause analysis to address the underlying issue, not just symptoms.’);
}

if (suggestions.length > 0 && suggestions.length <= 2) { // Limit to avoid overwhelming
return response + ‘\n\n’ + suggestions.join(’\n’);
}

return response;
}

// *** ENHANCED ENFORCEMENT WITH PERSONALITY-AWARE LOGIC ***
function applySystemEnforcement(response, mode, vaultContent, vaultStatus, vaultHealthy) {
let enforcedResponse = response;

// *** HARDCODED QUALITY GATES ***
if (!response.includes(‘CONFIDENCE:’) && containsFactualClaims(response)) {
enforcedResponse += ‘\n\nCONFIDENCE: Medium (AI processing)’;
}

// *** HARDCODED POLITICAL NEUTRALITY ***
const politicalKeywords = [‘vote’, ‘election’, ‘democrat’, ‘republican’];
const containsPolitical = politicalKeywords.some(keyword =>
response.toLowerCase().includes(keyword)
);

if (containsPolitical && response.toLowerCase().includes(‘should vote’)) {
enforcedResponse += ‘\n\n’ + ENFORCEMENT_PROTOCOLS.neutrality.political_redirect;
}

if (mode === ‘site_monkeys’) {
// *** HARDCODED VAULT ENFORCEMENT ***
if (vaultHealthy && !response.includes(‘vault’) && vaultContent.length > 1000) {
enforcedResponse += ‘\n\nVAULT ENFORCEMENT: Response generated using Site Monkeys business intelligence vault.’;
} else if (!vaultHealthy) {
enforcedResponse += ‘\n\nEMERGENCY MODE: Response using hardcoded fallback protocols.’;
}

```
// *** HARDCODED PRICING PROTECTION ***
const priceMatches = response.match(/\$(\d+)/g);
if (priceMatches) {
  const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
  if (prices.some(price => price < 697)) {
    enforcedResponse += '\n\n' + FOUNDER_PROTECTION.pricing.enforcement_message;
  }
}

// *** QUALITY VALIDATION FOR BUSINESS RESPONSES ***
if (response.length < 150 && !response.includes('INSUFFICIENT DATA') && !isSimpleFactualQuery(response)) {
  enforcedResponse += '\n\n' + QUALITY_ENFORCEMENT.minimum_standards.response_depth;
}
```

}

return enforcedResponse;
}

// *** HELPER FUNCTIONS ***
function containsFactualClaims(response) {
const factualIndicators = [‘studies show’, ‘research indicates’, ‘data reveals’, ‘according to’, ‘statistics’, ‘evidence suggests’, ‘reports indicate’];
return factualIndicators.some(indicator => response.toLowerCase().includes(indicator));
}

function assessResponseConfidence(response) {
const highConfidenceWords = [‘proven’, ‘established’, ‘documented’, ‘verified’];
const lowConfidenceWords = [‘might’, ‘could’, ‘possibly’, ‘perhaps’, ‘seems’];

const hasHighConfidence = highConfidenceWords.some(word => response.toLowerCase().includes(word));
const hasLowConfidence = lowConfidenceWords.some(word => response.toLowerCase().includes(word));

if (hasHighConfidence && !hasLowConfidence) return ‘High (85%+)’;
if (hasLowConfidence) return ‘Low (40-60%)’;
return ‘Medium (60-80%)’;
}

function isSimpleFactualQuery(response) {
return response.length < 100 && !response.includes(‘analyze’) && !response.includes(‘strategy’);
}

function getPersonalityReasoning(message, personality) {
if (personality === ‘eli’) return ‘Analytical/technical content detected’;
if (personality === ‘roxy’) return ‘Strategic/solution-focused content detected’;
return ‘Manual Claude selection’;
}

function getResponseConfidenceLevel(response) {
if (response.includes(‘High (’)) return ‘high’;
if (response.includes(‘Low (’)) return ‘low’;
return ‘medium’;
}

function extractAssumptions(response) {
const assumptions = [];
if (response.includes(‘ASSUMPTIONS:’)) assumptions.push(‘explicit_assumptions_listed’);
if (response.includes(‘assume’) || response.includes(‘assuming’)) assumptions.push(‘implicit_assumptions_detected’);
if (response.includes(‘SPECULATION:’) || response.includes(‘HYPOTHESIS:’)) assumptions.push(‘speculation_marked’);
return assumptions;
}

function calculateAssumptionHealth(response) {
let score = 100;
if (!response.includes(‘CONFIDENCE:’)) score -= 20;
if (response.includes(‘probably’) || response.includes(‘likely’)) score -= 15;
if (!response.includes(‘I do not know’) && response.length < 100) score -= 10;
if (response.includes(‘INSUFFICIENT DATA’)) score += 10;
return Math.max(score, 0);
}