// api/upload-for-analysis.js
// MINIMAL TEST VERSION - No external dependencies
// This will help us isolate if the issue is with imports or the endpoint registration

import multer from 'multer';

// Simple multer configuration
const analysisStorage = multer.memoryStorage();
const analysisUpload = multer({
  storage: analysisStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5
  },
  fileFilter: (req, file, cb) => {
    console.log(`📤 [Analysis] Accepting file: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  }
});

// MAIN ENDPOINT - MINIMAL VERSION FOR TESTING
export default async function handler(req, res) {
  console.log(`🔍 [Analysis] Request received - Method: ${req.method}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    console.log(`✅ [Analysis] OPTIONS request handled`);
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    console.log(`❌ [Analysis] Invalid method: ${req.method}`);
    return res.status(405).json({
      error: 'Method not allowed',
      supported_method: 'POST',
      endpoint_purpose: 'File upload and immediate analysis - TEST VERSION',
      current_method: req.method,
      test_status: 'ENDPOINT IS WORKING - Dependencies removed for testing',
      timestamp: new Date().toISOString()
    });
  }

  console.log('📁 [Analysis] POST request - processing upload...');

  // Use multer middleware
  analysisUpload.array('files', 5)(req, res, async (uploadError) => {
    if (uploadError) {
      console.error('❌ [Analysis] Upload error:', uploadError);
      return res.status(400).json({
        success: false,
        error: uploadError.message,
        error_type: 'upload_error',
        test_status: 'Upload middleware failed'
      });
    }

    try {
      const userQuery = req.body.query || 'Test analysis query';
      
      console.log(`🔍 [Analysis] Files received: ${req.files ? req.files.length : 0}`);
      console.log(`🔍 [Analysis] Query: "${userQuery}"`);

      // Simple file processing without external dependencies
      const analysisResults = [];
      
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          
          // Basic analysis without external libraries
          const analysis = `📄 **TEST ANALYSIS**: "${file.originalname}"
          
**File Type**: ${file.mimetype}
**Size**: ${Math.round(file.size / 1024)}KB
**Status**: File uploaded successfully - endpoint is working!

**Note**: This is a minimal test version to verify the endpoint works.
The full document extraction features will be restored once we confirm the endpoint registration is working.

**Buffer Preview**: ${file.buffer.length} bytes received
**Upload Time**: ${new Date().toISOString()}`;

          analysisResults.push({
            file_name: file.originalname,
            file_type: file.mimetype,
            file_size_kb: Math.round(file.size / 1024),
            success: true,
            analysis: analysis,
            test_mode: true
          });
        }
      }

      // Return successful response
      const response = {
        success: true,
        message: '🎉 ENDPOINT TEST SUCCESSFUL - File analysis endpoint is working!',
        test_mode: true,
        files_processed: req.files ? req.files.length : 0,
        analysis_results: analysisResults,
        query_received: userQuery,
        
        system_status: {
          endpoint_registered: true,
          multer_working: true,
          file_upload_working: req.files && req.files.length > 0,
          dependencies_removed: 'pdf-parse and mammoth temporarily removed for testing'
        },
        
        next_steps: [
          'If you see this response, the endpoint registration is working',
          'We can now add back the document extraction libraries',
          'The issue was likely with missing dependencies, not endpoint registration'
        ],
        
        timestamp: new Date().toISOString()
      };

      console.log(`✅ [Analysis] Test successful: ${req.files ? req.files.length : 0} files processed`);
      
      return res.status(200).json(response);
      
    } catch (error) {
      console.error('❌ [Analysis] Test endpoint error:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message,
        error_type: 'internal_server_error',
        test_mode: true,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  });
}

console.log('✅ [Analysis] MINIMAL TEST endpoint loaded - no external dependencies');
console.log('🎯 [Analysis] Purpose: Verify endpoint registration works before adding document extraction');
