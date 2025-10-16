// COMPLETE CARING FAMILY INTELLIGENCE SYSTEM
// Preserves all breakthrough insights from this conversation
// Ready for immediate Railway deployment
//Redeploy2

console.log('[SERVER] 🎬 Starting Site Monkeys AI System...');
console.log('[SERVER] 📦 Loading dependencies...');

import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { exec } from 'child_process';
import { persistentMemory } from './api/categories/memory/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Lazy load googleapis to avoid 200-600MB memory spike at startup
import axios from 'axios';
import JSZip from 'jszip';
import xml2js from 'xml2js';
import zlib from 'zlib';
import { promisify } from 'util';
import { uploadMiddleware, handleFileUpload } from './api/upload-file.js';
import { analysisMiddleware, handleAnalysisUpload } from './api/upload-for-analysis.js';
import { extractedDocuments } from './api/upload-for-analysis.js';
import repoSnapshotRoute from './api/repo-snapshot.js';
import { addInventoryEndpoint } from './system-inventory-endpoint.js';
import Orchestrator from './api/core/orchestrator.js';

console.log('[SERVER] ✅ Dependencies loaded');
console.log('[SERVER] 🎯 Initializing Orchestrator...');

const orchestrator = new Orchestrator();

console.log('[SERVER] ✅ Orchestrator created');

// ===== CRITICAL RAILWAY ERROR HANDLERS =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  console.error('Promise:', promise);
  // Don't exit - Railway will restart if we do
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Log but continue running
});

// NOW declare your variables:
const app = express();
addInventoryEndpoint(app);

// 🔐 SESSION CONFIGURATION
app.use(session({
  secret: process.env.SESSION_SECRET || 'sitemonkeys', // any random string
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax',
  }
}));

// ===== APPLICATION STARTUP MEMORY INITIALIZATION =====
console.log('[SERVER] 🚀 Initializing memory systems at application startup...');

// CRITICAL FIX: Move async initialization inside an async function
async function initializeMemorySystem() {
    console.log('[SERVER] 🚀 Starting memory system initialization...');
    
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Memory init timeout')), 30000)
        );
        
        // NOTE: After PR #39 reorganization, persistentMemory is a thin wrapper
        // Access coreSystem.initialize() directly since persistentMemory doesn't expose initialize()
        const initResult = await Promise.race([
            persistentMemory.coreSystem.initialize(),
            timeoutPromise
        ]);
        
        console.log(`[SERVER] ✅ Memory system initialized successfully: ${initResult}`);
        
        // Verify memory system is working
        console.log('[SERVER] 📊 Memory system verification:', {
            available: !!global.memorySystem,
            ready: persistentMemory.coreSystem?.isInitialized || false
        });
        
    } catch (initError) {
        console.error('[SERVER] ❌ Memory system initialization error:', {
            message: initError.message,
            stack: initError.stack?.substring(0, 500)
        });
        
        console.log('[SERVER] 🔄 Server will continue with fallback memory only');
    }
    
    console.log('[SERVER] 📊 Memory system initialization phase complete');
}

// ===== MIDDLEWARE CONFIGURATION =====
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

console.log('[SERVER] ✅ Middleware configured');

// ===== API ROUTES =====

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    orchestrator: {
      initialized: orchestrator.initialized
    }
  });
});

// Chat endpoint - main AI processing
app.post('/api/chat', async (req, res) => {
  try {
    console.log('[CHAT] 📨 Received chat request');
    
    const {
      message,
      userId = 'anonymous',
      mode = 'truth_general',
      sessionId,
      documentContext,
      vaultEnabled = false,
      vaultContext,
      conversationHistory = []
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Process request through orchestrator
    const result = await orchestrator.processRequest({
      message,
      userId,
      mode,
      sessionId,
      documentContext,
      vaultEnabled,
      vaultContext,
      conversationHistory
    });

    res.json(result);

  } catch (error) {
    console.error('[CHAT] ❌ Error processing chat:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      response: 'I encountered an error processing your request. Please try again.'
    });
  }
});

// Upload endpoints
app.post('/api/upload', uploadMiddleware, handleFileUpload);
app.post('/api/upload-for-analysis', analysisMiddleware, handleAnalysisUpload);

// Repo snapshot endpoint
app.use('/api', repoSnapshotRoute);

console.log('[SERVER] ✅ Routes configured');

// ===== START HTTP SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SITE MONKEYS AI SYSTEM - SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`📡 Server listening on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🧠 Orchestrator initialized: ${orchestrator.initialized}`);
  console.log('='.repeat(60) + '\n');

  // Initialize memory system in background after server is stable
  console.log('[SERVER] 🔄 Starting background memory initialization...');
  initializeMemorySystem().catch(err => {
    console.error('[SERVER] ⚠️ Memory initialization failed in background:', err.message);
  });
});