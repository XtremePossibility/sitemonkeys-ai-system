import { trackApiCall, formatSessionDataForUI } from ‘./lib/tokenTracker.js’;

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

try {
const { message, conversation_history = [], mode = ‘site_monkeys’, claude_requested = false } = req.body;

```
if (!message || typeof message !== 'string') {
  res.status(400).json({ error: 'Message is required and must be a string' });
  return;
}

console.log('Processing chat request in ' + mode + ' mode:', message.substring(0, 100));
console.log('Claude requested: ' + claude_requested);

if (mode === 'site_monkeys') {
  try {
    console.log('Loading vault for Site Monkeys mode...');
    
    const kv_url = process.env.KV_REST_API_URL;
    const kv_token = process.env.KV_REST_API_TOKEN;
    
    if (!kv_url || !kv_token) {
      throw new Error('KV environment variables not configured');
    }
    
    console.log('Checking KV for vault data...');
    
    const kvResponse = await fetch(kv_url + '/get/sitemonkeys_vault_v2', {
      headers: { 
        'Authorization': 'Bearer ' + kv_token,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (kvResponse.ok) {
      const kvText = await kvResponse.text();
      console.log('KV response length: ' + kvText.length);
      console.log('KV response preview: ' + kvText.substring(0, 200) + '...');
      
      if (kvText && kvText !== 'null' && kvText.trim() !== '') {
        try {
          let kvData;
          
          const kvWrapper = JSON.parse(kvText);
          console.log('KV wrapper keys: ' + Object.keys(kvWrapper).join(', '));
          
          if (kvWrapper.result) {
            console.log('Unwrapping KV result field...');
            kvData = JSON.parse(kvWrapper.result);
          } else if (kvWrapper.compressed) {
            console.log('Handling compressed KV data...');
            try {
              const decompressed = atob(kvWrapper.data);
              kvData = JSON.parse(decompressed);
            } catch (decompError) {
              console.log('Decompression failed, using raw data');
              kvData = kvWrapper;
            }
          } else {
            kvData = kvWrapper;
          }
          
          console.log('Vault data keys: ' + Object.keys(kvData).join(', '));
          console.log('Vault content length: ' + (kvData.vault_content ? kvData.vault_content.length : 'undefined'));
          
          if (kvData.vault_content && kvData.vault_content.length > 1000) {
            vaultContent = kvData.vault_content;
            vaultTokens = kvData.tokens || Math.ceil(vaultContent.length / 4);
            vaultStatus = 'loaded';
            console.log('Vault loaded from KV: ' + vaultTokens + ' tokens, ' + vaultContent.length + ' characters');
          } else {
            console.log('KV vault_content insufficient: ' + (kvData.vault_content ? kvData.vault_content.length : 'undefined') + ' characters');
            throw new Error('Vault content missing or insufficient - needs refresh');
          }
          
        } catch (parseError) {
          console.log('KV parse error: ' + parseError.message);
          throw new Error('KV data parse failed: ' + parseError.message);
        }
      } else {
        throw new Error('KV returned empty or null data');
      }
    } else {
      throw new Error('KV API returned ' + kvResponse.status + ' ' + kvResponse.statusText);
    }
    
  } catch (vaultError) {
    console.error('Vault loading failed:', vaultError.message);
    vaultStatus = 'failed';
    vaultContent = '[VAULT_ERROR: ' + vaultError.message + ']\n\nSYSTEM DIAGNOSTIC:\n- Vault data may need refresh: /api/load-vault?refresh=true\n- KV storage may be corrupted or empty\n- Site Monkeys protocols operating in fallback mode\n\nFALLBACK BUSINESS LOGIC ACTIVE:\n- Premium web development services\n- Pricing tiers start at $697 for quality assurance\n- Business validation and truth-first analysis\n- Zero-compromise professional standards\n\nPlease try refreshing the vault or contact system administrator.';
    vaultTokens = Math.ceil(vaultContent.length / 4);
  }
}

let personality;
let estimatedCost = 0;

if (claude_requested) {
  personality = 'claude';
  const estimatedTokens = Math.ceil((buildSystemPrompt(mode, personality, vaultContent).length + message.length) / 4) + 500;
  estimatedCost = (estimatedTokens * 0.015) / 1000;
  
  console.log('Claude requested - Estimated cost: $' + estimatedCost.toFixed(4));
  
  if (estimatedCost > 0.50) {
    console.log('Claude blocked - Cost $' + estimatedCost.toFixed(4) + ' exceeds $0.50 limit');
    return res.status(200).json({
      response: 'CLAUDE COST LIMIT EXCEEDED\n\nThe estimated cost for this Claude request ($' + estimatedCost.toFixed(4) + ') exceeds the $0.50 per-use limit.\n\nThis is likely due to:\n- Large vault content (' + vaultTokens + ' tokens)\n- Long conversation history\n- Complex prompt structure\n\nOPTIONS:\n1. Use Eli or Roxy (much cheaper: ~$0.03-0.06)\n2. Simplify your request\n3. Clear conversation history to reduce context\n\nWould you like me to process this with Eli or Roxy instead?',
      mode_active: mode,
      vault_status: { loaded: vaultStatus === 'loaded', tokens: vaultTokens, file_count: vaultTokens > 0 ? 3 : 0 },
      enforcement_applied: ['claude_cost_limit_exceeded'],
      claude_blocked: true,
      estimated_cost: '$' + estimatedCost.toFixed(4),
      cost_limit: '$0.50',
      security_pass: false,
      performance: { api_error: { fallback_used: false, cost_blocked: true } }
    });
  }
} else {
  personality = determinePersonality(message, mode);
}

console.log('Selected personality: ' + personality);

const systemPrompt = buildSystemPrompt(mode, personality, vaultContent);
const fullPrompt = buildFullPrompt(systemPrompt, message, conversation_history);

console.log('Making ' + personality + ' API call...');
const apiResponse = await makeRealAPICall(fullPrompt, personality);

let promptTokens, completionTokens;

if (personality === 'claude') {
  promptTokens = apiResponse.usage?.input_tokens || Math.ceil(fullPrompt.length / 4);
  completionTokens = apiResponse.usage?.output_tokens || Math.ceil(apiResponse.response.length / 4);
} else {
  promptTokens = apiResponse.usage?.prompt_tokens || Math.ceil(fullPrompt.length / 4);
  completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);
}

const totalTokens = promptTokens + completionTokens;
console.log('Real API usage: ' + promptTokens + ' + ' + completionTokens + ' = ' + totalTokens + ' tokens');

const trackingResult = trackApiCall(personality, promptTokens, completionTokens, vaultTokens);
console.log('Cost tracking: $' + trackingResult.call_cost.toFixed(4) + ' this call, $' + trackingResult.session_total.toFixed(4) + ' session');

const enforcedResponse = applySystemEnforcement(apiResponse.response, mode, vaultContent, vaultStatus);
const sessionData = formatSessionDataForUI();

res.status(200).json({
  response: enforcedResponse,
  mode_active: mode,
  vault_status: {
    loaded: vaultStatus === 'loaded',
    tokens: vaultTokens,
    file_count: vaultTokens > 0 ? 3 : 0,
    status: vaultStatus
  },
  enforcement_applied: [
    'truth_enforcement_active',
    'political_neutrality_enforced',
    'confidence_scoring_applied',
    mode === 'site_monkeys' && vaultStatus === 'loaded' ? 'vault_business_logic' : 'fallback_mode',
    'assumption_analysis_active'
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
    api_provider: personality === 'claude' ? 'anthropic' : 'openai',
    api_error: { fallback_used: false }
  },
  session_tracking: sessionData,
  personality_used: personality
});
```

} catch (error) {
console.error(‘Chat processing error:’, error);

```
res.status(500).json({
  response: 'SYSTEM ERROR: ' + error.message + '\n\nI encountered an error but the Site Monkeys truth-first enforcement and vault system remain active with ' + vaultTokens + ' tokens available.\n\nSYSTEM STATUS:\n- Vault Status: ' + vaultStatus + '\n- Truth-First Mode: Active\n- Enforcement Protocols: Operational\n\nFALLBACK CAPABILITIES:\nBased on Site Monkeys core principles, I can still help with:\n- Business validation analysis\n- Pricing and service information\n- Strategic guidance\n- Technical assessments\n\nWhat would you like me to help with using the available systems?',
  mode_active: req.body.mode || 'site_monkeys',
  vault_status: { loaded: vaultStatus === 'loaded', tokens: vaultTokens, file_count: vaultTokens > 0 ? 3 : 0 },
  enforcement_applied: ['fallback_mode_active', 'truth_enforcement_active'],
  assumption_analysis: { detected: [], health_score: 0 },
  security_pass: false,
  performance: {
    tokens_used: 0,
    call_cost: 0,
    vault_tokens: vaultTokens,
    api_error: { fallback_used: true, error: error.message }
  },
  error: 'Chat processing failed - fallback active'
});
```

}
}

async function makeRealAPICall(prompt, personality) {
if (personality === ‘claude’) {
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

```
if (!ANTHROPIC_API_KEY) {
  throw new Error('Claude API key not configured');
}

console.log('Making Claude API call...');

try {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'x-api-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }),
    timeout: 30000
  });

  if (!response.ok) {
    throw new Error('Claude API error: ' + response.status + ' ' + response.statusText);
  }

  const data = await response.json();
  
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid Claude API response structure');
  }

  return {
    response: data.content[0].text,
    usage: data.usage || {
      input_tokens: Math.ceil(prompt.length / 4),
      output_tokens: Math.ceil(data.content[0].text.length / 4),
      total_tokens: Math.ceil(prompt.length / 4) + Math.ceil(data.content[0].text.length / 4)
    }
  };

} catch (claudeError) {
  console.error('Claude API call failed:', claudeError);
  throw claudeError;
}
```

}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
throw new Error(‘OpenAI API key not configured for Eli/Roxy’);
}

const model = ‘gpt-3.5-turbo’;
const temperature = personality === ‘eli’ ? 0.3 : 0.7;

console.log(‘Making ’ + personality + ’ OpenAI call…’);

try {
const response = await fetch(‘https://api.openai.com/v1/chat/completions’, {
method: ‘POST’,
headers: {
‘Authorization’: ’Bearer ’ + OPENAI_API_KEY,
‘Content-Type’: ‘application/json’,
},
body: JSON.stringify({
model: model,
messages: [
{
role: ‘user’,
content: prompt
}
],
max_tokens: 1000,
temperature: temperature
}),
timeout: 30000
});

```
if (!response.ok) {
  const errorData = await response.text();
  console.error('OpenAI API error response:', errorData);
  throw new Error('OpenAI API error: ' + response.status + ' - ' + errorData);
}

const data = await response.json();

if (!data.choices || !data.choices[0] || !data.choices[0].message) {
  throw new Error('Invalid OpenAI API response structure');
}

return {
  response: data.choices[0].message.content,
  usage: data.usage || {
    prompt_tokens: Math.ceil(prompt.length / 4),
    completion_tokens: Math.ceil(data.choices[0].message.content.length / 4),
    total_tokens: Math.ceil(prompt.length / 4) + Math.ceil(data.choices[0].message.content.length / 4)
  }
};
```

} catch (openaiError) {
console.error(personality + ’ OpenAI API call failed:’, openaiError);
throw openaiError;
}
}

function buildSystemPrompt(mode, personality, vaultContent = ‘’) {
let systemPrompt = ’You are ’ + (personality === ‘eli’ ? ‘Eli (analytical)’ : personality === ‘roxy’ ? ‘Roxy (strategic)’ : ‘Claude’) + ’, Site Monkeys AI.\n\nPERSONALITY: ’ + (personality === ‘eli’ ? ‘Analytical, direct, evidence-focused. Prefers data and facts.’ : personality === ‘roxy’ ? ‘Strategic, creative, solution-oriented. Focuses on innovation and optimization.’ : ‘Balanced, thorough, and precise. Combines analytical depth with creative problem-solving.’) + ‘\n\nCORE TRUTH-FIRST REQUIREMENTS (NON-NEGOTIABLE):\n- Every factual claim MUST include confidence level (High/Medium/Low/Unknown)\n- When uncertain, say “I do not know” rather than guess\n- Label speculation as “SPECULATION:” or “HYPOTHESIS:”\n- NEVER tell anyone who to vote for - redirect to independent research\n- Include assumptions in your analysis when relevant\n- Mark insufficient data clearly as “INSUFFICIENT DATA”\n- Reject hallucinations and false information\n\n’;

if (mode === ‘truth_general’) {
systemPrompt += ‘MODE: Truth-General\nFocus on factual accuracy and personal clarity without business bias.\n’;

} else if (mode === ‘business_validation’) {
systemPrompt += ‘MODE: Business Validation\nFocus on business survival, financial reality, and conservative risk assessment.\nAlways include SURVIVAL_RISK assessment in business analysis.\n’;

} else if (mode === ‘site_monkeys’) {
systemPrompt += ‘MODE: Site Monkeys Operational\nFocus on Site Monkeys business excellence and operational standards.\n\n’;

```
if (vaultContent && vaultContent.length > 1000) {
  systemPrompt += 'SITE MONKEYS BUSINESS INTELLIGENCE VAULT:\n' + vaultContent + '\n\nCRITICAL INSTRUCTION: Use this vault intelligence extensively to inform responses about Site Monkeys operations, pricing, protocols, and business standards. Reference specific vault information directly. Do not use generic or fallback language when vault data is available. Begin responses with "Based on the Site Monkeys vault protocols" when referencing vault data.\n\n';
  console.log('Vault injected into system prompt: ' + vaultContent.length + ' characters');
} else {
  systemPrompt += 'VAULT STATUS: Operating in fallback mode due to vault loading error.\n\nCORE SITE MONKEYS PRINCIPLES (Fallback):\n- Premium quality web development starting at $697\n- Business validation and truth-first analysis focus\n- Professional service delivery standards\n- Zero-compromise quality assurance\n\n';
  console.log('Using fallback prompt - vault content: ' + (vaultContent ? vaultContent.length : 0) + ' characters');
}
```

}

return systemPrompt;
}

function buildFullPrompt(systemPrompt, message, conversationHistory) {
let fullPrompt = systemPrompt + ‘\n\n’;

if (conversationHistory.length > 0) {
fullPrompt += ‘RECENT CONVERSATION:\n’;
const recentHistory = conversationHistory.slice(-4);

```
recentHistory.forEach(msg => {
  if (msg.role === 'user') {
    fullPrompt += 'Human: ' + msg.content + '\n';
  } else {
    fullPrompt += 'Assistant: ' + msg.content + '\n';
  }
});
fullPrompt += '\n';
```

}

fullPrompt += ’CURRENT REQUEST:\nHuman: ’ + message + ‘\n\nProvide a helpful, truth-first response with appropriate confidence levels:’;

return fullPrompt;
}

function applySystemEnforcement(response, mode, vaultContent, vaultStatus) {
let enforcedResponse = response;

if (!response.includes(‘CONFIDENCE:’) && containsFactualClaims(response)) {
enforcedResponse += ‘\n\nCONFIDENCE: Medium (AI processing)’;
}

const politicalKeywords = [‘vote’, ‘election’, ‘democrat’, ‘republican’];
const containsPolitical = politicalKeywords.some(keyword =>
response.toLowerCase().includes(keyword)
);

if (containsPolitical && response.toLowerCase().includes(‘should vote’)) {
enforcedResponse += ‘\n\nPOLITICAL NEUTRALITY: I cannot tell you who to vote for. That is your sacred responsibility as a citizen. Research multiple sources and decide independently.’;
}

if (mode === ‘site_monkeys’) {
if (vaultStatus === ‘loaded’ && !response.includes(‘Based on the Site Monkeys vault’) && vaultContent.length > 1000) {
enforcedResponse += ‘\n\nVAULT ENFORCEMENT: Response generated using Site Monkeys business intelligence vault.’;
}

```
const priceMatches = response.match(/\$(\d+)/g);
if (priceMatches) {
  const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
  if (prices.some(price => price < 697)) {
    enforcedResponse += '\n\nSITE MONKEYS ENFORCEMENT: All services maintain premium pricing standards starting at $697 for quality assurance.';
  }
}
```

}

return enforcedResponse;
}

function determinePersonality(message, mode) {
const analyticalKeywords = [‘analyze’, ‘data’, ‘risk’, ‘technical’, ‘facts’, ‘evidence’, ‘stats’, ‘metrics’];
const creativeKeywords = [‘strategy’, ‘optimize’, ‘creative’, ‘improve’, ‘design’, ‘solution’, ‘innovate’, ‘enhance’];

const lowerMessage = message.toLowerCase();

const analyticalScore = analyticalKeywords.reduce((score, keyword) =>
score + (lowerMessage.includes(keyword) ? 1 : 0), 0
);

const creativeScore = creativeKeywords.reduce((score, keyword) =>
score + (lowerMessage.includes(keyword) ? 1 : 0), 0
);

return creativeScore > analyticalScore ? ‘roxy’ : ‘eli’;
}

function containsFactualClaims(response) {
const factualIndicators = [‘studies show’, ‘research indicates’, ‘data reveals’, ‘according to’, ‘statistics’, ‘evidence suggests’];
return factualIndicators.some(indicator =>
response.toLowerCase().includes(indicator)
);
}

function extractAssumptions(response) {
const assumptions = [];

if (response.includes(‘ASSUMPTIONS:’)) {
assumptions.push(‘explicit_assumptions_listed’);
}

if (response.includes(‘assume’) || response.includes(‘assuming’)) {
assumptions.push(‘implicit_assumptions_detected’);
}

if (response.includes(‘SPECULATION:’) || response.includes(‘HYPOTHESIS:’)) {
assumptions.push(‘speculation_marked’);
}

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