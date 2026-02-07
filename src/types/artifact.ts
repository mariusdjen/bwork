import { z } from "zod/v4";
import {
  MAX_ENTITIES_PER_ARTIFACT,
  MAX_FIELDS_PER_ENTITY,
  MAX_RULES_PER_ARTIFACT,
} from "@/lib/constants";

/**
 * Extended field types for better tool support
 */
export const FIELD_TYPES = [
  "text",
  "number",
  "date",
  "select",
  "checkbox",
  // New types for better tool support
  "file",       // File upload (PDF, images, documents)
  "image",      // Image upload with preview
  "email",      // Email input with validation
  "url",        // URL input with validation
  "textarea",   // Multi-line text
  "color",      // Color picker
  "range",      // Slider/range input
  "phone",      // Phone number
  "currency",   // Money input with currency
] as const;

export const fieldSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(FIELD_TYPES),
  // Optional field configuration
  accept: z.string().optional(),       // For file inputs: ".pdf,.png,.jpg"
  placeholder: z.string().optional(),  // Input placeholder
  required: z.boolean().optional(),    // Required field
  options: z.array(z.string()).optional(), // For select fields
});

export type Field = z.infer<typeof fieldSchema>;
export type FieldType = Field["type"];

export const entitySchema = z.object({
  name: z.string().min(1).max(50),
  fields: z.array(fieldSchema).max(MAX_FIELDS_PER_ENTITY).default([]),
});

export type Entity = z.infer<typeof entitySchema>;

export const ruleSchema = z.object({
  condition: z.string().min(1).max(200),
  action: z.string().min(1).max(200),
});

export type Rule = z.infer<typeof ruleSchema>;

export const customSuggestionsSchema = z.object({
  entities: z.array(z.string()),
  fields: z.array(z.string()),
  rules: z.array(z.object({
    condition: z.string(),
    action: z.string(),
  })),
});

export type CustomSuggestions = z.infer<typeof customSuggestionsSchema>;

/**
 * Tool types for intelligent UI generation
 */
export const TOOL_TYPES = [
  "converter",    // File conversion (PDF→PNG, etc.)
  "calculator",   // Calculations, math tools
  "tracker",      // Tracking entries (expenses, time, etc.)
  "generator",    // Generate content (text, images, etc.)
  "viewer",       // View/display content
  "editor",       // Edit content
  "dashboard",    // Analytics/stats display
  "form",         // Data collection form
  "search",       // Search interface
  "comparison",   // Compare items
  "custom",       // Generic/custom tool
] as const;

export type ToolType = typeof TOOL_TYPES[number];

/**
 * Design preferences for the generated tool
 */
export const designPreferencesSchema = z.object({
  style: z.enum(["modern", "minimal", "colorful", "professional", "playful"]).default("modern"),
  primaryColor: z.string().optional(),
  darkMode: z.boolean().default(false),
});

export type DesignPreferences = z.infer<typeof designPreferencesSchema>;

export const artifactBaseSchema = z.object({
  useCase: z.string().min(1),
  customDescription: z.string().max(500).nullable(),
  toolName: z.string().min(1).max(100),
  toolType: z.enum(TOOL_TYPES).default("custom"),  // NEW: Tool type for smart generation
  entities: z.array(entitySchema).max(MAX_ENTITIES_PER_ARTIFACT).default([]),
  rules: z.array(ruleSchema).max(MAX_RULES_PER_ARTIFACT).default([]),
  customSuggestions: customSuggestionsSchema.nullable().optional(),
  designPreferences: designPreferencesSchema.optional(), // NEW: Design settings
});

export type ArtifactBase = z.infer<typeof artifactBaseSchema>;
