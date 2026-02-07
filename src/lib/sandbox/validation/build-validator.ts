/**
 * Build Validator
 *
 * Validates that the generated code builds successfully.
 * Runs `npm run build` and parses errors.
 */

import type { BuildValidationResult, ClassifiedError } from "@/types/sandbox";
import type { BaseSandboxProvider } from "../providers/base";
import { classifyError } from "../repair/error-classifier";

/**
 * Validate that the sandbox project builds successfully
 */
export async function validateBuild(
  provider: BaseSandboxProvider
): Promise<BuildValidationResult> {
  const startTime = Date.now();

  try {
    console.log("[BuildValidator] Running npm run build...");
    const result = await provider.runCommand("npm run build");

    const errors: ClassifiedError[] = [];

    if (!result.success) {
      // Parse build errors
      const buildErrors = parseBuildErrors(result.stderr + "\n" + result.stdout);
      errors.push(...buildErrors);
    }

    return {
      passed: result.success && errors.length === 0,
      errors,
      output: result.stdout + "\n" + result.stderr,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      passed: false,
      errors: [
        {
          type: "build-error",
          message: error instanceof Error ? error.message : "Build failed",
          fixable: "user",
        },
      ],
      output: error instanceof Error ? error.message : "Build failed",
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Parse build errors from output
 */
function parseBuildErrors(output: string): ClassifiedError[] {
  const errors: ClassifiedError[] = [];
  const lines = output.split("\n");

  // Patterns for common Vite/React build errors
  const patterns = [
    // Module not found
    {
      regex: /Failed to resolve import ['"]([^'"]+)['"]/,
      extract: (match: RegExpMatchArray) => ({
        type: "missing-package" as const,
        message: `Module not found: ${match[1]}`,
        suggestion: `npm install ${match[1].split("/")[0]}`,
      }),
    },
    // Syntax error
    {
      regex: /SyntaxError: (.+)/,
      extract: (match: RegExpMatchArray) => ({
        type: "syntax-error" as const,
        message: `Syntax error: ${match[1]}`,
      }),
    },
    // Type error
    {
      regex: /TypeError: (.+)/,
      extract: (match: RegExpMatchArray) => ({
        type: "type-error" as const,
        message: `Type error: ${match[1]}`,
      }),
    },
    // Variable not defined
    {
      regex: /'([^']+)' is not defined/,
      extract: (match: RegExpMatchArray) => ({
        type: "missing-import" as const,
        message: `'${match[1]}' is not defined`,
        suggestion: `Add import for ${match[1]}`,
      }),
    },
    // File location with error
    {
      regex: /([^:\s]+\.(jsx?|tsx?)):(\d+):(\d+):\s*(.+)/,
      extract: (match: RegExpMatchArray) => ({
        type: classifyError(match[5]).type,
        message: match[5],
        file: match[1],
        line: parseInt(match[3], 10),
        column: parseInt(match[4], 10),
      }),
    },
    // Vite error format
    {
      regex: /\[vite\]\s*(.+)/,
      extract: (match: RegExpMatchArray) => ({
        type: classifyError(match[1]).type,
        message: match[1],
      }),
    },
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const extracted = pattern.extract(match);
        const classified = classifyError(extracted.message);

        errors.push({
          type: extracted.type || classified.type,
          message: extracted.message,
          file: "file" in extracted ? String(extracted.file) : undefined,
          line: "line" in extracted ? Number(extracted.line) : undefined,
          column: "column" in extracted ? Number(extracted.column) : undefined,
          fixable: classified.fixable,
          suggestion:
            "suggestion" in extracted ? String(extracted.suggestion) : undefined,
        });
        break; // Only match first pattern per line
      }
    }
  }

  // If no specific errors found but build failed, add generic error
  if (errors.length === 0 && output.includes("error")) {
    errors.push({
      type: "build-error",
      message: "Build failed with unknown error",
      fixable: "user",
    });
  }

  return errors;
}

/**
 * Quick check if build is likely to pass (without full build)
 * Checks for common syntax issues
 */
export async function quickBuildCheck(
  provider: BaseSandboxProvider
): Promise<{ likely: boolean; issues: string[] }> {
  const issues: string[] = [];

  try {
    // Check if App.jsx exists and is valid
    const appCode = await provider.readFile("src/App.jsx");

    // Check for common issues
    if (appCode.includes("...") && !appCode.includes("...props")) {
      // Ellipsis without spread - truncated code
      issues.push("Code appears to be truncated (contains ...)");
    }

    if (
      (appCode.match(/\{/g) || []).length !==
      (appCode.match(/\}/g) || []).length
    ) {
      issues.push("Mismatched braces");
    }

    if (
      (appCode.match(/\(/g) || []).length !==
      (appCode.match(/\)/g) || []).length
    ) {
      issues.push("Mismatched parentheses");
    }

    return {
      likely: issues.length === 0,
      issues,
    };
  } catch {
    return {
      likely: false,
      issues: ["Could not read App.jsx"],
    };
  }
}
