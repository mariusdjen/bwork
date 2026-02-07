/**
 * Error Classifier
 *
 * Classifies errors into categories to determine repair strategy.
 */

import type { ErrorCategory, ClassifiedError } from "@/types/sandbox";

/**
 * Error classification result
 */
export interface ClassificationResult {
  type: ErrorCategory;
  fixable: "auto" | "ai" | "user";
  confidence: number;
  suggestedFix?: string;
}

/**
 * Classification patterns for different error types
 */
const CLASSIFICATION_PATTERNS: Array<{
  pattern: RegExp;
  type: ErrorCategory;
  fixable: "auto" | "ai" | "user";
  extractFix?: (match: RegExpMatchArray) => string;
}> = [
  // Missing package errors
  {
    pattern: /Failed to resolve import ['"]([^'"]+)['"]/,
    type: "missing-package",
    fixable: "auto",
    extractFix: (match) => `npm install ${match[1].split("/")[0]}`,
  },
  {
    pattern: /Cannot find module ['"]([^'"]+)['"]/,
    type: "missing-package",
    fixable: "auto",
    extractFix: (match) => `npm install ${match[1].split("/")[0]}`,
  },
  {
    pattern: /Module not found.*['"]([^'"]+)['"]/i,
    type: "missing-package",
    fixable: "auto",
    extractFix: (match) => `npm install ${match[1].split("/")[0]}`,
  },

  // Missing import errors
  {
    pattern: /'([^']+)' is not defined/,
    type: "missing-import",
    fixable: "auto",
    extractFix: (match) => `Add import for ${match[1]}`,
  },
  {
    pattern: /(\w+) is not defined/,
    type: "missing-import",
    fixable: "auto",
    extractFix: (match) => `Add import for ${match[1]}`,
  },
  {
    pattern: /'([^']+)' is not exported from/,
    type: "missing-import",
    fixable: "auto",
  },

  // Syntax errors - require AI repair
  {
    pattern: /SyntaxError/i,
    type: "syntax-error",
    fixable: "ai",
  },
  {
    pattern: /Unexpected token/i,
    type: "syntax-error",
    fixable: "ai",
  },
  {
    pattern: /Unterminated string/i,
    type: "syntax-error",
    fixable: "ai",
  },
  {
    pattern: /Missing.*semicolon/i,
    type: "syntax-error",
    fixable: "ai",
  },

  // Type errors - require AI repair
  {
    pattern: /TypeError/i,
    type: "type-error",
    fixable: "ai",
  },
  {
    pattern: /is not a function/,
    type: "type-error",
    fixable: "ai",
  },
  {
    pattern: /Cannot read propert/i,
    type: "type-error",
    fixable: "ai",
  },
  {
    pattern: /undefined is not an object/i,
    type: "type-error",
    fixable: "ai",
  },

  // Runtime errors - require AI repair
  {
    pattern: /ReferenceError/i,
    type: "runtime-error",
    fixable: "ai",
  },
  {
    pattern: /Maximum call stack/i,
    type: "runtime-error",
    fixable: "ai",
  },
  {
    pattern: /Out of memory/i,
    type: "runtime-error",
    fixable: "user",
  },

  // Timeout errors - retry
  {
    pattern: /timeout|ETIMEDOUT|ECONNREFUSED/i,
    type: "timeout",
    fixable: "user",
  },

  // Provider errors - retry with different provider
  {
    pattern: /sandbox.*failed|provider.*error/i,
    type: "provider-error",
    fixable: "user",
  },
];

/**
 * Common React/import fixes
 */
const COMMON_IMPORTS: Record<string, string> = {
  useState: "import { useState } from 'react';",
  useEffect: "import { useEffect } from 'react';",
  useRef: "import { useRef } from 'react';",
  useCallback: "import { useCallback } from 'react';",
  useMemo: "import { useMemo } from 'react';",
  useContext: "import { useContext } from 'react';",
  useReducer: "import { useReducer } from 'react';",
  React: "import React from 'react';",
  Fragment: "import { Fragment } from 'react';",
};

/**
 * Classify an error message
 */
export function classifyError(errorMessage: string): ClassificationResult {
  for (const { pattern, type, fixable, extractFix } of CLASSIFICATION_PATTERNS) {
    const match = errorMessage.match(pattern);
    if (match) {
      return {
        type,
        fixable,
        confidence: 0.9,
        suggestedFix: extractFix ? extractFix(match) : undefined,
      };
    }
  }

  // Default to unknown
  return {
    type: "unknown",
    fixable: "user",
    confidence: 0.5,
  };
}

/**
 * Classify multiple errors and aggregate
 */
export function classifyErrors(errors: string[]): ClassifiedError[] {
  return errors.map((error) => {
    const result = classifyError(error);
    return {
      type: result.type,
      message: error,
      fixable: result.fixable,
      suggestion: result.suggestedFix,
    };
  });
}

/**
 * Get suggested import for missing identifier
 */
export function getSuggestedImport(identifier: string): string | null {
  return COMMON_IMPORTS[identifier] || null;
}

/**
 * Extract package name from import error
 */
export function extractPackageName(errorMessage: string): string | null {
  const patterns = [
    /Failed to resolve import ['"]([^'"]+)['"]/,
    /Cannot find module ['"]([^'"]+)['"]/,
    /Module not found.*['"]([^'"]+)['"]/i,
  ];

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern);
    if (match) {
      // Extract base package name (handle scoped packages)
      const importPath = match[1];
      if (importPath.startsWith("@")) {
        // Scoped package: @org/package
        const parts = importPath.split("/");
        return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : importPath;
      } else {
        // Regular package
        return importPath.split("/")[0];
      }
    }
  }

  return null;
}

/**
 * Determine if errors are auto-fixable
 */
export function canAutoFix(errors: ClassifiedError[]): boolean {
  return errors.some((e) => e.fixable === "auto");
}

/**
 * Determine if errors need AI repair
 */
export function needsAIRepair(errors: ClassifiedError[]): boolean {
  return errors.some((e) => e.fixable === "ai");
}

/**
 * Prioritize errors for fixing (auto-fix first, then AI, then user)
 */
export function prioritizeErrors(errors: ClassifiedError[]): ClassifiedError[] {
  return [...errors].sort((a, b) => {
    const priority = { auto: 0, ai: 1, user: 2 };
    return priority[a.fixable] - priority[b.fixable];
  });
}
