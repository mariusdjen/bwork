/**
 * POST /api/sandbox/smoke-test
 *
 * Tests the sandbox system by creating a minimal sandbox.
 * Use this to diagnose E2B/Vercel configuration issues.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSandboxWithFallback, getAvailableProviders } from "@/lib/sandbox/factory";

export const maxDuration = 60; // 1 minute max

export async function POST() {
  const startTime = Date.now();
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    results.userId = user.id;
    const availableProviders = getAvailableProviders();
    results.availableProviders = availableProviders;

    if (availableProviders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No sandbox providers configured",
          results,
        },
        { status: 503 }
      );
    }

    // Try to create a sandbox
    console.log("[SmokeTest] Creating sandbox...");
    results.step = "creating_sandbox";

    const provider = await createSandboxWithFallback();
    results.sandboxCreated = true;
    results.sandboxInfo = provider.getSandboxInfo();

    // Try to setup Vite
    console.log("[SmokeTest] Setting up Vite...");
    results.step = "setup_vite";

    await provider.setupViteApp();
    results.viteSetup = true;

    // Get sandbox URL
    const url = provider.getSandboxUrl();
    results.sandboxUrl = url;

    // Try to write a test file
    console.log("[SmokeTest] Writing test file...");
    results.step = "write_file";

    const testCode = `function App() {
  return (
    <div className="min-h-screen bg-green-500 flex items-center justify-center">
      <h1 className="text-white text-4xl font-bold">
        Smoke Test Passed! ✅
      </h1>
    </div>
  );
}

export default App;`;

    await provider.writeFile("src/App.jsx", testCode);
    results.fileWritten = true;

    // Calculate duration
    results.durationMs = Date.now() - startTime;
    results.step = "complete";

    console.log("[SmokeTest] Success!", results);

    // Keep sandbox alive for a bit so we can test it
    // It will auto-terminate based on E2B timeout

    return NextResponse.json({
      success: true,
      message: "Smoke test passed! Sandbox created successfully.",
      sandboxUrl: url,
      results,
    });
  } catch (error) {
    console.error("[SmokeTest] Error:", error);

    results.durationMs = Date.now() - startTime;
    results.error = error instanceof Error ? error.message : String(error);
    results.errorStack =
      error instanceof Error ? error.stack?.split("\n").slice(0, 5) : undefined;

    return NextResponse.json(
      {
        success: false,
        error: "Smoke test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        results,
      },
      { status: 500 }
    );
  }
}
