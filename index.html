let sessionVault = null;  // Store vault in session
        let sessionActive = false;

        async function initializeSession() {
            if (sessionVault) {
                console.log('Session vault already loaded');
                return sessionVault;
            }

            showStatus('Loading SiteMonkeys business intelligence vault...', 'loading');
            
            try {
                const response = await fetch('/api/load-vault');
                const data = await response.json();
                
                if (data.success) {
                    sessionVault = data.memory;  // Store in session
                    sessionActive = true;
                    const tokenCount = data.token_estimate || 'Unknown';
                    showStatus(`✅ Session vault loaded (${tokenCount} tokens) - Ready for validation`, 'success');
                    console.log('Vault loaded and cached for session');
                    return sessionVault;
                } else {
                    throw new Error(data.error || 'Failed to load vault');
                }
            } catch (error) {
                console.error('Vault loading error:', error);
                showStatus('❌ Failed to load business intelligence vault', 'error');
                throw error;
            }
        }

        async function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            
            if (!message) return;

            // Initialize session vault if not loaded
            if (!sessionVault) {
                try {
                    await initializeSession();
                } catch (error) {
                    return; // Exit if vault loading fails
                }
            }

            // Add user message to chat
            addMessage(message, 'user');
            input.value = '';

            // Show AI thinking
            const thinkingDiv = addMessage('🧠 Analyzing against SiteMonkeys business intelligence...', 'assistant', true);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        vault_memory: sessionVault  // Use cached vault
                    })
                });

                const data = await response.json();
                
                // Remove thinking message
                thinkingDiv.remove();

                if (data.success) {
                    addMessage(data.response, 'assistant');
                } else {
                    addMessage(`❌ Error: ${data.error}`, 'assistant');
                }
            } catch (error) {
                thinkingDiv.remove();
                addMessage('❌ Connection error. Please try again.', 'assistant');
                console.error('Chat error:', error);
            }
        }

        function addSessionInfo() {
            const info = document.createElement('div');
            info.className = 'session-info';
            info.innerHTML = `
                <div style="background: #e3f2fd; padding: 10px; border-radius: 8px; margin: 10px 0; font-size: 0.9em;">
                    🎯 <strong>SiteMonkeys Business Validation Session</strong><br>
                    💾 Vault loaded once per session (cost optimized)<br>
                    🔄 Unlimited questions this session<br>
                    📊 Real business intelligence active
                </div>
            `;
            document.getElementById('chatContainer').appendChild(info);
        }

        // Initialize session when page loads
        window.addEventListener('load', () => {
            addSessionInfo();
            // Auto-initialize vault for immediate readiness
            initializeSession().catch(console.error);
        });
