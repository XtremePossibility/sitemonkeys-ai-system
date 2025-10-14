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

      // --- FINAL PATCH: confirm core health after initialization completes ---
      (async () => {
        try {
          const coreHealth = await this.coreSystem.getSystemHealth();
          if (coreHealth && coreHealth.overall) {
            this.logger.info('[HEALTH] Post-initialization check: core system healthy, switching to normal mode');
            this.mode = 'normal';
            this.healthStatus.core = coreHealth;
          } else {
            this.logger.warn('[HEALTH] Post-initialization check still failing:', coreHealth);
          }
        } catch (e) {
          this.logger.error('[HEALTH] Post-initialization check exception:', e.message);
        }
      })();

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

  // ... rest of the file unchanged ...
}

// Export instance, not class - ready for immediate use
const persistentMemory = new PersistentMemoryOrchestrator();

export default persistentMemory;
