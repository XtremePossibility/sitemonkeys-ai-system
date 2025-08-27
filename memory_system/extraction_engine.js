// memory_system/extraction_engine.js
// PRODUCTION-OPTIMIZED VERSION: Performance + Safety + Features
// Addresses: performance, memory usage, logic consistency, runtime safety

import DatabaseManager from './database_manager.js';
import RoutingIntelligence from './routing_intelligence.js';

class ExtractionEngine {
  constructor() {
    this.dbManager = new DatabaseManager();
    this.routingIntelligence = new RoutingIntelligence();
    
    // Optimized analytics with memory management
    this.extractionStats = {
      totalExtractions: 0,
      avgConfidence: 0,
      categoryDistribution: new Map(), // Use Map for better performance
      tokenStats: { min: Infinity, max: 0, sum: 0 },
      lastReset: Date.now()
    };

    // Cached stop words for performance
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'can', 'must', 'this', 'that', 'these', 'those'
    ]);

    // Performance caches
    this.wordCache = new Map(); // Cache processed words
    this.similarityCache = new Map(); // Cache similarity calculations
    this.maxCacheSize = 1000; // Prevent memory leaks
    
    // Emotional word sets for performance
    this.emotionalWordSets = {
      positive: new Set(['happy', 'excited', 'love', 'enjoy', 'great', 'amazing', 'wonderful', 'proud', 'success']),
      negative: new Set(['sad', 'angry', 'frustrated', 'hate', 'terrible', 'awful', 'worried', 'anxious', 'problem']),
      neutral: new Set(['think', 'consider', 'maybe', 'perhaps', 'possibly', 'could', 'might'])
    };
  }

  /**
   * MAIN EXTRACTION - Optimized with proper error boundaries
   */
  async extractRelevantMemories(userId, query, tokenLimit = 2400, options = {}) {
    // Input validation
    if (!userId || typeof userId !== 'string') {
      throw new Error('[EXTRACTION] Invalid userId provided');
    }
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('[EXTRACTION] Invalid query provided');
    }
    if (tokenLimit < 100 || tokenLimit > 10000) {
      console.warn(`[EXTRACTION] Token limit ${tokenLimit} outside recommended range (100-10000)`);
    }

    const startTime = Date.now();
    console.log(`[EXTRACTION] Starting extraction for query: "${this.truncateString(query, 50)}"`);
    
    try {
      // Route query with error handling
      const routing = await this.safeRouteQuery(query, options.context);
      const primaryCategory = this.extractPrimaryCategory(routing);
      
      let memories;
      
      if (!primaryCategory) {
        console.warn('[EXTRACTION] No primary category found, using cross-category search');
        memories = await this.searchAcrossAllCategories(userId, query, tokenLimit, options);
      } else {
        console.log(`[EXTRACTION] Primary category: ${primaryCategory}, confidence: ${routing?.confidence || 'unknown'}`);
        memories = await this.extractFromPrimaryAndRelated(userId, query, primaryCategory, tokenLimit, routing, options);
      }

      // Update analytics safely
      this.updateExtractionStatsAsync(memories, routing, tokenLimit);

      const duration = Date.now() - startTime;
      const totalTokens = memories.reduce((sum, m) => sum + (m.tokenCount || 0), 0);
      console.log(`[EXTRACTION] Completed in ${duration}ms: ${memories.length} memories, ${totalTokens} tokens`);

      return memories;

    } catch (error) {
      console.error('[EXTRACTION] Critical error in extraction:', error);
      // Return empty array rather than throwing to maintain system stability
      return [];
    }
  }

  /**
   * SAFE ROUTING with fallback handling
   */
  async safeRouteQuery(query, context) {
    try {
      const routing = await this.routingIntelligence.routeToCategory(query, context);
      
      // Handle various possible return formats
      if (!routing) return null;
      if (typeof routing === 'string') return { primaryCategory: routing, confidence: 0.5 };
      if (routing.category) return { primaryCategory: routing.category, confidence: routing.confidence || 0.5 };
      if (routing.primaryCategory) return routing;
      
      return null;
    } catch (error) {
      console.warn('[EXTRACTION] Routing failed:', error.message);
      return null;
    }
  }

  /**
   * EXTRACT PRIMARY CATEGORY safely
   */
  extractPrimaryCategory(routing) {
    if (!routing || typeof routing !== 'object') return null;
    return routing.primaryCategory || routing.category || null;
  }

  /**
   * EXTRACT FROM PRIMARY AND RELATED categories
   */
  async extractFromPrimaryAndRelated(userId, query, primaryCategory, tokenLimit, routing, options) {
    // Get primary memories
    const primaryTokenBudget = Math.ceil(tokenLimit * 0.7);
    const primaryMemories = await this.safeGetMemories(
      userId, primaryCategory, query, 
      Math.ceil(tokenLimit / 100), 
      primaryTokenBudget
    );

    // Score primary memories
    const scoredPrimary = this.scoreMemories(primaryMemories, query, {
      isPrimaryCategory: true,
      categoryConfidence: routing?.confidence || 0.5
    });

    // Calculate remaining budget
    const usedTokens = this.calculateTokenUsage(scoredPrimary);
    const remainingTokens = tokenLimit - usedTokens;
    
    let additionalMemories = [];
    
    // Get related memories if budget allows
    if (remainingTokens > 200 && scoredPrimary.length < 10) {
      const relatedCategories = this.getRelatedCategories(primaryCategory);
      additionalMemories = await this.getRelatedMemories(
        userId, relatedCategories, query, remainingTokens, options
      );
    }

    // Combine, sort, and filter
    const allMemories = [...scoredPrimary, ...additionalMemories];
    const sortedMemories = allMemories.sort((a, b) => b.score - a.score);
    
    return this.applyTokenLimit(sortedMemories, tokenLimit);
  }

  /**
   * OPTIMIZED SCORING SYSTEM - Balanced performance and accuracy
   */
  scoreMemories(memories, query, options = {}) {
    if (!Array.isArray(memories) || memories.length === 0) return [];
    
    const queryProcessed = this.processTextForScoring(query);
    
    return memories.map(memory => {
      if (!memory || typeof memory.content !== 'string') {
        console.warn('[EXTRACTION] Invalid memory object, skipping');
        return { ...memory, score: 0 };
      }

      let score = 0;
      const memoryProcessed = this.processTextForScoring(memory.content);
      
      // Core similarity (50% weight)
      score += this.calculateSimilarity(memoryProcessed, queryProcessed) * 0.5;
      
      // Recency boost (20% weight)
      score += this.calculateRecencyScore(memory.createdAt) * 0.2;
      
      // Context relevance (15% weight)
      score += this.calculateContextRelevance(memory, query, options) * 0.15;
      
      // Usage and priority (15% weight)
      score += this.calculateUsageScore(memory) * 0.15;

      // Normalize score to 0-1 range
      const normalizedScore = Math.max(0, Math.min(score, 1));
      
      return {
        ...memory,
        score: normalizedScore
      };
    });
  }

  /**
   * OPTIMIZED TEXT PROCESSING with caching
   */
  processTextForScoring(text) {
    if (typeof text !== 'string') return { words: [], length: 0 };
    
    const cacheKey = text.substring(0, 100); // Cache key for performance
    
    if (this.wordCache.has(cacheKey)) {
      return this.wordCache.get(cacheKey);
    }

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));

    const processed = {
      words: words,
      length: words.length,
      text: text.toLowerCase()
    };

    // Prevent cache overflow
    if (this.wordCache.size >= this.maxCacheSize) {
      const firstKey = this.wordCache.keys().next().value;
      this.wordCache.delete(firstKey);
    }
    
    this.wordCache.set(cacheKey, processed);
    return processed;
  }

  /**
   * EFFICIENT SIMILARITY CALCULATION
   */
  calculateSimilarity(memoryProcessed, queryProcessed) {
    if (!memoryProcessed.words.length || !queryProcessed.words.length) return 0;

    // Fast set intersection
    const memorySet = new Set(memoryProcessed.words);
    const querySet = new Set(queryProcessed.words);
    
    let intersection = 0;
    for (const word of querySet) {
      if (memorySet.has(word)) intersection++;
    }
    
    // Jaccard similarity with substring bonus
    const union = new Set([...memoryProcessed.words, ...queryProcessed.words]);
    const jaccard = intersection / union.size;
    
    // Substring match bonus for high-relevance queries
    const substringBonus = queryProcessed.text.length > 10 && 
      memoryProcessed.text.includes(queryProcessed.text.substring(0, 20)) ? 0.3 : 0;
    
    return Math.min(jaccard + substringBonus, 1);
  }

  /**
   * EFFICIENT RECENCY SCORING
   */
  calculateRecencyScore(createdAt) {
    if (!createdAt) return 0;
    
    try {
      const now = Date.now();
      const memoryTime = new Date(createdAt).getTime();
      
      if (isNaN(memoryTime)) return 0;
      
      const ageInDays = (now - memoryTime) / (1000 * 60 * 60 * 24);
      
      // Optimized decay curve
      if (ageInDays < 1) return 1.0;
      if (ageInDays < 7) return 0.8;
      if (ageInDays < 30) return 0.5;
      if (ageInDays < 90) return 0.2;
      return 0.1;
      
    } catch (error) {
      console.warn('[EXTRACTION] Error calculating recency for:', createdAt);
      return 0;
    }
  }

  /**
   * CONTEXT RELEVANCE SCORING
   */
  calculateContextRelevance(memory, query, options) {
    let relevance = 0;

    // Question-answer matching
    const isQueryQuestion = this.isQuestion(query);
    const memoryHasAnswer = this.hasAnswerPattern(memory.content);
    if (isQueryQuestion && memoryHasAnswer) relevance += 0.4;

    // Emotional context matching
    const queryEmotion = this.getEmotionalTone(query);
    const memoryEmotion = this.getEmotionalTone(memory.content);
    if (queryEmotion === memoryEmotion && queryEmotion !== 'neutral') relevance += 0.3;

    // Category boost
    if (options.isPrimaryCategory && options.categoryConfidence > 0.7) relevance += 0.3;

    return Math.min(relevance, 1);
  }

  /**
   * USAGE AND PRIORITY SCORING
   */
  calculateUsageScore(memory) {
    let score = 0;
    
    // Usage frequency with diminishing returns
    const usageCount = memory.usageCount || 0;
    score += Math.min(usageCount * 0.1, 0.5);
    
    // Priority boost
    if (memory.priority === 'high') score += 0.3;
    else if (memory.priority === 'medium') score += 0.15;
    
    // User-marked importance
    if (memory.userMarked === true) score += 0.2;
    
    return Math.min(score, 1);
  }

  /**
   * OPTIMIZED UTILITY METHODS
   */
  isQuestion(text) {
    if (typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase().trim();
    
    return lowerText.includes('?') ||
           lowerText.match(/^(what|how|when|where|why|who|which|do you|can you|could you|would you)/);
  }

  hasAnswerPattern(text) {
    if (typeof text !== 'string') return false;
    
    const patterns = ['answer is', 'you can', 'you should', 'recommend', 'suggest', 'try this'];
    const lowerText = text.toLowerCase();
    
    return patterns.some(pattern => lowerText.includes(pattern));
  }

  getEmotionalTone(text) {
    if (typeof text !== 'string') return 'neutral';
    
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of words) {
      if (this.emotionalWordSets.positive.has(word)) positiveCount++;
      else if (this.emotionalWordSets.negative.has(word)) negativeCount++;
    }
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * SAFE DATABASE OPERATIONS
   */
  async safeGetMemories(userId, category, query, maxMemories, tokenBudget) {
    try {
      const memories = await this.dbManager.getRelevantMemories(
        userId, category, query, maxMemories, tokenBudget
      );
      return Array.isArray(memories) ? memories : [];
    } catch (error) {
      console.error(`[EXTRACTION] Error getting memories from ${category}:`, error);
      return [];
    }
  }

  /**
   * CROSS-CATEGORY SEARCH - Optimized
   */
  async searchAcrossAllCategories(userId, query, tokenLimit, options) {
    const categories = ['relationships_social', 'business_career', 'home_lifestyle', 'personal_development'];
    const memoriesPerCategory = Math.ceil(tokenLimit / (categories.length * 150));
    
    const promises = categories.map(category => 
      this.safeGetMemories(userId, category, query, memoriesPerCategory, Math.ceil(tokenLimit / categories.length))
    );
    
    try {
      const results = await Promise.all(promises);
      const allMemories = results.flat();
      
      const scoredMemories = this.scoreMemories(allMemories, query, {
        isPrimaryCategory: false,
        categoryConfidence: 0.3
      });
      
      const sortedMemories = scoredMemories.sort((a, b) => b.score - a.score);
      return this.applyTokenLimit(sortedMemories, tokenLimit);
      
    } catch (error) {
      console.error('[EXTRACTION] Error in cross-category search:', error);
      return [];
    }
  }

  /**
   * GET RELATED MEMORIES - Optimized
   */
  async getRelatedMemories(userId, relatedCategories, query, tokenBudget, options) {
    const limitedCategories = relatedCategories.slice(0, 3); // Limit for performance
    const tokensPerCategory = Math.floor(tokenBudget / limitedCategories.length);
    
    const promises = limitedCategories.map(category =>
      this.safeGetMemories(userId, category, query, 5, tokensPerCategory)
    );
    
    try {
      const results = await Promise.all(promises);
      const allMemories = results.flat();
      
      return this.scoreMemories(allMemories, query, {
        isPrimaryCategory: false,
        categoryConfidence: 0.2
      });
      
    } catch (error) {
      console.warn('[EXTRACTION] Error getting related memories:', error);
      return [];
    }
  }

  /**
   * INTELLIGENT TOKEN LIMIT APPLICATION
   */
  applyTokenLimit(memories, tokenLimit) {
    const result = [];
    let totalTokens = 0;
    const highValueThreshold = 0.8;
    
    // First pass: add memories within budget
    for (const memory of memories) {
      const tokenCount = memory.tokenCount || 0;
      
      if (totalTokens + tokenCount <= tokenLimit) {
        result.push(memory);
        totalTokens += tokenCount;
      } else if (memory.score > highValueThreshold && totalTokens < tokenLimit * 0.9) {
        // Try to fit high-value content with intelligent truncation
        const availableTokens = tokenLimit - totalTokens;
        if (availableTokens > 50) {
          const truncated = this.intelligentTruncate(memory, availableTokens);
          result.push(truncated);
          break; // Stop here as we've used remaining budget
        }
      }
    }
    
    return result;
  }

  /**
   * INTELLIGENT TRUNCATION
   */
  intelligentTruncate(memory, tokenBudget) {
    const charBudget = tokenBudget * 4; // Approximate chars per token
    const content = memory.content || '';
    
    if (content.length <= charBudget) return memory;
    
    // Try to cut at sentence boundaries
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    let result = '';
    
    for (const sentence of sentences) {
      if (result.length + sentence.length <= charBudget) {
        result += sentence;
      } else {
        break;
      }
    }
    
    // Fallback to character truncation with ellipsis
    if (!result && charBudget > 10) {
      result = content.substring(0, charBudget - 3) + '...';
    }
    
    return {
      ...memory,
      content: result || content.substring(0, Math.max(charBudget, 10)),
      tokenCount: tokenBudget,
      truncated: true
    };
  }

  /**
   * UTILITY METHODS
   */
  calculateTokenUsage(memories) {
    return memories.reduce((sum, memory) => sum + (memory.tokenCount || 0), 0);
  }

  truncateString(str, length) {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  getRelatedCategories(primaryCategory) {
    const relations = {
      'health_wellness': ['personal_development', 'home_lifestyle'],
      'relationships_social': ['personal_development', 'home_lifestyle'], 
      'business_career': ['financial_management', 'personal_development'],
      'financial_management': ['business_career', 'home_lifestyle'],
      'personal_development': ['health_wellness', 'business_career'],
      'home_lifestyle': ['health_wellness', 'financial_management'],
      'technology_tools': ['business_career', 'personal_development']
    };
    
    return relations[primaryCategory] || [];
  }

  /**
   * ASYNC ANALYTICS UPDATE - Non-blocking
   */
  updateExtractionStatsAsync(memories, routing, tokenLimit) {
    // Use setTimeout to make this non-blocking
    setTimeout(() => {
      try {
        this.extractionStats.totalExtractions++;
        
        if (routing?.confidence) {
          const count = this.extractionStats.totalExtractions;
          const currentAvg = this.extractionStats.avgConfidence;
          this.extractionStats.avgConfidence = ((currentAvg * (count - 1)) + routing.confidence) / count;
        }
        
        if (routing?.primaryCategory) {
          const category = routing.primaryCategory;
          const current = this.extractionStats.categoryDistribution.get(category) || 0;
          this.extractionStats.categoryDistribution.set(category, current + 1);
        }
        
        const totalTokens = this.calculateTokenUsage(memories);
        this.extractionStats.tokenStats.min = Math.min(this.extractionStats.tokenStats.min, totalTokens);
        this.extractionStats.tokenStats.max = Math.max(this.extractionStats.tokenStats.max, totalTokens);
        this.extractionStats.tokenStats.sum += totalTokens;
        
      } catch (error) {
        console.warn('[EXTRACTION] Error updating stats:', error);
      }
    }, 0);
  }

  /**
   * GET ANALYTICS - Safe with computed values
   */
  getExtractionStats() {
    const uptime = Date.now() - this.extractionStats.lastReset;
    const avgTokens = this.extractionStats.totalExtractions > 0 
      ? this.extractionStats.tokenStats.sum / this.extractionStats.totalExtractions 
      : 0;
    
    return {
      totalExtractions: this.extractionStats.totalExtractions,
      avgConfidence: this.extractionStats.avgConfidence,
      categoryDistribution: Object.fromEntries(this.extractionStats.categoryDistribution),
      tokenStats: {
        min: this.extractionStats.tokenStats.min === Infinity ? 0 : this.extractionStats.tokenStats.min,
        max: this.extractionStats.tokenStats.max,
        avg: Math.round(avgTokens)
      },
      uptime: uptime,
      extractionsPerMinute: uptime > 0 ? (this.extractionStats.totalExtractions / (uptime / 60000)) : 0,
      cacheStats: {
        wordCacheSize: this.wordCache.size,
        similarityCacheSize: this.similarityCache.size
      }
    };
  }

  /**
   * CLEANUP METHOD - Prevent memory leaks
   */
  cleanup() {
    this.wordCache.clear();
    this.similarityCache.clear();
    console.log('[EXTRACTION] Caches cleared for memory management');
  }
}

export default ExtractionEngine;
