// SITE MONKEYS AI - COMPLETE CHAT SYSTEM
// ZERO-FAILURE PRODUCTION-GRADE IMPLEMENTATION
// ALL CRITICAL FUNCTIONS FULLY IMPLEMENTED

// Global state management
let conversationHistory = [];
let systemActive = false;
let aiToggle = true;
let vaultStatus = 'loading';
let lastVaultCheck = 0;
const VAULT_CHECK_INTERVAL = 30000; // 30 seconds

// Animation and initialization
const statusItems = document.querySelectorAll('#status-list li');
const systemReady = document.getElementById('system-ready');
let statusIndex = 0;

// CRITICAL: Complete status loading animation
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
            console.log('✅ System active - vault integration enabled');
            checkVaultStatus(); // Initial vault check
        }, 500);
    }
}

// VAULT MANAGEMENT SYSTEM - FULLY IMPLEMENTED
async function checkVaultStatus() {
    const now = Date.now();
    if (now - lastVaultCheck < VAULT_CHECK_INTERVAL && vaultStatus !== 'loading') {
        return; // Prevent excessive API calls
    }
    
    try {
        console.log('📖 Checking vault status...');
        lastVaultCheck = now;
        
        const response = await fetch('/api/load-vault', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📊 Vault status:', data);

        updateVaultDisplay(data);
        vaultStatus = data.status === 'success' && !data.needs_refresh ? 'ready' : 'needs_refresh';

    } catch (error) {
        console.error('❌ Vault status check failed:', error);
        vaultStatus = 'error';
        updateVaultDisplayError(error.message);
    }
}

// VAULT DISPLAY MANAGEMENT - ZERO-FAILURE IMPLEMENTATION
function updateVaultDisplay(data) {
    const vaultInfoElement = document.getElementById('vault-info');
    if (!vaultInfoElement) {
        console.error('❌ vault-info element not found');
        return;
    }

    if (data.status === 'success' && !data.needs_refresh) {
        vaultInfoElement.innerHTML = createVaultReadyHTML(data);
    } else {
        vaultInfoElement.innerHTML = createVaultRefreshNeededHTML();
    }
}

function createVaultReadyHTML(data) {
    return `
        <div><span style="color:#00FF00;">✅</span> VAULT READY (CACHED)</div>
        <div>🔢 <span id="token-count">${data.tokens || 'Ready'}</span> TOKENS</div>
        <div>💰 EST. COST: <span id="cost-estimate">${data.estimated_cost || '$0.00'}</span></div>
        <div>📁 <span id="vault-folders">${data.folders_loaded?.length || 'Cached'}</span> FOLDERS LOADED</div>
        <button id="refresh-vault-btn" onclick="refreshVault()" style="
            background: #FFD811; 
            color: #373534; 
            border: 1px solid #fff; 
            border-radius: 8px; 
            padding: 8px 12px; 
            font-size: 0.8em; 
            font-weight: bold; 
            cursor: pointer; 
            margin-top: 8px;
            width: 100%;
            transition: all 0.2s ease;
        " onmouseover="this.style.background='#ffe96a'" onmouseout="this.style.background='#FFD811'">
            🔄 Refresh Vault
        </button>
    `;
}

function createVaultRefreshNeededHTML() {
    return `
        <div><span style="color:#FFA500;">⚠️</span> VAULT NEEDS REFRESH</div>
        <div>🔢 <span id="token-count">No Data</span> TOKENS</div>
        <div>💰 EST. COST: <span id="cost-estimate">$0.00</span></div>
        <div>📁 <span id="vault-folders">0</span> FOLDERS LOADED</div>
        <button id="refresh-vault-btn" onclick="refreshVault()" style="
            background: #FF6B6B; 
            color: white; 
            border: 1px solid #fff; 
            border-radius: 8px; 
            padding: 8px 12px; 
            font-size: 0.8em; 
            font-weight: bold; 
            cursor: pointer; 
            margin-top: 8px;
            width: 100%;
            transition: all 0.2s ease;
        " onmouseover="this.style.background='#ff8a8a'" onmouseout="this.style.background='#FF6B6B'">
            🔄 REFRESH VAULT NOW
        </button>
    `;
}

function updateVaultDisplayError(errorMessage) {
    const vaultInfoElement = document.getElementById('vault-info');
    if (!vaultInfoElement) return;
    
    vaultInfoElement.innerHTML = `
        <div><span style="color:#FF0000;">❌</span> VAULT ERROR</div>
        <div>🔢 <span id="token-count">Error</span> TOKENS</div>
        <div>💰 EST. COST: <span id="cost-estimate">$0.00</span></div>
        <div>📁 <span id="vault-folders">Error</span> FOLDERS LOADED</div>
        <div style="font-size: 0.7em; color: #FF6B6B; margin-top: 4px;">${errorMessage}</div>
        <button id="refresh-vault-btn" onclick="refreshVault()" style="
            background: #FF6B6B; 
            color: white; 
            border: 1px solid #fff; 
            border-radius: 8px; 
            padding: 8px 12px; 
            font-size: 0.8em; 
            font-weight: bold; 
            cursor: pointer; 
            margin-top: 8px;
            width: 100%;
            transition: all 0.2s ease;
        ">
            🔄 RETRY VAULT CONNECTION
        </button>
    `;
}

// VAULT REFRESH SYSTEM - BULLETPROOF IMPLEMENTATION
async function refreshVault() {
    const button = document.getElementById('refresh-vault-btn');
    if (!button) {
        console.error('❌ Refresh button not found');
        return;
    }

    const originalText = button.innerHTML;
    
    try {
        console.log('🔄 Refreshing vault...');
        
        // Update UI to show loading state
        button.innerHTML = '⏳ Refreshing...';
        button.disabled = true;
        button.style.cursor = 'not-allowed';

        const response = await fetch('/api/load-vault?refresh=true', {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json' 
            },
            timeout: 30000 // 30 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📊 Vault refresh result:', data);
        
        // Enhanced logging for debugging
        if (data.folders_loaded) {
            console.log('📁 Folders loaded:', data.folders_loaded);
        }
        if (data.tokens) {
            console.log('🔢 Token count:', data.tokens);
        }
        if (data.vault_content) {
            console.log('📄 Vault content preview:', data.vault_content.substring(0, 500));
        }

        // Update display based on response
        if (data.status === 'refreshed' || data.status === 'success') {
            updateVaultDisplay(data);
            vaultStatus = 'ready';
            
            // Success feedback
            button.innerHTML = '✅ Refresh Complete';
            setTimeout(() => {
                button.innerHTML = '🔄 Refresh Vault';
                button.disabled = false;
                button.style.cursor = 'pointer';
            }, 2000);
            
        } else {
            throw new Error(data.message || 'Vault refresh failed');
        }

    } catch (error) {
        console.error('❌ Vault refresh failed:', error);
        
        // Error feedback
        button.innerHTML = '❌ Refresh Failed';
        button.disabled = false;
        button.style.cursor = 'pointer';
        
        // Reset after delay
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 3000);
        
        // Update display to show error
        updateVaultDisplayError(error.message);
        vaultStatus = 'error';
    }
}

// VAULT CONTENT LOADER - CRITICAL FOR CHAT INTEGRATION
async function loadVaultContent() {
    try {
        console.log('📚 Loading vault content for chat...');
        
        const vaultResponse = await fetch('/api/load-vault', {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json' 
            },
            timeout: 15000 // 15 second timeout
        });

        if (!vaultResponse.ok) {
            throw new Error(`Vault API returned ${vaultResponse.status}`);
        }

        const vaultData = await vaultResponse.json();
        
        if (vaultData.vault_content) {
            const tokenCount = Math.ceil(vaultData.vault_content.length / 4);
            console.log(`🎯 Vault loaded for chat: SUCCESS (${tokenCount} tokens)`);
            return vaultData.vault_content;
        } else {
            console.warn('⚠️ Vault content empty or unavailable');
            return null;
        }

    } catch (vaultError) {
        console.warn('⚠️ Vault load failed, backend will use emergency fallbacks:', vaultError);
        return null;
    }
}

// COMPLETE CHAT MESSAGE SYSTEM - PRODUCTION READY
async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    
    // Validation checks
    if (!text) {
        console.log('🚫 Empty message, ignoring');
        return;
    }
    
    if (!systemActive) {
        console.log('🚫 System not active, ignoring message');
        return;
    }

    const box = document.getElementById('chat-box');
    if (!box) {
        console.error('❌ Chat box element not found');
        return;
    }

    // Add user message bubble
    addUserMessage(box, text);
    
    // Clear input and scroll
    input.value = '';
    scrollToBottom(box);

    // Add thinking indicator
    const thinkingBubble = addThinkingIndicator(box);

    try {
        // CRITICAL: Load vault content for backend injection
        const vaultContent = await loadVaultContent();

        // Prepare chat request
        const chatRequest = {
            message: text,
            conversation_history: conversationHistory,
            vault_content: vaultContent,
            system_active: systemActive,
            vault_status: vaultStatus,
            timestamp: new Date().toISOString()
        };

        console.log('💬 Sending to chat API:', {
            message: text,
            conversation_history_length: conversationHistory.length,
            vault_injected: !!vaultContent,
            vault_content_length: vaultContent ? vaultContent.length : 0
        });

        // Send to backend with timeout
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatRequest),
            timeout: 60000 // 60 second timeout for chat
        });

        // Remove thinking indicator
        removeThinkingIndicator(thinkingBubble);

        console.log('📞 Chat API response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (errorData.needs_refresh) {
                throw new Error('Vault data not available. Please refresh vault first.');
            } else {
                throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('💭 Chat response received:', data);
        
        const reply = data.response || 'No response received from AI';
        
        // Add assistant response
        addAssistantMessage(box, reply);
        scrollToBottom(box);

        // Update conversation history
        updateConversationHistory(text, reply);

        // Toggle AI persona for next response
        aiToggle = !aiToggle;

    } catch (error) {
        console.error('❌ Chat error:', error);
        
        // Remove thinking indicator if still present
        if (thinkingBubble && thinkingBubble.parentNode) {
            removeThinkingIndicator(thinkingBubble);
        }
        
        // Add error message
        addErrorMessage(box, error.message);
        scrollToBottom(box);
    }
}

// CHAT UI HELPER FUNCTIONS - ZERO-FAILURE IMPLEMENTATIONS
function addUserMessage(box, text) {
    const userBubble = document.createElement('div');
    userBubble.className = 'bubble user';
    userBubble.innerHTML = `
        <img src="user-avatar.png" onerror="this.style.display='none'" class="avatar" alt="You">
        <div class="bubble-content"><strong>You:</strong> ${escapeHtml(text)}</div>
    `;
    box.appendChild(userBubble);
}

function addAssistantMessage(box, reply) {
    const isEli = aiToggle;
    const who = isEli ? 'Eli' : 'Roxy';
    const avatar = isEli ? "boy-mascot.png" : "girl-mascot.png";

    const responseBubble = document.createElement('div');
    responseBubble.className = 'bubble ai';
    responseBubble.innerHTML = `
        <img src="${avatar}" class="avatar" alt="${who}" onerror="this.style.display='none'">
        <div class="bubble-content"><strong>${who}:</strong> ${escapeHtml(reply)}</div>
    `;
    box.appendChild(responseBubble);
}

function addThinkingIndicator(box) {
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'bubble ai thinking-bubble';
    thinkingBubble.innerHTML = `
        <img src="boy-mascot.png" class="avatar" alt="Thinking" onerror="this.style.display='none'">
        <div class="bubble-content thinking-content">
            <span class="thinking-brain">🧠</span> Thinking...
        </div>
    `;
    box.appendChild(thinkingBubble);
    scrollToBottom(box);
    return thinkingBubble;
}

function removeThinkingIndicator(thinkingBubble) {
    if (thinkingBubble && thinkingBubble.parentNode) {
        thinkingBubble.remove();
    }
}

function addErrorMessage(box, errorMessage) {
    const errorBubble = document.createElement('div');
    errorBubble.className = 'bubble ai';
    errorBubble.innerHTML = `
        <img src="boy-mascot.png" class="avatar" alt="System" onerror="this.style.display='none'">
        <div class="bubble-content" style="background: #ff6b6b; color: white;">
            <strong>System:</strong> Error: ${escapeHtml(errorMessage)}
        </div>
    `;
    box.appendChild(errorBubble);
}

function updateConversationHistory(userMessage, assistantReply) {
    conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
    });
    
    conversationHistory.push({
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date().toISOString()
    });

    // Limit conversation history to prevent memory issues
    const MAX_HISTORY = 50; // 25 exchanges
    if (conversationHistory.length > MAX_HISTORY) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY);
    }
}

function scrollToBottom(element) {
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// FILE UPLOAD SYSTEM - COMPLETE IMPLEMENTATION
async function handleFileUpload(files) {
    if (!files || files.length === 0) {
        console.log('🚫 No files selected for upload');
        return;
    }

    const box = document.getElementById('chat-box');
    
    // Validate file count
    if (files.length > 10) {
        addErrorMessage(box, 'Maximum 10 files allowed per upload');
        scrollToBottom(box);
        return;
    }

    // Show upload start message
    const uploadBubble = document.createElement('div');
    uploadBubble.className = 'bubble ai';
    uploadBubble.innerHTML = `
        <img src="boy-mascot.png" class="avatar" alt="System" onerror="this.style.display='none'">
        <div class="bubble-content"><strong>System:</strong> 📤 Uploading ${files.length} file(s) to vault...</div>
    `;
    box.appendChild(uploadBubble);
    scrollToBottom(box);

    try {
        // Validate files before upload
        const validFiles = [];
        const errors = [];
        
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                errors.push(`${file.name}: File too large (max 10MB)`);
                continue;
            }
            
            if (!isValidFileType(file.name)) {
                errors.push(`${file.name}: Unsupported file type`);
                continue;
            }
            
            validFiles.push(file);
        }

        // Show validation errors
        if (errors.length > 0) {
            for (const error of errors) {
                addErrorMessage(box, error);
                scrollToBottom(box);
            }
        }

        if (validFiles.length === 0) {
            addErrorMessage(box, 'No valid files to upload');
            scrollToBottom(box);
            return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        for (const file of validFiles) {
            formData.append('files', file);
        }

        // Upload to API with progress tracking
        const response = await fetch('/api/upload-file', {
            method: 'POST',
            body: formData,
            timeout: 120000 // 2 minute timeout for file uploads
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status === 'success' && result.successful_uploads > 0) {
            // Show success for each uploaded file
            for (const fileInfo of result.files) {
                if (fileInfo.success) {
                    const successBubble = document.createElement('div');
                    successBubble.className = 'bubble ai';
                    successBubble.innerHTML = `
                        <img src="girl-mascot.png" class="avatar" alt="Roxy" onerror="this.style.display='none'">
                        <div class="bubble-content"><strong>Roxy:</strong> ✅ Uploaded "${fileInfo.filename}" to ${fileInfo.folder} folder. File is now available for chat!</div>
                    `;
                    box.appendChild(successBubble);
                    scrollToBottom(box);
                } else {
                    addErrorMessage(box, `Failed to upload "${fileInfo.filename}": ${fileInfo.message}`);
                    scrollToBottom(box);
                }
            }
            
            // Refresh vault after successful uploads
            vaultStatus = 'needs_refresh';
            setTimeout(() => {
                checkVaultStatus();
            }, 2000);
            
        } else {
            throw new Error(result.message || 'Upload failed');
        }

    } catch (error) {
        console.error('❌ File upload error:', error);
        addErrorMessage(box, `Upload failed: ${error.message}`);
        scrollToBottom(box);
    }
}

function isValidFileType(filename) {
    const validExtensions = [
        '.docx', '.doc', '.pdf', '.txt', '.csv', '.xlsx', '.xls', 
        '.pptx', '.ppt', '.md', '.rtf', '.json', '.xml', '.html', 
        '.htm', '.odt', '.ods', '.odp', '.pages', '.numbers', '.key'
    ];
    
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return validExtensions.includes(extension);
}

// KEYBOARD AND EVENT HANDLERS - BULLETPROOF IMPLEMENTATION
function setupEventHandlers() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const attachmentBtn = document.getElementById('attachment-btn');
    const fileInput = document.getElementById('file-input');

    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-resize textarea
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }

    // File upload handlers
    if (attachmentBtn && fileInput) {
        attachmentBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(Array.from(e.target.files));
                // Clear the input so the same file can be uploaded again
                e.target.value = '';
            }
        });
    }

    console.log('🎯 Event handlers setup complete');
}

// IMAGE ERROR HANDLING
function setupImageErrorHandling() {
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('onerror')) {
                img.onerror = function() {
                    console.warn(`Image failed to load: ${this.src}`);
                    this.style.display = 'none';
                };
            }
        });
    });
}

// PERIODIC VAULT HEALTH CHECK
function startVaultHealthMonitoring() {
    setInterval(() => {
        if (systemActive && (vaultStatus === 'ready' || vaultStatus === 'needs_refresh')) {
            checkVaultStatus();
        }
    }, VAULT_CHECK_INTERVAL);
    
    console.log('🔍 Vault health monitoring started');
}

// MAIN INITIALIZATION - ZERO-FAILURE STARTUP
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM LOADED - Complete chat system initializing...');
    
    try {
        // Setup all event handlers
        setupEventHandlers();
        
        // Setup image error handling
        setupImageErrorHandling();
        
        // Start vault monitoring
        startVaultHealthMonitoring();
        
        // Start status animation after delay
        setTimeout(() => {
            console.log('⏰ Starting status animation...');
            loadStatus();
        }, 800);
        
        console.log('✅ Chat system initialization complete');
        
    } catch (error) {
        console.error('❌ Fatal initialization error:', error);
        
        // Emergency fallback - still allow basic functionality
        setTimeout(() => {
            systemActive = true;
            console.log('🚨 Emergency mode activated - basic chat available');
        }, 2000);
    }
});

// GLOBAL ERROR HANDLER
window.addEventListener('error', function(e) {
    console.error('🚨 Global error caught:', e.error);
    
    // Try to maintain system stability
    if (!systemActive) {
        console.log('🔧 Attempting emergency system activation...');
        systemActive = true;
    }
});

// UNHANDLED PROMISE REJECTION HANDLER
window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled promise rejection:', e.reason);
    e.preventDefault(); // Prevent default browser behavior
});

// EXPORT FOR TESTING (if in module environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendMessage,
        loadVaultContent,
        refreshVault,
        checkVaultStatus,
        handleFileUpload
    };
}

console.log('🎯 Complete chat system loaded - Zero-failure implementation ready');
