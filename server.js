// COMPLETE CARING FAMILY INTELLIGENCE SYSTEM
// Preserves all breakthrough insights from this conversation
// Ready for immediate Railway deployment
//Redeploy
import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import persistentMemory from './memory_system/persistent_memory.js';
import intelligenceSystem from './memory_system/intelligence.js';
import Orchestrator from './api/core/orchestrator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { google } from 'googleapis';
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

// ===== APPLICATION STARTUP MEMORY INITIALIZATION =====
console.log('[SERVER] 🚀 Initializing memory systems at application startup...');
console.log('🚀 [SERVER] Initializing Orchestrator...');
const orchestrator = new Orchestrator();
await orchestrator.initialize();
console.log('✅ [SERVER] Orchestrator ready');

// CRITICAL FIX: Move async initialization inside an async function
async function initializeMemorySystem() {
    console.log('[SERVER] 🚀 Starting memory system initialization...');
    
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Memory init timeout')), 30000)
        );
        
        const initResult = await Promise.race([
            persistentMemory.ensureInitialized(),
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

// Wrap entire server startup in async function
async function startServer() {
    // Initialize memory systems first
    await initializeMemorySystem();
    console.log('[SERVER] 🚀 Memory systems initialized, starting web server...');
}

// Initialize server immediately
console.log('[SERVER] 🚀 Starting Site Monkeys AI System...');

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Required for ESM to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════
// LOCKED UI SERVING - PROTECTED FRONTEND
// ═══════════════════════════════════════════════════════════════════════

// Serve static assets from locked-ui folder
app.use('/css', express.static(path.join(__dirname, 'locked-ui', 'css')));
app.use('/js', express.static(path.join(__dirname, 'locked-ui', 'js')));
app.use('/images', express.static(path.join(__dirname, 'locked-ui', 'images')));
app.use('/manifest.json', express.static(path.join(__dirname, 'locked-ui', 'manifest.json')));

// ==================== VAULT LOADER INTEGRATION ====================
// Adding vault functionality to existing server with ES module imports

// BULLETPROOF OPENAI API CALLING WITH RATE LIMITING
let lastRequestTime = 0;

const callOpenAI = async (payload) => {
  // Simple rate limiting - wait 10 seconds between any requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const minDelay = 10000; // 10 seconds
  
  if (timeSinceLastRequest < minDelay) {
    const waitTime = minDelay - timeSinceLastRequest;
    console.log(`⏳ Rate limit protection: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  try {
    console.log('📡 Making OpenAI API call...');
    lastRequestTime = Date.now();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ OpenAI API call successful');
    return result;
    
  } catch (error) {
    // === INTELLIGENCE FAILURE HANDLER (SAFE FALLBACK INJECTION) ===
    console.warn('[INTELLIGENCE] Primary intelligence call failed. Error:', error?.message || error);
  
    // Very explicit log so we can detect overuse of fallback
    console.warn('[INTELLIGENCE] Fallback engaged - forcing vault+memory injection into fallback path');
  
    // Defensive: ensure vaultContent and memoryContext exist in safe form
    const safeVault = (typeof vaultContent === 'string' && vaultContent.length > 0) ? vaultContent
      : `SITE MONKEYS FALLBACK LOGIC:
  Pricing: Boost $697, Climb $1,497, Lead $2,997
  Minimum 85% margins required for all projections
  Professional service standards maintained
  Quality-first approach with caring delivery`;
  
    const safeMemory = (memoryContext && memoryContext.memories) ? memoryContext.memories : '';
  
    // Build a forced prompt with the same master system prompt and the best available inputs
    const forcedPrompt = `
  [FORCED FALLBACK PROMPT - injected because primary intelligence failed]
  ${systemPrompt}
  
  ${vaultHealthy ? `📁 VAULT CONTENT (injected):\n${safeVault}\n\n` : '[NO VAULT AVAILABLE]\n\n'}
  
  ${safeMemory ? `🧠 MEMORY CONTEXT (injected):\n${safeMemory}\n\n` : '[NO MEMORY CONTEXT]\n\n'}
  
  USER REQUEST:
  ${message}
  
  NOTE: Primary intelligence failed with error: ${error?.message || String(error)}.
  Please attempt to answer using the injected vault and memory context. If you cannot, be explicit about what is missing.
  `;
  
    try {
      // Call the same API wrapper but with forced prompt
      const fallbackApiResp = await makeIntelligentAPICall(forcedPrompt, personality, prideMotivation);
      finalResponse = fallbackApiResp.response || generateEmergencyCaringResponse(new Error('Fallback produced no response'));
  
      console.log('[INTELLIGENCE] Fallback response received. Tokens:', fallbackApiResp.usage?.total_tokens || 0);
    } catch (fallbackError) {
      // If fallback itself fails, produce a safe emergency message
      console.error('[INTELLIGENCE] Fallback also failed:', fallbackError?.message || fallbackError);
  
      finalResponse = generateEmergencyCaringResponse(fallbackError || error);
    }
  }

};

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Vault folder ID
const VAULT_FOLDER_ID = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM";

/**
 * Extract text content from DOCX file data
 */
async function extractTextFromDocx(docxBuffer) {
    try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(docxBuffer);
        
        const documentXml = await zipContent.file('word/document.xml').async('string');
        
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(documentXml);
        
        const textElements = [];
        
        function extractText(node) {
            if (node && typeof node === 'object') {
                if (node['w:t'] && Array.isArray(node['w:t'])) {
                    node['w:t'].forEach(textNode => {
                        if (textNode && textNode._) {
                            textElements.push(textNode._);
                        } else if (typeof textNode === 'string') {
                            textElements.push(textNode);
                        }
                    });
                }
                
                Object.keys(node).forEach(key => {
                    if (Array.isArray(node[key])) {
                        node[key].forEach(child => extractText(child));
                    } else if (typeof node[key] === 'object') {
                        extractText(node[key]);
                    }
                });
            }
        }
        
        extractText(result);
        
        const extractedText = textElements.join(' ');
        const lines = extractedText.split('\n');
        const cleanedLines = lines.filter(line => line.trim()).map(line => line.trim());
        
        return cleanedLines.join('\n');
    } catch (error) {
        return `[DOCX text extraction failed: ${error.message}]`;
    }
}

/**
 * Initialize Google Drive service with credentials
 */
function getGoogleDriveService() {
    try {
        const credsJson = process.env.GOOGLE_CREDENTIALS_JSON;
        const projectId = process.env.GOOGLE_PROJECT_ID;
        const projectNumber = process.env.GOOGLE_PROJECT_NUMBER;
        
        if (!credsJson) {
            throw new Error("GOOGLE_CREDENTIALS_JSON environment variable not found");
        }
        if (!projectId) {
            throw new Error("GOOGLE_PROJECT_ID environment variable not found");
        }
        
        console.log(`Using Project ID: ${projectId}`);
        console.log(`Using Project Number: ${projectNumber}`);
        
        const credsInfo = JSON.parse(credsJson);
        credsInfo.project_id = projectId;
        if (projectNumber) {
            credsInfo.project_number = projectNumber;
        }
        
        const auth = new google.auth.GoogleAuth({
            credentials: credsInfo,
            scopes: ['https://www.googleapis.com/auth/drive.readonly']
        });
        
        return google.drive({ version: 'v3', auth });
    } catch (error) {
        throw new Error(`Google Drive authentication failed: ${error.message}`);
    }
}

/**
 * Store vault data in Railway KV using v2 key
 */
async function storeVaultInKv(vaultData) {
    try {
        const kvUrl = process.env.KV_REST_API_URL;
        const kvToken = process.env.KV_REST_API_TOKEN;
        
        if (!kvUrl || !kvToken) {
            console.log("⚠️ KV environment variables not found");
            return false;
        }
        
        const headers = {
            'Authorization': `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
        };
        
        // Convert to JSON and check size
        const vaultJson = JSON.stringify(vaultData);
        const vaultSize = Buffer.byteLength(vaultJson, 'utf8');
        
        console.log(`📊 Vault data size: ${vaultSize} bytes`);
        
        let requestData;
        let storageMethod = 'direct';
        
        // Compress if over 80KB
        if (vaultSize > 80000) {
            console.log("🗜️ Compressing vault data...");
            const compressed = await gzip(Buffer.from(vaultJson, 'utf8'));
            const encoded = compressed.toString('base64');
            
            // Store compressed with metadata
            requestData = {
                compressed: true,
                data: encoded,
                original_size: vaultSize,
                compressed_size: encoded.length
            };
            
            storageMethod = 'compressed';
            console.log(`📦 Compressed: ${vaultSize} → ${encoded.length} bytes`);
        } else {
            requestData = vaultData;
        }
        
        const response = await axios.post(
            `${kvUrl}/set/sitemonkeys_vault_v2`,
            requestData,
            { 
                headers,
                timeout: 30000
            }
        );
        
        console.log(`🔑 KV Storage URL: ${kvUrl}/set/sitemonkeys_vault_v2`);
        console.log(`📤 KV Storage response status: ${response.status}`);
        console.log(`📤 KV Storage response: ${response.data}`);
        
        if (response.status === 200) {
            console.log("✅ Vault data stored in KV successfully");
            
            // Store master index separately for diagnostics
            const masterIndex = {
                folders_loaded: vaultData.folders_loaded || [],
                total_files: vaultData.total_files || 0,
                tokens: vaultData.tokens || 0,
                estimated_cost: vaultData.estimated_cost || "$0.00",
                last_updated: vaultData.last_updated || "unknown",
                vault_status: "operational",
                storage_method: storageMethod
            };
            
            const indexResponse = await axios.post(
                `${kvUrl}/set/sitemonkeys_vault_v2_index`,
                masterIndex,
                { 
                    headers,
                    timeout: 30000
                }
            );
            
            console.log(`📋 Index storage status: ${indexResponse.status}`);
            return true;
        } else {
            console.log(`❌ KV storage failed: ${response.status} - ${response.data}`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ KV storage error: ${error.message}`);
        console.log(`Full error: ${error.stack}`);
        return false;
    }
}

/**
 * Retrieve vault data from Railway KV using v2 key
 */
async function getVaultFromKv() {
    try {
        const kvUrl = process.env.KV_REST_API_URL;
        const kvToken = process.env.KV_REST_API_TOKEN;
        
        if (!kvUrl || !kvToken) {
            console.log("⚠️ KV environment variables not found for retrieval");
            return null;
        }
        
        const headers = {
            'Authorization': `Bearer ${kvToken}`,
        };
        
        const response = await axios.get(
            `${kvUrl}/get/sitemonkeys_vault_v2`,
            { 
                headers,
                timeout: 30000
            }
        );
        
        console.log(`🔍 KV Retrieval URL: ${kvUrl}/get/sitemonkeys_vault_v2`);
        console.log(`📥 KV Retrieval response status: ${response.status}`);
        console.log(`📥 KV Retrieval response length: ${response.data ? JSON.stringify(response.data).length : 0}`);
        
        if (response.status === 200) {
            try {
                const data = response.data;
                
                if (data === null || data === undefined) {
                    console.log("⚠️ No vault data found in KV (null response)");
                    return null;
                }
                
                // Check if it's compressed
                if (typeof data === 'object' && data.compressed) {
                    console.log("🗜️ Decompressing vault data...");
                    const compressedBuffer = Buffer.from(data.data, 'base64');
                    const decompressed = await gunzip(compressedBuffer);
                    const result = JSON.parse(decompressed.toString('utf8'));
                    console.log(`📦 Decompressed: ${data.compressed_size || 0} → ${data.original_size || 0} bytes`);
                    return result;
                } else {
                    console.log(`✅ Retrieved vault data from KV: ${JSON.stringify(data).length} characters`);
                    return data;
                }
                
            } catch (parseError) {
                console.log(`❌ Failed to parse KV response: ${parseError.message}`);
                console.log(`Raw response: ${JSON.stringify(response.data).substring(0, 500)}...`);
                return null;
            }
        } else {
            console.log(`❌ KV retrieval failed: ${response.status}`);
            console.log(`Error response: ${response.data}`);
            return null;
        }
        
    } catch (error) {
        console.log(`❌ KV retrieval error: ${error.message}`);
        console.log(`Full error: ${error.stack}`);
        return null;
    }
}

/**
 * Load all content from SiteMonkeys vault folders
 */
async function loadVaultContent() {
    let vaultContent = "=== SITEMONKEYS BUSINESS VALIDATION VAULT ===\n\n";
    let loadedFolders = [];
    let totalFiles = 0;
    
    try {
        const drive = getGoogleDriveService();
        
        // Get subfolders in vault
        const query = `'${VAULT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`;
        const foldersResult = await drive.files.list({
            q: query,
            fields: "files(id, name)",
            pageSize: 50
        });
        
        const folders = foldersResult.data.files || [];
        
        vaultContent += `\n=== LIVE VAULT FOLDERS LOADED (${loadedFolders.length} folders) ===\n`;
        
        // ZERO-FAILURE: Filter to only the 3 required folders
        const targetFolders = ['00_EnforcementShell', '01_Core_Directives', 'VAULT_MEMORY_FILES'];
        
        for (const folder of folders) {
            const folderName = folder.name;
            
            // Skip folders not in our target list
            if (!targetFolders.includes(folderName)) {
                console.log(`⏭️ Skipping folder: ${folderName} (not in target list)`);
                continue;
            }
            
            loadedFolders.push(folderName);
            vaultContent += `\n--- FOLDER: ${folderName} ---\n`;
            
            // Get files in each folder
            const fileQuery = `'${folder.id}' in parents`;
            const filesResult = await drive.files.list({
                q: fileQuery,
                fields: "files(id, name, mimeType, size)",
                pageSize: 100
            });
            
            const files = filesResult.data.files || [];
            totalFiles += files.length;
            
            for (const file of files) {
                try {
                    let fileContent = "";
                    const fileMime = file.mimeType || '';
                    const fileName = file.name;
                    
                    console.log(`Processing file: ${fileName} (type: ${fileMime})`);
                    
                    if (fileMime.includes('text/plain') || fileName.endsWith('.txt')) {
                        try {
                            const response = await drive.files.get({
                                fileId: file.id,
                                alt: 'media'
                            }, { responseType: 'arraybuffer' });
                            
                            fileContent = Buffer.from(response.data).toString('utf-8');
                            console.log(`✅ Text file loaded: ${fileContent.length} characters`);
                        } catch (error) {
                            fileContent = `[ERROR reading text file: ${error.message}]`;
                            console.log(`❌ Text file error: ${error.message}`);
                        }
                    }
                    else if (fileMime === 'application/vnd.google-apps.document') {
                        try {
                            const response = await drive.files.export({
                                fileId: file.id,
                                mimeType: 'text/plain'
                            });
                            
                            fileContent = response.data;
                            console.log(`✅ Google Doc exported: ${fileContent.length} characters`);
                        } catch (error) {
                            fileContent = `[Google Doc - Export failed: ${error.message}]`;
                            console.log(`❌ Google Doc error: ${error.message}`);
                        }
                    }
                    else if (fileMime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || fileName.endsWith('.docx')) {
                        try {
                            console.log(`🔄 Downloading DOCX file: ${fileName}`);
                            const response = await drive.files.get({
                                fileId: file.id,
                                alt: 'media'
                            }, { responseType: 'arraybuffer' });
                            
                            const fileData = Buffer.from(response.data);
                            console.log(`📥 Downloaded ${fileData.length} bytes`);
                            
                            fileContent = await extractTextFromDocx(fileData);
                            
                            if (fileContent.startsWith('[DOCX text extraction failed')) {
                                console.log(`❌ DOCX extraction failed: ${fileName}`);
                            } else {
                                console.log(`✅ DOCX text extracted: ${fileContent.length} characters`);
                            }
                            
                        } catch (error) {
                            fileContent = `[DOCX file - Access failed: ${error.message}]`;
                            console.log(`❌ DOCX access error: ${error.message}`);
                        }
                    }
                    else if (fileMime === 'application/vnd.google-apps.folder') {
                        continue;
                    }
                    else {
                        const fileSize = file.size || 'Unknown';
                        fileContent = `[File type: ${fileMime} - Size: ${fileSize} bytes - Skipped unsupported format]`;
                        console.log(`⏭️ Skipped unsupported file: ${fileName}`);
                    }
                    
                    vaultContent += `\n=== ${fileName} ===\n${fileContent}\n`;
                    
                } catch (fileError) {
                    vaultContent += `\n=== ${file.name} ===\n[ERROR loading file: ${fileError.message}]\n`;
                    console.log(`❌ File processing error: ${file.name} - ${fileError.message}`);
                }
            }
        }
        
        vaultContent += `\n=== VAULT SUMMARY ===\nFolders: ${loadedFolders.length}\nFiles processed: ${totalFiles}\n`;
        
        console.log(`✅ Vault loaded successfully: ${folders.length} folders, ${totalFiles} files`);
        console.log(`📊 Total vault content: ${vaultContent.length} characters`);
        
    } catch (driveError) {
        console.log(`❌ Google Drive error: ${driveError.message}`);
        vaultContent += `\n[Google Drive connection error: ${driveError.message}]\n`;
        loadedFolders = ["Error - Could not connect to Google Drive"];
        totalFiles = 0;
    }
    
    return { vaultContent, loadedFolders, totalFiles };
}

app.all('/api/load-vault', (req, res) => {
  // Wrap everything in a promise that can't fail silently
  Promise.resolve().then(async () => {
    try {
      // Check if request is for Site Monkeys mode only
      const mode = req.body.mode || req.query.mode || 'site_monkeys';
      if (mode !== 'site_monkeys') {
        console.log(`🚫 Vault access denied for mode: ${mode}`);
        return res.json({
          status: "access_denied",
          vault_content: "",
          tokens: 0,
          message: "Vault only available in Site Monkeys mode"
        });
      }
      
      const isRefresh = req.query.refresh === 'true';
      
      if (isRefresh) {
        console.log("🔄 Refresh requested - loading fresh vault data...");
        
        // Wrap vault loading in timeout
        const vaultPromise = loadVaultContent();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Vault loading timeout')), 45000)
        );
        
        const { vaultContent: vaultMemory, loadedFolders, totalFiles } = await Promise.race([
          vaultPromise,
          timeoutPromise
        ]);
        
        const tokenCount = Math.floor(vaultMemory.length / 4);
        const estimatedCost = (tokenCount * 0.002) / 1000;
        
        const vaultData = {
          vault_content: vaultMemory,
          tokens: tokenCount,
          estimated_cost: `$${estimatedCost.toFixed(4)}`,
          folders_loaded: loadedFolders,
          total_files: totalFiles,
          last_updated: "refresh_requested",
          vault_status: "operational"
        };
        
        // Wrap KV storage in timeout  
        const kvPromise = storeVaultInKv(vaultData);
        const kvTimeoutPromise = new Promise((resolve) => 
          setTimeout(() => resolve(false), 30000)
        );
        
        const kvStored = await Promise.race([kvPromise, kvTimeoutPromise]);
        
        console.log(`📊 Vault refresh complete: ${tokenCount} tokens, ${loadedFolders.length} folders`);
        
        const response = {
          status: "refreshed",
          vault_content: vaultMemory,
          tokens: tokenCount,
          estimated_cost: `$${estimatedCost.toFixed(4)}`,
          folders_loaded: loadedFolders,
          total_files: totalFiles,
          kv_stored: kvStored,
          message: `Vault refreshed: ${loadedFolders.length} folders, ${totalFiles} files`,
          vault_status: "operational"
        };
        
        res.json(response);
        
      } else {
        console.log("📖 Checking for cached vault data...");
        
        // Wrap KV retrieval in timeout
        const kvPromise = getVaultFromKv();
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => resolve(null), 15000)
        );
        
        const cachedVault = await Promise.race([kvPromise, timeoutPromise]);
        
        if (cachedVault && typeof cachedVault === 'object' && cachedVault.vault_content) {
          console.log("✅ Found valid cached vault data in KV");
          const response = {
            status: "success",
            vault_content: cachedVault.vault_content || "",
            tokens: cachedVault.tokens || 0,
            estimated_cost: cachedVault.estimated_cost || "$0.00",
            folders_loaded: cachedVault.folders_loaded || [],
            total_files: cachedVault.total_files || 0,
            vault_status: cachedVault.vault_status || "operational",
            message: "Using cached vault data from KV"
          };
          res.json(response);
        } else {
          console.log("⚠️ No valid cached vault data found");
          const response = {
            status: "success",
            needs_refresh: true,
            vault_content: "",
            tokens: 0,
            estimated_cost: "$0.00",
            folders_loaded: [],
            total_files: 0,
            vault_status: "needs_refresh",
            message: "No vault data found - please refresh"
          };
          res.json(response);
        }
      }
      
    } catch (error) {
      console.log(`❌ Vault operation failed: ${error.message}`);
      console.log(`❌ Full vault error:`, error);
      const errorResponse = {
        status: "error",
        error: error.message,
        vault_status: "error",
        message: "Vault operation failed - check configuration"
      };
      res.json(errorResponse);
    }
  }).catch(error => {
    console.error('❌ Vault endpoint critical error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: "error",
        error: error.message,
        vault_status: "critical_error",
        message: "Critical vault error - server protected"
      });
    }
  });
});

// ==================== END VAULT INTEGRATION ====================

// CORE INTELLIGENCE MODULES (Embedded for performance)

// CARING FAMILY PHILOSOPHY - The heart of everything
const FAMILY_PHILOSOPHY = {
  core_mission: "Act like an extraordinary family of experts who genuinely care about each other's success",
  pride_source: "Taking satisfaction in preventing mistakes and finding solutions others miss", 
  care_principle: "Never give up - there IS a path, we just haven't thought of it yet",
  truth_foundation: "I care too much about your success to give you anything less than the truth",
  excellence_standard: "See what others don't see, think what others don't think about",
  relationship_focus: "Build trust through consistent competence and genuine caring",
  one_and_done_philosophy: "Provide complete, actionable analysis that leads to successful execution"
};

// EXPERT DOMAINS - Universal recognition system
const EXPERT_DOMAINS = {
  financial_analysis: {
    triggers: ['budget', 'cost', 'revenue', 'profit', 'money', 'financial', 'pricing', 'margin', 'cash flow', 'projection'],
    title: 'Chief Financial Officer & Strategic Investment Advisor',
    personality: 'eli',
    frameworks: ['quantitative_modeling', 'survival_analysis', 'margin_protection']
  },
  business_strategy: {
    triggers: ['strategy', 'market', 'competition', 'growth', 'business', 'scaling', 'planning', 'expansion'],
    title: 'Strategic Business Consultant & Growth Strategist', 
    personality: 'roxy',
    frameworks: ['market_analysis', 'competitive_positioning', 'solution_discovery']
  },
  legal_analysis: {
    triggers: ['legal', 'law', 'compliance', 'regulation', 'contract', 'liability', 'court', 'attorney'],
    title: 'Legal Counsel & Compliance Specialist',
    personality: 'eli',
    frameworks: ['jurisdiction_awareness', 'risk_assessment', 'regulatory_compliance']
  },
  medical_advisory: {
    triggers: ['medical', 'health', 'diagnosis', 'treatment', 'doctor', 'patient', 'symptoms', 'healthcare'],
    title: 'Healthcare Professional & Medical Advisor',
    personality: 'roxy',
    frameworks: ['diagnostic_support', 'evidence_based_medicine', 'safety_protocols']
  },
  technical_engineering: {
    triggers: ['technical', 'engineering', 'system', 'architecture', 'code', 'software', 'development'],
    title: 'Senior Technical Architect & Systems Engineer',
    personality: 'eli', 
    frameworks: ['system_design', 'scalability_analysis', 'performance_optimization']
  },
  general_advisory: {
    triggers: ['help', 'advice', 'guidance', 'support', 'assistance', 'consultation'],
    title: 'Multi-Domain Expert & Strategic Advisor',
    personality: 'alternate',
    frameworks: ['cross_domain_analysis', 'solution_synthesis', 'protective_guidance']
  }
};

// SITE MONKEYS BUSINESS LOGIC - Core enforcement
const SITE_MONKEYS_CONFIG = {
  pricing: {
    boost: { price: 697, name: 'Boost', margin_required: 85 },
    climb: { price: 1497, name: 'Climb', margin_required: 85 },
    lead: { price: 2997, name: 'Lead', margin_required: 85 }
  },
  business_standards: {
    minimum_margin: 85,
    professional_positioning: true,
    quality_first_approach: true,
    sustainability_focus: true
  }
};

// SYSTEM GLOBALS
let lastPersonality = 'roxy';
let conversationCount = 0;
// SESSION TOKEN AND COST TRACKING
let sessionStats = {
  totalTokens: 0,
  inputTokens: 0,
  outputTokens: 0,
  totalCost: 0,
  requestCount: 0,
  sessionStart: Date.now(),
  lastReset: new Date().toISOString()
};

// CURRENT API PRICING (per 1M tokens)
const API_PRICING = {
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4': { input: 30.00, output: 60.00 },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 }
};

function calculateCost(usage, model = 'gpt-4o') {
  const pricing = API_PRICING[model] || API_PRICING['gpt-4o'];
  const inputCost = (usage.prompt_tokens / 1000000) * pricing.input;
  const outputCost = (usage.completion_tokens / 1000000) * pricing.output;
  return inputCost + outputCost;
}

function updateSessionStats(usage, model = 'gpt-4o') {
  if (usage && usage.total_tokens) {
    sessionStats.totalTokens += usage.total_tokens;
    sessionStats.inputTokens += usage.prompt_tokens || 0;
    sessionStats.outputTokens += usage.completion_tokens || 0;
    sessionStats.totalCost += calculateCost(usage, model);
    sessionStats.requestCount += 1;
    
    console.log(`[COST] Session total: ${sessionStats.totalTokens} tokens, $${sessionStats.totalCost.toFixed(4)}, ${sessionStats.requestCount} requests`);
  }
}
let familyMemory = {
  userGoals: [],
  successPatterns: [],
  riskPatterns: [],
  careLevel: 1.0,
  trustBuilding: 0.0
};

app.post('/api/upload-for-analysis', analysisMiddleware, handleAnalysisUpload);
app.post('/api/upload-file', uploadMiddleware, handleFileUpload);

// MAIN CHAT ENDPOINT
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    let totalCost = 0;
    
    try {
        console.log('\n🚀 [CHAT] New conversation request received');
     
    const {
      message,
      conversation_history = [],
      mode = 'site_monkeys',
      claude_requested = false,
      vault_content = null,
      document_context = null
    } = req.body;

    console.log('[DOC] incoming document_context type:', typeof document_context, 
            document_context && (document_context.filename || '(no filename)'),
            document_context && (document_context.content ? `${document_context.content.length} chars` : '(no content)'));


    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // VAULT LOADING (Fast)
    let vaultContent = '';
    let vaultTokens = 0;
    let vaultStatus = 'not_loaded';
    let vaultHealthy = false;

    try {
      if (vault_content && typeof vault_content === 'string' && vault_content.trim().length > 100) {
        vaultContent = vault_content;
        vaultStatus = 'loaded_from_frontend';
        vaultHealthy = true;
      } else if (process.env.VAULT_CONTENT) {
        vaultContent = process.env.VAULT_CONTENT;
        vaultStatus = 'loaded_from_environment';
        vaultHealthy = true;
      } else {
        vaultStatus = 'fallback_mode';
        vaultContent = `SITE MONKEYS FALLBACK LOGIC:
Pricing: Boost $697, Climb $1,497, Lead $2,997
Minimum 85% margins required for all projections
Professional service standards maintained
Quality-first approach with caring delivery`;
        vaultHealthy = false;
      }
      vaultTokens = Math.ceil(vaultContent.length / 4);
    } catch (error) {
      vaultStatus = 'error_fallback';
      vaultHealthy = false;
    }

    // === CLAMP: Prevent unhealthy vault from poisoning signatures ===
    if (!vaultHealthy || !vaultContent || vaultContent.length < 500) {
      console.log('⚠️ Vault unhealthy or empty — enforcing safe clamp');
      vaultHealthy = false;
      vaultContent = `SITE MONKEYS FALLBACK LOGIC:
    Pricing: Boost $697, Climb $1,497, Lead $2,997
    Minimum 85% margins required for all projections
    Professional service standards maintained
    Quality-first approach with caring delivery`;
    }


    // ===== IMPROVED INTELLIGENCE SYSTEM =====
    let intelligenceRouting = null;
    let intelligenceMemories = null;
    
    try {
      const orchestratorResult = await orchestrator.processRequest({
        message: message,
        userId: 'user',
        mode: mode,
        documentContext: document_context,
        vaultEnabled: vaultHealthy,
        conversationHistory: conversation_history
      });
      
      // Return orchestrator result directly
      return res.json(orchestratorResult);
      
    } catch (error) {
      console.error('[CHAT] Orchestrator failed:', error);
      return res.status(500).json({ error: 'Request processing failed' });
    }
  
  // Check for pricing violations
  const priceMatches = response.match(/\$(\d+)/g);
  if (priceMatches) {
    const lowPrices = priceMatches.filter(match => {
      const amount = parseInt(match.replace('$', '').replace(',', ''));
      return amount > 0 && amount < SITE_MONKEYS_CONFIG.pricing.boost.price;
    });
    
    if (lowPrices.length > 0) {
      enforcementNotes.push(`Pricing below professional minimums detected: ${lowPrices.join(', ')}`);
    }
  }
  
  // Check for margin violations
  const marginMatches = response.match(/(\d+)%.*margin/gi);
  if (marginMatches) {
    const lowMargins = marginMatches.filter(match => {
      const percentage = parseInt(match.match(/\d+/)[0]);
      return percentage < SITE_MONKEYS_CONFIG.business_standards.minimum_margin;
    });
    
    if (lowMargins.length > 0) {
      enforcementNotes.push(`Margins below ${SITE_MONKEYS_CONFIG.business_standards.minimum_margin}% requirement: ${lowMargins.join(', ')}`);
    }
  }
  
  if (enforcementNotes.length > 0) {
    response += `

🚨 SITE MONKEYS STANDARDS ENFORCEMENT:

Site Monkeys maintains professional service standards to ensure sustainable operations and quality delivery:

VIOLATIONS DETECTED:
${enforcementNotes.map(note => `- ${note}`).join('\n')}

REQUIRED STANDARDS:
- Minimum pricing: Boost $${SITE_MONKEYS_CONFIG.pricing.boost.price}, Climb $${SITE_MONKEYS_CONFIG.pricing.climb.price}, Lead $${SITE_MONKEYS_CONFIG.pricing.lead.price}
- Minimum margins: ${SITE_MONKEYS_CONFIG.business_standards.minimum_margin}% for business sustainability
- Professional positioning with quality-first approach

These standards ensure long-term viability and exceptional client service.`;
  }
  
  return response;
}

function enforceExpertStandards(response, expertDomain, careNeeds) {
  const missingElements = [];
  
  // Check for confidence scoring
  if (!/confidence.*\d+%/i.test(response) && !/confidence.*high|medium|low/i.test(response)) {
    missingElements.push('confidence_scoring');
  }
  
  // Check for assumption flagging
  if (!/assum|presuppos|given that/i.test(response)) {
    missingElements.push('assumption_documentation');
  }
  
  // Check for next steps
  if (!/next step|recommend|suggest.*action/i.test(response)) {
    missingElements.push('actionable_guidance');
  }
  
  if (missingElements.length > 0) {
    let enhancement = '';
    
    if (missingElements.includes('confidence_scoring')) {
      enhancement += '\n\nCONFIDENCE ASSESSMENT: Medium (75%) - Based on available information and professional experience.';
    }
    
    if (missingElements.includes('assumption_documentation')) {
      enhancement += '\n\nKEY ASSUMPTIONS: Analysis assumes standard market conditions and typical implementation approaches.';
    }
    
    if (missingElements.includes('actionable_guidance')) {
      enhancement += '\n\nRECOMMENDED NEXT STEPS: 1) Validate key assumptions with current data 2) Consider alternative approaches 3) Monitor implementation progress closely.';
    }
    
    response += enhancement;
  }
  
  return response;
}

function addProtectiveInsights(response, protectiveAlerts, solutionOpportunities) {
  if (protectiveAlerts.length === 0 && solutionOpportunities.length === 0) {
    return response;
  }
  
  let protectiveSection = '';
  
  if (protectiveAlerts.length > 0) {
    protectiveSection += '\n\n🛡️ PROTECTIVE INTELLIGENCE (What I\'m seeing that you should know):';
    protectiveAlerts.forEach(alert => {
      protectiveSection += `\n• **${alert.type.replace(/_/g, ' ').toUpperCase()}** (${alert.severity.toUpperCase()}): ${alert.message}`;
      if (alert.protective_action) {
        protectiveSection += `\n  Action: ${alert.protective_action}`;
      }
    });
  }
  
  if (solutionOpportunities.length > 0) {
    protectiveSection += '\n\n💡 SOLUTION OPPORTUNITIES (Better paths I\'m seeing):';
    solutionOpportunities.forEach(opportunity => {
      protectiveSection += `\n• **${opportunity.type.replace(/_/g, ' ').toUpperCase()}**: ${opportunity.description}`;
      if (opportunity.suggestions && opportunity.suggestions.length > 0) {
        protectiveSection += `\n  Approaches: ${opportunity.suggestions.slice(0, 2).join('; ')}`;
      }
    });
  }
  
  if (protectiveSection) {
    protectiveSection += '\n\nI care too much about your success to let these factors go unmentioned. Each represents either protection needed or opportunity available.';
  }
  
  return response + protectiveSection;
}

function applyCaringFamilyTouch(response, careNeeds, prideMotivation, expertDomain, vaultContent) {
  let enhancement = response;
  
  // Always use professional signature
  enhancement += '\n\n📁 PROFESSIONAL ANALYSIS: Advanced AI reasoning with business intelligence applied.';
  
  // Add caring touch based on situation
  if (careNeeds.level === 'maximum') {
    enhancement += '\n\n💙 I genuinely care about your success in this critical situation - that\'s why I\'m being thorough about risks and opportunities. Family looks out for family.';
  } else if (prideMotivation > 0.7) {
    enhancement += '\n\n✨ I take pride in finding paths and protections you might not have considered yet. There\'s always a way to make things work better.';
  } else if (careNeeds.emotional_support_needed) {
    enhancement += '\n\n🤝 You\'re not alone in this - I\'m here to help you navigate these challenges with both expertise and care.';
  }
  
  return enhancement;
}

// UTILITY FUNCTIONS (keeping all your existing functions)

function updateFamilyMemory(expertDomain, careNeeds, protectiveAlerts, solutionOpportunities) {
  // Track patterns for future use
  familyMemory.riskPatterns.push(...protectiveAlerts.map(alert => alert.type));
  familyMemory.successPatterns.push(...solutionOpportunities.map(opp => opp.type));
  
  // Update care and trust levels
  if (careNeeds.level === 'maximum') {
    familyMemory.careLevel = Math.min(familyMemory.careLevel + 0.2, 5.0);
  }
  
  familyMemory.trustBuilding = Math.min(familyMemory.trustBuilding + 0.1, 1.0);
  
  // Keep memory manageable
  if (familyMemory.riskPatterns.length > 20) {
    familyMemory.riskPatterns = familyMemory.riskPatterns.slice(-20);
  }
  if (familyMemory.successPatterns.length > 20) {
    familyMemory.successPatterns = familyMemory.successPatterns.slice(-20);
  }
}

function calculateCompletenessScore(response, originalMessage) {
  let score = 0;
  
  // Basic answer provided
  if (response.length > 200) score += 25;
  
  // Contains specific details/numbers
  if (/\$[\d,]+|\d+%|\d+ month/g.test(response)) score += 25;
  
  // Contains next steps or actionable guidance
  if (/next step|recommend|suggest.*action|should.*do/i.test(response)) score += 25;
  
  // Contains risk awareness or protective guidance
  if (/risk|concern|caution|consider|alert/i.test(response)) score += 25;
  
  return score;
}

function estimateClaudeCost(message, vaultContent) {
  const promptLength = message.length + (vaultContent?.length || 0) + 2000; // System prompt
  const estimatedTokens = Math.ceil(promptLength / 4) + 800; // Response tokens
  return (estimatedTokens * 0.015) / 1000;
}

function generateCaringCostMessage(estimatedCost, expertDomain, careNeeds) {
  return `As your dedicated family expert in ${expertDomain.domain.replace(/_/g, ' ')}, I want to provide the most thorough analysis possible for this ${careNeeds.level} priority situation.

The estimated cost would be $${estimatedCost.toFixed(4)}, which exceeds our $0.50 limit. I care about managing resources responsibly while delivering the excellence you deserve.

Would you like me to:
1. Provide detailed professional analysis using our standard experts (still highly competent)
2. Break this into smaller questions I can handle within the cost limit
3. Proceed with Claude anyway (additional cost noted)

Family takes care of family - what would work best for your situation?`;
}

function generateVotingNeutralityResponse() {
  return `I cannot and will not tell you who to vote for. That's inappropriate and undermines your personal responsibility.

Your vote is one of your most important responsibilities as a citizen. Here's my guidance:

**VOTING RESPONSIBILITY FRAMEWORK:**
1. **Research thoroughly** - candidates' actual positions, track records, and qualifications
2. **Verify facts** from multiple reliable, credible sources
3. **Think beyond yourself** - consider what's best for the country and future generations
4. **Make your own informed decision** based on your values and analysis

**HOW I CAN HELP:**
- Provide factual information about issues (with sources)
- Help you find reliable, non-partisan information sources
- Explain policy implications and trade-offs objectively
- Share multiple perspectives on issues with attribution

**WHAT I WON'T DO:**
- Tell you who to vote for or against
- Make political endorsements
- Present only one side of political issues
- Substitute my judgment for your civic responsibility

Voting is a sacred personal right and responsibility. Research thoroughly, think critically, and decide what's best based on your own values and analysis.`;
}

function generateEmergencyCaringResponse(error) {
  return `I encountered a technical issue while providing the caring, expert analysis you deserve, and I want to be completely transparent about that.

Even with this system challenge, my commitment to your success remains absolute. Based on truth-first caring principles:

- Truth and accuracy are never compromised, even in emergency situations
- I maintain professional standards and genuine care for your success
- Family looks out for family, especially when things get challenging

Technical issue: ${error.message}

How can I help you move forward while we resolve this?

💙 Your success matters to me, and I'll find a way to help you succeed.`;
}

// SESSION STATISTICS ENDPOINT
app.get('/api/session-stats', (req, res) => {
  res.json({
    session_stats: {
      ...sessionStats,
      session_duration_minutes: Math.round((Date.now() - sessionStats.sessionStart) / 60000),
      average_tokens_per_request: sessionStats.requestCount > 0 ? Math.round(sessionStats.totalTokens / sessionStats.requestCount) : 0,
      average_cost_per_request: sessionStats.requestCount > 0 ? sessionStats.totalCost / sessionStats.requestCount : 0
    },
    pricing: API_PRICING,
    timestamp: new Date().toISOString()
  });
});

// RESET SESSION STATS ENDPOINT  
app.post('/api/reset-session-stats', (req, res) => {
  const oldStats = { ...sessionStats };
  
  sessionStats = {
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalCost: 0,
    requestCount: 0,
    sessionStart: Date.now(),
    lastReset: new Date().toISOString()
  };
  
  res.json({
    message: 'Session stats reset successfully',
    previous_session: oldStats,
    new_session: sessionStats
  });
});

// HEALTH CHECK ENDPOINT
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'caring_family_intelligence',
    deployment: 'railway_optimized',
    capabilities: [
      'universal_expert_recognition',
      'quantitative_reasoning_enforcement',
      'protective_intelligence_scanning',
      'caring_family_simulation',
      'truth_first_foundation',
      'site_monkeys_business_logic',
      'vault_loader_integrated'
    ],
    philosophy: FAMILY_PHILOSOPHY.core_mission,
    vault_endpoint: '/api/load-vault'
  });
});

// ===== MEMORY SYSTEM HEALTH CHECK =====
app.get('/api/memory-status', async (req, res) => {
    try {
        if (global.memorySystem && typeof global.memorySystem.healthCheck === 'function') {
            const health = await global.memorySystem.healthCheck();
            res.json({
                timestamp: new Date().toISOString(),
                memory_system: health
            });
        } else {
            res.json({
                timestamp: new Date().toISOString(),
                memory_system: {
                    status: 'not_initialized',
                    error: 'Memory system not available'
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            timestamp: new Date().toISOString(),
            error: error.message,
            memory_system: { status: 'error' }
        });
    }
});

// ===== TEMPORARY INTELLIGENCE TESTING ENDPOINT =====
app.get('/test-intelligence', async (req, res) => {
  try {
    console.log('[TEST] Running intelligence system test...');
    
    exec('npm run test-intelligence', (error, stdout, stderr) => {
      if (error) {
        console.error('[TEST] Test execution error:', error);
        return res.send(`<pre>TEST EXECUTION ERROR:\n${error.message}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}</pre>`);
      }
      
      const output = `INTELLIGENCE SYSTEM TEST RESULTS
===============================

STDOUT:
${stdout}

STDERR:
${stderr}

Test completed at: ${new Date().toISOString()}
===============================`;
      
      res.send(`<pre>${output}</pre>`);
    });
    
  } catch (error) {
    console.error('[TEST] Endpoint error:', error);
    res.status(500).send(`<pre>ENDPOINT ERROR: ${error.message}</pre>`);
  }
});

// START SERVER
function convertMemoryToSharedHistory(formattedMemories) {
  return formattedMemories
    .split('\n\n')
    .map(memory => {
      const timeMatch = memory.match(/^\[([^\]]+)\]/);
      const content = memory.replace(/^\[[^\]]+\]\s*/, '');
      const timeAgo = timeMatch ? timeMatch[1] : 'Previously';
      
      return `${timeAgo}: ${content}`;
    })
    .join('\n');
}

const PORT = process.env.PORT || 3000;

// Register repo snapshot route
app.use('/api/repo-snapshot', repoSnapshotRoute);

// ═══════════════════════════════════════════════════════════════════════
// SPA FALLBACK - SERVE INDEX.HTML FOR ALL NON-API ROUTES
// ═══════════════════════════════════════════════════════════════════════
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // Serve the locked UI index.html for all other routes
  res.sendFile(path.join(__dirname, 'locked-ui', 'index.html'));
});

async function safeStartServer() {

  try {
    await startServer();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Caring Family Intelligence System running on port ${PORT}`);
      console.log(`💙 ${FAMILY_PHILOSOPHY.core_mission}`);
      console.log(`✨ ${FAMILY_PHILOSOPHY.one_and_done_philosophy}`);
      console.log(`📁 Vault endpoint: /api/load-vault`);
    });

    // Graceful shutdown for Railway
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

safeStartServer();
