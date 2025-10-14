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
    // this.setupGlobalInterface();
  }

  // ADD THIS METHOD:
  async ensureInitialized() {
    this.logger.log('ensureInitialized() called');
    
    // Prevent multiple simultaneous initialization attempts
    if (this.isInitialized) {
      this.logger.log('Already initialized - returning immediately');
      return 'already_initialized';
    }
    
    if (this.initStarted && this.initPromise) {
      this.logger.log('Initialization in progress - waiting for existing promise');
      return await this.initPromise;
    }
    
    // Mark initialization as started
    this.initStarted = true;
    
    // Create initialization promise
    this.initPromise = this._performInitialization();
    
    try {
      const result = await this.initPromise;
      this.isInitialized = true;
      this.isHealthy = true;
      this.logger.log('Initialization complete');
      return result;
    } catch (error) {
      this.logger.error('Initialization failed', error);
      this.isHealthy = false;
      throw error;
    }
  }

  async _performInitialization() {
    try {
      this.logger.log('Initializing core system...');
      await this.coreSystem.initialize();
      
      this.logger.log('Initializing intelligence system...');
      await this.intelligenceSystem.initialize();
      
      this.logger.log('Setting up global interface...');
      this.setupGlobalInterface();
      
      this.logger.log('Performing health check...');
      await this.performComprehensiveHealthCheck();
      
      return 'initialization_successful';
    } catch (error) {
      this.logger.error('Initialization process failed', error);
      throw error;
    }
  }

  isReady() {
    return this.isInitialized && this.isHealthy;
  }

  async performComprehensiveHealthCheck() {
    // Placeholder - implement health check logic
    this.lastHealthCheck = Date.now();
    this.isHealthy = true;
    return { healthy: true, timestamp: this.lastHealthCheck };
  }

  setupGlobalInterface() {
    // Placeholder - implement global interface setup
    global.memorySystem = this;
    this.logger.log('Global interface configured');
  }

  // ... rest of existing methods ...
}

// Export instance, not class - ready for immediate use
const persistentMemory = new PersistentMemoryOrchestrator();

export default persistentMemory;
