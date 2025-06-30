import OpenAI from 'openai';
import { MODES } from '/config/modes.js';
import { verifyVaultAccess, generateVaultContext } from '/lib/vault.js';
import { processWithEliAndRoxy } from '/lib/ai-processors.js';
import { runOptimizationEnhancer } from '/lib/optimization.js';
import { checkAssumptionHealth, detectAssumptionConflicts } from '/lib/assumptions.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { 
      message, 
      conversation_history = [], 
      mode = 'business_validation',
      vault_loaded = false,
      user_preference = null
    } = req.body;

    // SECURITY CHECK
    const vaultVerification = await verifyVaultAccess(mode, vault_loaded);
    if (vault_loaded && mode !== 'site_monkeys') {
      return res.status(403).json({
        response: `**System:** Vault access denied. Switch to Site Monkeys mode.`,
        error: 'VAULT_ACCESS_DENIED'
      });
    }

    // PROCESS REQUEST
    const result = await processWithEliAndRoxy({
      message,
      mode,
      vaultVerification,
      conversationHistory: conversation_history,
      userPreference: user_preference,
      openai
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Chat system error:', error);
    return res.status(500).json({
      response: `**System Error:** Technical difficulties. Please try again. Error: ${error.message}`,
      error: 'SYSTEM_ERROR',
      fallback_used: true
    });
  }
}
