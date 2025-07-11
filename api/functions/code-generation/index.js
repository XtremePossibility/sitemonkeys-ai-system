// SITE MONKEYS AI - ZERO-FAILURE CODE GENERATION API ENDPOINT
// Production API that routes code generation through enforced validation pipeline
// Bound to Site Monkeys enforcement - cannot bypass validation

import { routeCodeGeneration, getAvailableTaskTypes, getValidationThreshold } from '../lib/validators/codeRouter.js';

// *** HARDCODED ENFORCEMENT PARAMETERS ***
const SITE_MONKEYS_ENFORCEMENT = {
  mode_locked: 'site_monkeys',
  bypass_disabled: true,
  validation_required: true,
  minimum_confidence: 0.6,
  allowed_task_types: ['critical_enforcement', 'refactor_component', 'helper_code', 'test_stub', 'boilerplate'],
  rate_limits: {
    per_minute: 10,
    per_hour: 100,
    per_day: 500
  }
};

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map();

// *** MAIN API HANDLER ***
export default async function handler(req, res) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return sendErrorResponse(res, {
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are allowed',
      allowed_methods: ['POST'],
      request_id: requestId
    }, 405);
  }

  try {
    console.log(`🎯 Code generation request started - ID: ${requestId}`);
    
    // *** STEP 1: INPUT VALIDATION AND ENFORCEMENT BINDING ***
    const validationResult = validateAndBindRequest(req.body, requestId);
    
    if (!validationResult.valid) {
      console.error(`❌ Input validation failed - ID: ${requestId}`, validationResult.errors);
      return sendErrorResponse(res, {
        error: 'INPUT_VALIDATION_FAILED',
        message: 'Request validation failed',
        errors: validationResult.errors,
        enforcement_status: 'blocked',
        request_id: requestId
      }, 400);
    }

    const { prompt, taskType, mode } = validationResult.sanitized;
    
    console.log(`📋 Request validated - Task: ${taskType}, Mode: ${mode}, ID: ${requestId}`);

    // *** STEP 2: RATE LIMITING CHECK ***
    const rateLimitResult = checkRateLimit(req, requestId);
    
    if (!rateLimitResult.allowed) {
      console.warn(`⚠️ Rate limit exceeded - ID: ${requestId}`, rateLimitResult);
      return sendErrorResponse(res, {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        limit_info: rateLimitResult,
        retry_after: rateLimitResult.reset_time,
        request_id: requestId
      }, 429);
    }

    console.log(`✅ Rate limit passed - ID: ${requestId}`);

    // *** STEP 3: ROUTE THROUGH CODE GENERATION SYSTEM ***
    console.log(`🚀 Routing to code generation system - ID: ${requestId}`);
    
    const routingResult = await routeCodeGeneration(prompt, taskType, mode);
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Code generation completed in ${processingTime}ms - ID: ${requestId}`);

    // *** STEP 4: RESPONSE FORMATTING AND ENFORCEMENT REPORTING ***
    if (routingResult.success) {
      console.log(`🎉 Code generation successful - Model: ${routingResult.source_model}, Grade: ${routingResult.enforcement_grade}, ID: ${requestId}`);
      
      return sendSuccessResponse(res, {
        request_id: requestId,
        success: true,
        generated_code: routingResult.validated_output,
        validation_results: {
          passed: true,
          confidence_score: routingResult.confidence_score,
          enforcement_grade: routingResult.enforcement_grade,
          violations: routingResult.violations,
          validation_threshold: getValidationThreshold(taskType)
        },
        routing_metadata: {
          source_model: routingResult.source_model,
          task_type: taskType,
          mode: mode,
          execution_time_ms: processingTime,
          model_metadata: routingResult.metadata?.model_metadata || {},
          execution_log: routingResult.metadata?.execution_log || []
        },
        enforcement_status: {
          site_monkeys_mode: true,
          bypass_disabled: SITE_MONKEYS_ENFORCEMENT.bypass_disabled,
          validation_enforced: true,
          minimum_confidence_met: routingResult.confidence_score >= SITE_MONKEYS_ENFORCEMENT.minimum_confidence
        }
      });
      
    } else {
      console.error(`💥 Code generation failed - Error: ${routingResult.error}, ID: ${requestId}`);
      
      return sendErrorResponse(res, {
        error: 'CODE_GENERATION_FAILED',
        message: 'Code generation and validation failed',
        routing_failure: routingResult.error,
        validation_results: {
          passed: false,
          confidence_score: routingResult.confidence_score,
          enforcement_grade: routingResult.enforcement_grade,
          violations: routingResult.violations,
          validation_threshold: getValidationThreshold(taskType)
        },
        routing_metadata: {
          source_model: routingResult.source_model,
          task_type: taskType,
          mode: mode,
          execution_time_ms: processingTime,
          execution_log: routingResult.metadata?.execution_log || [],
          failure_reason: routingResult.metadata?.failure_reason || 'unknown'
        },
        enforcement_status: {
          site_monkeys_mode: true,
          bypass_disabled: SITE_MONKEYS_ENFORCEMENT.bypass_disabled,
          validation_enforced: true,
          enforcement_blocked: true
        },
        request_id: requestId
      }, 422);
    }

  } catch (systemError) {
    const processingTime = Date.now() - startTime;
    console.error(`🚨 System error in code generation - ID: ${requestId}`, systemError);
    
    return sendErrorResponse(res, {
      error: 'SYSTEM_ERROR',
      message: 'Internal system error during code generation',
      system_error: systemError.message,
      enforcement_status: {
        site_monkeys_mode: true,
        system_protected: true,
        error_contained: true
      },
      metadata: {
        execution_time_ms: processingTime,
        error_timestamp: new Date().toISOString()
      },
      request_id: requestId
    }, 500);
  }
}

// *** INPUT VALIDATION AND ENFORCEMENT BINDING ***
function validateAndBindRequest(body, requestId) {
  const errors = [];
  const warnings = [];

  // Basic payload validation
  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a valid JSON object');
    return { valid: false, errors };
  }

  // Prompt validation
  if (!body.prompt || typeof body.prompt !== 'string') {
    errors.push('prompt is required and must be a string');
  } else if (body.prompt.trim().length === 0) {
    errors.push('prompt cannot be empty');
  } else if (body.prompt.length > 10000) {
    errors.push('prompt cannot exceed 10,000 characters');
  }

  // Task type validation
  if (!body.taskType || typeof body.taskType !== 'string') {
    errors.push('taskType is required and must be a string');
  } else if (!SITE_MONKEYS_ENFORCEMENT.allowed_task_types.includes(body.taskType)) {
    errors.push(`taskType must be one of: ${SITE_MONKEYS_ENFORCEMENT.allowed_task_types.join(', ')}`);
  }

  // Mode enforcement - CRITICAL: Always bind to site_monkeys mode
  let enforcedMode = SITE_MONKEYS_ENFORCEMENT.mode_locked;
  
  if (body.mode && body.mode !== SITE_MONKEYS_ENFORCEMENT.mode_locked) {
    warnings.push(`Mode override attempted but blocked - enforcing ${SITE_MONKEYS_ENFORCEMENT.mode_locked} mode`);
  }

  // Security validation - check for bypass attempts
  if (body.bypass_validation === true || body.skip_enforcement === true) {
    errors.push('Validation bypass attempts are not allowed');
  }

  if (body.override_mode || body.force_model) {
    errors.push('Mode and model override attempts are not allowed');
  }

  // Content security validation
  const suspiciousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /document\.write/,
    /innerHTML\s*=/,
    /dangerouslySetInnerHTML/
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(body.prompt)) {
      errors.push('Prompt contains potentially unsafe code patterns');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: {
      prompt: body.prompt?.trim(),
      taskType: body.taskType,
      mode: enforcedMode // Always site_monkeys
    }
  };
}

// *** RATE LIMITING ***
function checkRateLimit(req, requestId) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const hour = Math.floor(now / 3600000);
  const day = Math.floor(now / 86400000);

  const key = `${clientIP}`;
  const limits = SITE_MONKEYS_ENFORCEMENT.rate_limits;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      minute: { count: 0, window: minute },
      hour: { count: 0, window: hour },
      day: { count: 0, window: day }
    });
  }

  const clientLimits = rateLimitStore.get(key);

  // Reset counters if window has passed
  if (clientLimits.minute.window < minute) {
    clientLimits.minute = { count: 0, window: minute };
  }
  if (clientLimits.hour.window < hour) {
    clientLimits.hour = { count: 0, window: hour };
  }
  if (clientLimits.day.window < day) {
    clientLimits.day = { count: 0, window: day };
  }

  // Check limits
  if (clientLimits.minute.count >= limits.per_minute) {
    return {
      allowed: false,
      limit_type: 'per_minute',
      current: clientLimits.minute.count,
      limit: limits.per_minute,
      reset_time: (minute + 1) * 60000
    };
  }

  if (clientLimits.hour.count >= limits.per_hour) {
    return {
      allowed: false,
      limit_type: 'per_hour', 
      current: clientLimits.hour.count,
      limit: limits.per_hour,
      reset_time: (hour + 1) * 3600000
    };
  }

  if (clientLimits.day.count >= limits.per_day) {
    return {
      allowed: false,
      limit_type: 'per_day',
      current: clientLimits.day.count, 
      limit: limits.per_day,
      reset_time: (day + 1) * 86400000
    };
  }

  // Increment counters
  clientLimits.minute.count++;
  clientLimits.hour.count++;
  clientLimits.day.count++;

  return {
    allowed: true,
    remaining: {
      per_minute: limits.per_minute - clientLimits.minute.count,
      per_hour: limits.per_hour - clientLimits.hour.count,
      per_day: limits.per_day - clientLimits.day.count
    }
  };
}

// *** RESPONSE HELPERS ***
function sendSuccessResponse(res, data) {
  res.status(200).json({
    ...data,
    api_version: '1.0.0',
    timestamp: new Date().toISOString(),
    enforcement_signature: 'SITE_MONKEYS_ZERO_FAILURE_v1'
  });
}

function sendErrorResponse(res, errorData, statusCode = 400) {
  res.status(statusCode).json({
    success: false,
    ...errorData,
    api_version: '1.0.0',
    timestamp: new Date().toISOString(),
    enforcement_signature: 'SITE_MONKEYS_ZERO_FAILURE_v1'
  });
}

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// *** UTILITY ENDPOINTS ***
export async function getTaskTypes(req, res) {
  if (req.method !== 'GET') {
    return sendErrorResponse(res, {
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET requests are allowed'
    }, 405);
  }

  const taskTypes = getAvailableTaskTypes();
  
  return sendSuccessResponse(res, {
    task_types: taskTypes,
    enforcement_info: {
      mode_locked: SITE_MONKEYS_ENFORCEMENT.mode_locked,
      bypass_disabled: SITE_MONKEYS_ENFORCEMENT.bypass_disabled,
      rate_limits: SITE_MONKEYS_ENFORCEMENT.rate_limits
    }
  });
}

export async function getSystemStatus(req, res) {
  if (req.method !== 'GET') {
    return sendErrorResponse(res, {
      error: 'METHOD_NOT_ALLOWED', 
      message: 'Only GET requests are allowed'
    }, 405);
  }

  return sendSuccessResponse(res, {
    status: 'operational',
    enforcement_active: true,
    site_monkeys_mode: SITE_MONKEYS_ENFORCEMENT.mode_locked,
    validation_required: SITE_MONKEYS_ENFORCEMENT.validation_required,
    available_task_types: SITE_MONKEYS_ENFORCEMENT.allowed_task_types,
    rate_limits: SITE_MONKEYS_ENFORCEMENT.rate_limits,
    system_info: {
      node_version: process.version,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage()
    }
  });
}
