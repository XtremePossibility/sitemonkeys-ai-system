// ================================================================
// core.js - Database & Infrastructure Management Hub
// Consolidates database logic from 4+ sources into unified system
// ================================================================

import { Pool } from 'pg';

class CoreSystem {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
    this.fallbackMemory = new Map();
    this.healthStatus = {
      overall: false,
      database: { healthy: false },
      initialized: false,
      lastCheck: null
    };

    // Valid category names (underscore format)
    this.validCategories = [
      'mental_emotional',
      'health_wellness',
      'relationships_social',
      'work_career',
      'money_income_debt',
      'money_spending_goals',
      'goals_active_current',
      'goals_future_dreams',
      'tools_tech_workflow',
      'daily_routines_habits',
      'personal_life_interests'
    ];

    this.categoryLimits = {
      tokenLimit: 50000,
      memoryLimit: 1000
    };

    this.logger = {
      log: (message) => console.log(`[CORE] ${new Date().toISOString()} ${message}`),
      error: (message, error) => console.error(`[CORE ERROR] ${new Date().toISOString()} ${message}`, error),
      warn: (message) => console.warn(`[CORE WARN] ${new Date().toISOString()} ${message}`)
    };
  }

  async initialize() {
    this.logger.log('Initializing Core System...');

    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable not found');
      }

      // Connection Pool Management with specified configuration
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 30,                      // Increased from 20
        idleTimeoutMillis: 60000,     // Doubled to 60s
        connectionTimeoutMillis: 5000, // Increased from 2s
        allowExitOnIdle: true          // Clean up idle connections
      });

      // --- Keep pool healthy between requests ---
      this.pool.on('remove', () => {
        this.logger.warn('[DB] Client removed from pool — reconnecting soon');
      });

      this.pool.on('error', (err) => {
        this.logger.error('[DB] Pool error:', err);
      });

      // Lightweight keep-alive every 30 s to prevent idle shutdown
      setInterval(async () => {
        try {
          await this.pool.query('SELECT 1');
        } catch (e) {
          this.logger.error('[DB] Keep-alive failed:', e);
          this.logger.warn('[DB] Attempting to reconnect...');
          await this.pool.end();
          this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
        }
      }, 30000);

      // Pool event handling with detailed logging
      this.pool.on('connect', (client) => {
        this.logger.log('Database client connected');
      });

      this.pool.on('error', (err, client) => {
        this.logger.error('Database pool error:', err);
      });

      this.pool.on('remove', (client) => {
        this.logger.log('Database client removed from pool');
      });

      // Test connection - Level 1 Health Check
      await this.executeQuery('SELECT NOW() as current_time');
      this.logger.log('Database connection established');

      // Schema Management & Migration
      await this.createDatabaseSchema();

      // Initialize health monitoring
      await this.updateHealthStatus();

      this.isInitialized = true;
      this.logger.log('Core System initialized successfully');
      return true;

    } catch (error) {
      this.logger.error('Core System initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }
