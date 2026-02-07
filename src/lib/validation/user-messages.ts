/**
 * User-Friendly Error Messages
 *
 * Translates technical errors into human-readable messages.
 * All messages are in French for the target audience.
 */

export type ErrorCode =
  | "SYNTAX_ERROR"
  | "MISSING_APP"
  | "MISSING_IMPORT"
  | "HOOK_ERROR"
  | "JSX_ERROR"
  | "BUILD_FAILED"
  | "SANDBOX_UNAVAILABLE"
  | "TIMEOUT"
  | "UNKNOWN";

export interface UserMessage {
  title: string;
  description: string;
  suggestion?: string;
  isRecoverable: boolean;
}

/**
 * User-friendly messages for each error type
 */
export const ERROR_MESSAGES: Record<ErrorCode, UserMessage> = {
  SYNTAX_ERROR: {
    title: "Petite correction en cours...",
    description: "On a detecte une erreur de syntaxe dans le code. On corrige ca automatiquement.",
    isRecoverable: true,
  },
  MISSING_APP: {
    title: "Restructuration du composant...",
    description: "Le composant principal n'etait pas bien structure. On reorganise.",
    isRecoverable: true,
  },
  MISSING_IMPORT: {
    title: "Installation d'une dependance...",
    description: "Ton outil a besoin d'une bibliotheque supplementaire. On l'installe.",
    isRecoverable: true,
  },
  HOOK_ERROR: {
    title: "Optimisation du code...",
    description: "Un ajustement technique est necessaire. On s'en occupe.",
    isRecoverable: true,
  },
  JSX_ERROR: {
    title: "Correction de l'interface...",
    description: "L'interface utilisateur avait un petit souci. On repare.",
    isRecoverable: true,
  },
  BUILD_FAILED: {
    title: "Generation complexe",
    description: "Ton outil est ambitieux! La generation a rencontre des difficultes.",
    suggestion: "Essaie de simplifier ta description ou d'etre plus precis sur ce que tu veux.",
    isRecoverable: false,
  },
  SANDBOX_UNAVAILABLE: {
    title: "Preview en preparation",
    description: "La preview interactive n'est pas disponible pour le moment, mais ton outil est pret!",
    isRecoverable: true,
  },
  TIMEOUT: {
    title: "Generation un peu longue",
    description: "La generation prend plus de temps que prevu.",
    suggestion: "Reessaie dans quelques instants.",
    isRecoverable: true,
  },
  UNKNOWN: {
    title: "Oups, quelque chose s'est mal passe",
    description: "Une erreur inattendue est survenue.",
    suggestion: "Reessaie ou modifie ta description.",
    isRecoverable: false,
  },
};

/**
 * Progress step messages shown during generation
 */
export const PROGRESS_MESSAGES = {
  generating: {
    label: "Generation du code...",
    sublabel: "L'IA cree ton outil",
  },
  validating: {
    label: "Verification de la structure...",
    sublabel: "On s'assure que tout est correct",
  },
  fixing: {
    label: "Optimisation...",
    sublabel: "On peaufine le code",
  },
  installing: {
    label: "Installation des dependances...",
    sublabel: "Preparation de l'environnement",
  },
  building: {
    label: "Construction de l'outil...",
    sublabel: "Presque pret!",
  },
  ready: {
    label: "Ton outil est pret!",
    sublabel: "Tu peux le tester maintenant",
  },
} as const;

/**
 * Success messages shown after auto-repair
 */
export const SUCCESS_MESSAGES = {
  autoFixed: "On a optimise ton code ✨",
  noIssues: "Code genere sans probleme!",
  repaired: "Quelques ajustements ont ete faits automatiquement.",
} as const;

/**
 * Get user message for an error code
 */
export function getUserMessage(code: ErrorCode): UserMessage {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN;
}

/**
 * Get progress message for a step
 */
export function getProgressMessage(step: keyof typeof PROGRESS_MESSAGES) {
  return PROGRESS_MESSAGES[step];
}
