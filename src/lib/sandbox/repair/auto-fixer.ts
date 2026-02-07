/**
 * Auto Fixer
 *
 * Automatically fixes simple errors like missing packages and imports.
 */

import type { AutoFixResult, ClassifiedError } from "@/types/sandbox";
import type { BaseSandboxProvider } from "../providers/base";
import {
  extractPackageName,
  getSuggestedImport,
} from "./error-classifier";

/**
 * Attempt to auto-fix errors
 */
export async function autoFix(
  provider: BaseSandboxProvider,
  errors: ClassifiedError[]
): Promise<AutoFixResult> {
  const fixesApplied: Array<{ type: string; description: string; file?: string }> =
    [];
  const remainingErrors: ClassifiedError[] = [];

  for (const error of errors) {
    if (error.fixable !== "auto") {
      remainingErrors.push(error);
      continue;
    }

    let fixed = false;

    // Try to fix missing package
    if (error.type === "missing-package") {
      const packageName = extractPackageName(error.message);
      if (packageName) {
        try {
          console.log(`[AutoFixer] Installing missing package: ${packageName}`);
          const result = await provider.installPackages([packageName]);
          if (result.success) {
            fixesApplied.push({
              type: "package-install",
              description: `Installed ${packageName}`,
            });
            fixed = true;
          }
        } catch (e) {
          console.error(`[AutoFixer] Failed to install ${packageName}:`, e);
        }
      }
    }

    // Try to fix missing import
    if (error.type === "missing-import") {
      const identifierMatch = error.message.match(/'([^']+)' is not defined/);
      if (identifierMatch) {
        const identifier = identifierMatch[1];
        const importStatement = getSuggestedImport(identifier);

        if (importStatement) {
          try {
            console.log(`[AutoFixer] Adding import for: ${identifier}`);
            const added = await addImportToApp(provider, importStatement);
            if (added) {
              fixesApplied.push({
                type: "add-import",
                description: `Added import for ${identifier}`,
                file: "src/App.jsx",
              });
              fixed = true;
            }
          } catch (e) {
            console.error(`[AutoFixer] Failed to add import for ${identifier}:`, e);
          }
        }
      }
    }

    if (!fixed) {
      remainingErrors.push(error);
    }
  }

  return {
    success: remainingErrors.length === 0,
    fixesApplied,
    remainingErrors,
  };
}

/**
 * Add an import statement to App.jsx
 */
async function addImportToApp(
  provider: BaseSandboxProvider,
  importStatement: string
): Promise<boolean> {
  try {
    const appCode = await provider.readFile("src/App.jsx");

    // Check if import already exists
    if (appCode.includes(importStatement)) {
      console.log("[AutoFixer] Import already exists");
      return true;
    }

    // Find the best place to insert the import
    let newCode: string;

    // Check if there are existing imports
    const importRegex = /^import .+;?\s*$/gm;
    const imports = appCode.match(importRegex);

    if (imports && imports.length > 0) {
      // Add after the last import
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = appCode.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;

      newCode =
        appCode.slice(0, insertPosition) +
        "\n" +
        importStatement +
        appCode.slice(insertPosition);
    } else {
      // Add at the beginning
      newCode = importStatement + "\n\n" + appCode;
    }

    await provider.writeFile("src/App.jsx", newCode);
    return true;
  } catch (e) {
    console.error("[AutoFixer] Failed to add import:", e);
    return false;
  }
}

/**
 * Fix common Tailwind CSS issues
 */
export async function fixTailwindIssues(
  provider: BaseSandboxProvider
): Promise<string[]> {
  const fixes: string[] = [];

  try {
    const appCode = await provider.readFile("src/App.jsx");
    let newCode = appCode;

    // Fix non-existent Tailwind classes
    const invalidClasses: Record<string, string> = {
      "shadow-3xl": "shadow-2xl",
      "rounded-4xl": "rounded-3xl",
      "text-7xl": "text-6xl",
      "blur-3xl": "blur-2xl",
    };

    for (const [invalid, valid] of Object.entries(invalidClasses)) {
      if (newCode.includes(invalid)) {
        newCode = newCode.replace(new RegExp(invalid, "g"), valid);
        fixes.push(`Replaced ${invalid} with ${valid}`);
      }
    }

    if (fixes.length > 0) {
      await provider.writeFile("src/App.jsx", newCode);
    }

    return fixes;
  } catch (e) {
    console.error("[AutoFixer] Failed to fix Tailwind issues:", e);
    return [];
  }
}

/**
 * Fix import path issues
 */
export async function fixImportPaths(
  provider: BaseSandboxProvider
): Promise<string[]> {
  const fixes: string[] = [];

  try {
    const appCode = await provider.readFile("src/App.jsx");
    let newCode = appCode;

    // Fix common import path issues
    const pathFixes: Array<{ pattern: RegExp; replacement: string }> = [
      // Remove .js extension if using .jsx
      { pattern: /from ['"](.+)\.js['"]/g, replacement: "from '$1'" },
      // Fix relative paths
      { pattern: /from ['"]\.\.\/components\//g, replacement: "from './components/" },
    ];

    for (const { pattern, replacement } of pathFixes) {
      if (pattern.test(newCode)) {
        newCode = newCode.replace(pattern, replacement);
        fixes.push(`Fixed import path pattern`);
      }
    }

    if (fixes.length > 0) {
      await provider.writeFile("src/App.jsx", newCode);
    }

    return fixes;
  } catch (e) {
    console.error("[AutoFixer] Failed to fix import paths:", e);
    return [];
  }
}

/**
 * Remove problematic code patterns
 */
export async function removeProblematicPatterns(
  provider: BaseSandboxProvider
): Promise<string[]> {
  const fixes: string[] = [];

  try {
    const appCode = await provider.readFile("src/App.jsx");
    let newCode = appCode;

    // Remove CSS imports (we use Tailwind)
    const cssImportRegex = /import\s+['"][^'"]+\.css['"];?\s*\n?/g;
    if (cssImportRegex.test(newCode)) {
      newCode = newCode.replace(cssImportRegex, "");
      fixes.push("Removed CSS imports (using Tailwind)");
    }

    // Remove export default if component is already exported
    if (
      newCode.includes("export default") &&
      newCode.match(/export default/g)!.length > 1
    ) {
      // Keep only the last export default
      const parts = newCode.split("export default");
      newCode = parts.slice(0, -1).join("") + "export default" + parts[parts.length - 1];
      fixes.push("Fixed duplicate export default");
    }

    if (fixes.length > 0) {
      await provider.writeFile("src/App.jsx", newCode);
    }

    return fixes;
  } catch (e) {
    console.error("[AutoFixer] Failed to remove problematic patterns:", e);
    return [];
  }
}

/**
 * Run all auto-fix strategies
 */
export async function runAllAutoFixes(
  provider: BaseSandboxProvider,
  errors: ClassifiedError[]
): Promise<AutoFixResult> {
  console.log("[AutoFixer] Running all auto-fix strategies...");

  // First, fix specific errors
  const result = await autoFix(provider, errors);

  // Then run additional fixes
  const tailwindFixes = await fixTailwindIssues(provider);
  const importFixes = await fixImportPaths(provider);
  const patternFixes = await removeProblematicPatterns(provider);

  // Combine all fixes
  const allFixes = [
    ...result.fixesApplied,
    ...tailwindFixes.map((f) => ({ type: "tailwind", description: f })),
    ...importFixes.map((f) => ({ type: "import-path", description: f })),
    ...patternFixes.map((f) => ({ type: "pattern", description: f })),
  ];

  console.log(`[AutoFixer] Applied ${allFixes.length} fixes`);

  return {
    success: result.remainingErrors.length === 0,
    fixesApplied: allFixes,
    remainingErrors: result.remainingErrors,
  };
}
