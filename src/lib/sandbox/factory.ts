/**
 * Sandbox Factory
 *
 * Creates sandbox providers based on configuration and availability.
 * Supports automatic fallback from E2B to Vercel.
 */

import type { SandboxProvider } from "@/types/sandbox";
import { BaseSandboxProvider } from "./providers/base";
import { E2BProvider } from "./providers/e2b-provider";
import { VercelProvider } from "./providers/vercel-provider";

/**
 * Check if E2B is configured
 */
export function isE2BConfigured(): boolean {
  return !!process.env.E2B_API_KEY;
}

/**
 * Check if Vercel Sandbox is configured
 */
export function isVercelConfigured(): boolean {
  // OIDC token method
  if (process.env.VERCEL_OIDC_TOKEN) {
    return true;
  }

  // Personal Access Token method
  if (
    process.env.VERCEL_TOKEN &&
    process.env.VERCEL_TEAM_ID &&
    process.env.VERCEL_PROJECT_ID
  ) {
    return true;
  }

  return false;
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): SandboxProvider[] {
  const providers: SandboxProvider[] = [];

  if (isE2BConfigured()) {
    providers.push("e2b");
  }

  if (isVercelConfigured()) {
    providers.push("vercel");
  }

  return providers;
}

/**
 * Create a sandbox provider based on configuration
 *
 * Provider selection logic:
 * 1. If SANDBOX_PROVIDER is set to a specific provider, use that
 * 2. If SANDBOX_PROVIDER is "auto" or not set:
 *    - Try E2B first if configured
 *    - Fall back to Vercel if E2B fails or is not configured
 * 3. Throw error if no providers are available
 *
 * @param preferredProvider - Optional preferred provider to use
 * @returns Initialized sandbox provider
 */
export async function createSandboxProvider(
  preferredProvider?: SandboxProvider
): Promise<BaseSandboxProvider> {
  const envProvider = process.env.SANDBOX_PROVIDER as
    | SandboxProvider
    | "auto"
    | undefined;
  const provider = preferredProvider || envProvider || "auto";

  console.log(`[SandboxFactory] Creating provider: ${provider}`);

  // Specific provider requested
  if (provider === "e2b") {
    if (!isE2BConfigured()) {
      throw new Error("E2B provider requested but E2B_API_KEY is not set");
    }
    return new E2BProvider();
  }

  if (provider === "vercel") {
    if (!isVercelConfigured()) {
      throw new Error(
        "Vercel provider requested but required environment variables are not set"
      );
    }
    return new VercelProvider();
  }

  // Auto selection with fallback
  if (provider === "auto") {
    // Try E2B first
    if (isE2BConfigured()) {
      console.log("[SandboxFactory] Using E2B provider (primary)");
      return new E2BProvider();
    }

    // Fall back to Vercel
    if (isVercelConfigured()) {
      console.log("[SandboxFactory] Using Vercel provider (fallback)");
      return new VercelProvider();
    }

    throw new Error(
      "No sandbox provider available. Configure E2B_API_KEY or Vercel credentials."
    );
  }

  throw new Error(`Unknown sandbox provider: ${provider}`);
}

/**
 * Create a sandbox provider with automatic fallback on failure
 *
 * If the primary provider fails to create a sandbox, automatically
 * tries the fallback provider.
 *
 * @returns Initialized sandbox provider with created sandbox
 */
export async function createSandboxWithFallback(): Promise<BaseSandboxProvider> {
  const providers = getAvailableProviders();

  if (providers.length === 0) {
    throw new Error(
      "No sandbox provider available. Configure E2B_API_KEY or Vercel credentials."
    );
  }

  // Try each provider in order
  let lastError: Error | null = null;

  for (const providerType of providers) {
    try {
      console.log(`[SandboxFactory] Trying provider: ${providerType}`);
      const provider = await createSandboxProvider(providerType);
      await provider.createSandbox();
      console.log(`[SandboxFactory] Successfully created sandbox with: ${providerType}`);
      return provider;
    } catch (error) {
      console.error(
        `[SandboxFactory] Failed to create sandbox with ${providerType}:`,
        error
      );
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error("Failed to create sandbox with any provider");
}
