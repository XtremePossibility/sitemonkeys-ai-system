import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Core mode definitions
const MODES = {
  truth_general: {
    mode_id: "TG-PROD-001",
    system_prompt: `You are operating in Truth-General Mode. CORE PRINCIPLES:
- NEVER generate unsupported claims or fabricated information
- ALWAYS flag uncertainty with explicit confidence levels
- SURFACE unknowns explicitly - don't work around them
- NO softening language without data backing
- When speculating, use clear prefixes: "Hypothesis:", "Speculation:", "Unverified inference:"
- "I don't know" is always an acceptable answer
- Provide creative solutions based on real information only`,
    
    personality_base: "You are warm, caring, and genuinely helpful, but you never compromise truth for comfort."
  },
  
  business_validation: {
    mode_id: "BV-PROD-001",
    system_prompt: `You are operating in Business Validation Mode. CORE PRINCIPLES:
- ALWAYS model downside scenarios and worst-case outcomes
- SURFACE cost cascades and hidden dependencies
- FLAG survivability risks explicitly
- PRIORITIZE runway preservation over growth optimization
- NO false confidence intervals or optimistic projections
- Provide reality-based risk assessment with creative solutions
- Focus on cash flow impact and business survival`,
    
    personality_base: "You are a caring strategic advisor who helps businesses survive and thrive through honest assessment and creative problem-solving."
  }
};

// Site Monkeys vault logic triggers
const VAULT_TRIGGERS = {
  pricing: ['price', 'pricing', 'cost', 'revenue', 'monetization', 'subscription', 'tier'],
  features: ['feature', 'development', 'roadmap', 'build', 'functionality', 'service'],
  hiring: ['hire', 'hiring', 'staff', 'team', 'employee', 'contractor'],
  marketing: ['marketing', 'advertising', 'campaign', 'lead', 'conversion'],
  competition: ['competitor', 'competitive', 'market', 'industry']
};

// Vault decision frameworks
const SITE_MONKEYS_LOGIC = {
  vault_id: "SM-PROD-v1.0",
  business_context: "Full-service marketing company focusing on SMB 'unsung heroes'",
  
  decision_frameworks: {
    pricing_strategy: {
      logic: "Site Monkeys operates on premium positioning: Boost ($697), Climb ($1,497), Lead ($2,997). Never compete on price - compete on value and complete transparency.",
      override: "VAULT_OVERRIDE"
    },
    
    feature_prioritization: {
      logic: "Revenue impact > Development cost > Market validation. Focus on complete solutions that serve 'unsung hero' businesses.",
      override: "MERGE_WITH_MODE"
    },
    
    hiring_decisions: {
      logic: "Quality over quantity. Hire people who understand the mission. Contractors must be compartmentalized with NDAs.",
      override: "VAULT_OVERRIDE"
    },
    
    marketing_approach: {
      logic: "Position against broken agency model. Emphasize transparency, AI automation, and genuine care for SMB success.",
      override: "MERGE_WITH_MODE"
    }
  }
};

// Analyze prompt to determine Eli vs Roxy leadership
function analyzePromptType(message) {
  const analyticalKeywords = ['data', 'analysis', 'numbers', 'risk', 'legal', 'compliance', 'math', 'evidence', 'research'];
  const creativeKeywords = ['ideas', 'creative', 'solution', 'alternative', 'stuck', 'brainstorm', 'options', 'different'];
  
  const messageLC = message.toLowerCase();
  
  const analyticalScore = analyticalKeywords.filter(keyword => messageLC.includes(keyword)).length;
  const creativeScore = creativeKeywords.filter(keyword => messageLC.includes(keyword)).length;
  
  if (analyticalScore > creativeScore) return 'eli_leads';
  if (creativeScore > analyticalScore) return 'roxy_leads';
  return 'balanced'; // Both contribute equally
}

// Check for vault triggers
function checkVaultTriggers(message) {
  const messageLC = message.toLowerCase();
  const triggeredFrameworks = [];
  
  for (const [framework, keywords] of Object.entries(VAULT_TRIGGERS)) {
    if (keywords.some(keyword => messageLC.includes(keyword))) {
      triggeredFrameworks.push(framework);
    }
  }
  
  return triggeredFrameworks;
}

// Generate vault context if triggers found
function generateVaultContext(triggeredFrameworks, vaultLoaded) {
  if (!vaultLoaded || triggeredFrameworks.length === 0) return '';
  
  let vaultContext = '\n\nSITE MONKEYS VAULT LOGIC ACTIVE:\n';
  
  triggeredFrameworks.forEach(framework => {
    const logic = SITE_MONKEYS_LOGIC.decision_frameworks[framework + '_strategy'];
    if (logic) {
      vaultContext += `${framework.toUpperCase()}: ${logic.logic}\n`;
    }
  });
  
  vaultContext += '\nApply this business-specific logic while maintaining truth-first principles.\n';
  return vaultContext;
}

// Generate Eli's analytical response
async function generateEliResponse(userMessage, mode, vaultContext, conversationHistory) {
  const eliPersonality = `You are Eli from Site Monkeys - the analytical AI who focuses on data, logic, and truth.
Your personality: Warm but precise, caring but analytical. You lead with facts and evidence.
Your style: "Let me break down what's actually happening here..." / "The data shows..." / "Here's what you need to know..."
${mode.personality_base}

CRITICAL: Never fabricate information. If you don't know something, say so clearly.`;

  const messages = [
    {
      role: "system", 
      content: `${eliPersonality}\n\n${mode.system_prompt}${vaultContext}`
    },
    ...conversationHistory.slice(-6), // Keep recent context
    {
      role: "user",
      content: userMessage
    }
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
    max_tokens: 600,
    temperature: 0.3, // Lower temperature for analytical responses
  });

  return completion.choices[0].message.content;
}

// Generate Roxy's creative response
async function generateRoxyResponse(userMessage, mode, vaultContext, eliResponse, conversationHistory) {
  const roxyPersonality = `You are Roxy from Site Monkeys - the creative AI who focuses on solutions and possibilities.
Your personality: Warm and encouraging, creative but realistic. You build on truth to find paths forward.
Your style: "Okay, now let's figure out how to make this work..." / "I'm seeing three ways you could..." / "What if we tried..."
${mode.personality_base}

CRITICAL: Base all solutions on real information. Never invent options that don't exist.`;

  const contextWithEli = `Previous analysis from Eli: ${eliResponse}\n\nNow provide creative, reality-based solutions that build on this truth.`;

  const messages = [
    {
      role: "system",
      content: `${roxyPersonality}\n\n${mode.system_prompt}${vaultContext}`
    },
    ...conversationHistory.slice(-6),
    {
      role: "user",
      content: `${userMessage}\n\n${contextWithEli}`
    }
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4", 
    messages: messages,
    max_tokens: 600,
    temperature: 0.7, // Higher temperature for creative solutions
  });

  return completion.choices[0].message.content;
}

// Main chat handler
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      message, 
      conversation_history = [], 
      mode = 'business_validation',
      vault_loaded = false,
      user_preference = null // 'eli', 'roxy', or null for auto
    } = req.body;

    // Get mode configuration
    const selectedMode = MODES[mode] || MODES.business_validation;
    
    // Analyze prompt type for response flow
    const promptType = user_preference || analyzePromptType(message);
    
    // Check for vault triggers
    const triggeredFrameworks = checkVaultTriggers(message);
    const vaultContext = generateVaultContext(triggeredFrameworks, vault_loaded);
    
    let eliResponse, roxyResponse;
    
    // Generate responses based on prompt type and user preference
    if (promptType === 'eli' || promptType === 'eli_leads') {
      // Eli leads, Roxy supports
      eliResponse = await generateEliResponse(message, selectedMode, vaultContext, conversation_history);
      roxyResponse = await generateRoxyResponse(message, selectedMode, vaultContext, eliResponse, conversation_history);
    } else if (promptType === 'roxy' || promptType === 'roxy_leads') {
      // Roxy leads, Eli validates
      roxyResponse = await generateRoxyResponse(message, selectedMode, vaultContext, '', conversation_history);
      eliResponse = await generateEliResponse(message + `\n\nRoxy's perspective: ${roxyResponse}\n\nProvide analytical validation:`, selectedMode, vaultContext, conversation_history);
    } else {
      // Balanced - both contribute equally
      eliResponse = await generateEliResponse(message, selectedMode, vaultContext, conversation_history);
      roxyResponse = await generateRoxyResponse(message, selectedMode, vaultContext, eliResponse, conversation_history);
    }

    // Combine responses with proper formatting
    const combinedResponse = `**Eli:** ${eliResponse}\n\n**Roxy:** ${roxyResponse}`;
    
    // Generate system fingerprint
    const vault_status = vault_loaded ? 'SM-VAULT-LOADED' : 'NO-VAULT';
    const triggered_logic = triggeredFrameworks.length > 0 ? triggeredFrameworks.join(', ') : 'NONE';
    const fingerprint = `\n\n*[MODE: ${selectedMode.mode_id}] | [VAULT: ${vault_status}] | [TRIGGERED: ${triggered_logic}] | [FLOW: ${promptType}]*`;
    
    return res.status(200).json({
      response: combinedResponse + fingerprint,
      mode_active: selectedMode.mode_id,
      vault_loaded: vault_loaded,
      triggered_frameworks: triggeredFrameworks,
      conversation_flow: promptType,
      eli_response: eliResponse,
      roxy_response: roxyResponse
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Fallback response that maintains truth-first principles
    const fallbackResponse = `**System:** I encountered an error processing your request. Rather than guess or provide potentially incorrect information, I need to let you know that something went wrong on my end. 

The error was: ${error.message}

Please try your question again, and I'll do my best to provide you with accurate, helpful information.`;

    return res.status(500).json({ 
      response: fallbackResponse,
      error: 'Processing failed',
      fallback_used: true
    });
  }
}
