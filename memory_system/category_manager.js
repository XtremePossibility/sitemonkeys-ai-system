class CategoryManager {
    constructor(dbPool) {
        this.dbPool = dbPool;
        this.dynamicCategories = new Map();
        this.categoryOptimizationInterval = 24 * 60 * 60 * 1000; // 24 hours
    }

    async manageDynamicCategories(userId) {
        try {
            const userProfile = await this.getUserProfile(userId);
            const categoryUsage = await this.analyzeCategoryUsage(userId);
            const lifePhaseSuggestions = await this.detectLifePhaseChanges(userId, categoryUsage);
            
            if (lifePhaseSuggestions.shouldUpdate) {
                await this.updateDynamicCategories(userId, lifePhaseSuggestions.categories);
            }

            await this.optimizeCategoryPerformance(userId, categoryUsage);
            
        } catch (error) {
            memoryLogger.error(`Dynamic category management failed for ${userId}:`, error);
        }
    }

    async getUserProfile(userId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM user_memory_profiles WHERE user_id = $1',
                [userId]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async analyzeCategoryUsage(userId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    category_name,
                    COUNT(*) as entry_count,
                    SUM(token_count) as total_tokens,
                    AVG(usage_frequency) as avg_usage,
                    MAX(last_accessed) as last_used,
                    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_entries
                FROM memory_entries 
                WHERE user_id = $1 
                GROUP BY category_name
                ORDER BY recent_entries DESC, avg_usage DESC
            `, [userId]);
            
            return result.rows.reduce((acc, row) => {
                acc[row.category_name] = {
                    entryCount: parseInt(row.entry_count),
                    totalTokens: parseInt(row.total_tokens),
                    avgUsage: parseFloat(row.avg_usage),
                    lastUsed: row.last_used,
                    recentEntries: parseInt(row.recent_entries),
                    utilizationRatio: parseInt(row.total_tokens) / 50000 // vs max capacity
                };
                return acc;
            }, {});
        } finally {
            client.release();
        }
    }

    async detectLifePhaseChanges(userId, categoryUsage) {
        const signals = {
            healthCrisis: this.detectHealthCrisisPattern(categoryUsage),
            relationshipTransition: this.detectRelationshipTransition(categoryUsage),
            careerChange: this.detectCareerChange(categoryUsage),
            financialStress: this.detectFinancialStress(categoryUsage),
            majorProject: this.detectMajorProject(categoryUsage)
        };

        const activeSignals = Object.entries(signals).filter(([key, signal]) => signal.detected);
        
        if (activeSignals.length === 0) {
            return { shouldUpdate: false, categories: [] };
        }

        // Determine which dynamic categories to update
        const categoriesToUpdate = await this.prioritizeDynamicCategories(userId, activeSignals);
        
        return {
            shouldUpdate: categoriesToUpdate.length > 0,
            categories: categoriesToUpdate,
            signals: activeSignals
        };
    }

    detectHealthCrisisPattern(usage) {
        const healthUsage = usage.health_wellness;
        if (!healthUsage) return { detected: false };

        // High recent activity + high utilization = potential health crisis
        const isHighActivity = healthUsage.recentEntries > 5;
        const isHighUtilization = healthUsage.utilizationRatio > 0.7;
        const isFrequentAccess = healthUsage.avgUsage > 3;

        return {
            detected: isHighActivity && (isHighUtilization || isFrequentAccess),
            confidence: (healthUsage.recentEntries + healthUsage.avgUsage) / 10,
            suggestedFocus: 'health_crisis_management'
        };
    }

    detectRelationshipTransition(usage) {
        const relationshipUsage = usage.relationships_social;
        if (!relationshipUsage) return { detected: false };

        const isHighActivity = relationshipUsage.recentEntries > 3;
        const isFrequentAccess = relationshipUsage.avgUsage > 2;

        return {
            detected: isHighActivity && isFrequentAccess,
            confidence: relationshipUsage.recentEntries / 5,
            suggestedFocus: 'relationship_transition'
        };
    }

    detectCareerChange(usage) {
        const careerUsage = usage.business_career;
        if (!careerUsage) return { detected: false };

        const isHighActivity = careerUsage.recentEntries > 4;
        const isHighUtilization = careerUsage.utilizationRatio > 0.6;

        return {
            detected: isHighActivity && isHighUtilization,
            confidence: careerUsage.utilizationRatio,
            suggestedFocus: 'career_transition'
        };
    }

    detectFinancialStress(usage) {
        const financialUsage = usage.financial_management;
        if (!financialUsage) return { detected: false };

        const isHighActivity = financialUsage.recentEntries > 3;
        const isVeryFrequent = financialUsage.avgUsage > 4;

        return {
            detected: isHighActivity && isVeryFrequent,
            confidence: financialUsage.avgUsage / 5,
            suggestedFocus: 'financial_crisis_management'
        };
    }

    detectMajorProject(usage) {
        // Look for sudden spikes across multiple categories
        const totalRecentActivity = Object.values(usage).reduce((sum, cat) => sum + cat.recentEntries, 0);
        const avgActivity = totalRecentActivity / Object.keys(usage).length;

        return {
            detected: avgActivity > 2.5,
            confidence: Math.min(avgActivity / 5, 1),
            suggestedFocus: 'major_life_project'
        };
    }

    async prioritizeDynamicCategories(userId, activeSignals) {
        const client = await this.dbPool.connect();
        try {
            // Get current dynamic category assignments
            const currentDynamic = await client.query(`
                SELECT category_name, dynamic_focus 
                FROM memory_categories 
                WHERE user_id = $1 AND is_dynamic = true
            `, [userId]);

            const currentFoci = currentDynamic.rows.map(row => row.dynamic_focus).filter(Boolean);
            const newFoci = activeSignals.map(([key, signal]) => signal.suggestedFocus);
            
            // Determine which categories need updating
            const categoriesToUpdate = [];
            
            for (const [index, signal] of activeSignals.entries()) {
                if (!currentFoci.includes(signal[1].suggestedFocus)) {
                    categoriesToUpdate.push({
                        categoryName: `dynamic_category_${index + 1}`,
                        newFocus: signal[1].suggestedFocus,
                        confidence: signal[1].confidence,
                        reason: `Detected ${signal[0]} pattern`
                    });
                }
            }

            return categoriesToUpdate;
        } finally {
            client.release();
        }
    }

    async updateDynamicCategories(userId, categoriesToUpdate) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');

            for (const update of categoriesToUpdate) {
                // Archive old category content if exists
                await this.archiveDynamicCategory(userId, update.categoryName, client);
                
                // Update category focus
                await client.query(`
                    UPDATE memory_categories 
                    SET dynamic_focus = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = $2 AND category_name = $3
                `, [update.newFocus, userId, update.categoryName]);

                memoryLogger.log(`Updated ${update.categoryName} to focus on ${update.newFocus} for user ${userId}`);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async archiveDynamicCategory(userId, categoryName, client) {
        // Move existing memories to archive or low-priority status
        await client.query(`
            UPDATE memory_entries 
            SET relevance_score = relevance_score * 0.5,
                metadata = COALESCE(metadata, '{}')::jsonb || '{"archived": true, "archived_at": "' || NOW() || '"}'::jsonb
            WHERE user_id = $1 AND category_name = $2
        `, [userId, categoryName]);
    }

    async optimizeCategoryPerformance(userId, categoryUsage) {
        const client = await this.dbPool.connect();
        try {
            // Identify overfull categories
            const overfullCategories = Object.entries(categoryUsage)
                .filter(([name, usage]) => usage.utilizationRatio > 0.9)
                .map(([name]) => name);

            // Perform cleanup on overfull categories
            for (const categoryName of overfullCategories) {
                await this.cleanupOverfullCategory(userId, categoryName, client);
            }

            // Update user profile with optimization timestamp
            await client.query(`
                UPDATE user_memory_profiles 
                SET last_optimization = CURRENT_TIMESTAMP,
                    memory_patterns = COALESCE(memory_patterns, '{}')::jsonb || $1::jsonb
                WHERE user_id = $2
            `, [JSON.stringify(categoryUsage), userId]);

        } finally {
            client.release();
        }
    }

    async cleanupOverfullCategory(userId, categoryName, client) {
        // Strategy: Remove lowest-relevance, least-accessed memories
        await client.query(`
            DELETE FROM memory_entries 
            WHERE user_id = $1 AND category_name = $2
            AND id IN (
                SELECT id FROM memory_entries 
                WHERE user_id = $1 AND category_name = $2
                ORDER BY relevance_score ASC, usage_frequency ASC, last_accessed ASC
                LIMIT (
                    SELECT GREATEST(0, COUNT(*) - 300) 
                    FROM memory_entries 
                    WHERE user_id = $1 AND category_name = $2
                )
            )
        `, [userId, categoryName]);

        memoryLogger.log(`Cleaned up overfull category ${categoryName} for user ${userId}`);
    }

    async getCategoryHealth(userId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    mc.category_name,
                    mc.current_tokens,
                    mc.max_tokens,
                    mc.is_dynamic,
                    mc.dynamic_focus,
                    COUNT(me.id) as memory_count,
                    AVG(me.relevance_score) as avg_relevance
                FROM memory_categories mc
                LEFT JOIN memory_entries me ON mc.user_id = me.user_id 
                    AND mc.category_name = me.category_name
                WHERE mc.user_id = $1
                GROUP BY mc.category_name, mc.current_tokens, mc.max_tokens, 
                         mc.is_dynamic, mc.dynamic_focus
            `, [userId]);

            return result.rows.map(row => ({
                category: row.category_name,
                utilization: (row.current_tokens || 0) / row.max_tokens,
                memoryCount: parseInt(row.memory_count || 0),
                avgRelevance: parseFloat(row.avg_relevance || 0),
                isDynamic: row.is_dynamic,
                dynamicFocus: row.dynamic_focus,
                health: this.calculateCategoryHealth(row)
            }));
        } finally {
            client.release();
        }
    }

    calculateCategoryHealth(categoryData) {
        const utilization = (categoryData.current_tokens || 0) / categoryData.max_tokens;
        const avgRelevance = parseFloat(categoryData.avg_relevance || 0);
        const memoryCount = parseInt(categoryData.memory_count || 0);

        // Healthy category: moderate utilization, high relevance, active memories
        let health = 1.0;
        
        if (utilization > 0.95) health -= 0.3; // Overfull penalty
        if (utilization < 0.1) health -= 0.2;  // Underutilized penalty
        if (avgRelevance < 0.4) health -= 0.3; // Low relevance penalty
        if (memoryCount === 0) health = 0.1;   // Empty category

        return Math.max(0.1, Math.min(1.0, health));
    }
}

module.exports = CategoryManager;
