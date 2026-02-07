import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod/v4";

// --- Test the validation schema & template logic independently ---
// Server actions use `next/navigation` (redirect) and Supabase server which
// can't run in Vitest. We test the validation schemas and template mapping.

const VALID_USE_CASES = ["tracking", "quotes", "forms"] as const;

const createToolSchema = z
  .object({
    useCase: z.string(),
    customDescription: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) =>
      VALID_USE_CASES.includes(data.useCase as (typeof VALID_USE_CASES)[number]) ||
      (data.useCase === "custom" &&
        data.customDescription &&
        data.customDescription.length >= 3),
    {
      message: "Choisissez un cas d'usage ou decrivez votre besoin (min 3 caracteres).",
    },
  );

describe("createToolDraft validation schema", () => {
  it("accepts valid template use case (quotes)", () => {
    const result = createToolSchema.safeParse({
      useCase: "quotes",
      customDescription: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid template use case (tracking)", () => {
    const result = createToolSchema.safeParse({
      useCase: "tracking",
      customDescription: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid template use case (forms)", () => {
    const result = createToolSchema.safeParse({
      useCase: "forms",
      customDescription: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts custom use case with valid description", () => {
    const result = createToolSchema.safeParse({
      useCase: "custom",
      customDescription: "Gerer mes contacts clients",
    });
    expect(result.success).toBe(true);
  });

  it("rejects custom use case without description", () => {
    const result = createToolSchema.safeParse({
      useCase: "custom",
      customDescription: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects custom use case with too short description", () => {
    const result = createToolSchema.safeParse({
      useCase: "custom",
      customDescription: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown use case", () => {
    const result = createToolSchema.safeParse({
      useCase: "unknown",
      customDescription: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects description exceeding 500 chars", () => {
    const result = createToolSchema.safeParse({
      useCase: "custom",
      customDescription: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("template mapping", () => {
  it("TEMPLATES contains all 3 template use cases", async () => {
    const { TEMPLATES } = await import("@/lib/templates");
    expect(Object.keys(TEMPLATES)).toEqual(
      expect.arrayContaining(["quotes", "tracking", "forms"]),
    );
    expect(Object.keys(TEMPLATES)).toHaveLength(3);
  });

  it("quotes template has correct structure", async () => {
    const { TEMPLATE_QUOTES } = await import("@/lib/templates");
    expect(TEMPLATE_QUOTES.useCase).toBe("quotes");
    expect(TEMPLATE_QUOTES.toolName).toBeTruthy();
    expect(TEMPLATE_QUOTES.entities.length).toBeGreaterThan(0);
    expect(TEMPLATE_QUOTES.entities[0].fields.length).toBeGreaterThan(0);
  });

  it("tracking template has correct structure", async () => {
    const { TEMPLATE_TRACKING } = await import("@/lib/templates");
    expect(TEMPLATE_TRACKING.useCase).toBe("tracking");
    expect(TEMPLATE_TRACKING.toolName).toBeTruthy();
    expect(TEMPLATE_TRACKING.entities.length).toBeGreaterThan(0);
  });

  it("forms template has correct structure", async () => {
    const { TEMPLATE_FORMS } = await import("@/lib/templates");
    expect(TEMPLATE_FORMS.useCase).toBe("forms");
    expect(TEMPLATE_FORMS.toolName).toBeTruthy();
    expect(TEMPLATE_FORMS.entities.length).toBeGreaterThan(0);
  });

  it("custom use case has no template", async () => {
    const { TEMPLATES } = await import("@/lib/templates");
    expect(TEMPLATES["custom"]).toBeUndefined();
  });
});
