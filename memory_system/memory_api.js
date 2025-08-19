// ================================================================
// SITE MONKEYS MEMORY SYSTEM V2 - RAILWAY CACHE BUSTER
// New filename to force complete Railway rebuild: memory_system_v2.js
// Revolutionary persistent memory with 11+5 categories, smart routing,
// surgical extraction, and self-provisioning infrastructure.
// ================================================================

const { Pool } = require('pg');

// Memory system logger with distinctive prefix
const memoryLogger = {
    log: (message) => console.log(`[MEMORY V2] ${new Date().toISOString()} ${message}`),
    error: (message, error) => console.error(`[MEMORY V2 ERROR] ${new Date().toISOString()} ${message}`, error),
    warn: (message) => console.warn(`[MEMORY V2 WARN] ${new Date().toISOString()} ${message}`)
};

// Force immediate logging to verify module load
console.log('[MEMORY V2] 🚀 Memory System V2 module loading...');

// ================================================================
// ROUTING INTELLIGENCE - Smart Category Detection
// ================================================================
class RoutingIntelligence {
    constructor() {
        console.log('[MEMORY V2] 🧠 Initializing routing intelligence...');
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
                keywords: ['work', 'job', 'career', 'business', 'company', 'project', 'meeting', 'boss', 'employee', 'salary', 'promotion', 'performance', 'deadline', 'client', 'customer', 'revenue', 'profit', 'strategy', 'consulting'],
                contextPatterns: ['work issue', 'business problem', 'career decision', 'project deadline'],
                subcategoryRouting: {
                    work_performance: ['performance', 'productivity', 'deadline', 'task', 'efficiency'],
                    career_planning: ['career', 'promotion', 'job search', 'professional development'],
                    business_strategy: ['business', 'strategy', 'revenue', 'profit', 'growth', 'consulting'],
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
                    score += 2;
                }
            }

            // Context pattern matching
            for (const pattern of patterns.contextPatterns) {
                if (normalizedQuery.includes(pattern)) {
                    score += 3;
                }
            }

            routingScores[categoryName] = score;
        }

        // Find best category
        const bestCategory = Object.keys(routingScores).reduce((a, b) => 
            routingScores[a] > routingScores[b] ? a : b
        );

        // Route to subcategory
        const subcategory = this.routeToSubcategory(normalizedQuery, bestCategory);

        return {
            primaryCategory: bestCategory,
            subcategory: subcategory,
            confidence: Math.max(...Object.values(routingScores)) / 10,
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
}

// ================================================================
// EXTRACTION ENGINE - Surgical Token Extraction
// ================================================================
class ExtractionEngine {
    constructor() {
        console.log('[MEMORY V2] 🔍 Initializing extraction engine...');
        this.maxExtractionTokens = 2400;
        this.minRelevanceThreshold = 0.3;
    }

    async extractRelevantMemories(userId, query, categoryRouting, dbClient) {
        try {
            const extractionPlan = this.planExtraction(query, categoryRouting);
            const extractedMemories = await this.executeExtraction(userId, extractionPlan, dbClient);
            const optimizedMemories = this.optimizeExtraction(extractedMemories, query);
            
            return {
                success: true,
                memories: optimizedMemories,
                tokenCount: this.calculateTokens(optimizedMemories),
                categoriesSearched: [categoryRouting.primaryCategory],
                extractionTime: Date.now()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                memories: [],
                tokenCount: 0
            };
        }
    }

    planExtraction(query, categoryRouting) {
        return {
            primary: {
                category: categoryRouting.primaryCategory,
                subcategory: categoryRouting.subcategory,
                tokenAllocation: this.maxExtractionTokens
            }
        };
    }

    async executeExtraction(userId, plan, dbClient) {
        const allMemories = [];

        // Extract from primary category
        const primaryMemories = await this.extractFromCategory(
            userId, 
            plan.primary.category, 
            plan.primary.subcategory,
            plan.primary.tokenAllocation,
            dbClient
        );
        allMemories.push(...primaryMemories);

        return allMemories;
    }

    async extractFromCategory(userId, categoryName, subcategoryName, maxTokens, dbClient) {
        let query = `
            SELECT id, content, token_count, relevance_score, usage_frequency, 
                   last_accessed, created_at, metadata
            FROM memory_entries 
            WHERE user_id = $1 AND category_name = $2
        `;
        const params = [userId, categoryName];

        if (subcategoryName) {
            query += ` AND subcategory_name = $3`;
            params.push(subcategoryName);
        }

        query += ` 
            ORDER BY 
                relevance_score DESC, 
                usage_frequency DESC,
                created_at DESC 
            LIMIT 20
        `;

        const result = await dbClient.query(query, params);
        
        // Smart token-aware selection
        const selectedMemories = [];
        let currentTokens = 0;

        for (const memory of result.rows) {
            if (currentTokens + memory.token_count <= maxTokens) {
                // Update usage statistics
                await this.updateMemoryUsage(memory.id, dbClient);
                
                selectedMemories.push({
                    ...memory,
                    extractionReason: subcategoryName ? 'subcategory_match' : 'category_match'
                });
                
                currentTokens += memory.token_count;
            }
        }

        return selectedMemories;
    }

    async updateMemoryUsage(memoryId, dbClient) {
        await dbClient.query(`
            UPDATE memory_entries 
            SET usage_frequency = usage_frequency + 1,
                last_accessed = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [memoryId]);
    }

    optimizeExtraction(memories, query) {
        const queryWords = query.toLowerCase().split(' ');
        
        return memories
            .map(memory => ({
                ...memory,
                finalRelevance: this.calculateFinalRelevance(memory, queryWords)
            }))
            .sort((a, b) => b.finalRelevance - a.finalRelevance);
    }

    calculateFinalRelevance(memory, queryWords) {
        const content = memory.content.toLowerCase();
        let relevance = memory.relevance_score;
        
        // Boost for query word matches
        const wordMatches = queryWords.filter(word => content.includes(word)).length;
        relevance += (wordMatches / queryWords.length) * 0.3;
        
        return Math.min(relevance, 1.0);
    }

    calculateTokens(memories) {
        return memories.reduce((total, memory) => total + memory.token_count, 0);
    }

    formatForAI(memories) {
        if (!memories || memories.length === 0) {
            return { contextFound: false, memories: '' };
        }

        const formattedMemories = memories
            .map(memory => {
                const timeAgo = this.formatTimeAgo(memory.created_at);
                return `[${timeAgo}] ${memory.content}`;
            })
            .join('\n\n');

        return {
            contextFound: true,
            memories: formattedMemories,
            totalTokens: this.calculateTokens(memories),
            categoriesUsed: [...new Set(memories.map(m => m.category_name))]
        };
    }

    formatTimeAgo(timestamp) {
        const days = Math.floor((Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'today';
        if (days === 1) return 'yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days/7)} weeks ago`;
        return `${Math.floor(days/30)} months ago`;
    }
}

// ================================================================
// MAIN MEMORY API V2 - Complete Revolutionary System
// ================================================================
class MemoryAPIV2 {
    constructor() {
        console.log('[MEMORY V2] 🏗️ Initializing Memory API V2...');
        this.pool = null;
        this.router = new RoutingIntelligence();
        this.extractor = new ExtractionEngine();
        
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
        this.initialize();
    }

    async initialize() {
        try {
            if (!process.env.DATABASE_URL) {
                memoryLogger.error('❌ DATABASE_URL environment variable not found');
                return;
            }

            console.log('[MEMORY V2] 🔌 Connecting to database...');
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            memoryLogger.log('✅ Database connection established');

            // Create database schema
            await this.createDatabaseSchema();
            
            this.initialized = true;
            memoryLogger.log('✅ Memory API V2 initialized successfully');
            
            // Schedule periodic maintenance
            setInterval(() => this.performMaintenance(), 60 * 60 * 1000); // Every hour
            
        } catch (error) {
            memoryLogger.error('❌ Memory API V2 initialization failed:', error);
        }
    }

    async createDatabaseSchema() {
        const client = await this.pool.connect();
        try {
            console.log('[MEMORY V2] 📋 Creating database schema...');
            
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

            // Create performance indexes
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_memory_relevance 
                ON memory_entries(user_id, category_name, relevance_score DESC, created_at DESC)
            `);
            
            memoryLogger.log('✅ Database schema and indexes created');
            
        } finally {
            client.release();
        }
    }

    // Mock functions for immediate testing
    async getRelevantContext(userId, query, maxTokens = 2400) {
        memoryLogger.log(`📋 Getting relevant context for user ${userId}, query: "${query.substring(0, 50)}..."`);
        
        // Return mock data for now to verify integration
        return {
            contextFound: true,
            memories: `[MEMORY V2 TEST] This is a test memory response for query: "${query}"`,
            totalTokens: 150,
            categoriesUsed: ['business_career']
        };
    }

    async storeMemory(userId, content, metadata = {}) {
        memoryLogger.log(`💾 Storing memory for user ${userId}, content: "${content.substring(0, 50)}..."`);
        
        // Return mock success for now
        return {
            success: true,
            memoryId: Math.floor(Math.random() * 10000),
            tokenCount: Math.ceil(content.length / 4),
            relevanceScore: 0.75
        };
    }

    async initializeUser(userId) {
        memoryLogger.log(`👤 Initializing user ${userId} memory system`);
        
        return {
            success: true,
            message: 'User memory system V2 ready'
        };
    }

    async getSystemHealth() {
        return {
            overall: this.initialized,
            database: { healthy: true },
            initialized: this.initialized,
            version: 'V2',
            timestamp: new Date().toISOString()
        };
    }

    async performMaintenance() {
        try {
            memoryLogger.log('🔧 Starting scheduled maintenance V2...');
            memoryLogger.log('✅ Scheduled maintenance V2 completed');
        } catch (error) {
            memoryLogger.error('❌ Maintenance V2 failed:', error);
        }
    }

    async shutdown() {
        try {
            if (this.pool) {
                await this.pool.end();
                memoryLogger.log('✅ Memory API V2 shutdown completed');
            }
        } catch (error) {
            memoryLogger.error('❌ Error during V2 shutdown:', error);
        }
    }
}

// Export façade delegating to the real persistent engine (ESM), no new Pool, no mocks.
module.exports = (function () {
  let enginePromise = null;
  async function getEngine() {
  if (!enginePromise) {
    enginePromise = (async () => {
      try {
        console.log('🔧 [DEBUG] Starting engine import...');
        const mod = await import('./persistent_memory.js');
        console.log('🔧 [DEBUG] Module imported:', Object.keys(mod));
        
        const Engine = mod.default || mod.PersistentMemory || mod;
        console.log('🔧 [DEBUG] Engine found:', typeof Engine);
        
        const inst = new Engine();
        console.log('🔧 [DEBUG] Instance created, initializing...');
        
        await inst.initialize();
        console.log('🔧 [DEBUG] Engine initialized successfully!');
        
        return inst;
      } catch (error) {
        console.error('🔧 [DEBUG] Engine setup failed:', error);
        throw error;
      }
    })();
  }
  return enginePromise;
}

  return {
    async initializeUser(userId) {
      const eng = await getEngine();
      return eng.provisionUserMemory(userId);
    },
    async storeMemory(userId, content, metadata = {}) {
      const eng = await getEngine();
      return eng.storeMemory(userId, content, metadata);
    },
    async getRelevantContext(userId, query, maxTokens = 2400) {
      const eng = await getEngine();
      return eng.getRelevantContext(userId, query, maxTokens);
    },
    async getSystemHealth() {
      const eng = await getEngine();
      if (typeof eng.getSystemHealth === 'function') return eng.getSystemHealth();
      if (typeof eng.healthCheck === 'function') return eng.healthCheck();
      return { status: 'unknown' };
    }
  };
})();
