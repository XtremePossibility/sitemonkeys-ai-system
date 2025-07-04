import { processRequest } from './lib/chatProcessor.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Process request with full cognitive firewall
    const result = await processRequest({
    
    // Return structured response for frontend
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Chat system error:', error);
    
    return res.status(200).json({
      response: `**System Error:** Technical difficulties. Please try again. Error: ${error.message}`,
      mode_active: 'error',
      vault_loaded: false,
      security_pass: false, 
      triggered_frameworks: [],
      assumption_warnings: [],
      fallback_used: true
    });
  }
}
