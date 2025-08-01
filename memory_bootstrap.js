// memory_bootstrap.js - ES MODULE VERSION
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
        console.log('[MEMORY_BOOTSTRAP] 🔍 DEBUGGING DATABASE CONNECTION:');
        console.log('[MEMORY_BOOTSTRAP] DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('[MEMORY_BOOTSTRAP] DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);
        
        if (process.env.DATABASE_URL) {
            console.log('[MEMORY_BOOTSTRAP] 📊 Connecting to PostgreSQL...');
            
            try {
                // Try to import the sophisticated persistent memory system
                console.log('[MEMORY_BOOTSTRAP] 🔄 Importing PersistentMemoryAPI...');
                const { default: PersistentMemory } = await import('./memory_system/persistent_memory.js');
                console.log('[MEMORY_BOOTSTRAP] ✅ PersistentMemoryAPI imported successfully');
                
                console.log('[MEMORY_BOOTSTRAP] 🔄 Creating PersistentMemoryAPI instance...');
                this.persistentMemory = new PersistentMemory();
                console.log('[MEMORY_BOOTSTRAP] ✅ PersistentMemoryAPI instance created');
                
                console.log('[MEMORY_BOOTSTRAP] 🔄 Initializing persistent memory...');
                await this.persistentMemory.initialize();
                console.log('[MEMORY_BOOTSTRAP] ✅ PostgreSQL persistent memory initialized');
                
            } catch (error) {
                console.error('[MEMORY_BOOTSTRAP] ❌ PERSISTENT MEMORY FAILED WITH FULL ERROR:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                    code: error.code
                });
                console.log('[MEMORY_BOOTSTRAP] ⚠️ PostgreSQL failed, trying database manager...');
                
                try {
                    // Fallback to database manager
                    console.log('[MEMORY_BOOTSTRAP] 🔄 Importing DatabaseManager...');
                    const { default: DatabaseManager } = await import('./memory_system/database_manager.js');
                    console.log('[MEMORY_BOOTSTRAP] ✅ DatabaseManager imported successfully');
                    
                    this.persistentMemory = new DatabaseManager();
                    console.log('[MEMORY_BOOTSTRAP] 🔄 Initializing database manager...');
                    await this.persistentMemory.initialize();
                    console.log('[MEMORY_BOOTSTRAP] ✅ Database manager initialized');
                } catch (dbError) {
                    console.error('[MEMORY_BOOTSTRAP] ❌ DATABASE MANAGER FAILED WITH FULL ERROR:', {
                        message: dbError.message,
                        stack: dbError.stack,
                        name: dbError.name,
                        code: dbError.code
                    });
                    console.log('[MEMORY_BOOTSTRAP] ⚠️ Database manager also failed:', dbError.message);
                    throw new Error(`All memory systems failed: ${error.message} | ${dbError.message}`);
                }
            }
        } else {
            console.error('[MEMORY_BOOTSTRAP] ❌ NO DATABASE_URL FOUND IN ENVIRONMENT');
            console.log('[MEMORY_BOOTSTRAP] Available env vars:', Object.keys(process.env).filter(key => key.includes('DATA')));
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

    // CRITICAL FIX: Add missing getVaultLoader method that chat system expects
    getVaultLoader() {
        return this.vaultMemory;
    }

    // Add isReady method for compatibility
    isReady() {
        return this.isInitialized;
    }

    // Add getStatus method for debugging
    getStatus() {
        return {
            initialized: this.isInitialized,
            hasMemorySystem: !!this.persistentMemory,
            hasVaultLoader: !!this.vaultMemory,
            fallbackMode: this.fallbackMode
        };
    }
}

const memoryBootstrap = new MemoryBootstrap();
export default memoryBootstrap;
