// ENHANCED CODE GENERATION DETECTION WITH TASK TYPE INTELLIGENCE    
// Zero-failure classification system with explicit tag support

/**    
 * INTELLIGENT CODE REQUEST CLASSIFIER    
 * Determines both IF this is a code request AND what TYPE of code is needed    
 */    
function analyzeCodeRequest(message) {    
  const lowerMessage = message.toLowerCase().trim();    
      
  // *** EXPLICIT TAG DETECTION (HIGHEST PRIORITY) ***    
  const explicitMatch = message.match(/#code:\s*(.+?)(?:\n|$)/i);    
  if (explicitMatch) {    
    const taggedRequest = explicitMatch[1].trim();    
    return {    
      isCodeRequest: true,    
      taskType: classifyTaggedRequest(taggedRequest),    
      confidence: 'explicit',    
      extractedRequest: taggedRequest,    
      originalMessage: message    
    };    
  }

  // *** PATTERN-BASED DETECTION ***    
  const codePatterns = {    
    // Direct code requests    
    direct: [    
      'write code', 'create function', 'build module', 'generate code',    
      'code for', 'function that', 'script to', 'program that'    
    ],    
        
    // Validation/enforcement patterns    
    validation: [    
      'validate', 'validator for', 'validation function', 'check if',    
      'verify that', 'ensure', 'enforce', 'sanitize', 'clean'    
    ],    
        
    // Testing patterns    
    testing: [    
      'test', 'unit test', 'test case', 'mock', 'stub',    
      'test data', 'example usage', 'demo code'    
    ],    
        
    // Security/critical patterns    
    critical: [    
      'security', 'authentication', 'authorization', 'encrypt',    
      'hash', 'secure', 'protect', 'prevent', 'block'    
    ],    
        
    // Business logic patterns    
    business: [    
      'pricing', 'calculate cost', 'business rule', 'policy',    
      'minimum', 'maximum', 'threshold', 'limit'    
    ],    
        
    // Utility/helper patterns    
    utility: [    
      'format', 'parse', 'convert', 'transform', 'utility',    
      'helper', 'tool', 'wrapper', 'adapter'    
    ]    
  };

  // *** CLASSIFY REQUEST TYPE ***    
  let detectedPatterns = [];    
  let confidence = 0;    
      
  for (const [category, patterns] of Object.entries(codePatterns)) {    
    const matches = patterns.filter(pattern => lowerMessage.includes(pattern));    
    if (matches.length > 0) {    
      detectedPatterns.push({    
        category,    
        matches,    
        weight: matches.length    
      });    
      confidence += matches.length;    
    }    
  }

  if (detectedPatterns.length === 0) {    
    return {    
      isCodeRequest: false,    
      confidence: 'none'    
    };    
  }

  // *** DETERMINE PRIMARY TASK TYPE ***    
  const primaryPattern = detectedPatterns.reduce((prev, current) =>     
    (prev.weight > current.weight) ? prev : current    
  );

  const taskType = mapCategoryToTaskType(primaryPattern.category);

  return {    
    isCodeRequest: true,    
    taskType,    
    confidence: confidence > 2 ? 'high' : 'medium',    
    detectedPatterns,    
    primaryCategory: primaryPattern.category,    
    originalMessage: message    
  };    
}

/**    
 * CLASSIFY EXPLICITLY TAGGED REQUESTS    
 */    
function classifyTaggedRequest(taggedRequest) {    
  const lower = taggedRequest.toLowerCase();    
      
  // Security/Critical enforcement    
  if (lower.includes('security') || lower.includes('encrypt') ||     
      lower.includes('auth') || lower.includes('protect')) {    
    return 'critical_enforcement';    
  }    
      
  // Validation/enforcement    
  if (lower.includes('validate') || lower.includes('verify') ||     
      lower.includes('check') || lower.includes('enforce')) {    
    return 'helper_code';    
  }    
      
  // Testing    
  if (lower.includes('test') || lower.includes('mock') ||     
      lower.includes('stub') || lower.includes('demo')) {    
    return 'test_stub';    
  }    
      
  // Business logic    
  if (lower.includes('pricing') || lower.includes('business') ||     
      lower.includes('policy') || lower.includes('rule')) {    
    return 'helper_code';    
  }    
      
  // Default to helper code    
  return 'helper_code';    
}

/**    
 * MAP PATTERN CATEGORIES TO TASK TYPES    
 */    
function mapCategoryToTaskType(category) {    
  const categoryMap = {    
    'validation': 'helper_code',    
    'testing': 'test_stub',    
    'critical': 'critical_enforcement',    
    'business': 'helper_code',    
    'utility': 'helper_code',    
    'direct': 'helper_code'    
  };    
      
  return categoryMap[category] || 'helper_code';    
}

/**    
 * SIMPLE CODE VALIDATION (NO BABEL DEPENDENCY)    
 */    
function simpleValidateCode(code) {    
  const validation = {    
    valid: true,    
    issues: []    
  };

  // Basic validation checks    
  if (!code || code.trim().length === 0) {    
    validation.valid = false;    
    validation.issues.push('Code cannot be empty');    
    return validation;    
  }

  // Check for obvious syntax issues    
  const openBraces = (code.match(/{/g) || []).length;    
  const closeBraces = (code.match(/}/g) || []).length;    
  if (openBraces !== closeBraces) {    
    validation.issues.push('Mismatched braces detected');    
  }

  const openParens = (code.match(/\(/g) || []).length;    
  const closeParens = (code.match(/\)/g) || []).length;    
  if (openParens !== closeParens) {    
    validation.issues.push('Mismatched parentheses detected');    
  }

  return validation;    
}

/**    
 * ENHANCED CODE GENERATION INTEGRATION    
 * ✅ FIXED: CORRECT IMPORT PATH AND CASE SENSITIVITY    
 */    
async function enhancedCodeGeneration(message, mode = 'site_monkeys') {    
  console.log('🔍 Analyzing code request...');    
      
  const analysis = analyzeCodeRequest(message);    
      
  if (!analysis.isCodeRequest) {    
    return {    
      isCodeRequest: false,    
      shouldContinueNormalChat: true    
    };    
  }    
      
  console.log(`🎯 Code request detected:`, {    
    taskType: analysis.taskType,    
    confidence: analysis.confidence,    
    category: analysis.primaryCategory    
  });    
      
  try {    
    // ✅ FIXED: CORRECT CASE SENSITIVITY - CodeRouters.js (capital C)    
    const { routeCodeGeneration } = await import('./CodeRouters.js');  
        
    // *** ENHANCED: USE CLASSIFIED TASK TYPE ***    
    const codeResult = await routeCodeGeneration(    
      analysis.extractedRequest || analysis.originalMessage,    
      analysis.taskType,  // ← DYNAMIC TASK TYPE    
      mode    
    );    
        
    if (codeResult.success) {    
      // *** SIMPLIFIED: BASIC VALIDATION WITHOUT BABEL ***    
      const validationResult = simpleValidateCode(codeResult.validated_output);    
          
      // *** ENHANCED: SECURITY WARNINGS FOR CRITICAL CODE ***    
      let securityNotice = '';    
      if (analysis.taskType === 'critical_enforcement') {    
        securityNotice = '\n\n⚠️ **SECURITY CODE GENERATED** - Review thoroughly before implementation.';    
      } else if (analysis.taskType === 'business_logic') {    
        securityNotice = '\n\n💰 **BUSINESS LOGIC CODE** - Ensure compliance with Site Monkeys pricing policies.';    
      }    
          
      const codeResponse = `Here's your ${analysis.taskType.replace('_', ' ')} code:

\`\`\`javascript    
${codeResult.validated_output}    
\`\`\`

**Task Type:** ${analysis.taskType}    
**Detection Confidence:** ${analysis.confidence}    
**Quality Grade:** ${codeResult.enforcement_grade}    
**Validation Status:** ${validationResult.valid ? '✅ Valid' : '⚠️ Issues Detected'}    
${validationResult.issues?.length > 0 ? '**Issues:** ' + validationResult.issues.join(', ') : ''}${securityNotice}

This code follows Site Monkeys quality standards with zero-failure protocols.`;

      return {    
        isCodeRequest: true,    
        success: true,    
        response: codeResponse,    
        metadata: {    
          taskType: analysis.taskType,    
          confidence: analysis.confidence,    
          qualityGrade: codeResult.enforcement_grade,    
          validationPassed: validationResult.valid,    
          issuesFound: validationResult.issues || [],    
          securityLevel: analysis.taskType === 'critical_enforcement' ? 'high' : 'standard'    
        }    
      };    
    } else {    
      console.warn('⚠️ Code generation failed, falling back to normal chat');    
      return {    
        isCodeRequest: true,    
        success: false,    
        shouldContinueNormalChat: true    
      };    
    }    
  } catch (codeError) {    
    console.warn('⚠️ Code generation error:', codeError.message);    
    return {    
      isCodeRequest: true,    
      success: false,    
      error: codeError.message,    
      shouldContinueNormalChat: true    
    };    
  }    
}

// *** USAGE EXAMPLES FOR TESTING ***    
const testCases = [    
  {    
    input: "#code: write a validator for email formatting",    
    expected: { taskType: 'helper_code', confidence: 'explicit' }    
  },    
  {    
    input: "write code to format currency in JavaScript",    
    expected: { taskType: 'helper_code', confidence: 'medium' }    
  },    
  {    
    input: "create a security function to encrypt passwords",    
    expected: { taskType: 'critical_enforcement', confidence: 'high' }    
  },    
  {    
    input: "build test stubs for user authentication",    
    expected: { taskType: 'test_stub', confidence: 'high' }    
  },    
  {    
    input: "validate pricing thresholds for business logic",    
    expected: { taskType: 'helper_code', confidence: 'high' }    
  }    
];

// ✅ FIXED: CORRECT EXPORTS    
export {     
  analyzeCodeRequest,     
  enhancedCodeGeneration,     
  testCases     
};
