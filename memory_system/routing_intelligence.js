// memory_system/routing_intelligence.js
// ULTIMATE ROUTING INTELLIGENCE: Maximum Sophistication + Bulletproof Reliability
// Advanced semantic analysis with production-grade performance and safety

console.log('[ROUTING] 🧠 Advanced Routing Intelligence loading...');

class RoutingIntelligence {
    constructor() {
        // Performance-optimized routing patterns with semantic weighting
        this.routingPatterns = {
            health_wellness: {
                keywords: new Set(['health', 'medical', 'doctor', 'symptom', 'pain', 'illness', 'medication', 'fitness', 'exercise', 'diet', 'nutrition', 'mental health', 'therapy', 'anxiety', 'depression', 'wellness', 'sleep', 'energy', 'hospital', 'nurse', 'treatment']),
                contextPatterns: new Set(['feeling sick', 'health issue', 'medical appointment', 'workout routine', 'eating habits', 'stress levels', 'not feeling well', 'health concern']),
                semanticClusters: {
                    medical: ['doctor', 'hospital', 'diagnosis', 'treatment', 'medical', 'symptom', 'illness'],
                    fitness: ['exercise', 'workout', 'fitness', 'gym', 'training', 'physical'],
                    mental: ['anxiety', 'depression', 'stress', 'therapy', 'mental health', 'emotional'],
                    wellness: ['wellness', 'healthy', 'wellbeing', 'self-care', 'nutrition']
                },
                weight: 1.0,
                subcategoryRouting: {
                    physical_health: new Set(['symptom', 'pain', 'injury', 'physical', 'body', 'hurt']),
                    mental_health: new Set(['anxiety', 'depression', 'stress', 'therapy', 'emotional', 'mental']),
                    medical_history: new Set(['doctor', 'appointment', 'diagnosis', 'treatment', 'medical']),
                    fitness_nutrition: new Set(['exercise', 'workout', 'diet', 'nutrition', 'fitness', 'gym']),
                    wellness_practices: new Set(['wellness', 'meditation', 'sleep', 'relaxation', 'mindfulness'])
                }
            },

            relationships_social: {
                keywords: new Set(['family', 'spouse', 'partner', 'boyfriend', 'girlfriend', 'marriage', 'relationship', 'friend', 'social', 'colleague', 'coworker', 'conflict', 'communication', 'love', 'dating', 'children', 'parents', 'pets', 'pet', 'monkey', 'monkeys', 'dog', 'cat', 'animal', 'kids', 'child']),
                contextPatterns: new Set(['relationship issue', 'family problem', 'social situation', 'communication breakdown', 'my pets', 'my monkey', 'my monkeys', 'pet names', 'family members', 'my kids', 'my children']),
                semanticClusters: {
                    family: ['family', 'parents', 'children', 'kids', 'spouse', 'marriage', 'relatives'],
                    pets: ['pets', 'pet', 'monkey', 'monkeys', 'dog', 'cat', 'animal'],
                    romantic: ['partner', 'boyfriend', 'girlfriend', 'dating', 'love', 'relationship'],
                    social: ['friend', 'social', 'friendship', 'people', 'community'],
                    professional: ['colleague', 'coworker', 'team', 'workplace']
                },
                weight: 1.0,
                subcategoryRouting: {
                    family_dynamics: new Set(['family', 'parents', 'children', 'siblings', 'relatives', 'pets', 'pet', 'monkey', 'monkeys', 'dog', 'cat', 'kids', 'child']),
                    romantic_relationships: new Set(['spouse', 'partner', 'boyfriend', 'girlfriend', 'dating', 'marriage', 'love']),
                    friendships: new Set(['friend', 'social', 'friendship', 'social circle', 'friends']),
                    professional_relationships: new Set(['colleague', 'coworker', 'boss', 'team', 'workplace relationship']),
                    social_interactions: new Set(['social', 'communication', 'conflict', 'interaction', 'people'])
                }
            },

            business_career: {
                keywords: new Set(['work', 'job', 'career', 'business', 'company', 'project', 'meeting', 'boss', 'employee', 'salary', 'promotion', 'performance', 'deadline', 'client', 'customer', 'revenue', 'profit', 'strategy', 'site monkeys', 'site-monkeys', 'sitemonkeys', 'brand', 'agency', 'office', 'professional']),
                contextPatterns: new Set(['work issue', 'business problem', 'career decision', 'project deadline', 'site monkeys business', 'brand strategy', 'work situation', 'job interview']),
                semanticClusters: {
                    work: ['work', 'job', 'employment', 'workplace', 'office', 'professional'],
                    career: ['career', 'promotion', 'advancement', 'development', 'growth'],
                    business: ['business', 'company', 'organization', 'enterprise', 'firm'],
                    brand: ['site monkeys', 'site-monkeys', 'sitemonkeys', 'brand', 'agency'],
                    performance: ['performance', 'productivity', 'efficiency', 'results', 'achievement']
                },
                weight: 1.0,
                subcategoryRouting: {
                    work_performance: new Set(['performance', 'productivity', 'deadline', 'task', 'efficiency', 'results']),
                    career_planning: new Set(['career', 'promotion', 'job search', 'professional development', 'advancement']),
                    business_strategy: new Set(['business', 'strategy', 'revenue', 'profit', 'growth', 'site monkeys', 'site-monkeys', 'sitemonkeys', 'brand']),
                    professional_development: new Set(['skills', 'training', 'learning', 'certification', 'education']),
                    workplace_dynamics: new Set(['team', 'boss', 'colleague', 'workplace culture', 'office'])
                }
            },

            financial_management: {
                keywords: new Set(['money', 'budget', 'expense', 'income', 'salary', 'cost', 'price', 'investment', 'savings', 'debt', 'loan', 'credit', 'financial', 'bank', 'tax', 'insurance', 'pay', 'payment', 'finance']),
                contextPatterns: new Set(['financial issue', 'money problem', 'budget concern', 'investment decision', 'financial planning', 'money management']),
                semanticClusters: {
                    income: ['salary', 'income', 'earnings', 'revenue', 'paycheck', 'pay'],
                    expenses: ['expense', 'cost', 'spending', 'budget', 'bills', 'payment'],
                    investments: ['investment', 'stocks', 'portfolio', 'retirement', 'savings'],
                    debt: ['debt', 'loan', 'credit', 'mortgage', 'borrowing'],
                    planning: ['budget', 'financial planning', 'money management', 'goals']
                },
                weight: 1.0,
                subcategoryRouting: {
                    income_planning: new Set(['salary', 'income', 'earnings', 'revenue', 'paycheck', 'pay']),
                    expense_tracking: new Set(['expense', 'cost', 'spending', 'budget', 'bills', 'payment']),
                    investment_strategy: new Set(['investment', 'stocks', 'portfolio', 'retirement', 'savings']),
                    debt_management: new Set(['debt', 'loan', 'credit', 'mortgage', 'payment']),
                    financial_goals: new Set(['financial goal', 'money goal', 'savings goal', 'financial planning'])
                }
            },

            technology_tools: {
                keywords: new Set(['software', 'app', 'tool', 'system', 'computer', 'phone', 'technology', 'digital', 'online', 'website', 'program', 'automation', 'workflow', 'productivity', 'tech', 'device', 'internet']),
                contextPatterns: new Set(['tech issue', 'software problem', 'system error', 'app not working', 'computer problem', 'technical difficulty']),
                semanticClusters: {
                    software: ['software', 'program', 'application', 'app', 'system'],
                    hardware: ['computer', 'phone', 'device', 'equipment', 'technology'],
                    productivity: ['productivity', 'workflow', 'automation', 'efficiency', 'tools'],
                    digital: ['digital', 'online', 'internet', 'website', 'web'],
                    troubleshooting: ['error', 'problem', 'issue', 'bug', 'broken', 'fix']
                },
                weight: 1.0,
                subcategoryRouting: {
                    software_systems: new Set(['software', 'program', 'system', 'application', 'app']),
                    productivity_tools: new Set(['productivity', 'tool', 'workflow', 'efficiency', 'automation']),
                    tech_troubleshooting: new Set(['error', 'bug', 'problem', 'not working', 'broken', 'fix']),
                    automation_workflows: new Set(['automation', 'workflow', 'process', 'streamline']),
                    digital_organization: new Set(['organization', 'digital', 'file', 'folder', 'storage'])
                }
            },

            home_lifestyle: {
                keywords: new Set(['home', 'house', 'apartment', 'living', 'lifestyle', 'daily', 'routine', 'household', 'vehicle', 'vehicles', 'car', 'cars', 'truck', 'motorcycle', 'bike', 'boat', 'auto', 'own', 'owned', 'have', 'possess', 'possession', 'belongings', 'stuff', 'things', 'personal', 'hobby', 'hobbies', 'interest', 'interests', 'favorite', 'collection', 'gaming']),
                contextPatterns: new Set(['what i own', 'things i have', 'my stuff', 'vehicles i own', 'cars i have', 'told you about', 'my belongings', 'personal items']),
                semanticClusters: {
                    possessions: ['own', 'owned', 'have', 'possess', 'belongings', 'stuff', 'things'],
                    vehicles: ['vehicle', 'car', 'truck', 'motorcycle', 'bike', 'boat', 'auto'],
                    home: ['home', 'house', 'apartment', 'living', 'household', 'residence'],
                    lifestyle: ['lifestyle', 'routine', 'daily', 'personal', 'habits'],
                    interests: ['hobby', 'interest', 'favorite', 'collection', 'gaming', 'entertainment']
                },
                weight: 1.0,
                subcategoryRouting: {
                    personal_possessions: new Set(['own', 'owned', 'have', 'possess', 'vehicle', 'car', 'truck', 'belongings', 'stuff']),
                    hobbies_interests: new Set(['hobby', 'interest', 'favorite', 'collection', 'gaming', 'entertainment']),
                    daily_routines: new Set(['routine', 'daily', 'lifestyle', 'household', 'habits']),
                    home_environment: new Set(['home', 'house', 'apartment', 'living', 'residence']),
                    personal_preferences: new Set(['personal', 'prefer', 'like', 'enjoy', 'favorite'])
                }
            },

            personal_development: {
                keywords: new Set(['goal', 'goals', 'learn', 'learning', 'skill', 'skills', 'improve', 'improvement', 'growth', 'development', 'achievement', 'progress', 'challenge', 'motivation', 'habit', 'habits', 'self', 'personal growth']),
                contextPatterns: new Set(['personal goal', 'learning objective', 'skill development', 'self improvement', 'personal growth', 'want to improve']),
                semanticClusters: {
                    goals: ['goal', 'goals', 'objective', 'target', 'achievement', 'aspiration'],
                    learning: ['learn', 'learning', 'skill', 'skills', 'education', 'knowledge'],
                    growth: ['growth', 'development', 'improvement', 'progress', 'evolution'],
                    habits: ['habit', 'habits', 'routine', 'consistency', 'discipline'],
                    motivation: ['motivation', 'inspiration', 'drive', 'ambition', 'purpose']
                },
                weight: 1.0,
                subcategoryRouting: {
                    goal_setting: new Set(['goal', 'goals', 'objective', 'target', 'achievement']),
                    skill_building: new Set(['skill', 'skills', 'learn', 'learning', 'training', 'education']),
                    habit_formation: new Set(['habit', 'habits', 'routine', 'consistency', 'discipline']),
                    mindset_growth: new Set(['mindset', 'attitude', 'perspective', 'growth', 'development']),
                    motivation_progress: new Set(['motivation', 'progress', 'improvement', 'development', 'achievement'])
                }
            }
        };

        // Advanced caching system for performance
        this.routingCache = new Map();
        this.semanticCache = new Map();
        this.patternCache = new Map();
        this.maxCacheSize = 1000;
        
        // Performance tracking
        this.routingStats = {
            totalRoutings: 0,
            cacheHits: 0,
            cacheMisses: 0,
            avgRoutingTime: 0,
            categoryDistribution: new Map(),
            confidenceStats: { min: 1, max: 0, sum: 0 },
            lastReset: Date.now()
        };

        // Semantic analysis patterns
        this.intentPatterns = {
            memory_recall: new Set(['remember', 'recall', 'told you', 'mentioned', 'said before', 'discussed', 'talked about']),
            information_request: new Set(['what', 'how', 'when', 'where', 'why', 'who', 'which', 'tell me', 'show me']),
            personal_sharing: new Set(['my ', 'our ', 'i have', 'i own', 'we have', 'we own', 'i am', 'we are']),
            problem_seeking: new Set(['problem', 'issue', 'trouble', 'difficulty', 'challenge', 'stuck', 'help'])
        };

        // Advanced possessive detection patterns
        this.possessivePatterns = [
            /\b(my|our|his|her|their)\s+\w+/g,
            /\b(i|we)\s+(have|own|possess|got)\b/g,
            /\bwhat\s+(i|we)\s+(own|have|possess)\b/g,
            /\b(things|stuff|items)\s+(i|we)\s+(have|own)\b/g
        ];

        // Entity extraction patterns
        this.entityPatterns = {
            pets: /\b(pet|pets|dog|cat|monkey|monkeys|animal|animals)\b/g,
            family: /\b(family|children|kids|child|spouse|parent|parents|sibling|relative)\b/g,
            vehicles: /\b(car|cars|truck|vehicle|vehicles|motorcycle|bike|boat|auto)\b/g,
            business: /\b(site\s*monkeys?|business|company|brand|work|job)\b/g,
            home: /\b(home|house|apartment|residence|living)\b/g
        };

        // Fallback strategy with confidence weighting
        this.fallbackChain = [
            { category: 'relationships_social', confidence: 0.6 },
            { category: 'personal_development', confidence: 0.5 },
            { category: 'home_lifestyle', confidence: 0.4 },
            { category: 'health_wellness', confidence: 0.3 }
        ];
    }

    /**
     * MAIN ROUTING METHOD - Advanced semantic routing with bulletproof safety
     */
    routeToCategory(query, userId = null) {
        const startTime = Date.now();
        
        try {
            // Comprehensive input validation and normalization
            const processedQuery = this.validateAndNormalizeQuery(query);
            if (!processedQuery.valid) {
                console.warn('[ROUTING] Invalid query, using fallback routing');
                return this.getFallbackRouting(query, 'invalid_query');
            }

            const normalizedQuery = processedQuery.query;
            const cacheKey = this.generateRoutingCacheKey(normalizedQuery, userId);

            // Check cache for performance
            if (this.routingCache.has(cacheKey)) {
                this.routingStats.cacheHits++;
                const cached = this.routingCache.get(cacheKey);
                console.log(`[ROUTING] ⚡ Cache hit for: "${this.truncateString(normalizedQuery, 40)}" -> ${cached.primaryCategory}`);
                return cached;
            }

            this.routingStats.cacheMisses++;
            console.log(`[ROUTING] 🔍 Analyzing: "${this.truncateString(normalizedQuery, 50)}"`);

            // Perform advanced semantic analysis
            const semanticAnalysis = await this.performAdvancedSemanticAnalysis(normalizedQuery, userId);
            
            // Calculate sophisticated category scores
            const categoryScores = await this.calculateAdvancedCategoryScores(normalizedQuery, semanticAnalysis);
            
            // Determine best category with confidence
            const routingResult = this.determineBestCategory(categoryScores, semanticAnalysis, normalizedQuery);
            
            // Route to subcategory with advanced logic
            const subcategory = await this.routeToAdvancedSubcategory(normalizedQuery, routingResult.category, semanticAnalysis);
            
            // Check for dynamic category opportunities
            const dynamicCategory = await this.checkAdvancedDynamicNeeds(normalizedQuery, userId, semanticAnalysis);
            
            // Apply sophisticated override logic
            const finalResult = await this.applySophisticatedOverrides(
                routingResult, subcategory, dynamicCategory, normalizedQuery, semanticAnalysis
            );

            // Update analytics and cache
            const processingTime = Date.now() - startTime;
            this.updateRoutingAnalytics(finalResult, processingTime, semanticAnalysis);
            this.cacheRoutingResult(cacheKey, finalResult);

            console.log(`[ROUTING] ✅ Routed to: ${finalResult.primaryCategory}/${finalResult.subcategory} (confidence: ${finalResult.confidence.toFixed(3)}, ${processingTime}ms)`);

            return finalResult;

        } catch (error) {
            console.error('[ROUTING] Critical error in advanced routing:', error);
            return this.getFallbackRouting(query, 'routing_error');
        }
    }

    /**
     * COMPREHENSIVE INPUT VALIDATION
     */
    validateAndNormalizeQuery(query) {
        try {
            let queryString;
            
            // Handle various input types safely
            if (typeof query === 'string') {
                queryString = query.trim();
            } else if (query && typeof query === 'object') {
                // Handle object inputs with various property names
                queryString = query.message || query.content || query.text || query.query || '';
                if (typeof queryString !== 'string') {
                    queryString = JSON.stringify(query);
                }
            } else {
                queryString = String(query || '').trim();
            }

            // Validation checks
            if (queryString.length === 0) {
                return { valid: false, error: 'Empty query' };
            }
            if (queryString.length > 10000) {
                return { valid: false, error: 'Query too long', query: queryString.substring(0, 10000) };
            }

            // Normalize the query
            const normalized = queryString
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .trim();

            return { valid: true, query: normalized, originalLength: queryString.length };

        } catch (error) {
            console.warn('[ROUTING] Error normalizing query:', error);
            return { valid: false, error: 'Normalization failed' };
        }
    }

    /**
     * ADVANCED SEMANTIC ANALYSIS - Enhanced NLP processing
     */
    async performAdvancedSemanticAnalysis(query, userId) {
        const cacheKey = `semantic_${this.generateHash(query)}`;
        if (this.semanticCache.has(cacheKey)) {
            return this.semanticCache.get(cacheKey);
        }

        const analysis = {
            intent: 'general',
            confidence: 0.5,
            hasPossessive: false,
            hasMemoryReference: false,
            hasPersonalContext: false,
            hasEmotionalContent: false,
            entities: new Set(),
            contextClues: new Set(),
            linguisticFeatures: {},
            processingTime: Date.now()
        };

        try {
            // Intent classification with confidence scoring
            analysis.intent = this.classifyIntent(query);
            
            // Possessive detection using advanced patterns
            analysis.hasPossessive = this.detectPossessiveContent(query);
            
            // Memory reference detection
            analysis.hasMemoryReference = this.detectMemoryReferences(query);
            
            // Personal context detection
            analysis.hasPersonalContext = this.detectPersonalContext(query);
            
            // Emotional content analysis
            analysis.hasEmotionalContent = this.detectEmotionalContent(query);
            
            // Advanced entity extraction
            analysis.entities = await this.extractEntities(query);
            
            // Context clue identification
            analysis.contextClues = this.identifyContextClues(query);
            
            // Linguistic feature analysis
            analysis.linguisticFeatures = this.analyzeLinguisticFeatures(query);
            
            // Calculate overall confidence
            analysis.confidence = this.calculateSemanticConfidence(analysis);

            // Cache the analysis
            this.cacheSemanticAnalysis(cacheKey, analysis);

            return analysis;

        } catch (error) {
            console.warn('[ROUTING] Error in semantic analysis:', error);
            analysis.error = error.message;
            return analysis;
        }
    }

    /**
     * INTENT CLASSIFICATION with confidence scoring
     */
    classifyIntent(query) {
        const intentScores = {};
        
        for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
            let score = 0;
            for (const pattern of patterns) {
                if (query.includes(pattern)) {
                    score += pattern.length > 3 ? 2 : 1; // Longer patterns get higher weight
                }
            }
            intentScores[intent] = score;
        }

        // Special pattern matching for better intent detection
        if (query.includes('?')) intentScores.information_request = (intentScores.information_request || 0) + 2;
        if (query.match(/^(what|how|when|where|why|who|which)/)) intentScores.information_request = (intentScores.information_request || 0) + 3;
        if (query.includes('help') || query.includes('problem')) intentScores.problem_seeking = (intentScores.problem_seeking || 0) + 2;

        const bestIntent = Object.keys(intentScores).reduce((a, b) => 
            intentScores[a] > intentScores[b] ? a : b, 'general'
        );

        return intentScores[bestIntent] > 0 ? bestIntent : 'general';
    }

    /**
     * ADVANCED POSSESSIVE DETECTION
     */
    detectPossessiveContent(query) {
        for (const pattern of this.possessivePatterns) {
            if (pattern.test(query)) {
                return true;
            }
        }
        return false;
    }

    /**
     * MEMORY REFERENCE DETECTION
     */
    detectMemoryReferences(query) {
        const memoryIndicators = ['remember', 'recall', 'told you', 'mentioned', 'said before', 'discussed', 'talked about', 'you know'];
        return memoryIndicators.some(indicator => query.includes(indicator));
    }

    /**
     * PERSONAL CONTEXT DETECTION
     */
    detectPersonalContext(query) {
        const personalIndicators = ['my ', 'our ', 'personal', 'family', 'home', 'private'];
        return personalIndicators.some(indicator => query.includes(indicator));
    }

    /**
     * EMOTIONAL CONTENT DETECTION
     */
    detectEmotionalContent(query) {
        const emotionalWords = ['feel', 'feeling', 'emotional', 'happy', 'sad', 'angry', 'worried', 'excited', 'frustrated', 'love', 'hate', 'stressed', 'anxious'];
        return emotionalWords.some(word => query.includes(word));
    }

    /**
     * ADVANCED ENTITY EXTRACTION
     */
    async extractEntities(query) {
        const entities = new Set();
        
        for (const [entityType, pattern] of Object.entries(this.entityPatterns)) {
            const matches = query.matchAll(pattern);
            for (const match of matches) {
                entities.add(entityType);
            }
        }

        // Special entity detection logic
        if (query.includes('monkey') || query.includes('monkeys')) {
            if (this.detectPossessiveContent(query) || query.includes('pet')) {
                entities.add('pets');
            } else if (query.includes('site') || query.includes('business')) {
                entities.add('business');
            }
        }

        return entities;
    }

    /**
     * CONTEXT CLUE IDENTIFICATION
     */
    identifyContextClues(query) {
        const contextClues = new Set();
        
        const cluePatterns = {
            urgency: ['urgent', 'emergency', 'asap', 'immediately', 'critical'],
            frequency: ['always', 'often', 'usually', 'sometimes', 'rarely', 'never'],
            time: ['today', 'yesterday', 'tomorrow', 'recently', 'lately', 'soon'],
            location: ['here', 'there', 'home', 'work', 'office', 'outside'],
            emotion: ['love', 'hate', 'like', 'dislike', 'enjoy', 'prefer'],
            quantity: ['all', 'some', 'many', 'few', 'most', 'several']
        };

        for (const [clueType, patterns] of Object.entries(cluePatterns)) {
            if (patterns.some(pattern => query.includes(pattern))) {
                contextClues.add(clueType);
            }
        }

        return contextClues;
    }

    /**
     * LINGUISTIC FEATURE ANALYSIS
     */
    analyzeLinguisticFeatures(query) {
        return {
            length: query.length,
            wordCount: query.split(' ').length,
            hasQuestion: query.includes('?'),
            hasNegation: /\b(not|no|never|don't|doesn't|won't|can't|shouldn't)\b/.test(query),
            hasComparison: /\b(better|worse|more|less|compared|versus|vs)\b/.test(query),
            hasTimeReference: /\b(when|time|date|day|week|month|year|today|tomorrow|yesterday)\b/.test(query),
            complexityScore: this.calculateComplexityScore(query)
        };
    }

    calculateComplexityScore(query) {
        let score = 0;
        score += Math.min(query.length / 100, 2); // Length factor
        score += Math.min(query.split(' ').length / 10, 2); // Word count factor
        score += (query.match(/[,;:]/g) || []).length * 0.5; // Punctuation complexity
        score += (query.match(/\b(and|or|but|however|therefore|because)\b/g) || []).length * 0.3; // Conjunction complexity
        return Math.min(score, 5); // Cap at 5
    }

    /**
     * SEMANTIC CONFIDENCE CALCULATION
     */
    calculateSemanticConfidence(analysis) {
        let confidence = 0.3; // Base confidence

        // Intent confidence boost
        if (analysis.intent !== 'general') confidence += 0.2;
        
        // Possessive content boost
        if (analysis.hasPossessive) confidence += 0.15;
        
        // Memory reference boost
        if (analysis.hasMemoryReference) confidence += 0.25;
        
        // Entity detection boost
        confidence += Math.min(analysis.entities.size * 0.1, 0.3);
        
        // Context clues boost
        confidence += Math.min(analysis.contextClues.size * 0.05, 0.2);
        
        // Linguistic complexity boost
        if (analysis.linguisticFeatures.complexityScore > 2) confidence += 0.1;

        return Math.min(confidence, 1.0);
    }

    /**
     * ADVANCED CATEGORY SCORING
     */
    async calculateAdvancedCategoryScores(query, semanticAnalysis) {
        const categoryScores = {};
        
        for (const [categoryName, patterns] of Object.entries(this.routingPatterns)) {
            let score = 0;
            
            // Keyword matching with semantic weighting
            for (const keyword of patterns.keywords) {
                if (query.includes(keyword)) {
                    score += this.getSemanticKeywordWeight(keyword, semanticAnalysis, categoryName);
                }
            }
            
            // Context pattern matching
            for (const contextPattern of patterns.contextPatterns) {
                if (query.includes(contextPattern)) {
                    score += 3.0; // High weight for context patterns
                }
            }
            
            // Semantic cluster matching
            score += this.calculateSemanticClusterScore(query, patterns.semanticClusters, semanticAnalysis);
            
            // Intent alignment bonus
            score += this.calculateIntentAlignmentBonus(semanticAnalysis.intent, categoryName);
            
            // Entity alignment bonus
            score += this.calculateEntityAlignmentBonus(semanticAnalysis.entities, categoryName);
            
            categoryScores[categoryName] = score;
        }

        return categoryScores;
    }

    /**
     * SEMANTIC KEYWORD WEIGHTING
     */
    getSemanticKeywordWeight(keyword, semanticAnalysis, categoryName) {
        let weight = 1.0;
        
        // Possessive context weighting
        if (semanticAnalysis.hasPossessive) {
            const possessiveKeywords = ['my', 'our', 'family', 'pet', 'home', 'personal'];
            if (possessiveKeywords.includes(keyword)) weight *= 2.0;
        }
        
        // Memory reference weighting
        if (semanticAnalysis.hasMemoryReference) {
            const memoryKeywords = ['remember', 'recall', 'told', 'mentioned'];
            if (memoryKeywords.includes(keyword)) weight *= 1.8;
        }
        
        // Entity alignment weighting
        if (semanticAnalysis.entities.has('pets') && ['pet', 'monkey', 'dog', 'cat'].includes(keyword)) weight *= 2.5;
        if (semanticAnalysis.entities.has('vehicles') && ['car', 'vehicle', 'truck'].includes(keyword)) weight *= 2.0;
        if (semanticAnalysis.entities.has('business') && ['business', 'work', 'company'].includes(keyword)) weight *= 1.5;
        
        // Category-specific weighting
        if (categoryName === 'relationships_social' && semanticAnalysis.hasPersonalContext) weight *= 1.3;
        if (categoryName === 'home_lifestyle' && semanticAnalysis.hasPossessive) weight *= 1.4;
        
        return weight;
    }

    /**
     * SEMANTIC CLUSTER SCORING
     */
    calculateSemanticClusterScore(query, clusters, semanticAnalysis) {
        if (!clusters) return 0;
        
        let clusterScore = 0;
        for (const [clusterName, clusterKeywords] of Object.entries(clusters)) {
            let matches = 0;
            for (const keyword of clusterKeywords) {
                if (query.includes(keyword)) matches++;
            }
            if (matches > 0) {
                clusterScore += Math.sqrt(matches) * 0.5; // Diminishing returns for multiple matches
            }
        }
        return clusterScore;
    }

    /**
     * INTENT ALIGNMENT BONUS
     */
    calculateIntentAlignmentBonus(intent, categoryName) {
        const alignments = {
            memory_recall: {
                relationships_social: 0.5,
                home_lifestyle: 0.4,
                personal_development: 0.3
            },
            personal_sharing: {
                home_lifestyle: 0.6,
                relationships_social: 0.5,
                personal_development: 0.3
            },
            information_request: {
                health_wellness: 0.3,
                technology_tools: 0.4,
                financial_management: 0.3
            },
            problem_seeking: {
                health_wellness: 0.4,
                technology_tools: 0.5,
                business_career: 0.3
            }
        };
        
        return alignments[intent]?.[categoryName] || 0;
    }

    /**
     * ENTITY ALIGNMENT BONUS
     */
    calculateEntityAlignmentBonus(entities, categoryName) {
        const alignments = {
            pets: { relationships_social: 1.0 },
            family: { relationships_social: 1.2 },
            vehicles: { home_lifestyle: 1.0 },
            business: { business_career: 1.5 },
            home: { home_lifestyle: 1.0 }
        };
        
        let bonus = 0;
        for (const entity of entities) {
            bonus += alignments[entity]?.[categoryName] || 0;
        }
        return bonus;
    }

    /**
     * DETERMINE BEST CATEGORY with confidence
     */
    determineBestCategory(categoryScores, semanticAnalysis, query) {
        const sortedCategories = Object.entries(categoryScores)
            .sort(([,a], [,b]) => b - a);
        
        const [bestCategory, bestScore] = sortedCategories[0];
        const [secondCategory, secondScore] = sortedCategories[1] || ['', 0];
        
        // Calculate confidence based on score separation and semantic analysis
        let confidence = this.calculateRoutingConfidence(bestScore, secondScore, semanticAnalysis);
        
        return {
            category: bestCategory,
            confidence: confidence,
            score: bestScore,
            alternativeCategory: secondCategory,
            alternativeScore: secondScore
        };
    }

    /**
     * ROUTING CONFIDENCE CALCULATION
     */
    calculateRoutingConfidence(bestScore, secondScore, semanticAnalysis) {
        // Base confidence from score
        let confidence = Math.min(bestScore / 8.0, 0.6); // Normalize to max 0.6
        
        // Separation bonus (how much better is first vs second)
        const separation = bestScore - secondScore;
        confidence += Math.min(separation / 10.0, 0.2);
        
        // Semantic analysis boost
        confidence += semanticAnalysis.confidence * 0.3;
        
        // Special high-confidence patterns
        if (semanticAnalysis.hasMemoryReference && semanticAnalysis.entities.size > 0) {
            confidence = Math.max(confidence, 0.85);
        }
        
        if (semanticAnalysis.hasPossessive && semanticAnalysis.hasPersonalContext) {
            confidence = Math.max(confidence, 0.8);
        }
        
        return Math.min(Math.max(confidence, 0.2), 1.0);
    }

    /**
     * ADVANCED SUBCATEGORY ROUTING
     */
    async routeToAdvancedSubcategory(query, categoryName, semanticAnalysis) {
        const patterns = this.routingPatterns[categoryName];
        if (!patterns || !patterns.subcategoryRouting) return null;

        const subcategoryScores = {};
        
        for (const [subcategory, keywords] of Object.entries(patterns.subcategoryRouting)) {
            let score = 0;
            
            // Direct keyword matching
            for (const keyword of keywords) {
                if (query.includes(keyword)) {
                    score += this.getSubcategoryKeywordWeight(keyword, semanticAnalysis);
                }
            }
            
            // Semantic alignment
            score += this.calculateSubcategorySemanticAlignment(subcategory, semanticAnalysis);
            
            subcategoryScores[subcategory] = score;
        }

        const bestSubcategory = Object.keys(subcategoryScores).reduce((a, b) => 
            subcategoryScores[a] > subcategoryScores[b] ? a : b
        );

        return subcategoryScores[bestSubcategory] > 0 
            ? bestSubcategory 
            : Object.keys(patterns.subcategoryRouting)[0]; // Default to first subcategory
    }

    getSubcategoryKeywordWeight(keyword, semanticAnalysis) {
        let weight = 1.0;
        
        if (semanticAnalysis.hasPossessive && ['pet', 'vehicle', 'belongings'].includes(keyword)) {
            weight *= 1.8;
        }
        
        if (semanticAnalysis.hasEmotionalContent && ['family', 'relationship', 'social'].includes(keyword)) {
            weight *= 1.3;
        }
        
        return weight;
    }

    calculateSubcategorySemanticAlignment(subcategory, semanticAnalysis) {
        const alignments = {
            family_dynamics: semanticAnalysis.entities.has('family') || semanticAnalysis.entities.has('pets') ? 0.5 : 0,
            personal_possessions: semanticAnalysis.hasPossessive ? 0.6 : 0,
            business_strategy: semanticAnalysis.entities.has('business') ? 0.7 : 0
        };
        
        return alignments[subcategory] || 0;
    }

    /**
     * ADVANCED DYNAMIC CATEGORY DETECTION
     */
    async checkAdvancedDynamicNeeds(query, userId, semanticAnalysis) {
        const intensityMarkers = ['crisis', 'emergency', 'urgent', 'major', 'life-changing', 'critical', 'serious'];
        const frequencyMarkers = ['again', 'still', 'continue', 'ongoing', 'persistent', 'always', 'constantly'];
        const transitionMarkers = ['change', 'transition', 'moving', 'starting', 'ending', 'new', 'different'];
        
        const hasIntensity = intensityMarkers.some(marker => query.includes(marker));
        const hasFrequency = frequencyMarkers.some(marker => query.includes(marker));
        const hasTransition = transitionMarkers.some(marker => query.includes(marker));
        
        if (hasIntensity || hasFrequency || hasTransition) {
            return this.suggestAdvancedDynamicCategory(query, semanticAnalysis, {
                hasIntensity, hasFrequency, hasTransition
            });
        }
        
        return null;
    }

    /**
     * ADVANCED DYNAMIC CATEGORY SUGGESTION
     */
    suggestAdvancedDynamicCategory(query, semanticAnalysis, markers) {
        const focusPatterns = {
            health_crisis: {
                keywords: ['hospital', 'surgery', 'diagnosis', 'treatment', 'medical emergency', 'health crisis'],
                confidence: 0.9
            },
            relationship_transition: {
                keywords: ['divorce', 'breakup', 'marriage', 'moving in', 'separation', 'relationship change'],
                confidence: 0.8
            },
            career_transition: {
                keywords: ['job search', 'career change', 'new job', 'promotion', 'layoff', 'career shift'],
                confidence: 0.85
            },
            financial_crisis: {
                keywords: ['bankruptcy', 'debt crisis', 'financial emergency', 'money problems', 'financial trouble'],
                confidence: 0.9
            },
            family_situation: {
                keywords: ['pregnancy', 'new baby', 'elderly parent', 'family crisis', 'family change'],
                confidence: 0.8
            },
            major_project: {
                keywords: ['renovation', 'move', 'startup', 'big project', 'major change', 'life project'],
                confidence: 0.7
            }
        };

        for (const [focus, pattern] of Object.entries(focusPatterns)) {
            if (pattern.keywords.some(keyword => query.includes(keyword))) {
                let confidence = pattern.confidence;
                
                // Boost confidence based on markers
                if (markers.hasIntensity) confidence += 0.1;
                if (markers.hasFrequency) confidence += 0.05;
                if (markers.hasTransition) confidence += 0.05;
                
                return {
                    suggestedFocus: focus,
                    confidence: Math.min(confidence, 1.0),
                    reason: `Detected ${focus.replace('_', ' ')} patterns with ${Object.keys(markers).filter(k => markers[k]).join(', ')} markers`,
                    semanticSupport: semanticAnalysis.confidence > 0.7
                };
            }
        }

        return null;
    }

    /**
     * SOPHISTICATED OVERRIDE LOGIC
     */
    async applySophisticatedOverrides(routingResult, subcategory, dynamicCategory, query, semanticAnalysis) {
        let { category, confidence } = routingResult;
        
        // Advanced monkey/pet disambiguation
        if (query.includes('monkey') || query.includes('monkeys')) {
            const contextResult = await this.resolveMonkeyContext(query, semanticAnalysis);
            if (contextResult.override) {
                category = contextResult.category;
                confidence = Math.max(confidence, contextResult.confidence);
                console.log(`[ROUTING] Monkey context resolved: ${contextResult.reasoning}`);
            }
        }
        
        // Possessive content override
        if (confidence < 0.5 && semanticAnalysis.hasPossessive && semanticAnalysis.entities.has('pets')) {
            category = 'relationships_social';
            subcategory = 'family_dynamics';
            confidence = Math.max(confidence, 0.8);
            console.log('[ROUTING] Possessive pet content override applied');
        }
        
        // Vehicle possessions override
        if (semanticAnalysis.entities.has('vehicles') && semanticAnalysis.hasPossessive) {
            if (category !== 'home_lifestyle') {
                category = 'home_lifestyle';
                subcategory = 'personal_possessions';
                confidence = Math.max(confidence, 0.75);
                console.log('[ROUTING] Vehicle possession override applied');
            }
        }
        
        // Business context override
        if (semanticAnalysis.entities.has('business') && !semanticAnalysis.hasPossessive) {
            if (category !== 'business_career') {
                category = 'business_career';
                subcategory = 'business_strategy';
                confidence = Math.max(confidence, 0.8);
                console.log('[ROUTING] Business context override applied');
            }
        }
        
        return {
            primaryCategory: category,
            subcategory: subcategory,
            dynamicCategory: dynamicCategory,
            confidence: confidence,
            reasoning: this.generateRoutingReasoning(semanticAnalysis, routingResult),
            processingMetadata: {
                semanticAnalysisTime: Date.now() - semanticAnalysis.processingTime,
                overridesApplied: true,
                version: '3.0'
            }
        };
    }

    /**
     * ADVANCED MONKEY CONTEXT RESOLUTION
     */
    async resolveMonkeyContext(query, semanticAnalysis) {
        // Personal pet context
        if (semanticAnalysis.hasPossessive || 
            query.includes('my monkey') || 
            query.includes('pet') ||
            query.includes('children') ||
            query.includes('family')) {
            return {
                override: true,
                category: 'relationships_social',
                confidence: 0.9,
                reasoning: 'Personal pet/family context detected'
            };
        }
        
        // Business brand context
        if (query.includes('site monkeys') || 
            query.includes('site-monkeys') ||
            query.includes('business') ||
            query.includes('company') ||
            query.includes('brand')) {
            return {
                override: true,
                category: 'business_career',
                confidence: 0.85,
                reasoning: 'Business brand context detected'
            };
        }
        
        // Ambiguous - use other context clues
        if (semanticAnalysis.hasPersonalContext) {
            return {
                override: true,
                category: 'relationships_social',
                confidence: 0.7,
                reasoning: 'Personal context suggests pet reference'
            };
        }
        
        return { override: false };
    }

    /**
     * ROUTING REASONING GENERATION
     */
    generateRoutingReasoning(semanticAnalysis, routingResult) {
        const reasons = [];
        
        reasons.push(`Intent: ${semanticAnalysis.intent}`);
        
        if (semanticAnalysis.hasPossessive) reasons.push('possessive content');
        if (semanticAnalysis.hasMemoryReference) reasons.push('memory reference');
        if (semanticAnalysis.entities.size > 0) reasons.push(`entities: ${Array.from(semanticAnalysis.entities).join(', ')}`);
        if (semanticAnalysis.contextClues.size > 0) reasons.push(`context: ${Array.from(semanticAnalysis.contextClues).join(', ')}`);
        
        reasons.push(`confidence: ${routingResult.confidence.toFixed(3)}`);
        
        return reasons.join('; ');
    }

    /**
     * PERFORMANCE OPTIMIZATION METHODS
     */
    generateRoutingCacheKey(query, userId) {
        return `routing_${this.generateHash(query)}_${userId || 'anonymous'}`;
    }

    generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    cacheRoutingResult(cacheKey, result) {
        if (this.routingCache.size >= this.maxCacheSize) {
            const firstKey = this.routingCache.keys().next().value;
            this.routingCache.delete(firstKey);
        }
        this.routingCache.set(cacheKey, result);
    }

    cacheSemanticAnalysis(cacheKey, analysis) {
        if (this.semanticCache.size >= this.maxCacheSize) {
            const firstKey = this.semanticCache.keys().next().value;
            this.semanticCache.delete(firstKey);
        }
        this.semanticCache.set(cacheKey, analysis);
    }

    /**
     * ANALYTICS AND MONITORING
     */
    updateRoutingAnalytics(result, processingTime, semanticAnalysis) {
        setTimeout(() => {
            try {
                this.routingStats.totalRoutings++;
                
                // Update timing
                const count = this.routingStats.totalRoutings;
                this.routingStats.avgRoutingTime = ((this.routingStats.avgRoutingTime * (count - 1)) + processingTime) / count;
                
                // Update category distribution
                const category = result.primaryCategory;
                const current = this.routingStats.categoryDistribution.get(category) || 0;
                this.routingStats.categoryDistribution.set(category, current + 1);
                
                // Update confidence stats
                const confidence = result.confidence;
                this.routingStats.confidenceStats.min = Math.min(this.routingStats.confidenceStats.min, confidence);
                this.routingStats.confidenceStats.max = Math.max(this.routingStats.confidenceStats.max, confidence);
                this.routingStats.confidenceStats.sum += confidence;
                
            } catch (error) {
                console.warn('[ROUTING] Error updating analytics:', error);
            }
        }, 0);
    }

    /**
     * FALLBACK ROUTING SYSTEM
     */
    getFallbackRouting(query, reason = 'unknown') {
        console.log(`[ROUTING] Using fallback routing, reason: ${reason}`);
        
        try {
            const queryString = String(query || '').toLowerCase();
            
            // Smart fallback based on simple patterns
            if (queryString.includes('my ') && (queryString.includes('pet') || queryString.includes('family') || queryString.includes('children'))) {
                return {
                    primaryCategory: 'relationships_social',
                    subcategory: 'family_dynamics',
                    confidence: 0.6,
                    reasoning: `Fallback: detected personal/family content (${reason})`,
                    isFallback: true
                };
            }
            
            if (queryString.includes('health') || queryString.includes('medical') || queryString.includes('doctor')) {
                return {
                    primaryCategory: 'health_wellness',
                    subcategory: 'physical_health',
                    confidence: 0.5,
                    reasoning: `Fallback: detected health content (${reason})`,
                    isFallback: true
                };
            }
            
            // Use fallback chain
            const fallback = this.fallbackChain[0];
            return {
                primaryCategory: fallback.category,
                subcategory: 'goal_setting',
                confidence: fallback.confidence,
                reasoning: `Fallback: default categorization (${reason})`,
                isFallback: true
            };
            
        } catch (error) {
            console.error('[ROUTING] Error in fallback routing:', error);
            return {
                primaryCategory: 'personal_development',
                subcategory: 'goal_setting',
                confidence: 0.3,
                reasoning: `Emergency fallback due to error: ${error.message}`,
                isFallback: true
            };
        }
    }

    /**
     * UTILITY METHODS
     */
    truncateString(str, length) {
        if (typeof str !== 'string') return '';
        return str.length > length ? str.substring(0, length) + '...' : str;
    }

    getFallbackCategories(primaryCategory) {
        return this.fallbackChain
            .filter(f => f.category !== primaryCategory)
            .map(f => f.category);
    }

    /**
     * ANALYTICS AND HEALTH MONITORING
     */
    getRoutingStats() {
        const uptime = Date.now() - this.routingStats.lastReset;
        const avgConfidence = this.routingStats.totalRoutings > 0 
            ? this.routingStats.confidenceStats.sum / this.routingStats.totalRoutings 
            : 0;

        return {
            totalRoutings: this.routingStats.totalRoutings,
            cacheHitRate: this.routingStats.totalRoutings > 0 
                ? (this.routingStats.cacheHits / (this.routingStats.cacheHits + this.routingStats.cacheMisses)).toFixed(3)
                : 0,
            avgRoutingTime: Math.round(this.routingStats.avgRoutingTime),
            categoryDistribution: Object.fromEntries(this.routingStats.categoryDistribution),
            confidenceStats: {
                min: this.routingStats.confidenceStats.min,
                max: this.routingStats.confidenceStats.max,
                avg: Number(avgConfidence.toFixed(3))
            },
            cacheStats: {
                routingCacheSize: this.routingCache.size,
                semanticCacheSize: this.semanticCache.size,
                patternCacheSize: this.patternCache.size
            },
            uptime: uptime,
            routingsPerMinute: uptime > 0 ? Number((this.routingStats.totalRoutings / (uptime / 60000)).toFixed(2)) : 0
        };
    }

    getHealthStatus() {
        const totalCacheSize = this.routingCache.size + this.semanticCache.size + this.patternCache.size;
        const maxTotalCache = this.maxCacheSize * 3;
        const memoryPressure = totalCacheSize / maxTotalCache;
        
        return {
            status: memoryPressure < 0.7 ? 'healthy' : memoryPressure < 0.9 ? 'warning' : 'critical',
            memoryPressure: Number(memoryPressure.toFixed(2)),
            cacheUtilization: {
                routing: Number((this.routingCache.size / this.maxCacheSize).toFixed(2)),
                semantic: Number((this.semanticCache.size / this.maxCacheSize).toFixed(2)),
                pattern: Number((this.patternCache.size / this.maxCacheSize).toFixed(2))
            },
            performance: {
                avgRoutingTime: Math.round(this.routingStats.avgRoutingTime),
                cacheHitRate: this.routingStats.totalRoutings > 0 
                    ? Number((this.routingStats.cacheHits / (this.routingStats.cacheHits + this.routingStats.cacheMisses)).toFixed(3))
                    : 0
            },
            lastCheck: new Date().toISOString()
        };
    }

    /**
     * CLEANUP AND MEMORY MANAGEMENT
     */
    cleanup() {
        console.log('[ROUTING] Starting cleanup process...');
        
        this.routingCache.clear();
        this.semanticCache.clear();
        this.patternCache.clear();
        
        // Reset stats but keep core metrics
        const coreStats = {
            totalRoutings: this.routingStats.totalRoutings,
            avgRoutingTime: this.routingStats.avgRoutingTime,
            categoryDistribution: this.routingStats.categoryDistribution
        };
        
        this.routingStats = {
            ...coreStats,
            cacheHits: 0,
            cacheMisses: 0,
            confidenceStats: { min: 1, max: 0, sum: 0 },
            lastReset: Date.now()
        };
        
        console.log('[ROUTING] Cleanup completed - all caches cleared, core stats preserved');
    }
}

export default RoutingIntelligence;
