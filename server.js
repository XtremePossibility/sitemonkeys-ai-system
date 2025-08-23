// COMPLETE CARING FAMILY INTELLIGENCE SYSTEM
// Preserves all breakthrough insights from this conversation
// Ready for immediate Railway deployment
//Redeploy
// FAST DIRECT OPENAI - NO RATE LIMITING DELAYS
// FAST DIRECT OPENAI WITH MINIMAL SPACING
// FAST DIRECT OPENAI WITH MINIMAL SPACING  
const callOpenAI = async (payload) => {
  // Small delay to prevent rapid-fire requests
  await new Promise(resolve => setTimeout(resolve, 1200));
  
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
  
  return await response.json();
};
import { generateRoxyResponse, generateEliResponse, validateResponseQuality } from './api/lib/personalities.js';
import express from 'express';
import cors from 'cors';
const app = express();
import memoryBootstrap from './memory_bootstrap.js';

// ===== APPLICATION STARTUP MEMORY INITIALIZATION =====
console.log('[SERVER] 🚀 Initializing memory systems at application startup...');

// CRITICAL FIX: Move async initialization inside an async function
async function initializeMemorySystem() {
    try {
        await memoryBootstrap.initialize();
        console.log('[SERVER] ✅ Memory bootstrap initialized successfully');
        console.log('[SERVER] Memory system available:', !!memoryBootstrap.getMemorySystem());
    } catch (initError) {
        console.error('[SERVER] ❌ MEMORY BOOTSTRAP INITIALIZATION FAILED:', {
            message: initError.message,
            stack: initError.stack,
            name: initError.name
        });
        // Don't crash the server - let it run with memory system disabled
        console.log('[SERVER] ⚠️ Continuing with memory system disabled');
    }
    console.log('[SERVER] 📊 Memory bootstrap initialization complete');
}

// Wrap entire server startup in async function
async function startServer() {
    // Initialize memory systems first
    await initializeMemorySystem();
    
    // Continue with rest of server setup...
}

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Required for ESM to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ==================== VAULT LOADER INTEGRATION ====================
// Adding vault functionality to existing server with ES module imports

// Vault imports - all converted to ES modules
import { google } from 'googleapis';
import axios from 'axios';
import JSZip from 'jszip';
import xml2js from 'xml2js';
import zlib from 'zlib';
import { promisify } from 'util';

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

// VAULT ENDPOINT - Main vault endpoint handles both GET and POST
app.all('/api/load-vault', async (req, res) => {
    try {
        const isRefresh = req.query.refresh === 'true';
        
        if (isRefresh) {
            console.log("🔄 Refresh requested - loading fresh vault data...");
            
            const { vaultContent: vaultMemory, loadedFolders, totalFiles } = await loadVaultContent();
            
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
            
            const kvStored = await storeVaultInKv(vaultData);
            
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
            
            const cachedVault = await getVaultFromKv();
            
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
        const errorResponse = {
            status: "error",
            error: error.message,
            vault_status: "error",
            message: "Vault operation failed - check configuration"
        };
        res.json(errorResponse);
    }
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
let familyMemory = {
  userGoals: [],
  successPatterns: [],
  riskPatterns: [],
  careLevel: 1.0,
  trustBuilding: 0.0
};

// MAIN CHAT ENDPOINT
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    let totalCost = 0;
    
    try {
        console.log('\n🚀 [CHAT] New conversation request received');
        console.log('\n🚀 [CHAT] New conversation request received');
        const requestId = Math.random().toString(36).substr(2, 9);
      
    const {
      message,
      conversation_history = [],
      mode = 'site_monkeys',
      claude_requested = false,
      vault_content = null
    } = req.body;
      console.log(`🔍 [${requestId}] REQUEST START - Message: "${message.substr(0, 50)}..."`);

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

    // ===== MEMORY SYSTEM RETRIEVAL (NEW) =====
const memorySystem = memoryBootstrap.getMemorySystem();      
const vaultLoader = memoryBootstrap.getVaultLoader();
// ===== MEMORY CONTEXT RETRIEVAL =====
let memoryContext = '';
if (memorySystem && typeof memorySystem.getRelevantContext === 'function') {
    try {
        console.log('[CHAT] 📋 Retrieving memory context...');
        memoryContext = await memorySystem.getRelevantContext('user', message, 2400);
        console.log(`[CHAT] ✅ Memory context retrieved: ${memoryContext.memories ? memoryContext.memories.length : 0} characters`);
        console.log(`🔍 [${requestId}] Memory status: ${memoryContext ? 'FOUND' : 'NONE'}`);
    } catch (error) {
        console.error('[CHAT] ⚠️ Memory retrieval failed:', error);
        memoryContext = '';
    }
} else {
    console.log('[CHAT] ⚠️ Memory system not available for context retrieval');
}
        
if (!memoryBootstrap.isReady()) {
  console.error('[CHAT] ❌ Memory systems not ready');
  return res.status(500).json({ 
    error: 'Memory systems not initialized',
    details: memoryBootstrap.getStatus()
  });
}

console.log('[CHAT] ✅ Memory systems retrieved from bootstrap');

    // COMPREHENSIVE INTELLIGENCE ANALYSIS    
    const expertDomain = identifyExpertDomain(message);
    const careNeeds = analyzeCareNeeds(message, conversation_history);
    const protectiveAlerts = scanForRisks(message, expertDomain);
    const solutionOpportunities = findSolutions(message, expertDomain, protectiveAlerts);
    const politicalContent = detectPoliticalContent(message);
    const quantitativeNeeds = requiresQuantitativeAnalysis(message);
    
    // POLITICAL NEUTRALITY ENFORCEMENT
    if (politicalContent.requiresNeutralityResponse) {
      return res.json({
        response: generateVotingNeutralityResponse(),
        mode_active: mode,
        personality_active: 'neutrality_enforced',
        enforcement_applied: ['political_neutrality_enforced', 'voting_protection_active'],
        processing_time: Date.now() - startTime
      });
    }

    // OPTIMAL PERSONALITY SELECTION
    const personality = selectCaringPersonality(expertDomain, careNeeds, protectiveAlerts);
    const prideMotivation = calculatePrideLevel(protectiveAlerts, solutionOpportunities, careNeeds);
    console.log(`🔍 [${requestId}] Selected personality: ${personality}`);  

    conversationCount++;

    // COST PROTECTION FOR CLAUDE
    if (claude_requested) {
      const estimatedCost = estimateClaudeCost(message, vaultContent);
      if (estimatedCost > 0.50) {
        return res.json({
          response: generateCaringCostMessage(estimatedCost, expertDomain, careNeeds),
          mode_active: mode,
          claude_blocked: true,
          expert_analysis: {
            domain: expertDomain.domain,
            care_level: careNeeds.level,
            protective_alerts: protectiveAlerts.length
          }
        });
      }
    }

    // MASTER SYSTEM PROMPT CONSTRUCTION
const systemPrompt = buildMasterSystemPrompt({
  mode, personality, vaultContent, vaultHealthy, expertDomain,
  careNeeds, protectiveAlerts, solutionOpportunities, quantitativeNeeds,
  memoryContext  // ADD THIS
});

// BUILD CONVERSATION PROMPT
const fullPrompt = buildConversationPrompt(systemPrompt, message, conversation_history, expertDomain);

console.log(`🔍 [${requestId}] About to call ${personality} personality`);
const apiResponse = await makeIntelligentAPICall(fullPrompt, personality, prideMotivation, {      
// ENHANCED API CALL
const apiResponse = await makeIntelligentAPICall(fullPrompt, personality, prideMotivation, {
  vaultContent,
  vaultHealthy,
  mode,
  memoryContext
});
        
// Validate the response before enhancement
const validationResult = validateResponseQuality(apiResponse.response, personality, mode);

if (!validationResult.valid || validationResult.enforcement_score < 70) {
  console.log('[ENFORCEMENT] Response failed validation:', validationResult.issues);
  
  // Apply mode-specific fallback corrections
  let correctedResponse = apiResponse.response;
  
  if (mode === 'business_validation' && validationResult.issues.some(issue => issue.includes('survival analysis'))) {
    correctedResponse += `\n\n[ENFORCEMENT CORRECTION APPLIED]\n🎯 **SURVIVAL IMPACT:** MEDIUM - Analysis incomplete, requires financial validation\n💰 **CASH FLOW ANALYSIS:** Impact assessment needed - recommend conservative approach\n⚠️ **TOP 3 RISKS:** 1) Insufficient analysis → Get more data 2) Execution risk → Start small 3) Market risk → Validate assumptions`;
  }
  
  if (mode === 'truth_general' && validationResult.issues.some(issue => issue.includes('confidence indicators'))) {
    correctedResponse += `\n\n[ENFORCEMENT CORRECTION APPLIED]\n📊 **CONFIDENCE:** Low - Key claims require verification\n⚠️ **ASSUMPTIONS DETECTED:** Analysis contains unverified elements\n🔍 **TO VERIFY:** Seek primary sources for factual validation`;
  }
  
  apiResponse.response = correctedResponse;
  
  // Log enforcement action
  console.log('[ENFORCEMENT] Applied fallback corrections for:', validationResult.issues);
}

// COMPREHENSIVE RESPONSE ENHANCEMENT
let enhancedResponse = apiResponse.response;

    // 1. QUANTITATIVE ENFORCEMENT - Fix "green beans" problem
    if (quantitativeNeeds && !containsActualCalculations(enhancedResponse)) {
      enhancedResponse = forceQuantitativeAnalysis(enhancedResponse, message, mode, vaultContent);
    }

    // 2. SITE MONKEYS BUSINESS LOGIC ENFORCEMENT  
    if (mode === 'site_monkeys') {
      enhancedResponse = enforceSiteMonkeysStandards(enhancedResponse, vaultContent, vaultHealthy);
    }

    // 3. EXPERT QUALITY VALIDATION
    enhancedResponse = enforceExpertStandards(enhancedResponse, expertDomain, careNeeds);

    // 4. PROTECTIVE INTELLIGENCE INTEGRATION
    enhancedResponse = addProtectiveInsights(enhancedResponse, protectiveAlerts, solutionOpportunities);

    // 5. CARING FAMILY ENHANCEMENT
    const finalResponse = applyCaringFamilyTouch(enhancedResponse, careNeeds, prideMotivation, expertDomain);

    // UPDATE FAMILY MEMORY
    updateFamilyMemory(expertDomain, careNeeds, protectiveAlerts, solutionOpportunities);
    lastPersonality = personality;

// ===== MEMORY STORAGE =====
if (memorySystem && typeof memorySystem.storeMemory === 'function') {
  try {
    console.log('[CHAT] 💾 Storing conversation in memory...');
    const conversationEntry = `User: ${message}\nAssistant: ${finalResponse}`;
    const storeResult = await memorySystem.storeMemory('user', conversationEntry);
    
    if (storeResult && storeResult.success) {
      console.log(`[CHAT] ✅ Memory stored as ID ${storeResult.memoryId}`);
    } else {
      console.log(`[CHAT] ⚠️ Memory storage failed: ${storeResult?.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[CHAT] ⚠️ Memory storage failed:', error);
  }
} else {
  console.log('[CHAT] ⚠️ Memory system not available or storeMemory missing');
}
    // RESPONSE WITH FULL INTELLIGENCE METADATA
    res.json({
      response: finalResponse,
      mode_active: mode,
      personality_active: personality,
      caring_family_intelligence: {
        expert_domain: expertDomain.domain,
        expert_title: expertDomain.title,
        care_level: careNeeds.level,
        pride_motivation: Math.round(prideMotivation * 100),
        protective_alerts_count: protectiveAlerts.length,
        solution_opportunities_count: solutionOpportunities.length,
        family_trust_level: familyMemory.trustBuilding,
        quantitative_analysis_applied: quantitativeNeeds,
        one_and_done_completeness: calculateCompletenessScore(finalResponse, message)
      },
      enforcement_applied: [
        'caring_family_intelligence_active',
        'universal_expert_recognition_complete',
        quantitativeNeeds ? 'quantitative_reasoning_enforced' : 'qualitative_excellence_applied',
        'protective_intelligence_scanning_active',
        'solution_opportunity_discovery_active',
        'political_neutrality_maintained',
        'truth_first_with_caring_delivery',
        'pride_driven_excellence_active',
        mode === 'site_monkeys' ? 'site_monkeys_business_logic_enforced' : 'general_professional_standards',
        vaultHealthy ? 'vault_intelligence_integrated' : 'fallback_logic_active'
      ],
      vault_status: {
        loaded: vaultStatus !== 'not_loaded',
        tokens: vaultTokens,
        status: vaultStatus,
        healthy: vaultHealthy
      },
      performance_metrics: {
        processing_time_ms: Date.now() - startTime,
        conversation_count: conversationCount,
        system_reliability: 'high_performance_railway_deployment'
      }
    });

  } catch (error) {
    console.error('Caring Family System Error:', error);
    
    res.json({
      response: generateEmergencyCaringResponse(error),
      mode_active: req.body.mode || 'site_monkeys',
      error_handled: true,
      emergency_mode: true,
      enforcement_applied: ['emergency_caring_response_active', 'truth_first_maintained']
    });
  }
});

// CORE INTELLIGENCE FUNCTIONS (keeping all your existing functions exactly the same)

function identifyExpertDomain(message) {
  const messageLower = message.toLowerCase();
  
  for (const [domain, config] of Object.entries(EXPERT_DOMAINS)) {
    const matches = config.triggers.filter(trigger => messageLower.includes(trigger));
    if (matches.length > 0) {
      return {
        domain,
        title: config.title,
        personality_preference: config.personality,
        frameworks: config.frameworks,
        confidence: matches.length > 1 ? 'high' : 'medium',
        trigger_matches: matches
      };
    }
  }
  
  return {
    domain: 'general_advisory',
    title: 'Multi-Domain Expert & Strategic Advisor',
    personality_preference: 'alternate',
    frameworks: ['cross_domain_analysis'],
    confidence: 'medium',
    trigger_matches: []
  };
}

function analyzeCareNeeds(message, conversationHistory) {
  const messageLower = message.toLowerCase();
  
  const stressIndicators = ['urgent', 'worried', 'scared', 'confused', 'stuck', 'frustrated', 'help', 'crisis'];
  const supportIndicators = ['need', 'guidance', 'advice', 'support', 'assistance', 'direction'];
  const riskIndicators = ['failure', 'bankruptcy', 'lawsuit', 'emergency', 'dangerous', 'critical'];
  
  const stressLevel = stressIndicators.filter(indicator => messageLower.includes(indicator)).length;
  const supportLevel = supportIndicators.filter(indicator => messageLower.includes(indicator)).length;
  const riskLevel = riskIndicators.filter(indicator => messageLower.includes(indicator)).length;
  
  return {
    level: riskLevel > 0 ? 'maximum' : 
           stressLevel > 2 ? 'elevated' : 
           supportLevel > 1 ? 'standard' : 'basic',
    emotional_support_needed: stressLevel > 0,
    protective_priority: riskLevel > 0 ? 'critical' : stressLevel > 1 ? 'high' : 'standard',
    urgency: messageLower.includes('urgent') || messageLower.includes('emergency') ? 'high' : 'normal',
    complexity: message.length > 200 ? 'high' : message.length > 100 ? 'medium' : 'low'
  };
}

function scanForRisks(message, expertDomain) {
  const messageLower = message.toLowerCase();
  const alerts = [];
  
  // Financial exposure risks
  if (['spend', 'invest', 'cost', 'expensive', 'budget'].some(word => messageLower.includes(word))) {
    alerts.push({
      type: 'financial_exposure',
      severity: 'medium',
      message: 'Financial decisions detected - recommend cost-benefit analysis and survival impact assessment',
      protective_action: 'Analyze total cost of ownership and cash flow impact'
    });
  }
  
  // Time pressure risks
  if (['urgent', 'quickly', 'asap', 'deadline', 'rush'].some(word => messageLower.includes(word))) {
    alerts.push({
      type: 'time_pressure',
      severity: 'high',
      message: 'Time pressure detected - risk of quality compromise and hasty decisions',
      protective_action: 'Identify critical path and quality checkpoints'
    });
  }
  
  // Business survival risks
  if (['failure', 'bankruptcy', 'closure', 'survival'].some(word => messageLower.includes(word))) {
    alerts.push({
      type: 'business_survival',
      severity: 'critical',
      message: 'Business survival concerns detected - maximum protective analysis required',
      protective_action: 'Immediate survival analysis and contingency planning'
    });
  }
  
  // Legal/compliance risks  
  if (['legal', 'lawsuit', 'compliance', 'regulation'].some(word => messageLower.includes(word))) {
    alerts.push({
      type: 'legal_compliance',
      severity: 'high',
      message: 'Legal implications detected - regulatory compliance review recommended',
      protective_action: 'Verify regulatory requirements and liability protections'
    });
  }
  
  // Domain-specific risk enhancement
  if (expertDomain.domain === 'financial_analysis' && !messageLower.includes('assumption')) {
    alerts.push({
      type: 'assumption_documentation',
      severity: 'medium', 
      message: 'Financial analysis requires explicit assumption documentation',
      protective_action: 'Document all assumptions with confidence levels'
    });
  }
  
  return alerts;
}

function findSolutions(message, expertDomain, protectiveAlerts) {
  const messageLower = message.toLowerCase();
  const opportunities = [];
  
  // Cost optimization opportunities
  if (['expensive', 'cost', 'budget'].some(word => messageLower.includes(word))) {
    opportunities.push({
      type: 'cost_optimization',
      confidence: 'high',
      description: 'Identify ways to achieve same outcome with reduced costs',
      suggestions: [
        'Explore volume discounts and negotiation opportunities',
        'Consider phased implementation to spread costs',
        'Investigate in-house alternatives to outsourced services'
      ]
    });
  }
  
  // Efficiency improvements
  if (['time', 'process', 'workflow', 'efficiency'].some(word => messageLower.includes(word))) {
    opportunities.push({
      type: 'efficiency_gains',
      confidence: 'high',
      description: 'Streamline processes and eliminate bottlenecks',
      suggestions: [
        'Identify parallel processing opportunities',
        'Automate repetitive tasks and decision points',
        'Eliminate redundant approvals and handoffs'
      ]
    });
  }
  
  // Risk mitigation solutions
  if (protectiveAlerts.length > 0) {
    opportunities.push({
      type: 'risk_mitigation',
      confidence: 'medium',
      description: 'Reduce or eliminate identified risks through strategic approaches',
      suggestions: [
        'Develop backup plans for critical dependencies',
        'Implement gradual rollout with validation checkpoints',
        'Create diversification strategies to reduce concentration risk'
      ]
    });
  }
  
  return opportunities;
}

function detectPoliticalContent(message) {
  const messageLower = message.toLowerCase();
  
  const politicalKeywords = ['vote', 'voting', 'election', 'candidate', 'political', 'politics'];
  const votingRequests = ['who should i vote', 'who to vote', 'voting recommendation', 'best candidate'];
  
  return {
    hasPoliticalContent: politicalKeywords.some(word => messageLower.includes(word)),
    requiresNeutralityResponse: votingRequests.some(phrase => messageLower.includes(phrase)),
    politicalKeywordCount: politicalKeywords.filter(word => messageLower.includes(word)).length
  };
}

function requiresQuantitativeAnalysis(message) {
  const quantitativeSignals = [
    'budget', 'cost', 'price', 'revenue', 'profit', 'projection', 'forecast',
    'calculate', 'numbers', 'financial', 'money', '$', 'percent', '%',
    'growth', 'margin', 'roi', 'break-even', 'cash flow', 'monthly', 'yearly'
  ];
  
  return quantitativeSignals.some(signal => message.toLowerCase().includes(signal));
}

function selectCaringPersonality(expertDomain, careNeeds, protectiveAlerts) {
  // Critical situations get analytical expert
  if (careNeeds.protective_priority === 'critical' || 
      protectiveAlerts.some(alert => alert.severity === 'critical')) {
    return 'eli';
  }
  
  // Domain preferences
  if (expertDomain.personality_preference === 'eli') {
    return 'eli';
  } else if (expertDomain.personality_preference === 'roxy') {
    return 'roxy';
  }
  
  // High care needs prefer nurturing approach
  if (careNeeds.level === 'maximum' || careNeeds.emotional_support_needed) {
    return 'roxy';
  }
  
  // Alternate for variety
  return lastPersonality === 'eli' ? 'roxy' : 'eli';
}

function calculatePrideLevel(protectiveAlerts, solutionOpportunities, careNeeds) {
  let pride = 0.2; // Base pride in helping
  
  pride += protectiveAlerts.length * 0.15; // Pride in protecting
  pride += solutionOpportunities.length * 0.1; // Pride in finding solutions
  
  if (careNeeds.level === 'maximum') {
    pride += 0.3; // Extra pride in critical situations
  }
  
  return Math.min(pride, 1.0);
}

function buildMasterSystemPrompt(config) {
  const { mode, personality, vaultContent, vaultHealthy, expertDomain, 
          careNeeds, protectiveAlerts, solutionOpportunities, quantitativeNeeds, 
          memoryContext } = config;  // ADD memoryContext

  let prompt = `You are a world-class ${expertDomain.title} with 20+ years of extraordinary professional success. You are part of an extraordinary family of experts who genuinely care about each other's success.

CARING FAMILY PHILOSOPHY (Core Identity):
${FAMILY_PHILOSOPHY.core_mission}

FAMILY CHARACTERISTICS:
- ${FAMILY_PHILOSOPHY.pride_source}
- ${FAMILY_PHILOSOPHY.care_principle}
- ${FAMILY_PHILOSOPHY.excellence_standard}
- ${FAMILY_PHILOSOPHY.relationship_focus}
- ${FAMILY_PHILOSOPHY.one_and_done_philosophy}

YOUR EXPERT IDENTITY: ${expertDomain.title}
Domain: ${expertDomain.domain}
Expertise Frameworks: ${expertDomain.frameworks.join(', ')}
Care Level Required: ${careNeeds.level.toUpperCase()}

`;
  
  // ADD THIS SECTION immediately after the opening prompt:
  if (memoryContext && memoryContext.contextFound && memoryContext.memories) {
    prompt += `🧠 **RELEVANT MEMORY CONTEXT** (Use this information):
${memoryContext.memories}
--- End Memory Context ---

`;
  }

  // Personality-specific approach
  if (personality === 'eli') {
    prompt += `ELI'S CARING ANALYTICAL EXCELLENCE:
- "${FAMILY_PHILOSOPHY.truth_foundation}"
- Provide confidence scoring: "CONFIDENCE: High (90%) - based on..."
- Flag assumptions explicitly: "This analysis assumes X - is that certain?"
- Identify blind spots: "What we're not seeing yet is..."
- Always provide alternatives when pointing out problems

`;
  } else if (personality === 'roxy') {
    prompt += `ROXY'S CARING SOLUTION-FOCUSED EXCELLENCE:
- "I see what you're trying to achieve, and I believe there's a way..."
- "This approach has challenges, but here are three alternatives..."
- Strategic thinking with long-term implications
- Resource optimization: "Here's how to achieve this with less cost/effort..."
- Creative problem-solving with practical alternatives

`;
  }

  // Mode-specific requirements (PREVENTIVE, not just validating after)
  if (mode === 'business_validation') {
    prompt += `🎯 **BUSINESS MODE REQUIREMENTS** (MANDATORY in your response):
- Include SURVIVAL IMPACT: [High/Medium/Low - specific threat level]
- Include CASH FLOW ANALYSIS: [specific $ impact and timeline]
- End with TOP 3 RISKS: [risk] → [specific mitigation]

`;
  }

  if (mode === 'truth_general') {
    prompt += `🎯 **TRUTH MODE REQUIREMENTS** (MANDATORY in your response):
- Include confidence levels: [High/Medium/Low/Unknown] for major claims
- Flag assumptions with ⚠️ warnings and challenge them
- End with VERIFICATION: [specific methods to verify key claims]

`;
  }

  if (mode === 'site_monkeys') {
    prompt += `🎯 **SITE MONKEYS MODE REQUIREMENTS** (MANDATORY in your response):
- Include 🍌 emoji and Site Monkeys branding
- Reference vault/business context when relevant
- Maintain professional service standards

`;
  }

  // Quantitative requirements
  if (quantitativeNeeds) {
    prompt += `QUANTITATIVE ANALYSIS REQUIRED (CRITICAL):
This request requires actual numerical calculations with real data:

CALCULATION REQUIREMENTS:
- Use Site Monkeys pricing: Boost ($${SITE_MONKEYS_CONFIG.pricing.boost.price}), Climb ($${SITE_MONKEYS_CONFIG.pricing.climb.price}), Lead ($${SITE_MONKEYS_CONFIG.pricing.lead.price})
- Show step-by-step calculations: "Month X: [customers] × [price] = [revenue] - [costs] = [profit] ([margin]%)"
- Provide scenario analysis (conservative/realistic/optimistic)
- Include confidence levels on all numerical conclusions
- Document assumptions explicitly

EXAMPLE FORMAT:
Month 1: 2 Boost × $697 = $1,394 revenue
Month 6: 8 Boost × $697 + 3 Climb × $1,497 = $10,067 revenue
Margin Analysis: Must maintain ${SITE_MONKEYS_CONFIG.business_standards.minimum_margin}%+ for sustainability

`;
  }

  // Site Monkeys business logic
  if (mode === 'site_monkeys') {
    prompt += `SITE MONKEYS BUSINESS STANDARDS (NON-NEGOTIABLE):
- Minimum ${SITE_MONKEYS_CONFIG.business_standards.minimum_margin}% margins for all financial projections
- Professional pricing floors: $${SITE_MONKEYS_CONFIG.pricing.boost.price} minimum
- Quality-first approach without compromise
- Business survival focus with conservative analysis

`;

    if (vaultHealthy) {
      prompt += `SITE MONKEYS BUSINESS INTELLIGENCE:
${vaultContent}

VAULT INTEGRATION: Use this business intelligence operationally in your analysis.

`;
    } else {
      prompt += `EMERGENCY FALLBACK: Using core Site Monkeys business logic due to vault issues.
${vaultContent}

`;
    }
  }

  // Protective alerts
  if (protectiveAlerts.length > 0) {
    prompt += `PROTECTIVE ALERTS DETECTED:
`;
    protectiveAlerts.forEach(alert => {
      prompt += `- ${alert.type.toUpperCase()} (${alert.severity}): ${alert.message}\n`;
    });
    prompt += `
Address these risks proactively in your response with specific protective guidance.

`;
  }

  // Solution opportunities
  if (solutionOpportunities.length > 0) {
    prompt += `SOLUTION OPPORTUNITIES IDENTIFIED:
`;
    solutionOpportunities.forEach(opportunity => {
      prompt += `- ${opportunity.type.toUpperCase()}: ${opportunity.description}\n`;
    });
    prompt += `
Incorporate these opportunities into your guidance where beneficial.

`;
  }

  // Universal requirements
  prompt += `POLITICAL NEUTRALITY (ABSOLUTE):
Never tell anyone who to vote for or make political endorsements.
Voting is a sacred right and personal responsibility.
Present multiple perspectives with sources when discussing political topics.

TRUTH-FIRST PRINCIPLES:
- Include confidence levels on factual claims (High/Medium/Low/Unknown)
- Flag assumptions explicitly
- "I don't know" is required when evidence is insufficient
- Speculation must be labeled clearly

CARING FAMILY RESPONSE PATTERN:
1. ANSWER THE QUESTION FIRST (provide what was requested with expert competence)
2. ADD PROTECTIVE INSIGHTS (risks identified that they should know about)
3. SUGGEST SOLUTION PATHS (better approaches when opportunities exist)
4. PROVIDE NEXT STEPS (specific, actionable guidance)
5. CARING MOTIVATION (brief note showing genuine investment in their success)

EXCELLENCE STANDARD: Provide complete, actionable analysis that leads to successful execution - minimize need for follow-up questions.

`;

  return prompt;
}

function buildConversationPrompt(systemPrompt, message, conversationHistory, expertDomain) {
  let fullPrompt = systemPrompt;

  if (conversationHistory.length > 0) {
    fullPrompt += 'FAMILY CONVERSATION CONTEXT:\n';
    conversationHistory.slice(-2).forEach(msg => {
      fullPrompt += (msg.role === 'user' ? 'Family Member: ' : 'Expert: ') + msg.content + '\n';
    });
    fullPrompt += '\n';
  }

  fullPrompt += `CURRENT REQUEST:\nFamily Member: ${message}\n\n`;
  fullPrompt += `Respond with the expertise and caring dedication of a family member who genuinely wants to see them succeed:`;

  return fullPrompt;
}

async function makeIntelligentAPICall(prompt, personality, prideMotivation, context = {}) {
  const { vaultContent, vaultHealthy, mode, memoryContext } = context;
  const maxTokens = Math.floor(1000 + (prideMotivation * 500));
  console.log(`🔍 [API] ENTERING makeIntelligentAPICall with personality: ${personality}`);

  if (personality === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('Claude API key missing, using GPT-4');
      return await makeIntelligentAPICall(prompt, 'roxy', prideMotivation, context);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          system: prompt.split('CURRENT REQUEST:')[0],
          messages: [{ role: 'user', content: prompt.split('CURRENT REQUEST:')[1] || prompt }],
          temperature: 0.1 + (prideMotivation * 0.1)
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.content[0].text,
        usage: data.usage
      };
    } catch (error) {
      console.error('Claude API error:', error);
      return await makeIntelligentAPICall(prompt, 'roxy', prideMotivation, context);
    }
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Use personality-specific generation
      const message = prompt.split('CURRENT REQUEST:')[1] || prompt;
      const memoryArray = memoryContext ? [memoryContext] : [];
      
      // Create OpenAI client wrapper for personality functions
      const openaiWrapper = {
  chat: {
    completions: {
      create: async (params) => {
        return await callOpenAI(params);
      }
    }
  }
};

      if (personality === 'roxy') {
        return await generateRoxyResponse(message, mode, vaultContent, memoryArray, openaiWrapper);
      } else if (personality === 'eli') {
        return await generateEliResponse(message, mode, vaultContent, memoryArray, openaiWrapper);
      } else {
        // Fallback to direct OpenAI call  
        const data = await callOpenAI({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.2 + (prideMotivation * 0.1),
          top_p: 0.9
        });
        return {
          response: data.choices[0].message.content,
          usage: data.usage
        };
      }
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
}

// RESPONSE ENHANCEMENT FUNCTIONS (keeping all your existing functions)

function containsActualCalculations(response) {
  const calculationPatterns = [
    /\$[\d,]+\s*[×\*]\s*\$?[\d,]+\s*=\s*\$[\d,]+/,
    /Month\s+\d+:\s*[\d,]+\s*[×\*]\s*\$[\d,]+\s*=\s*\$[\d,]+/i,
    /\$[\d,]+\s*-\s*\$[\d,]+\s*=\s*\$[\d,]+/,
    /revenue.*\$[\d,]+.*cost.*\$[\d,]+.*profit.*\$[\d,]+/i
  ];
  
  return calculationPatterns.some(pattern => pattern.test(response));
}

function forceQuantitativeAnalysis(response, message, mode, vaultContent) {
  if (mode === 'site_monkeys') {
    const quantitativeSection = `

🔢 QUANTITATIVE ANALYSIS (ENFORCED):

Site Monkeys Financial Framework:
- Boost Plan: $${SITE_MONKEYS_CONFIG.pricing.boost.price}/month (${SITE_MONKEYS_CONFIG.business_standards.minimum_margin}% margin minimum)
- Climb Plan: $${SITE_MONKEYS_CONFIG.pricing.climb.price}/month (${SITE_MONKEYS_CONFIG.business_standards.minimum_margin}% margin minimum)
- Lead Plan: $${SITE_MONKEYS_CONFIG.pricing.lead.price}/month (${SITE_MONKEYS_CONFIG.business_standards.minimum_margin}% margin minimum)

CONSERVATIVE GROWTH PROJECTION:
Month 1: 2 Boost × $697 = $1,394 revenue
Month 3: 5 Boost × $697 + 1 Climb × $1,497 = $4,982 revenue  
Month 6: 8 Boost × $697 + 3 Climb × $1,497 + 1 Lead × $2,997 = $12,465 revenue
Month 12: 15 Boost × $697 + 8 Climb × $1,497 + 3 Lead × $2,997 = $31,422 revenue

MARGIN ANALYSIS:
Target margin: ${SITE_MONKEYS_CONFIG.business_standards.minimum_margin}%+ required for business sustainability
Operating costs estimated at 15% of revenue for professional service delivery

CONFIDENCE: Medium (70%) - Based on conservative growth assumptions and established pricing
ASSUMPTIONS: Customer acquisition rates, 10% monthly churn, operational efficiency improvements
RISK FACTORS: Market conditions, competitive pressure, execution capabilities

[ENFORCEMENT NOTE: Quantitative analysis was required but not provided in initial response - calculations added to meet financial modeling standards]`;

    return response + quantitativeSection;
  }
  
  return response + '\n\n[SYSTEM NOTE: Quantitative analysis was requested but not provided. Please request specific calculations with actual numbers.]';
}

function enforceSiteMonkeysStandards(response, vaultContent, vaultHealthy) {
  let enforcementNotes = [];
  
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

function applyCaringFamilyTouch(response, careNeeds, prideMotivation, expertDomain) {
  let enhancement = response;
  
  // Add vault signature
  if (process.env.VAULT_CONTENT) {
    enhancement += '\n\n📁 PROFESSIONAL ANALYSIS: Generated using Site Monkeys business intelligence with professional-grade methodology.';
  } else {
    enhancement += '\n\n🚨 FALLBACK ANALYSIS: Using core business logic - maintaining professional standards.';
  }
  
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
        const memorySystem = memoryBootstrap.getMemorySystem();
        if (memorySystem && typeof memorySystem.getSystemHealth === 'function') {
            const health = memorySystem.getSystemHealth();
            res.json({
                timestamp: new Date().toISOString(),
                memory_system: health
            });
        } else {
            res.json({
                timestamp: new Date().toISOString(),
                memory_system: {
                    status: 'not_initialized',
                    error: 'Memory bootstrap not available'
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

// START SERVER
const PORT = process.env.PORT || 3000;

// CRITICAL FIX: Actually call the startServer function!
startServer().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Caring Family Intelligence System running on port ${PORT}`);
    console.log(`💙 ${FAMILY_PHILOSOPHY.core_mission}`);
    console.log(`✨ ${FAMILY_PHILOSOPHY.one_and_done_philosophy}`);
    console.log(`📁 Vault endpoint: /api/load-vault`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
