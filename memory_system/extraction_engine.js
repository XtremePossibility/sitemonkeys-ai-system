class ExtractionEngine {
    constructor() {
        this.maxExtractionTokens = 2400;
        this.minRelevanceThreshold = 0.3;
        this.recentBias = 0.7; // Weight recent memories higher
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
                categoriesSearched: extractionPlan.categories,
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
        const plan = {
            primary: {
                category: categoryRouting.primaryCategory,
                subcategory: categoryRouting.subcategory,
                tokenAllocation: Math.floor(this.maxExtractionTokens * 0.7) // 70% to primary
            },
            secondary: [],
            fallback: []
        };

        // If confidence is low, include secondary categories
        if (categoryRouting.confidence < 0.8) {
            const sortedCategories = Object.entries(categoryRouting.allScores)
                .sort(([,a], [,b]) => b - a)
                .slice(1, 3); // Take next 2 best categories

            plan.secondary = sortedCategories.map(([category, score]) => ({
                category,
                tokenAllocation: Math.floor(this.maxExtractionTokens * 0.15),
                reason: 'low_confidence_backup'
            }));
        }

        // Dynamic category inclusion
        if (categoryRouting.dynamicCategory) {
            plan.secondary.push({
                category: 'dynamic_category_1', // Simplified for now
                tokenAllocation: Math.floor(this.maxExtractionTokens * 0.15),
                reason: 'dynamic_relevance'
            });
        }

        return plan;
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

        // Extract from secondary categories if needed
        const currentTokens = this.calculateTokens(allMemories);
        if (currentTokens < this.maxExtractionTokens && plan.secondary.length > 0) {
            for (const secondary of plan.secondary) {
                const remainingTokens = this.maxExtractionTokens - this.calculateTokens(allMemories);
                if (remainingTokens > 100) { // Only continue if meaningful space left
                    const secondaryMemories = await this.extractFromCategory(
                        userId,
                        secondary.category,
                        null,
                        Math.min(secondary.tokenAllocation, remainingTokens),
                        dbClient
                    );
                    allMemories.push(...secondaryMemories);
                }
            }
        }

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
            LIMIT 50
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
                    extractionReason: subcategoryName ? 'subcategory_match' : 'category_match',
                    relevanceBoost: this.calculateRelevanceBoost(memory)
                });
                
                currentTokens += memory.token_count;
            }
        }

        return selectedMemories;
    }

    calculateRelevanceBoost(memory) {
        const daysSinceCreated = (Date.now() - new Date(memory.created_at)) / (1000 * 60 * 60 * 24);
        const daysSinceAccessed = (Date.now() - new Date(memory.last_accessed)) / (1000 * 60 * 60 * 24);
        
        // Recent memories get boost, frequently accessed memories get boost
        const recencyBoost = Math.max(0, (30 - daysSinceCreated) / 30 * 0.3);
        const accessBoost = Math.min(memory.usage_frequency / 10 * 0.2, 0.2);
        
        return recencyBoost + accessBoost;
    }

    optimizeExtraction(memories, query) {
        // Final optimization pass
        const queryWords = query.toLowerCase().split(' ');
        
        return memories
            .map(memory => ({
                ...memory,
                finalRelevance: this.calculateFinalRelevance(memory, queryWords)
            }))
            .sort((a, b) => b.finalRelevance - a.finalRelevance)
            .slice(0, Math.floor(this.maxExtractionTokens / 150)); // Ensure we don't exceed token limit
    }

    calculateFinalRelevance(memory, queryWords) {
        const content = memory.content.toLowerCase();
        let relevance = memory.relevance_score;
        
        // Boost for query word matches
        const wordMatches = queryWords.filter(word => content.includes(word)).length;
        relevance += (wordMatches / queryWords.length) * 0.3;
        
        // Apply relevance boost
        relevance += memory.relevanceBoost || 0;
        
        return Math.min(relevance, 1.0);
    }

    async updateMemoryUsage(memoryId, dbClient) {
        await dbClient.query(`
            UPDATE memory_entries 
            SET usage_frequency = usage_frequency + 1,
                last_accessed = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [memoryId]);
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

module.exports = ExtractionEngine;
