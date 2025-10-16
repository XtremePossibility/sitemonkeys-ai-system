// COMPLETE CARING FAMILY INTELLIGENCE SYSTEM
// Preserves all breakthrough insights from this conversation
// Ready for immediate Railway deployment
//Redeploy2
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
const orchestrator = new Orchestrator();

// ===== CRITICAL RAILWAY ERROR HANDLERS =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  // Don't exit - Railway will restart if we do
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
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
        
        // FIX: Use initialize() instead of ensureInitialized()
        const initResult = await Promise.race([
            persistentMemory.initialize(),
            timeoutPromise
        ]);
        
        console.log(`[SERVER] ✅ Memory system initialized successfully: ${initResult}`);
        
        // Verify memory system is working
        console.log('[SERVER] 📊 Memory system verification:', {
            available: !!global.memorySystem,
            ready: persistentMemory.isReady()
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