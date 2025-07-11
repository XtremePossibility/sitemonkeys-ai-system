// CODE OUTPUT VALIDATION - Site Monkeys Standards
// Validates generated code for quality, security, and compliance

import { parse } from '@babel/parser';
import { default as traverse } from '@babel/traverse';

/**
 * VALIDATE CODE OUTPUT FOR QUALITY AND SECURITY
 */
export function validateCodeOutput(code, language = 'javascript') {
  const validation = {
    valid: true,
    issues: [],
    warnings: [],
    securityScore: 100,
    qualityScore: 100
  };

  try {
    // *** STEP 1: BASIC VALIDATION ***
    if (!code || typeof code !== 'string') {
      validation.valid = false;
      validation.issues.push('Code must be a non-empty string');
      return validation;
    }

    if (code.trim().length === 0) {
      validation.valid = false;
      validation.issues.push('Code cannot be empty');
      return validation;
    }

    // *** STEP 2: LANGUAGE-SPECIFIC VALIDATION ***
    if (language === 'javascript') {
      return validateJavaScriptCode(code, validation);
    }

    // *** STEP 3: FALLBACK FOR OTHER LANGUAGES ***
    return validateGenericCode(code, validation);

  } catch (error) {
    validation.valid = false;
    validation.issues.push(`Validation error: ${error.message}`);
    return validation;
  }
}

/**
 * VALIDATE JAVASCRIPT CODE SPECIFICALLY
 */
function validateJavaScriptCode(code, validation) {
  try {
    // *** STEP 1: SYNTAX VALIDATION ***
    let ast;
    try {
      ast = parse(code, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        allowAwaitOutsideFunction: true,
        plugins: ['jsx', 'typescript', 'decorators-legacy']
      });
    } catch (syntaxError) {
      validation.valid = false;
      validation.issues.push(`Syntax error: ${syntaxError.message}`);
      return validation;
    }

    // *** STEP 2: SECURITY ANALYSIS ***
    const securityIssues = analyzeSecurityVulnerabilities(code, ast);
    validation.issues.push(...securityIssues.critical);
    validation.warnings.push(...securityIssues.warnings);
    validation.securityScore = Math.max(0, 100 - (securityIssues.critical.length * 20) - (securityIssues.warnings.length * 5));

    // *** STEP 3: QUALITY ANALYSIS ***
    const qualityIssues = analyzeCodeQuality(code, ast);
    validation.warnings.push(...qualityIssues);
    validation.qualityScore = Math.max(0, 100 - (qualityIssues.length * 10));

    // *** STEP 4: SITE MONKEYS COMPLIANCE ***
    const complianceIssues = analyzeSiteMonkeysCompliance(code);
    validation.warnings.push(...complianceIssues);

    // Final validation status
    if (validation.issues.length > 0) {
      validation.valid = false;
    }

    return validation;

  } catch (error) {
    validation.valid = false;
    validation.issues.push(`JavaScript validation error: ${error.message}`);
    return validation;
  }
}

/**
 * ANALYZE SECURITY VULNERABILITIES
 */
function analyzeSecurityVulnerabilities(code, ast) {
  const issues = {
    critical: [],
    warnings: []
  };

  // *** CHECK FOR DANGEROUS PATTERNS ***
  const dangerousPatterns = [
    { pattern: /eval\s*\(/gi, message: 'eval() usage detected - security risk' },
    { pattern: /Function\s*\(/gi, message: 'Function constructor usage - security risk' },
    { pattern: /document\.write/gi, message: 'document.write usage - XSS risk' },
    { pattern: /innerHTML\s*=/gi, message: 'innerHTML assignment - XSS risk' },
    { pattern: /outerHTML\s*=/gi, message: 'outerHTML assignment - XSS risk' }
  ];

  dangerousPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(code)) {
      issues.critical.push(message);
    }
  });

  // *** CHECK FOR SUSPICIOUS IMPORTS ***
  const suspiciousImports = [
    'child_process',
    'fs',
    'path',
    'os',
    'cluster'
  ];

  suspiciousImports.forEach(imp => {
    if (code.includes(`'${imp}'`) || code.includes(`"${imp}"`)) {
      issues.warnings.push(`Potentially dangerous import: ${imp}`);
    }
  });

  // *** AST TRAVERSAL FOR DEEP ANALYSIS ***
  if (ast && traverse) {
    traverse(ast, {
      CallExpression(path) {
        // Check for dangerous function calls
        if (path.node.callee.name === 'setTimeout' && path.node.arguments.length > 0) {
          const firstArg = path.node.arguments[0];
          if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            issues.warnings.push('setTimeout with string argument - potential code injection');
          }
        }
      }
    });
  }

  return issues;
}

/**
 * ANALYZE CODE QUALITY
 */
function analyzeCodeQuality(code, ast) {
  const issues = [];

  // *** CHECK FOR QUALITY INDICATORS ***
  if (!code.includes('export')) {
    issues.push('No exports found - consider exporting functions');
  }

  if (!code.includes('/**') && !code.includes('//')) {
    issues.push('No comments found - add documentation');
  }

  if (code.length > 5000) {
    issues.push('Code is very long - consider breaking into smaller functions');
  }

  const lines = code.split('\n');
  const longLines = lines.filter(line => line.length > 120);
  if (longLines.length > 0) {
    issues.push(`${longLines.length} lines exceed 120 characters`);
  }

  // *** CHECK FOR CONSOLE STATEMENTS ***
  if (code.includes('console.log') || code.includes('console.warn')) {
    issues.push('Console statements detected - remove for production');
  }

  return issues;
}

/**
 * ANALYZE SITE MONKEYS COMPLIANCE
 */
function analyzeSiteMonkeysCompliance(code) {
  const issues = [];

  // *** CHECK FOR PRICING COMPLIANCE ***
  const priceMatches = code.match(/\$?(\d+)/g);
  if (priceMatches) {
    const prices = priceMatches.map(match => parseInt(match.replace('$', '')));
    const lowPrices = prices.filter(price => price > 0 && price < 697);
    if (lowPrices.length > 0) {
      issues.push('Code contains prices below Site Monkeys minimum ($697)');
    }
  }

  // *** CHECK FOR QUALITY STANDARDS ***
  if (code.includes('TODO') || code.includes('FIXME')) {
    issues.push('Code contains TODO/FIXME comments - complete before deployment');
  }

  if (code.includes('hack') || code.includes('temporary')) {
    issues.push('Code contains temporary solutions - implement proper fix');
  }

  return issues;
}

/**
 * VALIDATE GENERIC CODE (NON-JAVASCRIPT)
 */
function validateGenericCode(code, validation) {
  // *** BASIC SECURITY CHECKS ***
  const securityPatterns = [
    { pattern: /<script/gi, message: 'Script tags detected' },
    { pattern: /javascript:/gi, message: 'JavaScript protocol detected' },
    { pattern: /on\w+\s*=/gi, message: 'Event handler attributes detected' }
  ];

  securityPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(code)) {
      validation.warnings.push(message);
    }
  });

  // *** QUALITY CHECKS ***
  const lines = code.split('\n');
  if (lines.length > 1000) {
    validation.warnings.push('Code is very long - consider breaking into smaller files');
  }

  return validation;
}

/**
 * GENERATE VALIDATION REPORT
 */
export function generateValidationReport(validationResult) {
  const report = {
    status: validationResult.valid ? 'PASS' : 'FAIL',
    summary: {
      issues: validationResult.issues.length,
      warnings: validationResult.warnings.length,
      securityScore: validationResult.securityScore,
      qualityScore: validationResult.qualityScore
    },
    details: {
      critical: validationResult.issues,
      warnings: validationResult.warnings
    },
    recommendation: generateRecommendation(validationResult)
  };

  return report;
}

function generateRecommendation(validationResult) {
  if (!validationResult.valid) {
    return 'REJECT - Critical issues must be resolved before deployment';
  }

  if (validationResult.securityScore < 80) {
    return 'REVIEW REQUIRED - Security concerns need attention';
  }

  if (validationResult.qualityScore < 70) {
    return 'IMPROVE - Code quality could be enhanced';
  }

  return 'APPROVED - Code meets Site Monkeys standards';
}
