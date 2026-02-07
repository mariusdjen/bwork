/**
 * Validation Module
 *
 * Pre-validation and error translation for generated code.
 */

export { preValidateCode, quickValidate } from "./pre-validator";
export type { PreValidationResult } from "./pre-validator";

export {
  translateError,
  translateErrors,
  getErrorSummary,
  canShowPreviewDespiteErrors,
} from "./error-translator";
export type { TranslatedError } from "./error-translator";

export {
  ERROR_MESSAGES,
  PROGRESS_MESSAGES,
  SUCCESS_MESSAGES,
  getUserMessage,
  getProgressMessage,
} from "./user-messages";
export type { ErrorCode, UserMessage } from "./user-messages";
