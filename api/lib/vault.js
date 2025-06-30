export const VAULT_TRIGGERS = {
  pricing: ['price', 'pricing', 'cost', 'revenue'],
  features: ['feature', 'development', 'roadmap', 'build'],
  hiring: ['hire', 'hiring', 'staff', 'team']
};

export async function verifyVaultAccess(mode, vault_loaded) {
  if (mode !== 'site_monkeys') {
    return { 
      allowed: false, 
      context: '',
      reason: 'Vault restricted to Site Monkeys mode'
    };
  }
  
  return { 
    allowed: true, 
    context: 'Built-in Site Monkeys logic active',
    reason: 'Site Monkeys mode verified'
  };
}

export function checkVaultTriggers(message) {
  const messageLC = message.toLowerCase();
  const triggered = [];
  
  for (const [framework, keywords] of Object.entries(VAULT_TRIGGERS)) {
    if (keywords.some(keyword => messageLC.includes(keyword))) {
      triggered.push(framework);
    }
  }
  
  return triggered;
}

export function generateVaultContext(triggeredFrameworks) {
  if (triggeredFrameworks.length === 0) return '';

  let context = '\nSITE MONKEYS LOGIC:\n';
  
  if (triggeredFrameworks.includes('pricing')) {
    context += 'PRICING: Boost ($697), Climb ($1,497), Lead ($2,997). Never compete on price.\n';
  }
  
  if (triggeredFrameworks.includes('features')) {
    context += 'FEATURES: Revenue impact > Development cost > Market validation.\n';
  }
  
  return context;
}
