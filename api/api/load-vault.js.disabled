import { loadVaultMemory } from '../utils/memoryLoader.js';

export default async function handler(req, res) {
  try {
    const memory = await loadVaultMemory();
    
    // Estimate token usage and cost
    const tokenEstimate = Math.round(memory.length / 4.2);
    const estimatedCost = (tokenEstimate * 0.002 / 1000).toFixed(4);
    
    res.status(200).json({
      status: 'Loaded',
      tokens: tokenEstimate,
      estimatedCost: `$${estimatedCost}`,
      folders_loaded: ['VAULT_MEMORY_FILES'],
      vault_content: memory
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to load vault.'
    });
  }
}
