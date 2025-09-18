// api/upload-for-analysis.js
// EXACT COPY OF YOUR WORKING upload-file.js PATTERN WITH DEFAULT EXPORT

import multer from 'multer';
import path from 'path';

console.log('🔍 [Analysis] Loading upload-for-analysis.js...');

// Configure multer exactly like your working upload-file.js
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types
    console.log(`📤 [Analysis] Accepting file: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  }
});

// File type detection - exact copy from your upload-file.js
function detectFileType(filename, mimetype) {
  const ext = path.extname(filename).toLowerCase();
  
  // Images
  if (/\.(jpg|jpeg|png|gif|bmp|svg|tiff|webp)$/i.test(filename) || mimetype.startsWith('image/')) {
    return 'image';
  }
  
  // Documents
  if (/\.(pdf|doc|docx|txt|md|rtf|odt)$/i.test(filename) || 
      mimetype.includes('document') || mimetype.includes('pdf') || mimetype.includes('text')) {
    return 'document';
  }
  
  // Spreadsheets
  if (/\.(xls|xlsx|csv|ods)$/i.test(filename) || mimetype.includes('spreadsheet')) {
    return 'spreadsheet';
  }
  
  // Presentations
  if (/\.(ppt|pptx|odp)$/i.test(filename) || mimetype.includes('presentation')) {
    return 'presentation';
  }
  
  // Audio
  if (/\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(filename) || mimetype.startsWith('audio/')) {
    return 'audio';
  }
  
  // Video
  if (/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(filename) || mimetype.startsWith('video/')) {
    return 'video';
  }
  
  // Archives
  if (/\.(zip|rar|7z|tar|gz)$/i.test(filename) || mimetype.includes('archive') || mimetype.includes('compressed')) {
    return 'archive';
  }
  
  // Code files
  if (/\.(js|ts|py|java|cpp|c|php|html|css|sql|json|xml|yaml)$/i.test(filename) || 
      mimetype.includes('javascript') || mimetype.includes('text')) {
    return 'code';
  }
  
  return 'other';
}

// Process file - exact copy from your upload-file.js
async function processFile(file) {
  const processingResult = {
    success: true,
    message: '',
    type: '',
    size: Math.round(file.size / 1024), // Size in KB
    preview: ''
  };
  
  try {
    const fileType = detectFileType(file.originalname, file.mimetype);
    processingResult.type = fileType;
    
    // Set appropriate message based on file type
    switch (fileType) {
      case 'image':
        processingResult.message = `Image uploaded: ${file.originalname}`;
        processingResult.preview = `Image ready for analysis and discussion`;
        break;
        
      case 'document':
        processingResult.message = `Document uploaded: ${file.originalname}`;
        processingResult.preview = `Document content ready for analysis`;
        break;
        
      case 'spreadsheet':
        processingResult.message = `Spreadsheet uploaded: ${file.originalname}`;
        processingResult.preview = `Data tables ready for analysis`;
        break;
        
      case 'code':
        processingResult.message = `Code file uploaded: ${file.originalname}`;
        processingResult.preview = `Source code ready for review and analysis`;
        break;
        
      default:
        processingResult.message = `File uploaded: ${file.originalname}`;
        processingResult.preview = `File stored and ready for processing`;
    }
    
    // Store file metadata for future reference
    processingResult.metadata = {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadTime: new Date().toISOString(),
      fileType: fileType
    };
    
  } catch (error) {
    processingResult.success = false;
    processingResult.message = `Failed to process ${file.originalname}: ${error.message}`;
  }
  
  return processingResult;
}

// Main handler - exact structure as your working handleFileUpload
async function uploadForAnalysisHandler(req, res) {
  console.log('📁 [Analysis] Upload and analysis request received');
  
  // Set CORS headers
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
      endpoint_purpose: 'File upload and immediate analysis - WORKING VERSION',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded',
        successful_uploads: 0,
        failed_uploads: 0,
        files: []
      });
    }
    
    console.log(`📁 [Analysis] Processing ${req.files.length} file(s)`);
    
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    // Process each uploaded file - exact logic from your upload-file.js
    for (const file of req.files) {
      console.log(`🔄 [Analysis] Processing: ${file.originalname} (${file.size} bytes)`);
      
      try {
        const result = await processFile(file);
        
        if (result.success) {
          successCount++;
          results.push({
            success: true,
            filename: file.originalname,
            message: result.message,
            type: result.type,
            size: result.size,
            folder: 'analysis', // Different folder for analysis files
            preview: result.preview,
            metadata: result.metadata,
            analysis_ready: true
          });
          console.log(`✅ [Analysis] Successfully processed: ${file.originalname}`);
        } else {
          failureCount++;
          results.push({
            success: false,
            filename: file.originalname,
            message: result.message,
            error: 'Processing failed'
          });
          console.log(`❌ [Analysis] Failed to process: ${file.originalname}`);
        }
        
      } catch (error) {
        failureCount++;
        results.push({
          success: false,
          filename: file.originalname,
          message: `Upload failed: ${error.message}`,
          error: error.message
        });
        console.log(`❌ [Analysis] Error processing ${file.originalname}:`, error);
      }
    }
    
    // Return results - exact structure as your upload-file.js
    const response = {
      status: successCount > 0 ? 'success' : 'error',
      message: `Analysis upload complete: ${successCount} successful, ${failureCount} failed`,
      successful_uploads: successCount,
      failed_uploads: failureCount,
      files: results,
      endpoint_working: true,
      ready_for_analysis: true
    };
    
    console.log(`📊 [Analysis] Upload complete: ${successCount}/${req.files.length} successful`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ [Analysis] Upload endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during file upload',
      error: error.message,
      successful_uploads: 0,
      failed_uploads: req.files ? req.files.length : 0,
      files: []
    });
  }
}

// Use multer middleware first, then our handler
function createAnalysisHandler() {
  return upload.array('files', 10);
}

// Export as DEFAULT (matching server.js import pattern)
const analysisHandler = (req, res) => {
  // Apply multer middleware first, then our handler
  upload.array('files', 10)(req, res, async (uploadError) => {
    if (uploadError) {
      console.error('❌ [Analysis] Multer error:', uploadError);
      return res.status(400).json({
        success: false,
        error: uploadError.message,
        error_type: 'upload_error'
      });
    }
    
    // Call our main handler
    await uploadForAnalysisHandler(req, res);
  });
};

export default analysisHandler;

console.log('✅ [Analysis] upload-for-analysis.js loaded successfully with DEFAULT export');
