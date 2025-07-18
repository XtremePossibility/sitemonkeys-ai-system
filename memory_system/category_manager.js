class CategoryManager {
    constructor() {
        this.databaseManager = new DatabaseManager();
        this.staticCategories = [
            'mental_emotional',
            'health_wellbeing', 
            'relationships_social',
            'work_career',
            'money_income_debt',
            'money_spending_goals',
            'goals_active_current',
            'goals_future_dreams',
            'tools_tech_workflow',
            'daily_routines_habits',
            'personal_life_interests'
        ];
        this.maxDynamicCategories = 5;
    }

    async initializeStaticCategories(userId) {
        try {
            for (const category of this.staticCategories) {
                await this.databaseManager.createCategoryTable(userId, category);
            }
            
            // Initialize dynamic category tracking
            await this.databaseManager.createDynamicCategoryTracker(userId);
            
            return { success: true, categoriesCreated: this.staticCategories.length };
        } catch (error) {
            console.error("Category initialization failed:", error);
            throw error;
        }
    }

    async storeInCategory(userId, category, subcategory, memoryEntry) {
        try {
            // Check if category exists, create if it's a new dynamic category
            if (!this.staticCategories.includes(category)) {
                await this.handleDynamicCategory(userId, category);
            }

            // Store memory with overwrite logic
            const result = await this.storeWithOverwriteLogic(userId, category, subcategory, memoryEntry);
            
            return result;
        } catch (error) {
            console.error(`Storage in category ${category} failed:`, error);
            return { success: false, error: error.message };
        }
    }

    async storeWithOverwriteLogic(userId, category, subcategory, memoryEntry) {
        // Get current category size
        const currentSize = await this.databaseManager.getCategoryTokenCount(userId, category);
        const entrySize = this.calculateTokenCount(memoryEntry.content);
        
        if (currentSize + entrySize <= 50000) {
            // Space available, store normally
            return await this.databaseManager.insertMemory(userId, category, subcategory, memoryEntry);
        } else {
            // Need to make space - find candidates for overwrite
            const overwriteCandidates = await this.findOverwriteCandidates(userId, category, entrySize);
            
            if (overwriteCandidates.length > 0) {
                // Remove candidates and store new memory
                await this.databaseManager.removeMemories(userId, category, overwriteCandidates);
                return await this.databaseManager.insertMemory(userId, category, subcategory, memoryEntry);
            } else {
                return { success: false, error: "Category full and no overwrite candidates found" };
            }
        }
    }

    async findOverwriteCandidates(userId, category, neededSpace) {
        const memories = await this.databaseManager.getCategoryMemories(userId, category);
        
        // Score memories for overwrite eligibility (lower score = more likely to be overwritten)
        const scoredMemories = memories.map(memory => ({
            ...memory,
            overwriteScore: this.calculateOverwriteScore(memory)
        }));

        // Sort by overwrite score (lowest first)
        scoredMemories.sort((a, b) => a.overwriteScore - b.overwriteScore);

        // Select memories to remove until we have enough space
        const candidates = [];
        let freedSpace = 0;
        
        for (const memory of scoredMemories) {
            candidates.push(memory.id);
            freedSpace += this.calculateTokenCount(memory.content);
            
            if (freedSpace >= neededSpace) break;
        }

        return candidates;
    }

    calculateOverwriteScore(memory) {
        let score = 50; // Base score
        
        // Age factor (older = lower score)
        const daysSinceCreated = (Date.now() - new Date(memory.timestamp)) / (1000 * 60 * 60 * 24);
        score -= daysSinceCreated * 0.5;
        
        // Priority factor
        score += (memory.priority || 50) * 0.8;
        
        // Usage frequency (if tracked)
        if (memory.accessCount) {
            score += memory.accessCount * 2;
        }
        
        // Relevance to user patterns (simplified)
        if (memory.keywords && memory.keywords.length > 0) {
            score += memory.keywords.length * 3;
        }

        return Math.max(score, 0);
    }

    async handleDynamicCategory(userId, categoryName) {
        // Check if we have space for new dynamic categories
        const currentDynamicCategories = await this.databaseManager.getDynamicCategories(userId);
        
        if (currentDynamicCategories.length >= this.maxDynamicCategories) {
            // Archive least used dynamic category
            await this.archiveLeastUsedDynamicCategory(userId);
        }

        // Create new dynamic category
        await this.databaseManager.createCategoryTable(userId, categoryName);
        await this.databaseManager.trackDynamicCategory(userId, categoryName);
        
        return { success: true, action: 'dynamic_category_created', category: categoryName };
    }

    async archiveLeastUsedDynamicCategory(userId) {
        const dynamicCategories = await this.databaseManager.getDynamicCategoriesWithUsage(userId);
        
        // Find least used category
        const leastUsed = dynamicCategories.reduce((min, cat) => 
            cat.lastAccessed < min.lastAccessed ? cat : min
        );

        // Archive the category (preserve data but mark as inactive)
        await this.databaseManager.archiveDynamicCategory(userId, leastUsed.name);
        
        return { archived: leastUsed.name };
    }

    calculateTokenCount(content) {
        const words = content.split(/\s+/).length;
        return Math.ceil(words * 0.75);
    }
}
