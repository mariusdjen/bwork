/**
 * Test Generator
 *
 * Generates basic smoke tests for generated components.
 * Uses Vitest with @testing-library/react.
 */

import type { TestValidationResult, ClassifiedError } from "@/types/sandbox";
import type { BaseSandboxProvider } from "../providers/base";

/**
 * Generate basic smoke tests for the App component
 */
export function generateSmokeTest(): string {
  return `import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App.jsx';

// Mock console.error to catch React errors
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('App', () => {
  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('does not log errors to console', () => {
    render(<App />);
    expect(console.error).not.toHaveBeenCalled();
  });
});
`;
}

/**
 * Generate Vitest configuration
 */
export function generateVitestConfig(): string {
  return `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
`;
}

/**
 * Setup test infrastructure in sandbox
 */
export async function setupTests(
  provider: BaseSandboxProvider
): Promise<void> {
  console.log("[TestGenerator] Setting up test infrastructure...");

  // Create test directory
  await provider.runCommand("mkdir -p src/__tests__");

  // Write smoke test
  const smokeTest = generateSmokeTest();
  await provider.writeFile("src/__tests__/App.test.jsx", smokeTest);

  // Install test dependencies if not already installed
  const packageJson = await provider.readFile("package.json");
  if (!packageJson.includes("vitest")) {
    console.log("[TestGenerator] Installing test dependencies...");
    await provider.installPackages([
      "vitest",
      "@testing-library/react",
      "@testing-library/jest-dom",
      "jsdom",
    ]);
  }

  console.log("[TestGenerator] Test infrastructure ready");
}

/**
 * Run tests and return results
 */
export async function runTests(
  provider: BaseSandboxProvider
): Promise<TestValidationResult> {
  const startTime = Date.now();
  const errors: ClassifiedError[] = [];

  try {
    console.log("[TestGenerator] Running tests...");

    // Ensure tests are set up
    await setupTests(provider);

    // Run vitest
    const result = await provider.runCommand("npm run test -- --run");

    const output = result.stdout + "\n" + result.stderr;
    const passed = result.success;

    // Parse test results
    const { total, pass, fail } = parseTestResults(output);

    // Extract error details if tests failed
    if (!passed) {
      const testErrors = parseTestErrors(output);
      errors.push(...testErrors);
    }

    return {
      passed,
      totalTests: total,
      passedTests: pass,
      failedTests: fail,
      errors,
      output,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      errors: [
        {
          type: "runtime-error",
          message: error instanceof Error ? error.message : "Test run failed",
          fixable: "ai",
        },
      ],
      output: error instanceof Error ? error.message : "Test run failed",
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Parse test results from Vitest output
 */
function parseTestResults(output: string): {
  total: number;
  pass: number;
  fail: number;
} {
  // Look for Vitest summary line
  const summaryMatch = output.match(
    /Tests\s+(\d+)\s+passed.*?(\d+)\s+failed.*?(\d+)\s+total/i
  );
  if (summaryMatch) {
    return {
      pass: parseInt(summaryMatch[1], 10),
      fail: parseInt(summaryMatch[2], 10),
      total: parseInt(summaryMatch[3], 10),
    };
  }

  // Alternative pattern
  const passMatch = output.match(/(\d+)\s+passed/i);
  const failMatch = output.match(/(\d+)\s+failed/i);

  const pass = passMatch ? parseInt(passMatch[1], 10) : 0;
  const fail = failMatch ? parseInt(failMatch[1], 10) : 0;

  return { total: pass + fail, pass, fail };
}

/**
 * Parse test errors from Vitest output
 */
function parseTestErrors(output: string): ClassifiedError[] {
  const errors: ClassifiedError[] = [];

  // Look for FAIL blocks
  const failBlocks = output.split(/FAIL\s+/);

  for (const block of failBlocks.slice(1)) {
    // Extract file name
    const fileMatch = block.match(/^([^\s]+)/);
    const file = fileMatch ? fileMatch[1] : undefined;

    // Extract error message
    const errorMatch = block.match(/Error:\s*(.+)/);
    const message = errorMatch ? errorMatch[1] : "Test failed";

    errors.push({
      type: "runtime-error",
      message,
      file,
      fixable: "ai",
    });
  }

  return errors;
}

/**
 * Skip tests if component is too simple
 */
export function shouldSkipTests(code: string): boolean {
  // Skip if very simple component (just returns JSX)
  const lines = code.split("\n").filter((l) => l.trim()).length;
  return lines < 10;
}
