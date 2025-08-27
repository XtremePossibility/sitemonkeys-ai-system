// ===================================================================
// memory_system/routing_intelligence.js
// PRODUCTION VERSION: Advanced category routing with database integration

class RoutingIntelligence {
  constructor() {
    // Advanced category mapping with comprehensive patterns
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

    // Performance optimization
    this.routingCache = new Map();
    this.maxCacheSize = 1000;

    // Advanced analytics
    this.routingStats = {
      totalRoutes: 0,
      categoryDistribution: new Map(),
      avgConfidence: 0,
      avgProcessingTime: 0,
      highConfidenceRoutes: 0,
      lowConfidenceRoutes: 0,
      overrideApplications: 0,
      cacheHitRate: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastReset: Date.now()
    };
  }

  /**
   * MAIN ROUTING METHOD - Production-ready with comprehensive analysis
   */
  async routeToCategory(query, userId = null) {
    if (!query || typeof query !== 'string') {
      return this.createFallbackResult('Invalid query input');
    }

    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      console.log(`[ROUTING] Processing query: "${query.substring(0, 50)}..."`);

      // Check cache first
      const cacheKey = this.generateCacheKey(normalizedQuery, userId);
      if (this.routingCache.has(cacheKey)) {
        this.routingStats.cacheHits++;
        const cached = this.routingCache.get(cacheKey);
        console.log(`[ROUTING] Cache hit: ${cached.primaryCategory}`);
        return cached;
      }

      this.routingStats.cacheMisses++;

      // Advanced semantic analysis
      const semanticAnalysis = await this.performAdvancedSemanticAnalysis(normalizedQuery);

      // Calculate category scores with sophisticated algorithms
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

      // Cache result
      this.cacheResult(cacheKey, finalResult);

      // Update analytics
      this.updateRoutingAnalytics(finalResult, Date.now() - startTime);

      console.log(`[ROUTING] Routed to: ${finalResult.primaryCategory} (confidence: ${finalResult.confidence.toFixed(3)}, ${Date.now() - startTime}ms)`);

      return finalResult;

    } catch (error) {
      console.error('[ROUTING] Critical error in routing:', error);
      return this.createFallbackResult('Routing error occurred');
    }
  }

  /**
   * ADVANCED SEMANTIC ANALYSIS
   */
  async performAdvancedSemanticAnalysis(query) {
    const analysis = {
      intent: 'general',
      intentConfidence: 0.5,
      emotionalWeight: 0,
      emotionalTone: 'neutral',
      personalContext: false,
      memoryReference: false,
      urgencyLevel: 0,
      timeframe: 'general',
      questionType: null,
      entityTypes: new Set(),
      contextClues: new Set(),
      linguisticComplexity: 0
    };

    try {
      // Advanced intent classification
      const intentPatterns = {
        memory_recall: {
          patterns: [
            /\b(remember|recall|told you|mentioned|discussed|said before|talked about)\b/i,
            /\b(you know|as I said|like I mentioned|previously|earlier)\b/i
          ],
          weight: 0.9
        },
        information_seeking: {
          patterns: [
            /\b(what|how|when|where|why|who|which|tell me|show me|explain)\b/i,
            /\?/,
            /\b(can you|could you|would you|do you know|help me understand)\b/i
          ],
          weight: 0.8
        },
        problem_solving: {
          patterns: [
            /\b(problem|issue|trouble|difficulty|challenge|stuck|help|solve|fix)\b/i,
            /\b(how do i|how can i|what should i|need help|struggling with)\b/i
          ],
          weight: 0.85
        },
        personal_sharing: {
          patterns: [
            /\b(my |our |i have|i own|we have|we own|i am|we are|personal|private)\b/i,
            /\b(telling you|sharing|want to share|let you know)\b/i
          ],
          weight: 0.8
        },
        emotional_expression: {
          patterns: [
            /\b(feel|feeling|felt|emotion|emotional|mood)\b/i,
            /\b(happy|sad|angry|worried|excited|frustrated|anxious|stressed|overwhelmed)\b/i
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

      // Find best intent match
      let maxIntentScore = 0;
      for (const [intentType, config] of Object.entries(intentPatterns)) {
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
          analysis.intentConfidence = score;
        }
      }

      // Advanced emotional analysis
      const emotionalIndicators = {
        high_stress: ['stressed', 'overwhelmed', 'panic', 'crisis', 'emergency'],
        anxiety: ['anxious', 'worried', 'nervous', 'scared', 'fear'],
        sadness: ['sad', 'depressed', 'down', 'upset', 'crying'],
        anger: ['angry', 'mad', 'frustrated', 'furious', 'irritated'],
        joy: ['happy', 'excited', 'thrilled', 'delighted', 'ecstatic'],
        confusion: ['confused', 'lost', 'unclear', 'don\'t understand']
      };

      let maxEmotionalWeight = 0;
      let dominantEmotion = 'neutral';
      
      for (const [emotion, indicators] of Object.entries(emotionalIndicators)) {
        for (const indicator of indicators) {
          if (query.includes(indicator)) {
            const weight = emotion === 'high_stress' ? 0.9 : 
                          emotion === 'anxiety' ? 0.8 : 
                          emotion === 'anger' ? 0.7 : 0.6;
            if (weight > maxEmotionalWeight) {
              maxEmotionalWeight = weight;
              dominantEmotion = emotion;
            }
          }
        }
      }

      analysis.emotionalWeight = maxEmotionalWeight;
      analysis.emotionalTone = dominantEmotion;

      // Context analysis
      analysis.personalContext = /\b(my|our|personal|private|family|i am|i have|we are|we have)\b/i.test(query);
      analysis.memoryReference = /\b(remember|recall|told you|mentioned|discussed|said before)\b/i.test(query);
      
      // Urgency detection
      analysis.urgencyLevel = /\b(urgent|emergency|asap|immediately|critical|important|now|today|right away)\b/i.test(query) ? 0.9 : 
                             /\b(soon|quickly|fast|hurry|rush)\b/i.test(query) ? 0.6 : 0.0;

      // Timeframe analysis
      if (/\b(now|today|currently|right now|at the moment|immediate)\b/i.test(query)) {
        analysis.timeframe = 'immediate';
      } else if (/\b(this week|soon|upcoming|lately|recently|short-term)\b/i.test(query)) {
        analysis.timeframe = 'short_term';
      } else if (/\b(future|someday|eventually|long-term|planning|years from now)\b/i.test(query)) {
        analysis.timeframe = 'long_term';
      } else if (/\b(yesterday|last week|last month|in the past|previously)\b/i.test(query)) {
        analysis.timeframe = 'past';
      }

      // Question type classification
      if (query.includes('?')) {
        if (/^what\b/i.test(query)) analysis.questionType = 'what';
        else if (/^how\b/i.test(query)) analysis.questionType = 'how';
        else if (/^why\b/i.test(query)) analysis.questionType = 'why';
        else if (/^when\b/i.test(query)) analysis.questionType = 'when';
        else if (/^where\b/i.test(query)) analysis.questionType = 'where';
        else if (/^who\b/i.test(query)) analysis.questionType = 'who';
        else analysis.questionType = 'general';
      }

      // Entity type detection
      const entityPatterns = {
        health: /\b(health|medical|doctor|symptom|pain|illness|medication|fitness)\b/gi,
        work: /\b(work|job|career|business|office|meeting|project|boss|colleague)\b/gi,
        family: /\b(family|spouse|children|parents|relationship|marriage|kids)\b/gi,
        money: /\b(money|financial|budget|income|debt|investment|savings|salary)\b/gi,
        home: /\b(home|house|apartment|living|lifestyle|routine|habit)\b/gi,
        technology: /\b(software|app|tool|technology|system|computer|phone)\b/gi
      };

      for (const [entityType, pattern] of Object.entries(entityPatterns)) {
        const matches = query.match(pattern);
        if (matches && matches.length > 0) {
          analysis.entityTypes.add(entityType);
        }
      }

      // Context clues detection
      const contextClues = {
        planning: /\b(plan|planning|strategy|prepare|preparation)\b/gi,
        learning: /\b(learn|learning|study|understand|knowledge|skill)\b/gi,
        social: /\b(friend|social|people|community|group|team)\b/gi,
        creative: /\b(creative|art|design|music|writing|craft)\b/gi,
        physical: /\b(physical|body|exercise|movement|active)\b/gi
      };

      for (const [clueType, pattern] of Object.entries(contextClues)) {
        if (pattern.test(query)) {
          analysis.contextClues.add(clueType);
        }
      }

      // Linguistic complexity
      const words = query.split(/\s+/);
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));
      const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
      
      analysis.linguisticComplexity = Math.min(
        (uniqueWords.size / words.length) * 0.5 + // Vocabulary diversity
        (avgWordLength / 10) * 0.3 + // Word complexity
        (words.length / 50) * 0.2, // Length complexity
        1.0
      );

      return analysis;

    } catch (error) {
      console.error('[ROUTING] Error in semantic analysis:', error);
      return analysis; // Return default analysis
    }
  }

  /**
   * CALCULATE ADVANCED CATEGORY SCORES
   */
  async calculateAdvancedCategoryScores(query, semanticAnalysis, userId) {
    const scores = new Map();

    for (const [categoryName, config] of this.categoryMappings) {
      let score = 0;

      // Base keyword matching with frequency weighting
      let keywordMatches = 0;
      for (const keyword of config.keywords) {
        if (query.includes(keyword)) {
          keywordMatches++;
          score += 2.0 * config.weight; // Base keyword score
        }
      }

      // Pattern matching with higher weight
      for (const pattern of config.patterns) {
        if (pattern.test(query)) {
          score += 3.5 * config.weight; // Pattern match bonus
        }
      }

      // Semantic enhancement based on analysis
      score += this.calculateSemanticBoost(categoryName, semanticAnalysis);

      // Entity alignment boost
      score += this.calculateEntityAlignmentBoost(categoryName, semanticAnalysis);

      // Context clues alignment
      score += this.calculateContextCluesBoost(categoryName, semanticAnalysis);

      // Priority-based weighting
      if (config.priority === 'high' && semanticAnalysis.urgencyLevel > 0.5) {
        score += 1.0;
      }

      // Keyword density bonus
      if (keywordMatches > 1) {
        score += Math.min(keywordMatches * 0.5, 2.0); // Multi-keyword bonus
      }

      scores.set(categoryName, Math.max(score, 0));
    }

    return scores;
  }

  /**
   * SEMANTIC BOOST calculation
   */
  calculateSemanticBoost(categoryName, semanticAnalysis) {
    let boost = 0;

    // Intent-based boosting
    const intentBoosts = {
      memory_recall: {
        'mental_emotional': 0.6, 'relationships_social': 0.5, 'personal_life_interests': 0.4
      },
      personal_sharing: {
        'personal_life_interests': 0.7, 'relationships_social': 0.6, 'mental_emotional': 0.4
      },
      problem_solving: {
        'work_career': 0.6, 'health_wellness': 0.5, 'mental_emotional': 0.5, 'tools_tech_workflow': 0.4
      },
      emotional_expression: {
        'mental_emotional': 0.8, 'relationships_social': 0.5, 'health_wellness': 0.4
      },
      decision_making: {
        'goals_active_current': 0.6, 'work_career': 0.4, 'money_spending_goals': 0.4
      },
      information_seeking: {
        'tools_tech_workflow': 0.4, 'health_wellness': 0.3, 'work_career': 0.3
      }
    };

    const categoryBoost = intentBoosts[semanticAnalysis.intent]?.[categoryName] || 0;
    boost += categoryBoost;

    // Emotional weight boosting
    if (semanticAnalysis.emotionalWeight > 0.6) {
      const emotionalBoosts = {
        'mental_emotional': 1.0,
        'relationships_social': 0.5,
        'health_wellness': 0.4,
        'work_career': 0.3
      };
      boost += (emotionalBoosts[categoryName] || 0) * semanticAnalysis.emotionalWeight;
    }

    // Urgency boosting
    if (semanticAnalysis.urgencyLevel > 0.6) {
      const urgencyBoosts = {
        'health_wellness': 0.8,
        'mental_emotional': 0.7,
        'work_career': 0.5,
        'money_income_debt': 0.6
      };
      boost += (urgencyBoosts[categoryName] || 0) * semanticAnalysis.urgencyLevel;
    }

    // Timeframe-based boosting
    const timeframeBoosts = {
      immediate: {
        'goals_active_current': 0.6, 'daily_routines_habits': 0.5, 'work_career': 0.4
      },
      short_term: {
        'goals_active_current': 0.4, 'work_career': 0.3, 'health_wellness': 0.3
      },
      long_term: {
        'goals_future_dreams': 0.7, 'work_career': 0.4, 'money_spending_goals': 0.4
      },
      past: {
        'personal_life_interests': 0.4, 'relationships_social': 0.3
      }
    };

    const timeframeBoost = timeframeBoosts[semanticAnalysis.timeframe]?.[categoryName] || 0;
    boost += timeframeBoost;

    return boost;
  }

  /**
   * ENTITY ALIGNMENT BOOST
   */
  calculateEntityAlignmentBoost(categoryName, semanticAnalysis) {
    const entityAlignments = {
      health: {
        'health_wellness': 1.0, 'mental_emotional': 0.4
      },
      work: {
        'work_career': 1.0, 'goals_active_current': 0.3, 'tools_tech_workflow': 0.4
      },
      family: {
        'relationships_social': 1.0, 'mental_emotional': 0.3, 'personal_life_interests': 0.3
      },
      money: {
        'money_income_debt': 0.8, 'money_spending_goals': 0.8, 'work_career': 0.4
      },
      home: {
        'personal_life_interests': 0.8, 'daily_routines_habits': 0.5, 'health_wellness': 0.3
      },
      technology: {
        'tools_tech_workflow': 1.0, 'work_career': 0.4
      }
    };

    let boost = 0;
    for (const entityType of semanticAnalysis.entityTypes) {
      boost += entityAlignments[entityType]?.[categoryName] || 0;
    }

    return boost;
  }

  /**
   * CONTEXT CLUES BOOST
   */
  calculateContextCluesBoost(categoryName, semanticAnalysis) {
    const clueAlignments = {
      planning: {
        'goals_active_current': 0.5, 'goals_future_dreams': 0.4, 'money_spending_goals': 0.3
      },
      learning: {
        'personal_life_interests': 0.4, 'tools_tech_workflow': 0.3, 'work_career': 0.3
      },
      social: {
        'relationships_social': 0.6, 'personal_life_interests': 0.3
      },
      creative: {
        'personal_life_interests': 0.6, 'goals_future_dreams': 0.3
      },
      physical: {
        'health_wellness': 0.6, 'daily_routines_habits': 0.4
      }
    };

    let boost = 0;
    for (const clueType of semanticAnalysis.contextClues) {
      boost += clueAlignments[clueType]?.[categoryName] || 0;
    }

    return boost;
  }

  /**
   * DETERMINE BEST CATEGORY with confidence metrics
   */
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
    const [thirdCategory, thirdScore] = sortedCategories[2] || ['', 0];

    // Advanced confidence calculation
    let confidence = Math.min(bestScore / 12.0, 0.6); // Normalize base score

    // Score separation bonus
    const separation = bestScore - secondScore;
    confidence += Math.min(separation / 8.0, 0.2);

    // Semantic analysis confidence boost
    confidence += semanticAnalysis.intentConfidence * 0.1;

    // Clear winner bonus
    if (bestScore > secondScore * 1.5) {
      confidence += 0.1;
    }

    // Multiple indicators bonus
    if (semanticAnalysis.entityTypes.size > 0) {
      confidence += Math.min(semanticAnalysis.entityTypes.size * 0.05, 0.1);
    }

    // Linguistic complexity consideration
    if (semanticAnalysis.linguisticComplexity > 0.6) {
      confidence += 0.05;
    }

    // Personal context boost
    if (semanticAnalysis.personalContext) {
      confidence += 0.05;
    }

    // Emotional weight boost
    if (semanticAnalysis.emotionalWeight > 0.5) {
      confidence += 0.05;
    }

    return {
      primaryCategory: bestCategory,
      confidence: Math.max(0.2, Math.min(confidence, 1.0)),
      alternativeCategory: secondCategory,
      thirdChoice: thirdCategory,
      scores: {
        primary: bestScore,
        secondary: secondScore,
        tertiary: thirdScore
      },
      reasoning: `Primary: ${bestCategory} (${bestScore.toFixed(1)}) vs Secondary: ${secondCategory} (${secondScore.toFixed(1)})`
    };
  }

  /**
   * SOPHISTICATED OVERRIDES for edge cases and special situations
   */
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

    // Strong memory recall override
    if (semanticAnalysis.memoryReference && semanticAnalysis.intentConfidence > 0.8) {
      // Keep existing category but boost confidence
      confidence = Math.max(confidence, 0.8);
      reasoning += '; Memory recall confidence boost applied';
    }

    // Personal possession context override
    const possessionPatterns = [
      /\b(my|our)\s+(car|vehicle|house|home|apartment)\b/i,
      /\b(things i own|stuff i have|personal belongings)\b/i,
      /\b(what i have|what we have|what i own|what we own)\b/i
    ];

    for (const pattern of possessionPatterns) {
      if (pattern.test(query) && primaryCategory !== 'personal_life_interests') {
        primaryCategory = 'personal_life_interests';
        confidence = Math.max(confidence, 0.8);
        reasoning += '; Personal possession override applied';
        overrideApplied = true;
        break;
      }
    }

    // Work-life balance context (spans multiple categories)
    if (query.includes('work-life balance') || query.includes('work stress')) {
      if (semanticAnalysis.emotionalWeight > 0.5) {
        primaryCategory = 'mental_emotional';
        confidence = Math.max(confidence, 0.8);
        reasoning += '; Work-life balance emotional override applied';
        overrideApplied = true;
      }
    }

    // Relationship + money issues (complex situations)
    if (semanticAnalysis.entityTypes.has('family') && semanticAnalysis.entityTypes.has('money')) {
      if (query.includes('argue') || query.includes('fight') || query.includes('conflict')) {
        primaryCategory = 'relationships_social';
        confidence = Math.max(confidence, 0.8);
        reasoning += '; Relationship-money conflict override applied';
        overrideApplied = true;
      }
    }

    // Low confidence fallback enhancement
    if (confidence < 0.4 && !overrideApplied) {
      // Use semantic analysis to make a better guess
      if (semanticAnalysis.personalContext && semanticAnalysis.emotionalWeight > 0.3) {
        primaryCategory = 'mental_emotional';
        confidence = 0.5;
        reasoning += '; Low confidence personal-emotional fallback applied';
        overrideApplied = true;
      } else if (semanticAnalysis.entityTypes.size > 0) {
        // Use the most prominent entity type
        const entityCategoryMap = {
          'health': 'health_wellness',
          'work': 'work_career',
          'family': 'relationships_social',
          'money': 'money_spending_goals',
          'home': 'personal_life_interests'
        };
        
        for (const entity of semanticAnalysis.entityTypes) {
          if (entityCategoryMap[entity]) {
            primaryCategory = entityCategoryMap[entity];
            confidence = 0.6;
            reasoning += `; Entity-based fallback (${entity}) applied`;
            overrideApplied = true;
            break;
          }
        }
      }
    }

    // Update statistics
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

  /**
   * UTILITY METHODS
   */
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

  createFallbackResult(reason) {
    return {
      primaryCategory: 'personal_life_interests',
      confidence: 0.3,
      alternativeCategory: null,
      reasoning: `Fallback: ${reason}`,
      isFallback: true
    };
  }

  /**
   * ANALYTICS AND PERFORMANCE TRACKING
   */
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
      console.warn('[ROUTING] Error updating analytics:', error);
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

  cleanup() {
    this.routingCache.clear();
    console.log('[ROUTING] Cache cleared');
  }
}

export { RoutingIntelligence };
