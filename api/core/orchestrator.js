// /api/core/orchestrator.js
// ORCHESTRATOR - Central Request Coordinator
// Executes all chat requests in correct priority order
// Truth > Memory > Analysis > AI > Personality > Validation > Fallback (last resort)

import { PersistentMemory } from '../../memory_system/core.js';
import { RoutingIntelligence } from '../../memory_system/intelligence.js';
import { trackApiCall } from '../lib/tokenTracker.js';
import { getVaultStatus, generateVaultContext } from '../lib/vault.js';
import { extractedDocuments } from '../lib/upload-for-analysis.js';
import { generateEliResponse, generateRoxyResponse } from '../lib/personalities.js';
import { MODES, validateModeCompliance, calculateConfidenceScore } from '../config/modes.js';
import { EMERGENCY_FALLBACKS } from '../lib/site-monkeys/emergency-fallbacks.js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ==================== ORCHESTRATOR CLASS ====================

export class Orchestrator {
  constructor() {
    // Core dependencies
    this.memory = new PersistentMemory();
    this.intelligence = new RoutingIntelligence();
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    // Performance tracking
    this.requestStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbackUsed: 0,
      avgProcessingTime: 0,
      totalCost: 0
    };
    
    // Logging
    this.log = (message) => console.log(`[ORCHESTRATOR] ${message}`);
    this.error = (message, error) => console.error(`[ORCHESTRATOR ERROR] ${message}`, error);
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
      this.log(`[CONTEXT] Total: ${context.totalTokens} tokens`);
      
      // STEP 5: Perform semantic analysis
      const analysis = await this.#performSemanticAnalysis(message, context, conversationHistory);
      this.log(`[ANALYSIS] Intent: ${analysis.intent}, Domain: ${analysis.domain}, Complexity: ${analysis.complexity.toFixed(2)}`);
      
      // STEP 6: Calculate confidence
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
      
      // STEP 8: Apply personality reasoning framework
      const personalityResponse = await this.#applyPersonality(
        aiResponse.response, 
        analysis, 
        mode,
        context
      );
      this.log(`[PERSONALITY] Applied: ${personalityResponse.personality}`);
      
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
      
      // STEP 11: Return complete response
      return {
        success: true,
        response: validatedResponse.response,
        metadata: {
          memoryUsed: memoryContext.hasMemory,
          memoryTokens: memoryContext.tokens,
          documentTokens: documentData?.tokens || 0,
          vaultTokens: vaultData?.tokens || 0,
          totalContextTokens: context.totalTokens,
          model: aiResponse.model,
          confidence: confidence,
          personalityApplied: personalityResponse.personality,
          modeEnforced: mode,
          processingTime: processingTime,
          cost: aiResponse.cost,
          fallbackUsed: false,
          analysis: {
            intent: analysis.intent,
            domain: analysis.domain,
            complexity: analysis.complexity,
            emotionalTone: analysis.emotionalTone
          },
          validation: {
            compliant: validatedResponse.compliant,
            issues: validatedResponse.issues,
            adjustments: validatedResponse.adjustments
          }
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
      // Use RoutingIntelligence to analyze query and determine relevant categories
      const routingResult = await this.intelligence.routeQuery(message);
      
      // Retrieve memories from database (limited to 2,500 tokens)
      const memories = await this.memory.retrieveMemory(
        userId, 
        message, 
        2500 // Token limit
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
      
      // Format memory content
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
      // Check if documents exist in session
      if (!extractedDocuments[sessionId] || extractedDocuments[sessionId].length === 0) {
        return null;
      }
      
      // Get most recent document
      const docs = extractedDocuments[sessionId];
      const latestDoc = docs[docs.length - 1];
      
      // Calculate tokens
      const tokens = Math.ceil(latestDoc.content.length / 4);
      
      // Enforce 10,000 token limit per session
      if (tokens > 10000) {
        const truncated = latestDoc.content.substring(0, 40000); // ~10k tokens
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
      // ONLY load if mode is site_monkeys
      // Strict isolation: vault never accessible in other modes
      
      const vaultStatus = getVaultStatus(sessionId);
      
      if (!vaultStatus.loaded || !vaultStatus.healthy) {
        this.log('[VAULT] Not loaded or unhealthy');
        return null;
      }
      
      const vaultContent = generateVaultContext(sessionId);
      const tokens = Math.ceil(vaultContent.length / 4);
      
      // Set expiration (1 hour from now)
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

  // ==================== STEP 4: PERFORM SEMANTIC ANALYSIS ====================
  
  async #performSemanticAnalysis(message, context, conversationHistory) {
    try {
      // Use RoutingIntelligence for advanced semantic analysis
      const semanticResult = await this.intelligence.performAdvancedSemanticAnalysis(message);
      
      // Determine domain based on content and context
      const domain = this.#determineDomain(message, context);
      
      // Calculate complexity
      const complexity = this.#calculateComplexity(message, semanticResult, context);
      
      // Determine if requires expertise
      const requiresExpertise = complexity > 0.7 || 
        semanticResult.intent === 'problem_solving' ||
        domain === 'business' || 
        domain === 'technical';
      
      // Check if requires calculation
      const requiresCalculation = /\d+/.test(message) && 
        (/calculate|compute|what is|how much|total|sum|average/i.test(message));
      
      // Assess context dependency
      const contextDependency = context.sources.hasMemory || 
        context.sources.hasDocuments || 
        context.sources.hasVault ? 0.8 : 0.3;
      
      return {
        intent: semanticResult.intent || 'question',
        domain: domain,
        complexity: complexity,
        emotionalTone: semanticResult.emotionalTone || 'neutral',
        requiresExpertise: requiresExpertise,
        requiresCalculation: requiresCalculation,
        contextDependency: contextDependency,
        reasoning: `Intent: ${semanticResult.intent}, Emotional weight: ${semanticResult.emotionalWeight}, Personal context: ${semanticResult.personalContext}`,
        semanticDetails: semanticResult
      };
      
    } catch (error) {
      this.error('[ANALYSIS] Semantic analysis failed, using defaults', error);
      
      // Fallback analysis
      return {
        intent: 'question',
        domain: 'general',
        complexity: 0.5,
        emotionalTone: 'neutral',
        requiresExpertise: false,
        requiresCalculation: false,
        contextDependency: 0.5,
        reasoning: 'Fallback analysis due to error'
      };
    }
  }

  // ==================== STEP 5: CALCULATE CONFIDENCE ====================
  
  async #calculateConfidence(analysis, context) {
    try {
      let confidence = 0.85; // Base confidence
      
      // Adjust based on analysis complexity
      if (analysis.complexity > 0.8) {
        confidence -= 0.15; // Complex queries need validation
      } else if (analysis.complexity < 0.3) {
        confidence += 0.05; // Simple queries are straightforward
      }
      
      // Adjust based on available context
      if (context.sources.hasMemory) {
        confidence += 0.05; // Memory provides relevant context
      }
      if (context.sources.hasDocuments) {
        confidence += 0.03; // Documents provide specific info
      }
      if (context.sources.hasVault) {
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
      
      // Ensure confidence stays within bounds
      confidence = Math.max(0.0, Math.min(1.0, confidence));
      
      return confidence;
      
    } catch (error) {
      this.error('[CONFIDENCE] Calculation failed, using default', error);
      return 0.75; // Conservative default
    }
  }

  // ==================== STEP 6: ROUTE TO AI ====================
  
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

  // ==================== STEP 7: APPLY PERSONALITY ====================
  
  async #applyPersonality(response, analysis, mode, context) {
    try {
      // Determine which personality to use
      const useEli = analysis.domain === 'business' || 
        analysis.domain === 'technical' ||
        mode === 'business_validation' ||
        mode === 'site_monkeys';
      
      const personality = useEli ? 'eli' : 'roxy';
      
      this.log(`[PERSONALITY] Selecting ${personality} based on domain: ${analysis.domain}`);
      
      // Personalities enhance/adjust response, don't rewrite it
      // They apply their reasoning framework to the existing response
      
      // For now, return response with personality marker
      // In full implementation, this would call personality reasoning functions
      const enhancedResponse = useEli 
        ? `🍌 **Eli:** ${response}`
        : `🍌 **Roxy:** ${response}`;
      
      return {
        response: enhancedResponse,
        personality: personality
      };
      
    } catch (error) {
      this.error('[PERSONALITY] Application failed, using original response', error);
      return {
        response: response,
        personality: 'none'
      };
    }
  }

  // ==================== STEP 8: VALIDATE COMPLIANCE ====================
  
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

  // ==================== STEP 9: EMERGENCY FALLBACK ====================
  
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
      
      // Absolute last resort
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

  #buildContextString(context, mode) {
    let contextStr = '';
    
    if (context.sources.hasMemory && context.memory) {
      contextStr += `\n\n**Relevant Information from Past Conversations:**\n${context.memory}\n`;
    }
    
    if (context.sources.hasDocuments && context.documents) {
      contextStr += `\n\n**Uploaded Document Context:**\n${context.documents}\n`;
    }
    
    if (context.sources.hasVault && context.vault && mode === 'site_monkeys') {
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

  #calculateComplexity(message, semanticResult, context) {
    let complexity = 0.5; // Base
    
    // Length factor
    const wordCount = message.split(/\s+/).length;
    if (wordCount > 50) complexity += 0.15;
    else if (wordCount > 100) complexity += 0.25;
    
    // Semantic factors
    if (semanticResult.emotionalWeight > 0.5) complexity += 0.1;
    if (semanticResult.urgencyLevel > 0.5) complexity += 0.1;
    
    // Context factors
    if (context.sources.hasMemory) complexity += 0.05;
    if (context.sources.hasDocuments) complexity += 0.1;
    
    // Question complexity
    if (message.includes('?')) {
      const questionCount = (message.match(/\?/g) || []).length;
      if (questionCount > 2) complexity += 0.1;
    }
    
    return Math.min(1.0, complexity);
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
