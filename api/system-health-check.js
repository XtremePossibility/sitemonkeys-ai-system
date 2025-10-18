/**
 * SiteMonkeys AI Proprietary Module
 * Copyright © 2025 SiteMonkeys AI. All rights reserved.
 * 
 * System health check endpoint - tests critical system components
 */

import { coreSystem } from './categories/memory/index.js';
import fs from 'fs';
import path from 'path';

/**
 * Run all system health checks
 */
export async function runSystemHealthCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    overall: 'healthy',
    checks: {}
  };

  // Check 1: Database Connection
  try {
    if (coreSystem.pool) {
      await coreSystem.pool.query('SELECT 1');
      results.checks.database = { status: 'ok', message: 'Database connection successful' };
    } else {
      results.checks.database = { status: 'degraded', message: 'Database pool not initialized' };
      if (results.overall === 'healthy') results.overall = 'degraded';
    }
  } catch (error) {
    results.checks.database = { status: 'failed', message: error.message };
    results.overall = 'unhealthy';
  }

  // Check 2: Memory System
  try {
    if (coreSystem.isInitialized) {
      results.checks.memory = { 
        status: 'ok', 
        message: 'Memory system initialized',
        isInitialized: true
      };
    } else {
      results.checks.memory = { 
        status: 'degraded', 
        message: 'Memory system not yet initialized' 
      };
      if (results.overall === 'healthy') results.overall = 'degraded';
    }
  } catch (error) {
    results.checks.memory = { status: 'degraded', message: error.message };
    if (results.overall === 'healthy') results.overall = 'degraded';
  }

  // Check 3: Critical Files Exist
  const criticalFiles = [
    'api/core/orchestrator.js',
    'api/categories/memory/index.js',
    'api/core/intelligence/semantic_analyzer.js',
    'api/categories/memory/internal/core.js'
  ];

  let missingFiles = [];
  for (const file of criticalFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length === 0) {
    results.checks.files = { status: 'ok', message: 'All critical files present' };
  } else {
    results.checks.files = { 
      status: 'failed', 
      message: `Missing files: ${missingFiles.join(', ')}` 
    };
    results.overall = 'unhealthy';
  }

  // Check 4: Environment Variables
  const requiredEnvVars = ['DATABASE_URL', 'OPENAI_API_KEY'];
  let missingEnvVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  }

  if (missingEnvVars.length === 0) {
    results.checks.environment = { status: 'ok', message: 'Required environment variables set' };
  } else {
    results.checks.environment = { 
      status: 'failed', 
      message: `Missing: ${missingEnvVars.join(', ')}` 
    };
    results.overall = 'unhealthy';
  }

  // Check 5: SemanticAnalyzer (if available)
  try {
    const { SemanticAnalyzer } = await import('./core/intelligence/semantic_analyzer.js');
    if (SemanticAnalyzer) {
      results.checks.semanticAnalyzer = { 
        status: 'ok', 
        message: 'SemanticAnalyzer module loaded' 
      };
    }
  } catch (error) {
    results.checks.semanticAnalyzer = { 
      status: 'degraded', 
      message: 'SemanticAnalyzer initialization delayed or failed' 
    };
  }

  return results;
}

/**
 * Express route handler for /api/system-check
 */
export async function systemCheckHandler(req, res) {
  // Optional: protect with query parameter
  const expectedKey = process.env.SYSTEM_CHECK_KEY || 'healthcheck2025';
  if (req.query.key && req.query.key !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const results = await runSystemHealthCheck();
    const statusCode = results.overall === 'healthy' ? 200 : 
                       results.overall === 'degraded' ? 200 : 500;
    
    res.status(statusCode).json(results);
  } catch (error) {
    res.status(500).json({
      overall: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
