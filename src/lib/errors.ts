export const ErrorCode = {
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_EMAIL_NOT_CONFIRMED: "AUTH_EMAIL_NOT_CONFIRMED",
  GENERATION_FAILED: "GENERATION_FAILED",
  GENERATION_RATE_LIMIT: "GENERATION_RATE_LIMIT",
  SANDBOX_TIMEOUT: "SANDBOX_TIMEOUT",
  TOOL_NOT_FOUND: "TOOL_NOT_FOUND",
  ACCESS_CODE_INVALID: "ACCESS_CODE_INVALID",
  ORG_MEMBER_LIMIT: "ORG_MEMBER_LIMIT",
  ARTIFACT_VALIDATION: "ARTIFACT_VALIDATION",
  PLAN_TOOL_LIMIT: "PLAN_TOOL_LIMIT",
  PLAN_DEPLOY_RESTRICTED: "PLAN_DEPLOY_RESTRICTED",
  PLAN_REGEN_LIMIT: "PLAN_REGEN_LIMIT",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  SUBSCRIPTION_EXPIRED: "SUBSCRIPTION_EXPIRED",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: "Email ou mot de passe incorrect.",
  [ErrorCode.AUTH_EMAIL_NOT_CONFIRMED]:
    "Verifiez votre email pour confirmer votre compte.",
  [ErrorCode.GENERATION_FAILED]:
    "La creation de votre outil a echoue. Reessayez ou modifiez vos regles.",
  [ErrorCode.GENERATION_RATE_LIMIT]:
    "Vous avez atteint la limite de creations pour aujourd'hui. Revenez demain !",
  [ErrorCode.SANDBOX_TIMEOUT]:
    "L'apercu met trop de temps a charger. Reessayez dans un instant.",
  [ErrorCode.TOOL_NOT_FOUND]: "Cet outil n'existe pas ou a ete supprime.",
  [ErrorCode.ACCESS_CODE_INVALID]: "Le code d'acces est incorrect.",
  [ErrorCode.ORG_MEMBER_LIMIT]:
    "Votre organisation a atteint le nombre maximum de membres.",
  [ErrorCode.ARTIFACT_VALIDATION]:
    "Certaines informations sont incompletes. Revenez a l'etape precedente.",
  [ErrorCode.PLAN_TOOL_LIMIT]:
    "Vous avez atteint la limite d'outils actifs de votre plan. Passez a un plan superieur pour en creer plus.",
  [ErrorCode.PLAN_DEPLOY_RESTRICTED]:
    "Le deploiement n'est pas disponible sur votre plan actuel.",
  [ErrorCode.PLAN_REGEN_LIMIT]:
    "Vous avez atteint la limite de regenerations pour ce mois. Passez a un plan superieur.",
  [ErrorCode.PAYMENT_FAILED]:
    "Le paiement de votre abonnement a echoue. Verifiez vos informations de paiement.",
  [ErrorCode.SUBSCRIPTION_EXPIRED]:
    "Votre abonnement a expire. Renouvelez-le pour continuer.",
};

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message ?? ERROR_MESSAGES[code]);
    this.code = code;
    this.name = "AppError";
  }

  static fromCode(code: ErrorCode): AppError {
    return new AppError(code);
  }

  toJSON() {
    return { code: this.code, message: this.message };
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof Error) {
    console.error(`[B-WORK:error] Unhandled: ${err.message}`, err);
    return new AppError(ErrorCode.GENERATION_FAILED, err.message);
  }
  console.error("[B-WORK:error] Unknown error", err);
  return new AppError(ErrorCode.GENERATION_FAILED);
}

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code];
}
