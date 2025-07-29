// memory_bootstrap.js - PRODUCTION ZERO-FAILURE MEMORY BOOTSTRAP
// Connects to the REAL sophisticated PostgreSQL persistent memory system

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
        console.log('[MEMORY_BOOTSTRAP] 🔍 Environment check - DATABASE_URL exists:', !!process.env.DATABASE_URL);
        
        while (this.initializationAttempts < this.maxRetries && !this.isInitialized) {
            this.initializationAttempts++;
            
            try {
                console.log(`[MEMORY_BOOTSTRAP] 📋 Attempt ${this.initializationAttempts}: Loading REAL persistent memory system...`);
                
                // Dynamic import of the REAL sophisticated system
                const persistentMemoryModule = await import('./memory_system/persistent_memory.js');
                const persistentMemory = persistentMemoryModule.default || persistentMemoryModule;
                
                if (!persistentMemory) {
                    throw new Error('Persistent memory module loaded but returned null/undefined');
                }

                console.log('[MEMORY_BOOTSTRAP] 🔍 Testing sophisticated memory system health...');
                
                // Wait for the sophisticated system to initialize
                await this._waitForInitialization(persistentMemory, 10000); // 10 second timeout
                
                // Force health check execution
                const healthResult = await this._safeHealthCheck(persistentMemory);
                console.log('[MEMORY_BOOTSTRAP] 📊 Sophisticated system health check result:', healthResult);

                if (healthResult && healthResult.overall === true) {
                    this.memorySystem = persistentMemory;
                    console.log('[MEMORY_BOOTSTRAP] ✅ REAL PostgreSQL persistent memory system connected successfully');
                    console.log('[MEMORY_BOOTSTRAP] 🎯 Categories:', Object.keys(persistentMemory.categories || {}));
                } else {
                    throw new Error(`Sophisticated memory system unhealthy: ${healthResult?.error || 'Unknown health issue'}`);
                }

                // Always attempt vault loader initialization
                await this._initializeVault();

                this.isInitialized = true;
                console.log('[MEMORY_BOOTSTRAP] 🎯 PRODUCTION memory bootstrap complete - sophisticated system active');
                return true;

            } catch (error) {
                console.error(`[MEMORY_BOOTSTRAP] ❌ Initialization attempt ${this.initializationAttempts} failed:`, error);
                
                if (this.initializationAttempts >= this.maxRetries) {
                    console.log('[MEMORY_BOOTSTRAP] 🚨 CRITICAL: Max retries reached for sophisticated system');
                    console.log('[MEMORY_BOOTSTRAP] 🚨 DATABASE_URL missing or PostgreSQL unavailable');
                    console.log('[MEMORY_BOOTSTRAP] 🚨 This is a PRODUCTION FAILURE - sophisticated memory required');
                    
                    // In production, this is a critical failure
                    throw new Error('PRODUCTION FAILURE: Unable to connect to sophisticated PostgreSQL memory system');
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 2000 * this.initializationAttempts));
            }
        }

        return this.isInitialized;
    }

    async _waitForInitialization(persistentMemory, timeoutMs) {
        const startTime = Date.now();
        
        while (!persistentMemory.initialized && (Date.now() - startTime) < timeoutMs) {
            console.log('[MEMORY_BOOTSTRAP] ⏳ Waiting for sophisticated memory system to initialize...');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (!persistentMemory.initialized) {
            throw new Error('Sophisticated memory system failed to initialize within timeout');
        }
        
        console.log('[MEMORY_BOOTSTRAP] ✅ Sophisticated memory system initialization confirmed');
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
                return { overall: false, error: 'getSystemHealth method not available' };
            }
        } catch (error) {
            console.error('[MEMORY_BOOTSTRAP] ❌ Health check failed:', error);
            return { overall: false, error: error.message };
        }
    }

    async _initializeVault() {
        try {
            console.log('[MEMORY_BOOTSTRAP] 🏦 Loading vault system...');
            const vaultModule = await import('./memory_system/vault_loader.js');
            this.vaultLoader = vaultModule.default || vaultModule;
            console.log('[MEMORY_BOOTSTRAP] ✅ Vault system loaded');
        } catch (error) {
            console.error('[MEMORY_BOOTSTRAP] ⚠️ Vault loading failed (non-critical):', error);
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
        const memorySystemInfo = this.memorySystem ? {
            hasGetRelevantContext: typeof this.memorySystem.getRelevantContext === 'function',
            hasStoreMemory: typeof this.memorySystem.storeMemory === 'function',
            hasGetSystemHealth: typeof this.memorySystem.getSystemHealth === 'function',
            initialized: this.memorySystem.initialized,
            categories: this.memorySystem.categories ? Object.keys(this.memorySystem.categories) : []
        } : null;

        return {
            initialized: this.isInitialized,
            attempts: this.initializationAttempts,
            hasMemorySystem: !!this.memorySystem,
            hasVaultLoader: !!this.vaultLoader,
            memorySystemType: this.memorySystem ? 'sophisticated_postgresql' : 'none',
            memorySystemInfo: memorySystemInfo,
            databaseUrl: !!process.env.DATABASE_URL
        };
    }
}

// Export singleton instance
const memoryBootstrap = new MemoryBootstrap();

export default memoryBootstrap;
