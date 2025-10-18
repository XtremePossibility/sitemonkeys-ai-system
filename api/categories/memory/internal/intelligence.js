/**
 * SiteMonkeys AI Proprietary Module
 * Copyright © 2025 SiteMonkeys AI. All rights reserved.
 * 
 * This file contains proprietary innovations and algorithms.
 * Unauthorized use, copying, or distribution is strictly prohibited.
 */

// ================================================================
// intelligence.js - Unified Intelligence Processing Engine
// Consolidates routing_intelligence.js + extraction_engine.js + intelligence from deleted files
// ================================================================

import coreSystem from './core.js';

class IntelligenceSystem {
  constructor() {
    this.coreSystem = coreSystem;
    this.isInitialized = false;
    
    // ================================================================
    // UNIFIED SEMANTIC ANALYSIS ENGINE
    // ================================================================
    
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
      },
      decision_making: {
        patterns: [
          /\b(should i|which|decision|decide|choice|choose|option|options)\b/i,
          /\b(thinking about|considering|wondering if|unsure)\b/i
        ],
        weight: 0.7
      }
    };

    // ================================================================
    // ADVANCED CATEGORY ROUTING SYSTEM
    // ================================================================
    
    this.categoryMappings = new Map([
      ['mental_emotional', {
        keywords: new Set([
          'stress', 'stressed', 'anxious', 'anxiety', 'worried', 'worry', 'feel', 'feeling', 'felt',
          'emotion', 'emotional', 'mood', 'mental', 'psychology', 'therapy', 'counseling',
          'identity', 'self-talk', 'mindset', 'attitude', 'perspective', 'overwhelmed',
          'depressed', 'depression', 'bipolar', 'panic', 'fear', 'confidence', 'self-esteem'
        ]),
        patterns: [
          /\b(i feel|feeling|stressed|worried|anxious|emotional|mood|mental health|self-talk|overwhelmed)\b/i,
          /\b(therapy|counseling|psychology|mindset|attitude|perspective|identity)\b/i,
          /\b(depressed|depression|panic|fear|confidence|self-esteem|self-worth)\b/i
        ],
        weight: 1.0,
        priority: 'high'
      }],

      ['health_wellness', {
        keywords: new Set([
          'health', 'healthy', 'medical', 'doctor', 'physician', 'symptom', 'symptoms', 'pain',
          'illness', 'sick', 'disease', 'medication', 'medicine', 'treatment', 'diagnosis',
          'fitness', 'exercise', 'workout', 'gym', 'diet', 'nutrition', 'food', 'eating',
          'sleep', 'sleeping', 'tired', 'fatigue', 'energy', 'hospital', 'clinic'
        ]),
        patterns: [
          /\b(health|medical|doctor|symptom|pain|illness|medication|fitness|exercise)\b/i,
          /\b(diet|nutrition|sleep|energy|hospital|clinic|treatment|diagnosis)\b/i,
          /\b(workout|gym|physical|body|weight|wellness)\b/i
        ],
        weight: 1.0,
        priority: 'high'
      }],

      ['relationships_social', {
        keywords: new Set([
          'family', 'spouse', 'husband', 'wife', 'partner', 'relationship', 'marriage', 'married',
          'boyfriend', 'girlfriend', 'children', 'child', 'kids', 'son', 'daughter', 'parents',
          'mother', 'father', 'mom', 'dad', 'friend', 'friends', 'social', 'friendship',
          'colleague', 'coworker', 'conflict', 'argument', 'communication', 'love', 'dating',
          'divorce', 'breakup', 'reunion', 'pets', 'pet', 'dog', 'cat'
        ]),
        patterns: [
          /\b(family|spouse|husband|wife|partner|relationship|marriage|children|kids)\b/i,
          /\b(parents|mother|father|mom|dad|friend|social|dating|love)\b/i,
          /\b(conflict|argument|communication|divorce|breakup|pets|pet)\b/i
        ],
        weight: 1.0,
        priority: 'high'
      }],

      ['work_career', {
        keywords: new Set([
          'work', 'working', 'job', 'career', 'profession', 'business', 'company', 'corporation',
          'office', 'workplace', 'project', 'meeting', 'boss', 'manager', 'supervisor',
          'employee', 'colleague', 'coworker', 'team', 'department', 'salary', 'wage', 'pay',
          'promotion', 'performance', 'deadline', 'client', 'customer', 'interview'
        ]),
        patterns: [
          /\b(work|job|career|business|company|office|project|meeting|boss)\b/i,
          /\b(employee|colleague|team|salary|promotion|performance|deadline|client)\b/i,
          /\b(interview|workplace|profession|manager|supervisor)\b/i
        ],
        weight: 1.0,
        priority: 'medium'
      }],

      ['money_income_debt', {
        keywords: new Set([
          'income', 'salary', 'wage', 'pay', 'paycheck', 'earnings', 'debt', 'loan', 'loans',
          'credit', 'mortgage', 'payment', 'payments', 'bill', 'bills', 'owe', 'owing',
          'financial crisis', 'money problems', 'broke', 'bankruptcy', 'foreclosure'
        ]),
        patterns: [
          /\b(income|salary|wage|pay|paycheck|earnings|debt|loan|credit)\b/i,
          /\b(mortgage|payment|bill|owe|financial crisis|money problems|broke)\b/i,
          /\b(bankruptcy|foreclosure|financial trouble)\b/i
        ],
        weight: 1.0,
        priority: 'high'
      }],

      ['money_spending_goals', {
        keywords: new Set([
          'budget', 'budgeting', 'spending', 'spend', 'purchase', 'buy', 'buying', 'savings',
          'save', 'saving', 'financial goals', 'investment', 'investing', 'stocks', 'portfolio',
          'retirement', 'wealth', 'money management', 'financial planning', 'emergency fund'
        ]),
        patterns: [
          /\b(budget|spending|purchase|buy|savings|save|financial goals|investment)\b/i,
          /\b(investing|stocks|portfolio|retirement|wealth|money management)\b/i,
          /\b(financial planning|emergency fund|budgeting)\b/i
        ],
        weight: 1.0,
        priority: 'medium'
      }],

      ['goals_active_current', {
        keywords: new Set([
          'goal', 'goals', 'current goal', 'objective', 'target', 'aim', 'working on',
          'trying to', 'project', 'task', 'deadline', 'this week', 'this month',
          'priority', 'focus', 'achievement', 'accomplish', 'complete', 'finish'
        ]),
        patterns: [
          /\b(goal|goals|current goal|objective|target|working on|trying to)\b/i,
          /\b(this week|this month|priority|focus|achievement|accomplish)\b/i,
          /\b(complete|finish|deadline|task|project)\b/i
        ],
        weight: 1.0,
        priority: 'medium'
      }],

      ['goals_future_dreams', {
        keywords: new Set([
          'dream', 'dreams', 'someday', 'future', 'long-term', 'vision', 'aspiration',
          'aspirations', 'bucket list', 'hope', 'wish', 'want to', 'plan to',
          'eventually', 'retirement', 'legacy', 'life goals', 'ambition'
        ]),
        patterns: [
          /\b(dream|someday|future|long-term|vision|aspiration|bucket list)\b/i,
          /\b(hope|wish|want to|plan to|eventually|retirement|legacy)\b/i,
          /\b(life goals|ambition|life dream|future plan)\b/i
        ],
        weight: 1.0,
        priority: 'low'
      }],

      ['tools_tech_workflow', {
        keywords: new Set([
          'software', 'app', 'application', 'tool', 'tools', 'technology', 'tech', 'system',
          'platform', 'website', 'digital', 'online', 'computer', 'laptop', 'phone',
          'workflow', 'process', 'automation', 'productivity', 'efficiency', 'program'
        ]),
        patterns: [
          /\b(software|app|tool|technology|system|platform|website|digital)\b/i,
          /\b(computer|laptop|phone|workflow|automation|productivity|efficiency)\b/i,
          /\b(program|application|online|process)\b/i
        ],
        weight: 1.0,
        priority: 'low'
      }],

      ['daily_routines_habits', {
        keywords: new Set([
          'routine', 'routines', 'habit', 'habits', 'daily', 'morning', 'evening', 'night',
          'schedule', 'consistency', 'regular', 'every day', 'weekly', 'pattern',
          'ritual', 'practice', 'discipline', 'structure', 'organization'
        ]),
        patterns: [
          /\b(routine|habit|daily|morning|evening|schedule|consistency)\b/i,
          /\b(regular|every day|weekly|pattern|ritual|practice|discipline)\b/i,
          /\b(structure|organization|time management)\b/i
        ],
        weight: 1.0,
        priority: 'medium'
      }],

      ['personal_life_interests', {
        keywords: new Set([
          'home', 'house', 'apartment', 'living', 'lifestyle', 'personal', 'hobby', 'hobbies',
          'interest', 'interests', 'entertainment', 'fun', 'leisure', 'gaming', 'games',
          'creative', 'art', 'music', 'reading', 'books', 'movies', 'tv', 'travel',
          'vacation', 'sports', 'cooking', 'food', 'garden', 'gardening'
        ]),
        patterns: [
          /\b(home|house|apartment|lifestyle|hobby|interest|entertainment|fun)\b/i,
          /\b(gaming|creative|art|music|reading|movies|travel|vacation|sports)\b/i,
          /\b(cooking|garden|personal|leisure|activity)\b/i
        ],
        weight: 1.0,
        priority: 'low'
      }]
    ]);

    // ================================================================
    // ADVANCED CACHING ARCHITECTURE
    // ================================================================
    
    this.semanticCache = new Map();
    this.routingCache = new Map();
    this.extractionCache = new Map();
    this.maxCacheSize = 1000;
    this.routingCache.clear();
    this.semanticCache.clear();

    // ================================================================
    // PERFORMANCE ANALYTICS
    // ================================================================
    
    this.routingStats = {
        totalRoutes: 0,
        categoryDistribution: new Map(),
        avgConfidence: 0,
        avgProcessingTime: 0,
        highConfidenceRoutes: 0,
        lowConfidenceRoutes: 0,
        overrideApplications: 0,
        semanticOverrides: 0,        // ADD THIS LINE
        semanticDominantRoutes: 0,   // ADD THIS LINE  
        keywordFallbacks: 0,         // ADD THIS LINE
        confidenceDistribution: { high: 0, medium: 0, low: 0 }, // ADD THIS LINE
        cacheHitRate: 0,
        cacheHits: 0,
        cacheMisses: 0,
        lastReset: Date.now()
    };

    this.extractionStats = {
      totalExtractions: 0,
      avgExtractionTime: 0,
      avgTokensExtracted: 0,
      categoryDistribution: new Map(),
      lastReset: Date.now()
    };

    // ================================================================
    // EMOTIONAL ANALYSIS SYSTEM
    // ================================================================
    
    this.emotionalWeights = new Map([
      ['stressed', 0.9], ['anxious', 0.85], ['worried', 0.8], ['frustrated', 0.75],
      ['angry', 0.8], ['sad', 0.75], ['depressed', 0.9], ['overwhelmed', 0.85],
      ['happy', 0.6], ['excited', 0.6], ['proud', 0.5], ['confident', 0.4],
      ['confused', 0.5], ['uncertain', 0.6], ['determined', 0.4]
    ]);

    // ================================================================
    // STOP WORDS FOR MEANINGFUL TEXT EXTRACTION
    // ================================================================
    
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'
    ]);

    this.logger = {
      log: (message) => console.log(`[INTELLIGENCE] ${new Date().toISOString()} ${message}`),
      error: (message, error) => console.error(`[INTELLIGENCE ERROR] ${new Date().toISOString()} ${message}`, error),
      warn: (message) => console.warn(`[INTELLIGENCE WARN] ${new Date().toISOString()} ${message}`)
    };
  }

  async initialize() {
    this.logger.log('Initializing Intelligence System...');
    this.isInitialized = true;
    this.logger.log('Intelligence System initialized successfully');
    return true;
  }

  // ================================================================
  // MAIN ROUTING METHOD - analyzeAndRoute
  // ================================================================

  async analyzeAndRoute(query, userId) {
    if (!query || typeof query !== 'string') {
      return this.createFallbackRoutingResult('Invalid query input');
    }

    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      this.logger.log(`Processing query: "${query.substring(0, 50)}..."`);

      // Check cache first
      const cacheKey = this.generateCacheKey(normalizedQuery, userId);
      if (this.routingCache.has(cacheKey)) {
        this.routingStats.cacheHits++;
        const cached = this.routingCache.get(cacheKey);
        this.logger.log(`Cache hit: ${cached.primaryCategory}`);
        return cached;
      }

      this.routingStats.cacheMisses++;

      // Advanced semantic analysis
      const semanticAnalysis = await this.performAdvancedSemanticAnalysis(normalizedQuery);

      // Calculate category scores
      const categoryScores = await this.calculateAdvancedCategoryScores(
        normalizedQuery, semanticAnalysis, userId
      );

      // Determine best category with confidence metrics
      const routingResult = this.determineBestCategoryWithConfidence(
        categoryScores, semanticAnalysis, normalizedQuery
      );

      // Apply sophisticated override logic
      const finalResult = await this.applySophisticatedOverrides(
        routingResult, normalizedQuery, semanticAnalysis, userId
      );

      // Add dynamic subcategory
      finalResult.subcategory = this.selectSubcategory(
        finalResult.primaryCategory, normalizedQuery, semanticAnalysis
      );

      // Cache result
      this.cacheResult(cacheKey, finalResult);

      // Update analytics
      this.updateRoutingAnalytics(finalResult, Date.now() - startTime);

      // Enhanced semantic-aware logging
      const semanticInfo = {
        intent: semanticAnalysis.intent,
        personalContext: semanticAnalysis.personalContext,
        emotionalWeight: semanticAnalysis.emotionalWeight.toFixed(2),
        semanticOverride: finalResult.semanticOverride || false
      };
      
      this.logger.log(`SEMANTIC ROUTING: ${finalResult.primaryCategory}/${finalResult.subcategory} 
        | Confidence: ${finalResult.confidence.toFixed(3)}
        | Intent: ${semanticInfo.intent}
        | Personal: ${semanticInfo.personalContext}
        | Emotional: ${semanticInfo.emotionalWeight}
        | Override: ${semanticInfo.semanticOverride}
        | Time: ${Date.now() - startTime}ms`);
      
      // Update confidence distribution tracking
      if (finalResult.confidence > 0.8) {
        this.routingStats.confidenceDistribution.high++;
      } else if (finalResult.confidence > 0.5) {
        this.routingStats.confidenceDistribution.medium++;
      } else {
        this.routingStats.confidenceDistribution.low++;
      }

      return finalResult;

    } catch (error) {
      this.logger.error('Critical error in routing:', error);
      return this.createFallbackRoutingResult('Routing error occurred');
    }
  }

  // ================================================================
  // ADVANCED SEMANTIC ANALYSIS
  // ================================================================

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
      for (const [emotion, weight] of this.emotionalWeights) {
        if (query.includes(emotion)) {
          maxEmotionalWeight = Math.max(maxEmotionalWeight, weight);
        }
      }
      analysis.emotionalWeight = maxEmotionalWeight;
      analysis.emotionalTone = maxEmotionalWeight > 0.6 ? 'high' : maxEmotionalWeight > 0.3 ? 'moderate' : 'low';

      // Context detection
      analysis.personalContext = /\b(my|our|personal|private|family|i am|i have|we are|we have)\b/i.test(query);
      analysis.memoryReference = /\b(remember|recall|told you|mentioned|discussed|said before|talked about)\b/i.test(query);
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
      this.cacheSemanticResult(cacheKey, analysis);

      return analysis;

    } catch (error) {
      this.logger.error('Error in semantic analysis:', error);
      return analysis;
    }
  }

  // ================================================================
  // CATEGORY SCORING SYSTEM
  // ================================================================

  async calculateAdvancedCategoryScores(query, semanticAnalysis, userId) {
    const scores = new Map();
  
    for (const [categoryName, config] of this.categoryMappings) {
      let score = 0;
  
      // SEMANTIC-FIRST: Calculate primary semantic score
      const semanticScore = this.calculateSemanticBoost(categoryName, semanticAnalysis);
      score += semanticScore * 8.0; // PRIMARY DRIVER: 8x amplification
  
      // REDUCED: Keyword hints (reduced from 2.0x to 0.3x)
      let keywordMatches = 0;
      for (const keyword of config.keywords) {
        if (query.includes(keyword)) {
          keywordMatches++;
          score += 0.3 * config.weight; // REDUCED from 2.0
        }
      }
  
      // REDUCED: Pattern hints (reduced from 3.5x to 0.5x)
      for (const pattern of config.patterns) {
        if (pattern.test(query)) {
          score += 0.5 * config.weight; // REDUCED from 3.5
        }
      }
  
      // Entity alignment boost (unchanged)
      score += this.calculateEntityAlignmentBoost(categoryName, semanticAnalysis);
  
      // Priority-based weighting (unchanged)
      if (config.priority === 'high' && semanticAnalysis.urgencyLevel > 0.5) {
        score += 1.0;
      }
  
      // Keyword density bonus (reduced)
      if (keywordMatches > 1) {
        score += Math.min(keywordMatches * 0.2, 1.0); // REDUCED from 0.5, 2.0
      }
  
      // SEMANTIC OVERRIDE: Apply intelligent overrides
      const semanticOverride = this.applySemanticOverride(categoryName, semanticAnalysis, score);
      if (semanticOverride.override) {
        score = semanticOverride.newScore;
        // Track override for analytics
        this.routingStats.semanticOverrides = (this.routingStats.semanticOverrides || 0) + 1;
      }
  
      // Conditional boosting for personal memory queries
      if (semanticAnalysis.personalContext === true && semanticAnalysis.intent === 'memory_recall') {
        if (categoryName === 'relationships_social') {
          score *= 1.5; // 50% boost when personal + memory_recall
        }
        if (categoryName === 'mental_emotional') {
          score *= 0.85; // 15% reduction to prevent false routing
        }
      }
  
      scores.set(categoryName, Math.max(score, 0));
    }

  return scores;
  }

  // ================================================================
  // SEMANTIC OVERRIDE INTELLIGENCE
  // ================================================================
  
  applySemanticOverride(categoryName, semanticAnalysis, currentScore) {
    // HIGH-CONFIDENCE PERSONAL CONTEXT OVERRIDE
    if (semanticAnalysis.personalContext && 
        semanticAnalysis.emotionalWeight > 0.6 && 
        (semanticAnalysis.intent === 'personal_sharing' || semanticAnalysis.intent === 'memory_recall')) {
      
      const personalCategories = ['personal_life_interests', 'relationships_social', 'mental_emotional'];
      
      if (personalCategories.includes(categoryName)) {
        // BOOST personal categories dramatically
        return {
          override: true,
          newScore: 10.0 + (semanticAnalysis.emotionalWeight * 5.0),
          reason: 'High-confidence personal context boost applied'
        };
      } else {
        // SUPPRESS non-personal categories when personal context is strong
        return {
          override: true,
          newScore: Math.min(currentScore * 0.2, 1.0),
          reason: 'Personal context suppression applied to non-personal category'
        };
      }
    }
  
    // EMOTIONAL EXPRESSION OVERRIDE
    if (semanticAnalysis.intent === 'emotional_expression' && 
        semanticAnalysis.emotionalWeight > 0.7) {
      
      if (categoryName === 'mental_emotional') {
        return {
          override: true,
          newScore: 12.0 + (semanticAnalysis.emotionalWeight * 3.0),
          reason: 'High emotional expression routed to mental_emotional'
        };
      }
    }
  
    // MEMORY RECALL OVERRIDE
    if (semanticAnalysis.intent === 'memory_recall' && 
        semanticAnalysis.memoryReference) {
      
      const memoryCategories = ['mental_emotional', 'relationships_social', 'personal_life_interests'];
      
      if (memoryCategories.includes(categoryName)) {
        return {
          override: true,
          newScore: currentScore + 5.0,
          reason: 'Memory recall boost applied to relevant category'
        };
      }
    }
  
    return { override: false };
  }

  calculateSemanticBoost(categoryName, semanticAnalysis) {
    let boost = 0;
  
    // AMPLIFIED: Intent-based boosting (5-7x increase)
    const intentBoosts = {
      memory_recall: {
        'relationships_social': 3.5, 'personal_life_interests': 2.8, 'mental_emotional': 2.0
      },
      personal_sharing: {
        'personal_life_interests': 4.0, 'relationships_social': 3.0, 'mental_emotional': 2.5
      },
      problem_solving: {
        'work_career': 3.0, 'health_wellness': 2.5, 'mental_emotional': 2.5, 'tools_tech_workflow': 2.0
      },
      emotional_expression: {
        'mental_emotional': 5.0, 'relationships_social': 2.5, 'health_wellness': 2.0
      },
      decision_making: {
        'goals_active_current': 3.0, 'work_career': 2.0, 'money_spending_goals': 2.0
      },
      information_request: {
        'tools_tech_workflow': 2.0, 'health_wellness': 1.5, 'work_career': 1.5
      },
      general: {
        'personal_life_interests': 1.0, 'daily_routines_habits': 0.8
      }
    };
  
    const categoryBoost = intentBoosts[semanticAnalysis.intent]?.[categoryName] || 0;
    boost += categoryBoost;
  
    // AMPLIFIED: Emotional weight boosting (4x increase)
    if (semanticAnalysis.emotionalWeight > 0.6) {
      const emotionalBoosts = {
        'mental_emotional': 4.0,    // was 1.0
        'relationships_social': 2.0, // was 0.5
        'health_wellness': 1.8,     // was 0.4
        'work_career': 1.5          // was 0.3
      };
      boost += (emotionalBoosts[categoryName] || 0) * semanticAnalysis.emotionalWeight;
    }

  // ENHANCED: Personal context amplification
  if (semanticAnalysis.personalContext) {
    const personalBoosts = {
      'personal_life_interests': 2.0,
      'relationships_social': 1.5,
      'mental_emotional': 1.2,
      'daily_routines_habits': 1.0
    };
    boost += (personalBoosts[categoryName] || 0);
  }

  return boost;
}
  calculateEntityAlignmentBoost(categoryName, semanticAnalysis) {
    const entityAlignments = {
      health: { 'health_wellness': 1.0, 'mental_emotional': 0.4 },
      work: { 'work_career': 1.0, 'goals_active_current': 0.3, 'tools_tech_workflow': 0.4 },
      family: { 'relationships_social': 1.0, 'mental_emotional': 0.3, 'personal_life_interests': 0.3 },
      money: { 'money_income_debt': 0.8, 'money_spending_goals': 0.8, 'work_career': 0.4 },
      home: { 'personal_life_interests': 0.8, 'daily_routines_habits': 0.5, 'health_wellness': 0.3 }
    };

    let boost = 0;
    for (const entityType of semanticAnalysis.topicEntities) {
      boost += entityAlignments[entityType]?.[categoryName] || 0;
    }

    return boost;
  }

  // ================================================================
  // CATEGORY DETERMINATION & CONFIDENCE
  // ================================================================

  determineBestCategoryWithConfidence(categoryScores, semanticAnalysis, query) {
    const sortedCategories = Array.from(categoryScores.entries())
      .sort(([,a], [,b]) => b - a);

    if (sortedCategories.length === 0) {
      return {
        primaryCategory: 'personal_life_interests',
        confidence: 0.3,
        alternativeCategory: null,
        reasoning: 'No category scores calculated'
      };
    }

    const [bestCategory, bestScore] = sortedCategories[0];
    const [secondCategory, secondScore] = sortedCategories[1] || ['', 0];

    // Advanced confidence calculation
    let confidence = Math.min(bestScore / 12.0, 0.6);

    // Score separation bonus
    const separation = bestScore - secondScore;
    confidence += Math.min(separation / 8.0, 0.2);

    // Semantic analysis confidence boost
    confidence += semanticAnalysis.confidence * 0.1;

    // Clear winner bonus
    if (bestScore > secondScore * 1.5) {
      confidence += 0.1;
    }

    // Multiple indicators bonus
    if (semanticAnalysis.topicEntities.size > 0) {
      confidence += Math.min(semanticAnalysis.topicEntities.size * 0.05, 0.1);
    }

    return {
      primaryCategory: bestCategory,
      confidence: Math.max(0.2, Math.min(confidence, 1.0)),
      alternativeCategory: secondCategory,
      scores: {
        primary: bestScore,
        secondary: secondScore
      },
      reasoning: `Primary: ${bestCategory} (${bestScore.toFixed(1)}) vs Secondary: ${secondCategory} (${secondScore.toFixed(1)})`
    };
  }

  // ================================================================
  // SOPHISTICATED OVERRIDES
  // ================================================================

  async applySophisticatedOverrides(routingResult, query, semanticAnalysis, userId) {
    let { primaryCategory, confidence } = routingResult;
    let reasoning = routingResult.reasoning;
    let overrideApplied = false;

    // High-urgency health override
    if (semanticAnalysis.urgencyLevel > 0.7 && 
        (query.includes('pain') || query.includes('emergency') || query.includes('hospital'))) {
      if (primaryCategory !== 'health_wellness') {
        primaryCategory = 'health_wellness';
        confidence = Math.max(confidence, 0.9);
        reasoning += '; Health emergency override applied';
        overrideApplied = true;
      }
    }

    // Mental health crisis override
    if (semanticAnalysis.emotionalWeight > 0.8 && 
        (query.includes('crisis') || query.includes('suicide') || query.includes('can\'t take it'))) {
      if (primaryCategory !== 'mental_emotional') {
        primaryCategory = 'mental_emotional';
        confidence = Math.max(confidence, 0.95);
        reasoning += '; Mental health crisis override applied';
        overrideApplied = true;
      }
    }

    // Financial crisis override
    if ((query.includes('broke') || query.includes('bankruptcy') || query.includes('can\'t pay')) &&
        !primaryCategory.startsWith('money_')) {
      primaryCategory = 'money_income_debt';
      confidence = Math.max(confidence, 0.85);
      reasoning += '; Financial crisis override applied';
      overrideApplied = true;
    }

    // Low confidence fallback enhancement
    if (confidence < 0.4 && !overrideApplied) {
      if (semanticAnalysis.personalContext && semanticAnalysis.emotionalWeight > 0.3) {
        primaryCategory = 'mental_emotional';
        confidence = 0.5;
        reasoning += '; Low confidence personal-emotional fallback applied';
        overrideApplied = true;
      }
    }

    // Personal relationship memory recall override
    if (semanticAnalysis.personalContext === true && 
        semanticAnalysis.intent === 'memory_recall' &&
        (query.includes('wife') || query.includes('family') || query.includes('husband') || 
         query.includes('pet') || query.includes('friend') || query.includes('monkey'))) {
      primaryCategory = 'relationships_social';
      confidence = Math.max(confidence, 0.8);
      reasoning += '; Personal memory recall override applied';
      overrideApplied = true;
    }

    if (overrideApplied) {
      this.routingStats.overrideApplications++;
    }

    return {
      ...routingResult,
      primaryCategory,
      confidence,
      reasoning,
      overrideApplied,
      semanticAnalysis: {
        intent: semanticAnalysis.intent,
        emotionalWeight: semanticAnalysis.emotionalWeight,
        personalContext: semanticAnalysis.personalContext,
        urgencyLevel: semanticAnalysis.urgencyLevel
      }
    };
  }

  // ================================================================
  // DYNAMIC SUBCATEGORY SELECTION
  // ================================================================

  selectSubcategory(primaryCategory, query, semanticAnalysis) {
    const categorySubcategoryLogic = {
      'mental_emotional': () => {
        if (semanticAnalysis.emotionalWeight > 0.7) return 'High Emotional';
        if (query.includes('therapy') || query.includes('counseling')) return 'Professional Support';
        if (query.includes('stress') || query.includes('overwhelmed')) return 'Stress Management';
        if (query.includes('confidence') || query.includes('self-esteem')) return 'Self-Worth';
        return 'General Emotional';
      },
      'health_wellness': () => {
        if (query.includes('doctor') || query.includes('medical')) return 'Medical Care';
        if (query.includes('exercise') || query.includes('fitness')) return 'Physical Activity';
        if (query.includes('diet') || query.includes('nutrition')) return 'Nutrition';
        if (query.includes('sleep') || query.includes('tired')) return 'Sleep Health';
        return 'General Health';
      },
      'relationships_social': () => {
        if (query.includes('family') || query.includes('parents')) return 'Family Relations';
        if (query.includes('partner') || query.includes('spouse')) return 'Romantic Relations';
        if (query.includes('friend') || query.includes('social')) return 'Social Circle';
        if (query.includes('work') && query.includes('colleague')) return 'Professional Relations';
        return 'General Social';
      },
      'work_career': () => {
        if (query.includes('project') || query.includes('task')) return 'Current Projects';
        if (query.includes('promotion') || query.includes('career')) return 'Career Development';
        if (query.includes('team') || query.includes('colleague')) return 'Team Dynamics';
        if (query.includes('interview') || query.includes('job search')) return 'Job Search';
        return 'General Work';
      },
      'money_income_debt': () => {
        if (query.includes('debt') || query.includes('loan')) return 'Debt Management';
        if (query.includes('salary') || query.includes('income')) return 'Income Issues';
        if (query.includes('bill') || query.includes('payment')) return 'Payment Obligations';
        return 'Financial Pressure';
      },
      'money_spending_goals': () => {
        if (query.includes('budget') || query.includes('spending')) return 'Budget Planning';
        if (query.includes('investment') || query.includes('stocks')) return 'Investment Strategy';
        if (query.includes('save') || query.includes('savings')) return 'Savings Goals';
        if (query.includes('retirement')) return 'Retirement Planning';
        return 'Financial Goals';
      },
      'goals_active_current': () => {
        if (semanticAnalysis.timeContext === 'immediate') return 'Immediate Goals';
        if (query.includes('this week') || query.includes('this month')) return 'Short-term Goals';
        if (query.includes('project') || query.includes('task')) return 'Project Goals';
        return 'Current Focus';
      },
      'goals_future_dreams': () => {
        if (query.includes('dream') || query.includes('vision')) return 'Life Dreams';
        if (query.includes('retirement') || query.includes('legacy')) return 'Long-term Vision';
        if (query.includes('travel') || query.includes('bucket list')) return 'Experience Goals';
        return 'Future Aspirations';
      },
      'tools_tech_workflow': () => {
        if (query.includes('software') || query.includes('app')) return 'Software Tools';
        if (query.includes('workflow') || query.includes('productivity')) return 'Productivity Systems';
        if (query.includes('problem') || query.includes('not working')) return 'Tech Issues';
        return 'Digital Tools';
      },
      'daily_routines_habits': () => {
        if (query.includes('morning') || query.includes('evening')) return 'Daily Schedule';
        if (query.includes('habit') || query.includes('routine')) return 'Habit Formation';
        if (query.includes('consistency') || query.includes('discipline')) return 'Consistency Building';
        return 'Routine Management';
      },
      'personal_life_interests': () => {
        if (query.includes('hobby') || query.includes('interest')) return 'Personal Interests';
        if (query.includes('home') || query.includes('house')) return 'Home Life';
        if (query.includes('entertainment') || query.includes('fun')) return 'Entertainment';
        if (query.includes('travel') || query.includes('vacation')) return 'Travel Experiences';
        return 'Lifestyle';
      }
    };

    const subcategoryFunction = categorySubcategoryLogic[primaryCategory];
    return subcategoryFunction ? subcategoryFunction() : 'General';
  }

  // ================================================================
  // MEMORY EXTRACTION ENGINE - extractRelevantMemories
  // ================================================================

  async extractRelevantMemories(userId, query, routing) {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting extraction for user: ${userId}, query: "${query.substring(0, 50)}..."`);

      // Get semantic analysis (reuse from routing if available)
      const semanticAnalysis = routing.semanticAnalysis || 
        await this.performAdvancedSemanticAnalysis(query.toLowerCase());
      
      // STEP 1: Primary category extraction (existing logic)
      const primaryMemories = await this.extractFromPrimaryCategory(
        userId, query, routing, semanticAnalysis
      );

      // STEP 2: Score primary memories for similarity
      const scoredPrimary = primaryMemories.map(memory => ({
        ...memory,
        similarityScore: this.calculateContentSimilarity(query, memory.content),
        source: 'primary_category'
      }));

      // STEP 3: If primary results are poor, try related categories
      let allMemories = scoredPrimary;
      
      const goodPrimaryResults = scoredPrimary.filter(m => m.similarityScore > 0.3).length;
      if (goodPrimaryResults < 2) {
        this.logger.log('Primary category yielded few relevant results, trying related categories...');
        const relatedMemories = await this.tryRelatedCategories(userId, query, routing, semanticAnalysis);
        allMemories = [...scoredPrimary, ...relatedMemories];
      }

      // STEP 4: Re-rank by similarity score
      const rankedMemories = this.rerankBySimilarity(allMemories, query);

      // STEP 5: Apply token management (existing logic)
      const finalMemories = await this.applyIntelligentTokenManagement(rankedMemories, 2400);

      // Update analytics
      this.updateExtractionAnalytics(finalMemories, routing, Date.now() - startTime);

      this.logger.log(`Enhanced extraction: ${finalMemories.length} memories, ${this.calculateTotalTokens(finalMemories)} tokens, ${Date.now() - startTime}ms`);

      return finalMemories;

    } catch (error) {
      this.logger.error('Critical error in enhanced extraction:', error);
      await this.coreSystem.logExtractionError(error, { userId, query: query.substring(0, 100) });
      return [];
    }
  }

  async extractFromPrimaryCategory(userId, query, routing, semanticAnalysis) {
  try {
    const primaryCategory = routing.primaryCategory || 'personal_life_interests';
    this.logger.log(`Extracting from primary category: ${primaryCategory}`);

    return await this.coreSystem.withDbClient(async (client) => {
      // SIMPLIFIED INTELLIGENT QUERY - MAIN TABLE ONLY
      let baseQuery = `
        SELECT id, user_id, category_name, subcategory_name, content, token_count, 
               relevance_score, usage_frequency, created_at, last_accessed, metadata,
               CASE 
                 -- HIGHEST PRIORITY: Informational content (answers with facts)
                 WHEN content ILIKE '%wife%' OR content ILIKE '%spouse%' OR content ILIKE '%partner%' THEN relevance_score + 1.2
                 WHEN content::text ~ '\\b(i have|i own|my \\w+|i work|i live)\\b'  
                 AND content::text ~ '\\b[A-Z][a-z]+\\b' THEN relevance_score + 1.0
                 
                 -- HIGH PRIORITY: Content with specific details (names, numbers)  
                 WHEN content::text ~* '\\b[A-Z][a-z]+\\b.*\\b[A-Z][a-z]+\\b|\\d+' 
                      AND NOT content::text ~* '\\b(do you remember|what did i tell|can you recall)\\b' 
                      THEN relevance_score + 0.7
                 
                 -- MEDIUM PRIORITY: Mixed content (questions with information)
                 WHEN content::text ~* '\\b(i have|i own|my \\w+\\s+(is|are|was))\\b' 
                      THEN relevance_score + 0.4
                 
                 -- HEAVY PENALTY: Pure questions without information
                 WHEN content::text ~* '\\b(do you remember|what did i tell|can you recall|remember anything)\\b' 
                      AND NOT content::text ~* '\\b(i have|i own|my \\w+\\s+(is|are|was))\\b' 
                      THEN relevance_score - 0.6
                 
                 -- ZERO SCORE: AI failure responses
                 WHEN content::text ~* 'no specific mention|no recorded details|I don''t have any|no mention of' 
                      THEN 0
                 
                 ELSE relevance_score
               END as content_intelligence_score
        FROM persistent_memories 
        WHERE user_id = $1 AND category_name = $2 AND relevance_score > 0
      `;
      
      let queryParams = [userId, primaryCategory];
      let paramIndex = 3;

      // TOPIC-AWARE FILTERING - Fixed parameter index synchronization
      const queryNouns = this.extractImportantNouns(query.toLowerCase());
      if (queryNouns.length > 0) {
        // Build topic filter with correct parameter indexing
        const startIndex = paramIndex;
        const topicFilters = queryNouns.map((noun, i) => `content::text ILIKE $${startIndex + i}::text`).join(' OR ');
        baseQuery += ` AND (${topicFilters})`;
        queryParams.push(...queryNouns.map(noun => `%${noun}%`));
        paramIndex += queryNouns.length; // Increment AFTER adding parameters
      }
      
      // Add your existing semantic filters with synchronized indexing
      if (semanticAnalysis.emotionalWeight > 0.5) {
        baseQuery += ` AND (content::text ILIKE $${paramIndex}::text OR metadata->>'emotional_content' = 'true')`;
        queryParams.push(`%${semanticAnalysis.emotionalTone}%`);
        paramIndex++; // Increment after adding 1 parameter
      }
      
      if (semanticAnalysis.personalContext) {
        baseQuery += ` AND (content::text ILIKE $${paramIndex}::text OR content::text ILIKE $${paramIndex + 1}::text)`;
        queryParams.push('%my %', '%personal%');
        paramIndex += 2; // Increment after adding 2 parameters
      }

      // FILTER OUT PURE QUESTION MEMORIES
      baseQuery += ` AND NOT (
        content::text ~* '\\b(remember anything|do you remember|what did i tell|can you recall)\\b' 
        AND NOT content::text ~* '\\b(i have|i own|my \\w+\\s+(is|are|was)|name is|work at|live in)\\b'
      )`;

      // INTELLIGENT CONTENT-FIRST ORDERING WITH QUESTION FILTERING
      baseQuery += `
        ORDER BY 
          content_intelligence_score DESC,
          -- BOOST: Informational statements with facts
          CASE WHEN content::text ~* '\\b(i have|i own|my \\w+\\s+(is|are|was))\\b' 
               AND NOT content::text ~* '\\b(remember|recall|did i tell|what did)\\b' THEN 3 ELSE 0 END DESC,
          -- BOOST: Content with proper nouns and numbers  
          CASE WHEN content::text ~* '\\b[A-Z][a-z]+\\b|\\d+' 
               AND NOT content::text ~* '\\b(remember|recall|did i tell|what did)\\b' THEN 2 ELSE 0 END DESC,
          -- PENALTY: Pure questions without informational content
          CASE WHEN content::text ~* '\\b(remember|recall|did i tell|what did)\\b' 
               AND NOT content::text ~* '\\b(i have|i own|my \\w+\\s+(is|are|was))\\b' THEN -2 ELSE 0 END DESC,
          relevance_score DESC,
          created_at DESC
        LIMIT 20
      `;

      this.logger.log(`SQL Debug: Query has ${(baseQuery.match(/\$/g) || []).length} placeholders, ${queryParams.length} parameters`);
      const result = await client.query(baseQuery, queryParams);
      
      this.logger.log(`Retrieved ${result.rows.length} memories with intelligent content ordering`);
      
      return result.rows;
    });

  } catch (error) {
    this.logger.error('Error extracting from primary category:', error);
    return [];
  }
}

  async extractFromRelatedCategories(userId, query, routing, semanticAnalysis, primaryCount) {
    if (primaryCount >= 10) {
      return []; // Skip if we have enough from primary
    }

    try {
      const relatedCategories = await this.coreSystem.getRelatedCategories(routing.primaryCategory);
      const relatedMemories = [];

      for (const relatedCategory of relatedCategories.slice(0, 2)) {
        this.logger.log(`Extracting from related category: ${relatedCategory}`);

        const memories = await this.coreSystem.withDbClient(async (client) => {
          const query_text = `
            SELECT id, user_id, category_name, subcategory_name, content, token_count, 
                   relevance_score, usage_frequency, created_at, last_accessed, metadata
            FROM persistent_memories 
            WHERE user_id = $1 AND category_name = $2
            AND NOT (
              content::text ~* '\\b(remember anything|do you remember|what did i tell|can you recall)\\b' 
              AND NOT content::text ~* '\\b(i have|i own|my \\w+\\s+(is|are|was)|name is|work at|live in)\\b'
            )
            ORDER BY relevance_score DESC, created_at DESC
            LIMIT 5
          `;
      
                const result = await client.query(query_text, [userId, relatedCategory]);
                return result.rows;
        });

        relatedMemories.push(...memories);
      }

      this.logger.log(`Retrieved ${relatedMemories.length} memories from related categories`);
      return relatedMemories;

    } catch (error) {
      this.logger.error('Error extracting from related categories:', error);
      return [];
    }
  }

  // ================================================================
  // SOPHISTICATED SCORING SYSTEM
  // ================================================================

  async applySophisticatedScoring(memories, query, semanticAnalysis, routing) {
  if (!memories || memories.length === 0) return [];

  this.logger.log(`Applying intelligent semantic scoring to ${memories.length} memories`);

  return memories.map(memory => {
    const contentType = this.classifyContentType(memory.content);
    
    // Immediate exclusion of AI failures
    if (contentType === 'ai_failure') {
      memory.sophisticatedScore = 0;
      return memory;
    }

    // CORE SEMANTIC INTELLIGENCE - Does this memory actually address what the user is asking about?
    const topicRelevance = this.calculateTopicRelevance(memory.content, query);
    
    // If topic relevance is very low, don't include this memory regardless of other factors
    if (topicRelevance < 0.15) {
      memory.sophisticatedScore = 0.1;
      return memory;
    }

    // Build score based on semantic relevance first
    let score = topicRelevance * 0.8; // Topic relevance is primary factor
    
    // Information density boost
    const informationDensity = this.calculateInformationDensity(memory.content);
    score += informationDensity * 0.2;
    
    // Recency and usage
    const recencyUsageScore = this.calculateRecencyUsageScore(memory);
    score += recencyUsageScore * 0.1;

    memory.sophisticatedScore = Math.min(score, 2.0);
    return memory;
  });
}

calculateTopicRelevance(memoryContent, query) {
  const memoryLower = memoryContent.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Extract the core topic from the query
  const queryTopic = this.extractCoreTopic(queryLower);
  const memoryTopic = this.extractCoreTopic(memoryLower);
  
  // If we can identify clear topics and they don't match, low relevance
  if (queryTopic && memoryTopic && queryTopic !== memoryTopic) {
    return 0.1;
  }
  
  // Look for direct conceptual matches
  const queryNouns = this.extractImportantNouns(queryLower);
  const memoryNouns = this.extractImportantNouns(memoryLower);
  
  let conceptOverlap = 0;
  for (const queryNoun of queryNouns) {
    for (const memoryNoun of memoryNouns) {
      if (queryNoun === memoryNoun) {
        conceptOverlap += 1.0;
      } else if (this.areConceptsRelated(queryNoun, memoryNoun)) {
        conceptOverlap += 0.5;
      }
    }
  }
  
  const topicScore = queryNouns.length > 0 ? conceptOverlap / queryNouns.length : 0.5;
  
  // Boost for exact phrase matches
  if (memoryLower.includes(queryLower)) {
    return Math.min(topicScore + 0.4, 1.0);
  }
  
  return Math.min(topicScore, 1.0);
}

extractCoreTopic(text) {
  if (text.includes('video game') || text.includes('gaming') || text.includes('franchise')) return 'videogames';
  if (text.includes('monkey') || text.includes('pet') || text.includes('animal')) return 'pets';
  if (text.includes('vehicle') || text.includes('car') || text.includes('drive') || text.includes('truck')) return 'vehicles';
  if (text.includes('superhero') || text.includes('comic') || text.includes('marvel') || text.includes('hero')) return 'superheroes';
  return null;
}

extractImportantNouns(text) {
  const words = text.split(/\s+/);
  return words.filter(word => 
    word.length > 3 && 
    !this.stopWords.has(word) &&
    /^[a-zA-Z]+$/.test(word)
  );
}

areConceptsRelated(concept1, concept2) {
  // Simple conceptual relationships
  const relationships = [
    ['vehicle', 'truck'], ['vehicle', 'car'], ['car', 'drive'],
    ['monkey', 'pet'], ['pet', 'animal'],
    ['game', 'gaming'], ['franchise', 'series']
  ];
  
  return relationships.some(([a, b]) => 
    (concept1.includes(a) && concept2.includes(b)) ||
    (concept1.includes(b) && concept2.includes(a))
  );
}

  calculateAdvancedTextSimilarity(memoryContent, query) {
  if (!memoryContent || !query) return 0;

  const memoryLower = memoryContent.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact phrase matching gets highest priority
  if (memoryLower.includes(queryLower)) {
    return 0.9;
  }

  // Extract key nouns and context
  const memoryWords = this.extractMeaningfulWords(memoryLower);
  const queryWords = this.extractMeaningfulWords(queryLower);
  
  if (memoryWords.length === 0 || queryWords.length === 0) return 0;

  // Find semantic overlap - words that actually relate to the same concept
  let semanticMatches = 0;
  let totalQueryConcepts = 0;
  
  for (const queryWord of queryWords) {
    totalQueryConcepts++;
    
    // Direct word match
    if (memoryWords.includes(queryWord)) {
      semanticMatches += 1.0;
      continue;
    }
    
    // Contextual relationship - if query word appears near matched concepts
    for (const memoryWord of memoryWords) {
      if (this.areWordsContextuallyRelated(queryWord, memoryWord, memoryLower, queryLower)) {
        semanticMatches += 0.5;
        break;
      }
    }
  }
  
  // Penalize if query has specific concepts that memory doesn't address
  const conceptMismatch = this.detectConceptMismatch(queryWords, memoryWords);
  
  const semanticScore = semanticMatches / Math.max(totalQueryConcepts, 1);
  return Math.max(0, semanticScore - conceptMismatch);
}

areWordsContextuallyRelated(word1, word2, memoryText, queryText) {
  // Simple contextual understanding without predefined rules
  const word1Context = this.getWordContext(word1, queryText);
  const word2Context = this.getWordContext(word2, memoryText);
  
  // If both words appear in similar sentence structures, they might be related
  return word1Context.length > 2 && word2Context.length > 2 && 
         word1Context.some(w => word2Context.includes(w));
}

getWordContext(word, text) {
  const words = text.split(/\s+/);
  const wordIndex = words.indexOf(word);
  if (wordIndex === -1) return [];
  
  const start = Math.max(0, wordIndex - 2);
  const end = Math.min(words.length, wordIndex + 3);
  return words.slice(start, end);
}

detectConceptMismatch(queryWords, memoryWords) {
  // If query has very specific terms that memory completely lacks
  const specificQueryTerms = queryWords.filter(w => w.length > 4);
  const hasAnySpecificMatch = specificQueryTerms.some(term => 
    memoryWords.some(mw => mw.includes(term) || term.includes(mw))
  );
  
  return specificQueryTerms.length > 0 && !hasAnySpecificMatch ? 0.3 : 0;
}

  calculateIntentAlignment(memory, semanticAnalysis) {
    const content = memory.content.toLowerCase();
    
    const alignmentScores = {
      memory_recall: 0.9,
      personal_sharing: 0.7,
      problem_solving: 0.8,
      emotional_expression: 0.6,
      information_request: 0.5,
      decision_making: 0.6
    };

    let baseScore = alignmentScores[semanticAnalysis.intent] || 0.4;

    if (semanticAnalysis.intent === 'memory_recall' && content.includes('remember')) {
      baseScore += 0.2;
    }

    if (semanticAnalysis.personalContext && 
        (content.includes('my ') || content.includes('personal'))) {
      baseScore += 0.15;
    }

    return Math.min(baseScore, 1.0);
  }

  calculateEmotionalContextMatch(memory, semanticAnalysis) {
    if (semanticAnalysis.emotionalWeight === 0) return 0.5;

    const memoryContent = memory.content.toLowerCase();
    let memoryEmotionalWeight = 0;

    for (const [emotion, weight] of this.emotionalWeights) {
      if (memoryContent.includes(emotion)) {
        memoryEmotionalWeight = Math.max(memoryEmotionalWeight, weight);
      }
    }

    if (memory.metadata?.emotional_content === 'true') {
      memoryEmotionalWeight = Math.max(memoryEmotionalWeight, 0.6);
    }

    if (semanticAnalysis.emotionalWeight > 0.5 && memoryEmotionalWeight > 0.5) {
      return 0.9;
    } else if (semanticAnalysis.emotionalWeight > 0.3 && memoryEmotionalWeight > 0.3) {
      return 0.7;
    } else if (Math.abs(semanticAnalysis.emotionalWeight - memoryEmotionalWeight) < 0.2) {
      return 0.6;
    }

    return 0.3;
  }

  classifyContentType(content) {
    const questionPatterns = [
      /do you remember/i, /what did i tell you/i, /did i mention/i,
      /can you recall/i, /remember anything/i, /you remember/i
    ];
    
    const informationPatterns = [
      /my \w+ (is|are|was)/i, /i have \d+/i, /i drive a/i,
      /i own/i, /my name is/i, /i work at/i, /i live in/i
    ];
    
    const isQuestion = questionPatterns.some(pattern => pattern.test(content));
    const isInformation = informationPatterns.some(pattern => pattern.test(content));
    
    if (content.includes('Assistant:') && content.includes('no specific mention')) {
      return 'ai_failure';
    }
    
    if (isQuestion && !isInformation) return 'interrogative';
    if (isInformation && !isQuestion) return 'informational';
    return 'mixed';
  }

  calculateRecencyUsageScore(memory) {
    let score = 0;

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
      score = 0.1;
    }

    // Usage frequency boost
    const usageFreq = memory.usage_frequency || 0;
    if (usageFreq > 10) score += 0.3;
    else if (usageFreq > 5) score += 0.2;
    else if (usageFreq > 2) score += 0.1;

    return Math.min(score, 1.0);
  }

  calculateInformationDensity(content) {
    const properNouns = (content.match(/[A-Z][a-z]+/g) || []).length;
    const numbers = (content.match(/\d+/g) || []).length;
    const specificWords = ['named', 'called', 'drive', 'own', 'have', 'work', 'live', 'married', 'daughter', 'son'].filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    const totalWords = content.split(/\s+/).length;
    const density = (properNouns + numbers + specificWords) / Math.max(totalWords, 1);
    
    return Math.min(density * 2, 1.0); // Scale to 0-1 range
  }

  extractMeaningfulWords(text) {
    if (!text) return [];

    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !this.stopWords.has(word.toLowerCase()) &&
        !/^\d+$/.test(word)
      )
      .map(word => word.toLowerCase());
  }

  applyIntelligentRanking(memories, semanticAnalysis) {
    return memories.sort((a, b) => {
      // PRIORITY 1: Content intelligence score (if available from SQL)
      if (a.content_intelligence_score && b.content_intelligence_score) {
        const intelligenceDiff = b.content_intelligence_score - a.content_intelligence_score;
        if (Math.abs(intelligenceDiff) > 0.1) {
          return intelligenceDiff;
        }
      }
      
      // PRIORITY 2: Sophisticated score  
      const scoreDiff = b.sophisticatedScore - a.sophisticatedScore;
      if (Math.abs(scoreDiff) > 0.05) {
        return scoreDiff;
      }

      // PRIORITY 3: Content type classification
      const aContentType = this.classifyContentType(a.content);
      const bContentType = this.classifyContentType(b.content);
      
      const typeScores = { 'informational': 3, 'mixed': 2, 'interrogative': 1, 'ai_failure': 0 };
      const aTypeScore = typeScores[aContentType] || 0;
      const bTypeScore = typeScores[bContentType] || 0;
      
      if (aTypeScore !== bTypeScore) {
        return bTypeScore - aTypeScore;
      }

      // PRIORITY 4: Usage frequency (only if types are equal)
      const usageDiff = (b.usage_frequency || 0) - (a.usage_frequency || 0);
      if (Math.abs(usageDiff) > 2) {
        return usageDiff;
      }

      // FINAL: Recency
      const aTime = new Date(a.last_accessed || a.created_at).getTime();
      const bTime = new Date(b.last_accessed || b.created_at).getTime();
      return bTime - aTime;
    });
  }
  async applyIntelligentTokenManagement(memories, tokenLimit) {
    if (!memories || memories.length === 0) return [];

    let totalTokens = 0;
    const result = [];
    const highValueReserve = Math.floor(tokenLimit * 0.15);

    // First pass: Add memories within main budget
    const mainBudget = tokenLimit - highValueReserve;
    for (const memory of memories) {
      const tokenCount = memory.token_count || Math.ceil(memory.content.length / 4);
      
      if (totalTokens + tokenCount <= mainBudget) {
        result.push(memory);
        totalTokens += tokenCount;
        
        // Update access tracking
        await this.coreSystem.updateMemoryAccess(memory.id);
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
        await this.coreSystem.updateMemoryAccess(memory.id);
      }
    }

    // CRITICAL FIX: Enforce strict 2400 token budget
    let budgetUsed = 0;
    const tokenBudget = 2400;
    const enforcedMemories = [];
    
    for (const memory of result) {
      const tokens = memory.token_count || Math.ceil(memory.content.length / 4);
      if (budgetUsed + tokens <= tokenBudget) {
        enforcedMemories.push(memory);
        budgetUsed += tokens;
      } else {
        this.logger.warn(`Token budget reached. Excluding memory ${memory.id}`);
        break;
      }
    }
    
    this.logger.log(`Token enforcement: ${enforcedMemories.length}/${result.length} memories, ${budgetUsed}/${tokenBudget} tokens`);
    return enforcedMemories;
  }

  // ================================================================
  // RELEVANCE SCORE CALCULATION - calculateRelevanceScore
  // ================================================================

  async calculateRelevanceScore(content, metadata = {}) {
    try {
      let relevance = 0.5; // Base relevance

      // Emotional weight analysis
      let emotionalWeight = 0;
      for (const [emotion, weight] of this.emotionalWeights) {
        if (content.toLowerCase().includes(emotion)) {
          emotionalWeight = Math.max(emotionalWeight, weight);
        }
      }

      if (emotionalWeight > 0) {
        relevance += emotionalWeight * 0.2;
      }

      // Question detection
      if (content.includes('?')) {
        relevance += 0.1;
      }

      // Personal context detection
      if (/\b(my|our|personal|private|family|i am|i have|we are|we have)\b/i.test(content)) {
        relevance += 0.1;
      }

      // Metadata enhancements
      if (metadata.userMarkedImportant) {
        relevance += 0.2;
      }

      if (metadata.urgency === 'high') {
        relevance += 0.15;
      }

      if (metadata.emotional_content === 'true') {
        relevance += 0.1;
      }

      // Length consideration (longer content might be more detailed)
      const contentLength = content.length;
      if (contentLength > 200) {
        relevance += Math.min((contentLength - 200) / 1000, 0.1);
      }

      return Math.max(0.1, Math.min(relevance, 1.0));

    } catch (error) {
      this.logger.error('Error calculating relevance score:', error);
      return 0.5; // Default fallback
    }
  }

  // ================================================================
  // INTELLIGENCE-ENHANCED MEMORY EXTRACTION
  // ================================================================

  async extractIntelligentMemory(query, userId, intelligenceContext = null) {
    console.log('🧠 INTELLIGENT MEMORY: Enhanced extraction with reasoning context');
    
    try {
      // Standard memory extraction first
      const baseExtraction = await this.extractRelevantMemories(userId, query, { primaryCategory: 'personal_life_interests' });
      
      // Enhance with intelligence context if available
      const enhancedExtraction = {
        memories: baseExtraction,
        intelligenceEnhanced: true,
        reasoningSupport: [],
        crossDomainConnections: [],
        scenarioRelevantMemories: [],
        quantitativeContext: []
      };

      if (baseExtraction && baseExtraction.length > 0) {
        // Add reasoning support analysis
        enhancedExtraction.reasoningSupport = this.identifyReasoningSupportMemories(
          baseExtraction, query
        );

        // Find cross-domain memory connections
        enhancedExtraction.crossDomainConnections = await this.findCrossDomainMemoryConnections(
          baseExtraction, 'personal_life_interests'
        );

        // Extract scenario-relevant historical context
        enhancedExtraction.scenarioRelevantMemories = this.extractScenarioRelevantMemories(
          baseExtraction, query
        );

        // Identify quantitative/numerical context from memory
        enhancedExtraction.quantitativeContext = this.extractQuantitativeMemoryContext(
          baseExtraction
        );
      }

      // Intelligence-enhanced memory scoring
      if (intelligenceContext) {
        enhancedExtraction.memories = this.applyIntelligenceAwareScoring(
          enhancedExtraction.memories, intelligenceContext
        );
      }

      console.log(`🎯 Intelligent memory extraction complete. Enhanced features: ${Object.keys(enhancedExtraction).filter(k => enhancedExtraction[k] && enhancedExtraction[k].length > 0).join(', ')}`);

      return enhancedExtraction;

    } catch (error) {
      this.logger.error('Intelligent memory extraction error:', error);
      // Fallback to standard extraction
      return await this.extractRelevantMemories(userId, query, { primaryCategory: 'personal_life_interests' });
    }
  }

  // ================================================================
  // REASONING SUPPORT IDENTIFICATION
  // ================================================================

  identifyReasoningSupportMemories(memories, query) {
    const reasoningSupport = [];
    
    for (const memory of memories) {
      const support = {
        memory_id: memory.id,
        content: memory.content,
        supportType: 'general',
        relevanceToReasoning: 0.5
      };

      // Identify premise support
      if (this.supportsPremise(memory.content, query)) {
        support.supportType = 'premise';
        support.relevanceToReasoning = 0.8;
      }
      // Identify evidence support  
      else if (this.providesEvidence(memory.content, query)) {
        support.supportType = 'evidence';
        support.relevanceToReasoning = 0.9;
      }
      // Identify counterexample support
      else if (this.providesCounterexample(memory.content, query)) {
        support.supportType = 'counterexample';
        support.relevanceToReasoning = 0.7;
      }
      // Identify pattern support
      else if (this.establishesPattern(memory.content, query)) {
        support.supportType = 'pattern';
        support.relevanceToReasoning = 0.6;
      }

      if (support.relevanceToReasoning > 0.5) {
        reasoningSupport.push(support);
      }
    }

    return reasoningSupport.sort((a, b) => b.relevanceToReasoning - a.relevanceToReasoning);
  }

  // ================================================================
  // CROSS-DOMAIN MEMORY CONNECTIONS
  // ================================================================

  async findCrossDomainMemoryConnections(memories, primaryCategory) {
    const connections = [];
    const categoryMemoryMap = new Map();

    // Group memories by category
    for (const memory of memories) {
      if (!categoryMemoryMap.has(memory.category_name)) {
        categoryMemoryMap.set(memory.category_name, []);
      }
      categoryMemoryMap.get(memory.category_name).push(memory);
    }

    // Find meaningful cross-category connections
    const categories = Array.from(categoryMemoryMap.keys());
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const connection = this.analyzeCategoryConnection(
          categories[i], categories[j], 
          categoryMemoryMap.get(categories[i]), 
          categoryMemoryMap.get(categories[j])
        );
        
        if (connection.strength > 0.6) {
          connections.push(connection);
        }
      }
    }

    return connections;
  }

  analyzeCategoryConnection(category1, category2, memories1, memories2) {
    const connectionPatterns = {
      'work_career-money_income_debt': { strength: 0.9, relationship: 'Career decisions directly impact financial stability' },
      'health_wellness-work_career': { strength: 0.8, relationship: 'Health affects work performance and career decisions' },
      'relationships_social-mental_emotional': { strength: 0.9, relationship: 'Social relationships strongly influence emotional wellbeing' },
      'business-legal': { strength: 0.8, relationship: 'Business decisions require legal compliance consideration' },
      'personal_life_interests-goals_active_current': { strength: 0.7, relationship: 'Personal interests influence goal setting and priorities' }
    };

    const key1 = `${category1}-${category2}`;
    const key2 = `${category2}-${category1}`;
    const pattern = connectionPatterns[key1] || connectionPatterns[key2];

    if (pattern) {
      return {
        from: category1,
        to: category2,
        strength: pattern.strength,
        relationship: pattern.relationship,
        supportingMemories: {
          category1: memories1.slice(0, 2),
          category2: memories2.slice(0, 2)
        }
      };
    }

    // Default weak connection
    return {
      from: category1,
      to: category2,
      strength: 0.4,
      relationship: 'Potential indirect relationship exists',
      supportingMemories: {}
    };
  }

  // ================================================================
  // SCENARIO-RELEVANT MEMORY EXTRACTION
  // ================================================================

  extractScenarioRelevantMemories(memories, query) {
    const scenarioMemories = {
      successPatterns: [],
      failurePatterns: [],
      riskFactors: [],
      decisionOutcomes: []
    };

    for (const memory of memories) {
      const content = memory.content.toLowerCase();
      
      // Success patterns
      if (content.includes('success') || content.includes('worked') || content.includes('achieved')) {
        scenarioMemories.successPatterns.push({
          memory_id: memory.id,
          content: memory.content,
          relevance: 0.8
        });
      }
      
      // Failure patterns
      if (content.includes('failed') || content.includes('mistake') || content.includes('wrong')) {
        scenarioMemories.failurePatterns.push({
          memory_id: memory.id,
          content: memory.content,
          relevance: 0.9 // Failures are highly relevant for risk assessment
        });
      }
      
      // Risk factors
      if (content.includes('risk') || content.includes('problem') || content.includes('issue')) {
        scenarioMemories.riskFactors.push({
          memory_id: memory.id,
          content: memory.content,
          relevance: 0.85
        });
      }
      
      // Decision outcomes
      if (content.includes('decided') || content.includes('chose') || content.includes('resulted')) {
        scenarioMemories.decisionOutcomes.push({
          memory_id: memory.id,
          content: memory.content,
          relevance: 0.7
        });
      }
    }

    return scenarioMemories;
  }

  // ================================================================
  // QUANTITATIVE MEMORY CONTEXT
  // ================================================================

  extractQuantitativeMemoryContext(memories) {
    const quantitativeContext = [];
    
    for (const memory of memories) {
      const numbers = this.extractNumbersFromMemory(memory.content);
      if (numbers.length > 0) {
        quantitativeContext.push({
          memory_id: memory.id,
          content: memory.content,
          numbers: numbers,
          context: this.categorizeNumbers(numbers, memory.content),
          relevance: 0.8
        });
      }
    }

    return quantitativeContext;
  }

  extractNumbersFromMemory(text) {
    const numberPattern = /\$?[\d,]+\.?\d*%?/g;
    const matches = text.match(numberPattern) || [];
    return matches.map(match => ({
      raw: match,
      value: parseFloat(match.replace(/[$,%]/g, '')),
      type: this.classifyNumber(match)
    }));
  }

  classifyNumber(numberString) {
    if (numberString.includes('$')) return 'currency';
    if (numberString.includes('%')) return 'percentage';
    if (parseFloat(numberString) > 1900 && parseFloat(numberString) < 2100) return 'year';
    return 'general';
  }

  categorizeNumbers(numbers, context) {
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes('revenue') || contextLower.includes('income') || contextLower.includes('profit')) {
      return 'financial';
    }
    if (contextLower.includes('time') || contextLower.includes('hour') || contextLower.includes('day')) {
      return 'temporal';
    }
    if (contextLower.includes('goal') || contextLower.includes('target')) {
      return 'target';
    }
    
    return 'general';
  }

  // ================================================================
  // INTELLIGENCE-AWARE SCORING
  // ================================================================

  applyIntelligenceAwareScoring(memories, intelligenceContext) {
    if (!memories || !intelligenceContext) return memories;

    return memories.map(memory => {
      let enhancedScore = memory.relevance_score || 0.5;
      
      // Boost for reasoning support
      if (intelligenceContext.requiresReasoning && this.supportsReasoning(memory.content)) {
        enhancedScore += 0.2;
      }
      
      // Boost for cross-domain relevance
      if (intelligenceContext.crossDomainAnalysis && this.supportsCrossDomain(memory.content)) {
        enhancedScore += 0.15;
      }
      
      // Boost for scenario planning
      if (intelligenceContext.scenarioAnalysis && this.supportsScenarios(memory.content)) {
        enhancedScore += 0.1;
      }
      
      // Boost for quantitative context
      if (intelligenceContext.quantitativeAnalysis && this.containsNumbers(memory.content)) {
        enhancedScore += 0.1;
      }

      return {
        ...memory,
        relevance_score: Math.min(enhancedScore, 1.0),
        intelligence_enhanced: true
      };
    });
  }

  // ================================================================
  // HELPER FUNCTIONS FOR INTELLIGENCE INTEGRATION
  // ================================================================

  supportsPremise(content, query) {
    // Simple heuristic - looks for supporting statements
    return content.toLowerCase().includes('because') || 
           content.toLowerCase().includes('since') ||
           this.hasSharedKeywords(content, query);
  }

  providesEvidence(content, query) {
    return content.toLowerCase().includes('data') ||
           content.toLowerCase().includes('evidence') ||
           content.toLowerCase().includes('example') ||
           this.containsNumbers(content);
  }

  providesCounterexample(content, query) {
    return content.toLowerCase().includes('however') ||
           content.toLowerCase().includes('but') ||
           content.toLowerCase().includes('except');
  }

  establishesPattern(content, query) {
    return content.toLowerCase().includes('always') ||
           content.toLowerCase().includes('usually') ||
           content.toLowerCase().includes('pattern') ||
           content.toLowerCase().includes('tend');
  }

  supportsReasoning(content) {
    return content.includes('because') || content.includes('therefore') || 
           content.includes('logic') || content.includes('reason');
  }

  supportsCrossDomain(content) {
    const domains = ['business', 'personal', 'health', 'financial', 'legal', 'technical'];
    let domainCount = 0;
    for (const domain of domains) {
      if (content.toLowerCase().includes(domain)) domainCount++;
    }
    return domainCount >= 2;
  }

  supportsScenarios(content) {
    return content.includes('outcome') || content.includes('result') || 
           content.includes('consequence') || content.includes('impact');
  }

  containsNumbers(content) {
    return /\d/.test(content);
  }

  hasSharedKeywords(content, query) {
    const contentWords = content.toLowerCase().split(/\s+/);
    const queryWords = query.toLowerCase().split(/\s+/);
    const sharedWords = contentWords.filter(word => queryWords.includes(word) && word.length > 3);
    return sharedWords.length >= 2;
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  calculateTotalTokens(memories) {
    return memories.reduce((sum, memory) => sum + (memory.token_count || 0), 0);
  }

  generateCacheKey(query, userId) {
    return `${query.substring(0, 100)}_${userId || 'anon'}`;
  }

  cacheResult(key, result) {
    if (this.routingCache.size >= this.maxCacheSize) {
      const firstKey = this.routingCache.keys().next().value;
      this.routingCache.delete(firstKey);
    }
    this.routingCache.set(key, result);
  }

  cacheSemanticResult(key, result) {
    if (this.semanticCache.size >= this.maxCacheSize) {
      const firstKey = this.semanticCache.keys().next().value;
      this.semanticCache.delete(firstKey);
    }
    this.semanticCache.set(key, result);
  }

  createFallbackRoutingResult(reason) {
    return {
      primaryCategory: 'personal_life_interests',
      subcategory: 'General',
      confidence: 0.3,
      alternativeCategory: null,
      reasoning: `Fallback: ${reason}`,
      isFallback: true,
      overrideApplied: false
    };
  }

  // ================================================================
  // ANALYTICS AND PERFORMANCE TRACKING
  // ================================================================

  updateRoutingAnalytics(result, processingTime) {
    try {
      this.routingStats.totalRoutes++;
      
      // Update category distribution
      const category = result.primaryCategory;
      const current = this.routingStats.categoryDistribution.get(category) || 0;
      this.routingStats.categoryDistribution.set(category, current + 1);
      
      // Update confidence statistics
      const count = this.routingStats.totalRoutes;
      const currentAvg = this.routingStats.avgConfidence;
      this.routingStats.avgConfidence = ((currentAvg * (count - 1)) + result.confidence) / count;
      
      // Update processing time
      const currentAvgTime = this.routingStats.avgProcessingTime;
      this.routingStats.avgProcessingTime = ((currentAvgTime * (count - 1)) + processingTime) / count;
      
      // Track confidence levels
      if (result.confidence > 0.8) {
        this.routingStats.highConfidenceRoutes++;
      } else if (result.confidence < 0.5) {
        this.routingStats.lowConfidenceRoutes++;
      }
      
      // Update cache hit rate
      const totalRequests = this.routingStats.cacheHits + this.routingStats.cacheMisses;
      this.routingStats.cacheHitRate = totalRequests > 0 ? 
        this.routingStats.cacheHits / totalRequests : 0;

    } catch (error) {
      this.logger.warn('Error updating routing analytics:', error);
    }
  }

  updateExtractionAnalytics(memories, routing, processingTime) {
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

    } catch (error) {
      this.logger.warn('Error updating extraction analytics:', error);
    }
  }

  getRoutingStats() {
    return {
      totalRoutes: this.routingStats.totalRoutes,
      categoryDistribution: Object.fromEntries(this.routingStats.categoryDistribution),
      avgConfidence: Number(this.routingStats.avgConfidence.toFixed(3)),
      avgProcessingTime: Math.round(this.routingStats.avgProcessingTime),
      highConfidenceRoutes: this.routingStats.highConfidenceRoutes,
      lowConfidenceRoutes: this.routingStats.lowConfidenceRoutes,
      overrideApplications: this.routingStats.overrideApplications,
      cacheHitRate: Number(this.routingStats.cacheHitRate.toFixed(3)),
      uptime: Date.now() - this.routingStats.lastReset,
      cacheSize: this.routingCache.size
    };
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
    this.routingCache.clear();
    this.semanticCache.clear();
    this.extractionCache.clear();
    this.logger.log('Intelligence System caches cleared');
  }

  // ================================================================
  // SIMPLE SIMILARITY SCORING
  // ================================================================

  calculateContentSimilarity(query, memoryContent) {
    if (!query || !memoryContent) return 0;
    
    const queryWords = this.extractQueryWords(query.toLowerCase());
    const memoryWords = this.extractQueryWords(memoryContent.toLowerCase());
    
    if (queryWords.length === 0 || memoryWords.length === 0) return 0;
    
    // Direct word overlap scoring
    let matches = 0;
    for (const queryWord of queryWords) {
      if (memoryWords.includes(queryWord)) {
        matches++;
      } else {
        // Check for partial matches (3+ characters)
        for (const memoryWord of memoryWords) {
          if (queryWord.length >= 3 && memoryWord.includes(queryWord)) {
            matches += 0.5;
            break;
          }
        }
      }
    }
    
    return matches / queryWords.length;
  }

  extractQueryWords(text) {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isCommonWord(word));
  }

  isCommonWord(word) {
    const common = ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they', 
                    'have', 'this', 'will', 'can', 'had', 'her', 'what', 'said', 'each', 'which'];
    return common.includes(word);
  }

  // ================================================================
  // CROSS-CATEGORY FALLBACK SEARCH
  // ================================================================

  async tryRelatedCategories(userId, query, routing, semanticAnalysis) {
    // Define category relationships
    const categoryRelations = {
      'personal_life_interests': ['relationships_social', 'home_lifestyle'],
      'relationships_social': ['personal_life_interests', 'mental_emotional'],
      'business_career': ['financial_management', 'personal_development'],
      'mental_emotional': ['relationships_social', 'health_wellness'],
      'home_lifestyle': ['personal_life_interests', 'financial_management']
    };
    
    const primaryCategory = routing.primaryCategory;
    const relatedCategories = categoryRelations[primaryCategory] || [];
    
    this.logger.log(`Trying related categories for ${primaryCategory}: ${relatedCategories.join(', ')}`);
    
    const fallbackMemories = [];
    
    for (const category of relatedCategories) {
      try {
        const categoryMemories = await this.coreSystem.withDbClient(async (client) => {
          const result = await client.query(`
            SELECT id, user_id, category_name, subcategory_name, content, token_count, 
                   relevance_score, usage_frequency, created_at, last_accessed, metadata
            FROM persistent_memories 
            WHERE user_id = $1 AND category_name = $2 AND relevance_score > 0.3
            AND NOT (
              content::text ~* '\\b(remember anything|do you remember|what did i tell|can you recall)\\b' 
              AND NOT content::text ~* '\\b(i have|i own|my \\w+\\s+(is|are|was)|name is|work at|live in)\\b'
            )
            ORDER BY relevance_score DESC, created_at DESC
            LIMIT 5
          `, [userId, category]);
          
          return result.rows;
        });
        
        // Score each memory for relevance to the query
        const scoredMemories = categoryMemories.map(memory => ({
          ...memory,
          similarityScore: this.calculateContentSimilarity(query, memory.content),
          source: 'related_category'
        }));
        
        // Only include memories with reasonable similarity
        const relevantMemories = scoredMemories.filter(m => m.similarityScore > 0.2);
        fallbackMemories.push(...relevantMemories);
        
      } catch (error) {
        this.logger.error(`Error searching category ${category}:`, error);
      }
    }
    
    this.logger.log(`Found ${fallbackMemories.length} memories from related categories`);
    return fallbackMemories;
  }

  // ================================================================
  // SIMILARITY-BASED RE-RANKING
  // ================================================================

  rerankBySimilarity(memories, query) {
    return memories.sort((a, b) => {
      // PRIMARY: Similarity score to query
      const similarityDiff = b.similarityScore - a.similarityScore;
      if (Math.abs(similarityDiff) > 0.1) {
        return similarityDiff;
      }
      
      // SECONDARY: Original relevance score
      const relevanceDiff = (b.relevance_score || 0) - (a.relevance_score || 0);
      if (Math.abs(relevanceDiff) > 0.1) {
        return relevanceDiff;
      }
      
      // TERTIARY: Prefer primary category over related
      if (a.source !== b.source) {
        return a.source === 'primary_category' ? -1 : 1;
      }
      
      // FINAL: Usage frequency
      return (b.usage_frequency || 0) - (a.usage_frequency || 0);
    });
  }
}

// Export instance, not class
export default new IntelligenceSystem();;
