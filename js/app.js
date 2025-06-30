// Global variables for working functionality
let conversationHistory = [];
let systemActive = false;
let aiToggle = false;

// Mode system
let currentMode = 'business_validation';

function switchMode(mode) {
  currentMode = mode;
  console.log(`🔄 Switched to mode: ${mode}`);
  
  // Update button states
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Set active button
  const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

function getCurrentMode() {
  return currentMode;
}

function isVaultMode() {
  return currentMode === 'site_monkeys';
}

// Animation code
const statusItems = document.querySelectorAll('#status-list li');
const systemReady = document.getElementById('system-ready');
let statusIndex = 0;

function loadStatus() {
console.log('🎯 loadStatus function called');
if (statusIndex < statusItems.length) {
statusItems[statusIndex].classList.add('loaded');
statusIndex++;
setTimeout(loadStatus, 400);
} else {
setTimeout(() => {
console.log('✅ Status animation complete, system ready immediately');
systemReady.classList.add('active');
systemActive = true;
console.log('✅ System active - using KV cache');
checkVaultStatus();
}, 500);
}
}

// Check vault status and update display
async function checkVaultStatus() {
try {
console.log('📖 Checking vault status...');
const response = await fetch('/api/load-vault', {
method: 'GET',
headers: { 'Content-Type': 'application/json' }
});

const data = await response.json();
console.log('📊 Vault status:', data);

if (data.status === 'success' && !data.needs_refresh) {
document.getElementById('vault-info').innerHTML = `
<div><span style="color:#00FF00;">✅</span> VAULT READY (CACHED)</div>
<div>🔢 <span id="token-count">${data.tokens || 'Ready'}</span> TOKENS</div>
<div>💰 EST. COST: <span id="cost-estimate">${data.estimated_cost || '$0.00'}</span></div>
<div>📁 <span id="vault-folders">${data.folders_loaded?.length || 'Cached'}</span> FOLDERS LOADED</div>
<button id="refresh-vault-btn" onclick="refreshVault()" style="background: #FFD811; color: #373534; border: 1px solid #fff; border-radius: 8px; padding: 8px 12px; font-size: 0.8em; font-weight: bold; cursor: pointer; margin-top: 8px; width: 100%; transition: all 0.2s ease;" onmouseover="this.style.background='#ffe96a'" onmouseout="this.style.background='#FFD811'">🔄 Refresh Vault</button>`;
} else {
document.getElementById('vault-info').innerHTML = `
<div><span style="color:#FFA500;">⚠️</span> VAULT NEEDS REFRESH</div>
<div>🔢 <span id="token-count">No Data</span> TOKENS</div>
<div>💰 EST. COST: <span id="cost-estimate">$0.00</span></div>
<div>📁 <span id="vault-folders">0</span> FOLDERS LOADED</div>
<button id="refresh-vault-btn" onclick="refreshVault()" style="background: #FF6B6B; color: white; border: 1px solid #fff; border-radius: 8px; padding: 8px 12px; font-size: 0.8em; font-weight: bold; cursor: pointer; margin-top: 8px; width: 100%; transition: all 0.2s ease;" onmouseover="this.style.background='#ff8a8a'" onmouseout="this.style.background='#FF6B6B'">🔄 REFRESH VAULT NOW</button>`;
}
} catch (error) {
console.error('❌ Vault status check failed:', error);
}
}

// Refresh vault function
async function refreshVault() {
try {
console.log('🔄 Refreshing vault...');
const button = document.getElementById('refresh-vault-btn');
const originalText = button.innerHTML;
button.innerHTML = '⏳ Refreshing...';
button.disabled = true;

const response = await fetch('/api/load-vault?refresh=true', {
method: 'GET',
headers: { 'Content-Type': 'application/json' }
});

const data = await response.json();
console.log('📊 Vault refresh result:', data);

if (data.status === 'refreshed') {
document.getElementById('vault-info').innerHTML = `
<div><span style="color:#00FF00;">✅</span> VAULT REFRESHED</div>
<div>🔢 <span id="token-count">${data.tokens || 'Ready'}</span> TOKENS</div>
<div>💰 EST. COST: <span id="cost-estimate">${data.estimated_cost || '$0.00'}</span></div>
<div>📁 <span id="vault-folders">${data.folders_loaded?.length || 0}</span> FOLDERS LOADED</div>
<button id="refresh-vault-btn" onclick="refreshVault()" style="background: #FFD811; color: #373534; border: 1px solid #fff; border-radius: 8px; padding: 8px 12px; font-size: 0.8em; font-weight: bold; cursor: pointer; margin-top: 8px; width: 100%; transition: all 0.2s ease;" onmouseover="this.style.background='#ffe96a'" onmouseout="this.style.background='#FFD811'">🔄 Refresh Vault</button>`;
} else {
button.innerHTML = '❌ Refresh Failed';
button.disabled = false;
setTimeout(() => { button.innerHTML = originalText; }, 3000);
}
} catch (error) {
console.error('❌ Vault refresh failed:', error);
const button = document.getElementById('refresh-vault-btn');
button.innerHTML = '❌ Refresh Failed';
button.disabled = false;
setTimeout(() => { button.innerHTML = '🔄 Refresh Vault'; }, 3000);
}
}

// ENHANCED Chat functionality with mode verification and truth enforcement
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
    // Send message with mode verification and vault security
    const requestPayload = {
      message: text,
      conversation_history: conversationHistory,
      mode: getCurrentMode(),
      vault_loaded: isVaultMode(),
      verify_mode: true,
      timestamp: new Date().toISOString()
    };

    console.log('🚀 Sending request:', {
      mode: requestPayload.mode,
      vault_requested: requestPayload.vault_loaded,
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

    // EXTRACT system verification info BEFORE cleaning
    const systemVerification = {
      mode_used: data.mode_active || 'UNKNOWN',
      vault_status: data.vault_loaded ? 'LOADED' : 'NOT_LOADED',
      triggered_frameworks: data.triggered_frameworks || [],
      assumption_warnings: data.assumption_warnings || [],
      security_pass: data.security_pass || false,
      fallback_used: data.fallback_used || false
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
                         getCurrentMode() === 'site_monkeys' ? '🐒' : '🤖';
    
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

// Debug mode toggle for system transparency
function toggleDebugMode() {
  const currentMode = localStorage.getItem('sitemonkeys_debug') === 'true';
  const newMode = !currentMode;
  localStorage.setItem('sitemonkeys_debug', newMode.toString());
  
  console.log(`🔧 Debug mode ${newMode ? 'ENABLED' : 'DISABLED'}`);
  
  if (newMode) {
    console.log('🔍 You will now see system verification data in responses');
    console.log('💡 Type toggleDebugMode() again to disable');
  }
  
  return `Debug mode ${newMode ? 'enabled' : 'disabled'}. ${newMode ? 'System data will show in responses.' : 'Clean responses restored.'}`;
}

// Make debug function globally available
window.toggleDebugMode = toggleDebugMode;

// File upload functionality
async function handleFileUpload(files) {
if (files.length === 0) return;
const box = document.getElementById('chat-box');

// Show upload message
const uploadBubble = document.createElement('div');
uploadBubble.className = 'bubble ai';
uploadBubble.innerHTML = `<img src="boy-mascot.png" class="avatar" alt="System"><div class="bubble-content"><strong>System:</strong> 📤 Uploading ${files.length} file(s) to vault...</div>`;
box.appendChild(uploadBubble);
box.scrollTop = box.scrollHeight;

try {
const formData = new FormData();
for (const file of files) { formData.append('files', file); }

const response = await fetch('/api/upload-file', { method: 'POST', body: formData });
const result = await response.json();

if (result.status === 'success' && result.successful_uploads > 0) {
for (const fileInfo of result.files) {
if (fileInfo.success) {
const successBubble = document.createElement('div');
successBubble.className = 'bubble ai';
successBubble.innerHTML = `<img src="girl-mascot.png" class="avatar" alt="Roxy"><div class="bubble-content"><strong>Roxy:</strong> ✅ Uploaded "${fileInfo.filename}" to ${fileInfo.folder} folder. File is now available for chat!</div>`;
box.appendChild(successBubble);
box.scrollTop = box.scrollHeight;
} else {
const errorBubble = document.createElement('div');
errorBubble.className = 'bubble ai';
errorBubble.innerHTML = `<img src="boy-mascot.png" class="avatar" alt="System"><div class="bubble-content"><strong>System:</strong> ❌ Failed to upload "${fileInfo.filename}": ${fileInfo.message}</div>`;
box.appendChild(errorBubble);
box.scrollTop = box.scrollHeight;
}
}
} else {
const errorBubble = document.createElement('div');
errorBubble.className = 'bubble ai';
errorBubble.innerHTML = `<img src="boy-mascot.png" class="avatar" alt="System"><div class="bubble-content"><strong>System:</strong> ❌ Upload failed: ${result.message}</div>`;
box.appendChild(errorBubble);
box.scrollTop = box.scrollHeight;
}
} catch (error) {
const errorBubble = document.createElement('div');
errorBubble.className = 'bubble ai';
errorBubble.innerHTML = `<img src="boy-mascot.png" class="avatar" alt="System"><div class="bubble-content"><strong>System:</strong> ❌ Upload failed: ${error.message}</div>`;
box.appendChild(errorBubble);
box.scrollTop = box.scrollHeight;
}
}

document.addEventListener('DOMContentLoaded', function() {
console.log('🚀 DOM LOADED - JavaScript is working!');
console.log('💡 Type toggleDebugMode() in console to see system verification data');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Mode toggle listeners
const modeButtons = document.querySelectorAll('.mode-btn');
modeButtons.forEach(button => {
  button.addEventListener('click', function() {
    const selectedMode = this.getAttribute('data-mode');
    switchMode(selectedMode);
  });
});

input.addEventListener('keydown', function(e) {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
sendMessage();
}
});

sendBtn.addEventListener('click', function(e) {
e.preventDefault();
sendMessage();
});

// Upload button functionality
const attachmentBtn = document.getElementById('attachment-btn');
const fileInput = document.getElementById('file-input');

attachmentBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
if (e.target.files.length > 0) handleFileUpload(Array.from(e.target.files));
});

console.log('🎯 Event listeners added');
setTimeout(() => {
console.log('⏰ Starting status animation...');
loadStatus();
}, 800);
});

// Error handling for missing images
document.addEventListener('DOMContentLoaded', function() {
const images = document.querySelectorAll('img');
images.forEach(img => {
img.onerror = function() {
console.warn(`Image failed to load: ${this.src}`);
this.style.display = 'none';
};
});
});
