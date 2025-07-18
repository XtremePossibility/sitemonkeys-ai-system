import { DatabaseManager } from './database_manager.js';
import { RoutingIntelligence } from './routing_intelligence.js';
import { ExtractionEngine } from './extraction_engine.js';
import { CategoryManager } from './category_manager.js';
class SiteMonkeysMemoryCore {
    constructor() {
        this.databaseManager = new DatabaseManager();
        this.routingIntelligence = new RoutingIntelligence();
        this.extractionEngine = new ExtractionEngine();
        this.categoryManager = new CategoryManager();
        this.initialized = false;
    }

    async initialize(userId) {
        try {
            // Self-provisioning: Create user's memory infrastructure
            await this.databaseManager.createUserSpace(userId);
            await this.categoryManager.initializeStaticCategories(userId);
            
            this.initialized = true;
            console.log(`Memory system initialized for user: ${userId}`);
            return { success: true, message: "Memory system ready" };
        } catch (error) {
            console.error("Memory system initialization failed:", error);
            return { success: false, fallback: true };
        }
    }

    async storeMemory(userId, content, metadata = {}) {
        if (!this.initialized) {
            await this.initialize(userId);
        }

        try {
            // Smart routing to determine category
            const routing = await this.routingIntelligence.routeContent(content, metadata);
            
            // Condense content to memory entry format
            const memoryEntry = await this.condenseToMemoryEntry(content, metadata);
            
            // Store in appropriate category with overwrite logic
            const result = await this.categoryManager.storeInCategory(
                userId, 
                routing.category, 
                routing.subcategory, 
                memoryEntry
            );

            return result;
        } catch (error) {
            console.error("Memory storage failed:", error);
            return { success: false, error: error.message };
        }
    }

    async retrieveRelevantMemories(userId, query, maxTokens = 2500) {
        if (!this.initialized) {
            await this.initialize(userId);
        }

        try {
            // Intelligent category selection
            const relevantCategories = await this.routingIntelligence.selectRetrievalCategories(query);
            
            // Extract up to maxTokens of relevant memories
            const memories = await this.extractionEngine.extractRelevantContent(
                userId, 
                relevantCategories, 
                query, 
                maxTokens
            );

            return {
                success: true,
                memories: memories,
                tokenCount: this.calculateTokenCount(memories),
                categoriesSearched: relevantCategories.map(c => c.category)
            };
        } catch (error) {
            console.error("Memory retrieval failed:", error);
            return { success: false, fallback: [], error: error.message };
        }
    }

    async condenseToMemoryEntry(content, metadata) {
        // Condense content to ~150-200 token memory entry
        const condensed = await this.intelligentCondensation(content);
        
        return {
            content: condensed,
            timestamp: new Date().toISOString(),
            priority: this.calculatePriority(content, metadata),
            keywords: this.extractKeywords(content),
            emotional_markers: this.detectEmotionalMarkers(content),
            metadata: metadata
        };
    }

    calculateTokenCount(content) {
        // Rough token estimation (1 token ≈ 0.75 words)
        const words = content.split(/\s+/).length;
        return Math.ceil(words * 0.75);
    }

    async intelligentCondensation(content) {
        // Smart summarization preserving key insights
        // This would integrate with your AI API to condense content
        if (content.length <= 600) return content; // Already condensed
        
        // Use AI to condense while preserving key information
        // Implementation would call your AI service
        return content.substring(0, 600) + "..."; // Fallback
    }

    calculatePriority(content, metadata) {
        let priority = 50; // Base priority
        
        // Boost for emotional content
        if (this.detectEmotionalMarkers(content).length > 0) priority += 20;
        
        // Boost for decision/goal content
        if (content.match(/\b(decide|goal|plan|want|need)\b/i)) priority += 15;
        
        // Boost for problem/solution content
        if (content.match(/\b(problem|solution|fix|issue)\b/i)) priority += 10;
        
        return Math.min(priority, 100);
    }

    extractKeywords(content) {
        // Extract relevant keywords for faster searching
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
        
        return content.toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 3 && !commonWords.has(word))
            .slice(0, 10); // Top 10 keywords
    }

    detectEmotionalMarkers(content) {
        const emotionalWords = [
            'stressed', 'anxious', 'worried', 'excited', 'frustrated', 'angry',
            'sad', 'happy', 'overwhelmed', 'confident', 'scared', 'proud',
            'disappointed', 'hopeful', 'grateful', 'exhausted'
        ];
        
        return emotionalWords.filter(word => 
            content.toLowerCase().includes(word)
        );
    }
}

export { SiteMonkeysMemoryCore };
