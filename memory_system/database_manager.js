// api/chat.js - Integration example with Site Monkeys Memory System
// This demonstrates how to integrate the complete memory system

import MemoryBootstrap from '../memory_bootstrap.js';
import VaultLoader from '../memory_system/vault_loader.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userId, mode = 'truth_general', sessionId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' });
    }

    // Initialize memory system if needed
    const initResult = await MemoryBootstrap.initialize();
    console.log(`Memory system status: ${initResult.mode}`);

    // Build context based on mode
    let memoryContext = '';
    let vaultContext = '';

    // 1. Get relevant memory context (always available)
    const relevantMemories = await MemoryBootstrap.getRelevantContext(
      userId,
      message,
      2400, // Token limit
      { 
        currentMode: mode,
        sessionId 
      }
    );

    if (relevantMemories.length > 0) {
      memoryContext = MemoryBootstrap.formatForAI(relevantMemories, {
        includeMetadata: true,
        maxLength: 2400
      });
      console.log(`Retrieved ${relevantMemories.length} relevant memories`);
    }

    // 2. Load vault context if in Site Monkeys mode
    if (mode === 'site_monkeys') {
      vaultContext = await MemoryBootstrap.loadVaultMemory(mode);
      if (vaultContext) {
        console.log('Vault context loaded for Site Monkeys mode');
      }
    }

    // 3. Build complete system prompt with context
    const systemPrompt = buildSystemPrompt(mode, memoryContext, vaultContext);

    // 4. Process the AI response (this would call your AI provider)
    const aiResponse = await processAIRequest({
      systemPrompt,
      userMessage: message,
      mode
    });

    // 5. Store the conversation in memory
    await storeConversationMemory(userId, message, aiResponse, sessionId);

    // 6. Return response with memory stats
    const memoryStats = await MemoryBootstrap.getMemoryStats(userId);
    
    return res.status(200).json({
      response: aiResponse,
      mode,
      memory: {
        retrievedMemories: relevantMemories.length,
        totalMemories: memoryStats.totalMemories,
        totalTokens: memoryStats.totalTokens,
        systemStatus: initResult.mode
      },
      sessionId
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Build system prompt based on mode and available context
 */
function buildSystemPrompt(mode, memoryContext, vaultContext) {
  let basePrompt = '';

  switch (mode) {
    case 'truth_general':
      basePrompt = `You are a truth-focused AI assistant. Provide accurate, evidence-based responses while acknowledging uncertainty when appropriate. Prioritize factual accuracy over helpfulness.`;
      break;
    
    case 'business_validation':
      basePrompt = `You are a business-focused AI assistant. Analyze decisions through the lens of profitability, risk, and execution feasibility. Always include survival impact and financial implications.`;
      break;
    
    case 'site_monkeys':
      basePrompt = `You are part of the Site Monkeys AI system. Use both your general knowledge and the specific Site Monkeys context to provide expert guidance. Maintain the system's truth-first philosophy while leveraging proprietary insights.`;
      break;
    
    default:
      basePrompt = `You are a helpful AI assistant.`;
  }

  // Add memory context
  if (memoryContext) {
    basePrompt += `\n\n${memoryContext}`;
  }

  // Add vault context for Site Monkeys mode
  if (vaultContext && mode === 'site_monkeys') {
    basePrompt += `\n\nSITE MONKEYS CONTEXT:\n${vaultContext}\n`;
  }

  basePrompt += `\n\nRemember to reference relevant context when helpful, but don't mention the memory system directly to the user.`;

  return basePrompt;
}

/**
 * Process AI request with your preferred provider
 */
async function processAIRequest({ systemPrompt, userMessage, mode }) {
  // This is where you'd integrate with OpenAI, Anthropic, or other AI providers
  // For example:
  
  try {
    // Example OpenAI integration
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: mode === 'truth_general' ? 0.3 : 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not process that request.';
    }

    // Fallback response if no AI provider is configured
    return `I received your message: "${userMessage}". However, no AI provider is currently configured. This is the Site Monkeys memory system responding in ${mode} mode.`;
    
  } catch (error) {
    console.error('AI provider error:', error);
    return 'I apologize, but I encountered an error processing your request. Please try again.';
  }
}

/**
 * Store conversation in memory for future reference
 */
async function storeConversationMemory(userId, userMessage, aiResponse, sessionId) {
  try {
    // Store user message
    await MemoryBootstrap.storeMemory(
      userId, 
      userMessage, 
      {
        source: 'user_input',
        sessionId,
        metadata: {
          type: 'user_message',
          timestamp: Date.now()
        }
      }
    );

    // Store AI response if it contains useful information
    if (aiResponse.length > 50 && !aiResponse.includes('I apologize') && !aiResponse.includes('error')) {
      await MemoryBootstrap.storeMemory(
        userId, 
        `AI Response: ${aiResponse}`, 
        {
          source: 'ai_response',
          sessionId,
          metadata: {
            type: 'ai_response',
            timestamp: Date.now()
          }
        }
      );
    }
  } catch (error) {
    console.error('Error storing conversation memory:', error);
    // Don't fail the request if memory storage fails
  }
}

/**
 * Health check endpoint for memory system
 */
export async function healthCheck(req, res) {
  try {
    const health = await MemoryBootstrap.healthCheck();
    const systemInfo = MemoryBootstrap.getSystemInfo();
    
    return res.status(health.status === 'healthy' ? 200 : 503).json({
      status: health.status,
      timestamp: health.timestamp,
      memory: health,
      system: systemInfo
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Memory management endpoint
 */
export async function memoryManagement(req, res) {
  const { action, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'UserId is required' });
  }

  try {
    switch (action) {
      case 'stats':
        const stats = await MemoryBootstrap.getMemoryStats(userId);
        return res.json({ success: true, data: stats });

      case 'cleanup':
        const cleaned = await MemoryBootstrap.optimizeMemoryStorage?.(userId) || { message: 'Cleanup not available in current mode' };
        return res.json({ success: true, data: cleaned });

      case 'search':
        const { query, limit = 20 } = req.body;
        if (!query) {
          return res.status(400).json({ error: 'Query is required for search' });
        }
        
        const searchResults = await MemoryBootstrap.searchMemories?.(userId, query, limit) || [];
        return res.json({ success: true, data: searchResults });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Memory management error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Additional utility functions for memory system integration

/**
 * Middleware to ensure memory system is initialized
 */
export async function ensureMemoryInitialized(req, res, next) {
  try {
    if (!MemoryBootstrap.isInitialized) {
      console.log('Initializing memory system...');
      await MemoryBootstrap.initialize();
    }
    next();
  } catch (error) {
    console.error('Memory initialization failed:', error);
    // Continue anyway - the system will fall back to in-memory mode
    next();
  }
}

/**
 * Get memory context for a specific category
 */
export async function getMemoryByCategory(userId, category, limit = 10) {
  try {
    return await MemoryBootstrap.getCategoryMemories?.(userId, category, limit) || [];
  } catch (error) {
    console.error('Error getting category memories:', error);
    return [];
  }
}

/**
 * Format multiple memory contexts for different use cases
 */
export function formatMemoryForContext(memories, contextType = 'chat') {
  if (!memories || memories.length === 0) return '';

  switch (contextType) {
    case 'chat':
      return MemoryBootstrap.formatForAI(memories, { includeMetadata: false });
    
    case 'detailed':
      return MemoryBootstrap.formatForAI(memories, { 
        includeMetadata: true,
        maxLength: 4000 
      });
    
    case 'summary':
      const summaryItems = memories.slice(0, 5).map(m => 
        `• ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`
      ).join('\n');
      return `Recent relevant information:\n${summaryItems}`;
    
    default:
      return MemoryBootstrap.formatForAI(memories);
  }
}

// Export the main handler as default
export { handler as default };

/* 
USAGE EXAMPLES:

1. Basic chat with memory:
   POST /api/chat
   { "message": "Tell me about my workout routine", "userId": "user123", "mode": "truth_general" }

2. Health check:
   GET /api/chat/health

3. Memory management:
   POST /api/chat/memory
   { "action": "stats", "userId": "user123" }

4. Search memories:
   POST /api/chat/memory  
   { "action": "search", "userId": "user123", "query": "exercise", "limit": 10 }

5. Site Monkeys mode with vault:
   POST /api/chat
   { "message": "What's our business strategy?", "userId": "user123", "mode": "site_monkeys" }
*/
