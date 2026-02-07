import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock factories ---
function mockSupabaseClient(fromResults: Record<string, unknown>) {
  return {
    from: vi.fn((table: string) => {
      const result = fromResults[table];
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: result, error: null }),
          }),
        }),
      };
    }),
  };
}

// Mock modules before imports
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { getAiModelForPlan, checkToolLimit, canDeploy } from "./enforcement";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// --- Tests ---

describe("getAiModelForPlan", () => {
  it("returns haiku for free plan", () => {
    expect(getAiModelForPlan("free")).toBe("claude-3-haiku-20240307");
  });

  it("returns sonnet for pro plan", () => {
    expect(getAiModelForPlan("pro")).toBe("claude-sonnet-4-20250514");
  });

  it("returns sonnet for business plan", () => {
    expect(getAiModelForPlan("business")).toBe("claude-sonnet-4-20250514");
  });

  it("returns opus for enterprise plan", () => {
    expect(getAiModelForPlan("enterprise")).toBe("claude-opus-4-20250514");
  });
});

describe("checkToolLimit", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
    vi.mocked(createAdminClient).mockReset();
  });

  it("allows creation when under limit (free: 2/3)", async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabaseClient({
        profiles: { plan: "free", tools_active_count: 2 },
      }) as never,
    );
    vi.mocked(createAdminClient).mockReturnValue(
      mockSupabaseClient({
        plan_limits: { max_active_tools: 3 },
      }) as never,
    );

    const result = await checkToolLimit("user-123");
    expect(result.allowed).toBe(true);
    expect(result.currentCount).toBe(2);
    expect(result.maxAllowed).toBe(3);
  });

  it("blocks creation when at limit (free: 3/3)", async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabaseClient({
        profiles: { plan: "free", tools_active_count: 3 },
      }) as never,
    );
    vi.mocked(createAdminClient).mockReturnValue(
      mockSupabaseClient({
        plan_limits: { max_active_tools: 3 },
      }) as never,
    );

    const result = await checkToolLimit("user-123");
    expect(result.allowed).toBe(false);
    expect(result.currentCount).toBe(3);
    expect(result.maxAllowed).toBe(3);
  });

  it("allows creation for pro plan under limit (pro: 15/20)", async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabaseClient({
        profiles: { plan: "pro", tools_active_count: 15 },
      }) as never,
    );
    vi.mocked(createAdminClient).mockReturnValue(
      mockSupabaseClient({
        plan_limits: { max_active_tools: 20 },
      }) as never,
    );

    const result = await checkToolLimit("user-456");
    expect(result.allowed).toBe(true);
    expect(result.currentCount).toBe(15);
    expect(result.maxAllowed).toBe(20);
  });

  it("allows unlimited for business plan (max_active_tools = null)", async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabaseClient({
        profiles: { plan: "business", tools_active_count: 50 },
      }) as never,
    );
    vi.mocked(createAdminClient).mockReturnValue(
      mockSupabaseClient({
        plan_limits: { max_active_tools: null },
      }) as never,
    );

    const result = await checkToolLimit("user-789");
    expect(result.allowed).toBe(true);
    expect(result.maxAllowed).toBeNull();
  });

  it("returns not allowed when profile not found", async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabaseClient({ profiles: null }) as never,
    );

    const result = await checkToolLimit("user-unknown");
    expect(result.allowed).toBe(false);
    expect(result.maxAllowed).toBe(3);
  });
});

describe("canDeploy", () => {
  beforeEach(() => {
    vi.mocked(createAdminClient).mockReset();
  });

  it("returns false for free plan", async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      mockSupabaseClient({ plan_limits: { can_deploy: false } }) as never,
    );

    expect(await canDeploy("free")).toBe(false);
  });

  it("returns true for pro plan", async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      mockSupabaseClient({ plan_limits: { can_deploy: true } }) as never,
    );

    expect(await canDeploy("pro")).toBe(true);
  });

  it("returns true for business plan", async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      mockSupabaseClient({ plan_limits: { can_deploy: true } }) as never,
    );

    expect(await canDeploy("business")).toBe(true);
  });

  it("returns false (fail-closed) when limits not found", async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      mockSupabaseClient({ plan_limits: null }) as never,
    );

    expect(await canDeploy("free")).toBe(false);
  });
});
