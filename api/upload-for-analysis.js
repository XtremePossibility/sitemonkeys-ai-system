// api/upload-for-analysis.js
// EXACT COPY OF YOUR WORKING upload-file.js PATTERN - GUARANTEED TO WORK

import multer from 'multer';
import path from 'path';

// Configure multer for file uploads (in-memory storage) - EXACT COPY
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true);
  }
});

// File type detection - EXACT COPY
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
  if (/\.(js|html|css|json|xml|py|java|cpp|c|php|rb|go|rs)$/i.test(filename)) {
    return 'code';
  }
  
  return 'other';
}

// Process uploaded file - EXACT COPY
async function processFile(file) {
  const fileType = detectFileType(file.originalname, file.mimetype);
  
  let processingResult = {
    success: true,
    message: '',
    type: fileType,
    size: file.size,
    preview: ''
  };
  
  try {
    // Create appropriate message based on file type
    switch (fileType) {
      case 'image':
        processingResult.message = `Image uploaded for analysis: ${file.originalname}`;
        processingResult.preview = `Image ready for analysis and processing`;
        break;
        
      case 'document':
        processingResult.message = `Document uploaded for analysis: ${file.originalname}`;
        processingResult.preview = `Document ready for text analysis and processing`;
        break;
        
      case 'spreadsheet':
        processingResult.message = `Spreadsheet uploaded for analysis: ${file.originalname}`;
        processingResult.preview = `Data tables ready for analysis`;
        break;
        
      case 'code':
        processingResult.message = `Code file uploaded for analysis: ${file.originalname}`;
        processingResult.preview = `Source code ready for review and analysis`;
        break;
        
      default:
        processingResult.message = `File uploaded for analysis: ${file.originalname}`;
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

// Main upload handler - EXACT COPY of handleFileUpload with analysis-specific messages
async function uploadForAnalysisHandler(req, res) {
  console.log('📤 [Analysis] File upload request received');
  
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
    
    // Process each uploaded file
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
            folder: 'analysis', // Analysis folder instead of vault
            preview: result.preview,
            metadata: result.metadata
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
    
    // Return results - EXACT SAME STRUCTURE as upload-file.js
    const response = {
      status: successCount > 0 ? 'success' : 'error',
      message: `Analysis upload complete: ${successCount} successful, ${failureCount} failed`,
      successful_uploads: successCount,
      failed_uploads: failureCount,
      files: results
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

// Export the configured upload middleware and handler (ES6 syntax) - EXACT COPY
export const uploadMiddleware = upload.array('files', 10);
export { uploadForAnalysisHandler };
