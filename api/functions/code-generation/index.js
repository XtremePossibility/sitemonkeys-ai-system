// ZERO-FAILURE CODE GENERATION API ENDPOINT
// Enhanced task-type-aware code generation with Site Monkeys enforcement

// ✅ FIXED: CORRECTED IMPORT PATHS FROM ../../lib/
import { routeCodeGeneration, getAvailableTaskTypes } from '../../lib/validators/CodeRouters.js';
import { enhancedCodeGeneration, analyzeCodeRequest } from '../../lib/validators/enhancedDetection.js';
import { validateCodeOutput } from '../../lib/validators/validateCodeOutput.js';
import { ENFORCEMENT_PROTOCOLS } from '../../lib/site-monkeys/enforcement-protocols.js';
import { QUALITY_ENFORCEMENT } from '../../lib/site-monkeys/quality-enforcement.js';
import { trackApiCall } from '../../lib/tokenTracker.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Track API call
    trackApiCall('/api/code-generation', req.method, 0);

    if (req.method === 'GET') {
      // Return available task types and system info
      const availableTypes = getAvailableTaskTypes();
      
      res.status(200).json({
        status: 'ready',
        message: 'Site Monkeys Code Generation API - Zero Failure Protocols Active',
        available_task_types: availableTypes,
        enforcement_active: [
          'zero_failure_protocols',
          'quality_enforcement',
          'drift_prevention',
          'task_type_intelligence'
        ],
        version: '1.0.0',
        features: [
          'enhanced_detection',
          'task_classification', 
          'validation_pipeline',
          'security_enforcement'
        ]
      });
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ 
        error: 'Method not allowed',
        supported_methods: ['GET', 'POST', 'OPTIONS']
      });
      return;
    }

    // *** POST REQUEST: PROCESS CODE GENERATION ***
    const { 
      prompt, 
      task_type,
      mode = 'site_monkeys',
      validation_level = 'standard'
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ 
        error: 'Prompt is required and must be a string',
        received: typeof prompt
      });
      return;
    }

    console.log(`🎯 Code generation request - Task: ${task_type || 'auto-detect'}, Mode: ${mode}`);

    // *** STEP 1: ENHANCED ANALYSIS & DETECTION ***
    let finalTaskType = task_type;
    let analysisResult = null;

    if (!task_type || task_type === 'auto') {
      // Auto-detect task type using enhanced detection
      analysisResult = analyzeCodeRequest(prompt);
      
      if (analysisResult.isCodeRequest) {
        finalTaskType = analysisResult.taskType;
        console.log(`🔍 Auto-detected task type: ${finalTaskType} (confidence: ${analysisResult.confidence})`);
      } else {
        res.status(400).json({
          error: 'Request does not appear to be a code generation request',
          analysis: analysisResult,
          suggestion: 'Try adding #code: prefix or use more specific coding terminology'
        });
        return;
      }
    }

    // *** STEP 2: ROUTE TO CODE GENERATION ENGINE ***
    const generationResult = await routeCodeGeneration(prompt, finalTaskType, mode);

    if (!generationResult.success) {
      res.status(400).json({
        error: 'Code generation failed',
        details: generationResult.error,
        available_types: getAvailableTaskTypes().map(t => t.type),
        source_model: generationResult.source_model || 'unknown'
      });
      return;
    }

    // *** STEP 3: ENHANCED VALIDATION (if requested) ***
    let validationResult = null;
    if (validation_level === 'enhanced') {
      validationResult = await validateCodeOutput(generationResult.validated_output, 'enhanced_router');
      
      if (!validationResult.passed) {
        console.warn('⚠️ Enhanced validation failed:', validationResult.violations);
      }
    }

    // *** STEP 4: SUCCESS RESPONSE ***
    const response = {
      success: true,
      generated_code: generationResult.validated_output,
      task_type: finalTaskType,
      confidence_score: generationResult.confidence_score,
      quality_grade: generationResult.enforcement_grade,
      source_model: generationResult.source_model,
      metadata: {
        ...generationResult.metadata,
        auto_detected: !task_type || task_type === 'auto',
        analysis_result: analysisResult,
        validation_level: validation_level,
        enhanced_validation: validationResult,
        enforcement_applied: [
          'site_monkeys_protocols',
          'zero_failure_validation',
          'quality_enforcement',
          'task_type_intelligence'
        ]
      },
      violations: generationResult.violations || [],
      generation_time: new Date().toISOString(),
      api_version: '1.0.0'
    };

    // Add warnings if applicable
    if (generationResult.confidence_score < 0.8) {
      response.warnings = response.warnings || [];
      response.warnings.push(`Low confidence score: ${generationResult.confidence_score}`);
    }

    if (validationResult && !validationResult.passed) {
      response.warnings = response.warnings || [];
      response.warnings.push('Enhanced validation detected issues');
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Code generation API error:', error);
    
    res.status(500).json({
      error: 'Code generation system error',
      message: error.message,
      enforcement_active: true,
      fallback_message: ENFORCEMENT_PROTOCOLS.error_handling.system_error_response,
      timestamp: new Date().toISOString()
    });
  }
}
