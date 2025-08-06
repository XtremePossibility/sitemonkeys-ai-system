// memory_system/persistent_memory.js
// Main interface for Site Monkeys AI persistent memory system

import DatabaseManager from './database_manager.js';
import RoutingIntelligence from './routing_intelligence.js';
import ExtractionEngine from './extraction_engine.js';
import CategoryManager from './category_manager.js';

class PersistentMemory {
  constructor() {
    this.dbManager = DatabaseManager;
    this.routingIntelligence = new RoutingIntelligence();
    this.extractionEngine = new ExtractionEngine();
    this.categoryManager = new CategoryManager();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Initialize database
      const dbInit = await this.dbManager.initialize();
      if (!dbInit) {
        throw new Error('Database initialization failed');
      }

      // Initialize category manager
      await this.categoryManager.initialize();

      this.isInitialized = true;
      console.log('PersistentMemory system initialized successfully');
      return true;
    } catch (error) {
      console.error('PersistentMemory initialization failed:', error);
      return false;
    }
  }

  /**
   * Store a memory with automatic categorization and relevance scoring
   * @param {string} userId - User identifier
   * @param {string} content - Memory content
   * @param {Object} options - Additional options
   * @returns {Object} Storage result
   */
  async storeMemory(userId, content, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate inputs
      if (!userId || !content) {
        return { success: false, error: 'UserId and content are required' };
      }

      if (content.length < 10) {
        return { success: false, error: 'Content too short to be meaningful' };
      }

      // Calculate token count (approximate)
      const tokenCount = this.calculateTokens(content);

      // Route to category using RoutingIntelligence
      const routing = await this.routingIntelligence.routeMemory(content, options.context);
      
      if (!routing || !routing.category) {
        console.warn('Failed to route memory, using fallback category');
        routing = {
          category: 'Personal Development',
          subcategory: 'General',
          confidence: 0.3
        };
      }

      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(content, options);

      // Check category capacity and cleanup if needed
      const currentTokens = await this.dbManager.getCategoryTokenCount(userId, routing.category);
      if (currentTokens > 45000) { // 45K threshold to allow for cleanup
        console.log(`Category ${routing.category} approaching limit, cleaning up...`);
        await this.dbManager.cleanupCategory(userId, routing.category);
      }

      // Create memory object
      const memory = {
        userId,
        content: content.trim(),
        category: routing.category,
        subcategory: routing.subcategory,
        relevanceScore,
        tokenCount,
        emotionalWeight: this.detectEmotionalWeight(content),
        isQuestion: this.isQuestion(content),
        userPriority: options.priority || false,
        metadata: {
          routingConfidence: routing.confidence,
          contentHash: this.generateContentHash(content),
          source: options.source || 'user_input',
          sessionId: options.sessionId,
          timestamp: Date.now(),
          ...options.metadata
        }
      };

      // Store in database
      const result = await this.dbManager.storeMemory(memory);
      
      if (result.success) {
        console.log(`Memory stored: ${routing.category}/${routing.subcategory} (${tokenCount} tokens, relevance: ${relevanceScore})`);
      }

      return result;
    } catch (error) {
      console.error('Error storing memory:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieve relevant memories based on query and context
   * @param {string} userId - User identifier
   * @param {string} message - Current message/query
   * @param {number} tokenLimit - Maximum tokens to retrieve (default: 2400)
   * @param {Object} options - Additional options
   * @returns {Array} Relevant memories
   */
  async getRelevantContext(userId, message, tokenLimit = 2400, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!userId || !message) {
        return [];
      }

      // Use ExtractionEngine to find relevant memories
      const relevantMemories = await this.extractionEngine.extractRelevantMemories(
        userId, 
        message, 
        tokenLimit,
        options
      );

      // Sort by relevance and recency
      relevantMemories.sort((a, b) => {
        const scoreA = a.relevanceScore + (a.usageFrequency * 0.01) + this.getRecencyBoost(a.createdAt);
        const scoreB = b.relevanceScore + (b.usageFrequency * 0.01) + this.getRecencyBoost(b.createdAt);
        return scoreB - scoreA;
      });

      return relevantMemories;
    } catch (error) {
      console.error('Error retrieving relevant context:', error);
      return [];
    }
  }

  /**
   * Get memories for a specific category
   * @param {string} userId - User identifier
   * @param {string} category - Category name
   * @param {number} limit - Maximum memories to return
   * @returns {Array} Category memories
   */
  async getCategoryMemories(userId, category, limit = 50) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await this.dbManager.getMemoriesByCategory(userId, category, limit);
    } catch (error) {
      console.error('Error getting category memories:', error);
      return [];
    }
  }

  /**
   * Search memories by content
   * @param {string} userId - User identifier
   * @param {string} searchTerm - Search term
   * @param {number} limit - Maximum results
   * @returns {Array} Search results
   */
  async searchMemories(userId, searchTerm, limit = 20) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await this.dbManager.searchMemories(userId, searchTerm, limit);
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }

  /**
   * Get memory statistics for user
   * @param {string} userId - User identifier
   * @returns {Object} Memory statistics
   */
  async getMemoryStats(userId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const categoryStats = await this.dbManager.getCategoryStats(userId);
      const totalMemories = await this.dbManager.getUserMemoryCount(userId);
      
      const totalTokens = categoryStats.reduce((sum, cat) => sum + cat.total_tokens, 0);
      const avgRelevance = categoryStats.length > 0 
        ? categoryStats.reduce((sum, cat) => sum + parseFloat(cat.avg_relevance), 0) / categoryStats.length 
        : 0;

      return {
        totalMemories,
        totalTokens,
        avgRelevance: Math.round(avgRelevance * 100) / 100,
        categories: categoryStats.map(stat => ({
          category: stat.category,
          memories: stat.total_memories,
          tokens: stat.total_tokens,
          avgRelevance: Math.round(parseFloat(stat.avg_relevance) * 100) / 100,
          lastUpdated: stat.last_updated
        })),
        categoriesUsed: categoryStats.length
      };
    } catch (error) {
      console.error('Error getting memory stats:', error);
      return {
        totalMemories: 0,
        totalTokens: 0,
        avgRelevance: 0,
        categories: [],
        categoriesUsed: 0
      };
    }
  }

  /**
   * Delete a memory
   * @param {string} userId - User identifier
   * @param {number} memoryId - Memory ID
   * @returns {boolean} Success status
   */
  async deleteMemory(userId, memoryId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await this.dbManager.deleteMemory(userId, memoryId);
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  }

  /**
   * Format memories for AI context injection
   * @param {Array} memories - Array of memories
   * @param {Object} options - Formatting options
   * @returns {string} Formatted context string
   */
  formatForAI(memories, options = {}) {
    if (!memories || memories.length === 0) {
      return '';
    }

    const includeMetadata = options.includeMetadata || false;
    const maxLength = options.maxLength || 2400;

    let formatted = '=== RELEVANT CONTEXT ===\n';
    let currentLength = formatted.length;

    for (const memory of memories) {
      let memoryText = '';
      
      if (includeMetadata) {
        const timeAgo = this.getTimeAgo(memory.createdAt);
        memoryText = `[${memory.category}${memory.subcategory ? `/${memory.subcategory}` : ''} - ${timeAgo}] ${memory.content}\n`;
      } else {
        memoryText = `${memory.content}\n`;
      }

      if (currentLength + memoryText.length > maxLength) {
        // Try to fit a truncated version
        const remaining = maxLength - currentLength - 10; // Leave space for "..."
        if (remaining > 50) {
          memoryText = `${memory.content.substring(0, remaining)}...\n`;
        } else {
          break;
        }
      }

      formatted += memoryText;
      currentLength += memoryText.length;
    }

    formatted += '=== END CONTEXT ===\n\n';
    return formatted;
  }

  // Helper methods

  calculateTokens(text) {
    // Approximate token calculation (1 token ≈ 4 characters for English)
    return Math.ceil(text.length / 4);
  }

  calculateRelevanceScore(content, options = {}) {
    let score = 0.5; // Base score

    // Boost for questions
    if (this.isQuestion(content)) {
      score += 0.2;
    }

    // Boost for emotional content
    const emotionalWeight = this.detectEmotionalWeight(content);
    score += emotionalWeight * 0.3;

    // Boost for user-marked priority
    if (options.priority) {
      score += 0.3;
    }

    // Boost for longer, more detailed content
    if (content.length > 200) {
      score += 0.1;
    }

    // Boost for personal pronouns (indicates personal significance)
    const personalPronouns = (content.match(/\b(I|me|my|mine|myself)\b/gi) || []).length;
    score += Math.min(personalPronouns * 0.05, 0.2);

    return Math.min(score, 1.0);
  }

  detectEmotionalWeight(content) {
    const emotionalKeywords = [
      'love', 'hate', 'excited', 'worried', 'anxious', 'happy', 'sad', 
      'angry', 'frustrated', 'proud', 'disappointed', 'surprised',
      'afraid', 'confident', 'nervous', 'grateful', 'jealous', 'hopeful'
    ];

    const strongEmotions = [
      'devastated', 'ecstatic', 'furious', 'terrified', 'overjoyed',
      'heartbroken', 'thrilled', 'panicked', 'elated', 'disgusted'
    ];

    let weight = 0;
    const lowerContent = content.toLowerCase();

    emotionalKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        weight += 0.1;
      }
    });

    strongEmotions.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        weight += 0.3;
      }
    });

    // Check for exclamation marks
    const exclamations = (content.match(/!/g) || []).length;
    weight += Math.min(exclamations * 0.1, 0.3);

    return Math.min(weight, 1.0);
  }

  isQuestion(content) {
    return content.includes('?') || 
           /^(what|how|when|where|why|who|which|can|could|would|should|will|do|does|did|is|are|was|were)\b/i.test(content.trim());
  }

  generateContentHash(content) {
    // Simple hash function for content deduplication
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  getRecencyBoost(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    
    // More recent memories get a small boost
    if (daysDiff < 1) return 0.1;
    if (daysDiff < 7) return 0.05;
    if (daysDiff < 30) return 0.02;
    return 0;
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  }

  async healthCheck() {
    const dbHealth = await this.dbManager.healthCheck();
    const stats = await this.getMemoryStats('health_check_user');
    
    return {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
      database: dbHealth,
      initialized: this.isInitialized,
      timestamp: new Date().toISOString(),
      components: {
        routingIntelligence: !!this.routingIntelligence,
        extractionEngine: !!this.extractionEngine,
        categoryManager: !!this.categoryManager
      }
    };
  }
}

export default PersistentMemory;
