import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingCheck } from "./onboarding-check";

// --- Mocks ---

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

// Mock STRIPE_PLANS
vi.mock("@/lib/stripe/plans", () => ({
  STRIPE_PLANS: {
    free: {
      name: "Gratuit",
      price: "0\u20AC",
      priceId: null,
      features: ["3 outils actifs maximum", "5 regenerations par mois"],
      limitations: { maxActiveTools: 3, maxRegenerationsPerMonth: 5, maxProxyCallsPerDay: 50 },
      aiModel: "Claude 3 Haiku",
    },
    pro: {
      name: "Pro",
      price: "29\u20AC",
      priceId: "price_pro",
      features: ["20 outils actifs", "50 regenerations par mois"],
      limitations: { maxActiveTools: 20, maxRegenerationsPerMonth: 50, maxProxyCallsPerDay: 500 },
      aiModel: "Claude Sonnet 4",
      popular: true,
    },
    business: {
      name: "Business",
      price: "79\u20AC",
      priceId: "price_business",
      features: ["Outils illimites", "Regenerations illimitees"],
      limitations: { maxActiveTools: null, maxRegenerationsPerMonth: null, maxProxyCallsPerDay: null },
      aiModel: "Claude Sonnet 4",
    },
    enterprise: {
      name: "Enterprise",
      price: "Sur devis",
      priceId: null,
      features: ["Tout de Business +", "Modele IA : Opus (premium)"],
      limitations: { maxActiveTools: null, maxRegenerationsPerMonth: null, maxProxyCallsPerDay: null },
      aiModel: "Claude Opus 4",
    },
  },
}));

// Mock PlanComparison (used inside PricingModal)
vi.mock("@/components/bwork/billing/plan-comparison", () => ({
  PlanComparison: ({ currentPlan }: { currentPlan: string }) => (
    <div data-testid="plan-comparison">Pricing: {currentPlan}</div>
  ),
}));

// Mock PlanOnboardingModal
vi.mock("./plan-onboarding-modal", () => ({
  PlanOnboardingModal: ({ open, plan }: { open: boolean; plan: string }) =>
    open ? <div data-testid="plan-onboarding-modal">Plan onboarding: {plan}</div> : null,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// --- Helpers ---

function mockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_: number) => null),
  };
}

// --- Tests ---

describe("OnboardingCheck", () => {
  let localStorageMock: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    localStorageMock = mockLocalStorage();
    Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });
    mockPush.mockReset();
    mockReplace.mockReset();
  });

  it("shows welcome modal for first-time user (toolCount=0, no dismissed key)", async () => {
    render(<OnboardingCheck toolCount={0} currentPlan="free" />);

    await waitFor(() => {
      expect(screen.getByText("Bienvenue sur B-WORK !")).toBeInTheDocument();
    });
  });

  it("displays current plan features in welcome modal", async () => {
    render(<OnboardingCheck toolCount={0} currentPlan="free" />);

    await waitFor(() => {
      expect(screen.getByText("Gratuit")).toBeInTheDocument();
      expect(screen.getByText("3 outils actifs maximum")).toBeInTheDocument();
    });
  });

  it("does not show welcome modal when dismissed", async () => {
    localStorageMock.setItem("bwork_onboarding_dismissed", "true");
    render(<OnboardingCheck toolCount={0} currentPlan="free" />);

    // Small delay to let useEffect run
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText("Bienvenue sur B-WORK !")).not.toBeInTheDocument();
  });

  it("does not show welcome modal when user has tools (toolCount > 0)", async () => {
    render(<OnboardingCheck toolCount={5} currentPlan="free" />);

    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText("Bienvenue sur B-WORK !")).not.toBeInTheDocument();
  });

  it("navigates to /create/start when 'Creer mon premier outil' is clicked", async () => {
    render(<OnboardingCheck toolCount={0} currentPlan="free" />);

    await waitFor(() => {
      expect(screen.getByText("Bienvenue sur B-WORK !")).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /Creer mon premier outil/i }),
    );
    expect(mockPush).toHaveBeenCalledWith("/create/start");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "bwork_onboarding_dismissed",
      "true",
    );
  });

  it("dismisses welcome and stores in localStorage when 'Plus tard' clicked", async () => {
    render(<OnboardingCheck toolCount={0} currentPlan="free" />);

    await waitFor(() => {
      expect(screen.getByText("Bienvenue sur B-WORK !")).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /Plus tard/i }),
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "bwork_onboarding_dismissed",
      "true",
    );
  });

  it("opens pricing modal when 'Changer de plan' is clicked from welcome", async () => {
    render(<OnboardingCheck toolCount={0} currentPlan="free" />);

    await waitFor(() => {
      expect(screen.getByText("Bienvenue sur B-WORK !")).toBeInTheDocument();
    });

    // Click "Changer de plan"
    await userEvent.click(
      screen.getByRole("button", { name: /Changer de plan/i }),
    );

    // Welcome modal should close
    await waitFor(() => {
      expect(screen.queryByText("Bienvenue sur B-WORK !")).not.toBeInTheDocument();
    });

    // Pricing modal should open (with PlanComparison inside)
    await waitFor(() => {
      expect(screen.getByText("Choisissez votre plan")).toBeInTheDocument();
      expect(screen.getByTestId("plan-comparison")).toBeInTheDocument();
    });
  });

  it("passes currentPlan to pricing modal", async () => {
    render(<OnboardingCheck toolCount={0} currentPlan="pro" />);

    await waitFor(() => {
      expect(screen.getByText("Bienvenue sur B-WORK !")).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: /Changer de plan/i }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("plan-comparison")).toHaveTextContent(
        "Pricing: pro",
      );
    });
  });

  it("defaults to free plan when currentPlan is not provided", async () => {
    render(<OnboardingCheck toolCount={0} />);

    await waitFor(() => {
      expect(screen.getByText("Gratuit")).toBeInTheDocument();
    });
  });
});
