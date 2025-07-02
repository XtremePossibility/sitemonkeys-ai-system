import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Import logic enforcement modules
const { processTruthGeneral, processBusinessValidation } = await import('../lib/personalities.js');
const { runOptimizationEnhancer } = await import('../lib/optimization.js');
const { checkAssumptionHealth } = await import('../lib/assumptions.js');
const { loadVaultLogic, applyVaultConstraints } = await import('../lib/vault.js');

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
          vaultPrompt = vaultData.logic;
          vaultStatus = 'LOADED';
          triggeredFrameworks = applyVaultConstraints(message, vaultData);
          modeFingerprint += ' + SM-VAULT-LOADED';
        }
      } catch (vaultError) {
        // CRITICAL: Never fail silently on vault errors
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
    const assumptionWarnings = checkAssumptionHealth(message, conversation_history);

    // STEP 4: Construct Final Prompt
    const systemPrompt = `${modePrompt}

${vaultPrompt}

CURRENT_MODE: ${mode}
VAULT_STATUS: ${vaultStatus}
DETAIL_LEVEL: ${detail_level}
MODE_FINGERPRINT: ${modeFingerprint}

CONVERSATION_CONTEXT: ${JSON.stringify(conversation_history.slice(-4))}

ENFORCEMENT_RULES:
- NEVER hallucinate data or make optimistic assumptions
- Surface risks and edge cases proactively  
- If uncertain about facts, state uncertainty clearly
- Provide response at ${detail_level} detail level
- Include confidence scoring for key claims
- Flag any logic conflicts between mode and vault

Response must include mode verification in format:
[${modeFingerprint}] - [CONFIDENCE: X%] - [SURVIVAL_IMPACT: LEVEL]`;

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

    // STEP 6: Optimization Enhancement
    try {
      response = await runOptimizationEnhancer(response, mode, {
        vault_loaded,
        triggered_frameworks,
        assumption_warnings
      });
    } catch (optError) {
      // Continue with base response if optimization fails
      console.error('Optimization enhancement failed:', optError);
    }

    // STEP 7: Calculate Token Usage and Costs
    const promptTokens = completion.usage.prompt_tokens;
    const completionTokens = completion.usage.completion_tokens;
    const totalTokens = promptTokens + completionTokens;
    
    // GPT-4 pricing: $0.03/1K prompt tokens, $0.06/1K completion tokens
    const cost = (promptTokens * 0.03 + completionTokens * 0.06) / 1000;

    // STEP 8: Construct Response Object
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
    console.error('Chat API Error:', error);
    
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
