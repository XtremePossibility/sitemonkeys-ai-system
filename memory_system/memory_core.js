// memory_system/memory_core.js
// Core memory operations and utilities for Site Monkeys AI Memory System

import DatabaseManager from './database_manager.js';

class MemoryCore {
  constructor() {
    this.dbManager = new DatabaseManager();
    this.tokenLimits = {
      categoryMax: 50000,
      extractionMax: 2400,
      memoryMin: 20,
      memoryMax: 5000
    };

    this.relevanceThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4,
      minimum: 0.2
    };

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

  /**
   * Validate memory object before storage
   */
  validateMemory(memory) {
    const errors = [];

    if (!memory.userId) {
      errors.push('User ID is required');
    }

    if (!memory.content || memory.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (memory.content && memory.content.length < this.tokenLimits.memoryMin) {
      errors.push(`Content too short (minimum ${this.tokenLimits.memoryMin} characters)`);
    }

    if (memory.content && memory.content.length > this.tokenLimits.memoryMax * 4) {
      errors.push(`Content too long (maximum ${this.tokenLimits.memoryMax * 4} characters)`);
    }

    if (memory.category && !this.categories.includes(memory.category)) {
      errors.push(`Invalid category: ${memory.category}`);
    }

    if (memory.relevanceScore && (memory.relevanceScore < 0 || memory.relevanceScore > 1)) {
      errors.push('Relevance score must be between 0 and 1');
    }

    if (memory.emotionalWeight && (memory.emotionalWeight < 0 || memory.emotionalWeight > 1)) {
      errors.push('Emotional weight must be between 0 and 1');
    }

    if (memory.tokenCount && memory.tokenCount < 0) {
      errors.push('Token count cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate accurate token count for content
   */
  calculateTokenCount(content) {
    if (!content) return 0;

    // More sophisticated token calculation
    // This approximates OpenAI's tokenization more closely
    
    // Count words
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Count punctuation and special characters
    const punctuation = (content.match(/[.,!?;:'"(){}[\]]/g) || []).length;
    
    // Count numbers (numbers often tokenize differently)
    const numbers = (content.match(/\b\d+\b/g) || []).length;
    
    // Estimate tokens: roughly 0.75 tokens per word + punctuation + number adjustment
    const estimatedTokens = Math.ceil(
      (words.length * 0.75) + 
      (punctuation * 0.5) + 
      (numbers * 0.3)
    );
    
    return Math.max(estimatedTokens, Math.ceil(content.length / 4));
  }

  /**
   * Analyze content for memory characteristics
   */
  analyzeContent(content) {
    const analysis = {
      tokenCount: this.calculateTokenCount(content),
      emotionalWeight: this.calculateEmotionalWeight(content),
      isQuestion: this.detectQuestion(content),
      complexity: this.calculateComplexity(content),
      topics: this.extractTopics(content),
      entities: this.extractEntities(content),
      sentiment: this.calculateSentiment(content)
    };

    return analysis;
  }

  /**
   * Calculate emotional weight of content
   */
  calculateEmotionalWeight(content) {
    const emotionalIndicators = {
      positive: {
        keywords: ['love', 'happy', 'excited', 'joy', 'amazing', 'wonderful', 'great', 'excellent', 'fantastic', 'proud'],
        weight: 0.1
      },
      negative: {
        keywords: ['hate', 'angry', 'sad', 'frustrated', 'worried', 'anxious', 'terrible', 'awful', 'disappointed'],
        weight: 0.15
      },
      intense: {
        keywords: ['devastated', 'ecstatic', 'furious', 'terrified', 'overjoyed', 'heartbroken', 'thrilled'],
        weight: 0.3
      }
    };

    let totalWeight = 0;
    const lowerContent = content.toLowerCase();

    for (const [category, data] of Object.entries(emotionalIndicators)) {
      for (const keyword of data.keywords) {
        if (lowerContent.includes(keyword)) {
          totalWeight += data.weight;
        }
      }
    }

    // Check for emotional punctuation
    const exclamations = (content.match(/!/g) || []).length;
    const questions = (content.match(/\?/g) || []).length;
    const caps = (content.match(/[A-Z]{3,}/g) || []).length;

    totalWeight += Math.min(exclamations * 0.05, 0.2);
    totalWeight += Math.min(questions * 0.03, 0.1);
    totalWeight += Math.min(caps * 0.1, 0.2);

    return Math.min(totalWeight, 1.0);
  }

  /**
   * Detect if content contains questions
   */
  detectQuestion(content) {
    // Direct question mark
    if (content.includes('?')) return true;

    // Question words at the beginning
    const questionWords = /^(what|how|when|where|why|who|which|can|could|would|should|will|do|does|did|is|are|was|were)\b/i;
    return questionWords.test(content.trim());
  }

  /**
   * Calculate content complexity
   */
  calculateComplexity(content) {
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Complexity factors
    const longWords = words.filter(word => word.length > 6).length / words.length;
    const technicalTerms = words.filter(word => 
      word.length > 8 || 
      /[A-Z]{2,}/.test(word) || 
      word.includes('-')
    ).length / words.length;

    const complexity = (
      (avgWordsPerSentence / 20) * 0.3 +
      (avgWordLength / 8) * 0.3 +
      longWords * 0.2 +
      technicalTerms * 0.2
    );

    return Math.min(complexity, 1.0);
  }

  /**
   * Extract main topics from content
   */
  extractTopics(content) {
    // Simple topic extraction based on noun phrases and key terms
    const topicPatterns = [
      /\b(project|work|job|career|business)\b/gi,
      /\b(health|medical|doctor|treatment)\b/gi,
      /\b(family|friend|relationship|social)\b/gi,
      /\b(money|financial|budget|investment)\b/gi,
      /\b(travel|trip|vacation|experience)\b/gi,
      /\b(home|house|apartment|living)\b/gi,
      /\b(learning|education|skill|development)\b/gi,
      /\b(technology|software|computer|digital)\b/gi
    ];

    const topics = [];
    for (const pattern of topicPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        topics.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(topics)];
  }

  /**
   * Extract entities (names, places, organizations)
   */
  extractEntities(content) {
    const entities = {
      people: [],
      places: [],
      organizations: [],
      dates: []
    };

    // Simple entity extraction patterns
    const patterns = {
      people: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Last names
      places: /\b(?:in|at|from|to) [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g,
      dates: /\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{2,4})\b/gi
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern) || [];
      entities[type] = [...new Set(matches.map(m => m.trim()))];
    }

    return entities;
  }

  /**
   * Calculate sentiment score (-1 to 1)
   */
  calculateSentiment(content) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'love', 'like', 'enjoy', 'successful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'failed', 'problem'];

    const lowerContent = content.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    for (const word of positiveWords) {
      if (lowerContent.includes(word)) positiveScore++;
    }

    for (const word of negativeWords) {
      if (lowerContent.includes(word)) negativeScore++;
    }

    const totalWords = content.split(/\s+/).length;
    const sentiment = (positiveScore - negativeScore) / Math.max(totalWords / 10, 1);
    
    return Math.max(-1, Math.min(1, sentiment));
  }

  /**
   * Merge similar memories to reduce redundancy
   */
  async identifySimilarMemories(userId, content, threshold = 0.8) {
    try {
      const recentMemories = await this.dbManager.searchMemories(userId, content.substring(0, 50), 20);
      const similar = [];

      for (const memory of recentMemories) {
        const similarity = this.calculateSimilarity(content, memory.content);
        if (similarity >= threshold) {
          similar.push({
            ...memory,
            similarity
          });
        }
      }

      return similar.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Error identifying similar memories:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between two pieces of content
   */
  calculateSimilarity(content1, content2) {
    if (!content1 || !content2) return 0;

    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Get memory quality metrics
   */
  getMemoryQualityScore(memory) {
    let score = memory.relevanceScore || 0.5;

    // Boost for detailed content
    if (memory.tokenCount > 50) score += 0.1;
    if (memory.tokenCount > 100) score += 0.1;

    // Boost for emotional content
    if (memory.emotionalWeight > 0.5) score += 0.15;

    // Boost for questions (often more valuable)
    if (memory.isQuestion) score += 0.1;

    // Boost for user priority
    if (memory.userPriority) score += 0.2;

    // Boost for usage frequency
    if (memory.usageFrequency > 0) {
      score += Math.min(memory.usageFrequency * 0.01, 0.15);
    }

    // Penalty for very old memories without recent access
    if (memory.lastAccessedAt) {
      const daysSinceAccess = (Date.now() - new Date(memory.lastAccessedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess > 90) score -= 0.1;
      if (daysSinceAccess > 180) score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate memory recommendations for optimization
   */
  async generateMemoryRecommendations(userId) {
    try {
      const stats = await this.dbManager.getCategoryStats(userId);
      const recommendations = [];

      for (const category of stats) {
        // Check token usage
        if (category.total_tokens > this.tokenLimits.categoryMax * 0.9) {
          recommendations.push({
            type: 'cleanup_needed',
            category: category.category,
            priority: 'high',
            message: `Category approaching token limit (${category.total_tokens}/${this.tokenLimits.categoryMax})`,
            action: 'Archive low-relevance memories'
          });
        }

        // Check relevance quality
        if (category.avg_relevance < this.relevanceThresholds.medium) {
          recommendations.push({
            type: 'quality_issue',
            category: category.category,
            priority: 'medium',
            message: `Low average relevance score (${category.avg_relevance})`,
            action: 'Review and improve memory categorization'
          });
        }

        // Check for unused categories
        if (category.total_memories === 0) {
          recommendations.push({
            type: 'unused_category',
            category: category.category,
            priority: 'low',
            message: 'Category has no memories',
            action: 'Consider removing or reassigning category'
          });
        }
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Perform memory system diagnostics
   */
  async performDiagnostics(userId) {
    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        userId,
        status: 'healthy',
        issues: [],
        stats: {}
      };

      // Get basic stats
      const categoryStats = await this.dbManager.getCategoryStats(userId);
      const totalMemories = await this.dbManager.getUserMemoryCount(userId);

      diagnostics.stats = {
        totalMemories,
        totalCategories: categoryStats.length,
        totalTokens: categoryStats.reduce((sum, cat) => sum + cat.total_tokens, 0),
        avgRelevance: categoryStats.length > 0 
          ? categoryStats.reduce((sum, cat) => sum + parseFloat(cat.avg_relevance), 0) / categoryStats.length 
          : 0
      };

      // Check for issues
      if (diagnostics.stats.totalMemories === 0) {
        diagnostics.issues.push('No memories found for user');
        diagnostics.status = 'warning';
      }

      if (diagnostics.stats.avgRelevance < this.relevanceThresholds.low) {
        diagnostics.issues.push(`Low average relevance: ${diagnostics.stats.avgRelevance}`);
        diagnostics.status = 'warning';
      }

      const tokensPerMemory = diagnostics.stats.totalTokens / Math.max(diagnostics.stats.totalMemories, 1);
      if (tokensPerMemory < 5) {
        diagnostics.issues.push('Memories appear too short on average');
      }

      if (tokensPerMemory > 200) {
        diagnostics.issues.push('Memories appear too long on average');
      }

      // Check database health
      const dbHealth = await this.dbManager.healthCheck();
      if (dbHealth.status !== 'healthy') {
        diagnostics.issues.push(`Database health: ${dbHealth.status}`);
        diagnostics.status = 'error';
      }

      return diagnostics;
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        userId,
        status: 'error',
        issues: [`Diagnostics failed: ${error.message}`],
        stats: {}
      };
    }
  }

  /**
   * Cleanup and optimize memory storage
   */
  async optimizeMemoryStorage(userId, options = {}) {
    try {
      const results = {
        archived: 0,
        merged: 0,
        errors: 0,
        tokensFreed: 0
      };

      const stats = await this.dbManager.getCategoryStats(userId);
      
      for (const category of stats) {
        if (category.total_tokens > this.tokenLimits.categoryMax * 0.8) {
          console.log(`Optimizing category: ${category.category}`);
          
          const cleanup = await this.dbManager.cleanupCategory(
            userId, 
            category.category,
            this.tokenLimits.categoryMax
          );
          
          results.archived += cleanup.cleaned;
          results.tokensFreed += cleanup.tokensFreed;
        }
      }

      console.log(`Memory optimization complete:`, results);
      return results;
    } catch (error) {
      console.error('Error optimizing memory storage:', error);
      return { archived: 0, merged: 0, errors: 1, tokensFreed: 0 };
    }
  }

  /**
   * Get system-wide memory statistics
   */
  async getSystemStats() {
    try {
      const dbHealth = await this.dbManager.healthCheck();
      
      return {
        database: dbHealth,
        limits: this.tokenLimits,
        thresholds: this.relevanceThresholds,
        categories: {
          total: this.categories.length,
          predefined: 11,
          dynamic: 5
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return null;
    }
  }
}

export default MemoryCore;
