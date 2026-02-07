import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

// --- Mock setup ---
const mockFrom = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

function resetMockChain() {
  mockSingle.mockReset();
  mockEq.mockReset();
  mockSelect.mockReset();
  mockUpdate.mockReset();
  mockInsert.mockReset();
  mockFrom.mockReset();

  // Default: chain returns { data: null, error: null }
  mockSingle.mockResolvedValue({ data: null, error: null });
  mockEq.mockReturnValue({ single: mockSingle, eq: mockEq });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockInsert.mockReturnValue({ select: mockSelect, error: null });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockFrom.mockImplementation(() => ({
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
  }));
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}));

vi.mock("./client", () => ({
  stripe: vi.fn(() => ({
    subscriptions: {
      retrieve: vi.fn(),
    },
  })),
}));

// --- Fixtures ---

function makeCheckoutSession(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    metadata: { userId: "user-abc", plan: "pro" },
    customer: "cus_test_456",
    subscription: "sub_test_789",
    ...overrides,
  } as Stripe.Checkout.Session;
}

function makeSubscription(overrides: Record<string, unknown> = {}): Stripe.Subscription {
  return {
    id: "sub_test_789",
    status: "active",
    cancel_at_period_end: false,
    metadata: { userId: "user-abc", plan: "pro" },
    items: {
      data: [
        {
          id: "si_test",
          current_period_start: 1706745600, // 2024-02-01
          current_period_end: 1709424000, // 2024-03-03
          price: { id: "price_pro_test" },
        },
      ],
    },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function makeInvoice(subscriptionId: string | null): Stripe.Invoice {
  return {
    id: "in_test_123",
    parent: subscriptionId
      ? {
          subscription_details: {
            subscription: subscriptionId,
          },
        }
      : null,
  } as unknown as Stripe.Invoice;
}

// --- Tests ---

describe("handleCheckoutSessionCompleted", () => {
  beforeEach(() => {
    resetMockChain();
    vi.resetModules();
  });

  it("updates profile and inserts subscription on successful checkout", async () => {
    const { stripe } = await import("./client");
    vi.mocked(stripe).mockReturnValue({
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue(makeSubscription()),
      },
    } as never);

    // Mock successful profile update
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({ error: null }),
    });

    // Mock successful subscription insert
    mockInsert.mockReturnValue({ error: null });

    const { handleCheckoutSessionCompleted } = await import("./webhooks");
    await handleCheckoutSessionCompleted(makeCheckoutSession());

    // Verify profile was updated
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockFrom).toHaveBeenCalledWith("subscriptions");
  });

  it("skips when metadata is missing", async () => {
    const { stripe } = await import("./client");
    vi.mocked(stripe).mockReturnValue({
      subscriptions: { retrieve: vi.fn() },
    } as never);

    const { handleCheckoutSessionCompleted } = await import("./webhooks");
    await handleCheckoutSessionCompleted(
      makeCheckoutSession({ metadata: {} as never }),
    );

    // Should not attempt DB updates
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("handleSubscriptionUpdated", () => {
  beforeEach(() => {
    resetMockChain();
    vi.resetModules();
  });

  it("updates subscription and profile plan", async () => {
    // Mock finding existing subscription
    mockSingle.mockResolvedValueOnce({ data: { user_id: "user-abc" } });

    const { handleSubscriptionUpdated } = await import("./webhooks");
    await handleSubscriptionUpdated(makeSubscription());

    // Verify subscription table was updated
    expect(mockFrom).toHaveBeenCalledWith("subscriptions");
    // Verify profile was updated
    expect(mockFrom).toHaveBeenCalledWith("profiles");
  });

  it("does nothing when subscription not found in DB", async () => {
    mockSingle.mockResolvedValueOnce({ data: null });

    const { handleSubscriptionUpdated } = await import("./webhooks");
    await handleSubscriptionUpdated(makeSubscription());

    // Only the initial lookup, no updates
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("handleSubscriptionDeleted", () => {
  beforeEach(() => {
    resetMockChain();
    vi.resetModules();
  });

  it("downgrades user to free plan", async () => {
    // Mock finding existing subscription
    mockSingle.mockResolvedValueOnce({ data: { user_id: "user-abc" } });

    const { handleSubscriptionDeleted } = await import("./webhooks");
    await handleSubscriptionDeleted(makeSubscription({ status: "canceled" }));

    // Verify profile downgraded to free
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockFrom).toHaveBeenCalledWith("subscriptions");
  });

  it("does nothing when subscription not found", async () => {
    mockSingle.mockResolvedValueOnce({ data: null });

    const { handleSubscriptionDeleted } = await import("./webhooks");
    await handleSubscriptionDeleted(makeSubscription({ status: "canceled" }));

    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("handleInvoicePaymentFailed", () => {
  beforeEach(() => {
    resetMockChain();
    vi.resetModules();
  });

  it("sets subscription status to past_due", async () => {
    const { handleInvoicePaymentFailed } = await import("./webhooks");
    await handleInvoicePaymentFailed(makeInvoice("sub_test_789"));

    expect(mockFrom).toHaveBeenCalledWith("subscriptions");
  });

  it("does nothing when invoice has no subscription", async () => {
    const { handleInvoicePaymentFailed } = await import("./webhooks");
    await handleInvoicePaymentFailed(makeInvoice(null));

    expect(mockFrom).not.toHaveBeenCalled();
  });
});
