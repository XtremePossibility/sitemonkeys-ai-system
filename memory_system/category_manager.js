// memory_system/category_manager.js
// Category management system for Site Monkeys AI Memory System

import DatabaseManager from './database_manager.js';

class CategoryManager {
  constructor() {
    this.dbManager = DatabaseManager;
    this.predefinedCategories = [
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
      'Emergency & Contingency'
    ];
    
    this.dynamicCategories = [
      'Dynamic Category 1',
      'Dynamic Category 2',
      'Dynamic Category 3',
      'Dynamic Category 4',
      'Dynamic Category 5'
    ];

    this.subcategories = {
      'Health & Wellness': ['Physical Health', 'Mental Health', 'Nutrition', 'Exercise', 'Medical'],
      'Relationships & Social': ['Family', 'Friends', 'Romantic', 'Professional', 'Social Events'],
      'Business & Career': ['Work Projects', 'Skills', 'Networking', 'Goals', 'Performance'],
      'Financial Management': ['Budget', 'Investments', 'Expenses', 'Income', 'Planning'],
      'Personal Development': ['Learning', 'Habits', 'Goals', 'Reflection', 'Growth'],
      'Home & Lifestyle': ['Home Improvement', 'Maintenance', 'Organization', 'Purchases', 'Living'],
      'Technology & Tools': ['Software', 'Hardware', 'Productivity', 'Learning', 'Issues'],
      'Legal & Administrative': ['Documents', 'Contracts', 'Compliance', 'Procedures', 'Legal'],
      'Travel & Experiences': ['Trips', 'Places', 'Culture', 'Food', 'Adventures'],
      'Creative Projects': ['Art', 'Writing', 'Music', 'Design', 'Crafts'],
      'Emergency & Contingency': ['Planning', 'Contacts', 'Procedures', 'Resources', 'Backup']
    };

    this.categoryKeywords = this.buildCategoryKeywords();
    this.dynamicCategoryAssignments = new Map();
  }

  async initialize() {
    console.log('Initializing Category Manager...');
    
    try {
      // Create any necessary category-specific database structures
      await this.ensureCategoryStructures();
      
      // Load dynamic category assignments
      await this.loadDynamicCategoryAssignments();
      
      console.log('✅ Category Manager initialized');
      return true;
    } catch (error) {
      console.error('❌ Category Manager initialization failed:', error);
      return false;
    }
  }

  /**
   * Get all available categories (predefined + dynamic)
   */
  getAllCategories() {
    return [...this.predefinedCategories, ...this.dynamicCategories];
  }

  /**
   * Get predefined categories only
   */
  getPredefinedCategories() {
    return [...this.predefinedCategories];
  }

  /**
   * Get dynamic categories only
   */
  getDynamicCategories() {
    return [...this.dynamicCategories];
  }

  /**
   * Get subcategories for a given category
   */
  getSubcategories(category) {
    // Handle dynamic categories
    if (this.dynamicCategories.includes(category)) {
      const assignment = this.dynamicCategoryAssignments.get(category);
      return assignment?.subcategories || ['General', 'Specific', 'Details', 'Context', 'Related'];
    }

    return this.subcategories[category] || ['General'];
  }

  /**
   * Determine the best category for content
   */
  categorizeContent(content, context = null) {
    try {
      const contentLower = content.toLowerCase();
      const scores = new Map();

      // Score predefined categories
      for (const category of this.predefinedCategories) {
        const score = this.calculateCategoryScore(contentLower, category);
        if (score > 0) {
          scores.set(category, score);
        }
      }

      // Score dynamic categories if they have assignments
      for (const [dynamicCategory, assignment] of this.dynamicCategoryAssignments.entries()) {
        const score = this.calculateDynamicCategoryScore(contentLower, assignment);
        if (score > 0) {
          scores.set(dynamicCategory, score);
        }
      }

      // If no good matches, check if we should assign a dynamic category
      if (scores.size === 0 || Math.max(...scores.values()) < 0.3) {
        const dynamicAssignment = this.considerDynamicCategoryAssignment(content, context);
        if (dynamicAssignment) {
          return {
            category: dynamicAssignment.category,
            subcategory: dynamicAssignment.subcategory,
            confidence: 0.8,
            isDynamic: true
          };
        }
      }

      // Return best match
      if (scores.size > 0) {
        const bestCategory = Array.from(scores.entries())
          .sort((a, b) => b[1] - a[1])[0];

        const subcategory = this.selectSubcategory(bestCategory[0], contentLower);
        
        return {
          category: bestCategory[0],
          subcategory: subcategory,
          confidence: Math.min(bestCategory[1], 1.0),
          isDynamic: this.dynamicCategories.includes(bestCategory[0])
        };
      }

      // Fallback to Personal Development
      return {
        category: 'Personal Development',
        subcategory: 'General',
        confidence: 0.3,
        isDynamic: false
      };
    } catch (error) {
      console.error('Error categorizing content:', error);
      return {
        category: 'Personal Development',
        subcategory: 'General',
        confidence: 0.1,
        isDynamic: false
      };
    }
  }

  /**
   * Calculate category score based on keywords
   */
  calculateCategoryScore(contentLower, category) {
    const keywords = this.categoryKeywords[category] || [];
    let score = 0;
    let matches = 0;

    for (const keyword of keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        score += keyword.length > 5 ? 0.2 : 0.1; // Longer keywords get higher scores
        matches++;
      }
    }

    // Normalize by keyword density
    const wordCount = contentLower.split(' ').length;
    const density = matches / Math.max(wordCount, 1);
    
    return score * (1 + density);
  }

  /**
   * Calculate score for dynamic categories
   */
  calculateDynamicCategoryScore(contentLower, assignment) {
    if (!assignment || !assignment.keywords) return 0;

    let score = 0;
    for (const keyword of assignment.keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        score += 0.15;
      }
    }

    return score;
  }

  /**
   * Consider assigning content to a dynamic category
   */
  considerDynamicCategoryAssignment(content, context) {
    // Extract potential keywords/themes from content
    const keywords = this.extractPotentialKeywords(content);
    if (keywords.length < 2) return null;

    // Find an unused dynamic category
    const unusedCategory = this.findUnusedDynamicCategory();
    if (!unusedCategory) return null;

    // Create assignment
    const assignment = {
      focus: this.inferFocusArea(content, keywords),
      keywords: keywords,
      subcategories: this.generateDynamicSubcategories(keywords),
      createdAt: new Date().toISOString(),
      examples: [content.substring(0, 200)]
    };

    this.dynamicCategoryAssignments.set(unusedCategory, assignment);
    this.saveDynamicCategoryAssignments();

    console.log(`📂 Assigned dynamic category: ${unusedCategory} -> ${assignment.focus}`);

    return {
      category: unusedCategory,
      subcategory: assignment.subcategories[0],
      assignment: assignment
    };
  }

  /**
   * Select appropriate subcategory
   */
  selectSubcategory(category, contentLower) {
    const subcats = this.getSubcategories(category);
    const subcategoryKeywords = this.buildSubcategoryKeywords(category);

    let bestSubcat = subcats[0]; // Default
    let bestScore = 0;

    for (const subcat of subcats) {
      const keywords = subcategoryKeywords[subcat] || [];
      let score = 0;

      for (const keyword of keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          score += 0.1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestSubcat = subcat;
      }
    }

    return bestSubcat;
  }

  /**
   * Get category statistics for user
   */
  async getCategoryUsageStats(userId) {
    try {
      const stats = await this.dbManager.getCategoryStats(userId);
      
      const predefinedStats = stats.filter(s => this.predefinedCategories.includes(s.category));
      const dynamicStats = stats.filter(s => this.dynamicCategories.includes(s.category));

      return {
        total: stats.length,
        predefined: {
          count: predefinedStats.length,
          totalMemories: predefinedStats.reduce((sum, s) => sum + s.total_memories, 0),
          totalTokens: predefinedStats.reduce((sum, s) => sum + s.total_tokens, 0),
          categories: predefinedStats
        },
        dynamic: {
          count: dynamicStats.length,
          totalMemories: dynamicStats.reduce((sum, s) => sum + s.total_memories, 0),
          totalTokens: dynamicStats.reduce((sum, s) => sum + s.total_tokens, 0),
          categories: dynamicStats.map(s => ({
            ...s,
            assignment: this.dynamicCategoryAssignments.get(s.category)
          }))
        },
        mostUsed: stats.sort((a, b) => b.total_memories - a.total_memories).slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting category usage stats:', error);
      return null;
    }
  }

  /**
   * Optimize category usage by consolidating or archiving
   */
  async optimizeCategories(userId) {
    try {
      const stats = await this.getCategoryUsageStats(userId);
      const optimizations = [];

      // Check for underused categories
      for (const category of stats.dynamic.categories) {
        if (category.total_memories < 3 && this.isOlderThan(category.last_updated, 30)) {
          // Consider consolidating into a predefined category
          const suggestion = await this.suggestConsolidation(userId, category.category);
          if (suggestion) {
            optimizations.push({
              type: 'consolidate',
              from: category.category,
              to: suggestion.category,
              reason: 'Underused dynamic category',
              memoriesAffected: category.total_memories
            });
          }
        }
      }

      // Check for categories approaching token limits
      for (const category of stats.predefined.categories.concat(stats.dynamic.categories)) {
        if (category.total_tokens > 45000) {
          optimizations.push({
            type: 'cleanup',
            category: category.category,
            reason: 'Approaching token limit',
            currentTokens: category.total_tokens
          });
        }
      }

      return optimizations;
    } catch (error) {
      console.error('Error optimizing categories:', error);
      return [];
    }
  }

  /**
   * Suggest consolidation target for underused dynamic category
   */
  async suggestConsolidation(userId, dynamicCategory) {
    try {
      const memories = await this.dbManager.getMemoriesByCategory(userId, dynamicCategory, 10);
      if (memories.length === 0) return null;

      // Analyze memories to find best predefined category match
      const categoryScores = new Map();

      for (const memory of memories) {
        for (const category of this.predefinedCategories) {
          const score = this.calculateCategoryScore(memory.content.toLowerCase(), category);
          categoryScores.set(category, (categoryScores.get(category) || 0) + score);
        }
      }

      if (categoryScores.size === 0) return null;

      const bestMatch = Array.from(categoryScores.entries())
        .sort((a, b) => b[1] - a[1])[0];

      return bestMatch[1] > 0.5 ? { category: bestMatch[0], confidence: bestMatch[1] } : null;
    } catch (error) {
      console.error('Error suggesting consolidation:', error);
      return null;
    }
  }

  /**
   * Archive or consolidate memories from one category to another
   */
  async consolidateCategory(userId, fromCategory, toCategory) {
    try {
      console.log(`🔄 Consolidating ${fromCategory} -> ${toCategory} for user ${userId}`);
      
      const memories = await this.dbManager.getMemoriesByCategory(userId, fromCategory, 100);
      let consolidated = 0;
      let errors = 0;

      for (const memory of memories) {
        try {
          // Archive old memory and create new one in target category
          await this.dbManager.deleteMemory(userId, memory.id);
          
          const newMemory = {
            userId,
            content: memory.content,
            category: toCategory,
            subcategory: this.selectSubcategory(toCategory, memory.content.toLowerCase()),
            relevanceScore: memory.relevanceScore,
            tokenCount: memory.tokenCount,
            emotionalWeight: memory.emotionalWeight || 0,
            isQuestion: memory.isQuestion || false,
            userPriority: false,
            metadata: {
              ...memory.metadata,
              consolidatedFrom: fromCategory,
              consolidatedAt: new Date().toISOString()
            }
          };

          const result = await this.dbManager.storeMemory(newMemory);
          if (result.success) {
            consolidated++;
          } else {
            errors++;
          }
        } catch (error) {
          console.error('Error consolidating memory:', error);
          errors++;
        }
      }

      // Clear dynamic category assignment if consolidating from dynamic category
      if (this.dynamicCategories.includes(fromCategory)) {
        this.dynamicCategoryAssignments.delete(fromCategory);
        await this.saveDynamicCategoryAssignments();
      }

      console.log(`✅ Consolidated ${consolidated} memories, ${errors} errors`);
      return { consolidated, errors };
    } catch (error) {
      console.error('Error consolidating category:', error);
      return { consolidated: 0, errors: 1 };
    }
  }

  // Helper methods

  buildCategoryKeywords() {
    return {
      'Health & Wellness': ['health', 'doctor', 'medical', 'exercise', 'diet', 'nutrition', 'wellness', 'fitness', 'mental health', 'therapy', 'medication', 'symptom', 'treatment'],
      'Relationships & Social': ['family', 'friend', 'relationship', 'dating', 'marriage', 'social', 'party', 'wedding', 'anniversary', 'conflict', 'communication'],
      'Business & Career': ['work', 'job', 'career', 'business', 'project', 'meeting', 'client', 'colleague', 'boss', 'interview', 'promotion', 'salary'],
      'Financial Management': ['money', 'budget', 'investment', 'expense', 'income', 'savings', 'debt', 'loan', 'credit', 'financial', 'bank', 'cost'],
      'Personal Development': ['learn', 'goal', 'habit', 'growth', 'skill', 'improvement', 'development', 'education', 'course', 'book', 'reflection'],
      'Home & Lifestyle': ['home', 'house', 'apartment', 'furniture', 'decoration', 'cleaning', 'maintenance', 'garden', 'neighborhood', 'utilities'],
      'Technology & Tools': ['computer', 'software', 'app', 'technology', 'internet', 'phone', 'device', 'tool', 'system', 'update', 'bug'],
      'Legal & Administrative': ['legal', 'contract', 'document', 'paperwork', 'insurance', 'tax', 'government', 'official', 'procedure', 'compliance'],
      'Travel & Experiences': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'restaurant', 'experience', 'adventure', 'culture', 'foreign'],
      'Creative Projects': ['art', 'creative', 'project', 'design', 'music', 'writing', 'craft', 'hobby', 'inspiration', 'artistic'],
      'Emergency & Contingency': ['emergency', 'backup', 'contingency', 'disaster', 'preparation', 'plan', 'urgent', 'crisis', 'important contact']
    };
  }

  buildSubcategoryKeywords(category) {
    const keywords = {
      'Health & Wellness': {
        'Physical Health': ['doctor', 'medical', 'physical', 'body', 'pain', 'illness'],
        'Mental Health': ['mental', 'therapy', 'anxiety', 'depression', 'stress', 'mood'],
        'Nutrition': ['food', 'diet', 'nutrition', 'eating', 'meal', 'vitamin'],
        'Exercise': ['exercise', 'gym', 'workout', 'fitness', 'sport', 'activity'],
        'Medical': ['medication', 'treatment', 'hospital', 'appointment', 'prescription']
      }
      // Add more subcategory keywords as needed
    };

    return keywords[category] || {};
  }

  extractPotentialKeywords(content) {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && word.length < 20);

    // Remove common stop words
    const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'than', 'like', 'more']);
    
    return words
      .filter(word => !stopWords.has(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
  }

  inferFocusArea(content, keywords) {
    // Simple focus area inference based on most frequent meaningful keywords
    const topKeywords = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    return topKeywords.join(' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  generateDynamicSubcategories(keywords) {
    const keywordList = Object.keys(keywords).slice(0, 5);
    if (keywordList.length < 2) {
      return ['General', 'Specific', 'Details', 'Context', 'Related'];
    }

    return [
      keywordList[0].charAt(0).toUpperCase() + keywordList[0].slice(1),
      keywordList[1]?.charAt(0).toUpperCase() + keywordList[1]?.slice(1) || 'Secondary',
      'Details',
      'Context',
      'Related'
    ];
  }

  findUnusedDynamicCategory() {
    for (const category of this.dynamicCategories) {
      if (!this.dynamicCategoryAssignments.has(category)) {
        return category;
      }
    }
    return null;
  }

  isOlderThan(timestamp, days) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays > days;
  }

  async ensureCategoryStructures() {
    // Placeholder for any category-specific database structures
    return true;
  }

  async loadDynamicCategoryAssignments() {
    // In production, this would load from database
    // For now, using in-memory storage
    return true;
  }

  async saveDynamicCategoryAssignments() {
    // In production, this would save to database
    // For now, just log the assignments
    console.log('Dynamic category assignments saved:', Array.from(this.dynamicCategoryAssignments.keys()));
    return true;
  }
}

export default CategoryManager;
