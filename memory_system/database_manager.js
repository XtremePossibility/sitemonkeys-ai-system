// ================================================================
// BROWSER-COMPATIBLE DATABASE MANAGER 
// Works exactly like your vault system using window.currentMemoryContent
// ================================================================

class DatabaseManager {
    constructor() {
        this.initializeMemoryStorage();
    }

    initializeMemoryStorage() {
        // Initialize memory storage like your vault system
        if (typeof window !== 'undefined') {
            // Browser environment - use window storage like vault
            if (!window.currentMemoryContent) {
                window.currentMemoryContent = {};
            }
            console.log("Memory storage initialized in browser");
        } else {
            // Server environment fallback
            this.memoryStorage = {};
            console.log("Memory storage initialized in server fallback mode");
        }
    }

    getMemoryStorage() {
        if (typeof window !== 'undefined') {
            return window.currentMemoryContent || {};
        } else {
            return this.memoryStorage || {};
        }
    }

    setMemoryStorage(data) {
        if (typeof window !== 'undefined') {
            window.currentMemoryContent = data;
        } else {
            this.memoryStorage = data;
        }
    }

    async createUserSpace(userId) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId]) {
                memory[userId] = {
                    metadata: {
                        created_at: new Date().toISOString(),
                        last_accessed: new Date().toISOString(),
                        total_memories: 0,
                        total_tokens: 0
                    },
                    categories: {}
                };
                this.setMemoryStorage(memory);
            }

            return { success: true };
        } catch (error) {
            console.error("User space creation failed:", error);
            return { success: false, error: error.message };
        }
    }

    async createCategoryTable(userId, categoryName) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId]) {
                await this.createUserSpace(userId);
            }

            if (!memory[userId].categories[categoryName]) {
                memory[userId].categories[categoryName] = {
                    created_at: new Date().toISOString(),
                    memories: [],
                    total_tokens: 0
                };
                this.setMemoryStorage(memory);
            }

            return { success: true, table: `user_${userId}_${categoryName}` };
        } catch (error) {
            console.error(`Failed to create category ${categoryName}:`, error);
            return { success: false, error: error.message };
        }
    }

    async insertMemory(userId, category, subcategory, memoryEntry) {
        try {
            const memory = this.getMemoryStorage();
            const tokenCount = this.calculateTokenCount(memoryEntry.content);
            
            // Ensure user and category exist
            if (!memory[userId]) {
                await this.createUserSpace(userId);
            }
            if (!memory[userId].categories[category]) {
                await this.createCategoryTable(userId, category);
            }

            // Create memory entry
            const newMemory = {
                id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                subcategory: subcategory,
                content: memoryEntry.content,
                keywords: memoryEntry.keywords || [],
                emotional_markers: memoryEntry.emotional_markers || [],
                priority: memoryEntry.priority || 50,
                timestamp: new Date().toISOString(),
                last_accessed: new Date().toISOString(),
                access_count: 0,
                token_count: tokenCount,
                metadata: memoryEntry.metadata || {}
            };

            // Add to category
            memory[userId].categories[category].memories.push(newMemory);
            memory[userId].categories[category].total_tokens += tokenCount;

            // Update user metadata
            memory[userId].metadata.total_memories++;
            memory[userId].metadata.total_tokens += tokenCount;
            memory[userId].metadata.last_accessed = new Date().toISOString();

            // Save changes
            this.setMemoryStorage(memory);

            return { success: true, memoryId: newMemory.id, tokensStored: tokenCount };
        } catch (error) {
            console.error("Memory insertion failed:", error);
            return { success: false, error: error.message };
        }
    }

    async getCategoryMemories(userId, category, limit = 100) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId] || !memory[userId].categories[category]) {
                return [];
            }

            const categoryMemories = memory[userId].categories[category].memories || [];
            
            // Sort by priority (highest first) and timestamp (newest first)
            const sortedMemories = categoryMemories
                .sort((a, b) => {
                    const priorityDiff = (b.priority || 50) - (a.priority || 50);
                    if (priorityDiff !== 0) return priorityDiff;
                    return new Date(b.timestamp) - new Date(a.timestamp);
                })
                .slice(0, limit);

            // Update access tracking
            if (memory[userId].metadata) {
                memory[userId].metadata.last_accessed = new Date().toISOString();
                this.setMemoryStorage(memory);
            }

            return sortedMemories;
        } catch (error) {
            console.error(`Failed to get memories from category ${category}:`, error);
            return [];
        }
    }

    async getCategoryTokenCount(userId, category) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId] || !memory[userId].categories[category]) {
                return 0;
            }

            return memory[userId].categories[category].total_tokens || 0;
        } catch (error) {
            console.error(`Failed to get token count for category ${category}:`, error);
            return 0;
        }
    }

    async removeMemories(userId, category, memoryIds) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId] || !memory[userId].categories[category]) {
                return { success: true, removedCount: 0, tokensFreed: 0 };
            }

            const categoryMemories = memory[userId].categories[category].memories;
            let tokensFreed = 0;
            let removedCount = 0;

            // Remove memories and calculate freed tokens
            memory[userId].categories[category].memories = categoryMemories.filter(mem => {
                if (memoryIds.includes(mem.id)) {
                    tokensFreed += mem.token_count || 0;
                    removedCount++;
                    return false;
                }
                return true;
            });

            // Update counters
            memory[userId].categories[category].total_tokens -= tokensFreed;
            memory[userId].metadata.total_memories -= removedCount;
            memory[userId].metadata.total_tokens -= tokensFreed;

            // Save changes
            this.setMemoryStorage(memory);

            return { success: true, removedCount: removedCount, tokensFreed: tokensFreed };
        } catch (error) {
            console.error("Memory removal failed:", error);
            return { success: false, error: error.message };
        }
    }

    async createDynamicCategoryTracker(userId) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId]) {
                await this.createUserSpace(userId);
            }

            if (!memory[userId].dynamic_categories) {
                memory[userId].dynamic_categories = {
                    initialized: new Date().toISOString(),
                    active_categories: []
                };
                this.setMemoryStorage(memory);
            }

            return { success: true };
        } catch (error) {
            console.error("Dynamic category tracker creation failed:", error);
            return { success: false, error: error.message };
        }
    }

    async trackDynamicCategory(userId, categoryName) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId]) {
                await this.createUserSpace(userId);
            }
            if (!memory[userId].dynamic_categories) {
                await this.createDynamicCategoryTracker(userId);
            }

            const dynamicCategory = {
                category_name: categoryName,
                created_at: new Date().toISOString(),
                last_accessed: new Date().toISOString(),
                access_count: 0,
                is_active: true
            };

            // Add or update dynamic category
            const existingIndex = memory[userId].dynamic_categories.active_categories
                .findIndex(cat => cat.category_name === categoryName);
            
            if (existingIndex >= 0) {
                memory[userId].dynamic_categories.active_categories[existingIndex] = dynamicCategory;
            } else {
                memory[userId].dynamic_categories.active_categories.push(dynamicCategory);
            }

            this.setMemoryStorage(memory);
            return { success: true };
        } catch (error) {
            console.error("Dynamic category tracking failed:", error);
            return { success: false, error: error.message };
        }
    }

    async getDynamicCategories(userId) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId] || !memory[userId].dynamic_categories) {
                return [];
            }

            return memory[userId].dynamic_categories.active_categories
                .filter(cat => cat.is_active)
                .map(cat => cat.category_name);
        } catch (error) {
            console.error("Failed to get dynamic categories:", error);
            return [];
        }
    }

    async getDynamicCategoriesWithUsage(userId) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId] || !memory[userId].dynamic_categories) {
                return [];
            }

            return memory[userId].dynamic_categories.active_categories
                .filter(cat => cat.is_active)
                .map(cat => ({
                    name: cat.category_name,
                    lastAccessed: cat.last_accessed,
                    accessCount: cat.access_count
                }))
                .sort((a, b) => new Date(a.lastAccessed) - new Date(b.lastAccessed));
        } catch (error) {
            console.error("Failed to get dynamic categories with usage:", error);
            return [];
        }
    }

    async archiveDynamicCategory(userId, categoryName) {
        try {
            const memory = this.getMemoryStorage();
            
            if (!memory[userId] || !memory[userId].dynamic_categories) {
                return { success: true };
            }

            const categoryIndex = memory[userId].dynamic_categories.active_categories
                .findIndex(cat => cat.category_name === categoryName);
            
            if (categoryIndex >= 0) {
                memory[userId].dynamic_categories.active_categories[categoryIndex].is_active = false;
                this.setMemoryStorage(memory);
            }

            return { success: true };
        } catch (error) {
            console.error("Dynamic category archiving failed:", error);
            return { success: false, error: error.message };
        }
    }

    calculateTokenCount(content) {
        const words = content.split(/\s+/).length;
        return Math.ceil(words * 0.75);
    }

    async healthCheck() {
        try {
            const memory = this.getMemoryStorage();
            const userCount = Object.keys(memory).length;
            
            return { 
                status: 'healthy', 
                message: `Browser memory storage active with ${userCount} users`,
                storage_type: typeof window !== 'undefined' ? 'browser' : 'server_fallback'
            };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

export default DatabaseManager;
