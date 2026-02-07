/**
 * Health Checker
 *
 * Validates that the Vite dev server is running and responding.
 */

import type { HealthCheckResult } from "@/types/sandbox";

/**
 * Check if the sandbox URL is responding
 */
export async function checkHealth(
  url: string,
  timeoutMs: number = 30000
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    console.log(`[HealthChecker] Checking ${url}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const passed = response.ok;

    console.log(
      `[HealthChecker] Status: ${response.status}, Time: ${responseTime}ms`
    );

    return {
      passed,
      url,
      statusCode: response.status,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error instanceof Error && error.name === "AbortError") {
      console.log(`[HealthChecker] Timeout after ${responseTime}ms`);
      return {
        passed: false,
        url,
        responseTime,
        error: `Timeout after ${timeoutMs}ms`,
      };
    }

    console.log(`[HealthChecker] Error: ${error}`);
    return {
      passed: false,
      url,
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Wait for the sandbox to become healthy with retries
 */
export async function waitForHealthy(
  url: string,
  maxAttempts: number = 10,
  intervalMs: number = 2000,
  timeoutMs: number = 10000
): Promise<HealthCheckResult> {
  console.log(
    `[HealthChecker] Waiting for ${url} to become healthy (max ${maxAttempts} attempts)...`
  );

  let lastResult: HealthCheckResult | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[HealthChecker] Attempt ${attempt}/${maxAttempts}...`);

    lastResult = await checkHealth(url, timeoutMs);

    if (lastResult.passed) {
      console.log(
        `[HealthChecker] Healthy after ${attempt} attempts (${lastResult.responseTime}ms)`
      );
      return lastResult;
    }

    // Wait before next attempt (except on last attempt)
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  console.log(`[HealthChecker] Not healthy after ${maxAttempts} attempts`);
  return (
    lastResult || {
      passed: false,
      url,
      error: "Health check failed",
    }
  );
}

/**
 * Check if the Vite error overlay is shown (indicates runtime error)
 */
export async function checkForViteErrors(
  url: string,
  timeoutMs: number = 10000
): Promise<{ hasErrors: boolean; errorMessage?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { hasErrors: true, errorMessage: `HTTP ${response.status}` };
    }

    const html = await response.text();

    // Check for Vite error overlay markers
    if (
      html.includes("vite-error-overlay") ||
      html.includes("pre class=\"message\"")
    ) {
      // Try to extract error message
      const errorMatch = html.match(
        /class="message"[^>]*>([^<]+)/
      );
      return {
        hasErrors: true,
        errorMessage: errorMatch ? errorMatch[1].trim() : "Vite error detected",
      };
    }

    return { hasErrors: false };
  } catch (error) {
    return {
      hasErrors: true,
      errorMessage: error instanceof Error ? error.message : "Failed to check",
    };
  }
}
