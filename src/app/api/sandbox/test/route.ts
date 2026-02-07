/**
 * GET /api/sandbox/test
 *
 * Simple test endpoint to verify sandbox configuration.
 * Returns status of E2B and Vercel providers.
 */

import { NextResponse } from "next/server";
import { isE2BConfigured, isVercelConfigured, getAvailableProviders } from "@/lib/sandbox/factory";

export async function GET() {
  const e2bConfigured = isE2BConfigured();
  const vercelConfigured = isVercelConfigured();
  const availableProviders = getAvailableProviders();

  // Check environment variables (redacted)
  const config = {
    e2b: {
      configured: e2bConfigured,
      apiKeyPresent: !!process.env.E2B_API_KEY,
      apiKeyPrefix: process.env.E2B_API_KEY?.substring(0, 8) || null,
    },
    vercel: {
      configured: vercelConfigured,
      oidcTokenPresent: !!process.env.VERCEL_OIDC_TOKEN,
      tokenPresent: !!process.env.VERCEL_TOKEN,
      teamIdPresent: !!process.env.VERCEL_TEAM_ID,
      projectIdPresent: !!process.env.VERCEL_PROJECT_ID,
    },
    sandboxProvider: process.env.SANDBOX_PROVIDER || "auto",
    availableProviders,
  };

  return NextResponse.json({
    status: availableProviders.length > 0 ? "ok" : "no_providers",
    message:
      availableProviders.length > 0
        ? `Sandbox providers available: ${availableProviders.join(", ")}`
        : "No sandbox providers configured. Set E2B_API_KEY or Vercel credentials.",
    config,
  });
}
