class RoutingIntelligence {
    constructor() {
        this.categoryPatterns = this.initializeCategoryPatterns();
    }

    initializeCategoryPatterns() {
        return {
            mental_emotional: {
                keywords: ['stressed', 'anxious', 'feel', 'emotion', 'think', 'believe', 'confidence', 'self'],
                patterns: [/i feel/i, /i think/i, /i believe/i, /stressed about/i, /anxious/i]
            },
            health_wellbeing: {
                keywords: ['health', 'doctor', 'medication', 'pain', 'exercise', 'diet', 'sleep', 'energy'],
                patterns: [/health/i, /medical/i, /doctor/i, /pain/i, /exercise/i, /sleep/i]
            },
            relationships_social: {
                keywords: ['family', 'friend', 'relationship', 'spouse', 'partner', 'conflict', 'social'],
                patterns: [/my wife/i, /my husband/i, /my family/i, /friend/i, /relationship/i]
            },
            work_career: {
                keywords: ['work', 'job', 'career', 'boss', 'colleague', 'promotion', 'office', 'professional'],
                patterns: [/at work/i, /my job/i, /my boss/i, /career/i, /promotion/i]
            },
            money_income_debt: {
                keywords: ['salary', 'income', 'debt', 'loan', 'credit', 'broke', 'paycheck'],
                patterns: [/debt/i, /loan/i, /credit card/i, /income/i, /salary/i, /broke/i]
            },
            money_spending_goals: {
                keywords: ['budget', 'spending', 'save', 'savings', 'purchase', 'buy', 'financial goal'],
                patterns: [/budget/i, /spending/i, /save money/i, /financial goal/i, /want to buy/i]
            },
            goals_active_current: {
                keywords: ['goal', 'plan', 'project', 'deadline', 'working on', 'trying to'],
                patterns: [/my goal/i, /working on/i, /trying to/i, /this week/i, /current project/i]
            },
            goals_future_dreams: {
                keywords: ['dream', 'someday', 'future', 'vision', 'hope', 'long term'],
                patterns: [/someday/i, /in the future/i, /my dream/i, /long term/i, /vision/i]
            },
            tools_tech_workflow: {
                keywords: ['app', 'software', 'tool', 'system', 'technology', 'automation', 'platform'],
                patterns: [/app/i, /software/i, /system/i, /technology/i, /platform/i]
            },
            daily_routines_habits: {
                keywords: ['routine', 'habit', 'daily', 'morning', 'evening', 'schedule', 'consistency'],
                patterns: [/routine/i, /habit/i, /every day/i, /morning/i, /evening/i, /schedule/i]
            },
            personal_life_interests: {
                keywords: ['hobby', 'interest', 'fun', 'enjoy', 'passion', 'creative', 'home'],
                patterns: [/hobby/i, /interest/i, /enjoy/i, /passion/i, /creative/i, /at home/i]
            }
        };
    }

    async routeContent(content, metadata = {}) {
        const scores = {};
        
        // Score each category based on content match
        for (const [category, patterns] of Object.entries(this.categoryPatterns)) {
            scores[category] = this.calculateCategoryScore(content, patterns);
        }

        // Get highest scoring category
        const primaryCategory = this.getPrimaryCategory(scores);
        const subcategory = this.selectSubcategory(primaryCategory, content);

        // Check for cross-category scenarios
        const crossCategories = this.detectCrossCategoryScenarios(scores);

        return {
            category: primaryCategory,
            subcategory: subcategory,
            confidence: scores[primaryCategory],
            alternativeCategories: crossCategories,
            routingStrategy: crossCategories.length > 0 ? 'multi_category' : 'single_category'
        };
    }

    calculateCategoryScore(content, patterns) {
        let score = 0;
        const contentLower = content.toLowerCase();

        // Keyword matching
        patterns.keywords.forEach(keyword => {
            if (contentLower.includes(keyword)) {
                score += 10;
            }
        });

        // Pattern matching
        patterns.patterns.forEach(pattern => {
            if (pattern.test(content)) {
                score += 15;
            }
        });

        return score;
    }

    getPrimaryCategory(scores) {
        return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    }

    selectSubcategory(category, content) {
        // Map categories to their subcategories and select most relevant
        const subcategoryMaps = {
            mental_emotional: ['self_talk_patterns', 'emotional_triggers', 'coping_mechanisms', 'psychological_progress', 'identity_statements'],
            health_wellbeing: ['symptom_patterns', 'nutrition_logs', 'fitness_activity', 'sleep_energy', 'medical_flags'],
            relationships_social: ['family_context', 'friendship_loops', 'conflict_history', 'support_sources', 'boundaries_enforced'],
            work_career: ['job_roles_tasks', 'manager_team_dynamics', 'career_doubts', 'advancement_goals', 'performance_validation'],
            money_income_debt: ['income_sources', 'income_stability', 'debt_issues', 'financial_crises', 'money_pressure_statements'],
            money_spending_goals: ['spending_behavior', 'savings_goals', 'budgeting_attempts', 'financial_slipups', 'wealth_mindset'],
            goals_active_current: ['current_objectives', 'week_priorities', 'blocked_tasks', 'urgent_goals', 'goal_reframes'],
            goals_future_dreams: ['life_dreams', 'career_ambitions', 'bucket_list', 'deferred_goals', 'vision_quotes'],
            tools_tech_workflow: ['work_tech_stack', 'life_automation', 'tool_conflicts', 'system_resets', 'experiment_logs'],
            daily_routines_habits: ['morning_evening_patterns', 'habit_tracking', 'habit_drift', 'time_sinks', 'consistency_milestones'],
            personal_life_interests: ['home_environment', 'passions_hobbies', 'media_preferences', 'creative_expression', 'joy_rituals']
        };

        const subcategories = subcategoryMaps[category] || ['general'];
        
        // Simple subcategory selection - could be enhanced with more intelligence
        return subcategories[0]; // Default to first subcategory for now
    }

    detectCrossCategoryScenarios(scores) {
        // Return categories with scores above threshold for multi-category scenarios
        const threshold = 20;
        return Object.entries(scores)
            .filter(([category, score]) => score >= threshold)
            .sort((a, b) => b[1] - a[1])
            .slice(1, 3) // Get top 2 alternative categories
            .map(([category, score]) => ({ category, score }));
    }

    async selectRetrievalCategories(query) {
        // Determine which categories to search for retrieval
        const scores = {};
        
        for (const [category, patterns] of Object.entries(this.categoryPatterns)) {
            scores[category] = this.calculateCategoryScore(query, patterns);
        }

        // Return top scoring categories for search
        return Object.entries(scores)
            .filter(([category, score]) => score >= 10)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3) // Search top 3 relevant categories
            .map(([category, score]) => ({ 
                category, 
                score, 
                priority: score >= 30 ? 'high' : score >= 20 ? 'medium' : 'low' 
            }));
    }
}
