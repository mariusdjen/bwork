/**
 * Sandbox System Types
 *
 * Types for the sandbox execution environment that runs generated tools
 * with real npm dependencies, build validation, and auto-repair.
 */

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Sandbox lifecycle status
 */
export type SandboxStatus =
  | "pending" // Initial state, waiting to be provisioned
  | "provisioning" // Creating sandbox with provider (E2B/Vercel)
  | "setup" // Setting up Vite+React+Tailwind template
  | "applying_code" // Writing generated code to sandbox
  | "installing_packages" // Running npm install for detected packages
  | "validating" // Running build, tests, health check
  | "repairing" // Auto-fixing or AI-repairing errors
  | "ready" // Sandbox is ready for preview
  | "failed" // Final failure after max retries
  | "terminated"; // Sandbox has been cleaned up

/**
 * Sandbox provider type
 */
export type SandboxProvider = "e2b" | "vercel";

// =============================================================================
// DATABASE TYPES
// =============================================================================

/**
 * Error entry in sandbox error history
 */
export interface SandboxErrorEntry {
  type: string;
  message: string;
  timestamp: string;
  category?: ErrorCategory;
  fixable?: boolean;
}

/**
 * Sandbox database row (matches Supabase schema)
 */
export interface SandboxRecord {
  id: string;
  tool_id: string;
  generation_id: string | null;
  provider: SandboxProvider;
  external_id: string | null;
  url: string | null;
  status: SandboxStatus;
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  error_history: SandboxErrorEntry[];
  build_passed: boolean | null;
  tests_passed: boolean | null;
  health_check_passed: boolean | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

/**
 * Insert type for creating sandbox record
 */
export interface SandboxInsert {
  tool_id: string;
  generation_id?: string | null;
  provider: SandboxProvider;
  external_id?: string | null;
  url?: string | null;
  status?: SandboxStatus;
  max_retries?: number;
  expires_at?: string | null;
}

/**
 * Update type for modifying sandbox record
 */
export interface SandboxUpdate {
  external_id?: string | null;
  url?: string | null;
  status?: SandboxStatus;
  retry_count?: number;
  last_error?: string | null;
  error_history?: SandboxErrorEntry[];
  build_passed?: boolean | null;
  tests_passed?: boolean | null;
  health_check_passed?: boolean | null;
  expires_at?: string | null;
}

// =============================================================================
// COMMAND & FILE TYPES
// =============================================================================

/**
 * Result of running a command in sandbox
 */
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
  duration?: number;
}

/**
 * File to write to sandbox
 */
export interface SandboxFile {
  path: string;
  content: string;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Error categories for classification
 */
export type ErrorCategory =
  | "missing-package" // Auto-fixable: npm install
  | "missing-import" // Auto-fixable: add import statement
  | "syntax-error" // AI repair needed
  | "type-error" // AI repair needed
  | "runtime-error" // AI repair needed
  | "build-error" // General build failure
  | "timeout" // Retry with longer timeout
  | "provider-error" // Retry with different provider
  | "unknown"; // Show to user

/**
 * Classified build error
 */
export interface ClassifiedError {
  type: ErrorCategory;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  fixable: "auto" | "ai" | "user";
  suggestion?: string;
}

/**
 * Result of build validation
 */
export interface BuildValidationResult {
  passed: boolean;
  errors: ClassifiedError[];
  output: string;
  duration: number;
}

/**
 * Result of test execution
 */
export interface TestValidationResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errors: ClassifiedError[];
  output: string;
  duration: number;
}

/**
 * Result of health check
 */
export interface HealthCheckResult {
  passed: boolean;
  url: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

/**
 * Combined validation result
 */
export interface ValidationResult {
  success: boolean;
  build: BuildValidationResult;
  tests: TestValidationResult;
  healthCheck: HealthCheckResult;
  errors: ClassifiedError[];
}

// =============================================================================
// REPAIR TYPES
// =============================================================================

/**
 * Result of auto-fix attempt
 */
export interface AutoFixResult {
  success: boolean;
  fixesApplied: Array<{
    type: string;
    description: string;
    file?: string;
  }>;
  remainingErrors: ClassifiedError[];
}

/**
 * Result of AI repair attempt
 */
export interface AIRepairResult {
  success: boolean;
  repairedCode: string;
  explanation: string;
  tokensUsed: number;
}

/**
 * Result of repair phase
 */
export interface RepairResult {
  success: boolean;
  method: "auto" | "ai" | "none";
  attemptsUsed: number;
  fixesApplied: string[];
  remainingErrors: ClassifiedError[];
}

// =============================================================================
// PIPELINE TYPES
// =============================================================================

/**
 * Progress update during pipeline execution
 */
export interface PipelineProgress {
  sandboxId: string;
  status: SandboxStatus;
  step: string;
  percent: number;
  message: string;
  timestamp: string;
}

/**
 * Final result of generation pipeline
 */
export interface PipelineResult {
  success: boolean;
  sandboxId: string;
  sandboxUrl?: string;
  validation?: ValidationResult;
  repair?: RepairResult;
  error?: string;
  userMessage?: string;
  canRetry: boolean;
  totalDuration: number;
}

// =============================================================================
// PROVIDER CONFIGURATION
// =============================================================================

/**
 * E2B provider configuration
 */
export interface E2BConfig {
  apiKey: string;
  timeout: number;
  vitePort: number;
  workDir: string;
}

/**
 * Vercel provider configuration
 */
export interface VercelConfig {
  oidcToken?: string;
  accessToken?: string;
  teamId?: string;
  projectId?: string;
  timeout: number;
  vitePort: number;
  workDir: string;
}

/**
 * Sandbox configuration (provider-agnostic)
 */
export interface SandboxConfig {
  provider: SandboxProvider;
  timeout: number;
  vitePort: number;
  workDir: string;
  viteStartupDelay: number;
  maxRetries: number;
  expiresInMinutes: number;
}

// =============================================================================
// TEMPLATE TYPES
// =============================================================================

/**
 * Vite project template files
 */
export interface ViteTemplate {
  "package.json": string;
  "vite.config.js": string;
  "tailwind.config.js": string;
  "postcss.config.js": string;
  "index.html": string;
  "src/main.jsx": string;
  "src/App.jsx": string;
  "src/index.css": string;
}

// =============================================================================
// SSE STREAMING TYPES
// =============================================================================

/**
 * SSE event types for progress streaming
 */
export type SSEEventType =
  | "progress"
  | "status"
  | "error"
  | "complete"
  | "package-install"
  | "validation"
  | "repair";

/**
 * SSE event payload
 */
export interface SSEEvent {
  type: SSEEventType;
  data: PipelineProgress | ValidationResult | RepairResult | { error: string };
  timestamp: string;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * User-friendly error messages (French)
 */
export const USER_ERROR_MESSAGES: Record<ErrorCategory, string> = {
  "missing-package": "Installation de dependances en cours...",
  "missing-import": "Correction des imports...",
  "syntax-error": "Correction d'une erreur de syntaxe...",
  "type-error": "Correction d'un probleme de type...",
  "runtime-error": "Correction d'un probleme d'execution...",
  "build-error": "Correction d'une erreur de build...",
  timeout: "Le serveur met plus de temps que prevu...",
  "provider-error": "Changement d'environnement...",
  unknown: "Un probleme est survenu. Veuillez reessayer.",
};

/**
 * Progress steps for UI display
 */
export const PIPELINE_STEPS = [
  { key: "generating", label: "Generation du code...", percent: 20 },
  { key: "provisioning", label: "Preparation environnement...", percent: 30 },
  { key: "setup", label: "Configuration Vite...", percent: 40 },
  { key: "applying_code", label: "Application du code...", percent: 55 },
  { key: "installing_packages", label: "Installation packages...", percent: 70 },
  { key: "validating", label: "Verification...", percent: 85 },
  { key: "ready", label: "Pret!", percent: 100 },
] as const;

/**
 * Repair steps for UI display
 */
export const REPAIR_STEPS = [
  { key: "repairing", label: "Correction automatique...", percent: 50 },
  { key: "validating", label: "Re-verification...", percent: 100 },
] as const;
