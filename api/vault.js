// ADD TO: api/lib/vault.js (or create this file)

export function getVaultStatus() {
  return {
    vault_loaded: process.env.VAULT_CONTENT ? true : false,
    vault_healthy: process.env.VAULT_CONTENT && process.env.VAULT_CONTENT.length > 1000,
    vault_size: process.env.VAULT_CONTENT ? process.env.VAULT_CONTENT.length : 0,
    last_updated: Date.now()
  };
}

export function checkVaultTriggers(message) {
  const triggers = [];
  const messageLower = message.toLowerCase();
  
  // Site Monkeys business triggers
  if (messageLower.includes('pricing') || messageLower.includes('cost') || messageLower.includes('budget')) {
    triggers.push({ category: 'pricing', priority: 'high' });
  }
  
  if (messageLower.includes('margin') || messageLower.includes('profit')) {
    triggers.push({ category: 'margin_enforcement', priority: 'critical' });
  }
  
  if (messageLower.includes('boost') || messageLower.includes('climb') || messageLower.includes('lead')) {
    triggers.push({ category: 'site_monkeys_products', priority: 'high' });
  }
  
  return triggers;
}

export function generateVaultContext(triggeredFrameworks) {
  let context = 'SITE MONKEYS BUSINESS INTELLIGENCE:\n';
  
  triggeredFrameworks.forEach(trigger => {
    switch (trigger.category) {
      case 'pricing':
        context += `- Boost Plan: $697/month (85% margin minimum)\n`;
        context += `- Climb Plan: $1,497/month (85% margin minimum)\n`;
        context += `- Lead Plan: $2,997/month (85% margin minimum)\n`;
        break;
      case 'margin_enforcement':
        context += `- CRITICAL: All projections must maintain 85% minimum margins\n`;
        context += `- Business survival requires margin discipline\n`;
        break;
      case 'site_monkeys_products':
        context += `- Professional service standards maintained\n`;
        context += `- Quality-first approach with premium positioning\n`;
        break;
    }
  });
  
  return context;
}

export function enforceVaultCompliance(response, mode) {
  if (mode !== 'site_monkeys') return response;
  
  // Add Site Monkeys compliance signature
  return response + '\n\n🏢 Site Monkeys professional standards maintained.';
}
