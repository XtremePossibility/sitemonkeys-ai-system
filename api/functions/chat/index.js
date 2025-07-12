#!/usr/bin/env node
/**
 * SITE MONKEYS AI - SIMPLE WORKING BACKEND
 * Zero-complexity, production-ready chat handler
 * RESTORED TO WORKING STATE - NO UNNECESSARY COMPLEXITY
 */

// Simple imports - no complex modules that don't exist
import { createServer } from 'http';
import { readFileSync } from 'fs';

// Environment variables for API keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

// Simple conversation tracking
let conversationMemory = new Map();

// CORS headers for browser compatibility
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Main request handler
export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, conversation_history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    console.log('💬 Processing chat message:', message.substring(0, 100) + '...');

    // Try to load vault content from KV
    let vaultContent = '';
    let vaultStatus = 'not_loaded';
    
    try {
      if (KV_REST_API_URL && KV_REST_API_TOKEN) {
        const kvResponse = await fetch(KV_REST_API_URL + '/get/sitemonkeys_vault_v2', {
          headers: {
            'Authorization': 'Bearer ' + KV_REST_API_TOKEN,
            'Content-Type': 'application/json'
          }
        });
        
        if (kvResponse.ok) {
          const kvText = await kvResponse.text();
          if (kvText && kvText !== 'null') {
            const kvData = JSON.parse(kvText);
            if (kvData.result) {
              const vaultData = JSON.parse(kvData.result);
              vaultContent = vaultData.vault_content || '';
              vaultStatus = 'loaded_from_kv';
              console.log('✅ Vault loaded:', Math.ceil(vaultContent.length / 4) + ' tokens');
            }
          }
        }
      }
    } catch (vaultError) {
      console.warn('⚠️ Vault loading failed, using fallback:', vaultError.message);
      vaultContent = `
Site Monkeys AI Business Validation System
Minimum project value: $697
Services include: Business validation, market analysis, risk assessment
Core principle: Truth-first analysis with real data validation
      `;
      vaultStatus = 'fallback_mode';
    }

    // Build system prompt
    let systemPrompt = `You are Eli or Roxy from Site Monkeys AI, a business validation system.

CORE PRINCIPLES:
- Always be truthful and honest - never guess or make up information
- If you don't know something, say "I don't have that information"
- Focus on business validation and real-world practical advice
- Be helpful but realistic about limitations
- Use the vault content below as your primary knowledge source

VAULT CONTENT:
${vaultContent}

Respond as either Eli (analytical, fact-focused) or Roxy (strategic, solution-oriented) would.
Keep responses practical and business-focused.`;

    // Determine which AI personality to use
    const isAnalytical = message.toLowerCase().includes('analyze') || 
                        message.toLowerCase().includes('data') || 
                        message.toLowerCase().includes('technical');
    const personality = isAnalytical ? 'eli' : 'roxy';

    // Make API call to OpenAI (simpler and more reliable)
    let response;
    try {
      if (OPENAI_API_KEY) {
        response = await makeOpenAICall(systemPrompt, message, conversation_history);
      } else if (ANTHROPIC_API_KEY) {
        response = await makeClaudeCall(systemPrompt, message, conversation_history);
      } else {
        throw new Error('No API keys configured');
      }
    } catch (apiError) {
      console.error('❌ API call failed:', apiError);
      response = `I encountered a technical issue while processing your request. Here's what I can tell you based on our core business validation principles:

For business validation questions, we typically focus on:
- Market demand validation
- Financial feasibility analysis  
- Risk assessment
- Competition analysis

Our minimum project engagement is $697 to ensure quality service delivery.

Please try your question again, and I'll do my best to help you with practical business guidance.`;
    }

    // Clean up response
    const cleanResponse = response.replace(/^(Eli|Roxy):\s*/i, '').trim();

    // Store conversation
    const sessionId = req.headers['x-session-id'] || 'default';
    if (!conversationMemory.has(sessionId)) {
      conversationMemory.set(sessionId, []);
    }
    const sessionHistory = conversationMemory.get(sessionId);
    sessionHistory.push({ role: 'user', content: message });
    sessionHistory.push({ role: 'assistant', content: cleanResponse });
    
    // Keep only last 10 messages to prevent memory bloat
    if (sessionHistory.length > 10) {
      conversationMemory.set(sessionId, sessionHistory.slice(-10));
    }

    // Return simple, working response
    res.status(200).json({
      response: cleanResponse,
      personality_used: personality,
      vault_status: vaultStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat processing error:', error);
    
    res.status(500).json({
      response: `I encountered an error while processing your request. As a business validation system, I'm designed to be transparent about issues.

The error was: ${error.message}

I can still help you with general business validation questions based on our core principles:
- Minimum viable product validation
- Market demand assessment
- Financial projections review
- Risk mitigation strategies

Our standard engagement starts at $697 for comprehensive business validation.

Please try again with your business question.`,
      error: true,
      timestamp: new Date().toISOString()
    });
  }
}

// Simple OpenAI API call
async function makeOpenAICall(systemPrompt, message, history) {
  const messages = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Add recent conversation history
  if (history && history.length > 0) {
    history.slice(-4).forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
  }
  
  messages.push({ role: 'user', content: message });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + OPENAI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 800,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Simple Claude API call (fallback)
async function makeClaudeCall(systemPrompt, message, history) {
  let fullPrompt = systemPrompt + '\n\n';
  
  if (history && history.length > 0) {
    fullPrompt += 'Recent conversation:\n';
    history.slice(-4).forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
    });
  }
  
  fullPrompt += `\nHuman: ${message}\n\nAssistant:`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'x-api-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      messages: [{ role: 'user', content: fullPrompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// For Vercel deployment compatibility
if (process.env.NODE_ENV !== 'production') {
  const server = createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/chat') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          req.body = JSON.parse(body);
          await handler(req, res);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Site Monkeys AI server running on port ${PORT}`);
  });
}
