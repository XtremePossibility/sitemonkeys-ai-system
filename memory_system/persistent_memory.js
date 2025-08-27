// ================================================================
// persistent_memory.js - Main Orchestrator & Global Interface
// Primary entry point and orchestration hub for Site Monkeys Memory System
// ================================================================

import coreSystem from './core.js';
import intelligenceSystem from './intelligence.js';

class PersistentMemoryOrchestrator {
  constructor() {
    this.coreSystem = coreSystem;
    this.intelligenceSystem = intelligenceSystem;
    
    // System state management
    this.isInitialized = false;
    this.initPromise = null;
    this.initStarted = false;
    this.isHealthy = false;
    
    // Fallback memory for complete system failure
    this.fallbackMemory = new Map();
    this.lastHealthCheck = null;
    
    // Performance monitoring
    this.performanceStats = {
      totalRequests: 0,
      avgResponseTime: 0,
      successRate: 0,
      errorCount: 0,
      fallbackUsage: 0,
      lastReset: Date.now()
    };

    this.logger = {
      log: (message) => console.log(`[PERSISTENT_MEMORY] ${new Date().toISOString()} ${message}`),
      error: (message, error) => console.error(`[PERSISTENT_MEMORY ERROR] ${new Date().toISOString()} ${message}`, error),
      warn: (message) => console.warn(`[PERSISTENT_MEMORY WARN] ${new Date().toISOString()} ${message}`)
    };

    // Set up global interface immediately for compatibility
    this.setupGlobalInterface();
  }

  // ================================================================
  // AUTO-INITIALIZATION SYSTEM
  // ================================================================

  async ensureInitialized() {
    if (this.isHealthy && this.isInitialized) {
      return true; // Already initialized and healthy
    }
      
    if (this.initPromise) {
      // Initialization already in progress, wait for it
      return await this.initPromise;
    }
      
    if (!this.initStarted) {
      // Start initialization for the first time
      this.logger.log('Auto-initializing Site Monkeys Memory System...');
      this.initStarted = true;
      this.initPromise = this.initialize();
      return await this.initPromise;
    }
      
    return false;
  }

  async initialize() {
    this.logger.log('Initializing Persistent Memory System...');

    try {
      // Environment validation
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable not found');
      }

      // Step 1: Initialize Core System (Database & Infrastructure)
      this.logger.log('Step 1: Initializing Core System...');
      const coreInitialized = await this.coreSystem.initialize();
      if (!coreInitialized) {
        throw new Error('Core system initialization failed');
      }
      this.logger.log('Core System initialized successfully');

      // Step 2: Initialize Intelligence System
      this.logger.log('Step 2: Initializing Intelligence System...');
      const intelligenceInitialized = await this.intelligenceSystem.initialize();
      if (!intelligenceInitialized) {
        throw new Error('Intelligence system initialization failed');
      }
      this.logger.log('Intelligence System initialized successfully');

      // Step 3: Health verification across all subsystems
      this.logger.log('Step 3: Performing comprehensive health verification...');
      const healthStatus = await this.performComprehensiveHealthCheck();
      this.isHealthy = healthStatus.overall;
      
      if (this.isHealthy) {
        this.logger.log('All subsystems healthy - persistent mode active');
      } else {
        this.logger.warn('Some subsystems degraded - fallback capabilities activated');
      }

      // Step 4: Global interface is already set up in constructor
      this.logger.log('Step 4: Global memory interface active');

      this.isInitialized = true;
      this.logger.log(`Persistent Memory System initialization complete - Mode: ${this.isHealthy ? 'persistent' : 'fallback'}`);
      
      // Schedule periodic health monitoring
      setInterval(() => this.performPeriodicHealthCheck(), 300000); // Every 5 minutes
      
      return this.isHealthy;

    } catch (error) {
      this.logger.error('Critical initialization failure:', error);
      this.isInitialized = false;
      this.isHealthy = false;
      
      // Even on complete failure, ensure fallback capabilities
      this.logger.log('Activating emergency fallback mode');
      return false;
    }
  }

  // ================================================================
  // GLOBAL INTERFACE MANAGEMENT
  // ================================================================

  setupGlobalInterface() {
    const self = this;
    global.memorySystem = {
      retrieveMemory: async (userId, message) => {
        await self.ensureInitialized();
        return await self.retrieveMemoryForChat(userId, message);
      },
          
      storeMemory: async (userId, conversation) => {
        await self.ensureInitialized();
        return await self.storeMemoryForChat(userId, conversation);
      },

      getMemoryStats: async (userId) => {
        await self.ensureInitialized();
        return await self.getMemoryStats(userId);
      },

      healthCheck: async () => {
        await self.ensureInitialized();
        return await self.healthCheck();
      }
    };

    this.logger.log('Global memory interface established');
  }

  // ================================================================
  // MAIN ORCHESTRATION METHODS
  // ================================================================

  async retrieveMemoryForChat(userId, message) {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Retrieve memory request: ${userId}, query: "${message.substring(0, 50)}..."`);

      // System health check
      if (!this.isHealthy) {
        this.logger.warn('System not healthy, checking for recovery...');
        await this.attemptSystemRecovery();
      }

      if (this.isHealthy) {
        // Full system operation
        this.logger.log('Using persistent memory system for retrieval');
        
        // Step 1: Analyze and route the query
        const routing = await this.intelligenceSystem.analyzeAndRoute(message, userId);
        this.logger.log(`Query routed to: ${routing.primaryCategory}/${routing.subcategory} (confidence: ${routing.confidence.toFixed(3)})`);

        // Step 2: Extract relevant memories
        const memories = await this.intelligenceSystem.extractRelevantMemories(userId, message, routing);
        this.logger.log(`Extracted ${memories.length} relevant memories`);

        // Step 3: Format response
        if (memories.length > 0) {
          const formattedMemories = this.formatMemoriesForChat(memories);
          const totalTokens = memories.reduce((sum, m) => sum + (m.token_count || 0), 0);
          
          this.updatePerformanceStats(true, Date.now() - startTime);
          
          return {
            contextFound: true,
            memories: formattedMemories,
            totalTokens: totalTokens,
            memoryCount: memories.length,
            category: routing.primaryCategory,
            subcategory: routing.subcategory,
            confidence: routing.confidence
          };
        }
      }

      // Fallback retrieval
      this.logger.log('Using fallback memory retrieval');
      const fallbackResult = await this.fallbackRetrieve(userId, message);
      this.updatePerformanceStats(fallbackResult.contextFound, Date.now() - startTime);
      return fallbackResult;

    } catch (error) {
      this.logger.error('Error in retrieveMemoryForChat:', error);
      this.updatePerformanceStats(false, Date.now() - startTime);
      
      // Emergency fallback
      return await this.fallbackRetrieve(userId, message);
    }
  }

  async storeMemoryForChat(userId, conversationData) {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Store memory request: ${userId}, content length: ${conversationData.length}`);

      // System health check
      if (!this.isHealthy) {
        await this.attemptSystemRecovery();
      }

      if (this.isHealthy) {
        // Full system operation
        this.logger.log('Using persistent memory system for storage');
        
        // Step 1: Calculate relevance score
        const relevanceScore = await this.intelligenceSystem.calculateRelevanceScore(
          conversationData, 
          { source: 'chat_conversation', timestamp: Date.now() }
        );

        // Step 2: Analyze and route for categorization
        const routing = await this.intelligenceSystem.analyzeAndRoute(conversationData, userId);
        this.logger.log(`Memory categorized as: ${routing.primaryCategory}/${routing.subcategory}`);

        // Step 3: Store in database via core system
        const memoryObject = {
          userId: userId,
          content: conversationData,
          category_name: routing.primaryCategory,
          subcategory_name: routing.subcategory,
          relevance_score: relevanceScore,
          metadata: {
            source: 'chat_conversation',
            routing_confidence: routing.confidence,
            timestamp: Date.now(),
            emotional_weight: routing.semanticAnalysis?.emotionalWeight || 0,
            intent: routing.semanticAnalysis?.intent || 'general'
          }
        };

        const result = await this.coreSystem.storeMemory(memoryObject);
        
        if (result.success) {
          this.logger.log(`Memory stored successfully: ID ${result.memoryId}, ${result.tokenCount} tokens`);
          this.updatePerformanceStats(true, Date.now() - startTime);
          
          return {
            success: true,
            memoryId: result.memoryId,
            tokenCount: result.tokenCount,
            category: routing.primaryCategory,
            subcategory: routing.subcategory,
            relevanceScore: relevanceScore
          };
        }
      }

      // Fallback storage
      this.logger.log('Using fallback memory storage');
      const fallbackResult = await this.fallbackStore(userId, conversationData);
      this.updatePerformanceStats(fallbackResult.success, Date.now() - startTime);
      return fallbackResult;

    } catch (error) {
      this.logger.error('Error in storeMemoryForChat:', error);
      this.updatePerformanceStats(false, Date.now() - startTime);
      
      // Emergency fallback
      return await this.fallbackStore(userId, conversationData);
    }
  }

  async getMemoryStats(userId) {
    try {
      await this.ensureInitialized();

      if (this.isHealthy) {
        // Get comprehensive stats from core system
        const coreStats = await this.coreSystem.getUserStats(userId);
        const routingStats = this.intelligenceSystem.getRoutingStats();
        const extractionStats = this.intelligenceSystem.getExtractionStats();
        
        return {
          user: coreStats,
          routing: routingStats,
          extraction: extractionStats,
          system: {
            mode: 'persistent',
            healthy: this.isHealthy,
            uptime: Date.now() - this.performanceStats.lastReset
          },
          performance: this.getPerformanceStats()
        };
      } else {
        // Fallback stats
        const userMemories = this.fallbackMemory.get(userId) || [];
        return {
          user: {
            userId: userId,
            totalMemories: userMemories.length,
            totalTokens: userMemories.reduce((sum, mem) => sum + Math.ceil(mem.content.length / 4), 0),
            mode: 'fallback'
          },
          system: {
            mode: 'fallback',
            healthy: false,
            fallbackMemories: this.fallbackMemory.size
          }
        };
      }

    } catch (error) {
      this.logger.error('Error getting memory stats:', error);
      return {
        error: error.message,
        system: { mode: 'error', healthy: false }
      };
    }
  }

  async healthCheck() {
    try {
      const healthStatus = await this.performComprehensiveHealthCheck();
      
      return {
        overall: healthStatus.overall,
        status: healthStatus.status,
        initialized: this.isInitialized,
        subsystems: {
          core: healthStatus.core,
          intelligence: healthStatus.intelligence,
          orchestrator: healthStatus.orchestrator
        },
        performance: this.getPerformanceStats(),
        lastCheck: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        overall: false,
        status: 'unhealthy',
        initialized: false,
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  // ================================================================
  // COMPREHENSIVE HEALTH MONITORING
  // ================================================================

  async performComprehensiveHealthCheck() {
    try {
      const healthStatus = {
        overall: false,
        status: 'unknown',
        core: { healthy: false },
        intelligence: { healthy: false },
        orchestrator: { healthy: true }
      };

      // Core system health
      try {
        const coreHealth = await this.coreSystem.getSystemHealth();
        healthStatus.core = {
          healthy: coreHealth.overall,
          database: coreHealth.database,
          initialized: coreHealth.initialized,
          details: coreHealth.details
        };
      } catch (error) {
        this.logger.warn('Core health check failed:', error.message);
        healthStatus.core = { healthy: false, error: error.message };
      }

      // Intelligence system health
      try {
        const intelligenceStats = this.intelligenceSystem.getRoutingStats();
        healthStatus.intelligence = {
          healthy: true,
          totalRoutes: intelligenceStats.totalRoutes,
          avgConfidence: intelligenceStats.avgConfidence,
          cacheHitRate: intelligenceStats.cacheHitRate
        };
      } catch (error) {
        this.logger.warn('Intelligence health check failed:', error.message);
        healthStatus.intelligence = { healthy: false, error: error.message };
      }

      // Overall system status
      healthStatus.overall = healthStatus.core.healthy && healthStatus.intelligence.healthy;
      healthStatus.status = healthStatus.overall ? 'healthy' : 
                           (healthStatus.core.healthy || healthStatus.intelligence.healthy) ? 'degraded' : 'unhealthy';

      this.lastHealthCheck = Date.now();
      return healthStatus;

    } catch (error) {
      this.logger.error('Comprehensive health check failed:', error);
      return {
        overall: false,
        status: 'error',
        error: error.message,
        core: { healthy: false },
        intelligence: { healthy: false },
        orchestrator: { healthy: false }
      };
    }
  }

  async performPeriodicHealthCheck() {
    try {
      const healthStatus = await this.performComprehensiveHealthCheck();
      const previousHealth = this.isHealthy;
      this.isHealthy = healthStatus.overall;

      // Log health status changes
      if (previousHealth !== this.isHealthy) {
        if (this.isHealthy) {
          this.logger.log('System recovered - switching to persistent mode');
        } else {
          this.logger.warn('System degraded - fallback mode activated');
        }
      }

    } catch (error) {
      this.logger.error('Periodic health check failed:', error);
      this.isHealthy = false;
    }
  }

  async attemptSystemRecovery() {
    try {
      this.logger.log('Attempting system recovery...');
      
      // Try to reinitialize failed subsystems
      if (!this.coreSystem.isInitialized) {
        await this.coreSystem.initialize();
      }
      
      if (!this.intelligenceSystem.isInitialized) {
        await this.intelligenceSystem.initialize();
      }

      // Recheck health
      const healthStatus = await this.performComprehensiveHealthCheck();
      this.isHealthy = healthStatus.overall;
      
      if (this.isHealthy) {
        this.logger.log('System recovery successful');
      } else {
        this.logger.warn('System recovery partially successful');
      }

    } catch (error) {
      this.logger.error('System recovery failed:', error);
      this.isHealthy = false;
    }
  }

  // ================================================================
  // FALLBACK SYSTEM OPERATIONS
  // ================================================================

  async fallbackRetrieve(userId, message) {
    try {
      this.logger.log(`Fallback retrieve for user: ${userId}`);
      const userMemories = this.fallbackMemory.get(userId) || [];
        
      if (userMemories.length === 0) {
        return {
          contextFound: false,
          memories: '',
          totalTokens: 0,
          memoryCount: 0,
          mode: 'fallback'
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
        .slice(0, 3);

      if (relevantMemories.length > 0) {
        const formattedMemories = this.formatMemoriesForChat(relevantMemories);
        const totalTokens = relevantMemories.reduce((sum, mem) => sum + (mem.token_count || 0), 0);

        this.logger.log(`Found ${relevantMemories.length} fallback memories`);
        return {
          contextFound: true,
          memories: formattedMemories,
          totalTokens: totalTokens,
          memoryCount: relevantMemories.length,
          mode: 'fallback'
        };
      }

      return {
        contextFound: false,
        memories: '',
        totalTokens: 0,
        memoryCount: 0,
        mode: 'fallback'
      };

    } catch (error) {
      this.logger.error('Fallback retrieval error:', error);
      return {
        contextFound: false,
        memories: '',
        totalTokens: 0,
        memoryCount: 0,
        mode: 'error'
      };
    }
  }

  async fallbackStore(userId, conversationData) {
    try {
      this.logger.log(`Fallback store for user: ${userId}`);
        
      if (!this.fallbackMemory.has(userId)) {
        this.fallbackMemory.set(userId, []);
      }

      const userMemories = this.fallbackMemory.get(userId);
      const newMemory = {
        id: Date.now() + Math.random(),
        content: conversationData,
        timestamp: Date.now(),
        token_count: Math.ceil(conversationData.length / 4),
        category_name: 'fallback_general',
        subcategory_name: 'General'
      };
        
      userMemories.push(newMemory);

      // Keep only last 50 memories per user
      if (userMemories.length > 50) {
        userMemories.splice(0, userMemories.length - 50);
      }

      this.fallbackMemory.set(userId, userMemories);
      this.performanceStats.fallbackUsage++;
        
      this.logger.warn(`Stored in fallback memory - ID: ${newMemory.id}, Total: ${userMemories.length}`);
      
      return { 
        success: true, 
        memoryId: newMemory.id,
        tokenCount: newMemory.token_count,
        mode: 'fallback'
      };

    } catch (error) {
      this.logger.error('Fallback storage error:', error);
      return { success: false, error: error.message, mode: 'error' };
    }
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  formatMemoriesForChat(memories) {
    if (!memories || memories.length === 0) {
      return '';
    }

    return memories
      .map(memory => {
        const timeAgo = this.formatTimeAgo(memory.created_at || memory.timestamp);
        return `[${timeAgo}] ${memory.content}`;
      })
      .join('\n\n');
  }

  formatTimeAgo(timestamp) {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const days = Math.floor((now - time) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days/7)} weeks ago`;
    return `${Math.floor(days/30)} months ago`;
  }

  // ================================================================
  // PERFORMANCE MONITORING
  // ================================================================

  updatePerformanceStats(success, responseTime) {
    try {
      this.performanceStats.totalRequests++;
      
      // Update average response time
      const count = this.performanceStats.totalRequests;
      const currentAvg = this.performanceStats.avgResponseTime;
      this.performanceStats.avgResponseTime = ((currentAvg * (count - 1)) + responseTime) / count;
      
      // Update success rate
      if (!success) {
        this.performanceStats.errorCount++;
      }
      
      this.performanceStats.successRate = 
        ((this.performanceStats.totalRequests - this.performanceStats.errorCount) / 
         this.performanceStats.totalRequests) * 100;

    } catch (error) {
      this.logger.warn('Error updating performance stats:', error);
    }
  }

  getPerformanceStats() {
    return {
      totalRequests: this.performanceStats.totalRequests,
      avgResponseTime: Math.round(this.performanceStats.avgResponseTime),
      successRate: Number(this.performanceStats.successRate.toFixed(2)),
      errorCount: this.performanceStats.errorCount,
      fallbackUsage: this.performanceStats.fallbackUsage,
      uptime: Date.now() - this.performanceStats.lastReset,
      mode: this.isHealthy ? 'persistent' : 'fallback'
    };
  }

  // ================================================================
  // SYSTEM LIFECYCLE MANAGEMENT
  // ================================================================

  async shutdown() {
    try {
      this.logger.log('Shutting down Persistent Memory System...');
      
      // Shutdown subsystems in reverse order
      if (this.intelligenceSystem) {
        await this.intelligenceSystem.cleanup();
      }
      
      if (this.coreSystem) {
        await this.coreSystem.shutdown();
      }
      
      // Clear fallback memory
      this.fallbackMemory.clear();
      
      // Clean up global interface
      if (global.memorySystem) {
        delete global.memorySystem;
      }
      
      this.isInitialized = false;
      this.isHealthy = false;
      
      this.logger.log('Persistent Memory System shutdown completed');

    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }

  cleanup() {
    try {
      this.fallbackMemory.clear();
      this.intelligenceSystem?.cleanup();
      this.coreSystem?.cleanup();
      this.logger.log('System cleanup completed');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }

  // ================================================================
  // SYSTEM STATUS METHODS
  // ================================================================

  isReady() {
    return this.isInitialized && (this.isHealthy || this.fallbackMemory.size >= 0);
  }

  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      healthy: this.isHealthy,
      mode: this.isHealthy ? 'persistent' : 'fallback',
      uptime: Date.now() - this.performanceStats.lastReset,
      lastHealthCheck: this.lastHealthCheck ? new Date(this.lastHealthCheck).toISOString() : null,
      fallbackUsers: this.fallbackMemory.size
    };
  }
}

// Export instance, not class - ready for immediate use
const persistentMemory = new PersistentMemoryOrchestrator();

export default persistentMemory;
