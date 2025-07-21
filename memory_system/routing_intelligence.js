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
                keywords: ['family', 'spouse', 'partner', 'boyfriend', 'girlfriend', 'marriage', 'relationship', 'friend', 'social', 'colleague', 'coworker', 'conflict', 'communication', 'love', 'dating', 'children', 'parents'],
                contextPatterns: ['relationship issue', 'family problem', 'social situation', 'communication breakdown'],
                subcategoryRouting: {
                    family_dynamics: ['family', 'parents', 'children', 'siblings', 'relatives'],
                    romantic_relationships: ['spouse', 'partner', 'boyfriend', 'girlfriend', 'dating', 'marriage'],
                    friendships: ['friend', 'social', 'friendship', 'social circle'],
                    professional_relationships: ['colleague', 'coworker', 'boss', 'team', 'workplace relationship'],
                    social_interactions: ['social', 'communication', 'conflict', 'interaction']
                }
            },

            // BUSINESS & CAREER ROUTING
            business_career: {
                keywords: ['work', 'job', 'career', 'business', 'company', 'project', 'meeting', 'boss', 'employee', 'salary', 'promotion', 'performance', 'deadline', 'client', 'customer', 'revenue', 'profit', 'strategy'],
                contextPatterns: ['work issue', 'business problem', 'career decision', 'project deadline'],
                subcategoryRouting: {
                    work_performance: ['performance', 'productivity', 'deadline', 'task', 'efficiency'],
                    career_planning: ['career', 'promotion', 'job search', 'professional development'],
                    business_strategy: ['business', 'strategy', 'revenue', 'profit', 'growth'],
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
            }
        };

        this.fallbackChain = [
            'health_wellness',
            'relationships_social', 
            'business_career',
            'financial_management',
            'technology_tools',
            'personal_development',
            'home_lifestyle'
        ];
    }

    routeToCategory(query, userId = null) {
        const normalizedQuery = query.toLowerCase();
        const routingScores = {};

        // Score each category
        for (const [categoryName, patterns] of Object.entries(this.routingPatterns)) {
            let score = 0;

            // Keyword matching
            for (const keyword of patterns.keywords) {
                if (normalizedQuery.includes(keyword)) {
                    score += 2; // High weight for direct keyword matches
                }
            }

            // Context pattern matching
            for (const pattern of patterns.contextPatterns) {
                if (normalizedQuery.includes(pattern)) {
                    score += 3; // Higher weight for context patterns
                }
            }

            // Semantic similarity (basic implementation)
            score += this.calculateSemanticSimilarity(normalizedQuery, patterns.keywords);

            routingScores[categoryName] = score;
        }

        // Find best category
        const bestCategory = Object.keys(routingScores).reduce((a, b) => 
            routingScores[a] > routingScores[b] ? a : b
        );

        // Route to subcategory
        const subcategory = this.routeToSubcategory(normalizedQuery, bestCategory);

        // Check for dynamic category opportunities
        const dynamicCategory = this.checkDynamicCategoryNeeds(normalizedQuery, userId);

        return {
            primaryCategory: bestCategory,
            subcategory: subcategory,
            dynamicCategory: dynamicCategory,
            confidence: Math.max(...Object.values(routingScores)) / 10, // Normalize to 0-1
            allScores: routingScores
        };
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

    calculateSemanticSimilarity(query, keywords) {
        // Basic semantic similarity - can be enhanced with more sophisticated NLP
        const queryWords = query.split(' ');
        const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
        
        let matches = 0;
        for (const word of queryWords) {
            if (keywordSet.has(word)) matches++;
        }
        
        return matches * 0.5; // Lower weight than direct matches
    }

    checkDynamicCategoryNeeds(query, userId) {
        // AI determines if this query suggests need for a dynamic category
        const intensityMarkers = ['crisis', 'emergency', 'urgent', 'major', 'life-changing', 'critical'];
        const frequencyMarkers = ['again', 'still', 'continue', 'ongoing', 'persistent'];
        
        const hasIntensity = intensityMarkers.some(marker => query.includes(marker));
        const hasFrequency = frequencyMarkers.some(marker => query.includes(marker));
        
        if (hasIntensity || hasFrequency) {
            // Suggest creating/updating dynamic category
            return this.suggestDynamicCategoryFocus(query);
        }
        
        return null;
    }

    suggestDynamicCategoryFocus(query) {
        // Extract potential focus area from query
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

    getFallbackCategories(primaryCategory) {
        // Return fallback chain excluding primary
        return this.fallbackChain.filter(cat => cat !== primaryCategory);
    }
}

module.exports = RoutingIntelligence;
