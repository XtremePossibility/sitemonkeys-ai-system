// memory_bootstrap.js  
// PRODUCTION-GRADE BOOTSTRAP - Site Monkeys AI System
// Sets up global.memorySystem as expected by chat handler
// ZERO-FAILURE INITIALIZATION with fallback resilience

console.log('[MEMORY_BOOTSTRAP] 🚀 Site Monkeys Memory Bootstrap initializing...');

class MemoryBootstrap {
  constructor() {
    this.persistentMemory = null;
    this.isHealthy = false;
    this.lastHealthCheck = null;
    this.fallbackMemory = new Map();
    this.initPromise = null; // Track initialization promise
    this.initStarted = false;
  }

  /**
   * AUTOMATIC INITIALIZATION - called when first accessed
   */
  async ensureInitialized() {
    if (this.isHealthy) {
      return true; // Already initialized and healthy
    }
      
    if (this.initPromise) {
      // Initialization already in progress, wait for it
      return await this.initPromise;
    }
      
    if (!this.initStarted) {
      // Start initialization for the first time
      console.log('[MEMORY_BOOTSTRAP] 🚀 AUTO-INITIALIZING Site Monkeys Memory System...');
      this.initStarted = true;
      this.initPromise = this.initialize();
      return await this.initPromise;
    }
      
    return false;
  }

  /**
   * Initialize memory system and set up global.memorySystem
   */
  async initialize() {
    console.log('[MEMORY_BOOTSTRAP] 🚀 Initializing Site Monkeys Memory System...');

    try {
        // Initialize persistent memory with ENHANCED error handling
        try {
            console.log('[MEMORY_BOOTSTRAP] 📝 Step 1: Attempting to import PersistentMemoryAPI...');

            // ✅ import the façade (CJS) which correctly loads/initializes the engine
            const apiModule = await import('./memory_system/memory_api.js');
            const memApi = apiModule.default || apiModule;   // default export for CJS façade
            this.persistentMemory = memApi;
            console.log('[MEMORY_BOOTSTRAP] ✅ Façade imported successfully');
            const healthCheck = await this.persistentMemory.getSystemHealth?.()
                             || await this.persistentMemory.healthCheck?.();
            this.isHealthy = !!(healthCheck && (healthCheck.overall === true || healthCheck.status === 'healthy'));
            
        } catch (error) {
            console.error('[MEMORY_BOOTSTRAP] ❌ DETAILED ERROR during persistent memory initialization:');
            console.error('[MEMORY_BOOTSTRAP] ❌ Error message:', error.message);
            console.error('[MEMORY_BOOTSTRAP] ❌ Error stack:', error.stack);
            console.error('[MEMORY_BOOTSTRAP] ❌ Error code:', error.code);
            console.error('[MEMORY_BOOTSTRAP] ❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            this.isHealthy = false;
        }

        // Set up global.memorySystem interface for your chat.js AFTER INITIALIZATION
        this.setupGlobalInterface();

        console.log('[MEMORY_BOOTSTRAP] ✅ Global memory system interface established');
        console.log(`[MEMORY_BOOTSTRAP] 📊 Final state - isHealthy: ${this.isHealthy}, mode: ${this.isHealthy ? 'persistent' : 'fallback'}`);
        return this.isHealthy;

    } catch (error) {
        console.error('[MEMORY_BOOTSTRAP] ❌ CRITICAL: Initialization failed completely:', error);
        console.error('[MEMORY_BOOTSTRAP] ❌ Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
          
        // Set up fallback global.memorySystem
        this.setupGlobalInterface();
        return false;
    }
}

  setupGlobalInterface() {
    // Fix: Capture 'this' context to avoid arrow function binding issues
    const self = this;
    global.memorySystem = {
        // Your chat.js expects this exact method signature
        retrieveMemory: async (userId, message) => {
            await self.ensureInitialized(); // Auto-initialize if needed
            console.log(`[MEMORY_BOOTSTRAP] 🔍 Retrieve called - isHealthy: ${self.isHealthy}`);
            return await self.retrieveMemoryForChat(userId, message);
        },
          
        storeMemory: async (userId, conversation) => {
            await self.ensureInitialized(); // Auto-initialize if needed
            console.log(`[MEMORY_BOOTSTRAP] 💾 Store called - isHealthy: ${self.isHealthy}, has persistentMemory: ${!!self.persistentMemory}`);
            try {
                // First try persistent memory if available
                if (self.isHealthy && self.persistentMemory) {
                    console.log('[MEMORY_BOOTSTRAP] ✅ Using persistent memory storage');
                    const result = await self.persistentMemory.storeMemory(userId, conversation);
                    console.log('[MEMORY_BOOTSTRAP] 📊 Persistent storage result:', JSON.stringify(result));
                    if (result && result.success) {
                        return result;
                    } else {
                        console.log('[MEMORY_BOOTSTRAP] ⚠️ Persistent storage failed, falling back');
                    }
                } else {
                    console.log('[MEMORY_BOOTSTRAP] ⚠️ System not healthy or no persistentMemory - using fallback');
                }
                  
                // Fall back to the actual fallback storage method
                console.log('[MEMORY_BOOTSTRAP] 🔄 Using fallback storage');
                const fallbackResult = await self.fallbackStore(userId, conversation);
                console.log('[MEMORY_BOOTSTRAP] 📊 Fallback storage result:', JSON.stringify(fallbackResult));
                return fallbackResult;
                  
            } catch (error) {
                console.error('[MEMORY_BOOTSTRAP] ❌ Storage error:', error);
                console.error('[MEMORY_BOOTSTRAP] ❌ Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
                // Even on error, try fallback storage
                try {
                    return await self.fallbackStore(userId, conversation);
                } catch (fallbackError) {
                    console.error('[MEMORY_BOOTSTRAP] ❌ Fallback storage also failed:', fallbackError);
                    return {
                        success: false,
                        error: fallbackError.message || 'Storage failed completely'
                    };
                }
            }
        },

        // Additional methods for compatibility
        getMemoryStats: async (userId) => {
            await self.ensureInitialized();
            return await self.getMemoryStats(userId);
        },

        healthCheck: async () => {
            await self.ensureInitialized();
            return await self.healthCheck();
        }
    };
  }

  /**
   * Retrieve memory in the format your chat.js expects
   * CRITICAL FIX: Handle the object returned by getRelevantContext properly
   */
  async retrieveMemoryForChat(userId, message) {
    try {
      if (this.isHealthy && this.persistentMemory) {
        console.log('[MEMORY_BOOTSTRAP] 📡 Calling persistent memory getRelevantContext...');
        const memoryResult = await this.persistentMemory.getRelevantContext(userId, message, 2400);
          
        console.log('[MEMORY_BOOTSTRAP] 📊 Memory result type:', typeof memoryResult);
        console.log('[MEMORY_BOOTSTRAP] 📊 Memory result keys:', Object.keys(memoryResult || {}));
        console.log('[MEMORY_BOOTSTRAP] 📊 Context found:', memoryResult?.contextFound);
          
        // CRITICAL FIX: memoryResult is already an object with contextFound and memories
        if (memoryResult && memoryResult.contextFound) {
          console.log('[MEMORY_BOOTSTRAP] ✅ Found persistent memories, returning formatted result');
          return {
            contextFound: true,
            memories: memoryResult.memories, // This is already formatted as a string
            totalTokens: memoryResult.totalTokens || 0,
            memoryCount: memoryResult.categoriesUsed ? memoryResult.categoriesUsed.length : 1
          };
        } else {
          console.log('[MEMORY_BOOTSTRAP] ℹ️ No persistent memories found');
        }
      } else {
        console.log('[MEMORY_BOOTSTRAP] ⚠️ Persistent memory not healthy, skipping');
      }

      // Fallback or no memories found
      console.log('[MEMORY_BOOTSTRAP] 🔄 Using fallback memory retrieval');
      return await this.fallbackRetrieve(userId, message);

    } catch (error) {
      console.error('[MEMORY_BOOTSTRAP] ❌ Retrieval error:', error);
      return await this.fallbackRetrieve(userId, message);
    }
  }

  /**
   * Store memory in the format your chat.js expects
   */
  async storeMemoryForChat(userId, conversationData) {
    try {
      if (this.isHealthy && this.persistentMemory) {
        const result = await this.persistentMemory.storeMemory(
          userId,
          conversationData,
          {
            source: 'chat_conversation',
            metadata: {
              timestamp: Date.now(),
              type: 'conversation'
            }
          }
        );

        if (result && result.success) {
          console.log('[MEMORY_BOOTSTRAP] ✅ Conversation stored successfully');
          return { success: true, id: result.memoryId };
        }
      }

      // Fallback storage
      return await this.fallbackStore(userId, conversationData);

    } catch (error) {
      console.error('[MEMORY_BOOTSTRAP] Storage error:', error);
      return await this.fallbackStore(userId, conversationData);
    }
  }

  /**
   * Fallback memory retrieval for when persistent memory fails
   */
  async fallbackRetrieve(userId, message) {
    try {
      console.log(`[MEMORY_BOOTSTRAP] 🔍 Fallback retrieve for user: ${userId}`);
      const userMemories = this.fallbackMemory.get(userId) || [];
        
      if (userMemories.length === 0) {
        console.log('[MEMORY_BOOTSTRAP] ℹ️ No fallback memories found');
        return {
          contextFound: false,
          memories: '',
          totalTokens: 0,
          memoryCount: 0
        };
      }

      // Simple keyword matching for fallback
      const messageLower = message.toLowerCase();
      const relevantMemories = userMemories
        .filter(memory => {
          const contentLower = memory.content.toLowerCase();
          const words = messageLower.split(' ').filter(w => w.length > 3);
          return words.some(word => contentLower.includes(word));
        })
        .slice(0, 3); // Limit to 3 most recent relevant memories

      if (relevantMemories.length > 0) {
        const formattedMemories = relevantMemories
          .map(mem => mem.content)
          .join('\n');

        console.log(`[MEMORY_BOOTSTRAP] ✅ Found ${relevantMemories.length} fallback memories`);
        return {
          contextFound: true,
          memories: `=== MEMORY CONTEXT ===\n${formattedMemories}\n=== END CONTEXT ===\n`,
          totalTokens: Math.ceil(formattedMemories.length / 4),
          memoryCount: relevantMemories.length
        };
      }

      console.log('[MEMORY_BOOTSTRAP] ℹ️ No relevant fallback memories found');
      return {
        contextFound: false,
        memories: '',
        totalTokens: 0,
        memoryCount: 0
      };

    } catch (error) {
      console.error('[MEMORY_BOOTSTRAP] Fallback retrieval error:', error);
      return {
        contextFound: false,
        memories: '',
        totalTokens: 0,
        memoryCount: 0
      };
    }
  }

  /**
   * Fallback memory storage for when persistent memory fails
   */
  async fallbackStore(userId, conversationData) {
    try {
      console.log(`[MEMORY_BOOTSTRAP] 🔄 Fallback store called for user: ${userId}`);
        
      if (!this.fallbackMemory.has(userId)) {
        this.fallbackMemory.set(userId, []);
      }

      const userMemories = this.fallbackMemory.get(userId);
      const newMemory = {
        content: conversationData,
        timestamp: Date.now(),
        id: Date.now() + Math.random()
      };
        
      userMemories.push(newMemory);

      // Keep only last 50 memories per user to prevent memory leaks
      if (userMemories.length > 50) {
        userMemories.splice(0, userMemories.length - 50);
      }

      this.fallbackMemory.set(userId, userMemories);
        
      console.log(`[MEMORY_BOOTSTRAP] ⚠️ Stored in fallback memory (persistent memory unavailable) - ID: ${newMemory.id}, Total memories: ${userMemories.length}`);
      return { success: true, mode: 'fallback', id: newMemory.id };

    } catch (error) {
      console.error('[MEMORY_BOOTSTRAP] Fallback storage error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(userId) {
    try {
      if (this.isHealthy && this.persistentMemory) {
        return await this.persistentMemory.getMemoryStats(userId);
      }

      // Fallback stats
      const userMemories = this.fallbackMemory.get(userId) || [];
      return {
        totalMemories: userMemories.length,
        totalTokens: userMemories.reduce((sum, mem) => sum + Math.ceil(mem.content.length / 4), 0),
        mode: 'fallback'
      };
    } catch (error) {
      console.error('[MEMORY_BOOTSTRAP] Stats error:', error);
      return { totalMemories: 0, totalTokens: 0, mode: 'error' };
    }
  }

  /**
   * Health check for memory system
   */
  async healthCheck() {
    try {
      if (this.persistentMemory) {
        const health = await this.persistentMemory.getSystemHealth();
        return {
          status: health.overall ? 'healthy' : 'degraded',
          mode: this.isHealthy ? 'persistent' : 'fallback',
          lastCheck: new Date().toISOString(),
          fallbackMemories: this.fallbackMemory.size
        };
      }

      return {
        status: 'fallback',
        mode: 'fallback',
        lastCheck: new Date().toISOString(),
        fallbackMemories: this.fallbackMemory.size
      };
    } catch (error) {
      return {
        status: 'error',
        mode: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

/**
   * Get memory system instance (for server.js compatibility)
   * YOUR SERVER.JS IS CALLING THIS METHOD
   */
  getMemorySystem() {
    const self = this;
    // Always trigger initialization when accessed
    if (!this.initStarted) {
      this.ensureInitialized();
    }
      
    return {
      getRelevantContext: async (userId, message, tokenLimit = 2400) => {
       await self.ensureInitialized();
       return await self.retrieveMemoryForChat(userId, message, tokenLimit);
     },
      storeMemory: async (userId, conversationData) => {
        await self.ensureInitialized();
        return await self.storeMemoryForChat(userId, conversationData);
      },
      isHealthy: () => self.isHealthy,
      getStats: async (userId) => {
        await self.ensureInitialized();
        return await self.getMemoryStats(userId);
      }
    };
  }

  /**
   * Get vault loader (for server.js compatibility)   
   * YOUR SERVER.JS IS CALLING THIS METHOD
   */
  getVaultLoader() {
    return {
      isReady: () => true,
      getStatus: () => ({ 
        status: 'vault_loader_ready',
        message: 'Vault loader interface active'
      }),
      initialize: async () => ({ success: true })
    };
  }

  /**
   * Check if system is ready (for server.js compatibility)
   * YOUR SERVER.JS IS CALLING THIS METHOD    
   */
  isReady() {
    return this.isHealthy || this.fallbackMemory.size >= 0; // Always ready (fallback mode works)
  }
    
  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('[MEMORY_BOOTSTRAP] 🔄 Shutting down memory system...');
      
    try {
      if (this.persistentMemory && this.persistentMemory.shutdown) {
        await this.persistentMemory.shutdown();
      }

      this.fallbackMemory.clear();
        
      // Clean up global
      if (global.memorySystem) {
        delete global.memorySystem;
      }
        
      console.log('[MEMORY_BOOTSTRAP] ✅ Shutdown complete');
    } catch (error) {
      console.error('[MEMORY_BOOTSTRAP] ❌ Shutdown error:', error);
    }
  }
}

// Export singleton instance
const memoryBootstrap = new MemoryBootstrap();

// Set up global interface immediately on load (for compatibility)
memoryBootstrap.setupGlobalInterface();

export default memoryBootstrap;
