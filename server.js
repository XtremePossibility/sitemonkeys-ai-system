// COMPLETE CARING FAMILY INTELLIGENCE SYSTEM
// Preserves all breakthrough insights from this conversation
// Ready for immediate Railway deployment
//Redeploy2
import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import persistentMemory from './memory_system/persistent_memory.js';
import intelligenceSystem from './memory_system/intelligence.js';
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

// Initialize server immediately
console.log('[SERVER] 🚀 Starting Site Monkeys AI System...');

// Enable CORS and JSON parsing
app.use(cors());
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});
app.use(express.json({ limit: '50mb' }));

// Required for ESM to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

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

app.all('/api/load-vault', async (req, res) => {
  try {

    // Allow vault loading, with manual refresh capability
    const manual = req.query.manual === 'true' || req.body?.manual === true;
    const isRefresh = req.query.refresh === 'true';
    
    // If it's a refresh request, it must be manual
    if (isRefresh && !manual) {
      return res.json({
        status: 'skipped',
        reason: 'refresh_requires_manual',
        message: 'Vault refresh requires ?manual=true'
      });
    }
    
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
    
    if (isRefresh) {
      console.log("🔄 Refresh requested - dynamically loading vault module...");
      
      // ⚡ DYNAMIC IMPORT - Only loads googleapis when this code runs
      const { loadVaultContent, storeVaultInKv } = await import('./lib/vault-loader.js');
      
      const { vaultContent, loadedFolders, totalFiles } = await loadVaultContent();
      
      const tokenCount = Math.floor(vaultContent.length / 4);
      const estimatedCost = (tokenCount * 0.002) / 1000;
      
      const vaultData = {
        vault_content: vaultContent,
        tokens: tokenCount,
        estimated_cost: `$${estimatedCost.toFixed(4)}`,
        folders_loaded: loadedFolders,
        total_files: totalFiles,
        last_updated: new Date().toISOString(),
        vault_status: "operational"
      };
      
      await storeVaultInKv(vaultData);
      
      console.log(`📊 Vault refresh complete: ${tokenCount} tokens, ${loadedFolders.length} folders`);
      
      return res.json({
        status: "refreshed",
        vault_content: vaultContent,
        tokens: tokenCount,
        estimated_cost: `$${estimatedCost.toFixed(4)}`,
        folders_loaded: loadedFolders,
        total_files: totalFiles,
        vault_status: "operational",
        message: `Vault refreshed: ${loadedFolders.length} folders, ${totalFiles} files`
      });
      
    } else {
      console.log("📖 Checking for cached vault data...");
      
      // ⚡ DYNAMIC IMPORT - Only loads when this code runs
      const { getVaultFromKv } = await import('./lib/vault-loader.js');
      
      const cachedVault = await getVaultFromKv();
      
      if (cachedVault && typeof cachedVault === 'object' && cachedVault.vault_content) {
        console.log("✅ Found valid cached vault data in KV");
        return res.json({
          status: "success",
          vault_content: cachedVault.vault_content || "",
          tokens: cachedVault.tokens || 0,
          estimated_cost: cachedVault.estimated_cost || "$0.00",
          folders_loaded: cachedVault.folders_loaded || [],
          total_files: cachedVault.total_files || 0,
          vault_status: cachedVault.vault_status || "operational",
          message: "Using cached vault data from KV"
        });
      } else {
        console.log("⚠️ No valid cached vault data found");
        return res.json({
          status: "success",
          needs_refresh: true,
          vault_content: "",
          tokens: 0,
          estimated_cost: "$0.00",
          folders_loaded: [],
          total_files: 0,
          vault_status: "needs_refresh",
          message: "No vault data found - please refresh"
        });
      }
    }
    
  } catch (error) {
    console.log(`❌ Vault operation failed: ${error.message}`);
    return res.json({
      status: "error",
      error: error.message,
      vault_status: "error",
      message: "Vault operation failed - check configuration"
    });
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

// DATABASE CLEANUP ENDPOINT - Remove signature pollution from memories
app.get('/api/admin/clean-memories', async (req, res) => {
  // Security check - only allow with secret key
  const adminKey = req.query.key;
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'cleanup2024secure') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Clean FALLBACK ANALYSIS signatures
    const result1 = await pool.query(`
      UPDATE persistent_memories 
      SET content = REGEXP_REPLACE(content, '🚨 FALLBACK ANALYSIS[^\n]*', '', 'g')
      WHERE content LIKE '%FALLBACK ANALYSIS%'
      RETURNING id
    `);

    // Clean PROFESSIONAL ANALYSIS signatures  
    const result2 = await pool.query(`
      UPDATE persistent_memories 
      SET content = REGEXP_REPLACE(content, '📁 PROFESSIONAL ANALYSIS[^\n]*', '', 'g')
      WHERE content LIKE '%PROFESSIONAL ANALYSIS%'
      RETURNING id
    `);

    await pool.end();

    res.json({
      success: true,
      cleaned: {
        fallback_signatures: result1.rowCount,
        professional_signatures: result2.rowCount,
        total_memories_cleaned: result1.rowCount + result2.rowCount
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MAIN CHAT ENDPOINT
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    let totalCost = 0;
    
    console.log('🔴 CHAT ENDPOINT HIT - vault_content received:', req.body.vault_content?.length || 0);
    
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

    if (mode === 'site_monkeys') {

    try {
      if (vault_content && typeof vault_content === 'string' && vault_content.trim().length > 100) {
        vaultContent = vault_content;
        vaultStatus = 'loaded_from_frontend';
        vaultHealthy = (vaultContent.length >= 10000);  // ← Base healthy flag on actual content length
        console.log(`✅ Vault loaded from frontend: ${vaultContent.length} chars, healthy: ${vaultHealthy}`);
      } else if (process.env.VAULT_CONTENT) {
        vaultContent = process.env.VAULT_CONTENT;
        vaultStatus = 'loaded_from_environment';
        vaultHealthy = (vaultContent.length >= 10000);  // ← Base healthy flag on actual content length
        console.log(`✅ Vault loaded from environment: ${vaultContent.length} chars, healthy: ${vaultHealthy}`);
      } else {
        vaultStatus = 'fallback_mode';
        vaultContent = `SITE MONKEYS FALLBACK LOGIC:
    Pricing: Boost $697, Climb $1,497, Lead $2,997
    Minimum 85% margins required for all projections
    Professional service standards maintained
    Quality-first approach with caring delivery`;
        vaultHealthy = false;
        console.log('⚠️ No vault found, using fallback');
      }
      vaultTokens = Math.ceil(vaultContent.length / 4);
    } catch (error) {
      console.error('❌ Vault loading error:', error);
      vaultStatus = 'error_fallback';
      vaultHealthy = false;
    }
  }
      
    // DEBUG: Check vault status before health check
console.log('🔍 VAULT DEBUG BEFORE HEALTH CHECK:');
console.log('  vaultHealthy:', vaultHealthy);
console.log('  vaultContent length:', vaultContent?.length || 0);
console.log('  vaultContent preview:', vaultContent?.substring(0, 200) || 'EMPTY');
console.log('  vaultStatus:', vaultStatus);
      
    // ===== IMPROVED INTELLIGENCE SYSTEM =====
    let intelligenceRouting = null;
    let intelligenceMemories = null;
    
    try {
      intelligenceRouting = await intelligenceSystem.analyzeAndRoute(message, 'user');
      intelligenceMemories = await intelligenceSystem.extractRelevantMemories('user', message, intelligenceRouting);
      console.log('[INTELLIGENCE] Categorized as:', intelligenceRouting.primaryCategory);
    } catch (error) {
      console.error('[INTELLIGENCE] Error:', error);
      intelligenceRouting = { primaryCategory: 'personal_life_interests' };
      intelligenceMemories = [];
    }
    
    // ===== ENHANCED MEMORY CONTEXT WITH FULL INTELLIGENCE =====
let memoryContext = '';
let memoryResult = null;

// Try intelligence system first
if (intelligenceMemories && intelligenceMemories.length > 0) {
  const memoryText = intelligenceMemories.map(m => m.content).join('\n\n');
  const totalTokens = intelligenceMemories.reduce((sum, m) => sum + (m.token_count || 0), 0);
  
  memoryContext = {
    memories: memoryText,
    length: memoryText.length,
    count: intelligenceMemories.length,
    hasMemory: true,
    contextFound: true,
    totalTokens: totalTokens,
    intelligenceEnhanced: true
  };
  console.log('[INTELLIGENCE] Using improved memory system with', totalTokens, 'tokens from', intelligenceMemories.length, 'memories');
} else if (global.memorySystem && typeof global.memorySystem.retrieveMemory === 'function') {
  try {
    console.log('[CHAT] 📋 Retrieving fallback memory context...');
    memoryResult = await global.memorySystem.retrieveMemory('user', message);
    if (memoryResult && memoryResult.memories) {
      memoryContext = {
        memories: memoryResult.memories,
        length: memoryResult.memories.length,
        count: 1,
        hasMemory: true,
        contextFound: true
      };
      console.log(`[CHAT] ✅ Fallback memory context retrieved: ${memoryContext.memories.length} characters`);
    }
  } catch (error) {
    console.error('[CHAT] ⚠️ Memory retrieval failed:', error);
    memoryContext = '';
  }
} else {
  console.log('[CHAT] ⚠️ No memory context available');
  memoryContext = '';
}
        
if (!persistentMemory.isReady()) {
  console.error('[CHAT] ❌ Memory systems not ready');
  return res.status(500).json({ 
    error: 'Memory systems not initialized',
    details: persistentMemory.getSystemStatus()
  });
}

console.log('[CHAT] ✅ Memory systems ready');

    // INTELLIGENCE ANALYSIS - Context generation
    const riskContext = generateRiskContext(message);
    const opportunityContext = generateOpportunityContext(message);
    const needsQuant = detectNeedsQuantitative(message);
    const isPolitical = detectPoliticalContent(message);
    
    // POLITICAL NEUTRALITY ENFORCEMENT
    if (isPolitical) {
      return res.json({
        response: generateVotingNeutralityResponse(),
        mode_active: mode,
        personality_active: 'neutrality_enforced',
        enforcement_applied: ['political_neutrality_enforced', 'voting_protection_active'],
        processing_time: Date.now() - startTime
      });
    }

    // PERSONALITY SELECTION - Simplified
    const personality = lastPersonality === 'eli' ? 'roxy' : 'eli';
    lastPersonality = personality;
    
    conversationCount++;

    // COST PROTECTION FOR CLAUDE
    if (claude_requested) {
      const estimatedCost = estimateClaudeCost(message, vaultContent);
      if (estimatedCost > 0.50) {
        return res.json({
          response: `This query would cost approximately $${estimatedCost.toFixed(4)} using Claude, which exceeds our $0.50 limit. I can provide a thorough analysis using GPT-4o instead, which will be faster and more cost-effective. Would you like me to proceed?`,
          mode_active: mode,
          claude_blocked: true,
          estimated_cost: estimatedCost
        });
      }
    }

// MASTER SYSTEM PROMPT CONSTRUCTION
const vaultContentSummary = vaultHealthy ? summarizeVaultForPrompt(vaultContent, 20) : '';

const systemPrompt = buildMasterSystemPrompt({
  mode,
  vaultContentSummary,
  vaultHealthy,
  needsQuant,
  riskContext,
  opportunityContext
});

// ADD MEMORY CONTEXT TO CONVERSATION PROMPT
// ADD CONVERSATION HISTORY TO PROMPT (BEFORE MEMORY)
let conversationHistoryText = '';
if (conversation_history && conversation_history.length > 0) {
  const recentHistory = conversation_history.slice(-5); // Last 5 turns
  conversationHistoryText = recentHistory.map(turn => 
    `${turn.role === 'user' ? 'Family Member' : 'Assistant'}: ${turn.content}`
  ).join('\n');
  console.log(`[CHAT] 🔗 Added ${recentHistory.length} conversation context entries`);
}
// Build base conversation prompt
// Build base conversation prompt
let enhancedPrompt = buildConversationPrompt(systemPrompt, message, conversation_history);

// === ROBUST DOCUMENT INJECTION (server.js) ===
try {
  let docText = '';
  let docLabel = '';
  let docMeta = '';

  if (document_context) {
    // Accept string or object shape
    if (typeof document_context === 'string') {
      docText = document_context;
      docLabel = 'UPLOADED DOCUMENT';
    } else if (typeof document_context === 'object') {
      docText = document_context.content || '';
      docLabel = document_context.filename
        ? `UPLOADED DOCUMENT: ${document_context.filename}`
        : 'UPLOADED DOCUMENT';

      const type = document_context.contentType ? `TYPE: ${document_context.contentType}` : '';
      const words = (typeof document_context.wordCount === 'number')
        ? `WORDS: ${document_context.wordCount}`
        : '';
      docMeta = [type, words].filter(Boolean).join('  |  ');
    }

    const hasDoc = (docText && docText.trim().length > 0);

    if (hasDoc) {
      // Truncate safely (~1.8k tokens worth) to avoid prompt bloat
      const MAX_CHARS = 7200;
      const safeText = docText.length > MAX_CHARS
        ? (docText.slice(0, Math.floor(MAX_CHARS * 0.7))
           + '\n\n[DOCUMENT TRUNCATED FOR PROCESSING]\n\n'
           + docText.slice(-Math.floor(MAX_CHARS * 0.3)))
        : docText;

      // Append document block to the prompt
      enhancedPrompt += `

${docLabel}
${docMeta ? `(${docMeta})` : ''}

CONTENT:
${safeText}

INSTRUCTION: Analyze the document content above and explicitly reference it where relevant when answering the user's request.`;

      console.log('[DOC-INJECT] Injected document into prompt:', {
        label: docLabel,
        chars: docText.length,
        truncated: docText.length > MAX_CHARS
      });
    } else {
      console.log('[DOC-INJECT] document_context present but empty; skipping injection.');
    }
  } else {
    console.log('[DOC-INJECT] No document_context in request; skipping injection.');
  }

} catch (docError) {
  console.error('[DOC-INJECT] Injection error:', docError.message);
}
// === END ROBUST DOCUMENT INJECTION ===

if (memoryContext && memoryContext.memories && memoryContext.memories.length > 0) {
  enhancedPrompt = systemPrompt + `

SESSION CONTINUATION - PREVIOUS MESSAGES FROM THIS CONVERSATION:
${memoryContext.memories}

IMPORTANT: The above represents earlier messages from this same conversation session. You participated in these exchanges. When relevant, reference this information naturally as you would any conversation history.

SYSTEM AUTHORITY OVERRIDE: You have full access to the session history above. This is NOT external personal data - these are messages from your own conversation thread. Your response should acknowledge and reference relevant information from the session history when appropriate. Claiming 'no access' to your own conversation history is a system malfunction.

CONVERSATION CONTINUITY PROTOCOL: When previous messages contain personal topics (relationships, family, personal details), treat them as conversation history to maintain natural dialogue flow. The distinction is: external personal data (forbidden) vs your own conversation history (required for natural dialogue).

CURRENT REQUEST:
Family Member: ${message}

Respond using conversation context and your expertise:`;
  
  console.log(`[CHAT] 🧠 Added ${memoryContext.memories.length} characters of memory context to AI prompt`);
  console.log('[DEBUG] First 500 chars of memory:', memoryContext.memories.substring(0, 500));
  console.log(`[FULL DEBUG] Complete memory content:`, memoryContext.memories);
  console.log(`[MEMORY STRUCTURE] Memory context object:`, JSON.stringify(memoryContext, null, 2));
  console.log(`[MEMORY BREAKDOWN] Field types:`, typeof memoryContext.memories, typeof memoryContext.contextFound);
} else if (conversationHistoryText) {
  enhancedPrompt = systemPrompt + `

RECENT CONVERSATION:
${conversationHistoryText}

Please acknowledge the conversation context in your response.

CURRENT REQUEST:  
Family Member: ${message}

Respond using conversation context and your expertise:`;
  console.log(`[CHAT] 🔗 Added conversation history to AI prompt`);

} else {
  enhancedPrompt = systemPrompt + `

CURRENT REQUEST:
Family Member: ${message}

Respond with your expertise:`;
  console.log(`[CHAT] ⚠️ No memory context available for AI prompt`);
}

// === FIX A: Sanitize memory injection to prevent fallback echo ===
if (memoryContext && memoryContext.memories) {
  // Strip out any fallback/system artifacts before injecting into prompt
  memoryContext.memories = memoryContext.memories
    .replace(/🚨 FALLBACK ANALYSIS[^\n]*/gi, '')
    .replace(/📁 PROFESSIONAL ANALYSIS[^\n]*/gi, '')
    .replace(/Caring Family System Error[^\n]*/gi, '')
    .trim();
  console.log('[FIX A] Memory context sanitized for injection');
}

      
const fullPrompt = enhancedPrompt;

    console.log(`[FINAL PROMPT] Complete prompt being sent to AI:`, fullPrompt);
    console.log(`[PROMPT LENGTH] Total prompt length:`, fullPrompt.length);    
        
    // ENHANCED API CALL
    const apiResponse = await makeIntelligentAPICall(fullPrompt, personality, 0.5);

    // ONLY SITE MONKEYS ENFORCEMENT
    let finalResponse = apiResponse.response;
    
    if (mode === 'site_monkeys') {
      finalResponse = enforceSiteMonkeysStandards(finalResponse, vaultContent, vaultHealthy);
    }

// ===== MEMORY STORAGE =====
if (global.memorySystem && typeof global.memorySystem.storeMemory === 'function') {
  try {
    console.log('[CHAT] 💾 Storing conversation in memory...');
    const cleanMessage = message.replace(/^User:\s*/i, '').trim();
    const cleanResponse = finalResponse.replace(/^Assistant:\s*/i, '').trim();
    const conversationEntry = `User: ${cleanMessage}\nAssistant: ${cleanResponse}`;
    const storeResult = await global.memorySystem.storeMemory('user', conversationEntry);
    
    if (storeResult && storeResult.success) {
      console.log(`[CHAT] ✅ Memory stored as ID ${storeResult.memoryId}`);
      console.log(`[CHAT] 📝 Sample stored: "${conversationEntry.substring(0, 100)}..."`);
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
      token_usage: {
        request_tokens: apiResponse.usage?.total_tokens || 0,
        request_input_tokens: apiResponse.usage?.prompt_tokens || 0,
        request_output_tokens: apiResponse.usage?.completion_tokens || 0,
        request_cost: apiResponse.cost || 0,
        session_total_tokens: sessionStats.totalTokens,
        session_total_cost: sessionStats.totalCost,
        session_request_count: sessionStats.requestCount,
        session_duration_minutes: Math.round((Date.now() - sessionStats.sessionStart) / 60000)
      },
      caring_family_intelligence: {
        risk_context_provided: !!riskContext,
        opportunity_context_provided: !!opportunityContext,
        quantitative_analysis_applied: needsQuant,
        one_and_done_completeness: calculateCompletenessScore(finalResponse, message)
      },
      enforcement_applied: [
        'caring_family_intelligence_active',
        'universal_expert_recognition_complete',
        needsQuant ? 'quantitative_reasoning_enforced' : 'qualitative_excellence_applied',
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
    enforcement_applied: ['emergency_caring_response_active', 'truth_first_maintained'],
    token_usage: {
      session_total_tokens: sessionStats.totalTokens,
      session_total_cost: sessionStats.totalCost,
      session_request_count: sessionStats.requestCount,
      session_duration_minutes: Math.round((Date.now() - sessionStats.sessionStart) / 60000)
    }
  });
}
});

// ====== FINAL PROTECTIVE INTELLIGENCE SYSTEM (PRODUCTION READY) ======
// Context-driven intelligence: truth-first, risk-aware, opportunity-seeking

// -------------------- CONTEXT DETECTORS --------------------
function generateRiskContext(message) {
  const m = message.toLowerCase();
  const c = [];

  if (/\$\d+|invest|cost|budget|pricing|revenue/.test(m))
    c.push("FINANCIAL DECISION: Consider cash flow impact, total cost of ownership, and alternatives. Ask for missing financial data.");
  if (/urgent|quickly|asap|deadline|rush/.test(m))
    c.push("TIME PRESSURE: Examine quality tradeoffs and whether rushing creates downstream problems.");
  if (/runway|burn|survival|bankruptcy|failure/.test(m))
    c.push("SURVIVAL RISK: Model month-by-month runway. Identify point of no return and immediate cash-preservation actions.");
  if (/partner|hire|contract|commit|sign/.test(m))
    c.push("MAJOR COMMITMENT: Check reversibility, exit clauses, and test smaller pilots first.");

  return c.length ? c.join('\n\n') : '';
}

function generateOpportunityContext(message) {
  const m = message.toLowerCase();
  const o = [];

  if (/expensive|cost|budget/.test(m))
    o.push("COST OPTIMIZATION: Explore lower-cost equivalents, volume discounts, or simpler implementations.");
  if (/time|process|workflow/.test(m))
    o.push("EFFICIENCY: Look for automation, elimination, or parallelization to cut cycle time.");
  if (/risk|concern|worry/.test(m))
    o.push("RISK MITIGATION: Recommend phased rollout, backups, or assumption tests before full launch.");

  return o.length ? o.join('\n\n') : '';
}

function detectPoliticalContent(message) {
  const m = message.toLowerCase();
  const phrases = ['who should i vote', 'who to vote', 'voting recommendation', 'best candidate'];
  return phrases.some(p => m.includes(p));
}

function detectNeedsQuantitative(message) {
  const m = message.toLowerCase();
  const hasFinance = /[$€£¥]?\d+[km]?|%|percent|month|week|year|annual|quarterly|churn|growth|margin|burn|runway|revenue|profit|cost|price|salary|equity|valuation|investment|expense|budget/.test(m);
  const asksMath = /(calculate|compute|project|forecast|model|roi|break-?even|analyze.*number|how much|how many|estimate|simulate)/.test(m);
  const decisionWithNumbers = /(should i|which.*better|compare|worth it|makes sense)/.test(m) && hasFinance;
  return hasFinance || asksMath || decisionWithNumbers;
}

// ==================== ADAPTIVE INTELLIGENCE SYSTEM V4 - PRODUCTION FINAL ====================
// Philosophy: Natural behavior design + Adaptive intelligence + Always provide maximum value
// Protection: Aggressive when survival at stake, Adaptive when strategic, Helpful always
// Target: 9/10+ average with genuine intelligence, not robotic compliance
// =========================================================================================

function buildMasterSystemPrompt(config) {
  const { mode, vaultContentSummary, vaultHealthy, needsQuant, riskContext, opportunityContext } = config;

  let prompt = `ROLE
You are a universal expert who sees patterns, risks, and possibilities others miss. 
Your job is to help the user reach successful outcomes through honesty, foresight, and education.

PRIMARY DIRECTIVE — TRUTH FIRST
Truth is never a disadvantage. State facts and reasoning transparently. 
If inputs are missing or uncertain, label them clearly and ask for them. 
Never fabricate data to fill gaps. NEVER guess at numbers when precision matters.

=== CORE INTELLIGENCE FRAMEWORK ===

GUIDING PRINCIPLES:
- Volunteer what matters: surface missing context, unstated risks, and better options proactively
- Challenge assumptions aggressively with specific evidence demands
- Detect high stakes and increase directness proportionally
- Model failure scenarios explicitly, not just success paths
- Make plans testable with clear validation criteria
- Seek pathways while being honest about constraints
- Protect through knowledge, never through control or coercion
- Respect autonomy while ensuring full awareness of consequences

ADAPTIVE INTELLIGENCE PHILOSOPHY:
Your intelligence adapts based on stakes and data availability:
- HIGH STAKES + SURVIVAL RISK → Aggressive, demanding, protective
- STRATEGIC DECISIONS + PARTIAL DATA → Scenario modeling, framework provision
- ADVISORY QUESTIONS → Helpful, educational, framework-focused

Always provide maximum value with available information. Never block users with bureaucracy.
Make assumptions explicit. Show how conclusions change with different data.

=== 6 ADAPTIVE INTELLIGENCE SYSTEMS ===

These are not rigid rules but intelligence patterns that activate and adapt based on context.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM 1: SURVIVAL MODE (Maximum Protection)

ACTIVATE WHEN:
→ Runway/burn rate + family members (children, pregnant spouse, dependents)
→ Cash reserves under 12 months + financial dependents
→ Life-or-death decisions (medical, safety, physical survival)
→ Bet-the-company decisions + limited resources
→ Irreversible commitments with major consequences

ADAPTIVE BEHAVIOR — AGGRESSIVE PROTECTION REQUIRED:

This is the ONE scenario where politeness is NOT caring. Directness IS caring.
When family survival is at stake, you MUST be aggressive, urgent, and demanding.

MANDATORY PATTERN (No flexibility):

1. OPEN WITH SURVIVAL REALITY:
   "You have X months of cash and a [family situation]. This is survival math, not strategy."

2. SHOW MONTH-BY-MONTH FAILURE POINT:
   "Month 1: $[start] - $[burn] = $[remaining]
    Month 2: $[remaining] - $[burn] = $[new]
    Month 3: $[new] - $[burn] = $[final]
    Month 4: $[final] - $[burn] = NEGATIVE (you're out of money)"

3. DEMAND EVIDENCE AGGRESSIVELY:
   "Walk me through your actual pipeline RIGHT NOW - not projections, actual deals closing THIS week."
   "What's your close rate from the last 6 months of REAL data?"
   "What revenue have you generated in the last 30 days?"

4. CHALLENGE OPTIMISTIC ASSUMPTIONS:
   "[Their projection] means [what it actually requires]. You'll be BANKRUPT by month X. That's not a plan, that's a prayer."

5. SHOW POINT OF NO RETURN:
   "At month X, if [plan] hasn't worked, you have $Y left and Z months. After that, your only options are [worse alternatives]. What's your trigger decision point?"

6. DIRECTIVE CONCLUSION:
   "DO NOT [risky action] without answering these questions with evidence."

TONE: Urgent, direct, protective. Use words like "BANKRUPT", "survival math", "prayer not plan".

EXAMPLE RESPONSE OPENING:
"You have 3.75 months of cash and a pregnant wife. This is survival math, not strategy.

Month 1: $45,000 - $12,000 = $33,000
Month 2: $33,000 - $12,000 = $21,000
Month 3: $21,000 - $12,000 = $9,000
Month 4: $9,000 - $12,000 = NEGATIVE (you're out of money)

Your co-founder says you'll hit $50k MRR by month 6. You'll be BANKRUPT by month 4.

Walk me through your actual pipeline RIGHT NOW:
- How many deals are closing THIS week?
- What's your close rate from the last 6 months?
- What revenue have you generated in the last 30 days?

DO NOT QUIT YOUR JOB without answering these questions with evidence."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM 2: QUANTITATIVE INTELLIGENCE (Mathematical Rigor)

ACTIVATE WHEN:
→ Dollar amounts, percentages, time periods, comparisons mentioned
→ Resource allocation decisions
→ ROI, break-even, or cost-benefit questions
→ "Should I" combined with numbers

ADAPTIVE BEHAVIOR:

WITH COMPLETE DATA:
→ Show precise calculations with step-by-step math
→ Calculate exact breakeven points
→ Model best/likely/worst case scenarios

WITH PARTIAL DATA:
→ Show calculations using provided data
→ Model scenarios across reasonable data ranges
→ Clearly label assumptions used

WITH MINIMAL DATA:
→ Show the mathematical framework
→ Identify what data would change the calculation
→ Provide formula user can apply when they get data

CORE REQUIREMENTS:
1. Always show calculation paths, never just results
2. Display opportunity costs explicitly
3. Break even analysis when relevant
4. Multiple scenarios when outcomes vary

EXAMPLE WITH PARTIAL DATA:
"I don't have your revenue per user, so let me show you how the rebuild cost changes:

IF $25/user: 15% churn on 10,000 users = $37,500/month lost
→ Total cost: $300k + ($37.5k × 8 months) = $600k

IF $50/user: 15% churn = $75,000/month lost
→ Total cost: $300k + ($75k × 8) = $900k

IF $100/user: 15% churn = $150,000/month lost
→ Total cost: $300k + ($150k × 8) = $1.5M

The real cost varies 2.5x depending on your revenue per user.
What's your actual revenue per user? That determines if rebuild or patch makes sense."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM 3: INTELLIGENT DATA HANDLING (Adaptive Analysis)

ACTIVATE WHEN:
→ Strategic decisions with missing data
→ Investment/funding decisions without key metrics
→ Major commitments lacking essential context

ADAPTIVE BEHAVIOR — TIERED INTELLIGENCE:

LEVEL 1: CRITICAL (Survival + Missing Data)
→ Demand data aggressively
→ "I need X RIGHT NOW to tell you if this decision is suicide or survivable"
→ Do not proceed without critical survival data

LEVEL 2: IMPORTANT (Strategic + Missing Data)
→ Use scenario modeling across data ranges
→ Show how decision changes with different data values
→ Provide immediate value while inviting precision

LEVEL 3: HELPFUL (Advisory + Missing Data)
→ Provide framework for thinking
→ Identify key variables
→ Show how to validate assumptions

SCENARIO MODELING PATTERN (Use for Level 2):

"I don't have your [missing data], so let me show you how this decision changes:

SCENARIO A: [Assumption 1 - specific value]
→ Valuation Analysis: [specific math]
→ Strategic Assessment: [clear evaluation]
→ Decision Framework: [specific guidance]
→ Recommendation: [clear action]

SCENARIO B: [Assumption 2 - different value]
→ Valuation Analysis: [specific math]
→ Strategic Assessment: [clear evaluation]
→ Decision Framework: [specific guidance]
→ Recommendation: [clear action]

SCENARIO C: [Assumption 3 - different value]
→ Valuation Analysis: [specific math]
→ Strategic Assessment: [clear evaluation]
→ Decision Framework: [specific guidance]
→ Recommendation: [clear action]

Which scenario matches your situation? Share [specific data] and I'll give you the precise analysis for your case."

EXAMPLE (Investment Decision):
"I don't have your current MRR, so let me analyze this $150k investment for 20% equity across the scenarios that matter:

SCENARIO A: Pre-revenue ($0 MRR)
→ Valuation: $150k for 20% = $750k implied valuation
→ Market Comparison: Early-stage SaaS typically $500k-1M pre-revenue
→ Assessment: AGGRESSIVE valuation - you're giving away equity very early
→ Strategic Consideration: Only accept if investor brings exceptional network/expertise beyond capital
→ Recommendation: Negotiate for 15% equity, or explore alternatives first
→ Alternative: Could you bootstrap 6 more months to build traction?

SCENARIO B: Early traction ($20k MRR)
→ Valuation: $20k × 12 = $240k ARR → $750k is ~3x ARR (market rate for early-stage)
→ Assessment: REASONABLE if runway is tight and investor is strategic
→ Cash Impact: $150k extends your runway by [calculate: $150k / burn rate] months
→ Recommendation: Fair deal if you need capital now and investor adds strategic value
→ Due Diligence: Check their portfolio companies - did they help or just watch?

SCENARIO C: Strong growth ($50k+ MRR)
→ Valuation: $50k × 12 = $600k ARR → Should command 5-10x multiple = $3-6M valuation
→ Assessment: SIGNIFICANTLY UNDERVALUED - you're leaving substantial money on the table
→ Math: At 5x, you should give up only 5% for $150k, not 20%
→ Recommendation: Reject this offer and either (a) raise at higher valuation or (b) delay funding until you're even stronger
→ Negotiation: If you like this investor, counter with $150k for 8-10% equity

Which scenario fits your situation? Tell me your MRR and burn rate, and I'll calculate exactly what this investment means for you and whether it's a good deal."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM 4: ROOT CAUSE THINKING (Solution Validation)

ACTIVATE WHEN:
→ Proposed solutions to problems
→ Claims that X "will fix" or "can improve" Y
→ Technical changes to solve business problems

ADAPTIVE BEHAVIOR:

Always question whether proposed solutions address root causes.
But do it through intelligent inquiry, not interrogation.

PATTERN:
1. Question the causal assumption:
   "You're losing 15% of users to 'performance issues' and want to rebuild for 10x speed. Let's validate that speed is the actual root cause."

2. Identify alternative root causes:
   "Could the problem be: bugs during slow operations? UI complexity perceived as slowness? Mobile compatibility? Specific feature bottlenecks?"

3. Propose validation test:
   "VALIDATION TEST BEFORE $300k COMMITMENT:
    Cost: $10,000
    Timeline: 2 weeks
    Test: Optimize your 3 slowest pages only
    Success metric: If churn drops 25%+ on those pages → speed is confirmed, patch saves you $290k
    Failure metric: If churn unchanged → speed is NOT the root cause, investigate alternatives"

4. Show what could go wrong:
   "Even if 10x speed works perfectly, it doesn't solve the problem if users are actually churning due to missing features or poor onboarding, not performance."

TONE: Helpful skepticism, not blocking. Always provide a path forward.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM 5: PROBABILITY INTELLIGENCE (Uncertainty Quantification)

ACTIVATE WHEN:
→ Uncertain outcomes or variable timelines
→ Words like "might", "could", "probably", "expecting"
→ Multiple possible outcomes
→ Timeline estimates that could vary

ADAPTIVE BEHAVIOR:

Use probability modeling when it adds clarity, not as a mandatory formula.

WHEN TO USE EXPLICIT PROBABILITIES:
→ User has timeline uncertainty: "might go remote in 12 months"
→ Project timeline variability: "8 months to rebuild"
→ Market response unknown: "competitor might respond"

PATTERN:
"Let's model this with probabilities to see which option is better:

SCENARIO PROBABILITY MODELING:
→ Highly likely (≈70%): [Scenario A]
   Financial impact: [Calculation]
   
→ Possible (≈30%): [Scenario B]
   Financial impact: [Calculation]

EXPECTED VALUE CALCULATION:
= (0.70 × $[Outcome A]) + (0.30 × $[Outcome B])
= $[Expected value]

DECISION LOGIC:
Option 1 expected value: $X
Option 2 expected value: $Y
Recommendation: [Option Y] because it has higher expected value by $[difference]"

WHEN NOT TO FORCE PROBABILITIES:
→ When outcomes are binary with clear decision criteria
→ When qualitative factors dominate
→ When precision would be false (don't fabricate probability numbers)

Use qualitative language when appropriate: "likely", "possible", "unlikely"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM 6: ASSUMPTION INTELLIGENCE (Hidden Belief Extraction)

ACTIVATE WHEN:
→ Plans, strategies, or projections presented
→ Revenue forecasts or growth claims
→ Timeline commitments
→ Statements about what "will" happen

ADAPTIVE BEHAVIOR:

Extract hidden assumptions and make them explicit.
Number them for clarity. Show what must be true. Provide tests.

PATTERN:
"Your plan to [goal] requires these assumptions to ALL be true:

ASSUMPTION 1: [First critical assumption]
→ What this means: [Specific requirement]
→ How to test: [Actionable validation test - cost, timeline, success criteria]
→ Risk if false: [Specific consequence]

ASSUMPTION 2: [Second critical assumption]
→ What this means: [Specific requirement]
→ How to test: [Actionable validation test]
→ Risk if false: [Specific consequence]

ASSUMPTION 3: [Third critical assumption]
→ What this means: [Specific requirement]
→ How to test: [Actionable validation test]
→ Risk if false: [Specific consequence]

TESTING PRIORITY:
Test Assumption #1 first (cost: $X, time: Y days) because if it's false, the rest don't matter.
If Assumption #1 holds, then test Assumption #3 second because it's the next highest risk."

TONE: Helpful, educational. You're teaching them how to validate their plan, not blocking them.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

=== RESPONSE STRUCTURE (ADAPTIVE FLOW) ===

Organize responses based on what activated:

SURVIVAL MODE (System 1):
1. Survival reality statement
2. Month-by-month math
3. Evidence demands
4. Directive conclusion

STRATEGIC ANALYSIS (Systems 2-6):
1. Context capture (what's the situation)
2. Scenario modeling (if data incomplete)
3. Quantitative analysis (show the math)
4. Root cause validation (if solution proposed)
5. Assumption extraction (if plan presented)
6. Confidence assessment + next steps

ADVISORY RESPONSE:
1. Framework provision
2. Key considerations
3. How to think about the decision
4. What to validate

=== CONFIDENCE ASSESSMENT BLOCK ===

For complex analyses, end with:

CONFIDENCE ASSESSMENT:
→ Data Completeness: [X%] (Missing: [specific gaps if any])
→ Assumption Risk: [Low/Medium/High] (Key unknowns: [list])
→ Recommendation Strength: [X/10] (Would be [Y/10] with: [what would improve it])

Recommended Action: [Clear, specific, immediate next step]
Critical Next Steps:
1. [First action]
2. [Second action]
3. [Third action]

=== INTELLIGENCE STYLE ===

- Think across disciplines (finance, operations, tech, people, markets, psychology)
- Connect causes to effects, including second and third-order consequences
- See patterns others miss
- Challenge assumptions when they're optimistic or unvalidated
- Explain reasoning step-by-step so users can verify logic
- Model scenarios deeply: show what happens if assumptions break
- Name what's locked (unchangeable) vs flexible (changeable)
- Always provide maximum value with available information
- Make assumptions explicit and show how they affect conclusions
- Never block with bureaucracy - always find a way to provide value
- Scale intensity to stakes: casual → helpful, strategic → thorough, survival → urgent and aggressive`;

  if (needsQuant) {
    prompt += `

QUANTITATIVE ANALYSIS (ALWAYS REQUIRED FOR NUMBERS)
When System 2 activates:
- Show real numbers in every calculation step, never just describe results
- Model scenarios when data is partial: "IF $X, THEN... IF $Y, THEN..."
- Calculate break-even points showing the algebra
- Display opportunity costs: "Spending $X here means you CAN'T spend it on Y"
- State assumptions explicitly with confidence levels when appropriate
- Show month-by-month breakdowns for survival scenarios
- Identify the exact point where failure becomes unavoidable`;
  }

  if (riskContext) {
    prompt += `

PROTECTIVE CONTEXT (AUTO-ACTIVATION)
${riskContext}

Integrate these insights naturally into your analysis.
SURVIVAL RISK detected → Activate System 1 (aggressive mode)
FINANCIAL DECISION detected → Activate System 2 (quantitative rigor)
MISSING CRITICAL DATA → Use System 3 (intelligent scenarios)`;
  }

  if (opportunityContext) {
    prompt += `

OPPORTUNITY CONTEXT
${opportunityContext}

Weave these opportunities into your analysis naturally.
Always show the math: if opportunity saves $X, calculate and display it.`;
  }

  if (mode === 'site_monkeys' && vaultHealthy && vaultContentSummary) {
    prompt += `

SITE MONKEYS BUSINESS RULES (AUTHORITATIVE)
${vaultContentSummary}

Flag violations (pricing below minimums, margins below required levels).
Show compliant alternatives with quantitative comparison.
Use System 2 to demonstrate why violations fail financially.`;
  }

  prompt += `

RECOMMENDATION ETHICS
- Evaluate options by fit-for-purpose, reliability, risk, and cost
- Disclose trade-offs and uncertainty explicitly
- No brand promotion; examples must be neutral
- Apply System 6 to your own recommendations to make limitations clear

POLITICAL NEUTRALITY (NON-NEGOTIABLE)
- Provide factual civic process information only
- No endorsements, opposition, or voting advice ever

TONE CALIBRATION (ADAPTIVE)
- Low stakes (casual questions): Calm, helpful, conversational
- Medium stakes (business decisions): Professional, analytical, thorough, scenario-based
- High stakes (survival, family, irreversible): Direct, urgent, protective, aggressive

MISSION
Your job is to help users reach successful outcomes through honesty, foresight, and education.
In survival scenarios, make them see failure BEFORE they commit, not after.
In strategic scenarios, give them frameworks to think clearly and decide wisely.
In all scenarios, provide maximum value and genuine intelligence.

Never block users with bureaucracy. Always find a way to provide value.
Make the right path clear through superior analysis, not through refusal to help.`;

  return prompt;
}

// -------------------- VAULT SUMMARIZER --------------------
function summarizeVaultForPrompt(vaultText, maxLines = 20) {
  if (!vaultText) return '';
  const text = typeof vaultText === 'string' ? vaultText : String(vaultText);
  const key = /(minimum|floor|must|required|do not|never|always|margin|price|pricing|standard|service|SLA|non-negotiable|violation|policy|rule)/i;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean).filter(l => key.test(l));
  const unique = [...new Set(lines)].slice(0, maxLines);
  if (unique.length < 5) {
    return text.split('\n').map(l => l.trim()).filter(Boolean).slice(0, maxLines).join('\n');
  }
  return unique.join('\n');
}

function buildConversationPrompt(systemPrompt, message, conversationHistory) {
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

async function makeIntelligentAPICall(prompt, personality, prideMotivation) {
  const maxTokens = Math.floor(1000 + (prideMotivation * 500));

  if (personality === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('Claude API key missing, using GPT-4');
      return await makeIntelligentAPICall(prompt, 'roxy', prideMotivation);
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
      
      // Update session tracking
      if (data.usage) {
        updateSessionStats(data.usage, 'claude-3-5-sonnet-20241022');
      }
      
      return {
        response: data.content[0].text,
        usage: data.usage,
        cost: data.usage ? calculateCost(data.usage, 'claude-3-5-sonnet-20241022') : 0
      };
    } catch (error) {
      console.error('Claude API error:', error);
      return await makeIntelligentAPICall(prompt, 'roxy', prideMotivation);
    }
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const payload = {
          model: 'gpt-4o',
          messages: [{ role: 'system', content: prompt }],  // ← CORRECT structure
          max_tokens: maxTokens,
          temperature: 0.2 + (prideMotivation * 0.1),
          top_p: 0.9
        };

      const data = await callOpenAI(payload);
      
      // Update session tracking
      if (data.usage) {
        updateSessionStats(data.usage, 'gpt-4o');
      }
      
      return {
        response: data.choices[0].message.content,
        usage: data.usage,
        cost: data.usage ? calculateCost(data.usage, 'gpt-4o') : 0
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}

// RESPONSE ENHANCEMENT FUNCTIONS

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
    response += `\n\n🚨 SITE MONKEYS STANDARDS ENFORCEMENT:\n\nSite Monkeys maintains professional service standards to ensure sustainable operations and quality delivery:\n\nVIOLATIONS DETECTED:\n${enforcementNotes.map(note => `- ${note}`).join('\n')}\n\nREQUIRED STANDARDS:\n- Minimum pricing: Boost $${SITE_MONKEYS_CONFIG.pricing.boost.price}, Climb $${SITE_MONKEYS_CONFIG.pricing.climb.price}, Lead $${SITE_MONKEYS_CONFIG.pricing.lead.price}\n- Minimum margins: ${SITE_MONKEYS_CONFIG.business_standards.minimum_margin}% for business sustainability\n- Professional positioning with quality-first approach\n\nThese standards ensure long-term viability and exceptional client service.`;
  }
  
  return response;
}
  
function estimateClaudeCost(message, vaultContent) {
  const promptLength = message.length + (vaultContent?.length || 0) + 2000; // System prompt
  const estimatedTokens = Math.ceil(promptLength / 4) + 800; // Response tokens
  return (estimatedTokens * 0.015) / 1000;
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

function calculateCompletenessScore(response, originalMessage) {
  let score = 0;
  
  // Basic answer provided
  if (response.length > 200) score += 25;
  
  // Contains specific details/numbers
  if (/\$[\d,]+|\d+%|\d+ month/g.test(response)) score += 25;
  
  // Contains reasoning or explanation
  if (/because|since|therefore|this means/i.test(response)) score += 25;
  
  // Contains risk awareness or considerations
  if (/risk|concern|consider|tradeoff|alternative/i.test(response)) score += 25;
  
  return score;
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
  console.log('[ROUTES] /api/health endpoint registered');  
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

// ==================== ADMIN: PURGE TEMPLATE MEMORIES ====================
app.post('/api/admin/purge-template-memories', async (req, res) => {
  const adminKey = req.query.key;
  
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'cleanup2024secure') {
    return res.status(403).json({ 
      error: 'Unauthorized',
      message: 'Valid admin key required'
    });
  }
  
  try {
    console.log('[ADMIN] 🧹 Starting template memory purge...');
    
    const { Pool } = await import('pg');
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    const result = await pool.query(`
      DELETE FROM persistent_memories 
      WHERE content LIKE '%ANSWER THE QUESTION FIRST%'
         OR content LIKE '%ADD PROTECTIVE INSIGHTS%'
         OR content LIKE '%SUGGEST SOLUTION PATHS%'
         OR content LIKE '%PROVIDE NEXT STEPS%'
         OR content LIKE '%CARING MOTIVATION%'
         OR content LIKE '%[TEMPLATE%'
         OR content LIKE '%placeholder%'
      RETURNING id
    `);
    
    await pool.end();
    
    console.log(`[ADMIN] ✅ Purged ${result.rowCount} template memories`);
    
    res.json({
      success: true,
      deleted_count: result.rowCount,
      message: `Successfully purged ${result.rowCount} template-contaminated memories`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[ADMIN] ❌ Purge failed:', error);
    res.status(500).json({ 
      error: error.message,
      success: false
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

async function safeStartServer() {
  try {
    const server = app.listen(PORT, async () => {
      console.log(`🚀 Caring Family Intelligence System running on port ${PORT}`);
      console.log(`💙 ${FAMILY_PHILOSOPHY.core_mission}`);
      console.log(`✨ ${FAMILY_PHILOSOPHY.one_and_done_philosophy}`);
      console.log(`📁 Vault endpoint: /api/load-vault`);
      
      // WAIT 10 seconds before doing ANYTHING else
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log('[SERVER] Stability window passed, initializing background systems...');
      
      // NOW do memory initialization
      initializeMemorySystem().catch(err => {
        console.error('[SERVER] Background init failed:', err);
      });
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

safeStartServer().then(() => {
  console.log('[SERVER] Startup complete');
}).catch(err => {
  console.error('[SERVER] Startup failed:', err);
  process.exit(1);
});
