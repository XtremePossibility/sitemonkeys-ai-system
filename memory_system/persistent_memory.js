// ================================================================
// PERSISTENT MEMORY SYSTEM - UNIVERSAL USER CONVERSATIONS
// ================================================================

import { getDbPool } from './db_singleton.js';

// Persistent memory logger with distinctive prefix
const persistentLogger = {
    log: (message) => console.log(`[PERSISTENT] ${new Date().toISOString()} ${message}`),
    error: (message, error) => console.error(`[PERSISTENT ERROR] ${new Date().toISOString()} ${message}`, error),
    warn: (message) => console.warn(`[PERSISTENT WARN] ${new Date().toISOString()} ${message}`)
};

// Force immediate logging to verify module load
console.log('[PERSISTENT] 🚀 Universal Memory System loading...');

// ================================================================
// ROUTING INTELLIGENCE - Smart Category Detection
// ================================================================
class RoutingIntelligence {
    constructor() {
        console.log('[PERSISTENT] 🧠 Initializing routing intelligence...');
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
                keywords: ['money', 'budget', 'expense', 'income', 'salary', 'cost', 'price', 'investment', 'savings', 'debt', 'loan', 'credit', 'financial', 'bank', 'tax', 'insurance', 'alan', 'backyard leisure', 'business partner', 'promissory note', 'payments', 'court battle'],
                contextPatterns: ['financial issue', 'money problem', 'budget concern', 'investment decision', 'payment issue', 'legal battle'],
                subcategoryRouting: {
                    income_planning: ['salary', 'income', 'earnings', 'revenue', 'paycheck'],
                    expense_tracking: ['expense', 'cost', 'spending', 'budget', 'bills'],
                    investment_strategy: ['investment', 'stocks', 'portfolio', 'retirement', 'savings'],
                    debt_management: ['debt', 'loan', 'credit', 'mortgage', 'payment', 'promissory note', 'alan', 'business partner'],
                    financial_goals: ['financial goal', 'money goal', 'savings goal', 'financial planning']
                }
            },

            // TECHNOLOGY & TOOLS ROUTING
            technology_tools: {
                keywords: ['software', 'app', 'tool', 'system', 'computer', 'phone', 'technology', 'digital', 'online', 'website', 'program', 'automation', 'workflow', 'productivity', 'jasper', 'ai'],
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
        // CRITICAL FIX: Type-safe query handling
        let queryString;
        
        if (typeof query === 'string') {
            queryString = query;
        } else if (query && typeof query === 'object') {
            // Handle object inputs (like {message: "text"})
            if (query.message) queryString = String(query.message);
            else if (query.content) queryString = String(query.content);  
            else if (query.text) queryString = String(query.text);
            else queryString = JSON.stringify(query);
        } else {
            // Handle null, undefined, numbers, etc.
            queryString = String(query || '');
        }

        if (!queryString || queryString.length === 0) {
            console.log('[ROUTING ERROR] Empty query string, using default');
            return {
                primaryCategory: 'personal_development',
                subcategory: 'general',
                confidence: 0.1,
                allScores: {}
            };
        }

        console.log(`[ROUTING] 🎯 Processing query: "${queryString.substring(0, 50)}..."`);
        
        const normalizedQuery = queryString.toLowerCase();
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

        const result = {
            primaryCategory: bestCategory,
            subcategory: subcategory,
            confidence: Math.max(...Object.values(routingScores)) / 10,
            allScores: routingScores
        };

        console.log(`[ROUTING] ✅ Routed to: ${bestCategory}/${subcategory} (confidence: ${result.confidence})`);
        
        return result;
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
        console.log('[PERSISTENT] 🔍 Initializing extraction engine...');
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
        // DEBUG: Log what we're searching for
        console.log(`[EXTRACTION] 🔍 Searching for userId: "${userId}", category: "${categoryName}", subcategory: "${subcategoryName}"`);
        
        let query = `
            SELECT id, category_name, subcategory_name, content, token_count, relevance_score, usage_frequency,   
                   last_accessed, created_at, metadata  
            FROM persistent_memories   
            WHERE user_id = $1 AND category_name = $2
        `;
        const params = [userId, categoryName];

        if (subcategoryName && subcategoryName !== 'null' && subcategoryName !== null) {
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

        console.log(`[EXTRACTION] 📊 Query: ${query}`);
        console.log(`[EXTRACTION] 📊 Params: ${JSON.stringify(params)}`);

        const result = await dbClient.query(query, params);
        
        console.log(`[EXTRACTION] 📈 Found ${result.rows.length} memories in database`);
        
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
                
                // Add break to stop processing once limit reached
                if (currentTokens >= maxTokens) break;
                console.log(`[EXTRACTION] ✅ Selected memory ID ${memory.id} (${memory.token_count} tokens)`);
            }
        }

        console.log(`[EXTRACTION] 🎯 Returning ${selectedMemories.length} memories (${currentTokens} tokens)`);
        return selectedMemories;
    }

    async updateMemoryUsage(memoryId, dbClient) {
        await dbClient.query(`
            UPDATE persistent_memories 
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

        console.log(`[MEMORY FORMAT] 📝 Formatting ${memories.length} memories for AI`);
        
        const formattedMemories = memories
            .map((memory, index) => {
                const timeAgo = this.formatTimeAgo(memory.created_at);
                console.log(`[MEMORY FORMAT] Memory ${index + 1}: "${memory.content.substring(0, 100)}..."`);
                return `[${timeAgo}] ${memory.content}`;
            })
            .join('\n\n');

        console.log(`[MEMORY FORMAT] ✅ Final formatted memory length: ${formattedMemories.length} characters`);

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
// MAIN PERSISTENT MEMORY API - Universal System
// ================================================================
class PersistentMemoryAPI {
    constructor() {
        console.log('[PERSISTENT] 🏗️ Initializing Universal Memory API...');
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
    }

    // BEST FIX: Smart initialize() method that checks for existing tables

async initialize() {
    try {
        console.log('[PERSISTENT] 🚀 Smart initialization starting...');
        
        // Check for any valid database URL (Railway might use DATABASE_PRIVATE_URL)
const hasValidDbUrl = process.env.DATABASE_PRIVATE_URL || 
                     process.env.DATABASE_URL ||
                     process.env.POSTGRES_URL ||
                     process.env.POSTGRESQL_URL;

if (!hasValidDbUrl) {
    persistentLogger.error('❌ No database URL environment variable found');
    return false;
}

        console.log('[PERSISTENT] 🔌 Connecting to database...');
        this.pool = await getDbPool();

        // Test connection
        const client = await this.pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        
        persistentLogger.log('✅ Database connection established');

        // Smart schema creation - check if tables exist first
        console.log('[PERSISTENT] 🔍 Checking if database schema exists...');
        const schemaExists = await this.checkSchemaExists();
        
        if (schemaExists) {
            console.log('[PERSISTENT] ✅ Database schema already exists, skipping creation');
        } else {
            console.log('[PERSISTENT] 📋 Database schema missing, creating...');
            try {
                await this.createDatabaseSchema();
                console.log('[PERSISTENT] ✅ Database schema created successfully');
            } catch (schemaError) {
                console.error('[PERSISTENT] ⚠️ Schema creation failed, but continuing:', schemaError.message);
                // Continue anyway - tables might exist but creation failed due to permissions
            }
        }
        
        this.initialized = true;
        persistentLogger.log('✅ Universal Memory API initialized successfully');
        
        // Schedule periodic maintenance
        setInterval(() => this.performMaintenance(), 60 * 60 * 1000);
        
        console.log('[PERSISTENT] 🎉 SMART INIT COMPLETE - returning true');
        return true;
        
    } catch (error) {
        console.error('[PERSISTENT] ❌ Smart initialization failed:', error);
        persistentLogger.error('❌ Universal Memory API initialization failed:', error);
        return false;
    }
}

// Add this new method to check if schema exists
async checkSchemaExists() {
    try {
        const client = await this.pool.connect();
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('persistent_memories', 'memory_categories', 'user_memory_profiles')
        `);
        client.release();
        
        const existingTables = result.rows.map(r => r.table_name);
        console.log('[PERSISTENT] 📊 Found existing tables:', existingTables);
        
        // Return true if at least the main table exists
        return existingTables.includes('persistent_memories');
        
    } catch (error) {
        console.error('[PERSISTENT] ❌ Error checking schema:', error.message);
        return false;
    }
}

    async createDatabaseSchema() {
        const client = await this.pool.connect();
        try {
            console.log('[PERSISTENT] 📋 Creating enhanced database schema...');

            await client.query(`
                -- main memories
                CREATE TABLE IF NOT EXISTS persistent_memories (    
                    id SERIAL PRIMARY KEY,    
                    user_id TEXT NOT NULL,    
                    category_name VARCHAR(100) NOT NULL,    
                    subcategory_name VARCHAR(100),
                    content TEXT NOT NULL,
                    token_count INTEGER NOT NULL,
                    relevance_score DECIMAL(3,2) DEFAULT 0.50,
                    usage_frequency INTEGER DEFAULT 0,
                    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata JSONB
                );

                -- categories (quota tracking)
                CREATE TABLE IF NOT EXISTS memory_categories (    
                    id SERIAL PRIMARY KEY,    
                    user_id TEXT NOT NULL,    
                    category_name VARCHAR(100) NOT NULL,    
                    subcategory_name VARCHAR(100),
                    current_tokens INTEGER DEFAULT 0,
                    max_tokens INTEGER DEFAULT 50000,
                    is_dynamic BOOLEAN DEFAULT FALSE,
                    dynamic_focus VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, category_name, subcategory_name)
                );

                -- users (stats)
                CREATE TABLE IF NOT EXISTS user_memory_profiles (
                    user_id TEXT PRIMARY KEY,
                    total_memories INTEGER DEFAULT 0,
                    total_tokens INTEGER DEFAULT 0,
                    active_categories TEXT[],
                    memory_patterns JSONB,
                    last_optimization TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                -- indexes (canonical)
                CREATE INDEX IF NOT EXISTS idx_pm_user_cat_rel_created    
                    ON persistent_memories (user_id, category_name, relevance_score DESC, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_pm_last_accessed
                    ON persistent_memories (user_id, last_accessed DESC);
            `);

            persistentLogger.log('✅ Enhanced database schema created');
        } finally {
            client.release();
        }
    }

    async provisionUserMemory(userId) {
        if (!this.initialized) {
            persistentLogger.warn('Memory system not initialized, provisioning skipped');
            return false;
        }

        const client = await this.pool.connect();
        try {
            // Create user profile
            await client.query(`    
                INSERT INTO memory_categories (user_id, category_name, subcategory_name, max_tokens, is_dynamic)    
                VALUES ($1, $2, $3, $4, $5)    
                ON CONFLICT (user_id, category_name, subcategory_name) DO NOTHING
            `, [userId, Object.keys(this.categories)]);

            // Initialize all categories for user
            for (const [categoryName, categoryConfig] of Object.entries(this.categories)) {
                if (categoryConfig.subcategories) {
                    for (const subcategory of categoryConfig.subcategories) {
                        await client.query(`    
                            INSERT INTO memory_categories (user_id, category_name, max_tokens, is_dynamic)    
                            VALUES ($1, $2, $3, $4)    
                            ON CONFLICT (user_id, category_name, subcategory_name) DO NOTHING
                        `, [userId, categoryName, subcategory, categoryConfig.maxTokens, !!categoryConfig.aiManaged]);
                    }
                } else {
                    // Dynamic category
                    await client.query(`  
                        INSERT INTO memory_categories (user_id, category, max_tokens, is_dynamic)  
                        VALUES ($1, $2, $3, $4)  
                        ON CONFLICT (user_id, category, subcategory) DO NOTHING
                    `, [userId, categoryName, categoryConfig.maxTokens, true]);
                }
            }

            persistentLogger.log(`✅ User memory space provisioned for ${userId}`);
            return true;
        } catch (error) {
            persistentLogger.error(`❌ Failed to provision memory for ${userId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    // Public API methods for memory_bootstrap.js compatibility
    async storeConversationMemory(userId, content, metadata = {}) {
        return this.storeMemory(userId, content, metadata);
    }

    async retrieveMemory(userId, query, maxTokens = 2400) {
        return this.getRelevantContext(userId, query, maxTokens);
    }
    
    // Main retrieval method
    async getRelevantContext(userId, query, maxTokens = 2400) {
        try {
            if (!this.initialized) {
                return { contextFound: false, memories: '', error: 'Memory system not initialized' };
            }

            // Ensure user memory space exists
            await this.provisionUserMemory(userId);

            // Route query to appropriate categories
            const routing = this.router.routeToCategory(query, userId);

            // Extract relevant memories
            const client = await this.pool.connect();
            const extraction = await this.extractor.extractRelevantMemories(userId, query, routing, client);
            client.release();

            if (!extraction.success) {
                return { contextFound: false, memories: '', error: extraction.error };
            }

            // Format for AI consumption
            const formattedMemories = this.extractor.formatForAI(extraction.memories);

            persistentLogger.log(`📋 Retrieved ${extraction.memories.length} memories (${extraction.tokenCount} tokens) for ${userId}`);

            // Respect the maxTokens soft cap
            return {
                ...formattedMemories,
                totalTokens: Math.min(formattedMemories.totalTokens ?? 0, maxTokens)
            };

        } catch (error) {
            persistentLogger.error(`Error retrieving context for ${query}:`, error);
            return { contextFound: false, memories: '', error: error.message };
        }
    }
    
    async storeMemory(userId, content, metadata = {}) {
        try {
            if (!this.initialized) {
                return { success: false, error: 'Memory system not initialized' };
            }

            if (!content || content.trim().length === 0) {
                return { success: false, error: 'Empty content cannot be stored' };
            }

            // Ensure user memory space exists
            await this.provisionUserMemory(userId);

            // Route to appropriate category
            const routing = this.router.routeToCategory(content, userId);
            
            // Store memory
            const result = await this.storeMemoryInDatabase(
                userId,
                routing.primaryCategory,
                routing.subcategory,
                content,
                {
                    ...metadata,
                    routingConfidence: routing.confidence,
                    timestamp: new Date().toISOString(),
                    allCategoryScores: routing.allScores
                }
            );

            if (result.success) {
                persistentLogger.log(`💾 Stored memory ${result.memoryId} in ${routing.primaryCategory}/${routing.subcategory} for ${userId}`);
            }

            return result;

        } catch (error) {
            console.error(`[PERSISTENT ERROR] FULL STORAGE ERROR for ${userId}:`, {
                message: error.message,
                stack: error.stack,
                code: error.code,
                detail: error.detail,
                constraint: error.constraint,
                query: error.query
            });
            persistentLogger.error(`Error storing memory for ${userId}:`, error);
            return { success: false, error: `Storage failed: ${error.message} (Code: ${error.code})` };
        }
    }

    async storeMemoryInDatabase(userId, categoryName, subcategoryName, content, metadata = {}) {
        if (!this.pool) {
            return { success: false, error: 'Database pool not initialized' };
        }
        
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Calculate token count
            const tokenCount = Math.ceil(content.length / 4);

            // Check category capacity
            const capacityCheck = await client.query(`  
                SELECT current_tokens, max_tokens     
                FROM memory_categories     
                WHERE user_id = $1 AND category_name = $2 AND subcategory_name = $3
            `, [userId, categoryName, subcategoryName]);

            if (capacityCheck.rows.length === 0) {
                // Create category if doesn't exist
                await this.createCategoryIfNotExists(userId, categoryName, subcategoryName, client);
            } else {
                const { current_tokens, max_tokens } = capacityCheck.rows[0];
                if (current_tokens + tokenCount > max_tokens) {
                    // Trigger cleanup before storing
                    await this.makeSpace(userId, categoryName, subcategoryName, tokenCount, client);
                }
            }

            // Calculate relevance score
            const relevanceScore = this.calculateInitialRelevance(content, metadata);

            // Store memory
            const insertResult = await client.query(`  
                INSERT INTO persistent_memories     
                (user_id, category_name, subcategory_name, content, token_count, relevance_score, metadata)    
                VALUES ($1, $2, $3, $4, $5, $6, $7)  
                RETURNING id
            `, [userId, categoryName, subcategoryName, content, tokenCount, relevanceScore, JSON.stringify(metadata)]);

            // Update category token count
            await client.query(`  
                UPDATE memory_categories     
                SET current_tokens = current_tokens + $1, updated_at = CURRENT_TIMESTAMP    
                WHERE user_id = $2 AND category_name = $3 AND subcategory_name = $4
            `, [tokenCount, userId, categoryName, subcategoryName]);

            await client.query('COMMIT');
            
            return {
                success: true,
                memoryId: insertResult.rows[0].id,
                tokenCount: tokenCount,
                relevanceScore: relevanceScore
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[PERSISTENT ERROR] DATABASE TRANSACTION FAILED:', {
                userId: userId,
                category: categoryName,
                subcategory: subcategoryName,
                error: {
                    message: error.message,
                    code: error.code,
                    detail: error.detail,
                    constraint: error.constraint,
                    severity: error.severity,
                    where: error.where,
                    query: error.query
                }
            });
            throw error;
        } finally {
            client.release();
        }
    }

    async createCategoryIfNotExists(userId, categoryName, subcategoryName, client) {
        const maxTokens = 50000; // Standard category size
        const isDynamic = categoryName.startsWith('dynamic_category_');
        
        await client.query(`  
            INSERT INTO memory_categories     
            (user_id, category_name, subcategory_name, max_tokens, is_dynamic)    
            VALUES ($1, $2, $3, $4, $5)    
            ON CONFLICT (user_id, category_name, subcategory_name) DO NOTHING
        `, [userId, categoryName, subcategoryName, maxTokens, isDynamic]);
    }

    async makeSpace(userId, categoryName, subcategoryName, neededTokens, client) {
        const deletedTokens = await client.query(`
            WITH deleted AS (
                DELETE FROM persistent_memories
                WHERE user_id = $1 AND category_name = $2 AND subcategory_name = $3
                AND id IN (
                    SELECT id FROM persistent_memories
                    WHERE user_id = $1 AND category_name = $2 AND subcategory_name = $3
                    ORDER BY relevance_score ASC, usage_frequency ASC, created_at ASC
                    LIMIT 10
                )
                RETURNING token_count
            )
            SELECT COALESCE(SUM(token_count), 0) AS freed_tokens FROM deleted
        `, [userId, categoryName, subcategoryName]);

        const freedTokens = parseInt(deletedTokens.rows[0].freed_tokens || 0, 10);

        await client.query(`
            UPDATE memory_categories
            SET current_tokens = GREATEST(current_tokens - $1, 0),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2 AND category_name = $3 AND subcategory_name = $4
        `, [freedTokens, userId, categoryName, subcategoryName]);

        persistentLogger.log(`🧹 Made space in ${categoryName}/${subcategoryName}: freed ${freedTokens} tokens`);
    }

    calculateInitialRelevance(content, metadata) {
        let relevance = 0.5; // Base relevance

        // Boost for emotional content
        const emotionalWords = ['excited', 'worried', 'happy', 'stressed', 'important', 'urgent', 'critical'];
        const emotionalMatches = emotionalWords.filter(word => 
            content.toLowerCase().includes(word)
        ).length;
        relevance += emotionalMatches * 0.05;

        // Boost for questions (likely important for future reference)
        if (content.includes('?')) {
            relevance += 0.1;
        }

        // Metadata-based boosts
        if (metadata.userMarkedImportant) {
            relevance += 0.2;
        }

        return Math.min(relevance, 1.0);
    }

    // Health check method for memory_bootstrap.js compatibility
    async healthCheck() {
        try {
            if (!this.pool) {
                return { status: 'error', error: 'Database pool not initialized' };
            }

            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            
            return {
                status: 'healthy',
                initialized: this.initialized,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async getSystemHealth() {
        return this.healthCheck();
    }

    async getMemoryStats(userId) {
        try {
            if (!this.initialized) {
                return { totalMemories: 0, totalTokens: 0, error: 'Not initialized' };
            }

            const client = await this.pool.connect();
            const stats = await client.query(`
                SELECT 
                    COUNT(*) as total_memories,
                    COALESCE(SUM(token_count), 0) as total_tokens  
                FROM persistent_memories   
                WHERE user_id = $1
            `, [userId]);
            client.release();

            return {
                totalMemories: parseInt(stats.rows[0].total_memories),
                totalTokens: parseInt(stats.rows[0].total_tokens),
                mode: 'persistent'
            };

        } catch (error) {
            persistentLogger.error(`Error getting stats for ${userId}:`, error);
            return { totalMemories: 0, totalTokens: 0, error: error.message };
        }
    }

    // Format method for extraction engine compatibility
    formatForAI(memories, options = {}) {
        return this.extractor.formatForAI(memories);
    }

    async performMaintenance() {
        try {
            persistentLogger.log('🔧 Starting scheduled maintenance...');
            
            // Database health check
            const health = await this.getSystemHealth();
            if (health.status !== 'healthy') {
                persistentLogger.warn('⚠️ Database health check failed during maintenance');
            }
            
            persistentLogger.log('✅ Scheduled maintenance completed');

        } catch (error) {
            persistentLogger.error('❌ Maintenance failed:', error);
        }
    }

    async shutdown() {
        try {
            if (this.pool) {
                await this.pool.end();
                persistentLogger.log('✅ Universal Memory API shutdown completed');
            }
        } catch (error) {
            persistentLogger.error('❌ Error during shutdown:', error);
        }
    }
}

// Export the class, not an instance
console.log('[PERSISTENT] 📦 Universal Memory System class ready for export');

export default PersistentMemoryAPI;
