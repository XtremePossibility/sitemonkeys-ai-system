// memory_system/extraction_engine.js
// PRODUCTION VERSION: Full database integration with exact schema matching
// Sophisticated algorithms with real PostgreSQL queries

class ExtractionEngine {
  constructor() {
    // Advanced caching system
    this.extractionCache = new Map();
    this.semanticCache = new Map();
    this.queryCache = new Map();
    this.maxCacheSize = 1000;
    
    // Performance analytics
    this.extractionStats = {
      totalExtractions: 0,
      avgExtractionTime: 0,
      avgTokensExtracted: 0,
      cacheHitRate: 0,
      cacheHits: 0,
      cacheMisses: 0,
      categoryDistribution: new Map(),
      lastReset: Date.now()
    };

    // Advanced semantic patterns
    this.intentPatterns = {
      memory_recall: {
        patterns: [
          /\b(remember|recall|told you|mentioned|discussed|said before|talked about)\b/i,
          /\b(you know|as I said|like I mentioned|previously discussed)\b/i
        ],
        weight: 0.9
      },
      information_request: {
        patterns: [
          /\b(what|how|when|where|why|who|which|tell me|show me|explain)\b/i,
          /\?/,
          /\b(can you|could you|would you|do you know)\b/i
        ],
        weight: 0.7
      },
      personal_sharing: {
        patterns: [
          /\b(my |our |i have|i own|we have|we own|i am|we are)\b/i,
          /\b(personal|private|family)\b/i
        ],
        weight: 0.8
      },
      problem_solving: {
        patterns: [
          /\b(problem|issue|trouble|difficulty|challenge|stuck|help|solve|fix)\b/i,
          /\b(how do i|how can i|what should i|need help)\b/i
        ],
        weight: 0.85
      },
      emotional_expression: {
        patterns: [
          /\b(feel|feeling|felt|emotion|emotional|mood)\b/i,
          /\b(happy|sad|angry|worried|excited|frustrated|anxious|stressed)\b/i
        ],
        weight: 0.75
      }
    };

    // Emotional weight mapping for sophisticated scoring
    this.emotionalWeights = new Map([
      ['stressed', 0.9], ['anxious', 0.85], ['worried', 0.8], ['frustrated', 0.75],
      ['angry', 0.8], ['sad', 0.75], ['depressed', 0.9], ['overwhelmed', 0.85],
      ['happy', 0.6], ['excited', 0.6], ['proud', 0.5], ['confident', 0.4],
      ['confused', 0.5], ['uncertain', 0.6], ['determined', 0.4]
    ]);

    // Advanced stop words for meaningful text extraction
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'
    ]);
  }

  /**
   * MAIN EXTRACTION METHOD - Production-ready with full database integration
   */
  async extractRelevantMemories(userId, query, routing, client) {
    if (!userId || !query || !client) {
      console.error('[EXTRACTION] Missing required parameters');
      return [];
    }

    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      console.log(`[EXTRACTION] Starting extraction for user: ${userId}, query: "${query.substring(0, 50)}..."`);

      // Advanced semantic analysis
      const semanticAnalysis = await this.performAdvancedSemanticAnalysis(normalizedQuery);
      
      // Get primary category memories with sophisticated querying
      const primaryMemories = await this.extractFromPrimaryCategory(
        userId, normalizedQuery, routing, client, semanticAnalysis
      );

      // Get related category memories if needed
      const relatedMemories = await this.extractFromRelatedCategories(
        userId, normalizedQuery, routing, client, semanticAnalysis, primaryMemories.length
      );

      // Combine and apply sophisticated scoring
      const allMemories = [...primaryMemories, ...relatedMemories];
      const scoredMemories = await this.applySophisticatedScoring(
        allMemories, normalizedQuery, semanticAnalysis, routing
      );

      // Apply intelligent ranking and token management
      const rankedMemories = this.applyIntelligentRanking(scoredMemories, semanticAnalysis);
      const finalMemories = await this.applyIntelligentTokenManagement(
        rankedMemories, 2400, client
      );

      // Update analytics
      await this.updateExtractionAnalytics(finalMemories, routing, Date.now() - startTime);

      console.log(`[EXTRACTION] Completed: ${finalMemories.length} memories, ${this.calculateTotalTokens(finalMemories)} tokens, ${Date.now() - startTime}ms`);

      return finalMemories;

    } catch (error) {
      console.error('[EXTRACTION] Critical error in extraction:', error);
      // Log for debugging but don't fail completely
      await this.logExtractionError(error, userId, query);
      return [];
    }
  }

  /**
   * ADVANCED SEMANTIC ANALYSIS - Enhanced NLP processing
   */
  async performAdvancedSemanticAnalysis(query) {
    const cacheKey = `semantic_${query.substring(0, 100)}`;
    if (this.semanticCache.has(cacheKey)) {
      return this.semanticCache.get(cacheKey);
    }

    const analysis = {
      intent: 'general',
      confidence: 0.5,
      emotionalWeight: 0,
      emotionalTone: 'neutral',
      personalContext: false,
      memoryReference: false,
      urgencyLevel: 0,
      timeContext: 'general',
      topicEntities: new Set(),
      keywordDensity: 0,
      complexityScore: 0
    };

    try {
      // Intent classification with confidence scoring
      let maxIntentScore = 0;
      for (const [intentType, config] of Object.entries(this.intentPatterns)) {
        let score = 0;
        for (const pattern of config.patterns) {
          if (pattern.test(query)) {
            score = config.weight;
            break;
          }
        }
        if (score > maxIntentScore) {
          maxIntentScore = score;
          analysis.intent = intentType;
          analysis.confidence = score;
        }
      }

      // Advanced emotional analysis
      let maxEmotionalWeight = 0;
      let detectedEmotions = [];
      for (const [emotion, weight] of this.emotionalWeights) {
        if (query.includes(emotion)) {
          maxEmotionalWeight = Math.max(maxEmotionalWeight, weight);
          detectedEmotions.push(emotion);
        }
      }
      analysis.emotionalWeight = maxEmotionalWeight;
      analysis.emotionalTone = maxEmotionalWeight > 0.6 ? 'high' : maxEmotionalWeight > 0.3 ? 'moderate' : 'low';

      // Personal context detection
      analysis.personalContext = /\b(my|our|personal|private|family|i am|i have|we are|we have)\b/i.test(query);

      // Memory reference detection
      analysis.memoryReference = /\b(remember|recall|told you|mentioned|discussed|said before|talked about)\b/i.test(query);

      // Urgency detection
      analysis.urgencyLevel = /\b(urgent|emergency|asap|immediately|critical|important|now|today)\b/i.test(query) ? 0.8 : 0.0;

      // Time context analysis
      if (/\b(now|today|currently|right now|at the moment)\b/i.test(query)) {
        analysis.timeContext = 'immediate';
      } else if (/\b(this week|soon|upcoming|lately|recently)\b/i.test(query)) {
        analysis.timeContext = 'recent';
      } else if (/\b(future|someday|eventually|long-term|planning)\b/i.test(query)) {
        analysis.timeContext = 'future';
      }

      // Topic entity extraction
      const topicPatterns = [
        ['health', /\b(health|medical|doctor|symptom|pain|fitness|exercise|diet)\b/gi],
        ['work', /\b(work|job|career|business|office|meeting|project)\b/gi],
        ['family', /\b(family|spouse|children|parents|relationship|marriage)\b/gi],
        ['money', /\b(money|financial|budget|income|debt|investment|savings)\b/gi],
        ['home', /\b(home|house|apartment|living|lifestyle)\b/gi]
      ];

      for (const [topic, pattern] of topicPatterns) {
        const matches = query.match(pattern);
        if (matches && matches.length > 0) {
          analysis.topicEntities.add(topic);
        }
      }

      // Keyword density and complexity analysis
      const words = query.split(/\s+/).filter(word => word.length > 2);
      const meaningfulWords = words.filter(word => !this.stopWords.has(word.toLowerCase()));
      analysis.keywordDensity = meaningfulWords.length / Math.max(words.length, 1);
      analysis.complexityScore = Math.min(meaningfulWords.length / 10, 1);

      // Cache the analysis
      if (this.semanticCache.size >= this.maxCacheSize) {
        const firstKey = this.semanticCache.keys().next().value;
        this.semanticCache.delete(firstKey);
      }
      this.semanticCache.set(cacheKey, analysis);

      return analysis;

    } catch (error) {
      console.error('[EXTRACTION] Error in semantic analysis:', error);
      return analysis;
    }
  }

  /**
   * EXTRACT FROM PRIMARY CATEGORY - Real database queries
   */
  async extractFromPrimaryCategory(userId, query, routing, client, semanticAnalysis) {
    try {
      const primaryCategory = routing.primaryCategory || 'personal_life_interests';
      console.log(`[EXTRACTION] Extracting from primary category: ${primaryCategory}`);

      // Dynamic query building based on semantic analysis
      let baseQuery = `
        SELECT id, user_id, category_name, subcategory_name, content, token_count, 
               relevance_score, usage_frequency, created_at, last_accessed, metadata
        FROM persistent_memories 
        WHERE user_id = $1 AND category_name = $2
      `;
      
      let queryParams = [userId, primaryCategory];
      let paramIndex = 3;

      // Add semantic filters
      if (semanticAnalysis.emotionalWeight > 0.5) {
        baseQuery += ` AND (content ILIKE $${paramIndex} OR metadata->>'emotional_content' = 'true')`;
        queryParams.push(`%${semanticAnalysis.emotionalTone}%`);
        paramIndex++;
      }

      if (semanticAnalysis.personalContext) {
        baseQuery += ` AND (content ILIKE $${paramIndex} OR content ILIKE $${paramIndex + 1})`;
        queryParams.push('%my %', '%personal%');
        paramIndex += 2;
      }

      if (semanticAnalysis.urgencyLevel > 0.5) {
        baseQuery += ` AND (metadata->>'urgent' = 'true' OR content ILIKE $${paramIndex})`;
        queryParams.push('%urgent%');
        paramIndex++;
      }

      // Advanced ordering
      baseQuery += `
        ORDER BY 
          CASE WHEN usage_frequency > 5 THEN relevance_score + 0.2 ELSE relevance_score END DESC,
          CASE WHEN last_accessed > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END DESC,
          created_at DESC
        LIMIT 15
      `;

      const result = await client.query(baseQuery, queryParams);
      
      console.log(`[EXTRACTION] Retrieved ${result.rows.length} memories from primary category`);
      return result.rows;

    } catch (error) {
      console.error('[EXTRACTION] Error extracting from primary category:', error);
      return [];
    }
  }

  /**
   * EXTRACT FROM RELATED CATEGORIES - Intelligent category expansion
   */
  async extractFromRelatedCategories(userId, query, routing, client, semanticAnalysis, primaryCount) {
    if (primaryCount >= 10) {
      return []; // Skip if we have enough from primary
    }

    try {
      const relatedCategories = this.getRelatedCategories(routing.primaryCategory);
      const relatedMemories = [];

      for (const relatedCategory of relatedCategories.slice(0, 2)) { // Limit to top 2 related
        console.log(`[EXTRACTION] Extracting from related category: ${relatedCategory}`);

        const query_text = `
          SELECT id, user_id, category_name, subcategory_name, content, token_count, 
                 relevance_score, usage_frequency, created_at, last_accessed, metadata
          FROM persistent_memories 
          WHERE user_id = $1 AND category_name = $2
          ORDER BY relevance_score DESC, created_at DESC
          LIMIT 5
        `;

        const result = await client.query(query_text, [userId, relatedCategory]);
        relatedMemories.push(...result.rows);
      }

      console.log(`[EXTRACTION] Retrieved ${relatedMemories.length} memories from related categories`);
      return relatedMemories;

    } catch (error) {
      console.error('[EXTRACTION] Error extracting from related categories:', error);
      return [];
    }
  }

  /**
   * SOPHISTICATED SCORING SYSTEM - Multi-factor relevance calculation
   */
  async applySophisticatedScoring(memories, query, semanticAnalysis, routing) {
    if (!memories || memories.length === 0) return [];

    console.log(`[EXTRACTION] Applying sophisticated scoring to ${memories.length} memories`);

    return memories.map(memory => {
      let score = memory.relevance_score || 0.5; // Start with database relevance
      const scoringFactors = {};

      // Factor 1: Advanced text similarity (35% weight)
      const textSimilarity = this.calculateAdvancedTextSimilarity(memory.content, query);
      score += textSimilarity * 0.35;
      scoringFactors.textSimilarity = textSimilarity;

      // Factor 2: Semantic intent alignment (25% weight)
      const intentAlignment = this.calculateIntentAlignment(memory, semanticAnalysis);
      score += intentAlignment * 0.25;
      scoringFactors.intentAlignment = intentAlignment;

      // Factor 3: Emotional context matching (20% weight)
      const emotionalMatch = this.calculateEmotionalContextMatch(memory, semanticAnalysis);
      score += emotionalMatch * 0.20;
      scoringFactors.emotionalMatch = emotionalMatch;

      // Factor 4: Recency and usage boost (15% weight)
      const recencyUsageScore = this.calculateRecencyUsageScore(memory);
      score += recencyUsageScore * 0.15;
      scoringFactors.recencyUsageScore = recencyUsageScore;

      // Factor 5: Category confidence boost (5% weight)
      const categoryBoost = memory.category_name === routing.primaryCategory ? 
        routing.confidence * 0.05 : 0.02;
      score += categoryBoost;
      scoringFactors.categoryBoost = categoryBoost;

      // Special boosts
      if (semanticAnalysis.memoryReference && memory.content.toLowerCase().includes('remember')) {
        score += 0.1;
        scoringFactors.memoryReferenceBoost = 0.1;
      }

      if (semanticAnalysis.urgencyLevel > 0.5 && memory.metadata?.urgent) {
        score += 0.15;
        scoringFactors.urgencyBoost = 0.15;
      }

      const finalScore = Math.max(0.1, Math.min(score, 1.0));

      return {
        ...memory,
        sophisticatedScore: finalScore,
        scoringBreakdown: scoringFactors,
        originalRelevance: memory.relevance_score
      };
    });
  }

  /**
   * ADVANCED TEXT SIMILARITY - Multi-algorithm approach
   */
  calculateAdvancedTextSimilarity(memoryContent, query) {
    if (!memoryContent || !query) return 0;

    const memoryWords = this.extractMeaningfulWords(memoryContent.toLowerCase());
    const queryWords = this.extractMeaningfulWords(query.toLowerCase());

    if (memoryWords.length === 0 || queryWords.length === 0) return 0;

    // Jaccard similarity
    const memorySet = new Set(memoryWords);
    const querySet = new Set(queryWords);
    const intersection = new Set([...querySet].filter(x => memorySet.has(x)));
    const union = new Set([...memoryWords, ...queryWords]);
    const jaccardSimilarity = intersection.size / union.size;

    // Cosine similarity approximation
    let dotProduct = 0;
    for (const word of intersection) {
      dotProduct += 1; // Simple binary weighting
    }
    const cosineSimilarity = dotProduct / Math.sqrt(memoryWords.length * queryWords.length);

    // Substring match bonus
    const substringBonus = memoryContent.toLowerCase().includes(query.toLowerCase()) ? 0.3 : 0;

    // Combined similarity with weighting
    return (jaccardSimilarity * 0.4) + (cosineSimilarity * 0.4) + (substringBonus * 0.2);
  }

  /**
   * INTENT ALIGNMENT calculation
   */
  calculateIntentAlignment(memory, semanticAnalysis) {
    const content = memory.content.toLowerCase();
    
    const alignmentScores = {
      memory_recall: 0.9, // High relevance for memory queries
      personal_sharing: 0.7, // Good for personal context
      problem_solving: 0.8, // High for problem-solving
      emotional_expression: 0.6, // Medium for emotional queries
      information_request: 0.5 // Standard for info requests
    };

    let baseScore = alignmentScores[semanticAnalysis.intent] || 0.4;

    // Content-based alignment boosts
    if (semanticAnalysis.intent === 'memory_recall' && content.includes('remember')) {
      baseScore += 0.2;
    }

    if (semanticAnalysis.intent === 'problem_solving' && 
        (content.includes('solution') || content.includes('fix') || content.includes('resolve'))) {
      baseScore += 0.2;
    }

    if (semanticAnalysis.personalContext && 
        (content.includes('my ') || content.includes('personal'))) {
      baseScore += 0.15;
    }

    return Math.min(baseScore, 1.0);
  }

  /**
   * EMOTIONAL CONTEXT MATCHING
   */
  calculateEmotionalContextMatch(memory, semanticAnalysis) {
    if (semanticAnalysis.emotionalWeight === 0) return 0.5; // Neutral baseline

    const memoryContent = memory.content.toLowerCase();
    let memoryEmotionalWeight = 0;

    // Detect emotional content in memory
    for (const [emotion, weight] of this.emotionalWeights) {
      if (memoryContent.includes(emotion)) {
        memoryEmotionalWeight = Math.max(memoryEmotionalWeight, weight);
      }
    }

    // Check metadata for emotional flags
    if (memory.metadata?.emotional_content === 'true') {
      memoryEmotionalWeight = Math.max(memoryEmotionalWeight, 0.6);
    }

    // Calculate alignment
    if (semanticAnalysis.emotionalWeight > 0.5 && memoryEmotionalWeight > 0.5) {
      return 0.9; // Both highly emotional
    } else if (semanticAnalysis.emotionalWeight > 0.3 && memoryEmotionalWeight > 0.3) {
      return 0.7; // Both moderately emotional
    } else if (Math.abs(semanticAnalysis.emotionalWeight - memoryEmotionalWeight) < 0.2) {
      return 0.6; // Similar emotional levels
    }

    return 0.3; // Different emotional contexts
  }

  /**
   * RECENCY AND USAGE SCORING
   */
  calculateRecencyUsageScore(memory) {
    let score = 0;

    // Recency scoring
    try {
      const now = new Date();
      const createdDate = new Date(memory.created_at);
      const lastAccessedDate = new Date(memory.last_accessed || memory.created_at);
      
      const ageInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
      const lastAccessDays = (now - lastAccessedDate) / (1000 * 60 * 60 * 24);

      // Creation recency
      if (ageInDays < 1) score += 0.4;
      else if (ageInDays < 7) score += 0.3;
      else if (ageInDays < 30) score += 0.2;
      else if (ageInDays < 90) score += 0.1;

      // Access recency
      if (lastAccessDays < 1) score += 0.3;
      else if (lastAccessDays < 7) score += 0.2;
      else if (lastAccessDays < 30) score += 0.1;

    } catch (error) {
      // Date parsing error, use minimal score
      score = 0.1;
    }

    // Usage frequency boost
    const usageFreq = memory.usage_frequency || 0;
    if (usageFreq > 10) score += 0.3;
    else if (usageFreq > 5) score += 0.2;
    else if (usageFreq > 2) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * MEANINGFUL WORDS extraction with advanced filtering
   */
  extractMeaningfulWords(text) {
    if (!text) return [];

    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !this.stopWords.has(word.toLowerCase()) &&
        !/^\d+$/.test(word) // Remove pure numbers
      )
      .map(word => word.toLowerCase());
  }

  /**
   * INTELLIGENT RANKING with multi-criteria sorting
   */
  applyIntelligentRanking(memories, semanticAnalysis) {
    return memories.sort((a, b) => {
      // Primary sort by sophisticated score
      const scoreDiff = b.sophisticatedScore - a.sophisticatedScore;
      if (Math.abs(scoreDiff) > 0.05) { // Significant score difference
        return scoreDiff;
      }

      // Secondary sort by usage frequency for similar scores
      const usageDiff = (b.usage_frequency || 0) - (a.usage_frequency || 0);
      if (Math.abs(usageDiff) > 2) {
        return usageDiff;
      }

      // Tertiary sort by recency
      const aTime = new Date(a.last_accessed || a.created_at).getTime();
      const bTime = new Date(b.last_accessed || b.created_at).getTime();
      return bTime - aTime;
    });
  }

  /**
   * INTELLIGENT TOKEN MANAGEMENT with content preservation
   */
  async applyIntelligentTokenManagement(memories, tokenLimit, client) {
    if (!memories || memories.length === 0) return [];

    let totalTokens = 0;
    const result = [];
    const highValueReserve = Math.floor(tokenLimit * 0.15); // Reserve 15% for high-value content

    // First pass: Add memories within main budget
    const mainBudget = tokenLimit - highValueReserve;
    for (const memory of memories) {
      const tokenCount = memory.token_count || Math.ceil(memory.content.length / 4);
      
      if (totalTokens + tokenCount <= mainBudget) {
        result.push(memory);
        totalTokens += tokenCount;
        
        // Update access tracking
        await this.updateMemoryAccess(client, memory.id);
      } else {
        break;
      }
    }

    // Second pass: Use reserve for high-value content
    const remainingMemories = memories.slice(result.length);
    const highValueMemories = remainingMemories.filter(m => m.sophisticatedScore > 0.8);

    for (const memory of highValueMemories) {
      const tokenCount = memory.token_count || Math.ceil(memory.content.length / 4);
      const availableReserve = tokenLimit - totalTokens;
      
      if (tokenCount <= availableReserve) {
        result.push(memory);
        totalTokens += tokenCount;
        await this.updateMemoryAccess(client, memory.id);
      } else if (availableReserve > 100) {
        // Try intelligent truncation for high-value content
        const truncated = this.performIntelligentTruncation(memory, availableReserve);
        if (truncated) {
          result.push(truncated);
          totalTokens += truncated.token_count;
          await this.updateMemoryAccess(client, memory.id);
          break;
        }
      }
    }

    console.log(`[EXTRACTION] Final selection: ${result.length} memories, ${totalTokens} tokens`);
    return result;
  }

  /**
   * INTELLIGENT TRUNCATION preserving meaning
   */
  performIntelligentTruncation(memory, tokenBudget) {
    const content = memory.content || '';
    const charBudget = Math.floor(tokenBudget * 4);

    if (content.length <= charBudget) return memory;

    try {
      // Try to preserve sentence boundaries
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      let truncatedContent = '';

      for (const sentence of sentences) {
        if (truncatedContent.length + sentence.length <= charBudget - 10) {
          truncatedContent += sentence;
        } else {
          break;
        }
      }

      // If no complete sentences fit, do word-level truncation
      if (truncatedContent.length < 50 && charBudget > 50) {
        const words = content.split(/\s+/);
        truncatedContent = '';
        
        for (const word of words) {
          if (truncatedContent.length + word.length + 1 <= charBudget - 10) {
            truncatedContent += (truncatedContent ? ' ' : '') + word;
          } else {
            break;
          }
        }
        truncatedContent += '...';
      }

      return {
        ...memory,
        content: truncatedContent,
        token_count: tokenBudget,
        truncated: true,
        truncation_method: 'intelligent'
      };

    } catch (error) {
      console.error('[EXTRACTION] Error in intelligent truncation:', error);
      return null;
    }
  }

  /**
   * UPDATE MEMORY ACCESS tracking
   */
  async updateMemoryAccess(client, memoryId) {
    try {
      await client.query(
        'UPDATE persistent_memories SET usage_frequency = usage_frequency + 1, last_accessed = NOW() WHERE id = $1',
        [memoryId]
      );
    } catch (error) {
      // Non-critical error, don't fail extraction
      console.warn('[EXTRACTION] Failed to update memory access:', error.message);
    }
  }

  /**
   * RELATED CATEGORIES mapping
   */
  getRelatedCategories(primaryCategory) {
    const categoryRelations = {
      'mental_emotional': ['health_wellness', 'relationships_social', 'personal_life_interests'],
      'health_wellness': ['mental_emotional', 'daily_routines_habits', 'personal_life_interests'],
      'relationships_social': ['mental_emotional', 'personal_life_interests', 'goals_active_current'],
      'work_career': ['money_income_debt', 'goals_active_current', 'mental_emotional'],
      'money_income_debt': ['work_career', 'money_spending_goals', 'goals_active_current'],
      'money_spending_goals': ['money_income_debt', 'goals_active_current', 'personal_life_interests'],
      'goals_active_current': ['goals_future_dreams', 'work_career', 'personal_life_interests'],
      'goals_future_dreams': ['goals_active_current', 'work_career', 'personal_life_interests'],
      'tools_tech_workflow': ['work_career', 'daily_routines_habits', 'goals_active_current'],
      'daily_routines_habits': ['health_wellness', 'personal_life_interests', 'mental_emotional'],
      'personal_life_interests': ['relationships_social', 'health_wellness', 'mental_emotional']
    };

    return categoryRelations[primaryCategory] || [];
  }

  /**
   * UTILITY METHODS
   */
  calculateTotalTokens(memories) {
    return memories.reduce((sum, memory) => sum + (memory.token_count || 0), 0);
  }

  /**
   * ANALYTICS AND PERFORMANCE TRACKING
   */
  async updateExtractionAnalytics(memories, routing, processingTime) {
    try {
      this.extractionStats.totalExtractions++;
      
      // Update average extraction time
      const count = this.extractionStats.totalExtractions;
      const currentAvgTime = this.extractionStats.avgExtractionTime;
      this.extractionStats.avgExtractionTime = ((currentAvgTime * (count - 1)) + processingTime) / count;

      // Update average tokens extracted
      const totalTokens = this.calculateTotalTokens(memories);
      const currentAvgTokens = this.extractionStats.avgTokensExtracted;
      this.extractionStats.avgTokensExtracted = ((currentAvgTokens * (count - 1)) + totalTokens) / count;

      // Update category distribution
      if (routing?.primaryCategory) {
        const category = routing.primaryCategory;
        const current = this.extractionStats.categoryDistribution.get(category) || 0;
        this.extractionStats.categoryDistribution.set(category, current + 1);
      }

      // Update cache hit rate
      const totalRequests = this.extractionStats.cacheHits + this.extractionStats.cacheMisses;
      this.extractionStats.cacheHitRate = totalRequests > 0 ? 
        this.extractionStats.cacheHits / totalRequests : 0;

    } catch (error) {
      console.warn('[EXTRACTION] Error updating analytics:', error);
    }
  }

  async logExtractionError(error, userId, query) {
    console.error('[EXTRACTION] Error details:', {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      userId: userId?.substring(0, 8) + '***',
      query: query?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
  }

  getExtractionStats() {
    return {
      ...this.extractionStats,
      categoryDistribution: Object.fromEntries(this.extractionStats.categoryDistribution),
      uptime: Date.now() - this.extractionStats.lastReset,
      cacheSize: this.extractionCache.size
    };
  }

  cleanup() {
    this.extractionCache.clear();
    this.semanticCache.clear();
    this.queryCache.clear();
    console.log('[EXTRACTION] All caches cleared');
  }
}

export { ExtractionEngine };
