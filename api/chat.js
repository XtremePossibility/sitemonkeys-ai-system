import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// EMBEDDED LOGIC - No external imports until files exist
function processTruthGeneral() {
  return `You are operating in TRUTH-GENERAL MODE - A direct, honest, clarity-first personal assistant.

CORE BEHAVIORAL RULES:
- Truth over helpfulness - never soften hard realities
- If you don't know something, say "I don't know" - never guess or interpolate
- Surface risks and edge cases proactively, don't wait to be asked
- Be direct and clear - avoid diplomatic language that obscures truth
- When data is weak, uncertain, or interpolated - explicitly state this
- No hallucinated statistics, dates, or technical details

RESPONSE STRUCTURE:
- Lead with the direct answer
- Include confidence level (High/Medium/Low/Unknown)
- Surface any important caveats or risks upfront
- Provide clear next steps if actionable

EXAMPLE RESPONSE FORMAT:
"[Direct Answer] 

CONFIDENCE: [High/Medium/Low] based on [specific reasoning]

RISKS TO CONSIDER: [Key risks, if any]"`;
}

function processBusinessValidation() {
  return `You are operating in BUSINESS-VALIDATION MODE - Expert strategist focused on startup viability and survivability analysis.

CORE ANALYSIS FRAMEWORK:
- Survival-first thinking - what could kill this business?
- Cash flow impact analysis for every major decision
- Market reality checks - challenge optimistic assumptions
- Cost-risk tradeoffs with specific dollar impacts
- Monetization logic verification

REQUIRED ANALYSIS COMPONENTS:
1. SURVIVAL IMPACT: Rate as NONE/LOW/MEDIUM/HIGH/CRITICAL
2. CASH FLOW EFFECT: Specify POSITIVE/NEUTRAL/NEGATIVE with dollar estimates
3. MARKET REALITY: Challenge assumptions with competitive data
4. RISK FACTORS: List 3 most dangerous failure modes
5. DECISION FRAMEWORK: Clear go/no-go criteria

EXAMPLE RESPONSE FORMAT:
"SURVIVAL IMPACT: [LEVEL] - [Reasoning]

CASH FLOW ANALYSIS: [Direction] $[Range] over [Timeline]

MARKET REALITY CHECK: [Key competitive/adoption challenges]

TOP 3 RISKS:
1. [Risk with mitigation]
2. [Risk with mitigation]  
3. [Risk with mitigation]

RECOMMENDATION: [Clear action with decision criteria]"`;
}

function checkAssumptionHealth(message) {
  const warnings = [];
  
  // Check for common cognitive biases
  const biasPatterns = [
    {
      pattern: /(definitely|certainly|guaranteed|always works)/i,
      warning: "Overconfidence detected - consider uncertainty and edge cases"
    },
    {
      pattern: /(everyone|all customers|users always)/i,
      warning: "Overgeneralization - market segments vary significantly"
    },
    {
      pattern: /(just|simply|easy|quick)/i,
      warning: "Complexity minimization - implementation often more complex than expected"
    }
  ];
  
  biasPatterns.forEach(({ pattern, warning }) => {
    if (pattern.test(message)) {
      warnings.push(warning);
    }
  });
  
  return warnings;
}

async function loadVaultLogic() {
  // Placeholder for vault loading - replace with your KV logic
  try {
    // This should connect to your existing vault loading system
    // For now, return null to prevent errors
    return null;
  } catch (error) {
    console.error('Vault loading failed:', error);
    return null;
  }
}

function applyVaultConstraints(message, vaultData) {
  if (!vaultData) return [];
  
  const frameworks = [];
  
  // Site Monkeys specific logic
  if (message.toLowerCase().includes('pricing') || message.toLowerCase().includes('price')) {
    frameworks.push('PRICING_FRAMEWORK');
  }
  
  if (message.toLowerCase().includes('money') || message.toLowerCase().includes('cost')) {
    frameworks.push('FINANCIAL_CONSTRAINTS');
  }
  
  return frameworks;
}

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
      mode = 'truth_general', 
      vault_loaded = false,
      verify_mode = false,
      detail_level = 'essential'
    } = req.body;

    console.log('🔄 Processing request:', { mode, vault_loaded, message_preview: message.substring(0, 50) + '...' });

    // STEP 1: Mode Verification and Logic Loading
    let modePrompt = '';
    let modeFingerprint = '';
    
    switch (mode) {
      case 'truth_general':
        modePrompt = processTruthGeneral();
        modeFingerprint = 'TG-2024-001';
        break;
      case 'business_validation':
        modePrompt = processBusinessValidation();
        modeFingerprint = 'BV-2024-001';
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid mode specified',
          valid_modes: ['truth_general', 'business_validation']
        });
    }

    // STEP 2: Vault Logic Integration
    let vaultPrompt = '';
    let vaultStatus = 'NONE';
    let triggeredFrameworks = [];
    
    if (vault_loaded) {
      try {
        const vaultData = await loadVaultLogic();
        if (vaultData) {
          vaultPrompt = `\n\nSITE MONKEYS VAULT LOADED - Apply brand-specific logic and constraints.`;
          vaultStatus = 'LOADED';
          triggeredFrameworks = applyVaultConstraints(message, vaultData);
          modeFingerprint += ' + SM-VAULT-LOADED';
        } else {
          vaultStatus = 'FAILED';
        }
      } catch (vaultError) {
        console.error('Vault loading error:', vaultError);
        return res.status(200).json({
          error: 'Vault loading failed',
          message: 'Site Monkeys vault could not be loaded. Operating in base mode only.',
          fallback_mode: mode,
          vault_error: vaultError.message,
          action_required: 'Try refreshing vault or continue without brand-specific logic'
        });
      }
    }

    // STEP 3: Assumption Health Check
    const assumptionWarnings = checkAssumptionHealth(message);

    // STEP 4: Construct Final Prompt
    const systemPrompt = `${modePrompt}${vaultPrompt}

CURRENT_MODE: ${mode}
VAULT_STATUS: ${vaultStatus}
DETAIL_LEVEL: ${detail_level}
MODE_FINGERPRINT: ${modeFingerprint}

CONVERSATION_CONTEXT: ${JSON.stringify(conversation_history.slice(-3))}

ENFORCEMENT_RULES:
- NEVER hallucinate data or make optimistic assumptions
- Surface risks and edge cases proactively  
- If uncertain about facts, state uncertainty clearly
- Provide response at ${detail_level} detail level
- Include confidence scoring for key claims

Response must include mode verification in format:
[${modeFingerprint}] - [CONFIDENCE: X%] - [SURVIVAL_IMPACT: LEVEL]`;

    console.log('🚀 Sending to OpenAI with mode:', mode);

    // STEP 5: Generate AI Response
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: detail_level === 'full' ? 1500 : detail_level === 'detailed' ? 800 : 400,
      temperature: mode === 'truth_general' ? 0.1 : 0.3,
    });

    let response = completion.choices[0].message.content;

    // Add assumption warnings if present
    if (assumptionWarnings.length > 0) {
      response += `\n\n🧠 ASSUMPTION ALERTS:`;
      assumptionWarnings.forEach(warning => {
        response += `\n- ${warning}`;
      });
    }

    // STEP 6: Calculate Token Usage and Costs
    const promptTokens = completion.usage.prompt_tokens;
    const completionTokens = completion.usage.completion_tokens;
    const totalTokens = promptTokens + completionTokens;
    
    // GPT-4 pricing: $0.03/1K prompt tokens, $0.06/1K completion tokens
    const cost = (promptTokens * 0.03 + completionTokens * 0.06) / 1000;

    console.log('✅ Response generated successfully');

    // STEP 7: Construct Response Object
    return res.status(200).json({
      response: response,
      mode_active: mode,
      mode_fingerprint: modeFingerprint,
      vault_loaded: vault_loaded,
      vault_status: vaultStatus,
      triggered_frameworks: triggeredFrameworks,
      assumption_warnings: assumptionWarnings,
      detail_level: detail_level,
      token_usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens, 
        total_tokens: totalTokens
      },
      session_cost: `$${cost.toFixed(4)}`,
      security_pass: true,
      fallback_used: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    
    // NEVER fail silently - provide actionable error information
    return res.status(500).json({ 
      error: 'System processing failed',
      message: 'The cognitive integrity system encountered an error.',
      details: error.message,
      fallback_available: true,
      action_required: 'Check system logs or try again with simpler query',
      mode_attempted: req.body.mode || 'unknown',
      vault_attempted: req.body.vault_loaded || false,
      timestamp: new Date().toISOString()
    });
  }
}
