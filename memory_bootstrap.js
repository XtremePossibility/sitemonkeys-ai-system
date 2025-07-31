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
        if (process.env.DATABASE_URL) {
            console.log('[MEMORY_BOOTSTRAP] 📊 Connecting to PostgreSQL...');
            
            try {
                // Try to import the sophisticated persistent memory system
                const { default: PersistentMemoryAPI } = await import('./memory_system/persistent_memory.js');
                this.persistentMemory = new PersistentMemoryAPI();
                await this.persistentMemory.initialize();
                console.log('[MEMORY_BOOTSTRAP] ✅ PostgreSQL persistent memory initialized');
                
            } catch (error) {
                console.log('[MEMORY_BOOTSTRAP] ⚠️ PostgreSQL failed, trying database manager...');
                
                try {
                    // Fallback to database manager
                    const { default: DatabaseManager } = await import('./memory_system/database_manager.js');
                    this.persistentMemory = new DatabaseManager();
                    await this.persistentMemory.initialize();
                    console.log('[MEMORY_BOOTSTRAP] ✅ Database manager initialized');
                } catch (dbError) {
                    console.log('[MEMORY_BOOTSTRAP] ⚠️ Database manager also failed:', dbError.message);
                    throw new Error('All memory systems failed');
                }
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

const memoryBootstrap = new MemoryBootstrap();
export default memoryBootstrap;
