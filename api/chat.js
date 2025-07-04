// BULLETPROOF CHAT.JS - ZERO CRASH GUARANTEE
// Only imports functions that definitely exist

import OpenAI from 'openai';
// ONLY import functions that exist and work
import { processWithEliAndRoxy } from './lib/ai-processors.js';

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
    console.log('🔍 Chat request received:', req.body);
    
    const { 
      message, 
      conversation_history = [], 
      mode = 'business_validation',
      vault_loaded = false,
      user_preference = null
    } = req.body;

    // SIMPLE VAULT VERIFICATION (no external imports)
    const vaultVerification = simpleVaultVerification(mode, vault_loaded);
    
    // Vault security check
    if (vault_loaded && mode !== 'site_monkeys') {
      return res.status(403).json({
        response: "🍌 **System:** Vault access denied. Site Monkeys vault requires Site Monkeys mode.",
        error: 'VAULT_ACCESS_DENIED',
        mode_active: mode,
        vault_loaded: false
      });
    }

    console.log('🎯 Processing with mode:', mode, 'vault:', vaultVerification.allowed);

    // PROCESS REQUEST
    const result = await processWithEliAndRoxy({
      message,
      mode,
      vaultVerification,
      conversationHistory: conversation_history || [],
      userPreference: user_preference,
      openai
    });

    console.log('✅ Response generated successfully');

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Chat system error:', error);
    
    // GUARANTEED SAFE FALLBACK - ALWAYS RETURNS VALID JSON
    return res.status(200).json({
      response: `🍌 **Site Monkeys System:** Technical difficulties detected. Please try again.\n\n🔒 [MODE: ${req.body?.mode?.toUpperCase() || 'UNKNOWN'}] [STATUS: RECOVERY]`,
      error: 'SYSTEM_ERROR',
      fallback_used: true,
      mode_active: req.body?.mode || 'unknown',
      vault_loaded: false,
      ai_used: 'System',
      confidence: 0,
      security_pass: false,
      system_status: 'recovery',
      error_details: error.message
    });
  }
}

// SIMPLE VAULT VERIFICATION (no external dependencies)
function simpleVaultVerification(mode, vault_requested) {
  const verification = {
    allowed: false,
    reason: "",
    vault_loaded: false,
    compatibility_check: false
  };
  
  // Only allow vault access in Site Monkeys mode
  if (mode === 'site_monkeys' && vault_requested) {
    verification.allowed = true;
    verification.vault_loaded = true;
    verification.compatibility_check = true;
    verification.reason = "Site Monkeys mode with vault access approved";
  } else if (mode !== 'site_monkeys' && vault_requested) {
    verification.allowed = false;
    verification.reason = "Vault access denied - must be in Site Monkeys mode";
  } else {
    verification.allowed = true;
    verification.reason = "Standard mode operation without vault";
  }
  
  return verification;
}
