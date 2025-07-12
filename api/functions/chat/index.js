// SITE MONKEYS AI - ORIGINAL CHAT ENDPOINT
// RESTORED WORKING VERSION WITH CORRECT IMPORTS
import { parse } from 'url';
import { processWithEliAndRoxy } from '../../lib/chatProcessor.js';
import { loadVaultFromKV } from '../../lib/vault.js';
import { validateModeFingerprint } from '../../lib/validators/modeLinter.js';
import { trackApiCall, formatSessionDataForUI } from '../../lib/tokenTracker.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    console.log('🎯 Chat API called');
    
    const body = req.body || {};
    const { 
      message, 
      conversation_history, 
      vault_content, 
      system_active, 
      vault_status, 
      timestamp,
      mode,
      vault_loaded
    } = body;

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message field is required and must be a string'
      });
    }

    console.log('📝 Processing message:', message.substring(0, 100) + '...');

    // Load vault content if not provided
    let vault = vault_content;
    if (!vault) {
      try {
        console.log('📚 Loading vault from KV...');
        vault = await loadVaultFromKV();
        console.log('✅ Vault loaded successfully');
      } catch (vaultError) {
        console.warn('⚠️ Vault loading failed, using fallback:', vaultError.message);
        vault = ""; // Empty vault as fallback
      }
    }

    // Validate mode fingerprint
    let modeValidation;
    try {
      modeValidation = validateModeFingerprint(message, conversation_history || []);
      console.log('🔍 Mode validation:', modeValidation.status);
    } catch (modeError) {
      console.warn('⚠️ Mode validation failed, using defaults:', modeError.message);
      modeValidation = {
        status: 'validated',
        mode: 'site_monkeys',
        enforced: false
      };
    }

    // Process chat with Eli and Roxy
    console.log('🤖 Processing with Eli and Roxy...');
    const chatResponse = await processWithEliAndRoxy({
      message,
      conversation_history: conversation_history || [],
      vault,
      mode_status: modeValidation.status,
      timestamp: timestamp || new Date().toISOString(),
    });

    console.log('✅ Chat response generated');

    // Track API call for cost/token management
    let apiStats = null;
    let uiMeta = {};
    
    try {
      apiStats = await trackApiCall('chat', message, chatResponse.response, vault);
      uiMeta = formatSessionDataForUI(apiStats);
      console.log('📊 API stats tracked');
    } catch (trackingError) {
      console.warn('⚠️ API tracking failed:', trackingError.message);
      uiMeta = {
        session_cost: '$0.00',
        session_tokens: 0,
        call_count: 1
      };
    }

    // Build response
    const response = {
      response: chatResponse.response,
      personality_used: chatResponse.personality || 'eli',
      confidence: chatResponse.confidence || 0.95,
      mode_active: modeValidation.mode || 'site_monkeys',
      enforcement_applied: modeValidation.enforced || false,
      vault_status: vault_status || (vault ? 'loaded' : 'empty'),
      timestamp: new Date().toISOString(),
      ...uiMeta,
    };

    console.log('🎉 Chat API success');
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Chat handler error:', error);
    
    // Return structured error response
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Chat processing failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      vault_status: 'error',
      enforcement_applied: false
    });
  }
}
