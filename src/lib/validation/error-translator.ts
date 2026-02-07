/**
 * Error Translator
 *
 * Analyzes technical error messages and translates them to user-friendly codes.
 * Uses pattern matching to classify errors.
 */

import type { ErrorCode, UserMessage } from "./user-messages";
import { getUserMessage } from "./user-messages";

export interface TranslatedError {
  code: ErrorCode;
  originalMessage: string;
  userMessage: UserMessage;
  technicalDetails?: string;
  fixable: boolean;
  fixType?: "auto" | "ai" | "manual";
}

/**
 * Error patterns for classification
 */
const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  code: ErrorCode;
  fixable: boolean;
  fixType?: "auto" | "ai" | "manual";
}> = [
  // Syntax errors
  {
    pattern: /unexpected token|parsing error|unterminated|invalid syntax/i,
    code: "SYNTAX_ERROR",
    fixable: true,
    fixType: "ai",
  },
  {
    pattern: /unexpected end of|missing[^a-z]*\)|missing[^a-z]*\}/i,
    code: "SYNTAX_ERROR",
    fixable: true,
    fixType: "ai",
  },

  // Missing App component
  {
    pattern: /app.*not found|cannot find.*app|app.*undefined|composant.*non trouve/i,
    code: "MISSING_APP",
    fixable: true,
    fixType: "ai",
  },
  {
    pattern: /export.*app|default.*export/i,
    code: "MISSING_APP",
    fixable: true,
    fixType: "ai",
  },

  // Missing imports/modules
  {
    pattern: /module not found|cannot find module|cannot resolve/i,
    code: "MISSING_IMPORT",
    fixable: true,
    fixType: "auto",
  },
  {
    pattern: /is not defined|is not a function/i,
    code: "MISSING_IMPORT",
    fixable: true,
    fixType: "auto",
  },

  // Hook errors
  {
    pattern: /invalid hook|hooks can only|rules of hooks/i,
    code: "HOOK_ERROR",
    fixable: true,
    fixType: "ai",
  },
  {
    pattern: /usestate|useeffect|useref|usecallback.*error/i,
    code: "HOOK_ERROR",
    fixable: true,
    fixType: "ai",
  },

  // JSX errors
  {
    pattern: /adjacent jsx|must be wrapped/i,
    code: "JSX_ERROR",
    fixable: true,
    fixType: "auto",
  },
  {
    pattern: /jsx|jsx element/i,
    code: "JSX_ERROR",
    fixable: true,
    fixType: "ai",
  },
  {
    pattern: /expected.*>|unterminated jsx|expected.*but found/i,
    code: "JSX_ERROR",
    fixable: true,
    fixType: "ai",
  },

  // Build failures
  {
    pattern: /build failed|compilation failed|failed to compile/i,
    code: "BUILD_FAILED",
    fixable: false,
    fixType: "manual",
  },

  // Sandbox/infrastructure errors
  {
    pattern: /unauthorized|authentication|credentials|api key/i,
    code: "SANDBOX_UNAVAILABLE",
    fixable: true,
    fixType: "auto",
  },
  {
    pattern: /sandbox.*failed|e2b.*error|vercel.*error/i,
    code: "SANDBOX_UNAVAILABLE",
    fixable: true,
    fixType: "auto",
  },

  // Timeout
  {
    pattern: /timeout|timed out|took too long/i,
    code: "TIMEOUT",
    fixable: true,
    fixType: "auto",
  },
];

/**
 * Translate a technical error message to a user-friendly format
 */
export function translateError(errorMessage: string): TranslatedError {
  const normalizedMessage = errorMessage.toLowerCase();

  for (const { pattern, code, fixable, fixType } of ERROR_PATTERNS) {
    if (pattern.test(normalizedMessage)) {
      return {
        code,
        originalMessage: errorMessage,
        userMessage: getUserMessage(code),
        technicalDetails: errorMessage,
        fixable,
        fixType,
      };
    }
  }

  // Default to unknown
  return {
    code: "UNKNOWN",
    originalMessage: errorMessage,
    userMessage: getUserMessage("UNKNOWN"),
    technicalDetails: errorMessage,
    fixable: false,
    fixType: "manual",
  };
}

/**
 * Translate multiple errors and prioritize them
 */
export function translateErrors(errorMessages: string[]): TranslatedError[] {
  const translated = errorMessages.map(translateError);

  // Sort by priority: fixable first, then by severity
  const priorityOrder: ErrorCode[] = [
    "MISSING_IMPORT",
    "SYNTAX_ERROR",
    "JSX_ERROR",
    "MISSING_APP",
    "HOOK_ERROR",
    "SANDBOX_UNAVAILABLE",
    "TIMEOUT",
    "BUILD_FAILED",
    "UNKNOWN",
  ];

  return translated.sort((a, b) => {
    // Fixable errors first
    if (a.fixable !== b.fixable) {
      return a.fixable ? -1 : 1;
    }
    // Then by priority order
    return priorityOrder.indexOf(a.code) - priorityOrder.indexOf(b.code);
  });
}

/**
 * Get a summary message for multiple errors
 */
export function getErrorSummary(errors: TranslatedError[]): {
  mainMessage: string;
  canAutoFix: boolean;
  fixableCount: number;
  totalCount: number;
} {
  const fixableCount = errors.filter((e) => e.fixable).length;
  const totalCount = errors.length;
  const canAutoFix = fixableCount > 0;

  let mainMessage: string;

  if (totalCount === 0) {
    mainMessage = "Aucun probleme detecte!";
  } else if (canAutoFix && fixableCount === totalCount) {
    mainMessage =
      totalCount === 1
        ? "Un petit ajustement necessaire..."
        : `${totalCount} optimisations en cours...`;
  } else if (canAutoFix) {
    mainMessage = `${fixableCount} probleme(s) corrigeable(s) sur ${totalCount}`;
  } else {
    mainMessage = errors[0]?.userMessage.title || "Verification en cours...";
  }

  return {
    mainMessage,
    canAutoFix,
    fixableCount,
    totalCount,
  };
}

/**
 * Check if errors indicate the code can still be shown to user
 * (even if sandbox failed, we can show client-side preview)
 */
export function canShowPreviewDespiteErrors(errors: TranslatedError[]): boolean {
  // If all errors are sandbox-related, we can still show preview
  const nonSandboxErrors = errors.filter(
    (e) => e.code !== "SANDBOX_UNAVAILABLE" && e.code !== "TIMEOUT"
  );
  return nonSandboxErrors.length === 0;
}
