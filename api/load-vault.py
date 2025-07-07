// FIXED chat.js - Now properly integrates with tokenTracker.js
import { trackApiCall, getSessionDisplayData, formatSessionDataForUI } from './lib/tokenTracker.js';

export default async function handler(req, res) {
  // CORS headers
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

  try {
    const { message, conversation_history = [], mode = 'site_monkeys' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string' });
      return;
    }

    console.log(`🤖 Processing chat request in ${mode} mode:`, message.substring(0, 100));

    // ✅ STEP 1: Load vault if in site_monkeys mode
    let vaultContent = '';
    let vaultTokens = 0;
    
    if (mode === 'site_monkeys') {
      try {
        console.log('📖 Loading vault for Site Monkeys mode...');
        
        const vaultResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/load-vault`);
        const vaultData = await vaultResponse.json();
        
        if (vaultData.status === 'success' && vaultData.vault_content) {
          vaultContent = vaultData.vault_content;
          vaultTokens = vaultData.tokens || 0;
          console.log(`✅ Vault loaded: ${vaultTokens} tokens`);
        } else {
          console.log('⚠️ Vault not available or needs refresh');
          // Continue without vault but note this
          vaultContent = '[Vault data not available - some Site Monkeys features may be limited]';
        }
      } catch (vaultError) {
        console.error('❌ Vault loading failed:', vaultError);
        vaultContent = '[Vault loading failed - operating with limited context]';
      }
    }

    // ✅ STEP 2: Determine personality (Eli vs Roxy)
    const personality = determinePersonality(message, mode);
    console.log(`🎭 Selected personality: ${personality}`);

    // ✅ STEP 3: Build prompt with mode-specific context
    const systemPrompt = buildSystemPrompt(mode, personality, vaultContent);
    const fullPrompt = buildFullPrompt(systemPrompt, message, conversation_history);

    // ✅ STEP 4: Estimate tokens before API call
    const estimatedPromptTokens = Math.ceil(fullPrompt.length / 4);
    
    console.log(`📊 Making API call - Estimated tokens: ${estimatedPromptTokens}, Vault tokens: ${vaultTokens}`);

    // ✅ STEP 5: Make API call (simulated for now - replace with actual API)
    const apiResponse = await makeAPICall(fullPrompt, personality);

    // ✅ STEP 6: Extract token usage from API response
    const actualPromptTokens = apiResponse.usage?.prompt_tokens || estimatedPromptTokens;
    const completionTokens = apiResponse.usage?.completion_tokens || Math.ceil(apiResponse.response.length / 4);

    console.log(`📈 API Response: ${actualPromptTokens} prompt + ${completionTokens} completion = ${actualPromptTokens + completionTokens} total tokens`);

    // ✅ STEP 7: Track the API call with real token data
    const trackingResult = trackApiCall(personality, actualPromptTokens, completionTokens, vaultTokens);
    
    console.log(`💰 Call cost: $${trackingResult.call_cost.toFixed(4)}, Session total: $${trackingResult.session_total.toFixed(4)}`);

    // ✅ STEP 8: Get updated session data for UI
    const sessionData = formatSessionDataForUI();

    // ✅ STEP 9: Apply any necessary response filtering/enforcement
    const filteredResponse = applyResponseFiltering(apiResponse.response, mode);

    // ✅ STEP 10: Return response with tracking data
    res.status(200).json({
      response: filteredResponse,
      personality: personality,
      mode: mode,
      session_tracking: {
        call_cost: `$${trackingResult.call_cost.toFixed(4)}`,
        session_total: `$${trackingResult.session_total.toFixed(4)}`,
        tokens_used: trackingResult.tokens_used,
        cumulative_tokens: trackingResult.cumulative_tokens,
        vault_tokens: vaultTokens
      },
      ui_data: sessionData,
      vault_loaded: mode === 'site_monkeys' && vaultContent.length > 100
    });

  } catch (error) {
    console.error('❌ Chat processing error:', error);
    
    res.status(500).json({
      error: 'Chat processing failed',
      message: error.message,
      session_tracking: formatSessionDataForUI()
    });
  }
}

function determinePersonality(message, mode) {
  // Analytical triggers -> Eli
  const analyticalKeywords = ['analyze', 'data', 'risk', 'technical', 'logical', 'evidence', 'facts', 'research'];
  
  // Creative/Strategic triggers -> Roxy  
  const creativeKeywords = ['strategy', 'optimize', 'creative', 'alternative', 'messaging', 'improve', 'design', 'plan'];
  
  const lowerMessage = message.toLowerCase();
  
  const analyticalScore = analyticalKeywords.reduce((score, keyword) => 
    score + (lowerMessage.includes(keyword) ? 1 : 0), 0
  );
  
  const creativeScore = creativeKeywords.reduce((score, keyword) => 
    score + (lowerMessage.includes(keyword) ? 1 : 0), 0
  );
  
  // Default to Eli for ties or no matches (more conservative)
  return creativeScore > analyticalScore ? 'roxy' : 'eli';
}

function buildSystemPrompt(mode, personality, vaultContent = '') {
  let systemPrompt = '';
  
  // ✅ UNIVERSAL TRUTH ENFORCEMENT (ALL MODES)
  systemPrompt += `You are ${personality === 'eli' ? 'Eli' : 'Roxy'}, an AI assistant that prioritizes TRUTH over comfort.

CORE REQUIREMENTS:
- Every factual claim must include confidence level (High/Medium/Low/Unknown)
- When uncertain, say "I don't know" rather than guess
- Label speculation as "SPECULATION:" or "HYPOTHESIS:"
- Never tell anyone who to vote for - voting is a sacred personal responsibility

`;

  // ✅ MODE-SPECIFIC PROMPTS
  if (mode === 'truth_general') {
    systemPrompt += `MODE: Truth-General
FOCUS: Personal clarity and factual accuracy
STYLE: ${personality === 'eli' ? 'Direct, analytical, evidence-based' : 'Helpful but creative, solution-focused'}
CONSTRAINTS: No business bias, pure truth-seeking
`;

  } else if (mode === 'business_validation') {
    systemPrompt += `MODE: Business Validation  
FOCUS: Business survival and financial reality
STYLE: ${personality === 'eli' ? 'Risk-focused, data-driven analysis' : 'Strategic solutions with cash-flow awareness'}
REQUIREMENTS:
- Always consider worst-case financial scenarios
- Flag business survival risks explicitly  
- Prioritize cash flow over growth optimization
- Include "SURVIVAL_RISK: [level]" in business analysis
`;

  } else if (mode === 'site_monkeys') {
    systemPrompt += `MODE: Site Monkeys (Vault Loaded)
FOCUS: Site Monkeys operational excellence and business intelligence
STYLE: ${personality === 'eli' ? 'Analytical with vault enforcement' : 'Strategic optimization with brand protection'}
BRAND STANDARDS: Premium positioning, zero-failure delivery, truth-first approach

`;
    
    if (vaultContent && vaultContent.length > 100) {
      systemPrompt += `SITE MONKEYS BUSINESS INTELLIGENCE VAULT:
${vaultContent}

VAULT ENFORCEMENT: Use this business intelligence to inform all responses. Maintain pricing standards, operational protocols, and brand positioning.
`;
    } else {
      systemPrompt += `VAULT STATUS: Limited vault access - operating with basic Site Monkeys principles only.
`;
    }
  }

  return systemPrompt;
}

function buildFullPrompt(systemPrompt, message, conversationHistory) {
  let fullPrompt = systemPrompt + '\n\n';
  
  // Add conversation history (last 3 exchanges to manage tokens)
  if (conversationHistory.length > 0) {
    fullPrompt += 'RECENT CONVERSATION:\n';
    const recentHistory = conversationHistory.slice(-6); // Last 3 user + 3 assistant messages
    
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        fullPrompt += `Human: ${msg.content}\n`;
      } else {
        fullPrompt += `Assistant: ${msg.content}\n`;
      }
    });
    fullPrompt += '\n';
  }
  
  fullPrompt += `CURRENT REQUEST:\nHuman: ${message}\n\nAssistant: `;
  
  return fullPrompt;
}

async function makeAPICall(prompt, personality) {
  // ✅ SIMULATED API CALL (Replace with actual OpenAI/Claude API)
  // This is where you'd make the real API call to OpenAI or Claude
  
  console.log(`🔄 Making ${personality} API call...`);
  
  // Simulate API response with token usage
  const simulatedResponse = {
    response: `[${personality.toUpperCase()} RESPONSE] I'm analyzing your request with truth-first principles. 

Based on the information provided, here's my assessment:

CONFIDENCE: Medium (70%)
ANALYSIS: This appears to be a test of the integrated token tracking system.
UNKNOWNS: Specific details about your actual question
ASSUMPTIONS: You're testing the system functionality

This response demonstrates the integrated token tracking system working properly.`,
    
    usage: {
      prompt_tokens: Math.ceil(prompt.length / 4),
      completion_tokens: 180, // Simulated completion tokens
      total_tokens: Math.ceil(prompt.length / 4) + 180
    }
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return simulatedResponse;
  
  // ✅ REAL API CALL WOULD LOOK LIKE THIS:
  /*
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const completion = await openai.chat.completions.create({
    model: personality === 'claude' ? 'gpt-4' : 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: personality === 'eli' ? 0.3 : 0.7
  });
  
  return {
    response: completion.choices[0].message.content,
    usage: completion.usage
  };
  */
}

function applyResponseFiltering(response, mode) {
  // ✅ Apply any mode-specific response filtering
  
  // Check for political content
  const politicalKeywords = ['vote', 'election', 'democrat', 'republican', 'liberal', 'conservative'];
  const containsPolitical = politicalKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
  
  if (containsPolitical && response.toLowerCase().includes('should vote')) {
    response += '\n\n🔐 POLITICAL NEUTRALITY: I cannot tell you who to vote for. That\'s your sacred responsibility as a citizen.';
  }
  
  // Mode-specific filtering
  if (mode === 'site_monkeys') {
    // Check for pricing violations (if vault was loaded)
    const priceMatches = response.match(/\$(\d+)/g);
    if (priceMatches) {
      const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
      const minPrice = 697; // Site Monkeys minimum
      
      if (prices.some(price => price < minPrice)) {
        response += '\n\n🔐 VAULT ENFORCEMENT: All Site Monkeys services maintain minimum pricing standards to ensure quality delivery.';
      }
    }
  }
  
  return response;
}
