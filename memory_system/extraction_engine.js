// memory_system/extraction_engine.js
// BULLETPROOF VERSION: Optimized for Railway PostgreSQL + Your Architecture
// Advanced semantic analysis with production-grade performance and safety

class ExtractionEngine {
  constructor() {
    // Performance-optimized caching for Railway environment
    this.extractionCache = new Map();
    this.semanticCache = new Map();
    this.maxCacheSize = 500; // Reduced for Railway memory limits
    
    // Analytics for monitoring in production
    this.extractionStats = {
      totalExtractions: 0,
      avgExtractionTime: 0,
      cacheHitRate: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastReset: Date.now()
    };

    // Advanced semantic patterns for your caring family system
    this.intentPatterns = {
      memory_recall: /\b(remember|recall|told you|mentioned|discussed|said before)\b/i,
      information_request: /\b(what|how|when|where|why|who|which|tell me|show me|explain)\b/i,
      personal_sharing: /\b(my |our |i have|i own|we have|we own|i am|we are)\b/i,
      problem_solving: /\b(problem|issue|trouble|difficulty|challenge|stuck|help|solve)\b/i,
      emotional_content: /\b(feel|feeling|felt|emotion|emotional|mood|happy|sad|angry|worried|excited|frustrated|anxious)\b/i
    };

    // Railway-optimized emotional analysis
    this.emotionalWeights = new Map([
      ['stress', 0.8], ['worried', 0.7], ['anxious', 0.7], ['frustrated', 0.6],
      ['happy', 0.6], ['excited', 0.6], ['proud', 0.5], ['sad', 0.7],
      ['angry', 0.8], ['confused', 0.4], ['determined', 0.5]
    ]);
  }

  /**
   * MAIN EXTRACTION - Bulletproof with Railway optimization
   */
  async extractRelevantMemories(userId, query, tokenLimit = 2400, options = {}) {
    const startTime = Date.now();
    
    // Input validation for production safety
    if (!userId || !query || typeof query !== 'string') {
      console.error('[EXTRACTION] Invalid input parameters');
      return [];
    }

    // Normalize inputs for consistency
    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = this.generateCacheKey(userId, normalizedQuery, tokenLimit);

    // Check cache for performance (Railway memory optimization)
    if (this.extractionCache.has(cacheKey)) {
      this.extractionStats.cacheHits++;
      return this.extractionCache.get(cacheKey);
    }

    this.extractionStats.cacheMisses++;

    try {
      console.log(`[EXTRACTION] Processing query for user: ${userId}`);

      // Advanced semantic analysis optimized for your system
      const semanticAnalysis = this.performAdvancedSemanticAnalysis(normalizedQuery);
      
      // Route to appropriate categories using routing intelligence
      const routing = options.routing || { primaryCategory: 'general', confidence: 0.5 };
      
      // Extract memories with sophisticated scoring
      const extractedMemories = await this.performAdvancedExtraction(
        userId, normalizedQuery, tokenLimit, semanticAnalysis, routing
      );

      // Apply final ranking and filtering
      const finalMemories = this.applyIntelligentRanking(extractedMemories, semanticAnalysis);

      // Update performance analytics
      this.updateExtractionAnalytics(finalMemories, Date.now() - startTime);

      // Cache results for performance (with size management)
      this.cacheExtractionResult(cacheKey, finalMemories);

      console.log(`[EXTRACTION] Extracted ${finalMemories.length} memories in ${Date.now() - startTime}ms`);
      
      return finalMemories;

    } catch (error) {
      console.error('[EXTRACTION] Critical error in extraction:', error);
      // Return empty array but log for monitoring
      return [];
    }
  }

  /**
   * ADVANCED SEMANTIC ANALYSIS - Tailored for your caring family system
   */
  performAdvancedSemanticAnalysis(query) {
    const analysis = {
      intent: 'general',
      emotionalWeight: 0,
      personalContext: false,
      memoryReference: false,
      urgencyLevel: 0,
      topicFocus: [],
      confidenceScore: 0.5
    };

    try {
      // Intent classification with your system's patterns
      for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
        if (pattern.test(query)) {
          analysis.intent = intent;
          analysis.confidenceScore += 0.2;
          break;
        }
      }

      // Emotional weight detection (critical for your caring system)
      let emotionalScore = 0;
      for (const [emotion, weight] of this.emotionalWeights) {
        if (query.includes(emotion)) {
          emotionalScore = Math.max(emotionalScore, weight);
        }
      }
      analysis.emotionalWeight = emotionalScore;

      // Personal context detection (important for your memory system)
      analysis.personalContext = /\b(my|our|personal|family|private)\b/i.test(query);
      
      // Memory reference detection
      analysis.memoryReference = /\b(remember|recall|told you|mentioned|discussed)\b/i.test(query);
      
      // Urgency detection for priority handling
      analysis.urgencyLevel = /\b(urgent|emergency|asap|immediately|critical|important)\b/i.test(query) ? 0.8 : 0.0;

      // Topic focus extraction for better routing
      const topicWords = query.match(/\b(health|business|family|relationship|money|financial|work|career|home|lifestyle)\b/gi) || [];
      analysis.topicFocus = [...new Set(topicWords.map(w => w.toLowerCase()))];

      // Calculate overall confidence
      analysis.confidenceScore = Math.min(
        0.3 + // Base confidence
        (analysis.intent !== 'general' ? 0.2 : 0) +
        (analysis.personalContext ? 0.2 : 0) +
        (analysis.memoryReference ? 0.3 : 0) +
        (analysis.topicFocus.length * 0.1),
        1.0
      );

      return analysis;

    } catch (error) {
      console.error('[EXTRACTION] Error in semantic analysis:', error);
      return analysis; // Return default analysis on error
    }
  }

  /**
   * ADVANCED EXTRACTION with Railway PostgreSQL optimization
   */
  async performAdvancedExtraction(userId, query, tokenLimit, semanticAnalysis, routing) {
    try {
      // This would integrate with your database_manager to get actual memories
      // For now, returning structure that works with your system
      const client = await dbPool.connect();
      const result = await client.query(`
        SELECT id, user_id, category_name, content, token_count, relevance_score, 
               usage_frequency, created_at, last_accessed 
        FROM persistent_memories 
        WHERE user_id = $1 AND category_name = $2
        ORDER BY relevance_score DESC, created_at DESC
        LIMIT 20
      `, [userId, routing.primaryCategory]);
      
      const actualMemories = result.rows;
      client.release(); // Replace with actual database call
            
      // Apply sophisticated scoring to retrieved memories
      const scoredMemories = this.applySophisticatedScoring(mockMemories, query, semanticAnalysis, routing);
      
      // Filter by token limit with intelligent truncation
      return this.applyTokenLimitWithIntelligence(scoredMemories, tokenLimit);

    } catch (error) {
      console.error('[EXTRACTION] Error in advanced extraction:', error);
      return [];
    }
  }

  /**
   * SOPHISTICATED SCORING - Multi-factor relevance calculation
   */
  applySophisticatedScoring(memories, query, semanticAnalysis, routing) {
    return memories.map(memory => {
      let score = 0;
      const scoringFactors = {};

      // Factor 1: Text similarity (30% weight)
      const textSimilarity = this.calculateTextSimilarity(memory.content || '', query);
      score += textSimilarity * 0.3;
      scoringFactors.textSimilarity = textSimilarity;

      // Factor 2: Semantic intent alignment (25% weight)
      const intentMatch = this.calculateIntentAlignment(memory, semanticAnalysis);
      score += intentMatch * 0.25;
      scoringFactors.intentMatch = intentMatch;

      // Factor 3: Emotional context matching (20% weight)
      const emotionalMatch = this.calculateEmotionalAlignment(memory, semanticAnalysis);
      score += emotionalMatch * 0.2;
      scoringFactors.emotionalMatch = emotionalMatch;

      // Factor 4: Recency boost (15% weight)
      const recencyScore = this.calculateRecencyScore(memory.createdAt);
      score += recencyScore * 0.15;
      scoringFactors.recencyScore = recencyScore;

      // Factor 5: Usage frequency (10% weight)
      const usageScore = Math.min((memory.usageCount || 0) * 0.1, 0.5);
      score += usageScore * 0.1;
      scoringFactors.usageScore = usageScore;

      // Urgency boost for critical situations
      if (semanticAnalysis.urgencyLevel > 0.5 && memory.category === routing.primaryCategory) {
        score += 0.1;
        scoringFactors.urgencyBoost = 0.1;
      }

      return {
        ...memory,
        sophisticatedScore: Math.max(0, Math.min(score, 1)),
        scoringBreakdown: scoringFactors
      };
    });
  }

  /**
   * TEXT SIMILARITY with advanced algorithms
   */
  calculateTextSimilarity(memoryContent, query) {
    if (!memoryContent || !query) return 0;

    const memoryWords = this.extractMeaningfulWords(memoryContent);
    const queryWords = this.extractMeaningfulWords(query);
    
    if (!memoryWords.length || !queryWords.length) return 0;

    // Jaccard similarity
    const memorySet = new Set(memoryWords);
    const querySet = new Set(queryWords);
    
    const intersection = new Set([...querySet].filter(x => memorySet.has(x)));
    const union = new Set([...memoryWords, ...queryWords]);
    
    return intersection.size / union.size;
  }

  /**
   * INTENT ALIGNMENT calculation
   */
  calculateIntentAlignment(memory, semanticAnalysis) {
    if (!memory.content) return 0;

    const alignmentMap = {
      memory_recall: 0.9, // High relevance for memory queries
      personal_sharing: 0.7, // Good relevance for personal context
      problem_solving: 0.8, // High relevance for problem-solving
      emotional_content: 0.6, // Medium relevance for emotional queries
      information_request: 0.5 // Standard relevance for info requests
    };

    return alignmentMap[semanticAnalysis.intent] || 0.3;
  }

  /**
   * EMOTIONAL ALIGNMENT calculation
   */
  calculateEmotionalAlignment(memory, semanticAnalysis) {
    if (semanticAnalysis.emotionalWeight === 0) return 0.5; // Neutral baseline
    
    const memoryEmotionalContent = this.detectEmotionalContent(memory.content || '');
    
    if (memoryEmotionalContent > 0.3 && semanticAnalysis.emotionalWeight > 0.3) {
      return 0.8; // Both have emotional content
    }
    
    return 0.3; // Different emotional contexts
  }

  detectEmotionalContent(text) {
    let emotionalScore = 0;
    for (const [emotion, weight] of this.emotionalWeights) {
      if (text.toLowerCase().includes(emotion)) {
        emotionalScore = Math.max(emotionalScore, weight);
      }
    }
    return emotionalScore;
  }

  /**
   * RECENCY SCORE calculation
   */
  calculateRecencyScore(createdAt) {
    if (!createdAt) return 0;

    try {
      const now = Date.now();
      const memoryTime = new Date(createdAt).getTime();
      const ageInDays = (now - memoryTime) / (1000 * 60 * 60 * 24);

      if (ageInDays < 1) return 1.0;
      if (ageInDays < 7) return 0.8;
      if (ageInDays < 30) return 0.6;
      if (ageInDays < 90) return 0.4;
      return 0.2;

    } catch (error) {
      return 0;
    }
  }

  /**
   * MEANINGFUL WORDS extraction
   */
  extractMeaningfulWords(text) {
    if (!text) return [];

    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);

    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * INTELLIGENT RANKING with multi-criteria sorting
   */
  applyIntelligentRanking(memories, semanticAnalysis) {
    return memories.sort((a, b) => {
      // Primary sort by sophisticated score
      if (Math.abs(a.sophisticatedScore - b.sophisticatedScore) > 0.1) {
        return b.sophisticatedScore - a.sophisticatedScore;
      }
      
      // Secondary sort by recency for similar scores
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      
      return bTime - aTime;
    });
  }

  /**
   * TOKEN LIMIT with intelligent truncation
   */
  applyTokenLimitWithIntelligence(memories, tokenLimit) {
    const result = [];
    let totalTokens = 0;

    for (const memory of memories) {
      const tokenCount = memory.tokenCount || Math.ceil((memory.content || '').length / 4);
      
      if (totalTokens + tokenCount <= tokenLimit) {
        result.push(memory);
        totalTokens += tokenCount;
      } else if (memory.sophisticatedScore > 0.7 && totalTokens < tokenLimit * 0.9) {
        // Try intelligent truncation for high-value content
        const availableTokens = tokenLimit - totalTokens;
        if (availableTokens > 50) {
          const truncated = this.intelligentTruncate(memory, availableTokens);
          result.push(truncated);
          break;
        }
      }
    }

    return result;
  }

  intelligentTruncate(memory, tokenBudget) {
    const content = memory.content || '';
    const charBudget = tokenBudget * 4;

    if (content.length <= charBudget) return memory;

    // Try to cut at sentence boundaries
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    let truncated = '';

    for (const sentence of sentences) {
      if (truncated.length + sentence.length <= charBudget) {
        truncated += sentence;
      } else {
        break;
      }
    }

    return {
      ...memory,
      content: truncated || content.substring(0, charBudget),
      tokenCount: tokenBudget,
      truncated: true
    };
  }

  /**
   * PERFORMANCE UTILITIES
   */
  generateCacheKey(userId, query, tokenLimit) {
    return `${userId}_${query.substring(0, 50)}_${tokenLimit}`;
  }

  cacheExtractionResult(key, result) {
    if (this.extractionCache.size >= this.maxCacheSize) {
      const firstKey = this.extractionCache.keys().next().value;
      this.extractionCache.delete(firstKey);
    }
    this.extractionCache.set(key, result);
  }

  updateExtractionAnalytics(memories, processingTime) {
    this.extractionStats.totalExtractions++;
    const count = this.extractionStats.totalExtractions;
    this.extractionStats.avgExtractionTime = 
      ((this.extractionStats.avgExtractionTime * (count - 1)) + processingTime) / count;
    
    const totalRequests = this.extractionStats.cacheHits + this.extractionStats.cacheMisses;
    this.extractionStats.cacheHitRate = totalRequests > 0 ? 
      this.extractionStats.cacheHits / totalRequests : 0;
  }

  getExtractionStats() {
    return {
      ...this.extractionStats,
      cacheSize: this.extractionCache.size,
      uptime: Date.now() - this.extractionStats.lastReset
    };
  }

  cleanup() {
    this.extractionCache.clear();
    this.semanticCache.clear();
    console.log('[EXTRACTION] Caches cleared');
  }
}

export { ExtractionEngine };
