// memory_system/extraction_engine.js
// ULTIMATE VERSION: Maximum Sophistication + Production Safety
// Combines advanced algorithms from File #1 with production improvements

import DatabaseManager from './database_manager.js';
import RoutingIntelligence from './routing_intelligence.js';

class ExtractionEngine {
  constructor() {
    this.dbManager = new DatabaseManager();
    this.routingIntelligence = new RoutingIntelligence();
    
    // Production-grade analytics with sophisticated tracking
    this.extractionStats = {
      totalExtractions: 0,
      avgConfidence: 0,
      categoryDistribution: new Map(),
      tokenDistribution: { min: Infinity, max: 0, sum: 0, samples: [] },
      scoringMetrics: { avgTextSimilarity: 0, avgKeywordMatch: 0, avgEmotionalMatch: 0 },
      performanceMetrics: { avgExtractionTime: 0, cacheHitRate: 0 },
      lastReset: Date.now()
    };

    // Performance caches with sophisticated management
    this.wordCache = new Map();
    this.similarityCache = new Map();
    this.semanticCache = new Map();
    this.maxCacheSize = 1000;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Advanced stop words for sophisticated text processing
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'
    ]);

    // Sophisticated emotional word mapping
    this.emotionalWords = {
      positive: new Set(['happy', 'excited', 'love', 'enjoy', 'great', 'amazing', 'wonderful', 'proud', 'success', 'fantastic', 'brilliant', 'excellent']),
      negative: new Set(['sad', 'angry', 'frustrated', 'hate', 'terrible', 'awful', 'worried', 'anxious', 'problem', 'horrible', 'disgusted', 'furious']),
      neutral: new Set(['think', 'consider', 'maybe', 'perhaps', 'possibly', 'could', 'might', 'suppose', 'assume', 'believe'])
    };

    // Advanced synonym mapping for semantic similarity
    this.synonymPairs = new Map([
      ['car', new Set(['vehicle', 'automobile', 'auto'])],
      ['home', new Set(['house', 'residence', 'dwelling'])],
      ['job', new Set(['work', 'career', 'employment', 'position'])],
      ['money', new Set(['cash', 'funds', 'currency', 'income'])],
      ['happy', new Set(['glad', 'joyful', 'pleased', 'content'])],
      ['sad', new Set(['upset', 'depressed', 'melancholy', 'downcast'])],
      ['big', new Set(['large', 'huge', 'massive', 'enormous'])],
      ['small', new Set(['tiny', 'little', 'minute', 'compact'])]
    ]);

    // Question and answer pattern recognition
    this.questionWords = new Set(['what', 'how', 'when', 'where', 'why', 'who', 'which']);
    this.questionStarters = new Set(['can you', 'could you', 'would you', 'do you know', 'tell me', 'show me', 'explain']);
    this.answerPatterns = new Set(['the answer is', 'you can', 'you should', 'i recommend', 'based on', 'according to', 'here are', 'try this', 'consider', 'my suggestion']);
  }

  /**
   * SOPHISTICATED MAIN EXTRACTION with production safety
   */
  async extractRelevantMemories(userId, query, tokenLimit = 2400, options = {}) {
    // Comprehensive input validation
    const validationResult = this.validateInputs(userId, query, tokenLimit);
    if (!validationResult.valid) {
      throw new Error(`[EXTRACTION] ${validationResult.error}`);
    }

    const startTime = Date.now();
    console.log(`[EXTRACTION] Starting sophisticated extraction for: "${this.truncateString(query, 50)}"`);
    
    try {
      // Advanced routing with fallback handling
      const routing = await this.performSophisticatedRouting(query, options.context);
      const primaryCategory = this.extractPrimaryCategory(routing);
      
      let memories;
      
      if (!primaryCategory) {
        console.warn('[EXTRACTION] No primary category found, using advanced cross-category search');
        memories = await this.sophisticatedCrossCategorySearch(userId, query, tokenLimit, options);
      } else {
        console.log(`[EXTRACTION] Primary category: ${primaryCategory}, confidence: ${routing?.confidence?.toFixed(3) || 'unknown'}`);
        memories = await this.extractWithSophisticatedScoring(userId, query, primaryCategory, tokenLimit, routing, options);
      }

      // Advanced analytics update
      await this.updateAdvancedAnalytics(memories, routing, tokenLimit, Date.now() - startTime);

      const duration = Date.now() - startTime;
      const totalTokens = this.calculateTokenUsage(memories);
      console.log(`[EXTRACTION] Completed in ${duration}ms: ${memories.length} memories, ${totalTokens} tokens, avg score: ${this.calculateAverageScore(memories)}`);

      return memories;

    } catch (error) {
      console.error('[EXTRACTION] Critical error in sophisticated extraction:', error);
      // Return empty array with error context for monitoring
      await this.logExtractionError(error, query, userId);
      return [];
    }
  }

  /**
   * SOPHISTICATED INPUT VALIDATION
   */
  validateInputs(userId, query, tokenLimit) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return { valid: false, error: 'Invalid userId: must be non-empty string' };
    }
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return { valid: false, error: 'Invalid query: must be non-empty string' };
    }
    if (query.length > 10000) {
      return { valid: false, error: 'Query too long: maximum 10000 characters' };
    }
    if (!Number.isInteger(tokenLimit) || tokenLimit < 100 || tokenLimit > 50000) {
      return { valid: false, error: 'Invalid tokenLimit: must be integer between 100-50000' };
    }
    return { valid: true };
  }

  /**
   * SOPHISTICATED ROUTING with multiple fallback strategies
   */
  async performSophisticatedRouting(query, context) {
    try {
      const routing = await this.routingIntelligence.routeToCategory(query, context);
      
      // Handle multiple possible return formats with validation
      if (!routing) return null;
      
      if (typeof routing === 'string') {
        return { primaryCategory: routing, confidence: 0.5, method: 'string_fallback' };
      }
      
      if (routing && typeof routing === 'object') {
        // Support multiple property names for compatibility
        const primaryCategory = routing.primaryCategory || routing.category || routing.main_category;
        const confidence = this.validateConfidence(routing.confidence);
        
        if (primaryCategory) {
          return { 
            primaryCategory, 
            confidence, 
            method: 'object_extraction',
            metadata: routing.metadata || {}
          };
        }
      }
      
      return null;
    } catch (error) {
      console.warn('[EXTRACTION] Sophisticated routing failed:', error.message);
      // Fallback to pattern-based routing
      return this.fallbackPatternRouting(query);
    }
  }

  /**
   * FALLBACK PATTERN-BASED ROUTING
   */
  fallbackPatternRouting(query) {
    const lowerQuery = query.toLowerCase();
    
    const patterns = {
      'health_wellness': ['health', 'fitness', 'medical', 'wellness', 'exercise', 'diet'],
      'business_career': ['work', 'job', 'career', 'business', 'meeting', 'project'],
      'relationships_social': ['friend', 'family', 'relationship', 'social', 'people'],
      'financial_management': ['money', 'finance', 'budget', 'investment', 'cost'],
      'personal_development': ['learn', 'growth', 'skill', 'development', 'improve'],
      'home_lifestyle': ['home', 'house', 'lifestyle', 'daily', 'routine']
    };

    for (const [category, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        return { 
          primaryCategory: category, 
          confidence: 0.4, 
          method: 'pattern_fallback' 
        };
      }
    }

    return null;
  }

  validateConfidence(confidence) {
    if (typeof confidence !== 'number' || isNaN(confidence)) return 0.5;
    return Math.max(0, Math.min(confidence, 1)); // Clamp to 0-1 range
  }

  extractPrimaryCategory(routing) {
    return routing?.primaryCategory || null;
  }

  /**
   * SOPHISTICATED EXTRACTION WITH ADVANCED SCORING
   */
  async extractWithSophisticatedScoring(userId, query, primaryCategory, tokenLimit, routing, options) {
    // Get primary memories with error handling
    const primaryTokenBudget = Math.ceil(tokenLimit * 0.7);
    const primaryMemories = await this.safeGetMemories(
      userId, primaryCategory, query, 
      Math.ceil(tokenLimit / 100), 
      primaryTokenBudget
    );

    // Apply sophisticated multi-factor scoring
    const scoredPrimary = await this.applySophisticatedScoring(primaryMemories, query, {
      isPrimaryCategory: true,
      categoryConfidence: routing?.confidence || 0.5,
      routingMethod: routing?.method || 'unknown'
    });

    // Calculate remaining budget for related memories
    const usedTokens = this.calculateTokenUsage(scoredPrimary);
    const remainingTokens = tokenLimit - usedTokens;
    
    let additionalMemories = [];
    
    // Get related memories if budget allows and we need more content
    if (remainingTokens > 200 && scoredPrimary.length < 10) {
      const relatedCategories = this.getAdvancedRelatedCategories(primaryCategory);
      additionalMemories = await this.getSophisticatedRelatedMemories(
        userId, relatedCategories, query, remainingTokens, options
      );
    }

    // Combine and apply advanced ranking
    const allMemories = [...scoredPrimary, ...additionalMemories];
    const rankedMemories = this.applySophisticatedRanking(allMemories, query, routing);
    
    // Apply intelligent token filtering with content preservation
    return this.applyIntelligentTokenFiltering(rankedMemories, tokenLimit);
  }

  /**
   * SOPHISTICATED MULTI-FACTOR SCORING SYSTEM
   */
  async applySophisticatedScoring(memories, query, options = {}) {
    if (!Array.isArray(memories) || memories.length === 0) return [];
    
    const queryProcessed = await this.processTextForAdvancedScoring(query);
    const scoringPromises = memories.map(memory => this.scoreMemorySophisticated(memory, query, queryProcessed, options));
    
    try {
      const scoredMemories = await Promise.all(scoringPromises);
      return scoredMemories.filter(memory => memory !== null);
    } catch (error) {
      console.error('[EXTRACTION] Error in sophisticated scoring:', error);
      return memories.map(memory => ({ ...memory, sophisticatedScore: 0.1, scoringError: true }));
    }
  }

  /**
   * INDIVIDUAL MEMORY SOPHISTICATED SCORING
   */
  async scoreMemorySophisticated(memory, query, queryProcessed, options) {
    if (!memory || typeof memory.content !== 'string') {
      console.warn('[EXTRACTION] Invalid memory object, assigning minimal score');
      return { ...memory, sophisticatedScore: 0.01, scoringBreakdown: { error: 'invalid_memory' } };
    }

    try {
      const memoryProcessed = await this.processTextForAdvancedScoring(memory.content);
      const scoringFactors = {};
      let totalScore = 0;

      // Factor 1: Advanced text similarity (40% weight)
      const textSimilarity = await this.calculateAdvancedTextSimilarity(memoryProcessed, queryProcessed);
      totalScore += textSimilarity * 0.4;
      scoringFactors.textSimilarity = textSimilarity;

      // Factor 2: Sophisticated keyword matching (30% weight)
      const keywordMatch = await this.calculateSophisticatedKeywordMatch(memoryProcessed, queryProcessed);
      totalScore += keywordMatch * 0.3;
      scoringFactors.keywordMatch = keywordMatch;

      // Factor 3: Enhanced recency boost (10% weight)
      const recencyBoost = this.calculateEnhancedRecencyBoost(memory.createdAt);
      totalScore += recencyBoost * 0.1;
      scoringFactors.recencyBoost = recencyBoost;

      // Factor 4: Usage frequency weighting (5% weight)
      const usageWeight = this.calculateUsageWeight(memory);
      totalScore += usageWeight * 0.05;
      scoringFactors.usageWeight = usageWeight;

      // Factor 5: Emotional context matching (10% weight)
      const emotionalMatch = await this.calculateEmotionalContextMatch(memoryProcessed, queryProcessed);
      totalScore += emotionalMatch * 0.1;
      scoringFactors.emotionalMatch = emotionalMatch;

      // Factor 6: Question-answer relevance (15% weight)
      const qaRelevance = await this.calculateQuestionAnswerRelevance(memoryProcessed, queryProcessed, memory, query);
      totalScore += qaRelevance * 0.15;
      scoringFactors.qaRelevance = qaRelevance;

      // Factor 7: Category confidence boost (variable weight)
      if (options.isPrimaryCategory && options.categoryConfidence > 0.8) {
        totalScore += 0.1;
        scoringFactors.categoryBoost = 0.1;
      }

      // Factor 8: Memory priority and importance (variable weight)
      const priorityBoost = this.calculatePriorityBoost(memory);
      totalScore += priorityBoost;
      scoringFactors.priorityBoost = priorityBoost;

      // Normalize score to 0-1 range
      const normalizedScore = Math.max(0, Math.min(totalScore, 1));

      return {
        ...memory,
        sophisticatedScore: normalizedScore,
        scoringBreakdown: scoringFactors,
        scoringMetadata: {
          processingTime: Date.now(),
          scoringVersion: '2.0',
          routingMethod: options.routingMethod
        }
      };

    } catch (error) {
      console.error('[EXTRACTION] Error scoring individual memory:', error);
      return {
        ...memory,
        sophisticatedScore: 0.1,
        scoringBreakdown: { error: error.message },
        scoringError: true
      };
    }
  }

  /**
   * ADVANCED TEXT PROCESSING with sophisticated caching
   */
  async processTextForAdvancedScoring(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return { words: [], meaningfulWords: [], length: 0, text: '', wordWeights: new Map() };
    }
    
    const cacheKey = this.generateCacheKey(text);
    
    if (this.wordCache.has(cacheKey)) {
      this.cacheHits++;
      return this.wordCache.get(cacheKey);
    }

    this.cacheMisses++;

    // Advanced text processing
    const normalizedText = text.toLowerCase().trim();
    const words = normalizedText
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const meaningfulWords = words.filter(word => 
      word.length > 2 && 
      !this.stopWords.has(word) &&
      !/^\d+$/.test(word) // Remove pure numbers
    );

    // Calculate word weights for semantic importance
    const wordWeights = new Map();
    for (const word of meaningfulWords) {
      wordWeights.set(word, this.getAdvancedWordWeight(word));
    }

    const processed = {
      words: words,
      meaningfulWords: meaningfulWords,
      length: meaningfulWords.length,
      text: normalizedText,
      wordWeights: wordWeights,
      originalLength: text.length
    };

    // Manage cache size
    if (this.wordCache.size >= this.maxCacheSize) {
      const firstKey = this.wordCache.keys().next().value;
      this.wordCache.delete(firstKey);
    }
    
    this.wordCache.set(cacheKey, processed);
    return processed;
  }

  generateCacheKey(text) {
    // Generate a short but unique cache key
    return text.length < 100 ? text : text.substring(0, 50) + text.substring(text.length - 50) + text.length;
  }

  getAdvancedWordWeight(word) {
    // Sophisticated word weighting based on multiple factors
    let weight = 1.0;
    
    // Length-based weighting
    if (word.length > 6) weight *= 1.5;
    else if (word.length > 4) weight *= 1.2;
    
    // Capitalization in original (proper nouns get higher weight)
    // Note: We've already lowercased, so this would need original text preservation
    // For now, use word characteristics
    
    // Technical terms and domain-specific language
    if (this.isTechnicalTerm(word)) weight *= 1.4;
    
    // Emotional words get higher weight
    if (this.isEmotionalWord(word)) weight *= 1.3;
    
    return weight;
  }

  isTechnicalTerm(word) {
    const technicalPatterns = ['tech', 'system', 'process', 'method', 'algorithm', 'data', 'analysis', 'strategy'];
    return technicalPatterns.some(pattern => word.includes(pattern));
  }

  isEmotionalWord(word) {
    return this.emotionalWords.positive.has(word) || 
           this.emotionalWords.negative.has(word) || 
           this.emotionalWords.neutral.has(word);
  }

  /**
   * ADVANCED TEXT SIMILARITY - Jaccard + Semantic + Weighted
   */
  async calculateAdvancedTextSimilarity(memoryProcessed, queryProcessed) {
    if (!memoryProcessed.meaningfulWords.length || !queryProcessed.meaningfulWords.length) {
      return 0;
    }

    const cacheKey = `similarity_${memoryProcessed.length}_${queryProcessed.length}`;
    if (this.similarityCache.has(cacheKey)) {
      return this.similarityCache.get(cacheKey);
    }

    // Jaccard similarity with semantic enhancement
    const memorySet = new Set(memoryProcessed.meaningfulWords);
    const querySet = new Set(queryProcessed.meaningfulWords);
    
    let exactMatches = 0;
    let weightedMatches = 0;
    let totalQueryWeight = 0;
    
    // Calculate weighted intersection
    for (const queryWord of querySet) {
      const weight = queryProcessed.wordWeights.get(queryWord) || 1;
      totalQueryWeight += weight;
      
      if (memorySet.has(queryWord)) {
        exactMatches++;
        weightedMatches += weight;
      } else {
        // Check for semantic matches
        for (const memoryWord of memorySet) {
          if (await this.areWordsSemanticallyRelated(queryWord, memoryWord)) {
            weightedMatches += weight * 0.6; // Partial credit for semantic match
            break;
          }
        }
      }
    }

    // Union for Jaccard
    const union = new Set([...memoryProcessed.meaningfulWords, ...queryProcessed.meaningfulWords]);
    
    // Combine multiple similarity measures
    const jaccardSimilarity = exactMatches / union.size;
    const weightedSimilarity = totalQueryWeight > 0 ? weightedMatches / totalQueryWeight : 0;
    const lengthNormalization = Math.min(memoryProcessed.length, queryProcessed.length) / 
                               Math.max(memoryProcessed.length, queryProcessed.length);

    const finalSimilarity = (jaccardSimilarity * 0.4) + (weightedSimilarity * 0.5) + (lengthNormalization * 0.1);

    // Cache the result
    if (this.similarityCache.size >= this.maxCacheSize) {
      const firstKey = this.similarityCache.keys().next().value;
      this.similarityCache.delete(firstKey);
    }
    this.similarityCache.set(cacheKey, finalSimilarity);

    return Math.min(finalSimilarity, 1);
  }

  /**
   * SOPHISTICATED KEYWORD MATCHING - Multi-tier matching system
   */
  async calculateSophisticatedKeywordMatch(memoryProcessed, queryProcessed) {
    if (!memoryProcessed.meaningfulWords.length || !queryProcessed.meaningfulWords.length) {
      return 0;
    }

    let exactMatches = 0;
    let partialMatches = 0;
    let semanticMatches = 0;
    let totalPossibleScore = 0;

    for (const queryWord of queryProcessed.meaningfulWords) {
      const weight = queryProcessed.wordWeights.get(queryWord) || 1;
      totalPossibleScore += weight;
      
      let bestMatchScore = 0;

      for (const memoryWord of memoryProcessed.meaningfulWords) {
        let matchScore = 0;

        // Exact match
        if (queryWord === memoryWord) {
          matchScore = 1.0;
        }
        // Partial substring match
        else if (memoryWord.includes(queryWord) || queryWord.includes(memoryWord)) {
          matchScore = 0.7;
        }
        // Semantic similarity
        else if (await this.areWordsSemanticallyRelated(queryWord, memoryWord)) {
          matchScore = 0.5;
        }
        // Phonetic similarity (basic)
        else if (this.arePhoneticallyRelated(queryWord, memoryWord)) {
          matchScore = 0.3;
        }

        bestMatchScore = Math.max(bestMatchScore, matchScore);
      }

      if (bestMatchScore === 1.0) exactMatches++;
      else if (bestMatchScore >= 0.5) partialMatches++;
      else if (bestMatchScore >= 0.3) semanticMatches++;
    }

    const totalMatches = exactMatches + (partialMatches * 0.7) + (semanticMatches * 0.4);
    return totalPossibleScore > 0 ? Math.min(totalMatches / queryProcessed.meaningfulWords.length, 1) : 0;
  }

  /**
   * ENHANCED SEMANTIC WORD RELATIONSHIP
   */
  async areWordsSemanticallyRelated(word1, word2) {
    const cacheKey = `semantic_${word1}_${word2}`;
    if (this.semanticCache.has(cacheKey)) {
      return this.semanticCache.get(cacheKey);
    }

    let related = false;

    // Check synonym mappings
    if (this.synonymPairs.has(word1) && this.synonymPairs.get(word1).has(word2)) {
      related = true;
    } else if (this.synonymPairs.has(word2) && this.synonymPairs.get(word2).has(word1)) {
      related = true;
    }
    // Check stem similarity (basic)
    else if (this.haveSimilarStems(word1, word2)) {
      related = true;
    }
    // Check domain relatedness
    else if (this.areInSameDomain(word1, word2)) {
      related = true;
    }

    // Cache result
    if (this.semanticCache.size >= this.maxCacheSize) {
      const firstKey = this.semanticCache.keys().next().value;
      this.semanticCache.delete(firstKey);
    }
    this.semanticCache.set(cacheKey, related);

    return related;
  }

  haveSimilarStems(word1, word2) {
    // Basic stemming - remove common suffixes
    const stem1 = word1.replace(/(ing|ed|er|est|ly|tion|sion)$/, '');
    const stem2 = word2.replace(/(ing|ed|er|est|ly|tion|sion)$/, '');
    return stem1 === stem2 && stem1.length > 3;
  }

  areInSameDomain(word1, word2) {
    const domains = {
      technology: new Set(['computer', 'software', 'app', 'digital', 'online', 'tech', 'system', 'platform']),
      business: new Set(['company', 'business', 'corporate', 'enterprise', 'organization', 'firm', 'industry']),
      health: new Set(['health', 'medical', 'doctor', 'hospital', 'wellness', 'fitness', 'therapy', 'treatment']),
      education: new Set(['school', 'university', 'college', 'education', 'learning', 'study', 'academic'])
    };

    for (const [domain, words] of Object.entries(domains)) {
      if (words.has(word1) && words.has(word2)) {
        return true;
      }
    }
    return false;
  }

  arePhoneticallyRelated(word1, word2) {
    // Very basic phonetic similarity
    if (word1.length < 4 || word2.length < 4) return false;
    
    // Check first and last characters
    const firstMatch = word1[0] === word2[0];
    const lastMatch = word1[word1.length - 1] === word2[word2.length - 1];
    
    return firstMatch && lastMatch && Math.abs(word1.length - word2.length) <= 2;
  }

  /**
   * ENHANCED RECENCY SCORING with sophisticated decay
   */
  calculateEnhancedRecencyBoost(createdAt) {
    if (!createdAt) return 0;
    
    try {
      const now = Date.now();
      const memoryTime = new Date(createdAt).getTime();
      
      if (isNaN(memoryTime)) return 0;
      
      const ageInMilliseconds = now - memoryTime;
      const ageInDays = ageInMilliseconds / (1000 * 60 * 60 * 24);

      // Sophisticated multi-phase decay function
      if (ageInDays < 0.5) return 1.0;           // Last 12 hours: maximum boost
      if (ageInDays < 1) return 0.9;            // Last 24 hours: very high boost
      if (ageInDays < 3) return 0.8;            // Last 3 days: high boost
      if (ageInDays < 7) return 0.6;            // Last week: good boost  
      if (ageInDays < 30) return 0.4;           // Last month: medium boost
      if (ageInDays < 90) return 0.2;           // Last 3 months: low boost
      if (ageInDays < 365) return 0.1;          // Last year: minimal boost
      return 0.05;                               // Older: very low boost
      
    } catch (error) {
      console.warn('[EXTRACTION] Error calculating enhanced recency for:', createdAt, error);
      return 0;
    }
  }

  /**
   * SOPHISTICATED USAGE WEIGHTING
   */
  calculateUsageWeight(memory) {
    if (!memory) return 0;
    
    let weight = 0;
    
    // Usage frequency with diminishing returns
    const usageCount = memory.usageCount || memory.usageFrequency || 0;
    weight += Math.min(usageCount * 0.1, 0.5);
    
    // Last accessed recency
    if (memory.lastAccessed) {
      const daysSinceAccess = (Date.now() - new Date(memory.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 7) weight += 0.2;
      else if (daysSinceAccess < 30) weight += 0.1;
    }
    
    return Math.min(weight, 1);
  }

  /**
   * EMOTIONAL CONTEXT MATCHING with advanced detection
   */
  async calculateEmotionalContextMatch(memoryProcessed, queryProcessed) {
    const queryEmotion = this.detectEmotionalTone(queryProcessed);
    const memoryEmotion = this.detectEmotionalTone(memoryProcessed);

    // Strong emotional alignment
    if (queryEmotion.primary === memoryEmotion.primary && queryEmotion.primary !== 'neutral') {
      return 1.0; // Perfect emotional match
    }
    
    // Complementary emotions (e.g., seeking solution for negative emotion)
    if (queryEmotion.primary === 'negative' && memoryEmotion.primary === 'positive') {
      return 0.8; // Solution-seeking match
    }
    
    // Both emotional but different
    if (queryEmotion.primary !== 'neutral' && memoryEmotion.primary !== 'neutral') {
      return 0.3; // Some emotional relevance
    }
    
    // Both neutral
    if (queryEmotion.primary === 'neutral' && memoryEmotion.primary === 'neutral') {
      return 0.5; // Neutral baseline
    }

    return 0.1; // Minimal emotional relevance
  }

  /**
   * ENHANCED EMOTIONAL TONE DETECTION
   */
  detectEmotionalTone(processedText) {
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    for (const word of processedText.meaningfulWords) {
      const weight = processedText.wordWeights?.get(word) || 1;
      
      if (this.emotionalWords.positive.has(word)) {
        positiveScore += weight;
      } else if (this.emotionalWords.negative.has(word)) {
        negativeScore += weight;
      } else if (this.emotionalWords.neutral.has(word)) {
        neutralScore += weight * 0.5; // Neutral words get less weight
      }
    }

    const total = positiveScore + negativeScore + neutralScore;
    if (total === 0) return { primary: 'neutral', confidence: 0.5, scores: { positive: 0, negative: 0, neutral: 1 } };

    const scores = {
      positive: positiveScore / total,
      negative: negativeScore / total,
      neutral: neutralScore / total
    };

    let primary = 'neutral';
    let confidence = 0.5;

    if (positiveScore > negativeScore && positiveScore > neutralScore) {
      primary = 'positive';
      confidence = scores.positive;
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
      primary = 'negative';
      confidence = scores.negative;
    }

    return { primary, confidence, scores };
  }

  /**
   * SOPHISTICATED QUESTION-ANSWER RELEVANCE
   */
  async calculateQuestionAnswerRelevance(memoryProcessed, queryProcessed, memory, query) {
    const isQueryQuestion = this.isAdvancedQuestion(query, queryProcessed);
    const memoryHasAnswer = this.hasAdvancedAnswerPattern(memory.content, memoryProcessed);
    const memoryIsQuestion = this.isAdvancedQuestion(memory.content, memoryProcessed);
    const queryHasAnswer = this.hasAdvancedAnswerPattern(query, queryProcessed);

    let relevance = 0;

    // Question seeking answer - highest relevance
    if (isQueryQuestion && memoryHasAnswer) {
      relevance = 1.0;
      
      // Bonus for specific question types
      if (this.areQuestionTypesRelated(query, memory.content)) {
        relevance = Math.min(relevance + 0.2, 1.0);
      }
    }
    // Statement seeking related questions
    else if (!isQueryQuestion && memoryIsQuestion) {
      relevance = 0.7;
    }
    // Both questions - potential related inquiry
    else if (isQueryQuestion && memoryIsQuestion) {
      relevance = 0.5;
    }
    // Answer seeking related answer
    else if (queryHasAnswer && memoryHasAnswer) {
      relevance = 0.6;
    }
    // Mixed scenarios
    else if (isQueryQuestion && !memoryHasAnswer && !memoryIsQuestion) {
      relevance = 0.2; // Question with general content
    }

    return relevance;
  }

  /**
   * ADVANCED QUESTION DETECTION
   */
  isAdvancedQuestion(text, processedText) {
    if (typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase().trim();
    
    // Direct question markers
    if (lowerText.includes('?')) return true;
    
    // Question word starters
    if (Array.from(this.questionWords).some(word => lowerText.startsWith(word))) return true;
    
    // Question phrases
    if (Array.from(this.questionStarters).some(phrase => lowerText.includes(phrase))) return true;
    
    // Implicit questions (seeking information)
    const implicitPatterns = ['i need to know', 'i want to understand', 'help me with', 'i\'m looking for'];
    if (implicitPatterns.some(pattern => lowerText.includes(pattern))) return true;

    return false;
  }

  /**
   * ADVANCED ANSWER PATTERN DETECTION
   */
  hasAdvancedAnswerPattern(text, processedText) {
    if (typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase();
    
    // Direct answer patterns
    if (Array.from(this.answerPatterns).some(pattern => lowerText.includes(pattern))) return true;
    
    // Instructional patterns
    const instructionalPatterns = ['here\'s how', 'first you', 'step 1', 'the way to', 'you need to'];
    if (instructionalPatterns.some(pattern => lowerText.includes(pattern))) return true;
    
    // Explanatory patterns  
    const explanatoryPatterns = ['this is because', 'the reason is', 'it works by', 'this happens when'];
    if (explanatoryPatterns.some(pattern => lowerText.includes(pattern))) return true;

    return false;
  }

  areQuestionTypesRelated(question, answer) {
    const howQuestions = question.toLowerCase().includes('how');
    const howAnswers = answer.toLowerCase().includes('step') || answer.toLowerCase().includes('process');
    
    const whyQuestions = question.toLowerCase().includes('why');
    const whyAnswers = answer.toLowerCase().includes('because') || answer.toLowerCase().includes('reason');
    
    return (howQuestions && howAnswers) || (whyQuestions && whyAnswers);
  }

  /**
   * PRIORITY BOOST CALCULATION
   */
  calculatePriorityBoost(memory) {
    let boost = 0;
    
    // User-defined priority
    if (memory.priority === 'high') boost += 0.2;
    else if (memory.priority === 'medium') boost += 0.1;
    
    // User marked importance
    if (memory.userPriority) boost += 0.1;
    
    // System-detected importance
    if (memory.emotionalWeight > 0.7) boost += memory.emotionalWeight * 0.1;
    
    // Bookmark or favorite status
    if (memory.bookmarked || memory.favorited) boost += 0.15;
    
    return Math.min(boost, 0.3); // Cap boost at 30%
  }

  /**
   * SOPHISTICATED RANKING with multiple criteria
   */
  applySophisticatedRanking(memories, query, routing) {
    return memories.sort((a, b) => {
      // Primary sort by sophisticated score
      if (Math.abs(a.sophisticatedScore - b.sophisticatedScore) > 0.1) {
        return b.sophisticatedScore - a.sophisticatedScore;
      }
      
      // Secondary sort by recency for similar scores
      const aTime = new Date(a.createdAt).getTime() || 0;
      const bTime = new Date(b.createdAt).getTime() || 0;
      if (Math.abs(aTime - bTime) > 86400000) { // More than 1 day difference
        return bTime - aTime;
      }
      
      // Tertiary sort by usage
      const aUsage = a.usageCount || 0;
      const bUsage = b.usageCount || 0;
      if (aUsage !== bUsage) {
        return bUsage - aUsage;
      }
      
      // Final sort by content length (longer content might be more comprehensive)
      return (b.content?.length || 0) - (a.content?.length || 0);
    });
  }

  /**
   * INTELLIGENT TOKEN FILTERING with content preservation
   */
  applyIntelligentTokenFiltering(memories, tokenLimit) {
    const filtered = [];
    let totalTokens = 0;
    const reservePercentage = 0.15; // Reserve 15% for high-value content
    const mainBudget = Math.floor(tokenLimit * (1 - reservePercentage));
    const reserveBudget = tokenLimit - mainBudget;

    // First pass: fill main budget with top memories
    for (const memory of memories) {
      const tokenCount = memory.tokenCount || 0;
      
      if (totalTokens + tokenCount <= mainBudget) {
        filtered.push(memory);
        totalTokens += tokenCount;
      } else {
        break; // Move to reserve phase
      }
    }

    // Second pass: use reserve budget for high-value content
    const remainingMemories = memories.slice(filtered.length);
    const highValueThreshold = 0.8;
    const highValueMemories = remainingMemories.filter(m => m.sophisticatedScore >= highValueThreshold);

    let reserveUsed = 0;
    for (const memory of highValueMemories) {
      const tokenCount = memory.tokenCount || 0;
      const availableReserve = reserveBudget - reserveUsed;
      
      if (tokenCount <= availableReserve) {
        filtered.push(memory);
        totalTokens += tokenCount;
        reserveUsed += tokenCount;
      } else if (availableReserve > 100) { // Try intelligent truncation
        const truncated = await this.performIntelligentTruncation(memory, availableReserve);
        if (truncated) {
          filtered.push(truncated);
          totalTokens += truncated.tokenCount;
          break; // Used remaining budget
        }
      }
    }

    return filtered;
  }

  /**
   * INTELLIGENT CONTENT TRUNCATION
   */
  async performIntelligentTruncation(memory, tokenBudget) {
    const charBudget = Math.floor(tokenBudget * 4); // Approximate chars per token
    const content = memory.content || '';
    
    if (content.length <= charBudget) return memory;

    try {
      // Try to preserve sentence boundaries
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      let preservedContent = '';
      
      for (const sentence of sentences) {
        if (preservedContent.length + sentence.length <= charBudget) {
          preservedContent += sentence;
        } else {
          break;
        }
      }

      // If no full sentences fit, do intelligent word truncation
      if (!preservedContent && charBudget > 50) {
        const words = content.split(/\s+/);
        let wordContent = '';
        
        for (const word of words) {
          if (wordContent.length + word.length + 1 <= charBudget - 3) { // Reserve space for '...'
            wordContent += (wordContent ? ' ' : '') + word;
          } else {
            break;
          }
        }
        preservedContent = wordContent + '...';
      }

      if (preservedContent.length > 10) {
        return {
          ...memory,
          content: preservedContent,
          tokenCount: tokenBudget,
          truncated: true,
          truncationMethod: 'intelligent'
        };
      }
    } catch (error) {
      console.warn('[EXTRACTION] Error in intelligent truncation:', error);
    }

    return null; // Failed to truncate meaningfully
  }

  /**
   * SOPHISTICATED CROSS-CATEGORY SEARCH
   */
  async sophisticatedCrossCategorySearch(userId, query, tokenLimit, options) {
    const categories = [
      'relationships_social', 'business_career', 'home_lifestyle', 
      'personal_development', 'health_wellness', 'financial_management',
      'technology_tools', 'creative_projects'
    ];
    
    const tokensPerCategory = Math.floor(tokenLimit / categories.length);
    const memoriesPerCategory = Math.ceil(tokensPerCategory / 150); // Estimate tokens per memory

    console.log(`[EXTRACTION] Cross-category search across ${categories.length} categories`);

    // Parallel fetching for performance
    const categoryPromises = categories.map(async (category) => {
      try {
        const memories = await this.safeGetMemories(
          userId, category, query, memoriesPerCategory, tokensPerCategory
        );
        
        // Score memories with category context
        const scored = await this.applySophisticatedScoring(memories, query, {
          isPrimaryCategory: false,
          categoryConfidence: 0.3,
          crossCategory: true,
          sourceCategory: category
        });
        
        return scored;
      } catch (error) {
        console.warn(`[EXTRACTION] Error in cross-category search for ${category}:`, error);
        return [];
      }
    });

    try {
      const categoryResults = await Promise.all(categoryPromises);
      const allMemories = categoryResults.flat();
      
      // Apply sophisticated ranking
      const rankedMemories = this.applySophisticatedRanking(allMemories, query, null);
      
      // Apply intelligent token filtering
      return this.applyIntelligentTokenFiltering(rankedMemories, tokenLimit);
      
    } catch (error) {
      console.error('[EXTRACTION] Error in sophisticated cross-category search:', error);
      return [];
    }
  }

  /**
   * ADVANCED RELATED CATEGORIES with confidence weighting
   */
  getAdvancedRelatedCategories(primaryCategory) {
    const advancedRelations = {
      'health_wellness': [
        { category: 'personal_development', weight: 0.8 },
        { category: 'home_lifestyle', weight: 0.6 },
        { category: 'financial_management', weight: 0.3 }
      ],
      'relationships_social': [
        { category: 'personal_development', weight: 0.9 },
        { category: 'home_lifestyle', weight: 0.5 },
        { category: 'travel_experiences', weight: 0.7 }
      ],
      'business_career': [
        { category: 'financial_management', weight: 0.9 },
        { category: 'personal_development', weight: 0.8 },
        { category: 'technology_tools', weight: 0.6 }
      ],
      'financial_management': [
        { category: 'business_career', weight: 0.9 },
        { category: 'home_lifestyle', weight: 0.7 },
        { category: 'personal_development', weight: 0.5 }
      ],
      'personal_development': [
        { category: 'health_wellness', weight: 0.8 },
        { category: 'business_career', weight: 0.7 },
        { category: 'relationships_social', weight: 0.6 }
      ],
      'home_lifestyle': [
        { category: 'health_wellness', weight: 0.6 },
        { category: 'financial_management', weight: 0.7 },
        { category: 'personal_development', weight: 0.5 }
      ],
      'technology_tools': [
        { category: 'business_career', weight: 0.8 },
        { category: 'personal_development', weight: 0.5 },
        { category: 'creative_projects', weight: 0.6 }
      ]
    };

    const relations = advancedRelations[primaryCategory] || [];
    // Sort by weight and return category names
    return relations
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3) // Top 3 related categories
      .map(r => r.category);
  }

  /**
   * SOPHISTICATED RELATED MEMORIES EXTRACTION
   */
  async getSophisticatedRelatedMemories(userId, relatedCategories, query, tokenBudget, options) {
    const memories = [];
    const tokensPerCategory = Math.floor(tokenBudget / Math.min(relatedCategories.length, 3));

    console.log(`[EXTRACTION] Getting related memories from ${relatedCategories.length} categories`);

    const promises = relatedCategories.slice(0, 3).map(async (category) => {
      try {
        const categoryMemories = await this.safeGetMemories(
          userId, category, query, 5, tokensPerCategory
        );
        
        // Score with related category context
        const scored = await this.applySophisticatedScoring(categoryMemories, query, {
          isPrimaryCategory: false,
          categoryConfidence: 0.2,
          isRelatedCategory: true,
          sourceCategory: category
        });
        
        return scored;
      } catch (error) {
        console.warn(`[EXTRACTION] Error getting related memories from ${category}:`, error);
        return [];
      }
    });

    try {
      const results = await Promise.all(promises);
      return results.flat();
    } catch (error) {
      console.error('[EXTRACTION] Error getting sophisticated related memories:', error);
      return [];
    }
  }

  /**
   * SAFE DATABASE OPERATIONS with retries
   */
  async safeGetMemories(userId, category, query, maxMemories, tokenBudget, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const memories = await this.dbManager.getRelevantMemories(
          userId, category, query, maxMemories, tokenBudget
        );
        return Array.isArray(memories) ? memories : [];
      } catch (error) {
        console.warn(`[EXTRACTION] Attempt ${attempt + 1} failed for ${category}:`, error.message);
        if (attempt === retries) {
          console.error(`[EXTRACTION] All attempts failed for ${category}`);
          return [];
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
    return [];
  }

  /**
   * UTILITY METHODS
   */
  calculateTokenUsage(memories) {
    return memories.reduce((sum, memory) => sum + (memory.tokenCount || 0), 0);
  }

  calculateAverageScore(memories) {
    if (!memories.length) return 0;
    const sum = memories.reduce((total, memory) => total + (memory.sophisticatedScore || 0), 0);
    return (sum / memories.length).toFixed(3);
  }

  truncateString(str, length) {
    if (typeof str !== 'string') return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  }

  /**
   * ADVANCED ANALYTICS UPDATE
   */
  async updateAdvancedAnalytics(memories, routing, tokenLimit, processingTime) {
    setTimeout(async () => {
      try {
        this.extractionStats.totalExtractions++;
        
        // Update confidence tracking
        if (routing?.confidence) {
          const count = this.extractionStats.totalExtractions;
          const currentAvg = this.extractionStats.avgConfidence;
          this.extractionStats.avgConfidence = ((currentAvg * (count - 1)) + routing.confidence) / count;
        }
        
        // Update category distribution
        if (routing?.primaryCategory) {
          const category = routing.primaryCategory;
          const current = this.extractionStats.categoryDistribution.get(category) || 0;
          this.extractionStats.categoryDistribution.set(category, current + 1);
        }
        
        // Update token statistics
        const totalTokens = this.calculateTokenUsage(memories);
        this.extractionStats.tokenDistribution.min = Math.min(this.extractionStats.tokenDistribution.min, totalTokens);
        this.extractionStats.tokenDistribution.max = Math.max(this.extractionStats.tokenDistribution.max, totalTokens);
        this.extractionStats.tokenDistribution.sum += totalTokens;
        
        // Track recent samples for variance calculation
        this.extractionStats.tokenDistribution.samples.push(totalTokens);
        if (this.extractionStats.tokenDistribution.samples.length > 100) {
          this.extractionStats.tokenDistribution.samples.shift(); // Keep last 100 samples
        }
        
        // Update scoring metrics
        const avgTextSimilarity = memories.reduce((sum, m) => sum + (m.scoringBreakdown?.textSimilarity || 0), 0) / Math.max(memories.length, 1);
        const avgKeywordMatch = memories.reduce((sum, m) => sum + (m.scoringBreakdown?.keywordMatch || 0), 0) / Math.max(memories.length, 1);
        const avgEmotionalMatch = memories.reduce((sum, m) => sum + (m.scoringBreakdown?.emotionalMatch || 0), 0) / Math.max(memories.length, 1);
        
        const count = this.extractionStats.totalExtractions;
        this.extractionStats.scoringMetrics.avgTextSimilarity = ((this.extractionStats.scoringMetrics.avgTextSimilarity * (count - 1)) + avgTextSimilarity) / count;
        this.extractionStats.scoringMetrics.avgKeywordMatch = ((this.extractionStats.scoringMetrics.avgKeywordMatch * (count - 1)) + avgKeywordMatch) / count;
        this.extractionStats.scoringMetrics.avgEmotionalMatch = ((this.extractionStats.scoringMetrics.avgEmotionalMatch * (count - 1)) + avgEmotionalMatch) / count;
        
        // Update performance metrics
        const currentAvgTime = this.extractionStats.performanceMetrics.avgExtractionTime;
        this.extractionStats.performanceMetrics.avgExtractionTime = ((currentAvgTime * (count - 1)) + processingTime) / count;
        
        // Update cache hit rate
        const totalCacheRequests = this.cacheHits + this.cacheMisses;
        this.extractionStats.performanceMetrics.cacheHitRate = totalCacheRequests > 0 ? this.cacheHits / totalCacheRequests : 0;
        
      } catch (error) {
        console.warn('[EXTRACTION] Error updating advanced analytics:', error);
      }
    }, 0);
  }

  /**
   * ERROR LOGGING for monitoring
   */
  async logExtractionError(error, query, userId) {
    setTimeout(() => {
      console.error('[EXTRACTION] Error details:', {
        error: error.message,
        stack: error.stack?.substring(0, 500),
        query: this.truncateString(query, 100),
        userId: userId?.substring(0, 8) + '***',
        timestamp: new Date().toISOString(),
        cacheStats: {
          wordCacheSize: this.wordCache.size,
          similarityCacheSize: this.similarityCache.size,
          semanticCacheSize: this.semanticCache.size
        }
      });
    }, 0);
  }

  /**
   * COMPREHENSIVE ANALYTICS GETTER
   */
  getExtractionStats() {
    const uptime = Date.now() - this.extractionStats.lastReset;
    const tokenSamples = this.extractionStats.tokenDistribution.samples;
    
    // Calculate token variance
    const avgTokens = this.extractionStats.totalExtractions > 0 
      ? this.extractionStats.tokenDistribution.sum / this.extractionStats.totalExtractions 
      : 0;
    
    const tokenVariance = tokenSamples.length > 1
      ? tokenSamples.reduce((sum, tokens) => sum + Math.pow(tokens - avgTokens, 2), 0) / tokenSamples.length
      : 0;

    return {
      totalExtractions: this.extractionStats.totalExtractions,
      avgConfidence: Number(this.extractionStats.avgConfidence.toFixed(3)),
      categoryDistribution: Object.fromEntries(this.extractionStats.categoryDistribution),
      tokenStats: {
        min: this.extractionStats.tokenDistribution.min === Infinity ? 0 : this.extractionStats.tokenDistribution.min,
        max: this.extractionStats.tokenDistribution.max,
        avg: Math.round(avgTokens),
        variance: Math.round(tokenVariance),
        stdDev: Math.round(Math.sqrt(tokenVariance))
      },
      scoringMetrics: {
        avgTextSimilarity: Number(this.extractionStats.scoringMetrics.avgTextSimilarity.toFixed(3)),
        avgKeywordMatch: Number(this.extractionStats.scoringMetrics.avgKeywordMatch.toFixed(3)),
        avgEmotionalMatch: Number(this.extractionStats.scoringMetrics.avgEmotionalMatch.toFixed(3))
      },
      performanceMetrics: {
        avgExtractionTime: Math.round(this.extractionStats.performanceMetrics.avgExtractionTime),
        cacheHitRate: Number(this.extractionStats.performanceMetrics.cacheHitRate.toFixed(3)),
        extractionsPerMinute: uptime > 0 ? Number((this.extractionStats.totalExtractions / (uptime / 60000)).toFixed(2)) : 0
      },
      uptime: uptime,
      cacheStats: {
        wordCacheSize: this.wordCache.size,
        similarityCacheSize: this.similarityCache.size,
        semanticCacheSize: this.semanticCache.size,
        totalCacheHits: this.cacheHits,
        totalCacheMisses: this.cacheMisses
      }
    };
  }

  /**
   * MEMORY MANAGEMENT
   */
  async cleanup() {
    console.log('[EXTRACTION] Starting cleanup process...');
    
    // Clear caches
    this.wordCache.clear();
    this.similarityCache.clear();
    this.semanticCache.clear();
    
    // Reset cache counters
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Clean up analytics (keep core stats but clear samples)
    this.extractionStats.tokenDistribution.samples = [];
    
    console.log('[EXTRACTION] Cleanup completed - all caches cleared');
  }

  /**
   * HEALTH CHECK for monitoring
   */
  getHealthStatus() {
    const cacheTotal = this.wordCache.size + this.similarityCache.size + this.semanticCache.size;
    const memoryPressure = cacheTotal / (this.maxCacheSize * 3); // 3 caches
    
    return {
      status: memoryPressure < 0.8 ? 'healthy' : memoryPressure < 0.95 ? 'warning' : 'critical',
      memoryPressure: Number(memoryPressure.toFixed(2)),
      cacheUtilization: {
        word: (this.wordCache.size / this.maxCacheSize).toFixed(2),
        similarity: (this.similarityCache.size / this.maxCacheSize).toFixed(2),
        semantic: (this.semanticCache.size / this.maxCacheSize).toFixed(2)
      },
      extractionStats: {
        totalExtractions: this.extractionStats.totalExtractions,
        avgExtractionTime: Math.round(this.extractionStats.performanceMetrics.avgExtractionTime)
      },
      lastCheck: new Date().toISOString()
    };
  }
}

export default ExtractionEngine;
