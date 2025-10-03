// /api/core/personalities/personality_selector.js
// PERSONALITY SELECTOR - Chooses between Eli and Roxy based on analysis
// Uses scoring system to determine optimal personality for each request

export class PersonalitySelector {
  constructor() {
    this.logger = {
      log: (msg) => console.log(`[SELECTOR] ${msg}`),
      error: (msg, err) => console.error(`[SELECTOR ERROR] ${msg}`, err)
    };
  }

  selectPersonality(analysis, mode, context) {
    try {
      this.logger.log('Selecting personality based on analysis...');
      
      let score = {
        eli: 0,
        roxy: 0
      };
      
      // Domain-based selection
      if (analysis.domain === 'business' || analysis.domain === 'technical') {
        score.eli += 3;
      } else if (analysis.domain === 'personal' || analysis.domain === 'creative') {
        score.roxy += 3;
      }
      
      // Intent-based selection
      if (analysis.intent === 'problem_solving' || analysis.intent === 'decision_making') {
        if (analysis.complexity > 0.7) {
          score.eli += 2; // Complex problems need analytical approach
        } else {
          score.roxy += 2; // Simpler problems benefit from solution-focused
        }
      }
      
      // Emotional context
      if (analysis.emotionalWeight > 0.6) {
        score.roxy += 2;
      }
      
      // Mode preference
      if (mode === 'business_validation' || mode === 'site_monkeys') {
        score.eli += 2;
      }
      
      // Complexity consideration
      if (analysis.complexity > 0.8) {
        score.eli += 1; // Very complex = need protective analysis
      }
      
      const selected = score.eli > score.roxy ? 'eli' : 'roxy';
      
      this.logger.log(`Selected ${selected} (Eli: ${score.eli}, Roxy: ${score.roxy})`);
      
      return {
        personality: selected,
        confidence: Math.abs(score.eli - score.roxy) / 10,
        reasoning: this.#explainSelection(selected, analysis, mode, score)
      };
      
    } catch (error) {
      this.logger.error('Personality selection failed', error);
      return {
        personality: 'roxy', // Default to Roxy
        confidence: 0.5,
        reasoning: 'Fallback selection'
      };
    }
  }

  #explainSelection(selected, analysis, mode, score) {
    const reasons = [];
    
    if (analysis.domain === 'business' && selected === 'eli') {
      reasons.push('Business domain benefits from analytical framework');
    }
    
    if (analysis.emotionalWeight > 0.6 && selected === 'roxy') {
      reasons.push('Emotional context requires empathetic approach');
    }
    
    if (mode === 'business_validation' && selected === 'eli') {
      reasons.push('Business validation mode prioritizes risk analysis');
    }
    
    if (analysis.complexity > 0.8 && selected === 'eli') {
      reasons.push('High complexity requires protective intelligence');
    }
    
    if (analysis.domain === 'personal' && selected === 'roxy') {
      reasons.push('Personal domain benefits from supportive approach');
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Score-based selection';
  }
}

export { PersonalitySelector };
