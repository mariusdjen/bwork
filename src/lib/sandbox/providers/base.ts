/**
 * Base Sandbox Provider
 *
 * Abstract class defining the interface for sandbox providers.
 * Implementations: E2BProvider, VercelProvider
 */

import type {
  CommandResult,
  SandboxFile,
  SandboxProvider,
} from "@/types/sandbox";
import { VITE_TEMPLATE } from "../config";

/**
 * Sandbox information returned after creation
 */
export interface SandboxInfo {
  sandboxId: string;
  url: string;
  provider: SandboxProvider;
  createdAt: Date;
}

/**
 * Abstract base class for sandbox providers
 */
export abstract class BaseSandboxProvider {
  protected sandboxInfo: SandboxInfo | null = null;
  protected existingFiles: Set<string> = new Set();
  protected workDir: string;
  protected vitePort: number;
  protected viteStartupDelay: number;

  constructor(config: {
    workDir: string;
    vitePort: number;
    viteStartupDelay: number;
  }) {
    this.workDir = config.workDir;
    this.vitePort = config.vitePort;
    this.viteStartupDelay = config.viteStartupDelay;
  }

  // =========================================================================
  // ABSTRACT METHODS - Must be implemented by each provider
  // =========================================================================

  /**
   * Create and initialize a new sandbox
   */
  abstract createSandbox(): Promise<SandboxInfo>;

  /**
   * Run a shell command in the sandbox
   */
  abstract runCommand(command: string): Promise<CommandResult>;

  /**
   * Write a file to the sandbox filesystem
   */
  abstract writeFile(path: string, content: string): Promise<void>;

  /**
   * Read a file from the sandbox filesystem
   */
  abstract readFile(path: string): Promise<string>;

  /**
   * List files in a directory
   */
  abstract listFiles(directory?: string): Promise<string[]>;

  /**
   * Terminate and cleanup the sandbox
   */
  abstract terminate(): Promise<void>;

  /**
   * Check if the sandbox is still alive
   */
  abstract isAlive(): boolean;

  // =========================================================================
  // CONCRETE METHODS - Shared implementation across providers
  // =========================================================================

  /**
   * Install npm packages in the sandbox
   */
  async installPackages(packages: string[]): Promise<CommandResult> {
    if (packages.length === 0) {
      return {
        stdout: "No packages to install",
        stderr: "",
        exitCode: 0,
        success: true,
      };
    }

    const packageList = packages.join(" ");
    const command = `npm install --legacy-peer-deps ${packageList}`;

    console.log(`[Sandbox] Installing packages: ${packageList}`);
    const result = await this.runCommand(command);

    // Restart Vite after package installation
    if (result.success) {
      await this.restartViteServer();
    }

    return result;
  }

  /**
   * Setup the Vite + React + Tailwind template
   */
  async setupViteApp(): Promise<void> {
    console.log("[Sandbox] Setting up Vite + React + Tailwind template...");

    // Write all template files
    for (const [filePath, content] of Object.entries(VITE_TEMPLATE)) {
      await this.writeFile(filePath, content);
      this.existingFiles.add(filePath);
    }

    // Install dependencies
    console.log("[Sandbox] Installing npm dependencies...");
    await this.runCommand("npm install");

    // Start Vite dev server
    await this.startViteServer();

    console.log("[Sandbox] Vite app setup complete");
  }

  /**
   * Start the Vite development server
   */
  async startViteServer(): Promise<void> {
    console.log("[Sandbox] Starting Vite dev server...");

    // Kill any existing Vite processes
    await this.runCommand("pkill -f vite || true");

    // Wait a moment
    await this.sleep(1000);

    // Start Vite in background
    await this.runCommand("nohup npm run dev > /tmp/vite.log 2>&1 &");

    // Wait for Vite to be ready
    await this.sleep(this.viteStartupDelay);

    console.log("[Sandbox] Vite dev server started");
  }

  /**
   * Restart the Vite development server
   */
  async restartViteServer(): Promise<void> {
    console.log("[Sandbox] Restarting Vite dev server...");

    // Kill existing Vite process
    await this.runCommand("pkill -f vite || true");

    // Wait a moment
    await this.sleep(2000);

    // Start Vite in background
    await this.runCommand("nohup npm run dev > /tmp/vite.log 2>&1 &");

    // Wait for Vite to be ready
    await this.sleep(this.viteStartupDelay);

    console.log("[Sandbox] Vite dev server restarted");
  }

  /**
   * Write multiple files at once
   */
  async writeFiles(files: SandboxFile[]): Promise<void> {
    for (const file of files) {
      await this.writeFile(file.path, file.content);
    }
  }

  /**
   * Get the sandbox URL
   */
  getSandboxUrl(): string | null {
    return this.sandboxInfo?.url || null;
  }

  /**
   * Get full sandbox info
   */
  getSandboxInfo(): SandboxInfo | null {
    return this.sandboxInfo;
  }

  /**
   * Get the provider type
   */
  getProviderType(): SandboxProvider | null {
    return this.sandboxInfo?.provider || null;
  }

  /**
   * Check if a file has been written
   */
  hasFile(path: string): boolean {
    return this.existingFiles.has(path);
  }

  /**
   * Get list of written files
   */
  getWrittenFiles(): string[] {
    return Array.from(this.existingFiles);
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  /**
   * Sleep for a given duration
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Normalize file path to full path
   */
  protected normalizePath(path: string): string {
    if (path.startsWith("/")) {
      return path;
    }
    return `${this.workDir}/${path}`;
  }

  /**
   * Extract directory from file path
   */
  protected getDirectory(path: string): string {
    const lastSlash = path.lastIndexOf("/");
    return lastSlash > 0 ? path.substring(0, lastSlash) : "";
  }
}
