/**
 * Pre-Validator
 *
 * Validates generated code BEFORE sending to sandbox.
 * Catches common errors early to save time and resources.
 *
 * Checks:
 * 1. Basic syntax (balanced brackets, quotes)
 * 2. JSX structure
 * 3. App component presence
 * 4. Common React patterns
 * 5. Detectable missing imports
 */

import { translateError, type TranslatedError } from "./error-translator";

export interface PreValidationResult {
  valid: boolean;
  errors: TranslatedError[];
  warnings: string[];
  canAutoFix: boolean;
  fixedCode?: string;
  stats: {
    hasAppComponent: boolean;
    hasJSX: boolean;
    detectedImports: string[];
    detectedHooks: string[];
  };
}

/**
 * Common packages that might be used in generated code
 */
const KNOWN_PACKAGES: Record<string, string[]> = {
  "lucide-react": ["Icon", "Icons", "Lucide", "Search", "Plus", "Minus", "Check", "X", "Menu", "Home", "User", "Settings", "Mail", "Phone", "Calendar", "Clock", "Star", "Heart", "ThumbsUp", "Edit", "Trash", "Download", "Upload", "Share", "Link", "ExternalLink", "ChevronDown", "ChevronUp", "ChevronLeft", "ChevronRight", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Loader", "Loader2", "RefreshCw", "RotateCw", "Save", "Copy", "Clipboard", "Filter", "SortAsc", "SortDesc", "Grid", "List", "Eye", "EyeOff", "Lock", "Unlock", "Bell", "BellOff", "Bookmark", "Flag", "Tag", "Hash", "AtSign", "Send", "MessageCircle", "MessageSquare", "Info", "AlertCircle", "AlertTriangle", "HelpCircle", "CheckCircle", "XCircle", "Play", "Pause", "Stop", "SkipBack", "SkipForward", "Volume", "VolumeX", "Mic", "MicOff", "Camera", "CameraOff", "Image", "File", "FileText", "Folder", "FolderOpen", "Database", "Server", "Cloud", "Wifi", "WifiOff", "Bluetooth", "Battery", "Zap", "Sun", "Moon", "CloudRain", "Thermometer", "Droplet", "Wind", "Map", "MapPin", "Navigation", "Compass", "Globe", "Target", "Crosshair", "Maximize", "Minimize", "Move", "ZoomIn", "ZoomOut", "MoreHorizontal", "MoreVertical", "Grip", "GripVertical"],
  "date-fns": ["format", "parseISO", "addDays", "subDays", "isValid", "differenceInDays"],
  "recharts": ["LineChart", "BarChart", "PieChart", "AreaChart", "Line", "Bar", "Pie", "Area", "XAxis", "YAxis", "CartesianGrid", "Tooltip", "Legend", "ResponsiveContainer"],
  "@tanstack/react-query": ["useQuery", "useMutation", "QueryClient", "QueryClientProvider"],
  "axios": ["axios"],
  "zustand": ["create", "useStore"],
  "framer-motion": ["motion", "AnimatePresence", "useAnimation"],
  "react-hook-form": ["useForm", "Controller", "FormProvider"],
  "zod": ["z", "ZodSchema"],
};

/**
 * React hooks that should only be used at top level
 */
const REACT_HOOKS = [
  "useState",
  "useEffect",
  "useContext",
  "useReducer",
  "useCallback",
  "useMemo",
  "useRef",
  "useImperativeHandle",
  "useLayoutEffect",
  "useDebugValue",
  "useDeferredValue",
  "useTransition",
  "useId",
];

/**
 * Pre-validate generated code before sandbox
 */
export function preValidateCode(code: string): PreValidationResult {
  const errors: TranslatedError[] = [];
  const warnings: string[] = [];

  // Clean code for analysis
  const cleanCode = cleanCodeForAnalysis(code);

  // 1. Check basic syntax
  const syntaxResult = checkBasicSyntax(cleanCode);
  if (!syntaxResult.valid) {
    errors.push(translateError(syntaxResult.error!));
  }

  // 1b. Check for adjacent JSX elements
  const adjacentResult = checkAdjacentJSX(cleanCode);
  if (!adjacentResult.valid) {
    errors.push(translateError(adjacentResult.error!));
  }

  // 2. Check for App component
  const hasAppComponent = checkAppComponent(cleanCode);
  if (!hasAppComponent) {
    errors.push(translateError("App component not found in generated code"));
  }

  // 2b. Check for default export (required for module to work)
  const hasExport = hasDefaultExport(cleanCode);
  if (hasAppComponent && !hasExport) {
    warnings.push("Missing export default App - will be added automatically");
  }

  // 3. Check JSX structure
  const hasJSX = /return\s*\([\s\S]*<[\s\S]*>[\s\S]*\)/.test(cleanCode) ||
                 /return\s*<[\s\S]*>/.test(cleanCode);
  if (!hasJSX && hasAppComponent) {
    warnings.push("Le composant App ne semble pas retourner de JSX");
  }

  // 4. Detect hooks usage
  const detectedHooks = detectHooks(cleanCode);

  // 5. Check hook rules (basic)
  const hookErrors = checkHookRules(cleanCode, detectedHooks);
  hookErrors.forEach((err) => errors.push(translateError(err)));

  // 6. Detect potentially missing imports
  const detectedImports = detectRequiredPackages(cleanCode);

  // Determine if we can auto-fix
  const canAutoFix = errors.every((e) => e.fixable);

  // Try to fix if possible
  let fixedCode: string | undefined;
  if (canAutoFix && errors.length > 0) {
    fixedCode = attemptAutoFix(code, errors);
  }

  // Always ensure export default exists (even if no errors)
  const codeToCheck = fixedCode || code;
  if (checkAppComponent(codeToCheck) && !hasDefaultExport(codeToCheck)) {
    fixedCode = addDefaultExport(codeToCheck);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    canAutoFix: canAutoFix || (!hasExport && hasAppComponent),
    fixedCode,
    stats: {
      hasAppComponent,
      hasJSX,
      detectedImports,
      detectedHooks,
    },
  };
}

/**
 * Clean code for analysis (remove markdown, etc.)
 */
function cleanCodeForAnalysis(code: string): string {
  let clean = code.trim();

  // Remove markdown code fences
  clean = clean.replace(/^```[\w\s]*\n?/gm, "");
  clean = clean.replace(/\n?```$/gm, "");

  return clean;
}

/**
 * Check for adjacent JSX elements (common React error)
 */
function checkAdjacentJSX(code: string): { valid: boolean; error?: string } {
  // Find return statements with JSX
  const returnMatch = code.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*[;}]/);
  if (!returnMatch) return { valid: true };

  const returnContent = returnMatch[1].trim();

  // Check if it starts with a JSX element
  if (!returnContent.startsWith("<")) return { valid: true };

  // Count root-level JSX elements (very simplified check)
  // Look for pattern: </tag>\s*<tag (closing followed by opening at same level)
  const adjacentPattern = /<\/\w+>\s*\n?\s*<\w+/g;

  // We need to check if these are at the root level (not nested)
  // Simple heuristic: if we find this pattern and the return doesn't start with <> or <Fragment
  const startsWithFragment = /^<>|^<Fragment|^<React\.Fragment/.test(returnContent);
  const startsWithDiv = /^<div|^<section|^<main|^<article/.test(returnContent);

  if (!startsWithFragment && !startsWithDiv) {
    // Check for multiple root elements
    let depth = 0;
    let rootElements = 0;
    const tagPattern = /<\/?(\w+)[^>]*\/?>/g;
    let match;

    while ((match = tagPattern.exec(returnContent)) !== null) {
      const fullMatch = match[0];
      const tagName = match[1];

      // Self-closing tags don't change depth
      if (fullMatch.endsWith("/>")) {
        if (depth === 0) rootElements++;
        continue;
      }

      // Closing tag
      if (fullMatch.startsWith("</")) {
        depth--;
        continue;
      }

      // Opening tag
      if (depth === 0) rootElements++;
      depth++;
    }

    if (rootElements > 1) {
      return {
        valid: false,
        error: "Adjacent JSX elements must be wrapped in a parent element or fragment (<>...</>)",
      };
    }
  }

  return { valid: true };
}

/**
 * Check basic syntax (balanced brackets, quotes)
 */
function checkBasicSyntax(code: string): { valid: boolean; error?: string } {
  // Check balanced brackets
  const brackets: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  const stack: string[] = [];
  let inString = false;
  let stringChar = "";
  let inTemplate = false;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prevChar = code[i - 1];

    // Handle string boundaries
    if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
        if (char === "`") inTemplate = true;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
        if (char === "`") inTemplate = false;
      }
      continue;
    }

    // Skip if in string (except template literals with ${})
    if (inString && !inTemplate) continue;

    // Handle brackets
    if (brackets[char]) {
      stack.push(brackets[char]);
    } else if (Object.values(brackets).includes(char)) {
      if (stack.pop() !== char) {
        return { valid: false, error: `Unexpected token '${char}' - brackets may be unbalanced` };
      }
    }
  }

  if (stack.length > 0) {
    return { valid: false, error: `Missing closing bracket '${stack[stack.length - 1]}'` };
  }

  if (inString) {
    return { valid: false, error: `Unterminated string literal` };
  }

  return { valid: true };
}

/**
 * Check if App component exists
 */
function checkAppComponent(code: string): boolean {
  // Various patterns for App component definition
  const patterns = [
    /function\s+App\s*\(/,
    /const\s+App\s*=\s*\(/,
    /const\s+App\s*=\s*function/,
    /const\s+App\s*=\s*\(\s*\)\s*=>/,
    /const\s+App\s*:\s*React\.FC/,
    /class\s+App\s+extends/,
    /export\s+default\s+function\s+App/,
    /export\s+function\s+App/,
  ];

  return patterns.some((pattern) => pattern.test(code));
}

/**
 * Check if code has a default export
 */
function hasDefaultExport(code: string): boolean {
  // Check various export default patterns
  const patterns = [
    /export\s+default\s+App\s*;?/,
    /export\s+default\s+function\s+App/,
    /export\s+{\s*App\s+as\s+default\s*}/,
    /export\s+default\s+class\s+App/,
  ];

  return patterns.some((pattern) => pattern.test(code));
}

/**
 * Detect React hooks used in code
 */
function detectHooks(code: string): string[] {
  const found: string[] = [];

  for (const hook of REACT_HOOKS) {
    const pattern = new RegExp(`\\b${hook}\\s*\\(`, "g");
    if (pattern.test(code)) {
      found.push(hook);
    }
  }

  return found;
}

/**
 * Basic check for hook rules violations
 */
function checkHookRules(code: string, hooks: string[]): string[] {
  const errors: string[] = [];

  if (hooks.length === 0) return errors;

  // Check if hooks are inside conditions (very basic check)
  const conditionalHookPattern = /if\s*\([^)]*\)\s*\{[^}]*\b(useState|useEffect|useCallback|useMemo|useRef)\b/;
  if (conditionalHookPattern.test(code)) {
    errors.push("Invalid hook call: hooks may be inside a condition");
  }

  // Check if hooks are inside loops (very basic check)
  const loopHookPattern = /(for|while)\s*\([^)]*\)\s*\{[^}]*\b(useState|useEffect|useCallback|useMemo|useRef)\b/;
  if (loopHookPattern.test(code)) {
    errors.push("Invalid hook call: hooks may be inside a loop");
  }

  return errors;
}

/**
 * Detect packages that might need to be installed
 */
function detectRequiredPackages(code: string): string[] {
  const required: string[] = [];

  for (const [packageName, identifiers] of Object.entries(KNOWN_PACKAGES)) {
    for (const identifier of identifiers) {
      // Check if identifier is used (as component or function)
      const pattern = new RegExp(`\\b${identifier}\\b`, "g");
      if (pattern.test(code)) {
        if (!required.includes(packageName)) {
          required.push(packageName);
        }
        break;
      }
    }
  }

  return required;
}

/**
 * Attempt to auto-fix common issues
 */
function attemptAutoFix(code: string, errors: TranslatedError[]): string {
  let fixed = code;

  for (const error of errors) {
    if (error.code === "MISSING_APP") {
      // Wrap code in App component if missing
      if (!checkAppComponent(fixed)) {
        fixed = wrapInAppComponent(fixed);
      }
    }

    if (error.code === "JSX_ERROR" && error.originalMessage.includes("Adjacent JSX")) {
      // Wrap adjacent JSX elements in fragment
      fixed = wrapReturnInFragment(fixed);
    }
  }

  return fixed;
}

/**
 * Wrap return statement content in a React fragment
 */
function wrapReturnInFragment(code: string): string {
  // Find return ( ... ) pattern and wrap content in fragment
  return code.replace(
    /return\s*\(\s*([\s\S]*?)\s*\)\s*([;}])/g,
    (match, content, ending) => {
      const trimmed = content.trim();
      // Don't wrap if already has fragment or single root
      if (trimmed.startsWith("<>") || trimmed.startsWith("<Fragment")) {
        return match;
      }
      return `return (\n    <>\n      ${trimmed}\n    </>\n  )${ending}`;
    }
  );
}

/**
 * Wrap code in App component
 */
function wrapInAppComponent(code: string): string {
  // Check if there's already a return statement with JSX
  const hasReturnJSX = /return\s*\([\s\S]*</.test(code);

  if (hasReturnJSX) {
    // Extract the content and wrap it
    return `function App() {
${code}
}

export default App;`;
  }

  // Otherwise wrap the whole thing
  return `function App() {
  return (
    <div className="p-4">
      ${code}
    </div>
  );
}

export default App;`;
}

/**
 * Add export default App to code that has App but no export
 */
function addDefaultExport(code: string): string {
  // Check if already has default export
  if (hasDefaultExport(code)) {
    return code;
  }

  // Check if it has `export function App` - convert to export default
  if (/export\s+function\s+App\s*\(/.test(code)) {
    return code.replace(
      /export\s+function\s+App\s*\(/,
      "export default function App("
    );
  }

  // Check if App is defined but not exported - add export at end
  if (checkAppComponent(code)) {
    // Remove trailing whitespace and add export
    const trimmed = code.trimEnd();
    return `${trimmed}\n\nexport default App;`;
  }

  return code;
}

/**
 * Quick validation check (faster, less thorough)
 * Use for real-time feedback during generation
 */
export function quickValidate(code: string): {
  hasApp: boolean;
  hasJSX: boolean;
  looksValid: boolean;
} {
  const clean = cleanCodeForAnalysis(code);
  const hasApp = checkAppComponent(clean);
  const hasJSX = /<[A-Za-z]/.test(clean);
  const looksValid = hasApp && hasJSX;

  return { hasApp, hasJSX, looksValid };
}
