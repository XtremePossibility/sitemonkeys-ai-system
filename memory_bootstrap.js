// memory_bootstrap.js
// Bootstrap and fallback system for Site Monkeys AI memory system

import PersistentMemory from './memory_system/persistent_memory.js';
import VaultLoader from './memory_system/vault_loader.js';

class MemoryBootstrap {
  constructor() {
    this.persistentMemory = new PersistentMemory();
    this.vaultLoader = new VaultLoader();
    this.fallbackMemory = new Map();
    this.isHealthy = false;
    this.lastHealthCheck = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialize the memory system with fallbacks
   */
  async initialize() {
    console.log('Initializing Site Monkeys AI Memory System...');

    try {
      // Try to initialize persistent memory
      const persistentSuccess = await this.initializePersistentMemory();
      
      if (persistentSuccess) {
        this.isHealthy = true;
        this.retryAttempts = 0;
        console.log('✅ Memory system initialized successfully');
        return { success: true, mode: 'persistent' };
      }

      // Fall back to in-memory mode
      console.warn('⚠️ Falling back to in-memory storage');
      this.initializeFallbackMemory();
      return { success: true, mode: 'fallback' };

    } catch (error) {
      console.error('❌ Memory system initialization failed:', error);
      this.initializeFallbackMemory();
      return { success: false, mode: 'fallback', error: error.message };
    }
  }

  /**
   * Initialize persistent memory with retries
   */
  async initializePersistentMemory() {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Attempting persistent memory initialization (${attempt}/${this.maxRetries})...`);
        
        const success = await this.persistentMemory.initialize();
        if (success) {
          console.log('✅ Persistent memory initialized');
          return true;
        }

        throw new Error('Persistent memory initialization returned false');
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    return false;
  }

  /**
   * Initialize fallback in-memory storage
   */
  initializeFallbackMemory() {
    console.log('Initializing fallback memory system...');
    this.fallbackMemory.clear();
    this.isHealthy = true; // Fallback is always "healthy"
    console.log('✅ Fallback memory system ready');
  }

  /**
   * Store memory with fallback support
   */
  async storeMemory(userId, content, options = {}) {
    try {
      if (this.isHealthy && this.persistentMemory) {
        const result = await this.persistentMemory.storeMemory(userId, content, options);
        if (result.success) {
          return result;
        }
        // If persistent storage fails, fall back
        console.warn('Persistent storage failed, using fallback');
      }

      // Fallback storage
      return this.storeFallbackMemory(userId, content, options);
    } catch (error) {
      console.error('Error storing memory:', error);
      return this.storeFallbackMemory(userId, content, options);
    }
  }

  /**
   * Get relevant context with fallback support
   */
  async getRelevantContext(userId, message, tokenLimit = 2400, options = {}) {
    try {
      if (this.isHealthy && this.persistentMemory) {
        const result = await this.persistentMemory.getRelevantContext(userId, message, tokenLimit, options);
        if (result && result.length >= 0) {
          return result;
        }
        console.warn('Persistent memory returned invalid result, using fallback');
      }

      // Fallback retrieval
      return this.getFallbackContext(userId, message, tokenLimit, options);
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return this.getFallbackContext(userId, message, tokenLimit, options);
    }
  }

  /**
   * Store memory in fallback system
   */
  storeFallbackMemory(userId, content, options = {}) {
    try {
      if (!this.fallbackMemory.has(userId)) {
        this.fallbackMemory.set(userId, []);
      }

      const userMemories = this.fallbackMemory.get(userId);
      const memory = {
        id: Date.now() + Math.random(),
        content: content.trim(),
        timestamp: new Date().toISOString(),
        metadata: options.metadata || {},
        tokenCount: Math.ceil(content.length / 4)
      };

      userMemories.push(memory);

      // Limit fallback memory to prevent memory leaks
      if (userMemories.length > 100) {
        userMemories.shift(); // Remove oldest
      }

      this.fallbackMemory.set(userId, userMemories);

      console.log(`Stored memory in fallback (${userMemories.length} total)`);
      return { success: true, id: memory.id, mode: 'fallback' };
    } catch (error) {
      console.error('Error storing fallback memory:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get context from fallback system
   */
  getFallbackContext(userId, message, tokenLimit = 2400, options = {}) {
    try {
      const userMemories = this.fallbackMemory.get(userId) || [];
      
      if (userMemories.length === 0) {
        return [];
      }

      const messageLower = message.toLowerCase();
      let relevantMemories = [];
      let totalTokens = 0;

      // Simple relevance scoring for fallback
      const scoredMemories = userMemories
        .map(memory => {
          let score = 0;
          const contentLower = memory.content.toLowerCase();
          
          // Keyword matching
          const words = messageLower.split(' ').filter(w => w.length > 3);
          const matches = words.filter(word => contentLower.includes(word));
          score += matches.length / words.length;

          // Recency boost
          const hoursOld = (Date.now() - Date.parse(memory.timestamp)) / (1000 * 60 * 60);
          if (hoursOld < 24) score += 0.2;
          else if (hoursOld < 168) score += 0.1;

          return { ...memory, relevanceScore: score };
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Select memories within token limit
      for (const memory of scoredMemories) {
        if (totalTokens + memory.tokenCount <= tokenLimit) {
          relevantMemories.push(memory);
          totalTokens += memory.tokenCount;
        }
        if (relevantMemories.length >= 10) break;
      }

      console.log(`Retrieved ${relevantMemories.length} memories from fallback (${totalTokens} tokens)`);
      return relevantMemories;
    } catch (error) {
      console.error('Error getting fallback context:', error);
      return [];
    }
  }

  /**
   * Load vault memory if in Site Monkeys mode
   */
  async loadVaultMemory(mode) {
    if (mode !== 'site_monkeys') {
      return null;
    }

    try {
      console.log('Loading Site Monkeys vault memory...');
      const vaultMemory = await this.vaultLoader.loadVault();
      
      if (vaultMemory) {
        console.log('✅ Vault memory loaded successfully');
        return vaultMemory;
      }
      
      console.warn('⚠️ Vault memory not available');
      return null;
    } catch (error) {
      console.error('❌ Error loading vault memory:', error);
      return null;
    }
  }

  /**
   * Get memory system status and statistics
   */
  async getMemoryStats(userId) {
    try {
      if (this.isHealthy && this.persistentMemory) {
        const stats = await this.persistentMemory.getMemoryStats(userId);
        return { ...stats, mode: 'persistent' };
      }

      // Fallback stats
      const userMemories = this.fallbackMemory.get(userId) || [];
      const totalTokens = userMemories.reduce((sum, mem) => sum + mem.tokenCount, 0);

      return {
        totalMemories: userMemories.length,
        totalTokens,
        avgRelevance: 0.5,
        categories: [],
        categoriesUsed: 0,
        mode: 'fallback'
      };
    } catch (error) {
      console.error('Error getting memory stats:', error);
      return {
        totalMemories: 0,
        totalTokens: 0,
        avgRelevance: 0,
        categories: [],
        categoriesUsed: 0,
        mode: 'error'
      };
    }
  }

  /**
   * Perform health check and attempt recovery
   */
  async healthCheck() {
    const now = Date.now();
    
    // Don't check too frequently
    if (this.lastHealthCheck && (now - this.lastHealthCheck) < 30000) {
      return {
        status: this.isHealthy ? 'healthy' : 'degraded',
        lastCheck: new Date(this.lastHealthCheck).toISOString(),
        mode: this.isHealthy ? 'persistent' : 'fallback'
      };
    }

    this.lastHealthCheck = now;

    try {
      if (this.persistentMemory) {
        const healthResult = await this.persistentMemory.healthCheck();
        
        if (healthResult.status === 'healthy') {
          if (!this.isHealthy) {
            console.log('🔄 Memory system recovered, switching back to persistent mode');
            this.isHealthy = true;
            this.retryAttempts = 0;
          }
        } else {
          if (this.isHealthy) {
            console.warn('⚠️ Memory system degraded, switching to fallback mode');
            this.isHealthy = false;
          }
        }

        return {
          status: this.isHealthy ? 'healthy' : 'degraded',
          mode: this.isHealthy ? 'persistent' : 'fallback',
          lastCheck: new Date(now).toISOString(),
          details: healthResult,
          fallbackMemories: Array.from(this.fallbackMemory.keys()).reduce((sum, key) => 
            sum + this.fallbackMemory.get(key).length, 0
          )
        };
      }
    } catch (error) {
      console.error('Health check failed:', error);
      this.isHealthy = false;
    }

    return {
      status: 'degraded',
      mode: 'fallback',
      lastCheck: new Date(now).toISOString(),
      error: 'Persistent memory unavailable',
      fallbackMemories: Array.from(this.fallbackMemory.keys()).reduce((sum, key) => 
        sum + this.fallbackMemory.get(key).length, 0
      )
    };
  }

  /**
   * Attempt to recover persistent memory
   */
  async attemptRecovery() {
    if (this.isHealthy) return true;

    console.log('🔄 Attempting memory system recovery...');
    
    try {
      const success = await this.initializePersistentMemory();
      if (success) {
        this.isHealthy = true;
        console.log('✅ Memory system recovery successful');
        return true;
      }
    } catch (error) {
      console.error('❌ Recovery attempt failed:', error);
    }

    return false;
  }

  /**
   * Migrate fallback memories to persistent storage
   */
  async migrateFallbackMemories() {
    if (!this.isHealthy || this.fallbackMemory.size === 0) {
      return { migrated: 0, errors: 0 };
    }

    console.log('🔄 Migrating fallback memories to persistent storage...');
    
    let migrated = 0;
    let errors = 0;

    for (const [userId, memories] of this.fallbackMemory.entries()) {
      for (const memory of memories) {
        try {
          const result = await this.persistentMemory.storeMemory(
            userId, 
            memory.content, 
            {
              metadata: {
                ...memory.metadata,
                migratedFromFallback: true,
                originalTimestamp: memory.timestamp
              }
            }
          );
          
          if (result.success) {
            migrated++;
          } else {
            errors++;
          }
        } catch (error) {
          console.error('Error migrating memory:', error);
          errors++;
        }
      }
    }

    // Clear fallback memories after successful migration
    if (errors === 0) {
      this.fallbackMemory.clear();
      console.log(`✅ Successfully migrated ${migrated} memories`);
    } else {
      console.warn(`⚠️ Migration completed with errors: ${migrated} migrated, ${errors} errors`);
    }

    return { migrated, errors };
  }

  /**
   * Format memory context for AI injection
   */
  formatForAI(memories, options = {}) {
    if (this.isHealthy && this.persistentMemory) {
      return this.persistentMemory.formatForAI(memories, options);
    }

    // Simple fallback formatting
    if (!memories || memories.length === 0) return '';

    let formatted = '=== CONTEXT ===\n';
    for (const memory of memories) {
      formatted += `${memory.content}\n`;
    }
    formatted += '=== END CONTEXT ===\n\n';
    
    return formatted;
  }

  /**
   * Utility: Sleep function for retries
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get detailed system information
   */
  getSystemInfo() {
    return {
      isHealthy: this.isHealthy,
      mode: this.isHealthy ? 'persistent' : 'fallback',
      retryAttempts: this.retryAttempts,
      maxRetries: this.maxRetries,
      lastHealthCheck: this.lastHealthCheck ? new Date(this.lastHealthCheck).toISOString() : null,
      fallbackMemoryUsers: this.fallbackMemory.size,
      fallbackMemoriesTotal: Array.from(this.fallbackMemory.values())
        .reduce((sum, memories) => sum + memories.length, 0)
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🔄 Shutting down memory system...');
    
    try {
      // Attempt to migrate any remaining fallback memories
      if (this.isHealthy && this.fallbackMemory.size > 0) {
        await this.migrateFallbackMemories();
      }

      // Close database connections
      if (this.persistentMemory && this.persistentMemory.dbManager) {
        await this.persistentMemory.dbManager.close();
      }

      // Clear fallback memory
      this.fallbackMemory.clear();
      
      console.log('✅ Memory system shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

// Export singleton instance
export default new MemoryBootstrap();
