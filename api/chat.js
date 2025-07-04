import { processWithEliAndRoxy } from './lib/ai-processors.js';
import { MODES } from './config/modes.js';
import { verifyVaultAccess, generateVaultContext } from './lib/vault.js';
import { runOptimizationEnhancer } from './lib/optimization.js';
import { checkAssumptionHealth, detectAssumptionConflicts } from './lib/assumptions.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      vault_loaded = false,  // FIXED: Use field name frontend expects
      user_preference = null,
      session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } = req.body;

    console.log(`🚀 Processing: ${mode}, vault: ${vault_loaded}, message: ${message.substring(0, 50)}...`);

    // SECURITY CHECK
    const vaultVerification = await verifyVaultAccess(mode, vault_loaded);
    if (vault_loaded && mode !== 'site_monkeys') {
      return res.status(403).json({
        response: "**System:** Vault access denied. Switch to Site Monkeys mode.",
        mode_active: mode,
        vault_loaded: false,
        security_pass: false,
        triggered_frameworks: [],
        assumption_warnings: [],
        fallback_used: false,
        error: 'VAULT_ACCESS_DENIED'
      });
    }

    // PROCESS REQUEST WITH FULL ENFORCEMENT
    const result = await processWithEliAndRoxy({
      message,
      mode,
      vaultVerification,
      conversationHistory: conversation_history || [],
      userPreference: user_preference,
      openai
    });

    // RETURN EXACT STRUCTURE FRONTEND EXPECTS
    return res.status(200).json({
      response: result.response,
      mode_active: result.mode_active,
      vault_loaded: result.vault_loaded,  // FIXED: Field name frontend expects
      security_pass: result.security_pass,
      triggered_frameworks: result.enhancement?.meta_questions || [],  // FIXED: Field name frontend expects  
      assumption_warnings: result.cognitive_integrity?.patterns_detected || [], // FIXED: Field name frontend expects
      fallback_used: result.error ? true : false, // FIXED: Field name frontend expects
      
      // Additional data for debugging (doesn't break frontend)
      cognitive_integrity: result.cognitive_integrity,
      system_report: result.system_report,
      enhancement: result.enhancement,
      performance: result.performance
    });

  } catch (error) {
    console.error('❌ Chat system error:', error);
    
    // RETURN STRUCTURE FRONTEND EXPECTS EVEN ON ERROR
    return res.status(200).json({
      response: `**System Error:** Technical difficulties. Please try again. Error: ${error.message}`,
      mode_active: 'error',
      vault_loaded: false,
      security_pass: false, 
      triggered_frameworks: [],
      assumption_warnings: [],
      fallback_used: true,
      error: 'SYSTEM_ERROR'
    });
  }
}
