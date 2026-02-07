import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { Plan } from "@/types/billing";

const DEFAULT_PROVIDER = "anthropic";

export type ProviderName = "anthropic" | "openai" | "google" | "groq";

const DEFAULT_MODELS: Record<ProviderName, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  google: "gemini-2.0-flash",
  groq: "llama-3.3-70b-versatile",
};

const PROVIDER_ENV_KEYS: Record<ProviderName, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  groq: "GROQ_API_KEY",
};

const providerFactories: Record<
  ProviderName,
  (model: string) => ReturnType<typeof anthropic>
> = {
  anthropic: (model) => anthropic(model),
  openai: (model) => openai(model) as ReturnType<typeof anthropic>,
  google: (model) => google(model) as ReturnType<typeof anthropic>,
  groq: (model) => groq(model) as ReturnType<typeof anthropic>,
};

/**
 * Validates that the configured AI provider has its API key set.
 * Returns a validation result with a user-facing message if invalid.
 */
export function validateProviderConfig():
  | { valid: true }
  | { valid: false; message: string } {
  const provider = (process.env.AI_PROVIDER ?? DEFAULT_PROVIDER) as string;

  const envKey = PROVIDER_ENV_KEYS[provider as ProviderName];
  if (!envKey) {
    // Unknown provider — getAIModel() will fallback to Anthropic, validate its key
    if (!process.env[PROVIDER_ENV_KEYS[DEFAULT_PROVIDER as ProviderName]]) {
      console.error(
        `[B-WORK:generation] Unknown provider "${provider}" and fallback key ${PROVIDER_ENV_KEYS[DEFAULT_PROVIDER as ProviderName]} is also missing`,
      );
      return {
        valid: false,
        message:
          "Le provider IA n'est pas configure correctement. Contactez l'administrateur.",
      };
    }
    return { valid: true };
  }

  if (!process.env[envKey]) {
    console.error(
      `[B-WORK:generation] Missing API key: ${envKey} for provider "${provider}"`,
    );
    return {
      valid: false,
      message:
        "Le provider IA n'est pas configure correctement. Contactez l'administrateur.",
    };
  }

  return { valid: true };
}

/**
 * Returns the configured AI model instance.
 * Reads AI_PROVIDER and AI_MODEL from server-side env vars.
 * Falls back to Anthropic if provider is unknown.
 */
export function getAIModel() {
  const provider = (process.env.AI_PROVIDER ?? DEFAULT_PROVIDER) as ProviderName;
  const model =
    process.env.AI_MODEL ?? DEFAULT_MODELS[provider] ?? DEFAULT_MODELS.anthropic;

  const factory = providerFactories[provider];
  if (!factory) {
    console.warn(
      `[B-WORK:generation] Unknown AI_PROVIDER "${provider}", falling back to ${DEFAULT_PROVIDER}`,
    );
    return providerFactories[DEFAULT_PROVIDER](DEFAULT_MODELS.anthropic);
  }

  return factory(model);
}

/**
 * Returns the current provider and model names for logging/tracking.
 */
export function getAIProviderInfo() {
  const provider = process.env.AI_PROVIDER ?? DEFAULT_PROVIDER;
  const defaultModel =
    DEFAULT_MODELS[provider as ProviderName] ?? DEFAULT_MODELS.anthropic;
  const model = process.env.AI_MODEL ?? defaultModel;

  return { provider, model, defaultModel };
}

/**
 * Returns the default model for a given provider.
 */
export function getDefaultModel(provider: ProviderName): string {
  return DEFAULT_MODELS[provider] ?? DEFAULT_MODELS.anthropic;
}

const PLAN_MODELS: Record<Plan, string> = {
  free: "claude-3-haiku-20240307",
  pro: "claude-sonnet-4-20250514",
  business: "claude-sonnet-4-20250514",
  enterprise: "claude-opus-4-20250514",
};

/**
 * Returns the AI model instance appropriate for the user's subscription plan.
 * Uses Anthropic provider for all plan-based models.
 */
export function getAIModelForPlan(plan: Plan) {
  const model = PLAN_MODELS[plan] ?? PLAN_MODELS.free;
  return anthropic(model);
}

/**
 * Returns the model name string for a given plan (for logging/tracking).
 */
export function getModelNameForPlan(plan: Plan): string {
  return PLAN_MODELS[plan] ?? PLAN_MODELS.free;
}
