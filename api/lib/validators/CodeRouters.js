// SITE MONKEYS AI - ZERO-FAILURE CODE OUTPUT VALIDATOR & ROUTER
// Mission: Comprehensive enforcement validation for AI-generated code
// Used across Claude, GPT-4, and GPT-3.5 routing pipeline

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

// *** HARDCODED VALIDATION BASELINES ***
const SAFE_LICENSES = ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC', 'Unlicense', 'BSD-2-Clause'];
const BLOCKED_LICENSES = ['GPL', 'AGPL', 'SSPL', 'LGPL', 'EUPL', 'OSL', 'EPL'];

const ESLINT_VIOLATIONS = {
  'empty-catch': /catch\s*\(\s*\w*\s*\)\s*{\s*}/g,
  'unused-var': /(?:let|const|var)\s+(\w+)\s*=.*?(?=\n|$)/g,
  'console-log': /console\.log\s*\(/g,
  'eval-usage': /\beval\s*\(/g,
  'function-constructor': /new\s+Function\s*\(/g,
  'no-undef': /\bundefined_variable_pattern\b/g
};

const REQUIRED_METADATA_FIELDS = ['intent', 'assumptions', 'dependencies'];
const GENERIC_PLACEHOLDERS = ['TODO', 'placeholder', 'example', 'sample', 'test123', 'dummy'];

// *** TASK TYPE DEFINITIONS - REQUIRED BY CODE-GENERATION.JS ***
const TASK_TYPES = {
  'critical_enforcement': {
    description: 'Critical system enforcement code',
    validation_threshold: 0.9,
    max_tokens: 2000,
    requires_review: true
  },
  'refactor_component': {
    description: 'Refactoring existing components',
    validation_threshold: 0.8,
    max_tokens: 1500,
    requires_review: false
  },
  'helper_code': {
    description: 'Utility and helper functions',
    validation_threshold: 0.7,
    max_tokens: 1000,
    requires_review: false
  },
  'test_stub': {
    description: 'Test stubs and testing code',
    validation_threshold: 0.6,
    max_tokens: 800,
    requires_review: false
  },
  'boilerplate': {
    description: 'Boilerplate and template code',
    validation_threshold: 0.5,
    max_tokens: 500,
    requires_review: false
  }
};

// *** MAIN ROUTING FUNCTION - REQUIRED BY code-generation.js ***
export async function routeCodeGeneration(prompt, taskType, mode = 'site_monkeys') {
  console.log(`🎯 Routing code generation - Task: ${taskType}, Mode: ${mode}`);
  
  try {
    // Validate task type
    if (!TASK_TYPES[taskType]) {
      return {
        success: false,
        error: `Invalid task type: ${taskType}`,
        available_types: Object.keys(TASK_TYPES)
      };
    }

    const taskConfig = TASK_TYPES[taskType];
    console.log(`📋 Task config loaded - Threshold: ${taskConfig.validation_threshold}`);

    // Generate code based on task type
    const generatedCode = await generateCodeForTask(prompt, taskType, taskConfig);
    
    if (!generatedCode.success) {
      return {
        success: false,
        error: generatedCode.error,
        source_model: 'none'
      };
    }

    // Validate the generated code
    const validationResult = await validateCodeOutput(generatedCode.code, 'enhanced_router');
    
    console.log(`📊 Validation result - Score: ${validationResult.confidence_score}, Grade: ${validationResult.grade}`);

    // Check if meets validation threshold
    const meetsThreshold = validationResult.confidence_score >= taskConfig.validation_threshold;
    
    if (!meetsThreshold) {
      console.warn(`⚠️ Code generation failed validation threshold: ${validationResult.confidence_score} < ${taskConfig.validation_threshold}`);
      return {
        success: false,
        error: 'Generated code failed validation threshold',
        confidence_score: validationResult.confidence_score,
        enforcement_grade: validationResult.grade,
        violations: validationResult.violations,
        source_model: generatedCode.source_model
      };
    }

    // Return successful result
    return {
      success: true,
      validated_output: validationResult.cleaned_output,
      confidence_score: validationResult.confidence_score,
      enforcement_grade: validationResult.grade,
      violations: validationResult.violations,
      source_model: generatedCode.source_model,
      metadata: {
        task_type: taskType,
        validation_threshold: taskConfig.validation_threshold,
        model_metadata: generatedCode.metadata || {},
        execution_log: [
          `Task type: ${taskType}`,
          `Validation score: ${validationResult.confidence_score}`,
          `Grade: ${validationResult.grade}`,
          `Violations: ${validationResult.violations.length}`
        ]
      }
    };

  } catch (error) {
    console.error('❌ Code generation routing error:', error);
    return {
      success: false,
      error: `Routing error: ${error.message}`,
      source_model: 'error'
    };
  }
}

// *** GET AVAILABLE TASK TYPES - REQUIRED BY code-generation.js ***
export function getAvailableTaskTypes() {
  return Object.keys(TASK_TYPES).map(key => ({
    type: key,
    description: TASK_TYPES[key].description,
    validation_threshold: TASK_TYPES[key].validation_threshold,
    max_tokens: TASK_TYPES[key].max_tokens,
    requires_review: TASK_TYPES[key].requires_review
  }));
}

// *** GET VALIDATION THRESHOLD - REQUIRED BY code-generation.js ***
export function getValidationThreshold(taskType) {
  return TASK_TYPES[taskType]?.validation_threshold || 0.7;
}

// *** CODE GENERATION ENGINE ***
async function generateCodeForTask(prompt, taskType, taskConfig) {
  console.log(`🔧 Generating code for task: ${taskType}`);
  
  try {
    // Enhanced prompt with task-specific context
    const enhancedPrompt = buildTaskSpecificPrompt(prompt, taskType, taskConfig);
    
    // Determine best model for task
    const modelChoice = selectModelForTask(taskType, taskConfig);
    
    // Generate code using selected approach
    let generatedCode;
    if (modelChoice === 'template') {
      generatedCode = generateFromTemplate(prompt, taskType);
    } else if (modelChoice === 'hardcoded') {
      generatedCode = generateHardcodedResponse(prompt, taskType);
    } else {
      // Could integrate with AI models here in the future
      generatedCode = generateHardcodedResponse(prompt, taskType);
    }

    return {
      success: true,
      code: generatedCode,
      source_model: modelChoice,
      metadata: {
        task_type: taskType,
        generation_method: modelChoice,
        prompt_length: prompt.length,
        generated_at: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Code generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// *** TASK-SPECIFIC PROMPT BUILDER ***
function buildTaskSpecificPrompt(prompt, taskType, taskConfig) {
  let enhancedPrompt = `Task Type: ${taskType}\n`;
  enhancedPrompt += `Description: ${taskConfig.description}\n`;
  enhancedPrompt += `Validation Threshold: ${taskConfig.validation_threshold}\n`;
  enhancedPrompt += `Max Tokens: ${taskConfig.max_tokens}\n\n`;
  enhancedPrompt += `Requirements:\n`;
  enhancedPrompt += `- Code must be production-ready\n`;
  enhancedPrompt += `- Include proper error handling\n`;
  enhancedPrompt += `- Add comprehensive comments\n`;
  enhancedPrompt += `- Follow best practices\n\n`;
  enhancedPrompt += `Original Request: ${prompt}`;
  
  return enhancedPrompt;
}

// *** MODEL SELECTION ***
function selectModelForTask(taskType, taskConfig) {
  // For now, use hardcoded/template approach
  // In the future, this could route to different AI models
  if (taskType === 'boilerplate' || taskType === 'test_stub') {
    return 'template';
  }
  return 'hardcoded';
}

// *** TEMPLATE-BASED GENERATION ***
function generateFromTemplate(prompt, taskType) {
  const templates = {
    'test_stub': `
// Test stub for: ${prompt}
describe('${extractFunctionName(prompt)}', () => {
  test('should handle valid input', () => {
    // TODO: Implement test logic
    expect(true).toBe(true);
  });

  test('should handle edge cases', () => {
    // TODO: Implement edge case tests
    expect(true).toBe(true);
  });

  test('should handle error conditions', () => {
    // TODO: Implement error handling tests
    expect(true).toBe(true);
  });
});
`,
    'boilerplate': `
// Boilerplate for: ${prompt}
/**
 * ${extractFunctionName(prompt)}
 * @description TODO: Add description
 * @param {any} input - TODO: Define input parameters
 * @returns {any} TODO: Define return type
 */
function ${extractFunctionName(prompt)}(input) {
  try {
    // TODO: Implement function logic
    return input;
  } catch (error) {
    console.error('Error in ${extractFunctionName(prompt)}:', error);
    throw error;
  }
}

export default ${extractFunctionName(prompt)};
`
  };

  return templates[taskType] || templates['boilerplate'];
}

// *** HARDCODED RESPONSE GENERATION ***
function generateHardcodedResponse(prompt, taskType) {
  const lowerPrompt = prompt.toLowerCase();
  
  // API endpoint patterns
  if (lowerPrompt.includes('api') && lowerPrompt.includes('endpoint')) {
    return `
// API Endpoint for: ${prompt}
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // TODO: Implement endpoint logic based on: ${prompt}
    const result = { message: 'Endpoint implementation needed' };
    
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
`;
  }

  // Function patterns
  if (lowerPrompt.includes('function') || lowerPrompt.includes('method')) {
    const functionName = extractFunctionName(prompt);
    return `
/**
 * ${functionName}
 * @description Implementation for: ${prompt}
 * @param {any} input - Input parameter
 * @returns {any} Function result
 */
function ${functionName}(input) {
  try {
    // TODO: Implement logic for: ${prompt}
    console.log('Processing:', input);
    
    // Validation
    if (!input) {
      throw new Error('Input is required');
    }
    
    // Main logic
    const result = processInput(input);
    
    return result;
  } catch (error) {
    console.error('Error in ${functionName}:', error);
    throw error;
  }
}

function processInput(input) {
  // TODO: Implement actual processing logic
  return input;
}

export default ${functionName};
`;
  }

  // Component patterns  
  if (lowerPrompt.includes('component') || lowerPrompt.includes('react')) {
    const componentName = extractComponentName(prompt);
    return `
import React, { useState, useEffect } from 'react';

/**
 * ${componentName}
 * @description React component for: ${prompt}
 */
const ${componentName} = ({ ...props }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Implement component logic for: ${prompt}
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: Implement data loading
      setData({ message: 'Data loaded' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="${componentName.toLowerCase()}">
      <h2>${componentName}</h2>
      {/* TODO: Implement component UI for: ${prompt} */}
      <p>Component implementation needed</p>
    </div>
  );
};

export default ${componentName};
`;
  }

  // Default response
  return `
// Generated code for: ${prompt}
/**
 * Implementation for user request: ${prompt}
 * Task Type: ${taskType}
 * Generated at: ${new Date().toISOString()}
 */

console.log('TODO: Implement code for:', '${prompt}');

// TODO: Add your implementation here
// This is a placeholder that needs to be completed

export default function implementation() {
  // TODO: Implement based on request: ${prompt}
  return {
    status: 'pending_implementation',
    request: '${prompt}',
    taskType: '${taskType}'
  };
}
`;
}

// *** UTILITY FUNCTIONS ***
function extractFunctionName(prompt) {
  // Extract function name from prompt
  const match = prompt.match(/function\s+(\w+)|(\w+)\s+function|create\s+(\w+)|(\w+)\s*\(/);
  if (match) {
    return match[1] || match[2] || match[3] || match[4];
  }
  
  // Generate from keywords
  const words = prompt.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word));
  const name = words.slice(0, 2).join('');
  return name.charAt(0).toLowerCase() + name.slice(1) || 'generatedFunction';
}

function extractComponentName(prompt) {
  // Extract component name from prompt
  const match = prompt.match(/component\s+(\w+)|(\w+)\s+component|create\s+(\w+)|(\w+)\s*component/i);
  if (match) {
    const name = match[1] || match[2] || match[3] || match[4];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  // Generate from keywords
  const words = prompt.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word));
  const name = words.slice(0, 2).join('');
  return (name.charAt(0).toUpperCase() + name.slice(1)) || 'GeneratedComponent';
}

// *** CORE VALIDATION ENGINE ***
export async function validateCodeOutput(rawOutput, sourceModel = 'unknown') {
  const validation = {
    passed: false,
    violations: [],
    confidence_score: 0,
    grade: 'F',
    cleaned_output: '',
    metadata: {
      source_model: sourceModel,
      validation_timestamp: new Date().toISOString(),
      enforcement_version: '1.0.0'
    }
  };

  try {
    // Parse input - handle both string and object formats
    let codeContent, metadata;
    
    if (typeof rawOutput === 'string') {
      const parsed = parseCodeAndMetadata(rawOutput);
      codeContent = parsed.code;
      metadata = parsed.metadata;
    } else if (rawOutput && typeof rawOutput === 'object') {
      codeContent = rawOutput.code || rawOutput.content || rawOutput.output || '';
      metadata = rawOutput.metadata || {};
    } else {
      validation.violations.push('CRITICAL: Invalid input format - expected string or object');
      return validation;
    }

    if (!codeContent || codeContent.trim().length === 0) {
      validation.violations.push('CRITICAL: No code content provided');
      return validation;
    }

    // *** VALIDATION PIPELINE ***
    
    // 1. Confidence Score Validation
    const confidenceResult = validateConfidenceScore(metadata, rawOutput);
    if (!confidenceResult.valid) {
      validation.violations.push(...confidenceResult.violations);
    } else {
      validation.confidence_score = confidenceResult.score;
    }

    // 2. Metadata Block Validation
    const metadataResult = validateMetadata(metadata);
    validation.violations.push(...metadataResult.violations);

    // 3. Test Stub Detection
    const testResult = validateTestStubs(codeContent);
    if (!testResult.valid) {
      validation.violations.push(...testResult.violations);
    }

    // 4. Static Analysis (ESLint-style)
    const staticResult = performStaticAnalysis(codeContent);
    validation.violations.push(...staticResult.violations);

    // 5. License and Dependency Safety
    const licenseResult = await validateDependencySafety(metadata.dependencies || []);
    validation.violations.push(...licenseResult.violations);

    // 6. Drift Safety Analysis
    const driftResult = validateDriftSafety(codeContent);
    validation.violations.push(...driftResult.violations);

    // *** FINAL SCORING AND GRADING ***
    const score = calculateValidationScore(validation.violations, validation.confidence_score);
    validation.grade = assignGrade(score);
    validation.passed = score >= 70 && validation.violations.filter(v => v.includes('CRITICAL')).length === 0;

    // *** CODE CLEANING ***
    validation.cleaned_output = cleanCodeOutput(codeContent, validation.violations);

    // *** METADATA ENHANCEMENT ***
    validation.metadata.violations_count = validation.violations.length;
    validation.metadata.critical_violations = validation.violations.filter(v => v.includes('CRITICAL')).length;
    validation.metadata.validation_score = score;

  } catch (error) {
    validation.violations.push(`CRITICAL: Validation engine error - ${error.message}`);
    validation.metadata.validation_error = error.message;
  }

  return validation;
}

// *** CONFIDENCE SCORE VALIDATOR ***
function validateConfidenceScore(metadata, rawOutput) {
  const result = { valid: false, score: 0, violations: [] };

  // Check for confidence in metadata
  let confidence = metadata.confidence || metadata.confidence_score;
  
  // Check for confidence in raw output if object
  if (!confidence && typeof rawOutput === 'object') {
    confidence = rawOutput.confidence || rawOutput.confidence_score;
  }

  // Check for confidence in string content
  if (!confidence && typeof rawOutput === 'string') {
    const confidenceMatch = rawOutput.match(/confidence[:\s]+([0-9.]+)/i);
    if (confidenceMatch) {
      confidence = parseFloat(confidenceMatch[1]);
    }
  }

  if (confidence === undefined || confidence === null) {
    result.violations.push('CRITICAL: Missing confidence score in metadata or output');
    return result;
  }

  const numericConfidence = parseFloat(confidence);
  
  if (isNaN(numericConfidence)) {
    result.violations.push('CRITICAL: Confidence score is not numeric');
    return result;
  }

  if (numericConfidence < 0.0 || numericConfidence > 1.0) {
    result.violations.push('CRITICAL: Confidence score must be between 0.0 and 1.0');
    return result;
  }

  // Flag suspiciously round numbers (likely hardcoded)
  if ([0.5, 0.7, 0.8, 0.9, 1.0].includes(numericConfidence)) {
    result.violations.push('WARNING: Confidence score appears hardcoded (suspiciously round)');
  }

  result.valid = true;
  result.score = numericConfidence;
  return result;
}

// *** METADATA VALIDATOR ***
function validateMetadata(metadata) {
  const violations = [];

  if (!metadata || typeof metadata !== 'object') {
    violations.push('CRITICAL: Missing or invalid metadata object');
    return { violations };
  }

  // Check required fields
  for (const field of REQUIRED_METADATA_FIELDS) {
    if (!metadata[field]) {
      violations.push(`CRITICAL: Missing required metadata field: ${field}`);
    } else if (typeof metadata[field] === 'string' && metadata[field].trim().length === 0) {
      violations.push(`CRITICAL: Empty metadata field: ${field}`);
    }
  }

  // Validate dependencies format
  if (metadata.dependencies) {
    if (!Array.isArray(metadata.dependencies)) {
      violations.push('WARNING: Dependencies should be an array');
    } else {
      for (const dep of metadata.dependencies) {
        if (typeof dep !== 'string' || !/^[a-zA-Z0-9@/_-]+$/.test(dep)) {
          violations.push(`WARNING: Invalid dependency name format: ${dep}`);
        }
      }
    }
  }

  // Check for generic placeholders in assumptions
  if (metadata.assumptions && typeof metadata.assumptions === 'string') {
    for (const placeholder of GENERIC_PLACEHOLDERS) {
      if (metadata.assumptions.toLowerCase().includes(placeholder.toLowerCase())) {
        violations.push(`WARNING: Generic placeholder detected in assumptions: ${placeholder}`);
      }
    }
  }

  return { violations };
}

// *** TEST STUB VALIDATOR ***
function validateTestStubs(codeContent) {
  const result = { valid: false, violations: [] };

  // Look for test framework patterns
  const testPatterns = [
    /describe\s*\(\s*['"`][^'"`]+['"`]\s*,\s*function/g,
    /it\s*\(\s*['"`][^'"`]+['"`]\s*,\s*function/g,
    /test\s*\(\s*['"`][^'"`]+['"`]\s*,\s*function/g,
    /expect\s*\([^)]+\)\s*\./g
  ];

  let testCount = 0;
  for (const pattern of testPatterns) {
    const matches = codeContent.match(pattern);
    if (matches) {
      testCount += matches.length;
    }
  }

  if (testCount === 0) {
    result.violations.push('WARNING: No test stubs detected (test(), describe(), it(), expect())');
  } else {
    result.valid = true;
  }

  // Check for comment-only tests
  const commentOnlyTests = codeContent.match(/\/\/\s*(test|describe|it):/gi);
  if (commentOnlyTests && commentOnlyTests.length > 0) {
    result.violations.push('WARNING: Comment-only tests detected - need functional test stubs');
  }

  return result;
}

// *** STATIC ANALYSIS ENGINE ***
function performStaticAnalysis(codeContent) {
  const violations = [];

  // ESLint-style rule checking
  for (const [rule, pattern] of Object.entries(ESLINT_VIOLATIONS)) {
    const matches = codeContent.match(pattern);
    if (matches) {
      matches.forEach(match => {
        violations.push(`STATIC: ${rule} violation - ${match.trim()}`);
      });
    }
  }

  // AST-based analysis (basic)
  try {
    const ast = parse(codeContent, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: ['jsx', 'typescript']
    });

    traverse(ast, {
      CatchClause(path) {
        if (path.node.body.body.length === 0) {
          violations.push('STATIC: Empty catch block detected');
        }
      },
      
      VariableDeclarator(path) {
        const name = path.node.id.name;
        if (name && name.length === 1 && !['i', 'j', 'k', 'x', 'y', 'z'].includes(name)) {
          violations.push(`STATIC: Potentially unclear variable name: ${name}`);
        }
      },
      
      CallExpression(path) {
        if (path.node.callee.name === 'eval') {
          violations.push('CRITICAL: eval() usage detected - security risk');
        }
      }
    });

  } catch (parseError) {
    violations.push(`STATIC: Code parsing failed - ${parseError.message}`);
  }

  return { violations };
}

// *** DEPENDENCY SAFETY VALIDATOR ***
async function validateDependencySafety(dependencies) {
  const violations = [];

  if (!Array.isArray(dependencies)) {
    return { violations: ['WARNING: Dependencies not provided as array'] };
  }

  for (const dep of dependencies) {
    // Basic license check (simplified - in production would query npm registry)
    const depName = dep.split('@')[0]; // Remove version specifier
    
    // Check against known blocked packages
    const blockedPackages = ['malicious-package', 'backdoor-lib', 'crypto-miner'];
    if (blockedPackages.includes(depName)) {
      violations.push(`CRITICAL: Blocked dependency detected: ${dep}`);
    }

    // Check for suspicious patterns
    if (depName.includes('exec') || depName.includes('shell') || depName.includes('command')) {
      violations.push(`WARNING: Potentially risky dependency name: ${dep}`);
    }

    // Basic format validation
    if (!/^[a-zA-Z0-9@/_-]+$/.test(dep)) {
      violations.push(`WARNING: Invalid dependency format: ${dep}`);
    }
  }

  return { violations };
}

// *** DRIFT SAFETY VALIDATOR ***
function validateDriftSafety(codeContent) {
  const violations = [];

  // Check for ESLint disables
  const eslintDisables = codeContent.match(/\/\*\s*eslint-disable.*?\*\/|\/\/\s*eslint-disable/g);
  if (eslintDisables) {
    violations.push(`DRIFT: ESLint suppression detected - ${eslintDisables.length} instance(s)`);
  }

  // Check for missing error handling in try/catch
  const tryBlocks = codeContent.match(/try\s*{[^}]*}/g);
  const catchBlocks = codeContent.match(/catch\s*\([^)]*\)\s*{[^}]*}/g);
  
  if (tryBlocks && tryBlocks.length > 0) {
    if (!catchBlocks || catchBlocks.length < tryBlocks.length) {
      violations.push('DRIFT: Try blocks without corresponding catch blocks');
    } else {
      // Check if catch blocks are substantive
      const emptyCatchCount = catchBlocks.filter(block => 
        block.replace(/catch\s*\([^)]*\)\s*{/, '').replace('}', '').trim().length < 10
      ).length;
      
      if (emptyCatchCount > 0) {
        violations.push(`DRIFT: ${emptyCatchCount} catch block(s) appear to lack proper error handling`);
      }
    }
  }

  // Check for TODO/FIXME comments
  const todoComments = codeContent.match(/\/\/\s*(TODO|FIXME|XXX|HACK)/gi);
  if (todoComments && todoComments.length > 2) {
    violations.push(`DRIFT: Excessive TODO/FIXME comments (${todoComments.length}) - code may be incomplete`);
  }

  return { violations };
}

// *** UTILITY FUNCTIONS ***
function parseCodeAndMetadata(input) {
  const metadataMatch = input.match(/\/\*\s*METADATA:\s*(.*?)\s*\*\//s);
  let metadata = {};
  
  if (metadataMatch) {
    try {
      metadata = JSON.parse(metadataMatch[1]);
    } catch (e) {
      // Metadata parsing failed, continue with empty metadata
    }
  }

  // Extract code (remove metadata block if present)
  const code = input.replace(/\/\*\s*METADATA:.*?\*\//s, '').trim();
  
  return { code, metadata };
}

function calculateValidationScore(violations, confidenceScore) {
  let score = 100;
  
  const criticalCount = violations.filter(v => v.includes('CRITICAL')).length;
  const warningCount = violations.filter(v => v.includes('WARNING')).length;
  const staticCount = violations.filter(v => v.includes('STATIC')).length;
  const driftCount = violations.filter(v => v.includes('DRIFT')).length;

  // Scoring penalties
  score -= criticalCount * 25;  // Critical issues are severe
  score -= warningCount * 10;   // Warnings are moderate
  score -= staticCount * 5;     // Static issues are minor
  score -= driftCount * 15;     // Drift issues are concerning

  // Confidence score influence
  score = score * (0.3 + (confidenceScore * 0.7)); // Blend base score with confidence

  return Math.max(0, Math.min(100, score));
}

function assignGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'F';
}

function cleanCodeOutput(codeContent, violations) {
  let cleaned = codeContent;

  // Remove console.log statements if flagged
  if (violations.some(v => v.includes('console.log'))) {
    cleaned = cleaned.replace(/console\.log\s*\([^)]*\);?\s*/g, '');
  }

  // Remove ESLint disable comments if flagged
  if (violations.some(v => v.includes('ESLint suppression'))) {
    cleaned = cleaned.replace(/\/\*\s*eslint-disable.*?\*\/|\/\/\s*eslint-disable[^\n]*/g, '');
  }

  // Normalize whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

// *** BATCH VALIDATION ***
export async function validateCodeOutputBatch(outputs, sourceModel = 'unknown') {
  const results = [];
  
  for (const [index, output] of outputs.entries()) {
    const result = await validateCodeOutput(output, sourceModel);
    result.metadata.batch_index = index;
    results.push(result);
  }

  const summary = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    average_score: results.reduce((sum, r) => sum + (r.metadata.validation_score || 0), 0) / results.length,
    critical_failures: results.filter(r => r.violations.some(v => v.includes('CRITICAL'))).length
  };

  return { results, summary };
}
