// api/upload-for-analysis.js
// MATCH THE WORKING EXPORT PATTERN FROM upload-file.js

import multer from 'multer';

const analysisStorage = multer.memoryStorage();
const analysisUpload = multer({
  storage: analysisStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 5
  }
});

// Default export function (matching server.js import)
export default async function uploadForAnalysisHandler(req, res) {
  console.log(`🔍 [Analysis] Request received - Method: ${req.method}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      supported_method: 'POST',
      endpoint_purpose: 'File upload and analysis - FIXED EXPORT PATTERN',
      timestamp: new Date().toISOString()
    });
  }

  // Simple response for testing
  res.json({
    success: true,
    message: 'ENDPOINT WORKING - Export pattern fixed!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}

console.log('✅ [Analysis] Handler exported using named export pattern');
