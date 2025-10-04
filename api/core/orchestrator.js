// /api/core/orchestrator.js
// ORCHESTRATOR - Central Request Coordinator
// Executes all chat requests in correct priority order
// Truth > Memory > Analysis > AI > Personality > Validation > Fallback (last resort)

import { PersistentMemory } from '../../memory_system/core.js';
import { RoutingIntelligence } from '../../memory_system/intelligence.js'; // KEEP for backward compatibility
import { SemanticAnalyzer } from '../core/intelligence/semantic_analyzer.js'; // NEW
import { EliFramework } from '../core/personalities/eli_framework.js'; // NEW
import { RoxyFramework } from '../core/personalities/roxy_framework.js'; // NEW
import { PersonalitySelector } from '../core/personalities/personality_selector.js'; // NEW
import { trackApiCall } from '../lib/tokenTracker.js';
import { getVaultStatus, generateVaultContext } from '../lib/vault.js';
import { extractedDocuments } from '../../upload-for-analysis.js';
import { MODES, validateModeCompliance, calculateConfidenceScore } from '../config/modes.js';
import { EMERGENCY_FALLBACKS } from '../lib/site-monkeys/emergency-fallbacks.js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ==================== ORCHESTRATOR CLASS ====================

export class Orchestrator {
  constructor() {
    // Core dependencies
    this.memory = new PersistentMemory();
    this.intelligence = new RoutingIntelligence(); // KEEP for fallback during transition
    this.semanticAnalyzer = new SemanticAnalyzer(); // NEW
    this.eliFramework = new EliFramework(); // NEW
    this.roxyFramework = new RoxyFramework(); // NEW
    this.personalitySelector = new PersonalitySelector(); // NEW
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    // Initialization flag
    this.initialized = false; // NEW - tracks if semantic analyzer is ready
    
    // Performance tracking
    this.requestStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbackUsed: 0,
      avgProcessingTime: 0,
      totalCost: 0,
      semanticAnalysisCost: 0, // NEW - track semantic analysis costs separately
      semanticAnalysisTime: 0, // NEW - track semantic analysis time
      personalityEnhancements: 0 // NEW - count personality enhancements applied
    };
    
    // Logging
    this.log = (message) => console.log(`[ORCHESTRATOR] ${message}`);
    this.error = (message, error) => console.error(`[ORCHESTRATOR ERROR] ${message}`, error);
  }

  // NEW METHOD - Initialize semantic analyzer (must be called before processing requests)
  async initialize() {
    try {
      this.log('[INIT] Initializing SemanticAnalyzer...');
      await this.semanticAnalyzer.initialize();
      this.initialized = true;
      this.log('[INIT] SemanticAnalyzer initialization complete');
      return true;
    } catch (error) {
      this.error('[INIT] SemanticAnalyzer initialization failed - system will use fallback analysis', error);
      this.initialized = false;
      // DON'T throw - allow system to continue with fallback
      return false;
    }
  }

  // ==================== MAIN ENTRY POINT ====================
  
  async processRequest(requestData) {
    const startTime = Date.now();
    const { 
      message, 
      userId, 
      mode = 'truth_general', 
      sessionId, 
      documentContext = null, 
      vaultEnabled = false,
      conversationHistory = []
    } = requestData;
    
    try {
      this.log(`[START] User: ${userId}, Mode: ${mode}`);
      
      // STEP 1: Retrieve memory context (up to 2,500 tokens)
      const memoryContext = await this.#retrieveMemoryContext(userId, message);
      this.log(`[MEMORY] Retrieved ${memoryContext.tokens} tokens from ${memoryContext.count} memories`);
      
      // STEP 2: Load document context (if provided)
      const documentData = documentContext 
        ? await this.#loadDocumentContext(documentContext, sessionId)
        : null;
      if (documentData) {
        this.log(`[DOCUMENTS] Loaded ${documentData.tokens} tokens from ${documentData.filename}`);
      }
      
      // STEP 3: Load vault (if Site Monkeys mode and enabled)
      const vaultData = (mode === 'site_monkeys' && vaultEnabled)
        ? await this.#loadVaultContext(userId, sessionId)
        : null;
      if (vaultData) {
        this.log(`[VAULT] Loaded ${vaultData.tokens} tokens`);
      }
      
      // STEP 4: Assemble complete context
      const context = this.#assembleContext(memoryContext, documentData, vaultData);
      context.userId = userId; // NEW - add userId to context for semantic analysis
      this.log(`[CONTEXT] Total: ${context.totalTokens} tokens`);
      
      // STEP 5: Perform semantic analysis - UPDATED
      const analysisStartTime = Date.now(); // NEW
      const analysis = await this.#performSemanticAnalysis(message, context, conversationHistory);
      const analysisTime = Date.now() - analysisStartTime; // NEW
      this.requestStats.semanticAnalysisTime += analysisTime; // NEW
      this.log(`[ANALYSIS] Intent: ${analysis.intent} (${analysis.intentConfidence?.toFixed(2) || 'N/A'}), Domain: ${analysis.domain} (${analysis.domainConfidence?.toFixed(2) || 'N/A'}), Complexity: ${analysis.complexity.toFixed(2)}, Time: ${analysisTime}ms`);
      
      // STEP 6: Calculate confidence - UPDATED
      const confidence = await this.#calculateConfidence(analysis, context);
      this.log(`[CONFIDENCE] Score: ${confidence.toFixed(3)}`);
      
      // STEP 7: Route to appropriate AI
      const aiResponse = await this.#routeToAI(
        message, 
        context, 
        analysis, 
        confidence, 
        mode,
        conversationHistory
      );
      this.log(`[AI] Model: ${aiResponse.model}, Cost: $${aiResponse.cost.totalCost.toFixed(4)}`);
      
      // STEP 8: Apply personality reasoning framework - UPDATED
      const personalityStartTime = Date.now(); // NEW
      const personalityResponse = await this.#applyPersonality(
        aiResponse.response, 
        analysis, 
        mode,
        context
      );
      const personalityTime = Date.now() - personalityStartTime; // NEW
      this.log(`[PERSONALITY] Applied: ${personalityResponse.personality}, Enhancements: ${personalityResponse.modificationsCount || 0}, Time: ${personalityTime}ms`);
      if (personalityResponse.modificationsCount > 0) {
        this.requestStats.personalityEnhancements++; // NEW
      }
      
      // STEP 9: Validate compliance (truth-first, mode enforcement)
      const validatedResponse = await this.#validateCompliance(
        personalityResponse.response,
        mode,
        analysis,
        confidence
      );
      this.log(`[VALIDATION] Compliant: ${validatedResponse.compliant ? 'PASS' : 'FAIL'}`);
      
      // STEP 10: Track performance
      const processingTime = Date.now() - startTime;
      this.#trackPerformance(startTime, true, false);
      this.log(`[COMPLETE] Processing time: ${processingTime}ms`);
      
      // STEP 11: Return complete response - UPDATED with new metadata
      return {
        success: true,
        response: validatedResponse.response,
        metadata: {
          // Context tracking
          memoryUsed: memoryContext.hasMemory,
          memoryTokens: memoryContext.tokens,
          documentTokens: documentData?.tokens || 0,
          vaultTokens: vaultData?.tokens || 0,
          totalContextTokens: context.totalTokens,
          
          // AI model tracking
          model: aiResponse.model,
          confidence: confidence,
          
          // Personality tracking - ENHANCED
          personalityApplied: personalityResponse.personality,
          personalityEnhancements: personalityResponse.modificationsCount || 0, // NEW
          personalityReasoningApplied: personalityResponse.reasoningApplied || false, // NEW
          
          // Mode enforcement
          modeEnforced: mode,
          
          // Performance tracking - ENHANCED
          processingTime: processingTime,
          semanticAnalysisTime: analysis.processingTime || 0, // NEW
          
          // Cost tracking - ENHANCED
          cost: aiResponse.cost,
          semanticAnalysisCost: analysis.cost || 0, // NEW
          totalCostIncludingAnalysis: (aiResponse.cost?.totalCost || 0) + (analysis.cost || 0), // NEW
          
          // Fallback tracking
          fallbackUsed: false,
          semanticFallbackUsed: analysis.fallbackUsed || false, // NEW
          
          // Analysis details - ENHANCED
          analysis: {
            intent: analysis.intent,
            intentConfidence: analysis.intentConfidence, // NEW
            domain: analysis.domain,
            domainConfidence: analysis.domainConfidence, // NEW
            complexity: analysis.complexity,
            complexityFactors: analysis.complexityFactors, // NEW
            emotionalTone: analysis.emotionalTone,
            emotionalWeight: analysis.emotionalWeight, // NEW
            cacheHit: analysis.cacheHit // NEW
          },
          
          // Validation
          validation: {
            compliant: validatedResponse.compliant,
            issues: validatedResponse.issues,
            adjustments: validatedResponse.adjustments
          },
          
          // Personality analysis details - NEW
          personalityAnalysis: personalityResponse.analysisApplied || {}
        },
        error: null
      };
      
    } catch (error) {
      // EMERGENCY FALLBACK - Last Resort Only
      this.error(`Request failed: ${error.message}`, error);
      this.#trackPerformance(startTime, false, true);
      
      return await this.#handleEmergencyFallback(error, requestData);
    }
  }

  // ==================== STEP 1: RETRIEVE MEMORY CONTEXT ====================
  
  async #retrieveMemoryContext(userId, message) {
    try {
      const routingResult = await this.intelligence.routeQuery(message);
      
      const memories = await this.memory.retrieveMemory(
        userId, 
        message, 
        2500
      );
      
      if (!memories || !memories.success) {
        this.log('[MEMORY] No memories found or retrieval failed');
        return {
          memories: '',
          tokens: 0,
          count: 0,
          categories: [],
          hasMemory: false
        };
      }
      
      const memoryContent = memories.memories || '';
      const tokenCount = Math.ceil(memoryContent.length / 4);
      
      return {
        memories: memoryContent,
        tokens: tokenCount,
        count: memories.count || 0,
        categories: routingResult.primaryCategory ? [routingResult.primaryCategory] : [],
        hasMemory: tokenCount > 0
      };
      
    } catch (error) {
      this.error('[MEMORY] Retrieval failed, continuing without memory', error);
      return {
        memories: '',
        tokens: 0,
        count: 0,
        categories: [],
        hasMemory: false
      };
    }
  }

  // ==================== STEP 2: LOAD DOCUMENT CONTEXT ====================
  
  async #loadDocumentContext(documentContext, sessionId) {
    try {
      if (!extractedDocuments[sessionId] || extractedDocuments[sessionId].length === 0) {
        return null;
      }
      
      const docs = extractedDocuments[sessionId];
      const latestDoc = docs[docs.length - 1];
      
      const tokens = Math.ceil(latestDoc.content.length / 4);
      
      if (tokens > 10000) {
        const truncated = latestDoc.content.substring(0, 40000);
        this.log(`[DOCUMENTS] Truncated from ${tokens} to ~10000 tokens`);
        
        return {
          content: truncated,
          tokens: 10000,
          filename: latestDoc.filename,
          processed: true,
          truncated: true
        };
      }
      
      return {
        content: latestDoc.content,
        tokens: tokens,
        filename: latestDoc.filename,
        processed: true,
        truncated: false
      };
      
    } catch (error) {
      this.error('[DOCUMENTS] Loading failed, continuing without documents', error);
      return null;
    }
  }

  // ==================== STEP 3: LOAD VAULT CONTEXT ====================
  
  async #loadVaultContext(userId, sessionId) {
    try {
      const vaultStatus = getVaultStatus(sessionId);
      
      if (!vaultStatus.loaded || !vaultStatus.healthy) {
        this.log('[VAULT] Not loaded or unhealthy');
        return null;
      }
      
      const vaultContent = generateVaultContext(sessionId);
      const tokens = Math.ceil(vaultContent.length / 4);
      
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      
      return {
        content: vaultContent,
        tokens: tokens,
        loaded: true,
        expires: expiresAt
      };
      
    } catch (error) {
      this.error('[VAULT] Loading failed, continuing without vault', error);
      return null;
    }
  }

  // /api/core/orchestrator.js
// ORCHESTRATOR - Central Request Coordinator
// Executes all chat requests in correct priority order
// Truth > Memory > Analysis > AI > Personality > Validation > Fallback (last resort)

import { PersistentMemory } from '../../memory_system/core.js';
import { RoutingIntelligence } from '../../memory_system/intelligence.js'; // KEEP for backward compatibility
import { SemanticAnalyzer } from '../core/intelligence/semantic_analyzer.js'; // NEW
import { EliFramework } from '../core/personalities/eli_framework.js'; // NEW
import { RoxyFramework } from '../core/personalities/roxy_framework.js'; // NEW
import { PersonalitySelector } from '../core/personalities/personality_selector.js'; // NEW
import { trackApiCall } from '../lib/tokenTracker.js';
import { getVaultStatus, generateVaultContext } from '../lib/vault.js';
import { extractedDocuments } from '../../upload-for-analysis.js';
import { MODES, validateModeCompliance, calculateConfidenceScore } from '../config/modes.js';
import { EMERGENCY_FALLBACKS } from '../lib/site-monkeys/emergency-fallbacks.js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ==================== ORCHESTRATOR CLASS ====================

export class Orchestrator {
  constructor() {
    // Core dependencies
    this.memory = new PersistentMemory();
    this.intelligence = new RoutingIntelligence(); // KEEP for fallback during transition
    this.semanticAnalyzer = new SemanticAnalyzer(); // NEW
    this.eliFramework = new EliFramework(); // NEW
    this.roxyFramework = new RoxyFramework(); // NEW
    this.personalitySelector = new PersonalitySelector(); // NEW
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    // Initialization flag
    this.initialized = false; // NEW - tracks if semantic analyzer is ready
    
    // Performance tracking
    this.requestStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbackUsed: 0,
      avgProcessingTime: 0,
      totalCost: 0,
      semanticAnalysisCost: 0, // NEW - track semantic analysis costs separately
      semanticAnalysisTime: 0, // NEW - track semantic analysis time
      personalityEnhancements: 0 // NEW - count personality enhancements applied
    };
    
    // Logging
    this.log = (message) => console.log(`[ORCHESTRATOR] ${message}`);
    this.error = (message, error) => console.error(`[ORCHESTRATOR ERROR] ${message}`, error);
  }

  // NEW METHOD - Initialize semantic analyzer (must be called before processing requests)
  async initialize() {
    try {
      this.log('[INIT] Initializing SemanticAnalyzer...');
      await this.semanticAnalyzer.initialize();
      this.initialized = true;
      this.log('[INIT] SemanticAnalyzer initialization complete');
      return true;
    } catch (error) {
      this.error('[INIT] SemanticAnalyzer initialization failed - system will use fallback analysis', error);
      this.initialized = false;
      // DON'T throw - allow system to continue with fallback
      return false;
    }
  }

  // ==================== MAIN ENTRY POINT ====================
  
  async processRequest(requestData) {
    const startTime = Date.now();
    const { 
      message, 
      userId, 
      mode = 'truth_general', 
      sessionId, 
      documentContext = null, 
      vaultEnabled = false,
      conversationHistory = []
    } = requestData;
    
    try {
      this.log(`[START] User: ${userId}, Mode: ${mode}`);
      
      // STEP 1: Retrieve memory context (up to 2,500 tokens)
      const memoryContext = await this.#retrieveMemoryContext(userId, message);
      this.log(`[MEMORY] Retrieved ${memoryContext.tokens} tokens from ${memoryContext.count} memories`);
      
      // STEP 2: Load document context (if provided)
      const documentData = documentContext 
        ? await this.#loadDocumentContext(documentContext, sessionId)
        : null;
      if (documentData) {
        this.log(`[DOCUMENTS] Loaded ${documentData.tokens} tokens from ${documentData.filename}`);
      }
      
      // STEP 3: Load vault (if Site Monkeys mode and enabled)
      const vaultData = (mode === 'site_monkeys' && vaultEnabled)
        ? await this.#loadVaultContext(userId, sessionId)
        : null;
      if (vaultData) {
        this.log(`[VAULT] Loaded ${vaultData.tokens} tokens`);
      }
      
      // STEP 4: Assemble complete context
      const context = this.#assembleContext(memoryContext, documentData, vaultData);
      context.userId = userId; // NEW - add userId to context for semantic analysis
      this.log(`[CONTEXT] Total: ${context.totalTokens} tokens`);
      
      // STEP 5: Perform semantic analysis - UPDATED
      const analysisStartTime = Date.now(); // NEW
      const analysis = await this.#performSemanticAnalysis(message, context, conversationHistory);
      const analysisTime = Date.now() - analysisStartTime; // NEW
      this.requestStats.semanticAnalysisTime += analysisTime; // NEW
      this.log(`[ANALYSIS] Intent: ${analysis.intent} (${analysis.intentConfidence?.toFixed(2) || 'N/A'}), Domain: ${analysis.domain} (${analysis.domainConfidence?.toFixed(2) || 'N/A'}), Complexity: ${analysis.complexity.toFixed(2)}, Time: ${analysisTime}ms`);
      
      // STEP 6: Calculate confidence - UPDATED
      const confidence = await this.#calculateConfidence(analysis, context);
      this.log(`[CONFIDENCE] Score: ${confidence.toFixed(3)}`);
      
      // STEP 7: Route to appropriate AI
      const aiResponse = await this.#routeToAI(
        message, 
        context, 
        analysis, 
        confidence, 
        mode,
        conversationHistory
      );
      this.log(`[AI] Model: ${aiResponse.model}, Cost: $${aiResponse.cost.totalCost.toFixed(4)}`);
      
      // STEP 8: Apply personality reasoning framework - UPDATED
      const personalityStartTime = Date.now(); // NEW
      const personalityResponse = await this.#applyPersonality(
        aiResponse.response, 
        analysis, 
        mode,
        context
      );
      const personalityTime = Date.now() - personalityStartTime; // NEW
      this.log(`[PERSONALITY] Applied: ${personalityResponse.personality}, Enhancements: ${personalityResponse.modificationsCount || 0}, Time: ${personalityTime}ms`);
      if (personalityResponse.modificationsCount > 0) {
        this.requestStats.personalityEnhancements++; // NEW
      }
      
      // STEP 9: Validate compliance (truth-first, mode enforcement)
      const validatedResponse = await this.#validateCompliance(
        personalityResponse.response,
        mode,
        analysis,
        confidence
      );
      this.log(`[VALIDATION] Compliant: ${validatedResponse.compliant ? 'PASS' : 'FAIL'}`);
      
      // STEP 10: Track performance
      const processingTime = Date.now() - startTime;
      this.#trackPerformance(startTime, true, false);
      this.log(`[COMPLETE] Processing time: ${processingTime}ms`);
      
      // STEP 11: Return complete response - UPDATED with new metadata
      return {
        success: true,
        response: validatedResponse.response,
        metadata: {
          // Context tracking
          memoryUsed: memoryContext.hasMemory,
          memoryTokens: memoryContext.tokens,
          documentTokens: documentData?.tokens || 0,
          vaultTokens: vaultData?.tokens || 0,
          totalContextTokens: context.totalTokens,
          
          // AI model tracking
          model: aiResponse.model,
          confidence: confidence,
          
          // Personality tracking - ENHANCED
          personalityApplied: personalityResponse.personality,
          personalityEnhancements: personalityResponse.modificationsCount || 0, // NEW
          personalityReasoningApplied: personalityResponse.reasoningApplied || false, // NEW
          
          // Mode enforcement
          modeEnforced: mode,
          
          // Performance tracking - ENHANCED
          processingTime: processingTime,
          semanticAnalysisTime: analysis.processingTime || 0, // NEW
          
          // Cost tracking - ENHANCED
          cost: aiResponse.cost,
          semanticAnalysisCost: analysis.cost || 0, // NEW
          totalCostIncludingAnalysis: (aiResponse.cost?.totalCost || 0) + (analysis.cost || 0), // NEW
          
          // Fallback tracking
          fallbackUsed: false,
          semanticFallbackUsed: analysis.fallbackUsed || false, // NEW
          
          // Analysis details - ENHANCED
          analysis: {
            intent: analysis.intent,
            intentConfidence: analysis.intentConfidence, // NEW
            domain: analysis.domain,
            domainConfidence: analysis.domainConfidence, // NEW
            complexity: analysis.complexity,
            complexityFactors: analysis.complexityFactors, // NEW
            emotionalTone: analysis.emotionalTone,
            emotionalWeight: analysis.emotionalWeight, // NEW
            cacheHit: analysis.cacheHit // NEW
          },
          
          // Validation
          validation: {
            compliant: validatedResponse.compliant,
            issues: validatedResponse.issues,
            adjustments: validatedResponse.adjustments
          },
          
          // Personality analysis details - NEW
          personalityAnalysis: personalityResponse.analysisApplied || {}
        },
        error: null
      };
      
    } catch (error) {
      // EMERGENCY FALLBACK - Last Resort Only
      this.error(`Request failed: ${error.message}`, error);
      this.#trackPerformance(startTime, false, true);
      
      return await this.#handleEmergencyFallback(error, requestData);
    }
  }

  // ==================== STEP 1: RETRIEVE MEMORY CONTEXT ====================
  
  async #retrieveMemoryContext(userId, message) {
    try {
      const routingResult = await this.intelligence.routeQuery(message);
      
      const memories = await this.memory.retrieveMemory(
        userId, 
        message, 
        2500
      );
      
      if (!memories || !memories.success) {
        this.log('[MEMORY] No memories found or retrieval failed');
        return {
          memories: '',
          tokens: 0,
          count: 0,
          categories: [],
          hasMemory: false
        };
      }
      
      const memoryContent = memories.memories || '';
      const tokenCount = Math.ceil(memoryContent.length / 4);
      
      return {
        memories: memoryContent,
        tokens: tokenCount,
        count: memories.count || 0,
        categories: routingResult.primaryCategory ? [routingResult.primaryCategory] : [],
        hasMemory: tokenCount > 0
      };
      
    } catch (error) {
      this.error('[MEMORY] Retrieval failed, continuing without memory', error);
      return {
        memories: '',
        tokens: 0,
        count: 0,
        categories: [],
        hasMemory: false
      };
    }
  }

  // ==================== STEP 2: LOAD DOCUMENT CONTEXT ====================
  
  async #loadDocumentContext(documentContext, sessionId) {
    try {
      if (!extractedDocuments[sessionId] || extractedDocuments[sessionId].length === 0) {
        return null;
      }
      
      const docs = extractedDocuments[sessionId];
      const latestDoc = docs[docs.length - 1];
      
      const tokens = Math.ceil(latestDoc.content.length / 4);
      
      if (tokens > 10000) {
        const truncated = latestDoc.content.substring(0, 40000);
        this.log(`[DOCUMENTS] Truncated from ${tokens} to ~10000 tokens`);
        
        return {
          content: truncated,
          tokens: 10000,
          filename: latestDoc.filename,
          processed: true,
          truncated: true
        };
      }
      
      return {
        content: latestDoc.content,
        tokens: tokens,
        filename: latestDoc.filename,
        processed: true,
        truncated: false
      };
      
    } catch (error) {
      this.error('[DOCUMENTS] Loading failed, continuing without documents', error);
      return null;
    }
  }

  // ==================== STEP 3: LOAD VAULT CONTEXT ====================
  
  async #loadVaultContext(userId, sessionId) {
    try {
      const vaultStatus = getVaultStatus(sessionId);
      
      if (!vaultStatus.loaded || !vaultStatus.healthy) {
        this.log('[VAULT] Not loaded or unhealthy');
        return null;
      }
      
      const vaultContent = generateVaultContext(sessionId);
      const tokens = Math.ceil(vaultContent.length / 4);
      
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      
      return {
        content: vaultContent,
        tokens: tokens,
        loaded: true,
        expires: expiresAt
      };
      
    } catch (error) {
      this.error('[VAULT] Loading failed, continuing without vault', error);
      return null;
    }
  }

  // ==================== STEP 4: ASSEMBLE CONTEXT ====================
  
  #assembleContext(memory, documents, vault) {
    const memoryText = memory?.memories || '';
    const documentText = documents?.content || '';
    const vaultText = vault?.content || '';
    
    return {
      memory: memoryText,
      documents: documentText,
      vault: vaultText,
      totalTokens: (memory?.tokens || 0) + (documents?.tokens || 0) + (vault?.tokens || 0),
      sources: {
        hasMemory: memory?.hasMemory || false,
        hasDocuments: !!documents,
        hasVault: !!vault
      }
    };
  }

  // ==================== STEP 5: PERFORM SEMANTIC ANALYSIS - UPDATED ====================
  
  async #performSemanticAnalysis(message, context, conversationHistory) {
    try {
      // Check if semantic analyzer is initialized
      if (!this.initialized) {
        this.error('[ANALYSIS] SemanticAnalyzer not initialized, using fallback');
        return this.#generateFallbackAnalysis(message, context);
      }
      
      // Use SemanticAnalyzer for real embedding-based analysis
      const semanticResult = await this.semanticAnalyzer.analyzeSemantics(message, {
        userId: context.userId || 'unknown',
        conversationHistory: conversationHistory,
        availableMemory: context.sources?.hasMemory || false,
        documentContext: context.sources?.hasDocuments || false,
        vaultContext: context.sources?.hasVault || false
      });
      
      // Track semantic analysis cost
      if (semanticResult.cost) {
        this.requestStats.semanticAnalysisCost += semanticResult.cost;
      }
      
      // Semantic analyzer returns complete analysis - use directly
      return {
        // Core classification
        intent: semanticResult.intent,
        intentConfidence: semanticResult.intentConfidence,
        domain: semanticResult.domain,
        domainConfidence: semanticResult.domainConfidence,
        
        // Complexity
        complexity: semanticResult.complexity,
        complexityFactors: semanticResult.complexityFactors,
        
        // Emotional context
        emotionalTone: semanticResult.emotionalTone,
        emotionalWeight: semanticResult.emotionalWeight,
        
        // Context signals
        personalContext: semanticResult.personalContext,
        temporalContext: semanticResult.temporalContext,
        requiresMemory: semanticResult.requiresMemory,
        
        // Reasoning requirements
        requiresCalculation: semanticResult.requiresCalculation,
        requiresComparison: semanticResult.requiresComparison,
        requiresCreativity: semanticResult.requiresCreativity,
        requiresExpertise: semanticResult.complexityFactors?.expertiseRequired || false,
        
        // Context dependency (calculated based on available context)
        contextDependency: this.#calculateContextDependency(context, semanticResult),
        
        // Metadata
        reasoning: `Semantic analysis via embeddings: Intent=${semanticResult.intent} (${semanticResult.intentConfidence?.toFixed(2)}), Domain=${semanticResult.domain} (${semanticResult.domainConfidence?.toFixed(2)})`,
        semanticDetails: semanticResult,
        cacheHit: semanticResult.cacheHit,
        processingTime: semanticResult.processingTime,
        cost: semanticResult.cost,
        fallbackUsed: false
      };
      
    } catch (error) {
      this.error('[ANALYSIS] Semantic analysis failed, using fallback', error);
      
      // Fallback to basic heuristic analysis
      return this.#generateFallbackAnalysis(message, context);
    }
  }

  // NEW HELPER METHOD - Calculate context dependency
  #calculateContextDependency(context, semanticResult) {
    let dependency = 0.3; // Base
    
    if (context.sources?.hasMemory) dependency += 0.2;
    if (context.sources?.hasDocuments) dependency += 0.2;
    if (context.sources?.hasVault) dependency += 0.3;
    if (semanticResult.requiresMemory) dependency += 0.1;
    if (semanticResult.personalContext) dependency += 0.1;
    
    return Math.min(1.0, dependency);
  }

  // NEW HELPER METHOD - Fallback analysis when semantic analyzer fails
  #generateFallbackAnalysis(message, context) {
    this.log('[ANALYSIS] Using fallback heuristic analysis');
    
    const messageLower = message.toLowerCase();
    
    // Basic intent detection
    let intent = 'question';
    if (messageLower.includes('create') || messageLower.includes('build') || messageLower.includes('make')) {
      intent = 'command';
    } else if (messageLower.includes('should i') || messageLower.includes('which option')) {
      intent = 'decision_making';
    } else if (messageLower.includes('how do i') || messageLower.includes('solve')) {
      intent = 'problem_solving';
    }
    
    // Basic domain detection
    const domain = this.#determineDomain(message, context);
    
    // Basic complexity (word count and question count)
    const wordCount = message.split(/\s+/).length;
    const questionCount = (message.match(/\?/g) || []).length;
    const complexity = Math.min(1.0, (wordCount / 100) + (questionCount * 0.1));
    
    return {
      intent: intent,
      intentConfidence: 0.5,
      domain: domain,
      domainConfidence: 0.5,
      complexity: complexity,
      complexityFactors: {
        conceptualDepth: complexity,
        interdependencies: questionCount > 1 ? 0.5 : 0,
        ambiguity: 0,
        expertiseRequired: false
      },
      emotionalTone: 'neutral',
      emotionalWeight: 0,
      personalContext: /\b(my|I|me)\b/i.test(message),
      temporalContext: 'general',
      requiresMemory: false,
      requiresCalculation: /\d/.test(message),
      requiresComparison: /\b(vs|versus|compare)\b/i.test(message),
      requiresCreativity: false,
      requiresExpertise: false,
      contextDependency: 0.5,
      reasoning: 'Fallback heuristic analysis (semantic analyzer unavailable)',
      semanticDetails: null,
      cacheHit: false,
      processingTime: 0,
      cost: 0,
      fallbackUsed: true
    };
  }

  // KEEP FOR FALLBACK - Heuristic domain detection
  #determineDomain(message, context) {
    const msg = message.toLowerCase();
    
    if (/business|revenue|profit|customer|market|strategy|company/i.test(msg)) {
      return 'business';
    }
    if (/code|software|programming|technical|system|api|database/i.test(msg)) {
      return 'technical';
    }
    if (/feel|emotion|relationship|family|friend|personal/i.test(msg)) {
      return 'personal';
    }
    if (/health|medical|doctor|wellness|fitness/i.test(msg)) {
      return 'health';
    }
    
    return 'general';
  }

  // ==================== STEP 6: CALCULATE CONFIDENCE - UPDATED ====================
  
  async #calculateConfidence(analysis, context) {
    try {
      let confidence = 0.85; // Base confidence
      
      // Factor in semantic classification confidence
      if (analysis.intentConfidence !== undefined) {
        confidence *= (0.7 + (analysis.intentConfidence * 0.3)); // Weight intent confidence
      }
      
      if (analysis.domainConfidence !== undefined) {
        confidence *= (0.8 + (analysis.domainConfidence * 0.2)); // Weight domain confidence
      }
      
      // Adjust based on analysis complexity
      if (analysis.complexity > 0.8) {
        confidence -= 0.15; // Complex queries need validation
      } else if (analysis.complexity < 0.3) {
        confidence += 0.05; // Simple queries are straightforward
      }
      
      // Adjust based on available context
      if (context.sources?.hasMemory) {
        confidence += 0.05; // Memory provides relevant context
      }
      if (context.sources?.hasDocuments) {
        confidence += 0.03; // Documents provide specific info
      }
      if (context.sources?.hasVault) {
        confidence += 0.07; // Vault provides authoritative business context
      }
      
      // Adjust based on domain
      if (analysis.domain === 'business' || analysis.domain === 'technical') {
        confidence -= 0.10; // Critical domains require higher scrutiny
      }
      
      // Adjust based on intent
      if (analysis.intent === 'problem_solving' || analysis.intent === 'decision_making') {
        confidence -= 0.08; // Problem-solving needs careful analysis
      }
      
      // Penalty for fallback analysis
      if (analysis.fallbackUsed) {
        confidence -= 0.20; // Significant penalty for not using semantic analysis
        this.log('[CONFIDENCE] Reduced due to fallback analysis');
      }
      
      // Ensure confidence stays within bounds
      confidence = Math.max(0.0, Math.min(1.0, confidence));
      
      return confidence;
      
    } catch (error) {
      this.error('[CONFIDENCE] Calculation failed, using default', error);
      return 0.75; // Conservative default
    }
  }

  // ==================== STEP 7: ROUTE TO AI ====================
  
  async #routeToAI(message, context, analysis, confidence, mode, conversationHistory) {
    try {
      // Routing decision based on confidence threshold
      const useClaude = confidence < 0.85 || 
        analysis.requiresExpertise || 
        (mode === 'business_validation' && analysis.complexity > 0.7);
      
      const model = useClaude ? 'claude-sonnet-4.5' : 'gpt-4';
      
      this.log(`[AI ROUTING] Using ${model} (confidence: ${confidence.toFixed(3)})`);
      
      // Build context string
      const contextString = this.#buildContextString(context, mode);
      
      // Build conversation history
      const historyString = conversationHistory.length > 0
        ? '\n\nRecent conversation:\n' + conversationHistory.slice(-5).map(msg => 
            `${msg.role}: ${msg.content}`
          ).join('\n')
        : '';
      
      // Build system prompt based on mode
      const systemPrompt = this.#buildSystemPrompt(mode, analysis);
      
      // Build full prompt
      const fullPrompt = `${systemPrompt}\n\n${contextString}${historyString}\n\nUser query: ${message}`;
      
      let response, inputTokens, outputTokens;
      
      if (useClaude) {
        // Call Claude
        const claudeResponse = await this.anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: fullPrompt }]
        });
        
        response = claudeResponse.content[0].text;
        inputTokens = claudeResponse.usage.input_tokens;
        outputTokens = claudeResponse.usage.output_tokens;
        
      } else {
        // Call GPT-4
        const gptResponse = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${contextString}${historyString}\n\n${message}` }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });
        
        response = gptResponse.choices[0].message.content;
        inputTokens = gptResponse.usage.prompt_tokens;
        outputTokens = gptResponse.usage.completion_tokens;
      }
      
      // Calculate costs
      const cost = this.#calculateCost(model, inputTokens, outputTokens);
      
      // Track API call
      trackApiCall({
        sessionId: 'orchestrator',
        personality: model,
        promptTokens: inputTokens,
        completionTokens: outputTokens
      });
      
      return {
        response: response,
        model: model,
        cost: cost
      };
      
    } catch (error) {
      this.error('[AI] Routing failed', error);
      throw new Error(`AI routing failed: ${error.message}`);
    }
  }

  // ==================== STEP 8: APPLY PERSONALITY - UPDATED ====================
  
  async #applyPersonality(response, analysis, mode, context) {
    try {
      // Use PersonalitySelector to choose appropriate personality
      const selection = this.personalitySelector.selectPersonality(analysis, mode, context);
      
      this.log(`[PERSONALITY] Selected ${selection.personality} (confidence: ${selection.confidence.toFixed(2)}) - ${selection.reasoning}`);
      
      // Apply the selected personality framework
      let personalityResult;
      
      if (selection.personality === 'eli') {
        // Eli: Analytical, protective, risk-focused
        personalityResult = await this.eliFramework.analyzeAndEnhance(
          response,
          analysis,
          mode,
          context
        );
      } else {
        // Roxy: Empathetic, opportunity-focused, simplification-focused
        personalityResult = await this.roxyFramework.analyzeAndEnhance(
          response,
          analysis,
          mode,
          context
        );
      }
      
      // Log what the personality framework added
      if (personalityResult.reasoningApplied) {
        this.log(`[PERSONALITY] ${selection.personality.toUpperCase()} analysis applied:`);
        
        if (selection.personality === 'eli' && personalityResult.analysisApplied) {
          const applied = personalityResult.analysisApplied;
          if (applied.risksIdentified?.length > 0) {
            this.log(`  - Identified ${applied.risksIdentified.length} unmentioned risks`);
          }
          if (applied.assumptionsChallenged?.length > 0) {
            this.log(`  - Challenged ${applied.assumptionsChallenged.length} assumptions`);
          }
          if (applied.downsideScenarios?.length > 0) {
            this.log(`  - Modeled ${applied.downsideScenarios.length} downside scenarios`);
          }
          if (applied.blindSpotsFound?.length > 0) {
            this.log(`  - Found ${applied.blindSpotsFound.length} potential blind spots`);
          }
        }
        
        if (selection.personality === 'roxy' && personalityResult.analysisApplied) {
          const applied = personalityResult.analysisApplied;
          if (applied.opportunitiesIdentified?.length > 0) {
            this.log(`  - Identified ${applied.opportunitiesIdentified.length} opportunities`);
          }
          if (applied.simplificationsFound?.length > 0) {
            this.log(`  - Found ${applied.simplificationsFound.length} simpler approaches`);
          }
          if (applied.practicalSteps?.length > 0) {
            this.log(`  - Added ${applied.practicalSteps.length} practical next steps`);
          }
        }
      }
      
      return {
        response: personalityResult.enhancedResponse,
        personality: selection.personality,
        modificationsCount: personalityResult.modificationsCount || 0,
        analysisApplied: personalityResult.analysisApplied || {},
        reasoningApplied: personalityResult.reasoningApplied || false,
        selectionReasoning: selection.reasoning
      };
      
    } catch (error) {
      this.error('[PERSONALITY] Personality framework failed, using original response', error);
      
      // Fallback: Return original response with minimal personality marker
      return {
        response: `🍌 **Assistant:** ${response}`,
        personality: 'none',
        modificationsCount: 0,
        analysisApplied: {},
        reasoningApplied: false,
        error: error.message
      };
    }
  }

  // ==================== STEP 9: VALIDATE COMPLIANCE ====================
  
  async #validateCompliance(response, mode, analysis, confidence) {
    try {
      const issues = [];
      const adjustments = [];
      let adjustedResponse = response;
      
      // Truth-First Validation
      if (confidence < 0.7 && !response.includes('uncertain') && !response.includes("don't know")) {
        issues.push('Low confidence without uncertainty acknowledgment');
        adjustedResponse += '\n\n⚠️ **Confidence Note:** This analysis has moderate certainty based on available information.';
        adjustments.push('Added uncertainty acknowledgment');
      }
      
      // Mode-Specific Validation
      if (mode === 'business_validation') {
        const hasRiskAnalysis = /risk|downside|worst case|if this fails/i.test(response);
        const hasSurvivalImpact = /survival|runway|cash flow|burn rate/i.test(response);
        
        if (!hasRiskAnalysis) {
          issues.push('Missing risk analysis in business validation mode');
        }
        if (!hasSurvivalImpact) {
          issues.push('Missing survival impact in business validation mode');
        }
      }
      
      // Anti-Engagement Validation
      const hasEngagementBait = /would you like me to|should i|want me to|let me know if/i.test(response);
      if (hasEngagementBait) {
        issues.push('Contains engagement bait phrases');
        adjustments.push('Flagged engagement phrases for review');
      }
      
      // Completeness Check
      const isComplete = response.length > 100 && 
        !response.endsWith('?') &&
        !response.includes('to be continued');
      
      if (!isComplete) {
        issues.push('Response may be incomplete');
      }
      
      const compliant = issues.length === 0;
      
      return {
        response: adjustedResponse,
        compliant: compliant,
        issues: issues,
        adjustments: adjustments
      };
      
    } catch (error) {
      this.error('[VALIDATION] Compliance check failed, using original response', error);
      return {
        response: response,
        compliant: true,
        issues: [],
        adjustments: []
      };
    }
  }

  // ==================== EMERGENCY FALLBACK ====================
  
  async #handleEmergencyFallback(error, requestData) {
    try {
      this.log('[FALLBACK] Emergency fallback triggered');
      
      const fallbackResponse = EMERGENCY_FALLBACKS.system_failure || 
        "I encountered a technical issue processing your request. I want to be honest: rather than provide potentially incorrect information, I need to acknowledge this limitation. Could you try rephrasing your question or breaking it into smaller parts?";
      
      return {
        success: false,
        response: fallbackResponse,
        metadata: {
          memoryUsed: false,
          memoryTokens: 0,
          documentTokens: 0,
          vaultTokens: 0,
          totalContextTokens: 0,
          model: 'none',
          confidence: 0.0,
          personalityApplied: 'none',
          modeEnforced: requestData.mode || 'unknown',
          processingTime: 0,
          cost: {
            inputTokens: 0,
            outputTokens: 0,
            totalCost: 0
          },
          fallbackUsed: true
        },
        error: error.message
      };
      
    } catch (fallbackError) {
      this.error('[FALLBACK] Emergency fallback also failed', fallbackError);
      
      return {
        success: false,
        response: "I'm experiencing technical difficulties and cannot process your request at this time. Please try again in a few moments.",
        metadata: {
          fallbackUsed: true,
          error: `Double failure: ${error.message} | ${fallbackError.message}`
        },
        error: error.message
      };
    }
  }

  // ==================== UTILITY METHODS ====================
  
  #buildContextString(context, mode) {
    let contextStr = '';
    
    if (context.sources?.hasMemory && context.memory) {
      contextStr += `\n\n**Relevant Information from Past Conversations:**\n${context.memory}\n`;
    }
    
    if (context.sources?.hasDocuments && context.documents) {
      contextStr += `\n\n**Uploaded Document Context:**\n${context.documents}\n`;
    }
    
    if (context.sources?.hasVault && context.vault && mode === 'site_monkeys') {
      contextStr += `\n\n**Site Monkeys Business Vault:**\n${context.vault}\n`;
    }
    
    return contextStr;
  }

  #buildSystemPrompt(mode, analysis) {
    const modeConfig = MODES[mode];
    
    let prompt = `You are a truth-first AI assistant. Your priorities are: Truth > Helpfulness > Engagement.

Core Principles:
- Admit uncertainty openly when you don't know something
- Provide complete answers that respect the user's time
- Never use engagement bait phrases like "Would you like me to elaborate?"
- Challenge assumptions and surface risks
- Be honest about limitations

Mode: ${modeConfig?.display_name || mode}
`;

    if (mode === 'business_validation') {
      prompt += `\nBusiness Validation Requirements:
- Always analyze downside scenarios and risks
- Consider cash flow and survival impact
- Provide actionable recommendations with clear trade-offs
- Surface hidden costs and dependencies
`;
    }
    
    if (mode === 'site_monkeys') {
      prompt += `\nSite Monkeys Mode:
- Use vault content as authoritative business guidance
- Enforce founder protection principles
- Focus on operational integrity and quality
- Apply business-specific frameworks and constraints
`;
    }
    
    return prompt;
  }

  #calculateCost(model, inputTokens, outputTokens) {
    const rates = {
      'gpt-4': { input: 0.01, output: 0.03 },
      'claude-sonnet-4.5': { input: 0.003, output: 0.015 }
    };
    
    const rate = rates[model] || rates['gpt-4'];
    
    const inputCost = (inputTokens / 1000) * rate.input;
    const outputCost = (outputTokens / 1000) * rate.output;
    const totalCost = inputCost + outputCost;
    
    return {
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: inputCost,
      outputCost: outputCost,
      totalCost: totalCost
    };
  }

  #trackPerformance(startTime, success, fallbackUsed) {
    this.requestStats.totalRequests++;
    
    if (success) {
      this.requestStats.successfulRequests++;
    } else {
      this.requestStats.failedRequests++;
    }
    
    if (fallbackUsed) {
      this.requestStats.fallbackUsed++;
    }
    
    const processingTime = Date.now() - startTime;
    const count = this.requestStats.totalRequests;
    this.requestStats.avgProcessingTime = 
      ((this.requestStats.avgProcessingTime * (count - 1)) + processingTime) / count;
  }

  getStats() {
    return {
      ...this.requestStats,
      successRate: this.requestStats.successfulRequests / this.requestStats.totalRequests,
      fallbackRate: this.requestStats.fallbackUsed / this.requestStats.totalRequests,
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== EXPORT ====================

export default Orchestrator;
