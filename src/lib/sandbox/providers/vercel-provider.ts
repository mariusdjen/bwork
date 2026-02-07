/**
 * Vercel Sandbox Provider
 *
 * Provides container-based sandbox execution using Vercel Sandbox SDK.
 * Supports both OIDC and Personal Access Token authentication.
 */

import { Sandbox } from "@vercel/sandbox";
import type { CommandResult } from "@/types/sandbox";
import { BaseSandboxProvider, type SandboxInfo } from "./base";
import { VERCEL_CONFIG } from "../config";

/**
 * Vercel Provider implementation
 */
export class VercelProvider extends BaseSandboxProvider {
  private sandbox: Sandbox | null = null;

  constructor() {
    super({
      workDir: VERCEL_CONFIG.workDir,
      vitePort: VERCEL_CONFIG.vitePort,
      viteStartupDelay: VERCEL_CONFIG.viteStartupDelay,
    });
  }

  /**
   * Create a new Vercel sandbox
   */
  async createSandbox(): Promise<SandboxInfo> {
    try {
      // Kill existing sandbox if any
      if (this.sandbox) {
        try {
          await this.sandbox.stop();
        } catch (e) {
          console.error("[Vercel] Failed to stop existing sandbox:", e);
        }
        this.sandbox = null;
      }

      // Clear existing files tracking
      this.existingFiles.clear();

      // Build sandbox configuration
      console.log("[Vercel] Creating sandbox...");
      const sandboxConfig: Record<string, unknown> = {
        timeout: VERCEL_CONFIG.timeout,
        runtime: VERCEL_CONFIG.runtime,
        ports: [this.vitePort],
      };

      // Add authentication based on environment variables
      if (
        process.env.VERCEL_TOKEN &&
        process.env.VERCEL_TEAM_ID &&
        process.env.VERCEL_PROJECT_ID
      ) {
        sandboxConfig.teamId = process.env.VERCEL_TEAM_ID;
        sandboxConfig.projectId = process.env.VERCEL_PROJECT_ID;
        sandboxConfig.token = process.env.VERCEL_TOKEN;
      } else if (process.env.VERCEL_OIDC_TOKEN) {
        sandboxConfig.oidcToken = process.env.VERCEL_OIDC_TOKEN;
      }

      this.sandbox = await Sandbox.create(sandboxConfig as Parameters<typeof Sandbox.create>[0]);

      // Get sandbox ID and URL
      const sandboxId = this.sandbox.sandboxId;
      const sandboxUrl = this.sandbox.domain(this.vitePort);

      this.sandboxInfo = {
        sandboxId,
        url: sandboxUrl,
        provider: "vercel",
        createdAt: new Date(),
      };

      console.log(`[Vercel] Sandbox created: ${sandboxId}`);
      return this.sandboxInfo;
    } catch (error) {
      console.error("[Vercel] Error creating sandbox:", error);
      throw error;
    }
  }

  /**
   * Run a command in the sandbox
   */
  async runCommand(command: string): Promise<CommandResult> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    const startTime = Date.now();
    const parts = command.split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      const result = await this.sandbox.runCommand({
        cmd,
        args,
        cwd: this.workDir,
        env: {},
      });

      // Handle stdout and stderr - they might be functions in Vercel SDK
      let stdout = "";
      let stderr = "";

      try {
        if (typeof result.stdout === "function") {
          stdout = await result.stdout();
        } else {
          stdout = String(result.stdout || "");
        }
      } catch {
        stdout = "";
      }

      try {
        if (typeof result.stderr === "function") {
          stderr = await result.stderr();
        } else {
          stderr = String(result.stderr || "");
        }
      } catch {
        stderr = "";
      }

      return {
        stdout,
        stderr,
        exitCode: result.exitCode || 0,
        success: result.exitCode === 0,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        stdout: "",
        stderr: error instanceof Error ? error.message : "Command failed",
        exitCode: 1,
        success: false,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Write a file to the sandbox
   */
  async writeFile(path: string, content: string): Promise<void> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    const fullPath = this.normalizePath(path);

    try {
      const buffer = Buffer.from(content, "utf-8");
      await this.sandbox.writeFiles([
        {
          path: fullPath,
          content: buffer,
        },
      ]);

      this.existingFiles.add(path);
    } catch (writeError) {
      console.error(`[Vercel] writeFiles failed for ${fullPath}:`, writeError);

      // Fallback to command-based approach
      const dir = this.getDirectory(fullPath);
      if (dir) {
        await this.sandbox.runCommand({
          cmd: "mkdir",
          args: ["-p", dir],
        });
      }

      // Write file using echo and redirection
      const escapedContent = content
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\$/g, "\\$")
        .replace(/`/g, "\\`")
        .replace(/\n/g, "\\n");

      const writeResult = await this.sandbox.runCommand({
        cmd: "sh",
        args: ["-c", `echo "${escapedContent}" > "${fullPath}"`],
      });

      if (writeResult.exitCode === 0) {
        this.existingFiles.add(path);
      } else {
        throw new Error(
          `Failed to write file via command: ${writeResult.stderr}`
        );
      }
    }
  }

  /**
   * Read a file from the sandbox
   */
  async readFile(path: string): Promise<string> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    const fullPath = this.normalizePath(path);

    const result = await this.sandbox.runCommand({
      cmd: "cat",
      args: [fullPath],
    });

    // Handle stdout
    let stdout = "";
    try {
      if (typeof result.stdout === "function") {
        stdout = await result.stdout();
      } else {
        stdout = String(result.stdout || "");
      }
    } catch {
      stdout = "";
    }

    if (result.exitCode !== 0) {
      let stderr = "";
      try {
        if (typeof result.stderr === "function") {
          stderr = await result.stderr();
        } else {
          stderr = String(result.stderr || "");
        }
      } catch {
        stderr = "Unknown error";
      }
      throw new Error(`Failed to read file: ${stderr}`);
    }

    return stdout;
  }

  /**
   * List files in a directory
   */
  async listFiles(directory?: string): Promise<string[]> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    const dir = directory || this.workDir;

    const result = await this.sandbox.runCommand({
      cmd: "sh",
      args: [
        "-c",
        `find ${dir} -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/build/*" | sed "s|^${dir}/||"`,
      ],
      cwd: "/",
    });

    // Handle stdout
    let stdout = "";
    try {
      if (typeof result.stdout === "function") {
        stdout = await result.stdout();
      } else {
        stdout = String(result.stdout || "");
      }
    } catch {
      stdout = "";
    }

    if (result.exitCode !== 0) {
      return [];
    }

    return stdout.split("\n").filter((line: string) => line.trim() !== "");
  }

  /**
   * Setup Vite app with Vercel-specific HMR configuration
   */
  async setupViteApp(): Promise<void> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    console.log("[Vercel] Setting up Vite app...");

    // Create directory structure
    await this.sandbox.runCommand({
      cmd: "mkdir",
      args: ["-p", `${this.workDir}/src`],
    });

    // Override vite.config.js with Vercel-specific HMR settings
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: ${this.vitePort},
    strictPort: true,
    allowedHosts: [
      '.vercel.run',
      '.e2b.dev',
      'localhost'
    ],
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
  }
})`;

    // Write files manually for Vercel-specific config
    await this.writeFile("vite.config.js", viteConfig);

    // Call parent setup for other files
    await super.setupViteApp();
  }

  /**
   * Start Vite server
   */
  async startViteServer(): Promise<void> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    console.log("[Vercel] Starting Vite dev server...");

    // Kill any existing Vite processes
    await this.sandbox.runCommand({
      cmd: "sh",
      args: ["-c", "pkill -f vite || true"],
      cwd: "/",
    });

    // Start Vite in background
    await this.sandbox.runCommand({
      cmd: "sh",
      args: ["-c", "nohup npm run dev > /tmp/vite.log 2>&1 &"],
      cwd: this.workDir,
    });

    // Wait for Vite to be ready
    await this.sleep(this.viteStartupDelay);
    console.log("[Vercel] Vite dev server started");
  }

  /**
   * Restart Vite server
   */
  async restartViteServer(): Promise<void> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    console.log("[Vercel] Restarting Vite dev server...");

    // Kill existing Vite process
    await this.sandbox.runCommand({
      cmd: "sh",
      args: ["-c", "pkill -f vite || true"],
      cwd: "/",
    });

    // Wait a moment
    await this.sleep(2000);

    // Start Vite in background
    await this.sandbox.runCommand({
      cmd: "sh",
      args: ["-c", "nohup npm run dev > /tmp/vite.log 2>&1 &"],
      cwd: this.workDir,
    });

    // Wait for Vite to be ready
    await this.sleep(this.viteStartupDelay);
    console.log("[Vercel] Vite dev server restarted");
  }

  /**
   * Terminate the sandbox
   */
  async terminate(): Promise<void> {
    if (this.sandbox) {
      try {
        await this.sandbox.stop();
        console.log("[Vercel] Sandbox terminated");
      } catch (e) {
        console.error("[Vercel] Failed to terminate sandbox:", e);
      }
      this.sandbox = null;
      this.sandboxInfo = null;
    }
  }

  /**
   * Check if sandbox is alive
   */
  isAlive(): boolean {
    return !!this.sandbox;
  }
}
