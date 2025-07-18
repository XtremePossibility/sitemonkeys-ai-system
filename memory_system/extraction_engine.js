class ExtractionEngine {
    constructor() {
        this.databaseManager = new DatabaseManager();
    }

    async extractRelevantContent(userId, categories, query, maxTokens = 2500) {
        let extractedContent = [];
        let totalTokens = 0;

        try {
            // Sort categories by priority (high priority first)
            const sortedCategories = categories.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });

            for (const categoryInfo of sortedCategories) {
                if (totalTokens >= maxTokens) break;

                const remainingTokens = maxTokens - totalTokens;
                const categoryContent = await this.extractFromCategory(
                    userId, 
                    categoryInfo.category, 
                    query, 
                    remainingTokens
                );

                if (categoryContent.length > 0) {
                    extractedContent.push({
                        category: categoryInfo.category,
                        content: categoryContent,
                        tokenCount: this.calculateTokenCount(categoryContent.join(' '))
                    });
                    
                    totalTokens += this.calculateTokenCount(categoryContent.join(' '));
                }
            }

            return {
                extractedMemories: extractedContent,
                totalTokens: totalTokens,
                categoriesSearched: categories.length,
                extractionStrategy: this.determineExtractionStrategy(totalTokens, maxTokens)
            };

        } catch (error) {
            console.error("Content extraction failed:", error);
            return { extractedMemories: [], totalTokens: 0, error: error.message };
        }
    }

    async extractFromCategory(userId, category, query, maxTokens) {
        try {
            // Get all memories from category
            const memories = await this.databaseManager.getCategoryMemories(userId, category);
            
            // Score memories for relevance to query
            const scoredMemories = memories.map(memory => ({
                ...memory,
                relevanceScore: this.calculateRelevanceScore(memory, query)
            }));

            // Sort by relevance and recency
            scoredMemories.sort((a, b) => {
                const relevanceDiff = b.relevanceScore - a.relevanceScore;
                if (relevanceDiff !== 0) return relevanceDiff;
                
                // If relevance is equal, prefer more recent
                return new Date(b.timestamp) - new Date(a.timestamp);
            });

            // Extract memories up to token limit
            const extractedMemories = [];
            let tokenCount = 0;

            for (const memory of scoredMemories) {
                const memoryTokens = this.calculateTokenCount(memory.content);
                if (tokenCount + memoryTokens <= maxTokens) {
                    extractedMemories.push(memory.content);
                    tokenCount += memoryTokens;
                } else {
                    // Try to fit a partial memory if there's space
                    const remainingTokens = maxTokens - tokenCount;
                    if (remainingTokens > 50) { // Only if meaningful space left
                        const partialContent = this.truncateToTokenLimit(memory.content, remainingTokens);
                        extractedMemories.push(partialContent);
                    }
                    break;
                }
            }

            return extractedMemories;

        } catch (error) {
            console.error(`Extraction from category ${category} failed:`, error);
            return [];
        }
    }

    calculateRelevanceScore(memory, query) {
        let score = 0;
        const queryLower = query.toLowerCase();
        const contentLower = memory.content.toLowerCase();

        // Keyword matching
        const queryWords = queryLower.split(/\s+/);
        queryWords.forEach(word => {
            if (word.length > 3 && contentLower.includes(word)) {
                score += 10;
            }
        });

        // Boost for keywords in memory keywords array
        if (memory.keywords) {
            memory.keywords.forEach(keyword => {
                if (queryLower.includes(keyword)) {
                    score += 15;
                }
            });
        }

        // Boost for recent memories
        const daysSinceCreated = (Date.now() - new Date(memory.timestamp)) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 7) score += 20;
        else if (daysSinceCreated < 30) score += 10;

        // Boost for high priority memories
        score += (memory.priority || 50) * 0.5;

        return score;
    }

    calculateTokenCount(content) {
        // Rough token estimation
        const words = content.split(/\s+/).length;
        return Math.ceil(words * 0.75);
    }

    truncateToTokenLimit(content, tokenLimit) {
        const words = content.split(/\s+/);
        const wordLimit = Math.floor(tokenLimit / 0.75);
        return words.slice(0, wordLimit).join(' ') + '...';
    }

    determineExtractionStrategy(extractedTokens, maxTokens) {
        const utilizationRate = extractedTokens / maxTokens;
        
        if (utilizationRate < 0.3) return 'sparse_memories';
        if (utilizationRate < 0.7) return 'selective_extraction';
        if (utilizationRate < 0.95) return 'comprehensive_extraction';
        return 'token_limit_reached';
    }
}
