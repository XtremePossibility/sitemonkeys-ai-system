import pkg from 'pg';
const { Pool } = pkg;

// Simple logger for memory system
const memoryLogger = {
    log: (message) => console.log(`[MEMORY] ${new Date().toISOString()} ${message}`),
    error: (message, error) => console.error(`[MEMORY ERROR] ${new Date().toISOString()} ${message}`, error),
    warn: (message) => console.warn(`[MEMORY WARN] ${new Date().toISOString()} ${message}`)
};

class MemoryCore {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        
        this.categories = {
            // 11 MAIN PREDETERMINED CATEGORIES (50K each)
            health_wellness: { maxTokens: 50000, subcategories: ['physical_health', 'mental_health', 'medical_history', 'fitness_nutrition', 'wellness_practices'] },
            relationships_social: { maxTokens: 50000, subcategories: ['family_dynamics', 'romantic_relationships', 'friendships', 'professional_relationships', 'social_interactions'] },
            business_career: { maxTokens: 50000, subcategories: ['work_performance', 'career_planning', 'business_strategy', 'professional_development', 'workplace_dynamics'] },
            financial_management: { maxTokens: 50000, subcategories: ['income_planning', 'expense_tracking', 'investment_strategy', 'debt_management', 'financial_goals'] },
            personal_development: { maxTokens: 50000, subcategories: ['skill_building', 'goal_setting', 'habit_formation', 'learning_projects', 'self_improvement'] },
            home_lifestyle: { maxTokens: 50000, subcategories: ['living_environment', 'daily_routines', 'household_management', 'lifestyle_choices', 'personal_interests'] },
            technology_tools: { maxTokens: 50000, subcategories: ['software_systems', 'productivity_tools', 'tech_troubleshooting', 'automation_workflows', 'digital_organization'] },
            legal_administrative: { maxTokens: 50000, subcategories: ['documents_compliance', 'legal_matters', 'administrative_tasks', 'official_procedures', 'regulatory_requirements'] },
            travel_experiences: { maxTokens: 50000, subcategories: ['trip_planning', 'travel_experiences', 'location_insights', 'cultural_exploration', 'adventure_activities'] },
            creative_projects: { maxTokens: 50000, subcategories: ['artistic_endeavors', 'creative_writing', 'design_projects', 'musical_activities', 'innovative_ideas'] },
            emergency_contingency: { maxTokens: 50000, subcategories: ['crisis_management', 'emergency_planning', 'backup_systems', 'contingency_protocols', 'recovery_strategies'] },
            
            // 5 AI-MANAGED DYNAMIC CATEGORIES (50K each)
            dynamic_category_1: { maxTokens: 50000, aiManaged: true, currentFocus: null },
            dynamic_category_2: { maxTokens: 50000, aiManaged: true, currentFocus: null },
            dynamic_category_3: { maxTokens: 50000, aiManaged: true, currentFocus: null },
            dynamic_category_4: { maxTokens: 50000, aiManaged: true, currentFocus: null },
            dynamic_category_5: { maxTokens: 50000, aiManaged: true, currentFocus: null }
        };
        
        this.initialized = false;
        this.initializeSystem();
    }

    async initializeSystem() {
        try {
            await this.createDatabaseSchema();
            await this.createUserMemorySpaces();
            await this.setupPerformanceIndexes();
            this.initialized = true;
            memoryLogger.log('✅ Memory Core initialized successfully');
        } catch (error) {
            memoryLogger.error('❌ Memory Core initialization failed:', error);
            // Graceful degradation - system continues without memory
        }
    }

    async createDatabaseSchema() {
        const client = await this.pool.connect();
        try {
            // Create main categories table
            await client.query(`
                CREATE TABLE IF NOT EXISTS memory_categories (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    category_name VARCHAR(100) NOT NULL,
                    subcategory_name VARCHAR(100),
                    current_tokens INTEGER DEFAULT 0,
                    max_tokens INTEGER DEFAULT 50000,
                    is_dynamic BOOLEAN DEFAULT FALSE,
                    dynamic_focus VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, category_name, subcategory_name)
                )
            `);

            // Create memories table
            await client.query(`
                CREATE TABLE IF NOT EXISTS memory_entries (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    category_name VARCHAR(100) NOT NULL,
                    subcategory_name VARCHAR(100),
                    content TEXT NOT NULL,
                    token_count INTEGER NOT NULL,
                    relevance_score DECIMAL(3,2) DEFAULT 0.50,
                    usage_frequency INTEGER DEFAULT 0,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata JSONB
                )
            `);

            // Create user memory profiles
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_memory_profiles (
                    user_id VARCHAR(255) PRIMARY KEY,
                    total_memories INTEGER DEFAULT 0,
                    total_tokens INTEGER DEFAULT 0,
                    active_categories TEXT[],
                    memory_patterns JSONB,
                    last_optimization TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
        } finally {
            client.release();
        }
    }

    async createUserMemorySpaces() {
        // AI-driven user memory space creation
        const client = await this.pool.connect();
        try {
            // This will be called when a new user interacts with the system
            // for now, we set up the framework
            memoryLogger.log('User memory space framework ready');
        } finally {
            client.release();
        }
    }

    async setupPerformanceIndexes() {
        const client = await this.pool.connect();
        try {
            // Critical performance indexes for fast extraction
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_memory_relevance 
                ON memory_entries(user_id, category_name, relevance_score DESC, created_at DESC)
            `);
            
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_memory_frequency 
                ON memory_entries(user_id, usage_frequency DESC, last_accessed DESC)
            `);
            
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_memory_content_search 
                ON memory_entries USING GIN(to_tsvector('english', content))
            `);
            
        } finally {
            client.release();
        }
    }

    async provisionUserMemory(userId) {
        if (!this.initialized) {
            memoryLogger.warn('Memory system not initialized, provisioning skipped');
            return false;
        }

        const client = await this.pool.connect();
        try {
            // Create user profile
            await client.query(`
                INSERT INTO user_memory_profiles (user_id, active_categories)
                VALUES ($1, $2)
                ON CONFLICT (user_id) DO NOTHING
            `, [userId, Object.keys(this.categories)]);

            // Initialize all categories for user
            for (const [categoryName, categoryConfig] of Object.entries(this.categories)) {
                if (categoryConfig.subcategories) {
                    for (const subcategory of categoryConfig.subcategories) {
                        await client.query(`
                            INSERT INTO memory_categories (user_id, category_name, subcategory_name, max_tokens, is_dynamic)
                            VALUES ($1, $2, $3, $4, $5)
                            ON CONFLICT (user_id, category_name, subcategory_name) DO NOTHING
                        `, [userId, categoryName, subcategory, categoryConfig.maxTokens, !!categoryConfig.aiManaged]);
                    }
                } else {
                    // Dynamic category
                    await client.query(`
                        INSERT INTO memory_categories (user_id, category_name, max_tokens, is_dynamic)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (user_id, category_name, subcategory_name) DO NOTHING
                    `, [userId, categoryName, categoryConfig.maxTokens, true]);
                }
            }

            memoryLogger.log(`✅ User memory space provisioned for ${userId}`);
            return true;
        } catch (error) {
            memoryLogger.error(`❌ Failed to provision memory for ${userId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    async healthCheck() {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            return { healthy: true, initialized: this.initialized };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }
}

export default MemoryCore;

// ================================================================
// FILE 2: memory_system/routing_intelligence.js - Smart Category Routing
// ================================================================

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

export default RoutingIntelligence;
