// memory_bootstrap.js
// FIXED: Compatible with your existing chat.js system
// Sets up global.memorySystem as expected by your chat handler

import PersistentMemory from './memory_system/persistent_memory.js';

class MemoryBootstrap {
  constructor() {
    this.persistentMemory = null;
    this.isHealthy = false;
    this.lastHealthCheck = null;
    this.fallbackMemory = new Map();
  }

  /**
   * Initialize memory system and set up global.memorySystem
   * This is designed to be called from server.js
   */
  async initialize() {
    console.log('[MEMORY] 🚀 Initializing Site Monkeys Memory System...');

    try {
      // Initialize persistent memory
      this.persistentMemory = new PersistentMemory();
      const success = await this.persistentMemory.initialize();
      
      if (success) {
        this.isHealthy = true;
        console.log('[MEMORY] ✅ Persistent memory system ready');
      } else {
        console.log('[MEMORY] ⚠️ Falling back to in-memory storage');
        this.isHealthy = false;
      }

      // Set up global.memorySystem interface for your chat.js
      global.memorySystem = {
        // Your chat.js expects this exact method signature
        retrieveMemory: async (userId, message) => {
          return await this.retrieveMemoryForChat(userId, message);
        },

        // Your chat.js expects this exact method signature  
        storeMemory: async (userId, conversationData) => {
          return await this.storeMemoryForChat(userId, conversationData);
        },

        // Additional methods for compatibility
        getMemoryStats: async (userId) => {
          return await this.getMemoryStats(userId);
        },

        healthCheck: async () => {
          return await this.healthCheck();
        }
      };

      console.log('[MEMORY] ✅ Global memory system interface established');
      return { success: true, mode: this.isHealthy ? 'persistent' : 'fallback' };

    } catch (error) {
      console.error('[MEMORY] ❌ Initialization failed:', error);
      
      // Set up fallback global.memorySystem
      global.memorySystem = {
        retrieveMemory: async (userId, message) => {
          return await this.fallbackRetrieve(userId, message);
        },
        storeMemory: async (userId, conversationData) => {
          return await this.fallbackStore(userId, conversationData);
        }
      };

      return { success: false, mode: 'fallback', error: error.message };
    }
  }

  /**
   * Retrieve memory in the format your chat.js expects
   */
  async retrieveMemoryForChat(userId, message) {
    try {
      if (this.isHealthy && this.persistentMemory) {
        const memories = await this.persistentMemory.getRelevantContext(userId, message, 2400);
        
        if (memories && memories.length > 0) {
          const formattedMemories = this.persistentMemory.formatForAI(memories, {
            includeMetadata: false,
            maxLength: 2400
          });

          return {
            contextFound: true,
            memories: formattedMemories,
            totalTokens: memories.reduce((sum, mem) => sum + (mem.tokenCount || 0), 0),
            memoryCount: memories.length
          };
        }
      }

      // Fallback or no memories found
      return {
        contextFound: false,
        memories: '',
        totalTokens: 0,
        memoryCount: 0
      };

    } catch (error) {
      console.error('[MEMORY] Retrieval error:', error);
      return this.fallbackRetrieve(userId, message);
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

        if (result.success) {
          console.log('[MEMORY] ✅ Conversation stored successfully');
          return { success: true, id: result.id };
        }
      }

      // Fallback storage
      return await this.fallbackStore(userId, conversationData);

    } catch (error) {
      console.error('[MEMORY] Storage error:', error);
      return await this.fallbackStore(userId, conversationData);
    }
  }

  /**
   * Fallback memory retrieval for when persistent memory fails
   */
  async fallbackRetrieve(userId, message) {
    try {
      const userMemories = this.fallbackMemory.get(userId) || [];
      
      if (userMemories.length === 0) {
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

        return {
          contextFound: true,
          memories: `=== MEMORY CONTEXT ===\n${formattedMemories}\n=== END CONTEXT ===\n`,
          totalTokens: Math.ceil(formattedMemories.length / 4),
          memoryCount: relevantMemories.length
        };
      }

      return {
        contextFound: false,
        memories: '',
        totalTokens: 0,
        memoryCount: 0
      };

    } catch (error) {
      console.error('[MEMORY] Fallback retrieval error:', error);
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
      if (!this.fallbackMemory.has(userId)) {
        this.fallbackMemory.set(userId, []);
      }

      const userMemories = this.fallbackMemory.get(userId);
      userMemories.push({
        content: conversationData,
        timestamp: Date.now(),
        id: Date.now() + Math.random()
      });

      // Keep only last 50 memories per user to prevent memory leaks
      if (userMemories.length > 50) {
        userMemories.splice(0, userMemories.length - 50);
      }

      this.fallbackMemory.set(userId, userMemories);
      
      console.log('[MEMORY] ⚠️ Stored in fallback memory (persistent memory unavailable)');
      return { success: true, mode: 'fallback' };

    } catch (error) {
      console.error('[MEMORY] Fallback storage error:', error);
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
      console.error('[MEMORY] Stats error:', error);
      return { totalMemories: 0, totalTokens: 0, mode: 'error' };
    }
  }

  /**
   * Health check for memory system
   */
  async healthCheck() {
    try {
      if (this.persistentMemory) {
        const health = await this.persistentMemory.healthCheck();
        return {
          status: health.status === 'healthy' ? 'healthy' : 'degraded',
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
    if (!this.isHealthy) {
      console.log('[MEMORY] getMemorySystem called but system not healthy - returning fallback');
      return {
        getRelevantContext: async (userId, message, tokenLimit = 2400) => {
          return await this.fallbackRetrieve(userId, message);
        },
        storeMemory: async (userId, conversationData) => {
          return await this.fallbackStore(userId, conversationData);
        },
        isHealthy: () => false
      };
    }
    
    return {
      getRelevantContext: async (userId, message, tokenLimit = 2400) => {
        const result = await this.retrieveMemoryForChat(userId, message);
        return result;
      },
      storeMemory: async (userId, conversationData) => {
        return await this.storeMemoryForChat(userId, conversationData);
      },
      isHealthy: () => this.isHealthy,
      getStats: async (userId) => {
        return await this.getMemoryStats(userId);
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
    console.log('[MEMORY] 🔄 Shutting down memory system...');
    
    try {
      if (this.persistentMemory && this.persistentMemory.dbManager) {
        await this.persistentMemory.dbManager.close();
      }

      this.fallbackMemory.clear();
      
      // Clean up global
      if (global.memorySystem) {
        delete global.memorySystem;
      }
      
      console.log('[MEMORY] ✅ Shutdown complete');
    } catch (error) {
      console.error('[MEMORY] ❌ Shutdown error:', error);
    }
  }
}

// Export singleton instance
const memoryBootstrap = new MemoryBootstrap();
export default memoryBootstrap;
