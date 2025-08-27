// memory_system/routing_intelligence.js
// FIXED: Sophisticated semantic routing with bug fixes
// Maintains exact interface compatibility while boosting intelligence

console.log('[ROUTING] 🧠 Routing Intelligence loading...');

class RoutingIntelligence {
    constructor() {
        this.routingPatterns = {
            // HEALTH & WELLNESS ROUTING
            health_wellness: {
                keywords: ['health', 'medical', 'doctor', 'symptom', 'pain', 'illness', 'medication', 'fitness', 'exercise', 'diet', 'nutrition', 'mental health', 'therapy', 'anxiety', 'depression', 'wellness', 'sleep', 'energy'],
                contextPatterns: ['feeling sick', 'health issue', 'medical appointment', 'workout routine', 'eating habits', 'stress levels'],
                subcategoryRouting: {
                    physical_health: ['symptom', 'pain', 'injury', 'physical'],
                    mental_health: ['anxiety', 'depression', 'stress', 'therapy', 'emotional'],
                    medical_history: ['doctor', 'appointment', 'diagnosis', 'treatment'],
                    fitness_nutrition: ['exercise', 'workout', 'diet', 'nutrition', 'fitness'],
                    wellness_practices: ['wellness', 'meditation', 'sleep', 'relaxation']
                }
            },

            // RELATIONSHIPS & SOCIAL ROUTING
            relationships_social: {
                keywords: ['family', 'spouse', 'partner', 'boyfriend', 'girlfriend', 'marriage', 'relationship', 'friend', 'social', 'colleague', 'coworker', 'conflict', 'communication', 'love', 'dating', 'children', 'parents', 'pets', 'pet', 'monkey', 'monkeys', 'dog', 'cat', 'animal'],
                contextPatterns: ['relationship issue', 'family problem', 'social situation', 'communication breakdown', 'my pets', 'my monkey', 'my monkeys', 'pet names', 'family members'],
                subcategoryRouting: {
                    family_dynamics: ['family', 'parents', 'children', 'siblings', 'relatives', 'pets', 'pet', 'monkey', 'monkeys', 'dog', 'cat', 'names'],
                    romantic_relationships: ['spouse', 'partner', 'boyfriend', 'girlfriend', 'dating', 'marriage'],
                    friendships: ['friend', 'social', 'friendship', 'social circle'],
                    professional_relationships: ['colleague', 'coworker', 'boss', 'team', 'workplace relationship'],
                    social_interactions: ['social', 'communication', 'conflict', 'interaction']
                }
            },

            // BUSINESS & CAREER ROUTING
            business_career: {
                keywords: ['work', 'job', 'career', 'business', 'company', 'project', 'meeting', 'boss', 'employee', 'salary', 'promotion', 'performance', 'deadline', 'client', 'customer', 'revenue', 'profit', 'strategy', 'site monkeys', 'site-monkeys', 'sitemonkeys', 'brand', 'agency'],
                contextPatterns: ['work issue', 'business problem', 'career decision', 'project deadline', 'site monkeys business', 'brand strategy'],
                subcategoryRouting: {
                    work_performance: ['performance', 'productivity', 'deadline', 'task', 'efficiency'],
                    career_planning: ['career', 'promotion', 'job search', 'professional development'],
                    business_strategy: ['business', 'strategy', 'revenue', 'profit', 'growth', 'site monkeys', 'site-monkeys', 'sitemonkeys', 'brand'],
                    professional_development: ['skills', 'training', 'learning', 'certification'],
                    workplace_dynamics: ['team', 'boss', 'colleague', 'workplace culture']
                }
            },

            // FINANCIAL MANAGEMENT ROUTING
            financial_management: {
                keywords: ['money', 'budget', 'expense', 'income', 'salary', 'cost', 'price', 'investment', 'savings', 'debt', 'loan', 'credit', 'financial', 'bank', 'tax', 'insurance'],
                contextPatterns: ['financial issue', 'money problem', 'budget concern', 'investment decision'],
                subcategoryRouting: {
                    income_planning: ['salary', 'income', 'earnings', 'revenue', 'paycheck'],
                    expense_tracking: ['expense', 'cost', 'spending', 'budget', 'bills'],
                    investment_strategy: ['investment', 'stocks', 'portfolio', 'retirement', 'savings'],
                    debt_management: ['debt', 'loan', 'credit', 'mortgage', 'payment'],
                    financial_goals: ['financial goal', 'money goal', 'savings goal', 'financial planning']
                }
            },

            // TECHNOLOGY & TOOLS ROUTING
            technology_tools: {
                keywords: ['software', 'app', 'tool', 'system', 'computer', 'phone', 'technology', 'digital', 'online', 'website', 'program', 'automation', 'workflow', 'productivity'],
                contextPatterns: ['tech issue', 'software problem', 'system error', 'app not working'],
                subcategoryRouting: {
                    software_systems: ['software', 'program', 'system', 'application'],
                    productivity_tools: ['productivity', 'tool', 'workflow', 'efficiency'],
                    tech_troubleshooting: ['error', 'bug', 'problem', 'not working', 'broken'],
                    automation_workflows: ['automation', 'workflow', 'process', 'streamline'],
                    digital_organization: ['organization', 'digital', 'file', 'folder', 'storage']
                }
            },

            // HOME & LIFESTYLE ROUTING
            home_lifestyle: {
                keywords: [
                    'home', 'house', 'apartment', 'living', 'lifestyle', 'daily', 'routine', 'household',
                    'vehicle', 'vehicles', 'car', 'cars', 'truck', 'motorcycle', 'bike', 'boat', 'auto',
                    'own', 'owned', 'have', 'possess', 'possession', 'belongings', 'stuff', 'things', 'personal',
                    'hobby', 'hobbies', 'interest', 'interests', 'favorite', 'collection', 'gaming'
                ],
                contextPatterns: [
                    'what i own', 'things i have', 'my stuff', 'vehicles i own', 'cars i have', 'told you about'
                ],
                subcategoryRouting: {
                    personal_possessions: ['own', 'owned', 'have', 'possess', 'vehicle', 'car', 'truck', 'belongings'],
                    hobbies_interests: ['hobby', 'interest', 'favorite', 'collection', 'gaming', 'entertainment'],
                    daily_routines: ['routine', 'daily', 'lifestyle', 'household'],
                    home_environment: ['home', 'house', 'apartment', 'living'],
                    personal_preferences: ['personal', 'prefer', 'like', 'enjoy']
                }
            },

            // PERSONAL DEVELOPMENT ROUTING
            personal_development: {
                keywords: ['goal', 'goals', 'learn', 'learning', 'skill', 'skills', 'improve', 'improvement', 'growth', 'development', 'achievement', 'progress', 'challenge', 'motivation', 'habit', 'habits'],
                contextPatterns: ['personal goal', 'learning objective', 'skill development', 'self improvement'],
                subcategoryRouting: {
                    goal_setting: ['goal', 'goals', 'objective', 'target', 'achievement'],
                    skill_building: ['skill', 'skills', 'learn', 'learning', 'training'],
                    habit_formation: ['habit', 'habits', 'routine', 'consistency'],
                    mindset_growth: ['mindset', 'attitude', 'perspective', 'growth'],
                    motivation_progress: ['motivation', 'progress', 'improvement', 'development']
                }
            }
        };

        this.fallbackChain = ['relationships_social', 'personal_development', 'home_lifestyle', 'health_wellness'];
    }

    routeToCategory(query, userId = null) {
        try {
            // CRITICAL FIX: Type-safe query handling
            let queryString;
            
            if (typeof query === 'string') {
                queryString = query;
            } else if (query && typeof query === 'object') {
                if (query.message) queryString = String(query.message);
                else if (query.content) queryString = String(query.content);  
                else if (query.text) queryString = String(query.text);
                else queryString = JSON.stringify(query);
            } else {
                queryString = String(query || '');
            }

            const normalizedQuery = queryString.toLowerCase();
            console.log(`[ROUTING] 🎯 Processing query: "${normalizedQuery.substring(0, 60)}..."`);

            // SOPHISTICATED SEMANTIC ANALYSIS
            const semanticAnalysis = this.performSemanticAnalysis(normalizedQuery);
            
            // Calculate confidence scores for each category
            const routingScores = {};
            
            for (const [categoryName, patterns] of Object.entries(this.routingPatterns)) {
                routingScores[categoryName] = this.calculateCategoryScore(normalizedQuery, patterns, semanticAnalysis);
            }

            // Find best category
            let bestCategory = Object.keys(routingScores).reduce((a, b) => 
                routingScores[a] > routingScores[b] ? a : b
            );

            // Route to subcategory
            const subcategory = this.routeToSubcategory(normalizedQuery, bestCategory);

            // Check for dynamic category opportunities
            const dynamicCategory = this.checkDynamicCategoryNeeds(normalizedQuery, userId);

            // Calculate sophisticated confidence score
            let confidence = this.calculateSophisticatedConfidence(routingScores[bestCategory], semanticAnalysis, normalizedQuery);

            // SOPHISTICATED OVERRIDE LOGIC (REPLACES BUGGY BRAND OVERRIDE)
            const overrideResult = this.applySophisticatedOverrides(normalizedQuery, bestCategory, confidence, semanticAnalysis);
            bestCategory = overrideResult.category;
            confidence = overrideResult.confidence;

            console.log(`[ROUTING] ✅ Routed to: ${bestCategory}/${subcategory} (confidence: ${confidence})`);

            return {
                primaryCategory: bestCategory,
                subcategory: subcategory,
                dynamicCategory: dynamicCategory,
                confidence: confidence,
                reasoning: `Semantic analysis: ${semanticAnalysis.intent}, possessive: ${semanticAnalysis.hasPossessive}, entities: ${semanticAnalysis.entities.join(', ')}`
            };

        } catch (error) {
            console.error('[ROUTING] Error in routeToCategory:', error);
            return this.getFallbackRouting(query);
        }
    }

    performSemanticAnalysis(query) {
        const analysis = {
            intent: 'general',
            hasPossessive: false,
            hasMemoryReference: false,
            hasPersonalContext: false,
            entities: [],
            confidence: 0.5
        };

        // Intent classification
        if (query.includes('remember') || query.includes('recall') || query.includes('told you') || query.includes('mentioned')) {
            analysis.intent = 'memory_recall';
            analysis.hasMemoryReference = true;
            analysis.confidence = 0.9;
        } else if (query.includes('my ') || query.includes('our ') || query.includes('i have') || query.includes('i own')) {
            analysis.intent = 'personal_sharing';
            analysis.hasPossessive = true;
            analysis.confidence = 0.85;
        } else if (query.includes('?')) {
            analysis.intent = 'information_request';
            analysis.confidence = 0.7;
        }

        // Possessive detection
        analysis.hasPossessive = /\b(my|our|his|her|their)\s/.test(query);

        // Personal context detection
        analysis.hasPersonalContext = query.includes('my ') || query.includes('our ') || 
                                     query.includes('family') || query.includes('personal');

        // Entity extraction
        if (query.includes('monkey') || query.includes('monkeys')) {
            analysis.entities.push('pet');
        }
        if (query.includes('family') || query.includes('children') || query.includes('spouse')) {
            analysis.entities.push('family_member');
        }
        if (query.includes('car') || query.includes('vehicle')) {
            analysis.entities.push('vehicle');
        }
        if (query.includes('site monkeys') && !analysis.hasPossessive) {
            analysis.entities.push('business_brand');
        }

        return analysis;
    }

    calculateCategoryScore(query, patterns, semanticAnalysis) {
        let score = 0;

        // Keyword matching with semantic weighting
        for (const keyword of patterns.keywords) {
            if (query.includes(keyword)) {
                score += this.getKeywordWeight(keyword, semanticAnalysis);
            }
        }

        // Context pattern matching
        for (const contextPattern of patterns.contextPatterns || []) {
            if (query.includes(contextPattern)) {
                score += 2.0; // Higher weight for context patterns
            }
        }

        return score;
    }

    getKeywordWeight(keyword, semanticAnalysis) {
        // Higher weights for keywords that match semantic context
        if (semanticAnalysis.hasPossessive && ['my', 'our', 'family', 'pet', 'children'].includes(keyword)) {
            return 2.5; // Boost for possessive + personal entities
        }

        if (semanticAnalysis.hasMemoryReference && ['remember', 'recall', 'told'].includes(keyword)) {
            return 2.0; // Boost for memory references
        }

        return 1.0; // Standard weight
    }

    calculateSophisticatedConfidence(baseScore, semanticAnalysis, query) {
        let confidence = Math.min(baseScore / 10, 0.6); // Normalize base score

        // Confidence boosters based on semantic analysis
        if (semanticAnalysis.hasMemoryReference) {
            confidence += 0.25; // Strong boost for memory queries
        }

        if (semanticAnalysis.hasPossessive && semanticAnalysis.entities.length > 0) {
            confidence += 0.15; // Boost for possessive + entities
        }

        if (semanticAnalysis.intent === 'personal_sharing' && semanticAnalysis.confidence > 0.8) {
            confidence += 0.1; // Boost for clear personal context
        }

        // Special high-confidence patterns
        if (query.includes('my monkeys') || query.includes('my pets') || query.includes('my children')) {
            confidence = Math.max(confidence, 0.9); // Very high confidence for clear personal references
        }

        return Math.min(Math.max(confidence, 0.3), 1.0); // Clamp between 0.3 and 1.0
    }

    applySophisticatedOverrides(query, bestCategory, confidence, semanticAnalysis) {
        // FIXED: Sophisticated personal vs business detection
        // Rule: "my monkeys" = personal (relationships_social), "site monkeys" = business
        if (query.includes('monkeys')) {
            if (semanticAnalysis.hasPossessive || query.includes('my monkeys') || query.includes('pet')) {
                // Personal context - route to relationships
                if (bestCategory !== 'relationships_social') {
                    console.log('[ROUTING] Personal pet reference detected, routing to relationships_social');
                    return {
                        category: 'relationships_social',
                        confidence: Math.max(confidence, 0.9)
                    };
                }
            } else if (query.includes('site monkeys') || query.includes('business')) {
                // Business context - route to business_career
                if (bestCategory !== 'business_career') {
                    console.log('[ROUTING] Business brand reference detected, routing to business_career');
                    return {
                        category: 'business_career',
                        confidence: Math.max(confidence, 0.85)
                    };
                }
            }
        }

        // Possession override for clear possession queries
        if (confidence < 0.4 && this.containsPersonalPossessionWords(query)) {
            console.log('[ROUTING] Personal possession detected, routing to home_lifestyle');
            return {
                category: 'home_lifestyle',
                confidence: Math.max(confidence, 0.7)
            };
        }

        return {
            category: bestCategory,
            confidence: confidence
        };
    }

    containsPersonalPossessionWords(query) {
        const possessionPatterns = [
            'what i own', 'things i have', 'my stuff', 'i own', 'i have',
            'what vehicles', 'what cars', 'vehicles i own', 'cars i have', 'told you about'
        ];
        return possessionPatterns.some(pattern => query.includes(pattern));
    }

    routeToSubcategory(query, categoryName) {
        const patterns = this.routingPatterns[categoryName];
        if (!patterns || !patterns.subcategoryRouting) return null;

        const subcategoryScores = {};
        
        for (const [subcategory, keywords] of Object.entries(patterns.subcategoryRouting)) {
            let score = 0;
            for (const keyword of keywords) {
                if (query.includes(keyword)) {
                    score += 1;
                }
            }
            subcategoryScores[subcategory] = score;
        }

        const bestSubcategory = Object.keys(subcategoryScores).reduce((a, b) => 
            subcategoryScores[a] > subcategoryScores[b] ? a : b
        );

        return subcategoryScores[bestSubcategory] > 0 ? bestSubcategory : Object.keys(patterns.subcategoryRouting)[0];
    }

    checkDynamicCategoryNeeds(query, userId) {
        // AI determines if this query suggests need for a dynamic category
        const intensityMarkers = ['crisis', 'emergency', 'urgent', 'major', 'life-changing', 'critical'];
        const frequencyMarkers = ['again', 'still', 'continue', 'ongoing', 'persistent'];
        
        const hasIntensity = intensityMarkers.some(marker => query.includes(marker));
        const hasFrequency = frequencyMarkers.some(marker => query.includes(marker));
        
        if (hasIntensity || hasFrequency) {
            return this.suggestDynamicCategoryFocus(query);
        }
        
        return null;
    }

    suggestDynamicCategoryFocus(query) {
        const focusPatterns = {
            'health_crisis': ['hospital', 'surgery', 'diagnosis', 'treatment', 'medical emergency'],
            'relationship_transition': ['divorce', 'breakup', 'marriage', 'moving in', 'separation'],
            'career_transition': ['job search', 'career change', 'new job', 'promotion', 'layoff'],
            'financial_crisis': ['bankruptcy', 'debt crisis', 'financial emergency', 'money problems'],
            'family_situation': ['pregnancy', 'new baby', 'elderly parent', 'family crisis'],
            'major_project': ['renovation', 'move', 'startup', 'big project', 'major change']
        };

        for (const [focus, patterns] of Object.entries(focusPatterns)) {
            if (patterns.some(pattern => query.includes(pattern))) {
                return {
                    suggestedFocus: focus,
                    confidence: 0.8,
                    reason: `Detected patterns suggesting ${focus.replace('_', ' ')}`
                };
            }
        }

        return null;
    }

    getFallbackRouting(query) {
        console.log('[ROUTING] Using fallback routing');
        
        const queryString = String(query || '').toLowerCase();
        
        // Smart fallback based on query content
        if (queryString.includes('my ') && (queryString.includes('pet') || queryString.includes('family') || queryString.includes('children'))) {
            return {
                primaryCategory: 'relationships_social',
                subcategory: 'family_dynamics',
                confidence: 0.7,
                reasoning: 'Fallback: detected personal/family content'
            };
        }
        
        return {
            primaryCategory: 'personal_development',
            subcategory: 'goal_setting',
            confidence: 0.3,
            reasoning: 'Fallback: default categorization'
        };
    }

    getFallbackCategories(primaryCategory) {
        return this.fallbackChain.filter(cat => cat !== primaryCategory);
    }
}

export default RoutingIntelligence;
