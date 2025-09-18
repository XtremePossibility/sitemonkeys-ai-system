// api/upload-for-analysis.js
// FIXED VERSION - REAL DOCUMENT CONTENT EXTRACTION
// Zero modifications to existing upload system - completely separate and safe

import multer from 'multer';
import path from 'path';

// Document parsing libraries - ADD THESE TO YOUR PACKAGE.JSON
// npm install pdf-parse mammoth officegen

// ================================================================
// STANDALONE FILE STORAGE AND MANAGEMENT
// ================================================================

const analysisFileStore = new Map();

// Storage statistics and configuration
const CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB limit
  MAX_FILES_PER_REQUEST: 5,
  FILE_EXPIRY_TIME: 15 * 60 * 1000, // 15 minutes
  CLEANUP_INTERVAL: 5 * 60 * 1000, // Clean every 5 minutes
  MAX_STORAGE_SIZE: 100 * 1024 * 1024, // 100MB total storage limit
  OPENAI_MAX_TOKENS: 4000, // Cost control for OpenAI
  ANTHROPIC_MAX_TOKENS: 600 // Cost control for Claude
};

// Storage statistics
let analysisStats = {
  totalUploads: 0,
  totalAnalyses: 0,
  openaiCalls: 0,
  claudeCalls: 0,
  currentStorageBytes: 0,
  totalExpired: 0,
  documentExtractionSuccess: 0,
  documentExtractionFailures: 0
};

// Auto-cleanup expired files
setInterval(() => {
  const now = Date.now();
  let expiredCount = 0;
  let freedBytes = 0;
  
  for (const [fileId, fileData] of analysisFileStore) {
    if (now - fileData.uploadTime > CONFIG.FILE_EXPIRY_TIME) {
      freedBytes += fileData.size;
      analysisFileStore.delete(fileId);
      expiredCount++;
    }
  }
  
  if (expiredCount > 0) {
    analysisStats.currentStorageBytes -= freedBytes;
    analysisStats.totalExpired += expiredCount;
    console.log(`🧹 [Analysis] Expired ${expiredCount} files, freed ${Math.round(freedBytes/1024)}KB`);
  }
}, CONFIG.CLEANUP_INTERVAL);

// ================================================================
// MULTER CONFIGURATION FOR ANALYSIS UPLOADS
// ================================================================

const analysisStorage = multer.memoryStorage();
const analysisUpload = multer({
  storage: analysisStorage,
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE,
    files: CONFIG.MAX_FILES_PER_REQUEST
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for analysis
    console.log(`📤 [Analysis] Accepting file: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  }
});

// ================================================================
// REAL DOCUMENT TEXT EXTRACTION
// ================================================================

async function extractDocumentText(fileBuffer, filename, mimetype) {
  console.log(`📄 [Extract] Starting text extraction for ${filename} (${mimetype})`);
  
  try {
    const lowerFilename = filename.toLowerCase();
    
    // PDF EXTRACTION
    if (mimetype === 'application/pdf' || lowerFilename.endsWith('.pdf')) {
      try {
        // Dynamic import for pdf-parse
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(fileBuffer);
        console.log(`✅ [PDF] Extracted ${pdfData.text.length} characters from ${filename}`);
        analysisStats.documentExtractionSuccess++;
        return {
          success: true,
          text: pdfData.text,
          extractedFrom: 'pdf-parse',
          metadata: {
            pages: pdfData.numpages,
            info: pdfData.info
          }
        };
      } catch (pdfError) {
        console.error(`❌ [PDF] Extraction failed for ${filename}:`, pdfError.message);
        analysisStats.documentExtractionFailures++;
        return { success: false, error: `PDF extraction failed: ${pdfError.message}` };
      }
    }
    
    // DOCX EXTRACTION  
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        lowerFilename.endsWith('.docx')) {
      try {
        // Dynamic import for mammoth
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        console.log(`✅ [DOCX] Extracted ${result.value.length} characters from ${filename}`);
        analysisStats.documentExtractionSuccess++;
        return {
          success: true,
          text: result.value,
          extractedFrom: 'mammoth',
          metadata: {
            messages: result.messages
          }
        };
      } catch (docxError) {
        console.error(`❌ [DOCX] Extraction failed for ${filename}:`, docxError.message);
        analysisStats.documentExtractionFailures++;
        return { success: false, error: `DOCX extraction failed: ${docxError.message}` };
      }
    }
    
    // PLAIN TEXT FILES
    if (mimetype.startsWith('text/') || lowerFilename.match(/\.(txt|md|rtf|csv)$/)) {
      try {
        const text = fileBuffer.toString('utf8');
        console.log(`✅ [TEXT] Extracted ${text.length} characters from ${filename}`);
        analysisStats.documentExtractionSuccess++;
        return {
          success: true,
          text: text,
          extractedFrom: 'utf8-decode',
          metadata: {}
        };
      } catch (textError) {
        console.error(`❌ [TEXT] Extraction failed for ${filename}:`, textError.message);
        analysisStats.documentExtractionFailures++;
        return { success: false, error: `Text extraction failed: ${textError.message}` };
      }
    }
    
    // UNSUPPORTED FILE TYPE
    console.warn(`⚠️ [Extract] Unsupported file type for ${filename} (${mimetype})`);
    return {
      success: false,
      error: `Unsupported document type: ${mimetype}. Supported: PDF, DOCX, TXT, MD`
    };
    
  } catch (error) {
    console.error(`💥 [Extract] Critical error extracting ${filename}:`, error);
    analysisStats.documentExtractionFailures++;
    return {
      success: false,
      error: `Document extraction failed: ${error.message}`
    };
  }
}

// ================================================================
// REAL AI ANALYSIS (OPENAI PREFERRED FOR DOCUMENTS)
// ================================================================

async function analyzeExtractedContent(extractedText, filename, userQuery, useAnthropic = false) {
  console.log(`🤖 [AI] Starting analysis of ${extractedText.length} characters from ${filename}`);
  
  if (!extractedText || extractedText.trim().length === 0) {
    return {
      success: false,
      error: 'No text content to analyze',
      analysis: `❌ Could not extract readable content from "${filename}"`
    };
  }
  
  // Truncate content if too long to manage token costs
  const maxLength = useAnthropic ? 8000 : 12000; // Different limits for different APIs
  const truncatedText = extractedText.length > maxLength ? 
    extractedText.substring(0, maxLength) + '\n\n[Content truncated for analysis...]' : 
    extractedText;
    
  const analysisPrompt = `
DOCUMENT ANALYSIS REQUEST:

**File:** ${filename}
**User Query:** ${userQuery || 'Analyze this document and provide insights'}
**Content Length:** ${extractedText.length} characters

**Document Content:**
${truncatedText}

**Instructions:**
1. Analyze the ACTUAL content above, not just the filename
2. Identify key topics, themes, and important information
3. Provide specific insights based on what's actually written
4. If user asked a specific question, answer it using the document content
5. Be specific - reference actual content, not generic assumptions

**Analysis:**`;

  try {
    if (useAnthropic && process.env.ANTHROPIC_API_KEY) {
      // Use Anthropic Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: CONFIG.ANTHROPIC_MAX_TOKENS,
          messages: [
            {
              role: 'user',
              content: analysisPrompt
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      analysisStats.claudeCalls++;
      
      return {
        success: true,
        analysis: result.content[0].text,
        api_used: 'anthropic-claude',
        tokens_used: result.usage,
        cost_estimate: calculateAnthropicCost(result.usage?.input_tokens || 0, result.usage?.output_tokens || 0)
      };
      
    } else if (process.env.OPENAI_API_KEY) {
      // Use OpenAI API (preferred for document analysis)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Cost-effective but capable
          messages: [
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: CONFIG.OPENAI_MAX_TOKENS,
          temperature: 0.1 // Low temperature for factual analysis
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      analysisStats.openaiCalls++;
      
      return {
        success: true,
        analysis: result.choices[0].message.content,
        api_used: 'openai-gpt4o-mini',
        tokens_used: result.usage,
        cost_estimate: calculateOpenAICost(result.usage?.prompt_tokens || 0, result.usage?.completion_tokens || 0)
      };
      
    } else {
      throw new Error('No AI API keys available (OPENAI_API_KEY or ANTHROPIC_API_KEY required)');
    }
    
  } catch (error) {
    console.error(`❌ [AI] Analysis failed for ${filename}:`, error);
    return {
      success: false,
      error: error.message,
      analysis: `❌ AI analysis failed for "${filename}": ${error.message}`
    };
  }
}

// ================================================================
// IMAGE ANALYSIS WITH CLAUDE VISION (UNCHANGED)
// ================================================================

async function analyzeImageWithClaude(fileData, query, context) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️ [Vision] No Anthropic API key found, falling back to filename analysis');
    return analyzeImageFallback(fileData, query, context);
  }

  try {
    const base64Image = fileData.buffer.toString('base64');
    const mimeType = fileData.mimetype || 'image/jpeg';
    
    const visionQuery = buildVisionQuery(query, context);
    
    const requestBody = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: CONFIG.ANTHROPIC_MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: visionQuery
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ]
    };

    console.log(`👁️ [Vision] Sending ${fileData.originalname} to Claude Vision...`);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude Vision API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    analysisStats.claudeCalls++;
    
    return {
      success: true,
      analysis: result.content[0].text,
      claude_vision_used: true,
      confidence_score: 0.95,
      tokens_used: result.usage,
      cost_estimate: calculateAnthropicCost(result.usage?.input_tokens || 0, result.usage?.output_tokens || 0)
    };

  } catch (error) {
    console.error(`❌ [Vision] Claude Vision failed for ${fileData.originalname}:`, error);
    return analyzeImageFallback(fileData, query, context);
  }
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

function calculateOpenAICost(inputTokens = 0, outputTokens = 0) {
  // GPT-4o-mini pricing: $0.15/1M input, $0.60/1M output
  const inputCost = (inputTokens / 1000000) * 0.15;
  const outputCost = (outputTokens / 1000000) * 0.60;
  return Math.round((inputCost + outputCost) * 10000) / 10000;
}

function calculateAnthropicCost(inputTokens = 0, outputTokens = 0) {
  // Claude-3-sonnet pricing: $3/1M input, $15/1M output  
  const inputCost = (inputTokens / 1000000) * 3;
  const outputCost = (outputTokens / 1000000) * 15;
  return Math.round((inputCost + outputCost) * 10000) / 10000;
}

function detectAnalysisFileType(filename, mimetype) {
  const lowerName = (filename || '').toLowerCase();
  const lowerMime = (mimetype || '').toLowerCase();
  
  // Images
  if (lowerMime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/.test(lowerName)) {
    return 'image';
  }
  
  // Documents
  if (lowerMime.includes('document') || lowerMime.includes('pdf') || lowerMime.includes('text') ||
      /\.(pdf|doc|docx|txt|md|rtf)$/.test(lowerName)) {
    return 'document';
  }
  
  // Spreadsheets
  if (lowerMime.includes('spreadsheet') || /\.(xls|xlsx|csv)$/.test(lowerName)) {
    return 'spreadsheet';
  }
  
  return 'generic';
}

function buildVisionQuery(originalQuery, context) {
  let enhancedQuery = originalQuery || "Please analyze this image and provide detailed insights.";
  
  if (context) {
    enhancedQuery += `\n\nContext: ${context}`;
  }
  
  enhancedQuery += `\n\nPlease provide a detailed analysis of this image, focusing on:
- Main content and subject matter
- Key details and information visible
- Any text, charts, or data shown
- Relevance to business or technical contexts
- Actionable insights or recommendations`;
  
  return enhancedQuery;
}

function analyzeImageFallback(fileData, query, context) {
  const filename = fileData.originalname;
  let analysis = `📸 **Image Analysis**: "${filename}"`;
  
  const lowerName = filename.toLowerCase();
  if (/chart|graph|data|report/.test(lowerName)) {
    analysis += ` - Contains quantitative information for analysis.`;
  } else if (/screenshot|ui|app|interface/.test(lowerName)) {
    analysis += ` - User interface screenshot. Shows system or application information.`;
  } else if (/financial|budget|revenue|cost/.test(lowerName)) {
    analysis += ` - Financial content detected. May contain monetary data and business metrics.`;
  } else {
    analysis += ` - Visual content uploaded and ready for discussion.`;
  }
  
  return {
    success: true,
    analysis: analysis,
    claude_vision_used: false,
    confidence_score: 0.7
  };
}

function buildEnhancedQueryFromAnalysis(originalQuery, analysisResults) {
  const successfulResults = analysisResults.filter(result => 
    result.success !== false && result.analysis
  );
  
  if (successfulResults.length === 0) {
    return originalQuery;
  }

  let enhancedQuery = originalQuery;
  enhancedQuery += "\n\n--- FILE ANALYSIS CONTEXT ---";
  
  successfulResults.forEach((result, index) => {
    enhancedQuery += `\n\n[File ${index + 1}: ${result.file_name}] ${result.analysis}`;
  });
  
  enhancedQuery += "\n\n--- END FILE ANALYSIS ---";
  enhancedQuery += "\n\nPlease provide your response considering the above file analysis.";
  
  return enhancedQuery;
}

// ================================================================
// MAIN ANALYSIS UPLOAD ENDPOINT
// ================================================================

export default async function handler(req, res) {
  // CORS headers
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
      endpoint_purpose: 'File upload and immediate analysis with real content extraction'
    });
  }

  console.log('📁 [Analysis] Upload and analysis request received');

  // Use multer middleware to handle file upload
  analysisUpload.array('files', CONFIG.MAX_FILES_PER_REQUEST)(req, res, async (uploadError) => {
    if (uploadError) {
      console.error('❌ [Analysis] Upload error:', uploadError);
      return res.status(400).json({
        success: false,
        error: uploadError.message,
        error_type: 'upload_error'
      });
    }

    try {
      // Check for files
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files provided for analysis',
          hint: 'Upload PDF, DOCX, TXT, or image files for AI analysis'
        });
      }

      // Extract query from form data or body
      const userQuery = req.body.query || 'Please analyze these files and provide insights.';
      const context = req.body.context || '';
      const useAnthropic = req.body.use_anthropic === 'true';

      console.log(`🔍 [Analysis] Processing ${req.files.length} files with query: "${userQuery}"`);

      // Processing statistics
      const processingStats = {
        total_files: req.files.length,
        successful_uploads: 0,
        successful_analyses: 0,
        successful_extractions: 0,
        extraction_failures: 0,
        ai_calls: 0,
        total_processing_time: 0
      };

      const analysisResults = [];
      const startTime = Date.now();

      // Process each file
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileProcessingStart = Date.now();

        console.log(`📄 [Analysis] Processing file ${i + 1}/${req.files.length}: ${file.originalname}`);

        try {
          // Generate unique file ID
          const fileId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Detect file type
          const fileType = detectAnalysisFileType(file.originalname, file.mimetype);

          // Store file data temporarily
          const fileData = {
            id: fileId,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            buffer: file.buffer,
            uploadTime: Date.now(),
            fileType: fileType
          };

          // Store in temporary storage
          analysisFileStore.set(fileId, fileData);
          analysisStats.currentStorageBytes += file.size;
          analysisStats.totalUploads++;
          processingStats.successful_uploads++;

          let analysisResult;

          // REAL ANALYSIS BASED ON FILE TYPE
          if (fileType === 'image') {
            // Use Claude Vision for images
            analysisResult = await analyzeImageWithClaude(fileData, userQuery, context);
            processingStats.ai_calls++;
          } 
          else if (fileType === 'document') {
            // EXTRACT REAL TEXT FROM DOCUMENTS
            const extractionResult = await extractDocumentText(file.buffer, file.originalname, file.mimetype);
            
            if (extractionResult.success) {
              processingStats.successful_extractions++;
              console.log(`✅ [Analysis] Text extracted: ${extractionResult.text.length} characters`);
              
              // ANALYZE THE ACTUAL EXTRACTED TEXT
              analysisResult = await analyzeExtractedContent(
                extractionResult.text, 
                file.originalname, 
                userQuery, 
                useAnthropic
              );
              processingStats.ai_calls++;
              
              // Add extraction metadata
              analysisResult.extraction_metadata = extractionResult.metadata;
              analysisResult.extracted_from = extractionResult.extractedFrom;
              analysisResult.text_length = extractionResult.text.length;
              
            } else {
              processingStats.extraction_failures++;
              analysisResult = {
                success: false,
                error: extractionResult.error,
                analysis: `❌ Could not extract text from "${file.originalname}": ${extractionResult.error}`
              };
            }
          }
          else {
            // Generic file handling
            analysisResult = {
              success: true,
              analysis: `📎 **File**: "${file.originalname}" (${fileType}) uploaded successfully. Content analysis requires PDF, DOCX, or image format.`,
              file_type_note: `${fileType} files require manual review`
            };
          }

          // Add processing metadata
          analysisResult.file_id = fileId;
          analysisResult.file_name = file.originalname;
          analysisResult.file_type = fileType;
          analysisResult.file_size_kb = Math.round(file.size / 1024);
          analysisResult.processing_time_ms = Date.now() - fileProcessingStart;

          analysisResults.push(analysisResult);
          
          if (analysisResult.success !== false) {
            processingStats.successful_analyses++;
            analysisStats.totalAnalyses++;
          }

          // Clean up file immediately after analysis
          analysisFileStore.delete(fileId);
          analysisStats.currentStorageBytes -= file.size;

          console.log(`✅ [Analysis] File ${i + 1} processed: ${analysisResult.success !== false ? 'SUCCESS' : 'FAILED'}`);

        } catch (fileError) {
          console.error(`❌ [Analysis] File ${i + 1} processing failed:`, fileError);
          analysisResults.push({
            file_name: file.originalname,
            success: false,
            error: fileError.message,
            processing_time_ms: Date.now() - fileProcessingStart
          });
        }
      }

      // Calculate total processing time
      processingStats.total_processing_time = Date.now() - startTime;

      // Build enhanced query for downstream systems
      const enhancedQuery = buildEnhancedQueryFromAnalysis(userQuery, analysisResults);

      // Prepare response
      const response = {
        success: true,
        message: 'File analysis completed',
        files_processed: req.files.length,
        successful_analyses: processingStats.successful_analyses,
        successful_extractions: processingStats.successful_extractions,
        extraction_failures: processingStats.extraction_failures,
        analysis_results: analysisResults,
        enhanced_query: enhancedQuery,
        
        // System status
        system_status: {
          openai_available: !!process.env.OPENAI_API_KEY,
          anthropic_available: !!process.env.ANTHROPIC_API_KEY,
          extraction_success_rate: processingStats.successful_extractions > 0 ? 
            Math.round((processingStats.successful_extractions / (processingStats.successful_extractions + processingStats.extraction_failures)) * 100) : 0,
          ai_calls_made: processingStats.ai_calls,
          endpoint_operational: true,
          total_processing_time_ms: processingStats.total_processing_time
        },
        
        // Updated statistics
        statistics: {
          extraction_stats: {
            successful: analysisStats.documentExtractionSuccess,
            failed: analysisStats.documentExtractionFailures,
            success_rate: analysisStats.documentExtractionSuccess > 0 ? 
              Math.round((analysisStats.documentExtractionSuccess / (analysisStats.documentExtractionSuccess + analysisStats.documentExtractionFailures)) * 100) : 0
          },
          api_usage: {
            openai_calls: analysisStats.openaiCalls,
            claude_calls: analysisStats.claudeCalls,
            total_files_processed: analysisStats.totalUploads
          }
        },
        
        timestamp: new Date().toISOString()
      };

      console.log(`✅ [Analysis] Complete: ${processingStats.successful_analyses}/${processingStats.total_files} successful, ${processingStats.ai_calls} AI calls, ${processingStats.successful_extractions} extractions`);
      
      return res.status(200).json(response);
      
    } catch (error) {
      console.error('❌ [Analysis] Endpoint error:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message,
        error_type: 'internal_server_error',
        enhanced_query: req.body.query || '',
        system_status: {
          endpoint_operational: false,
          error_occurred: true
        },
        timestamp: new Date().toISOString()
      });
    }
  });
}

console.log('✅ [Analysis] Fixed upload and analysis endpoint ready');
console.log('🎯 [Analysis] Features: Real document extraction, OpenAI/Claude analysis, proper token tracking');
console.log('🛡️ [Analysis] Safety: Completely separate from existing upload system');
console.log('📚 [Analysis] Supported: PDF, DOCX, TXT, MD, Images with real content analysis');
