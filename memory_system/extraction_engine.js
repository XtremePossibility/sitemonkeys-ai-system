// memory_system/extraction_engine.js
// Intelligent memory extraction and relevance scoring engine

import DatabaseManager from './database_manager.js';
import RoutingIntelligence from './routing_intelligence.js';

class ExtractionEngine {
  constructor() {
    this.dbManager = new DatabaseManager();
    this.routingIntelligence = new RoutingIntelligence();
  }

  /**
   * Extract relevant memories based on query and context
   * @param {string} userId - User identifier
   * @param {string} query - Current query/message
   * @param {number} tokenLimit - Maximum tokens to extract
   * @param {Object} options - Additional options
   * @returns {Array} Relevant memories
   */
  async extractRelevantMemories(userId, query, tokenLimit = 2400, options = {}) {
    try {
      // Route the query to determine relevant categories
      const routing = this.routingIntelligence.routeToCategory(query, options.context);
      const primaryCategory = routing?.const primaryCategory = routing && routing.category;category;
      
      if (!primaryCategory) {
        console.warn('Failed to route query, searching all categories');
        return await this.searchAcrossAllCategories(userId, query, tokenLimit, options);
      }

      // Get memories from primary category
      const primaryMemories = await this.dbManager.getRelevantMemories(
        userId, 
        primaryCategory, 
        query, 
        Math.ceil(tokenLimit / 100), // Estimate memories needed
        Math.ceil(tokenLimit * 0.7) // 70% of tokens from primary category
      );

      // Get memories from related categories if we have token budget left
      const usedTokens = primaryMemories.reduce((sum, mem) => sum + mem.tokenCount, 0);
      const remainingTokens = tokenLimit - usedTokens;
      let additionalMemories = [];

      if (remainingTokens > 200 && primaryMemories.length < 10) {
        const relatedCategories = this.getRelatedCategories(primaryCategory);
        additionalMemories = await this.getMemoriesFromRelatedCategories(
          userId, 
          query, 
          relatedCategories, 
          remainingTokens,
          options
        );
      }

      // Combine and score all memories
      const allMemories = [...primaryMemories, ...additionalMemories];
      const scoredMemories = this.scoreMemoriesForQuery(allMemories, query, options);

      // Filter by final token limit
      return this.filterByTokenLimit(scoredMemories, tokenLimit);

    } catch (error) {
      console.error('Error extracting relevant memories:', error);
      return [];
    }
  }

  /**
   * Search across all categories when routing fails
   */
  async searchAcrossAllCategories(userId, query, tokenLimit, options) {
    try {
      const memories = await this.dbManager.searchMemories(userId, query, 50);
      const scoredMemories = this.scoreMemoriesForQuery(memories, query, options);
      return this.filterByTokenLimit(scoredMemories, tokenLimit);
    } catch (error) {
      console.error('Error searching across all categories:', error);
      return [];
    }
  }

  /**
   * Get memories from related categories
   */
  async getMemoriesFromRelatedCategories(userId, query, relatedCategories, tokenBudget, options) {
    const additionalMemories = [];
    const tokensPerCategory = Math.floor(tokenBudget / relatedCategories.length);

    for (const category of relatedCategories) {
      try {
        const memories = await this.dbManager.getRelevantMemories(
          userId, 
          category, 
          query, 
          5, // Limit to 5 memories per related category
          tokensPerCategory
        );
        additionalMemories.push(...memories);
        
        // Break if we're running low on token budget
        const currentTokens = additionalMemories.reduce((sum, mem) => sum + mem.tokenCount, 0);
        if (currentTokens >= tokenBudget * 0.8) break;
      } catch (error) {
        console.error(`Error getting memories from category ${category}:`, error);
      }
    }

    return additionalMemories;
  }

  /**
   * Score memories for relevance to current query
   */
  scoreMemoriesForQuery(memories, query, options = {}) {
    return memories.map(memory => {
      let score = memory.relevanceScore || 0.5;

      // Text similarity boost
      score += this.calculateTextSimilarity(memory.content, query) * 0.4;

      // Keyword matching boost
      score += this.calculateKeywordMatch(memory.content, query) * 0.3;

      // Recency boost
      score += this.calculateRecencyBoost(memory.createdAt) * 0.1;

      // Usage frequency boost
      score += Math.min((memory.usageFrequency || 0) * 0.01, 0.2);

      // Question relevance boost
      if (memory.isQuestion && this.isQuerySeekingAnswer(query)) {
        score += 0.2;
      }

      // Emotional relevance boost
      if (memory.emotionalWeight > 0.5 && this.hasEmotionalContext(query)) {
        score += memory.emotionalWeight * 0.2;
      }

      // Context category boost
      if (options.currentCategory && memory.category === options.currentCategory) {
        score += 0.15;
      }

      // Priority boost
      if (memory.userPriority) {
        score += 0.1;
      }

      return {
        ...memory,
        queryRelevanceScore: Math.min(score, 1.0)
      };
    }).sort((a, b) => b.queryRelevanceScore - a.queryRelevanceScore);
  }

  /**
   * Calculate text similarity between memory content and query
   */
  calculateTextSimilarity(content, query) {
    const contentWords = this.extractKeywords(content.toLowerCase());
    const queryWords = this.extractKeywords(query.toLowerCase());
    
    if (contentWords.length === 0 || queryWords.length === 0) return 0;

    const commonWords = contentWords.filter(word => queryWords.includes(word));
    const similarity = commonWords.length / Math.max(contentWords.length, queryWords.length);
    
    return similarity;
  }

  /**
   * Calculate keyword matching score
   */
  calculateKeywordMatch(content, query) {
    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Direct substring match
    if (contentLower.includes(queryLower) || queryLower.includes(contentLower)) {
      return 0.8;
    }

    // Individual word matches
    const queryWords = this.extractKeywords(queryLower);
    const matchedWords = queryWords.filter(word => 
      word.length > 3 && contentLower.includes(word)
    );

    return Math.min(matchedWords.length / queryWords.length, 1.0);
  }

  /**
   * Calculate recency boost
   */
  calculateRecencyBoost(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 1) return 0.3;
    if (daysDiff < 7) return 0.2;
    if (daysDiff < 30) return 0.1;
    if (daysDiff < 90) return 0.05;
    return 0;
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    // Simple keyword extraction - remove stop words and short words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'
    ]);

    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word.toLowerCase()) &&
        !/^\d+$/.test(word)
      );
  }

  /**
   * Check if query is seeking an answer
   */
  isQuerySeekingAnswer(query) {
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'who', 'which'];
    const questionStarters = ['can you', 'could you', 'would you', 'do you know', 'tell me'];
    
    const lowerQuery = query.toLowerCase();
    
    return query.includes('?') ||
           questionWords.some(word => lowerQuery.startsWith(word)) ||
           questionStarters.some(phrase => lowerQuery.includes(phrase));
  }

  /**
   * Check if query has emotional context
   */
  hasEmotionalContext(query) {
    const emotionalWords = [
      'feel', 'feeling', 'felt', 'emotion', 'emotional', 'mood', 'happy', 'sad',
      'angry', 'frustrated', 'excited', 'worried', 'anxious', 'love', 'hate',
      'like', 'dislike', 'enjoy', 'prefer', 'hope', 'fear', 'proud', 'ashamed'
    ];

    const lowerQuery = query.toLowerCase();
    return emotionalWords.some(word => lowerQuery.includes(word));
  }

  /**
   * Get categories related to the primary category
   */
  getRelatedCategories(primaryCategory) {
    const categoryRelations = {
      'Health & Wellness': ['Personal Development', 'Home & Lifestyle'],
      'Relationships & Social': ['Personal Development', 'Travel & Experiences'],
      'Business & Career': ['Financial Management', 'Personal Development', 'Technology & Tools'],
      'Financial Management': ['Business & Career', 'Home & Lifestyle'],
      'Personal Development': ['Health & Wellness', 'Business & Career', 'Relationships & Social'],
      'Home & Lifestyle': ['Health & Wellness', 'Financial Management', 'Creative Projects'],
      'Technology & Tools': ['Business & Career', 'Creative Projects'],
      'Legal & Administrative': ['Financial Management', 'Business & Career'],
      'Travel & Experiences': ['Relationships & Social', 'Creative Projects'],
      'Creative Projects': ['Personal Development', 'Technology & Tools', 'Travel & Experiences'],
      'Emergency & Contingency': ['Health & Wellness', 'Financial Management', 'Legal & Administrative']
    };

    return categoryRelations[primaryCategory] || [];
  }

  /**
   * Filter memories by token limit
   */
  filterByTokenLimit(memories, tokenLimit) {
    const filtered = [];
    let totalTokens = 0;

    for (const memory of memories) {
      if (totalTokens + memory.tokenCount <= tokenLimit) {
        filtered.push(memory);
        totalTokens += memory.tokenCount;
      } else {
        // Try to fit a truncated version if it's a high-scoring memory
        if (memory.queryRelevanceScore > 0.7 && totalTokens < tokenLimit * 0.9) {
          const remainingTokens = tokenLimit - totalTokens;
          const maxChars = remainingTokens * 4; // Approximate characters per token
          
          if (maxChars > 100) {
            const truncatedContent = memory.content.substring(0, maxChars - 10) + '...';
            filtered.push({
              ...memory,
              content: truncatedContent,
              tokenCount: remainingTokens,
              truncated: true
            });
            break;
          }
        }
        break;
      }
    }

    return filtered;
  }

  /**
   * Get memory extraction statistics
   */
  async getExtractionStats(userId, timeRange = '30d') {
    try {
      // This would require additional database tracking
      // For now, return basic stats from existing data
      const stats = await this.dbManager.getCategoryStats(userId);
      
      return {
        totalCategories: stats.length,
        mostUsedCategory: stats.reduce((max, cat) => 
  cat.total_memories > ((max && max.total_memories) ? max.total_memories : 0) ? cat : max, null
)
        avgTokensPerCategory: stats.length > 0 
          ? Math.round(stats.reduce((sum, cat) => sum + cat.total_tokens, 0) / stats.length) 
          : 0,
        timeRange
      };
    } catch (error) {
      console.error('Error getting extraction stats:', error);
      return null;
    }
  }
}

export default ExtractionEngine;
