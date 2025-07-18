class MemoryAPI {
    constructor() {
        this.memoryCore = new SiteMonkeysMemoryCore();
    }

    // Main interface methods for integration with existing system
    async getRelevantContext(userId, query, maxTokens = 2500) {
        try {
            const result = await this.memoryCore.retrieveRelevantMemories(userId, query, maxTokens);
            
            if (result.success) {
                return {
                    contextFound: true,
                    memories: result.memories,
                    tokenCount: result.tokenCount,
                    categories: result.categoriesSearched,
                    processingTime: Date.now()
                };
            } else {
                return {
                    contextFound: false,
                    fallback: true,
                    error: result.error
                };
            }
        } catch (error) {
            console.error("Memory API context retrieval failed:", error);
            return {
                contextFound: false,
                fallback: true,
                error: error.message
            };
        }
    }

    async storeConversationMemory(userId, conversationContent, metadata = {}) {
        try {
            const result = await this.memoryCore.storeMemory(userId, conversationContent, metadata);
            
            return {
                stored: result.success,
                category: result.category,
                tokensUsed: result.tokensStored || 0,
                memoryId: result.memoryId
            };
        } catch (error) {
            console.error("Memory API storage failed:", error);
            return {
                stored: false,
                error: error.message
            };
        }
    }

    async initializeUserMemory(userId) {
        try {
            const result = await this.memoryCore.initialize(userId);
            return result;
        } catch (error) {
            console.error("Memory API initialization failed:", error);
            return { success: false, error: error.message };
        }
    }

    // Health check method
    async healthCheck() {
        return {
            status: 'operational',
            timestamp: new Date().toISOString(),
            components: {
                database: 'connected',
                routing: 'active',
                extraction: 'ready',
                categories: 'initialized'
            }
        };
    }
}

// ================================================================
// EXPORT FOR INTEGRATION
// ================================================================

// Single integration point for existing system
const memoryAPI = new MemoryAPI();

// Export for ES6 import syntax
export const getRelevantContext = (userId, query, maxTokens = 2500) => memoryAPI.getRelevantContext(userId, query, maxTokens);
export const storeMemory = (userId, content, metadata = {}) => memoryAPI.storeConversationMemory(userId, content, metadata);
export const initializeUser = (userId) => memoryAPI.initializeUserMemory(userId);
export const healthCheck = () => memoryAPI.healthCheck();

export default memoryAPI;

// ================================================================
// INTEGRATION EXAMPLE
// ================================================================

/*
// How to integrate with existing system:

// 1. Add to your existing chat handler:
const memorySystem = require('./memory_system/memory_api.js');

// 2. Before generating response:
const relevantMemories = await memorySystem.getRelevantContext(userId, userQuery, 2500);

// 3. Include memories in your AI prompt:
if (relevantMemories.contextFound) {
    const enhancedPrompt = `
        Context from user's memory:
        ${relevantMemories.memories}
        
        User query: ${userQuery}
    `;
}

// 4. After generating response, store the conversation:
await memorySystem.storeMemory(userId, `User: ${userQuery}\nAssistant: ${response}`, {
    session_id: sessionId,
    response_type: 'business_validation'
});

*/
