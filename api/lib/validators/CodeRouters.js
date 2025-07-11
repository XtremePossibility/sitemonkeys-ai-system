// SITE MONKEYS AI - ZERO-FAILURE CODE OUTPUT VALIDATOR
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
