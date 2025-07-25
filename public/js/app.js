// FORCE VAULT LOADING ON PAGE LOAD
let vaultLoaded = false;

async function loadVaultOnce() {
  if (vaultLoaded) return;
  
  console.log('🔄 Loading vault on page startup...');
  
  try {
    const vaultResponse = await fetch('/api/load-vault?refresh=true');
    const vaultData = await vaultResponse.json();
    const vaultContent = vaultData.vault_content || '';
    
    window.currentVaultContent = vaultContent;
    window.vaultStatus = {
      loaded: vaultContent.length > 1000,
      healthy: vaultData.vault_status === 'operational',
      tokens: vaultData.tokens || 0
    };
    
    vaultLoaded = true;
    console.log('✅ Vault loaded on startup with length:', vaultContent.length);
  } catch (error) {
    console.error('❌ Failed to load vault on startup:', error);
  }
}

// FORCE LOAD IMMEDIATELY
loadVaultOnce();

// ALSO TRY ON DOM READY
document.addEventListener('DOMContentLoaded', loadVaultOnce);

// ALSO TRY ON WINDOW LOAD
window.addEventListener('load', loadVaultOnce);
// REFRESH VAULT BUTTON HANDLER
async function improvedRefreshVault() {
  console.log('🔄 Refresh vault button clicked...');
  try {
    const response = await fetch('/api/load-vault?refresh=true');
    const data = await response.json();
    
    // CACHE THE VAULT CONTENT FOR CHAT
    window.currentVaultContent = data.vault_content || '';
    window.vaultStatus = {
      loaded: true,
      healthy: data.vault_status === 'operational',
      tokens: data.tokens || 0
    };
    
    console.log('✅ Vault refreshed and cached:', window.currentVaultContent.length);
  } catch (error) {
    console.error('❌ Vault refresh failed:', error);
  }
}

// Override the global function
window.refreshVault = improvedRefreshVault;
async function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text || !systemActive) return;

  const box = document.getElementById('chat-box');

  // Add user message
  const userBubble = document.createElement('div');
  userBubble.className = 'bubble user';
  userBubble.innerHTML = `<div class="bubble-content"><strong>You:</strong> ${text}</div>`;
  box.appendChild(userBubble);
  box.scrollTop = box.scrollHeight;
  input.value = '';

  // Add thinking indicator
  const thinkingBubble = document.createElement('div');
  thinkingBubble.className = 'bubble ai thinking-bubble';
  thinkingBubble.innerHTML = `<img src="boy-mascot.png" class="avatar" alt="Thinking"><div class="bubble-content thinking-content"><span class="thinking-brain">🧠</span> Thinking...</div>`;
  box.appendChild(thinkingBubble);
  box.scrollTop = box.scrollHeight;

  try {
    
// ENSURE VAULT IS LOADED
const vaultContent = window.currentVaultContent || '';
console.log('🔍 Using cached vault with length:', vaultContent.length);

const requestPayload = {
  message: text,
  conversation_history: conversationHistory,
  mode: getCurrentMode(),
  vault_content: vaultContent,
  session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
};

console.log('🔍 Using vault with length:', vaultContent.length);

    console.log('🚀 Sending request:', {
      mode: requestPayload.mode,
      vault_content_length: vaultContent.length,
      message_preview: text.substring(0, 50) + '...'
    });

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    let reply = data.response || 'No response received';

    // FIXED SYSTEM VERIFICATION - MATCHES BACKEND RESPONSE STRUCTURE
    const systemVerification = {
      mode_used: data.mode_active || 'UNKNOWN',
      vault_status: data.vault_status?.loaded ? 'LOADED' : 'NOT_LOADED',
      triggered_frameworks: data.enforcement_applied || [],
      assumption_warnings: data.assumption_analysis?.detected || [],
      security_pass: data.security_pass || false,
      fallback_used: data.performance?.api_error?.fallback_used || false
    };

    // LOG system status for debugging
    console.log('🔍 SYSTEM VERIFICATION:', systemVerification);
    
    // Check for system integrity issues
    if (systemVerification.fallback_used) {
      console.warn('⚠️ Fallback response used - system may be under stress');
    }
    
    if (!systemVerification.security_pass && isVaultMode()) {
      console.error('🚨 Security check failed for vault access');
    }

    // Show debug info in development mode
    const showDebugInfo = localStorage.getItem('sitemonkeys_debug') === 'true';
    if (showDebugInfo) {
      reply += `\n\n🔍 [DEBUG] Mode: ${systemVerification.mode_used} | Vault: ${systemVerification.vault_status} | Security: ${systemVerification.security_pass ? 'PASS' : 'FAIL'}`;
      if (systemVerification.triggered_frameworks.length > 0) {
        reply += ` | Triggered: ${systemVerification.triggered_frameworks.join(', ')}`;
      }
    }

    // Clean response for user display while preserving verification data
    let cleanReply = reply
      .replace(/^\*?\*?(Eli|Roxy):\*?\*?\s*/i, '')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*\[MODE:.*?\]/g, '')
      .replace(/\[MODE:.*?\]/g, '')
      .replace(/\|\s*\[VAULT:.*?\]\s*\|\s*\[TRIGGERED:.*?\]\s*\|\s*\[FLOW:.*?\]\s*\|\s*\[ASSUMPTIONS:.*?\]\*/g, '')
      .replace(/\[VAULT:.*?\]/g, '')
      .replace(/\[TRIGGERED:.*?\]/g, '')
      .replace(/\[FLOW:.*?\]/g, '')
      .replace(/\[ASSUMPTIONS:.*?\]/g, '')
      .trim();

    // Remove thinking indicator
    const thinkingElement = document.querySelector('.thinking-bubble');
    if (thinkingElement) {
      thinkingElement.remove();
    }

    // Determine speaker based on response content or alternation
    const isEli = aiToggle;
    const who = isEli ? 'Eli' : 'Roxy';
    const avatar = isEli ? "boy-mascot.png" : "girl-mascot.png";

    // Add response with truth-focused styling
    const responseBubble = document.createElement('div');
    responseBubble.className = 'bubble ai';
    
    // Add subtle mode indicator to response
    const modeIndicator = getCurrentMode() === 'truth_general' ? '🔍' : 
                         getCurrentMode() === 'business_validation' ? '📊' : 
                         getCurrentMode() === 'site_monkeys' ? '🍌' : '🤖';
    
    responseBubble.innerHTML = `<img src="${avatar}" class="avatar" alt="${who}"><div class="bubble-content"><strong>${who} ${modeIndicator}:</strong> ${cleanReply}</div>`;
    box.appendChild(responseBubble);
    box.scrollTop = box.scrollHeight;

    // Store complete conversation with system metadata
    conversationHistory.push({ 
      role: 'user', 
      content: text,
      timestamp: new Date().toISOString(),
      mode_requested: getCurrentMode()
    });
    
    conversationHistory.push({ 
      role: 'assistant', 
      content: reply,
      clean_content: cleanReply,
      system_verification: systemVerification,
      timestamp: new Date().toISOString(),
      speaker: who
    });

    // Limit conversation history to prevent token bloat
    if (conversationHistory.length > 12) {
      conversationHistory = conversationHistory.slice(-12);
    }

    // Toggle speaker for next message
    aiToggle = !aiToggle;

    // Show assumption warnings if any
    if (systemVerification.assumption_warnings.length > 0) {
      setTimeout(() => {
        const warningBubble = document.createElement('div');
        warningBubble.className = 'bubble ai';
        warningBubble.innerHTML = `<img src="boy-mascot.png" class="avatar" alt="System"><div class="bubble-content"><strong>System:</strong> ⚠️ Assumption health alert: ${systemVerification.assumption_warnings.length} item(s) need attention. Enable debug mode to see details.</div>`;
        box.appendChild(warningBubble);
        box.scrollTop = box.scrollHeight;
      }, 1000);
    }

  } catch (error) {
    console.error('❌ Chat system error:', error);
    
    // Remove thinking indicator on error
    const thinkingElement = document.querySelector('.thinking-bubble');
    if (thinkingElement) {
      thinkingElement.remove();
    }

    // Honest error message (following truth-first principles)
    const errorBubble = document.createElement('div');
    errorBubble.className = 'bubble ai';
    errorBubble.innerHTML = `<img src="boy-mascot.png" class="avatar" alt="System"><div class="bubble-content"><strong>System:</strong> I encountered a technical error and I won't pretend it didn't happen. Error: ${error.message}. I'd rather be honest about system issues than give you unreliable information. Please try again.</div>`;
    box.appendChild(errorBubble);
    box.scrollTop = box.scrollHeight;
  }
}
