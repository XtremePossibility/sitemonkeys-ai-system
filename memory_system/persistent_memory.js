// memory_system/persistent_memory.js
// FIXED: Proper exports and integration with your system

import DatabaseManager from './database_manager.js';

class PersistentMemory {
  constructor() {
    this.dbManager = new DatabaseManager();
    this.isInitialized = false;
    
    // Simple category system (simplified for compatibility)
    this.categories = [
      'Health & Wellness',
      'Relationships & Social', 
      'Business & Career',
      'Financial Management',
      'Personal Development',
      'Home & Lifestyle',
      'Technology & Tools',
      'Legal & Administrative',
      'Travel & Experiences',
      'Creative Projects',
      'Emergency & Contingency',
      'Dynamic Category 1',
      'Dynamic Category 2',
      'Dynamic Category 3',
      'Dynamic Category 4',
      'Dynamic Category 5'
    ];
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      const dbInit = await this.dbManager.initialize();
      if (!dbInit) {
        throw new Error('Database initialization failed');
      }

      this.isInitialized = true;
      console.log('[MEMORY] PersistentMemory system initialized successfully');
      return true;
    } catch (error) {
      console.error('[MEMORY] PersistentMemory initialization failed:', error);
      return false;
    }
  }

  /**
   * Store a memory with automatic categorization
   */
  async storeMemory(userId, content, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!userId || !content) {
        return { success: false, error: 'UserId and content are required' };
      }

      if (content.length < 10) {
        return { success: false, error: 'Content too short' };
      }

      // Simple categorization (pick first category for simplicity)
      const category = this.categorizeContent(content);
      const tokenCount = this.calculateTokens(content);
      const relevanceScore = this.calculateRelevanceScore(content);

      // Check category capacity
      const currentTokens = await this.dbManager.getCategoryTokenCount(userId, category);
      if (currentTokens > 45000) {
        console.log(`[MEMORY] Category ${category} approaching limit, cleaning up...`);
        await this.dbManager.cleanupCategory(userId, category);
      }

      const memory = {
        userId,
        content: content.trim(),
        category,
        subcategory: 'General',
        relevanceScore,
        tokenCount,
        emotionalWeight: this.detectEmotionalWeight(content),
        isQuestion: this.isQuestion(content),
        userPriority: options.priority || false,
        metadata: {
          source: options.source || 'chat',
          timestamp: Date.now(),
          ...options.metadata
        }
      };

      const result = await this.dbManager.storeMemory(memory);
      
      if (result.success) {
        console.log(`[MEMORY] Stored: ${category} (${tokenCount} tokens)`);
      }

      return result;
    } catch (error) {
      console.error('[MEMORY] Error storing memory:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get relevant memories based on query
   */
  async getRelevantContext(userId, message, tokenLimit = 2400, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!userId || !message) {
        return [];
      }

      // Get best category for the message
      const category = this.categorizeContent(message);
      
      // Get memories from that category
      const memories = await this.dbManager.getRelevantMemories(
        userId,
        category,
        message,
        10,
        tokenLimit
      );

      // If not enough memories, try other categories
      if (memories.length < 3 && tokenLimit > 500) {
        const remainingTokens = tokenLimit - memories.reduce((sum, mem) => sum + mem.tokenCount, 0);
        
        for (const otherCategory of this.categories) {
          if (otherCategory !== category && remainingTokens > 100) {
            const additionalMemories = await this.dbManager.getRelevantMemories(
              userId,
              otherCategory,
              message,
              3,
              remainingTokens
            );
            memories.push(...additionalMemories);
            
            if (memories.length >= 5) break;
          }
        }
      }

      return memories.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('[MEMORY] Error retrieving context:', error);
      return [];
    }
  }

  /**
   * Format memories for AI context
   */
  formatForAI(memories, options = {}) {
    if (!memories || memories.length === 0) {
      return '';
    }

    const includeMetadata = options.includeMetadata || false;
    const maxLength = options.maxLength || 2400;

    let formatted = '=== MEMORY CONTEXT ===\n';
    let currentLength = formatted.length;

    for (const memory of memories) {
      let memoryText = '';
      
      if (includeMetadata) {
        const timeAgo = this.getTimeAgo(memory.createdAt);
        memoryText = `[${memory.category} - ${timeAgo}] ${memory.content}\n`;
      } else {
        memoryText = `${memory.content}\n`;
      }

      if (currentLength + memoryText.length > maxLength) {
        const remaining = maxLength - currentLength - 10;
        if (remaining > 50) {
          memoryText = `${memory.content.substring(0, remaining)}...\n`;
        } else {
          break;
        }
      }

      formatted += memoryText;
      currentLength += memoryText.length;
    }

    formatted += '=== END CONTEXT ===\n';
    return formatted;
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(userId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const categoryStats = await this.dbManager.getCategoryStats(userId);
      const totalMemories = await this.dbManager.getUserMemoryCount(userId);
      
      const totalTokens = categoryStats.reduce((sum, cat) => sum + cat.total_tokens, 0);

      return {
        totalMemories,
        totalTokens,
        categories: categoryStats.map(stat => ({
          category: stat.category,
          memories: stat.total_memories,
          tokens: stat.total_tokens
        })),
        categoriesUsed: categoryStats.length
      };
    } catch (error) {
      console.error('[MEMORY] Error getting stats:', error);
      return {
        totalMemories: 0,
        totalTokens: 0,
        categories: [],
        categoriesUsed: 0
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const dbHealth = await this.dbManager.healthCheck();
      
      return {
        status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
        database: dbHealth,
        initialized: this.isInitialized,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        initialized: this.isInitialized,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper methods

  categorizeContent(content) {
    const contentLower = content.toLowerCase();
    
    // Simple keyword-based categorization
    const categoryKeywords = {
      'Health & Wellness': ['health', 'doctor', 'medical', 'exercise', 'diet'],
      'Business & Career': ['work', 'job', 'business', 'career', 'project', 'meeting'],
      'Financial Management': ['money', 'budget', 'investment', 'financial', 'cost'],
      'Relationships & Social': ['family', 'friend', 'relationship', 'social'],
      'Technology & Tools': ['computer', 'software', 'app', 'technology', 'system'],
      'Personal Development': ['learn', 'goal', 'skill', 'development', 'growth']
    };

    let bestCategory = 'Personal Development'; // Default
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (contentLower.includes(keyword)) {
          score += 1;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  calculateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  calculateRelevanceScore(content) {
    let score = 0.5; // Base score

    if (this.isQuestion(content)) score += 0.2;
    if (content.length > 100) score += 0.1;
    if (this.detectEmotionalWeight(content) > 0.5) score += 0.1;

    return Math.min(score, 1.0);
  }

  detectEmotionalWeight(content) {
    const emotionalWords = ['love', 'hate', 'excited', 'worried', 'happy', 'sad'];
    const lowerContent = content.toLowerCase();
    
    let weight = 0;
    for (const word of emotionalWords) {
      if (lowerContent.includes(word)) {
        weight += 0.2;
      }
    }

    return Math.min(weight, 1.0);
  }

  isQuestion(content) {
    return content.includes('?') || 
           /^(what|how|when|where|why|who)\b/i.test(content.trim());
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
}

export default PersistentMemory;
