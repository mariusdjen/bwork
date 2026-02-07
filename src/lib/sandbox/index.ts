/**
 * Sandbox System
 *
 * Provides isolated execution environments for generated tools
 * with real npm dependencies, build validation, and auto-repair.
 */

// Types
export type {
  SandboxStatus,
  SandboxProvider as SandboxProviderType,
  SandboxRecord,
  SandboxInsert,
  SandboxUpdate,
  SandboxErrorEntry,
  CommandResult,
  SandboxFile,
  ErrorCategory,
  ClassifiedError,
  BuildValidationResult,
  TestValidationResult,
  HealthCheckResult,
  ValidationResult,
  AutoFixResult,
  AIRepairResult,
  RepairResult,
  PipelineProgress,
  PipelineResult,
  SandboxConfig,
  ViteTemplate,
  SSEEventType,
  SSEEvent,
} from "@/types/sandbox";

// Constants
export {
  USER_ERROR_MESSAGES,
  PIPELINE_STEPS,
  REPAIR_STEPS,
} from "@/types/sandbox";

// Provider base class and implementations
export { BaseSandboxProvider } from "./providers/base";
export { E2BProvider } from "./providers/e2b-provider";
export { VercelProvider } from "./providers/vercel-provider";

// Factory for creating providers
export {
  createSandboxProvider,
  isE2BConfigured,
  isVercelConfigured,
  getAvailableProviders,
} from "./factory";

// Configuration
export { SANDBOX_CONFIG, VITE_TEMPLATE } from "./config";
