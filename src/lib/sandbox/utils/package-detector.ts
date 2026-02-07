/**
 * Package Detector
 *
 * Detects npm packages from import statements in generated code.
 */

/**
 * Built-in Node.js modules (should not be installed)
 */
const BUILTIN_MODULES = new Set([
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "https",
  "module",
  "net",
  "os",
  "path",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "timers",
  "tls",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "zlib",
]);

/**
 * Packages already included in the template
 */
const TEMPLATE_PACKAGES = new Set([
  "react",
  "react-dom",
  "vite",
  "@vitejs/plugin-react",
  "tailwindcss",
  "postcss",
  "autoprefixer",
  "tailwindcss-animate",
  "vitest",
  "@testing-library/react",
  "@testing-library/jest-dom",
  "jsdom",
]);

/**
 * Common package aliases (import name -> npm package name)
 */
const PACKAGE_ALIASES: Record<string, string> = {
  "react-router": "react-router-dom",
  "router": "react-router-dom",
  "axios": "axios",
  "lodash": "lodash",
  "_": "lodash",
  "moment": "moment",
  "dayjs": "dayjs",
  "date-fns": "date-fns",
  "uuid": "uuid",
  "classnames": "classnames",
  "clsx": "clsx",
  "framer-motion": "framer-motion",
  "motion": "framer-motion",
  "zustand": "zustand",
  "jotai": "jotai",
  "recoil": "recoil",
  "swr": "swr",
  "react-query": "@tanstack/react-query",
  "tanstack/react-query": "@tanstack/react-query",
  "recharts": "recharts",
  "chart.js": "chart.js",
  "react-chartjs-2": "react-chartjs-2",
  "react-icons": "react-icons",
  "lucide-react": "lucide-react",
  "heroicons": "@heroicons/react",
  "radix-ui": "@radix-ui/react-*",
  "headlessui": "@headlessui/react",
  "react-hook-form": "react-hook-form",
  "formik": "formik",
  "yup": "yup",
  "zod": "zod",
  "react-table": "@tanstack/react-table",
  "react-select": "react-select",
  "react-datepicker": "react-datepicker",
  "react-toastify": "react-toastify",
  "sonner": "sonner",
  "react-hot-toast": "react-hot-toast",
};

/**
 * Extract package name from import path
 */
function extractPackageName(importPath: string): string | null {
  // Skip relative imports
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
    return null;
  }

  // Skip built-in modules
  if (BUILTIN_MODULES.has(importPath)) {
    return null;
  }

  // Handle scoped packages (@org/package)
  if (importPath.startsWith("@")) {
    const parts = importPath.split("/");
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return null;
  }

  // Regular packages - take only the base name
  const baseName = importPath.split("/")[0];

  // Check for aliases
  if (PACKAGE_ALIASES[baseName]) {
    return PACKAGE_ALIASES[baseName];
  }

  return baseName;
}

/**
 * Detect packages from import statements in code
 */
export function detectPackagesFromCode(code: string): string[] {
  const packages = new Set<string>();

  // Match import statements
  // import X from 'package'
  // import { X } from 'package'
  // import 'package'
  // import * as X from 'package'
  const importRegex = /import\s+(?:[\w{},*\s]+\s+from\s+)?['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1];
    const packageName = extractPackageName(importPath);

    if (packageName && !TEMPLATE_PACKAGES.has(packageName)) {
      packages.add(packageName);
    }
  }

  // Also check for require statements
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  while ((match = requireRegex.exec(code)) !== null) {
    const importPath = match[1];
    const packageName = extractPackageName(importPath);

    if (packageName && !TEMPLATE_PACKAGES.has(packageName)) {
      packages.add(packageName);
    }
  }

  return Array.from(packages);
}

/**
 * Detect packages from multiple code files
 */
export function detectPackagesFromFiles(
  files: Array<{ path: string; content: string }>
): string[] {
  const allPackages = new Set<string>();

  for (const file of files) {
    // Only check JS/JSX/TS/TSX files
    if (/\.(js|jsx|ts|tsx)$/.test(file.path)) {
      const packages = detectPackagesFromCode(file.content);
      packages.forEach((p) => allPackages.add(p));
    }
  }

  return Array.from(allPackages);
}

/**
 * Get package version suggestion
 */
export function getPackageVersion(packageName: string): string | null {
  // Common stable versions
  const versions: Record<string, string> = {
    "axios": "^1.6.0",
    "lodash": "^4.17.21",
    "date-fns": "^3.0.0",
    "dayjs": "^1.11.0",
    "uuid": "^9.0.0",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.0",
    "zustand": "^4.4.0",
    "jotai": "^2.5.0",
    "@tanstack/react-query": "^5.0.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.300.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "recharts": "^2.10.0",
    "sonner": "^1.2.0",
  };

  return versions[packageName] || null;
}

/**
 * Validate package name
 */
export function isValidPackageName(name: string): boolean {
  // npm package name rules
  // - must be lowercase
  // - can contain hyphens, underscores, and dots
  // - max 214 characters
  // - scoped packages start with @

  if (!name || name.length > 214) {
    return false;
  }

  // Scoped package
  if (name.startsWith("@")) {
    const parts = name.split("/");
    if (parts.length !== 2) return false;
    return /^@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-~][a-z0-9-._~]*$/.test(name);
  }

  // Regular package
  return /^[a-z0-9-~][a-z0-9-._~]*$/.test(name);
}

/**
 * Filter out invalid or problematic packages
 */
export function filterPackages(packages: string[]): string[] {
  return packages.filter((pkg) => {
    // Validate name
    if (!isValidPackageName(pkg)) {
      console.warn(`[PackageDetector] Invalid package name: ${pkg}`);
      return false;
    }

    // Skip template packages
    if (TEMPLATE_PACKAGES.has(pkg)) {
      return false;
    }

    // Skip built-in modules
    if (BUILTIN_MODULES.has(pkg)) {
      return false;
    }

    return true;
  });
}
