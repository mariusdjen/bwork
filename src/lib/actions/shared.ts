import type { z } from "zod/v4";

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}
