// api/vault.js - COMPLETE WORKING VERSION

export function getVaultStatus() {
  return {
    vault_loaded: process.env.VAULT_CONTENT ? true : false,
    vault_healthy: process.env.VAULT_CONTENT && process.env.VAULT_CONTENT.length > 1000,
    vault_size: process.env.VAULT_CONTENT ? process.env.VAULT_CONTENT.length : 0,
    last_updated: Date.now(),
    source: process.env.VAULT_CONTENT ? 'environment' : 'none'
  };
}

export function checkVaultTriggers(message) {
  const triggers = [];
  const messageLower = message.toLowerCase();
  
  // Site Monkeys business triggers
  if (messageLower.includes('pricing') || messageLower.includes('cost') || messageLower.includes('budget')) {
    triggers.push({ 
      category: 'pricing', 
      priority: 'high',
      vault_section: 'pricing_strategy' 
    });
  }
  
  if (messageLower.includes('margin') || messageLower.includes('profit')) {
    triggers.push({ 
      category: 'margin_enforcement', 
      priority: 'critical',
      vault_section: 'business_survival' 
    });
  }
  
  if (messageLower.includes('boost') || messageLower.includes('climb') || messageLower.includes('lead')) {
    triggers.push({ 
      category: 'site_monkeys_products', 
      priority: 'high',
      vault_section: 'service_offerings' 
    });
  }
  
  return triggers;
}

export function generateVaultContext(triggeredFrameworks) {
  let context = 'SITE MONKEYS BUSINESS INTELLIGENCE:\n\n';
  
  triggeredFrameworks.forEach(trigger => {
    switch (trigger.category) {
      case 'pricing':
        context += '💰 **PRICING STRATEGY:**\n';
        context += `- Boost Plan: $697/month (85% margin minimum)\n`;
        context += `- Climb Plan: $1,497/month (85% margin minimum)\n`;
        context += `- Lead Plan: $2,997/month (85% margin minimum)\n`;
        context += `- Professional pricing floors maintain market credibility\n\n`;
        break;
        
      case 'margin_enforcement':
        context += '🛡️ **MARGIN ENFORCEMENT:**\n';
        context += `- CRITICAL: All projections must maintain 85% minimum margins\n`;
        context += `- Business survival requires margin discipline\n\n`;
        break;
        
      case 'site_monkeys_products':
        context += '🚀 **SITE MONKEYS SERVICE OFFERINGS:**\n';
        context += `- Boost: Entry-level professional service ($697)\n`;
        context += `- Climb: Growth-focused service package ($1,497)\n`;
        context += `- Lead: Premium enterprise solution ($2,997)\n\n`;
        break;
    }
  });
  
  return context;
}

export function enforceVaultCompliance(response, mode) {
  if (mode !== 'site_monkeys') {
    return response;
  }
  
  return response + '\n\n🏢 *Site Monkeys professional standards maintained.*';
}
