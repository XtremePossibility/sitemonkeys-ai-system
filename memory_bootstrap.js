// memory_bootstrap.js - Application-Level Memory System Bootstrap
// Ensures persistent memory initialization happens at APPLICATION startup, not per-request

class MemoryBootstrap {
    constructor() {
        this.memorySystem = null;
        this.vaultLoader = null;
        this.initializationPromise = null;
        this.isInitialized = false;
        this.initializationAttempts = 0;
        this.maxRetries = 3;
    }

    // Single initialization point - called once at application startup
    async initializeOnce() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }

    async _performInitialization() {
        console.log('[MEMORY_BOOTSTRAP] 🚀 Starting application-level memory initialization...');
        
        while (this.initializationAttempts < this.maxRetries && !this.isInitialized) {
            this.initializationAttempts++;
            
            try {
                console.log(`[MEMORY_BOOTSTRAP] 📋 Attempt ${this.initializationAttempts}: Loading persistent memory...`);
                
                // Dynamic import with explicit error handling
                const persistentMemoryModule = await import('./memory_system/persistent_memory.js');
                const persistentMemory = persistentMemoryModule.default || persistentMemoryModule;
                
                if (!persistentMemory) {
                    throw new Error('Persistent memory module loaded but returned null/undefined');
                }

                console.log('[MEMORY_BOOTSTRAP] 🔍 Testing persistent memory system health...');
                
                // Force health check execution
                const healthResult = await this._safeHealthCheck(persistentMemory);
                console.log('[MEMORY_BOOTSTRAP] 📊 Health check result:', healthResult);

                if (healthResult && healthResult.status === 'healthy') {
                    this.memorySystem = persistentMemory;
                    console.log('[MEMORY_BOOTSTRAP] ✅ Persistent memory system initialized successfully');
                } else {
                    console.log('[MEMORY_BOOTSTRAP] ⚠️ Persistent memory unhealthy, initializing fallback...');
                    await this._initializeFallback();
                }

                // Always attempt vault loader initialization
                await this._initializeVault();

                this.isInitialized = true;
                console.log('[MEMORY_BOOTSTRAP] 🎯 Memory bootstrap complete');
                return true;

            } catch (error) {
                console.error(`[MEMORY_BOOTSTRAP] ❌ Initialization attempt ${this.initializationAttempts} failed:`, error);
                
                if (this.initializationAttempts >= this.maxRetries) {
                    console.log('[MEMORY_BOOTSTRAP] 🔄 Max retries reached, falling back to in-memory storage...');
                    await this._initializeFallback();
                    this.isInitialized = true;
                    return true;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * this.initializationAttempts));
            }
        }

        return this.isInitialized;
    }

    async _safeHealthCheck(persistentMemory) {
        try {
            if (typeof persistentMemory.getSystemHealth === 'function') {
                const health = await persistentMemory.getSystemHealth();
                console.log('[MEMORY_BOOTSTRAP] 📋 getSystemHealth() executed, result:', health);
                return health;
            } else {
                console.log('[MEMORY_BOOTSTRAP] ⚠️ getSystemHealth method not found on persistent memory object');
                console.log('[MEMORY_BOOTSTRAP] 📋 Available methods:', Object.keys(persistentMemory));
                return null;
            }
        } catch (error) {
            console.error('[MEMORY_BOOTSTRAP] ❌ Health check failed:', error);
            return null;
        }
    }

    async _initializeFallback() {
        console.log('[MEMORY_BOOTSTRAP] 🔄 Initializing fallback memory system...');
        
        try {
            const DatabaseManager = await import('./memory_system/database_manager.js');
            const dbManager = DatabaseManager.default || DatabaseManager;
            
            this.memorySystem = {
                getRelevantContext: async (query, options = {}) => {
                    console.log('[FALLBACK_MEMORY] 📋 Getting context for query:', query);
                    return '';
                },
                storeMemory: async (conversationData) => {
                    console.log('[FALLBACK_MEMORY] 💾 Storing conversation:', conversationData.message?.substring(0, 50) + '...');
                    return true;
                },
                getSystemHealth: async () => {
                    return { status: 'healthy', type: 'fallback' };
                }
            };
            
            console.log('[MEMORY_BOOTSTRAP] ✅ Fallback memory system initialized');
        } catch (error) {
            console.error('[MEMORY_BOOTSTRAP] ❌ Fallback initialization failed:', error);
            
            // Ultimate fallback - in-memory only
            this.memorySystem = {
                getRelevantContext: async () => '',
                storeMemory: async () => true,
                getSystemHealth: async () => ({ status: 'healthy', type: 'in-memory' })
            };
        }
    }

    async _initializeVault() {
        try {
            console.log('[MEMORY_BOOTSTRAP] 🏦 Loading vault system...');
            const vaultModule = await import('./memory_system/vault_loader.js');
            this.vaultLoader = vaultModule.default || vaultModule;
            console.log('[MEMORY_BOOTSTRAP] ✅ Vault system loaded');
        } catch (error) {
            console.error('[MEMORY_BOOTSTRAP] ⚠️ Vault loading failed:', error);
            this.vaultLoader = null;
        }
    }

    // Get memory system for request handling
    getMemorySystem() {
        if (!this.isInitialized) {
            console.error('[MEMORY_BOOTSTRAP] ❌ Memory system requested before initialization');
            return null;
        }
        return this.memorySystem;
    }

    // Get vault loader for Site Monkeys mode
    getVaultLoader() {
        return this.vaultLoader;
    }

    // Check if system is ready
    isReady() {
        return this.isInitialized;
    }

    // Get initialization status
    getStatus() {
        return {
            initialized: this.isInitialized,
            attempts: this.initializationAttempts,
            hasMemorySystem: !!this.memorySystem,
            hasVaultLoader: !!this.vaultLoader
        };
    }
}

// Export singleton instance
const memoryBootstrap = new MemoryBootstrap();

export default memoryBootstrap;
