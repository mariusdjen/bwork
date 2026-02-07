/**
 * Pipeline Orchestrator
 *
 * Coordinates the entire generation pipeline:
 * 1. Provision sandbox
 * 2. Setup Vite app
 * 3. Apply generated code
 * 4. Install packages
 * 5. Validate (build + tests + health)
 * 6. Repair if needed (up to 3 retries)
 * 7. Return result
 */

import { createClient } from "@supabase/supabase-js";
import type {
  SandboxStatus,
  SandboxRecord,
  SandboxInsert,
  SandboxUpdate,
  SandboxErrorEntry,
  ValidationResult,
  RepairResult,
  PipelineResult,
  ClassifiedError,
} from "@/types/sandbox";
import { createSandboxWithFallback } from "./factory";
import type { BaseSandboxProvider } from "./providers/base";
import { validateBuild } from "./validation/build-validator";
import { checkHealth, waitForHealthy } from "./validation/health-checker";
import { runTests, shouldSkipTests } from "./validation/test-generator";
import { runAllAutoFixes } from "./repair/auto-fixer";
import { applyAIRepair, isAIRepairAvailable } from "./repair/ai-repairer";
import {
  canAutoFix,
  needsAIRepair,
  prioritizeErrors,
} from "./repair/error-classifier";
import { detectPackagesFromCode } from "./utils/package-detector";

/**
 * Create Supabase admin client for sandbox operations
 */
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Create a new sandbox record in the database
 */
async function createSandboxRecord(
  toolId: string,
  generationId: string,
  provider: "e2b" | "vercel"
): Promise<SandboxRecord> {
  const supabase = getSupabaseAdmin();

  const insert: SandboxInsert = {
    tool_id: toolId,
    generation_id: generationId,
    provider,
    status: "pending",
    max_retries: 3,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  };

  const { data, error } = await supabase
    .from("sandboxes")
    .insert(insert)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create sandbox record: ${error.message}`);
  }

  return data as SandboxRecord;
}

/**
 * Update sandbox status in database
 */
async function updateSandboxStatus(
  sandboxId: string,
  status: SandboxStatus,
  updates?: Partial<SandboxUpdate>
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("sandboxes")
    .update({
      status,
      ...updates,
    })
    .eq("id", sandboxId);

  if (error) {
    console.error(`[Orchestrator] Failed to update sandbox status: ${error.message}`);
  }
}

/**
 * Add error to sandbox history
 */
async function addErrorToHistory(
  sandboxId: string,
  error: ClassifiedError
): Promise<void> {
  const supabase = getSupabaseAdmin();

  // Get current history
  const { data: sandbox } = await supabase
    .from("sandboxes")
    .select("error_history")
    .eq("id", sandboxId)
    .single();

  const history: SandboxErrorEntry[] = (sandbox?.error_history as SandboxErrorEntry[]) || [];
  history.push({
    type: error.type,
    message: error.message,
    timestamp: new Date().toISOString(),
    category: error.type,
    fixable: error.fixable === "auto",
  });

  await supabase
    .from("sandboxes")
    .update({
      error_history: history,
      last_error: error.message,
    })
    .eq("id", sandboxId);
}

/**
 * Increment retry count
 */
async function incrementRetryCount(sandboxId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("sandboxes")
    .select("retry_count")
    .eq("id", sandboxId)
    .single();

  const newCount = (data?.retry_count || 0) + 1;

  await supabase
    .from("sandboxes")
    .update({ retry_count: newCount })
    .eq("id", sandboxId);

  return newCount;
}

/**
 * Run validation phase
 */
async function runValidation(
  provider: BaseSandboxProvider,
  sandboxId: string,
  code: string
): Promise<ValidationResult> {
  console.log("[Orchestrator] Running validation...");

  // Build validation
  const buildResult = await validateBuild(provider);

  // Health check
  const url = provider.getSandboxUrl();
  const healthResult = url
    ? await waitForHealthy(url, 5, 2000, 10000)
    : { passed: false, url: "", error: "No sandbox URL" };

  // Test validation (skip for simple components)
  let testResult = {
    passed: true,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: [] as ClassifiedError[],
    output: "Tests skipped",
    duration: 0,
  };

  if (!shouldSkipTests(code)) {
    testResult = await runTests(provider);
  }

  // Aggregate errors
  const allErrors = [
    ...buildResult.errors,
    ...testResult.errors,
  ];

  // Update sandbox with validation results
  await updateSandboxStatus(sandboxId, "validating", {
    build_passed: buildResult.passed,
    tests_passed: testResult.passed,
    health_check_passed: healthResult.passed,
  });

  return {
    success: buildResult.passed && healthResult.passed,
    build: buildResult,
    tests: testResult,
    healthCheck: healthResult,
    errors: allErrors,
  };
}

/**
 * Run repair phase
 */
async function runRepair(
  provider: BaseSandboxProvider,
  sandboxId: string,
  errors: ClassifiedError[]
): Promise<RepairResult> {
  console.log("[Orchestrator] Running repair...");
  const fixesApplied: string[] = [];

  // Prioritize errors
  const prioritized = prioritizeErrors(errors);

  // Try auto-fix first
  if (canAutoFix(prioritized)) {
    console.log("[Orchestrator] Attempting auto-fix...");
    const autoResult = await runAllAutoFixes(provider, prioritized);
    fixesApplied.push(
      ...autoResult.fixesApplied.map((f) => f.description)
    );

    if (autoResult.success) {
      return {
        success: true,
        method: "auto",
        attemptsUsed: 1,
        fixesApplied,
        remainingErrors: [],
      };
    }

    // Update remaining errors
    errors = autoResult.remainingErrors;
  }

  // Try AI repair if needed
  if (needsAIRepair(errors) && isAIRepairAvailable()) {
    console.log("[Orchestrator] Attempting AI repair...");
    const aiResult = await applyAIRepair(provider, errors);

    if (aiResult.success) {
      fixesApplied.push("AI repair applied");
      return {
        success: true,
        method: "ai",
        attemptsUsed: 1,
        fixesApplied,
        remainingErrors: [],
      };
    }
  }

  return {
    success: false,
    method: errors.length > 0 ? "none" : "auto",
    attemptsUsed: 1,
    fixesApplied,
    remainingErrors: errors,
  };
}

/**
 * Main pipeline function
 */
export async function runGenerationPipeline(
  toolId: string,
  generationId: string,
  generatedCode: string
): Promise<PipelineResult> {
  const startTime = Date.now();
  let provider: BaseSandboxProvider | null = null;
  let sandboxRecord: SandboxRecord | null = null;

  try {
    // Phase 1: Create sandbox with fallback
    console.log("[Orchestrator] Phase 1: Provisioning sandbox...");
    provider = await createSandboxWithFallback();
    const sandboxInfo = provider.getSandboxInfo()!;

    // Create database record
    sandboxRecord = await createSandboxRecord(
      toolId,
      generationId,
      sandboxInfo.provider
    );

    await updateSandboxStatus(sandboxRecord.id, "provisioning", {
      external_id: sandboxInfo.sandboxId,
      url: sandboxInfo.url,
    });

    // Phase 2: Setup Vite app
    console.log("[Orchestrator] Phase 2: Setting up Vite app...");
    await updateSandboxStatus(sandboxRecord.id, "setup");
    await provider.setupViteApp();

    // Phase 3: Apply generated code
    console.log("[Orchestrator] Phase 3: Applying generated code...");
    await updateSandboxStatus(sandboxRecord.id, "applying_code");
    await provider.writeFile("src/App.jsx", generatedCode);

    // Phase 4: Detect and install packages
    console.log("[Orchestrator] Phase 4: Installing packages...");
    await updateSandboxStatus(sandboxRecord.id, "installing_packages");
    const packages = detectPackagesFromCode(generatedCode);
    if (packages.length > 0) {
      await provider.installPackages(packages);
    }

    // Phase 5: Validate
    console.log("[Orchestrator] Phase 5: Validating...");
    await updateSandboxStatus(sandboxRecord.id, "validating");
    let validation = await runValidation(provider, sandboxRecord.id, generatedCode);

    // Phase 6: Repair loop (up to max_retries)
    let retryCount = 0;
    let repairResult: RepairResult | undefined;

    while (!validation.success && retryCount < sandboxRecord.max_retries) {
      retryCount = await incrementRetryCount(sandboxRecord.id);
      console.log(
        `[Orchestrator] Phase 6: Repair attempt ${retryCount}/${sandboxRecord.max_retries}...`
      );

      await updateSandboxStatus(sandboxRecord.id, "repairing");

      // Add errors to history
      for (const error of validation.errors) {
        await addErrorToHistory(sandboxRecord.id, error);
      }

      // Run repair
      repairResult = await runRepair(
        provider,
        sandboxRecord.id,
        validation.errors
      );

      if (repairResult.success) {
        // Re-validate after repair
        await updateSandboxStatus(sandboxRecord.id, "validating");
        validation = await runValidation(provider, sandboxRecord.id, generatedCode);
      } else {
        // Can't fix, break loop
        break;
      }
    }

    // Final status
    if (validation.success) {
      console.log("[Orchestrator] Pipeline completed successfully!");
      await updateSandboxStatus(sandboxRecord.id, "ready");

      return {
        success: true,
        sandboxId: sandboxRecord.id,
        sandboxUrl: provider.getSandboxUrl() || undefined,
        validation,
        repair: repairResult,
        canRetry: false,
        totalDuration: Date.now() - startTime,
      };
    } else {
      console.log("[Orchestrator] Pipeline failed after max retries");
      await updateSandboxStatus(sandboxRecord.id, "failed", {
        last_error: validation.errors[0]?.message || "Validation failed",
      });

      return {
        success: false,
        sandboxId: sandboxRecord.id,
        validation,
        repair: repairResult,
        error: "Echec apres plusieurs tentatives de correction",
        userMessage:
          "La generation a rencontre des problemes. Vous pouvez modifier votre description et reessayer.",
        canRetry: true,
        totalDuration: Date.now() - startTime,
      };
    }
  } catch (error) {
    console.error("[Orchestrator] Pipeline error:", error);

    // Update status to failed if we have a record
    if (sandboxRecord) {
      await updateSandboxStatus(sandboxRecord.id, "failed", {
        last_error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Cleanup provider
    if (provider) {
      try {
        await provider.terminate();
      } catch (e) {
        console.error("[Orchestrator] Failed to terminate provider:", e);
      }
    }

    return {
      success: false,
      sandboxId: sandboxRecord?.id || "",
      error: error instanceof Error ? error.message : "Pipeline failed",
      userMessage: "Une erreur est survenue. Veuillez reessayer.",
      canRetry: true,
      totalDuration: Date.now() - startTime,
    };
  }
}

/**
 * Retry a failed sandbox
 */
export async function retrySandbox(sandboxId: string): Promise<PipelineResult> {
  const supabase = getSupabaseAdmin();

  // Get sandbox record
  const { data: sandbox, error } = await supabase
    .from("sandboxes")
    .select("*, tools(*)")
    .eq("id", sandboxId)
    .single();

  if (error || !sandbox) {
    throw new Error("Sandbox not found");
  }

  // Get the generated code
  const tool = sandbox.tools as { code_storage_path: string };
  const code = tool.code_storage_path || "";

  // Reset retry count
  await supabase
    .from("sandboxes")
    .update({ retry_count: 0, status: "pending" })
    .eq("id", sandboxId);

  // Run pipeline again
  return runGenerationPipeline(
    sandbox.tool_id,
    sandbox.generation_id || "",
    code
  );
}

/**
 * Terminate a sandbox
 */
export async function terminateSandbox(sandboxId: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  await supabase
    .from("sandboxes")
    .update({ status: "terminated" })
    .eq("id", sandboxId);

  console.log(`[Orchestrator] Sandbox ${sandboxId} terminated`);
}
