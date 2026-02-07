/**
 * E2B Sandbox Provider
 *
 * Provides VM-isolated sandbox execution using E2B Code Interpreter.
 * Offers complete isolation with Python-based command execution.
 */

import { Sandbox } from "@e2b/code-interpreter";
import type { CommandResult } from "@/types/sandbox";
import { BaseSandboxProvider, type SandboxInfo } from "./base";
import { E2B_CONFIG } from "../config";

/**
 * E2B Provider implementation
 */
export class E2BProvider extends BaseSandboxProvider {
  private sandbox: Sandbox | null = null;

  constructor() {
    super({
      workDir: E2B_CONFIG.workDir,
      vitePort: E2B_CONFIG.vitePort,
      viteStartupDelay: E2B_CONFIG.viteStartupDelay,
    });
  }

  /**
   * Create a new E2B sandbox
   */
  async createSandbox(): Promise<SandboxInfo> {
    const apiKey = process.env.E2B_API_KEY;

    // Validate API key
    if (!apiKey) {
      throw new Error("[E2B] E2B_API_KEY is not set in environment variables");
    }

    if (!apiKey.startsWith("e2b_")) {
      throw new Error(
        `[E2B] E2B_API_KEY appears invalid (should start with 'e2b_', got '${apiKey.substring(0, 4)}...')`
      );
    }

    console.log(
      `[E2B] API key configured: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
    );

    try {
      // Kill existing sandbox if any
      if (this.sandbox) {
        try {
          await this.sandbox.kill();
        } catch (e) {
          console.error("[E2B] Failed to close existing sandbox:", e);
        }
        this.sandbox = null;
      }

      // Clear existing files tracking
      this.existingFiles.clear();

      // Create base sandbox
      console.log("[E2B] Creating sandbox with timeout:", E2B_CONFIG.timeout);
      this.sandbox = await Sandbox.create({
        apiKey,
        timeoutMs: E2B_CONFIG.timeout,
      });

      // Extract sandbox ID and host
      const sandboxId =
        (this.sandbox as unknown as { sandboxId: string }).sandboxId ||
        Date.now().toString();
      const host = (
        this.sandbox as unknown as { getHost: (port: number) => string }
      ).getHost(this.vitePort);

      this.sandboxInfo = {
        sandboxId,
        url: `https://${host}`,
        provider: "e2b",
        createdAt: new Date(),
      };

      // Set extended timeout if method available
      if (
        typeof (this.sandbox as unknown as { setTimeout: (ms: number) => void })
          .setTimeout === "function"
      ) {
        (
          this.sandbox as unknown as { setTimeout: (ms: number) => void }
        ).setTimeout(E2B_CONFIG.timeout);
      }

      console.log(`[E2B] Sandbox created successfully!`);
      console.log(`[E2B] - Sandbox ID: ${sandboxId}`);
      console.log(`[E2B] - URL: ${this.sandboxInfo.url}`);
      return this.sandboxInfo;
    } catch (error) {
      // Enhanced error logging
      console.error("[E2B] Error creating sandbox:");
      console.error("[E2B] - Error type:", error?.constructor?.name);
      console.error("[E2B] - Error message:", error instanceof Error ? error.message : String(error));

      if (error instanceof Error) {
        // Check for common E2B errors
        const message = error.message.toLowerCase();

        if (message.includes("unauthorized") || message.includes("401")) {
          throw new Error(
            `[E2B] Authentication failed. Please verify your E2B_API_KEY is valid and not expired. ` +
              `Key prefix: ${apiKey.substring(0, 8)}...`
          );
        }

        if (message.includes("rate limit") || message.includes("429")) {
          throw new Error(
            "[E2B] Rate limit exceeded. Please wait a moment before trying again."
          );
        }

        if (message.includes("timeout") || message.includes("network")) {
          throw new Error(
            "[E2B] Network error connecting to E2B. Please check your internet connection."
          );
        }
      }

      throw error;
    }
  }

  /**
   * Run a command using Python subprocess
   */
  async runCommand(command: string): Promise<CommandResult> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    const startTime = Date.now();
    const parts = command.split(" ");

    try {
      const result = await this.sandbox.runCode(`
import subprocess
import os

os.chdir('${this.workDir}')
result = subprocess.run(${JSON.stringify(parts)},
                      capture_output=True,
                      text=True,
                      shell=False)

print("STDOUT:")
print(result.stdout)
if result.stderr:
    print("\\nSTDERR:")
    print(result.stderr)
print(f"\\nReturn code: {result.returncode}")
      `);

      const output = result.logs.stdout.join("\n");
      const stderr = result.logs.stderr.join("\n");

      return {
        stdout: output,
        stderr,
        exitCode: result.error ? 1 : 0,
        success: !result.error,
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
      // Try using the files.write API if available
      const sandboxAny = this.sandbox as unknown as {
        files?: { write: (path: string, content: Buffer) => Promise<void> };
      };
      if (sandboxAny.files && typeof sandboxAny.files.write === "function") {
        await sandboxAny.files.write(fullPath, Buffer.from(content));
      } else {
        // Fallback to Python code execution
        await this.sandbox.runCode(`
import os

# Ensure directory exists
dir_path = os.path.dirname("${fullPath}")
os.makedirs(dir_path, exist_ok=True)

# Write file
with open("${fullPath}", 'w') as f:
    f.write(${JSON.stringify(content)})
        `);
      }

      this.existingFiles.add(path);
    } catch (error) {
      console.error(`[E2B] Failed to write file ${path}:`, error);
      throw error;
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

    const result = await this.sandbox.runCode(`
with open("${fullPath}", 'r') as f:
    content = f.read()
print(content)
    `);

    return result.logs.stdout.join("\n");
  }

  /**
   * List files in a directory
   */
  async listFiles(directory?: string): Promise<string[]> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    const dir = directory || this.workDir;

    const result = await this.sandbox.runCode(`
import os
import json

def list_files(path):
    files = []
    for root, dirs, filenames in os.walk(path):
        # Skip node_modules and .git
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.next', 'dist', 'build']]
        for filename in filenames:
            rel_path = os.path.relpath(os.path.join(root, filename), path)
            files.append(rel_path)
    return files

files = list_files("${dir}")
print(json.dumps(files))
    `);

    try {
      return JSON.parse(result.logs.stdout.join(""));
    } catch {
      return [];
    }
  }

  /**
   * Setup Vite app with E2B-specific configuration
   */
  async setupViteApp(): Promise<void> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    console.log("[E2B] Setting up Vite app...");

    // Create directory structure
    await this.sandbox.runCode(`
import os
os.makedirs('${this.workDir}/src', exist_ok=True)
    `);

    // Call parent setup
    await super.setupViteApp();
  }

  /**
   * Start Vite server using Python subprocess
   */
  async startViteServer(): Promise<void> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    console.log("[E2B] Starting Vite dev server...");

    await this.sandbox.runCode(`
import subprocess
import os
import time

os.chdir('${this.workDir}')

# Kill any existing Vite processes
subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(1)

# Start Vite dev server
env = os.environ.copy()
env['FORCE_COLOR'] = '0'

process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

print(f'Vite started with PID: {process.pid}')
    `);

    // Wait for Vite to be ready
    await this.sleep(this.viteStartupDelay);
    console.log("[E2B] Vite dev server started");
  }

  /**
   * Restart Vite server
   */
  async restartViteServer(): Promise<void> {
    if (!this.sandbox) {
      throw new Error("No active sandbox");
    }

    console.log("[E2B] Restarting Vite dev server...");

    await this.sandbox.runCode(`
import subprocess
import time
import os

os.chdir('${this.workDir}')

# Kill existing Vite process
subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(2)

# Start Vite dev server
env = os.environ.copy()
env['FORCE_COLOR'] = '0'

process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

print(f'Vite restarted with PID: {process.pid}')
    `);

    // Wait for Vite to be ready
    await this.sleep(this.viteStartupDelay);
    console.log("[E2B] Vite dev server restarted");
  }

  /**
   * Terminate the sandbox
   */
  async terminate(): Promise<void> {
    if (this.sandbox) {
      try {
        await this.sandbox.kill();
        console.log("[E2B] Sandbox terminated");
      } catch (e) {
        console.error("[E2B] Failed to terminate sandbox:", e);
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
