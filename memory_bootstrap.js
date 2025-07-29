// ===== FIX 1: memory_bootstrap.js - CORRECTED MODULE SYNTAX =====
// Replace your entire memory_bootstrap.js file with this:

import pg from 'pg';
const { Pool } = pg;

class MemoryBootstrap {
    constructor() {
        this.persistentMemory = null;
        this.vaultMemory = null;
        this.isInitialized = false;
        this.fallbackMode = false;
    }

    async initialize() {
        console.log('[MEMORY_BOOTSTRAP] 🚀 Starting application-level memory initialization...');
        
        try {
            // Initialize persistent memory system
            await this.initializePersistentMemory();
            
            // Initialize vault system (Site Monkeys only)
            await this.initializeVaultSystem();
            
            this.isInitialized = true;
            console.log('[MEMORY_BOOTSTRAP] ✅ Memory systems initialized successfully');
            
        } catch (error) {
            console.error('[MEMORY_BOOTSTRAP] ⚠️ Initialization failed, using fallback:', error.message);
            this.initializeFallbackMemory();
        }
    }

    async initializePersistentMemory() {
        if (process.env.DATABASE_URL) {
            console.log('[MEMORY_BOOTSTRAP] 📊 Connecting to PostgreSQL...');
            
            try {
                // Import the sophisticated persistent memory system
                const { default: PersistentMemoryAPI } = await import('./memory_system/persistent_memory.js');
                this.persistentMemory = new PersistentMemoryAPI();
                await this.persistentMemory.initialize();
                console.log('[MEMORY_BOOTSTRAP] ✅ PostgreSQL persistent memory initialized');
                
            } catch (error) {
                console.log('[MEMORY_BOOTSTRAP] ⚠️ PostgreSQL failed, trying database manager...');
                
                // Fallback to database manager
                const { default: DatabaseManager } = await import('./memory_system/database_manager.js');
                this.persistentMemory = new DatabaseManager();
                await this.persistentMemory.initialize();
                console.log('[MEMORY_BOOTSTRAP] ✅ Database manager initialized');
            }
        } else {
            throw new Error('No DATABASE_URL found');
        }
    }

    async initializeVaultSystem() {
        try {
            const { default: VaultLoader } = await import('./memory_system/vault_loader.js');
            this.vaultMemory = new VaultLoader();
            await this.vaultMemory.initialize();
            console.log('[MEMORY_BOOTSTRAP] 🗄️ Vault system initialized');
        } catch (error) {
            console.log('[MEMORY_BOOTSTRAP] ⚠️ Vault system unavailable:', error.message);
        }
    }

    initializeFallbackMemory() {
        console.log('[MEMORY_BOOTSTRAP] 🆘 Initializing emergency in-memory system...');
        
        this.persistentMemory = {
            getRelevantContext: async (userId, message, maxTokens) => {
                console.log('[MEMORY_BOOTSTRAP] 📋 Emergency mode: no persistent context');
                return '';
            },
            storeMemory: async (userId, conversation) => {
                console.log('[MEMORY_BOOTSTRAP] 💾 Emergency mode: memory not stored');
                return true;
            },
            getSystemHealth: () => ({
                status: 'emergency_mode',
                persistent_memory: false,
                vault_memory: !!this.vaultMemory
            })
        };
        
        this.fallbackMode = true;
        this.isInitialized = true;
    }

    getMemorySystem() {
        if (!this.isInitialized) {
            console.log('[MEMORY_BOOTSTRAP] ⚠️ Memory system not initialized yet');
            return null;
        }
        
        return {
            persistent: this.persistentMemory,
            vault: this.vaultMemory,
            getRelevantContext: async (userId, message, maxTokens = 2400) => {
                if (this.persistentMemory && typeof this.persistentMemory.getRelevantContext === 'function') {
                    return await this.persistentMemory.getRelevantContext(userId, message, maxTokens);
                }
                return '';
            },
            storeMemory: async (userId, conversation) => {
                if (this.persistentMemory && typeof this.persistentMemory.storeMemory === 'function') {
                    return await this.persistentMemory.storeMemory(userId, conversation);
                }
                return false;
            },
            getSystemHealth: () => {
                const health = {
                    status: this.fallbackMode ? 'fallback_mode' : 'operational',
                    persistent_memory: !!this.persistentMemory && !this.fallbackMode,
                    vault_memory: !!this.vaultMemory,
                    initialized: this.isInitialized
                };
                
                if (this.persistentMemory && typeof this.persistentMemory.getSystemHealth === 'function') {
                    return { ...health, ...this.persistentMemory.getSystemHealth() };
                }
                
                return health;
            }
        };
    }
}

// CRITICAL: Use CommonJS export instead of ES6
const memoryBootstrap = new MemoryBootstrap();
module.exports = memoryBootstrap;

// ===== FIX 2: server.js - CORRECTED IMPORT SYNTAX =====
// At the top of your server.js, REPLACE this line:
// import memoryBootstrap from './memory_bootstrap.js';
// WITH:
const memoryBootstrap = require('./memory_bootstrap.js');

// ===== FIX 3: server.js - ADD MEMORY INTEGRATION TO /api/chat ROUTE =====
// In your /api/chat route, after you get the memorySystem, ADD these sections:

// MEMORY RETRIEVAL (add after memorySystem retrieval):
let memoryContext = '';
if (memorySystem && typeof memorySystem.getRelevantContext === 'function') {
    try {
        console.log('[CHAT] 📋 Retrieving memory context...');
        memoryContext = await memorySystem.getRelevantContext('user', message, 2400);
        console.log(`[CHAT] ✅ Memory context retrieved: ${memoryContext.length} characters`);
    } catch (error) {
        console.error('[CHAT] ⚠️ Memory retrieval failed:', error);
        memoryContext = '';
    }
} else {
    console.log('[CHAT] ⚠️ Memory system not available for context retrieval');
}

// Add memoryContext to your AI prompt construction
// Find where you build your prompt and add: ${memoryContext ? `\n\nRelevant conversation history:\n${memoryContext}` : ''}

// MEMORY STORAGE (add RIGHT BEFORE res.json(finalResponse)):
if (memorySystem && typeof memorySystem.storeMemory === 'function') {
    try {
        console.log('[CHAT] 💾 Storing conversation in memory...');
        const conversationEntry = {
            message: message,
            response: finalResponse.message || finalResponse.text || 'No response generated',
            mode: mode,
            userId: 'user',
            timestamp: new Date().toISOString(),
            cost: totalCost || 0,
            model: 'gpt-4o'
        };
        await memorySystem.storeMemory('user', conversationEntry);
        console.log('[CHAT] ✅ Conversation stored successfully');
    } catch (error) {
        console.error('[CHAT] ⚠️ Memory storage failed:', error);
    }
} else {
    console.log('[CHAT] ⚠️ Memory system not available for storage');
}

// ===== FIX 4: ADD HEALTH CHECK ENDPOINT =====
// Add this endpoint to your server.js (after your existing routes):

app.get('/api/memory-status', async (req, res) => {
    try {
        const memorySystem = memoryBootstrap.getMemorySystem();
        if (memorySystem && typeof memorySystem.getSystemHealth === 'function') {
            const health = memorySystem.getSystemHealth();
            res.json({
                timestamp: new Date().toISOString(),
                memory_system: health
            });
        } else {
            res.json({
                timestamp: new Date().toISOString(),
                memory_system: {
                    status: 'not_initialized',
                    error: 'Memory bootstrap not available'
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            timestamp: new Date().toISOString(),
            error: error.message,
            memory_system: { status: 'error' }
        });
    }
});

// ===== DEPLOYMENT VERIFICATION =====
// After deploying, check these endpoints:
// 1. https://yourdomain.railway.app/api/memory-status
// 2. Your Railway logs should show:
//    [MEMORY_BOOTSTRAP] 🚀 Starting application-level memory initialization...
//    [MEMORY_BOOTSTRAP] ✅ Memory systems initialized successfully
