import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WelcomeOnboardingModal } from "./welcome-onboarding-modal";

// Mock STRIPE_PLANS so tests don't depend on env vars
vi.mock("@/lib/stripe/plans", () => ({
  STRIPE_PLANS: {
    free: {
      name: "Gratuit",
      price: "0\u20AC",
      priceId: null,
      features: [
        "3 outils actifs maximum",
        "5 regenerations par mois",
        "Modele IA : Haiku (rapide)",
      ],
      limitations: { maxActiveTools: 3, maxRegenerationsPerMonth: 5, maxProxyCallsPerDay: 50 },
      aiModel: "Claude 3 Haiku",
    },
    pro: {
      name: "Pro",
      price: "29\u20AC",
      priceId: "price_pro",
      features: [
        "20 outils actifs",
        "50 regenerations par mois",
        "Modele IA : Sonnet (avance)",
      ],
      limitations: { maxActiveTools: 20, maxRegenerationsPerMonth: 50, maxProxyCallsPerDay: 500 },
      aiModel: "Claude Sonnet 4",
      popular: true,
    },
  },
}));

describe("WelcomeOnboardingModal", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onCreate: vi.fn(),
    onChangePlan: vi.fn(),
    currentPlan: "free" as const,
  };

  it("renders welcome title when open", () => {
    render(<WelcomeOnboardingModal {...defaultProps} />);
    expect(screen.getByText("Bienvenue sur B-WORK !")).toBeInTheDocument();
  });

  it("displays current plan name (free)", () => {
    render(<WelcomeOnboardingModal {...defaultProps} />);
    expect(screen.getByText("Gratuit")).toBeInTheDocument();
  });

  it("displays current plan name (pro)", () => {
    render(<WelcomeOnboardingModal {...defaultProps} currentPlan="pro" />);
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("lists plan features", () => {
    render(<WelcomeOnboardingModal {...defaultProps} />);
    expect(screen.getByText("3 outils actifs maximum")).toBeInTheDocument();
    expect(screen.getByText("5 regenerations par mois")).toBeInTheDocument();
    expect(screen.getByText("Modele IA : Haiku (rapide)")).toBeInTheDocument();
  });

  it("lists pro plan features when currentPlan is pro", () => {
    render(<WelcomeOnboardingModal {...defaultProps} currentPlan="pro" />);
    expect(screen.getByText("20 outils actifs")).toBeInTheDocument();
    expect(screen.getByText("50 regenerations par mois")).toBeInTheDocument();
  });

  it("shows 'Inclus dans votre plan' label", () => {
    render(<WelcomeOnboardingModal {...defaultProps} />);
    expect(screen.getByText("Inclus dans votre plan :")).toBeInTheDocument();
  });

  it("has 'Creer mon premier outil' button", () => {
    render(<WelcomeOnboardingModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /Creer mon premier outil/i }),
    ).toBeInTheDocument();
  });

  it("has 'Changer de plan' button", () => {
    render(<WelcomeOnboardingModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /Changer de plan/i }),
    ).toBeInTheDocument();
  });

  it("has 'Plus tard' button", () => {
    render(<WelcomeOnboardingModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /Plus tard/i }),
    ).toBeInTheDocument();
  });

  it("calls onCreate when 'Creer mon premier outil' is clicked", async () => {
    const onCreate = vi.fn();
    render(<WelcomeOnboardingModal {...defaultProps} onCreate={onCreate} />);

    await userEvent.click(
      screen.getByRole("button", { name: /Creer mon premier outil/i }),
    );
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it("calls onChangePlan when 'Changer de plan' is clicked", async () => {
    const onChangePlan = vi.fn();
    render(
      <WelcomeOnboardingModal {...defaultProps} onChangePlan={onChangePlan} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Changer de plan/i }),
    );
    expect(onChangePlan).toHaveBeenCalledOnce();
  });

  it("calls onClose when 'Plus tard' is clicked", async () => {
    const onClose = vi.fn();
    render(<WelcomeOnboardingModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(
      screen.getByRole("button", { name: /Plus tard/i }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not render content when open is false", () => {
    render(<WelcomeOnboardingModal {...defaultProps} open={false} />);
    expect(screen.queryByText("Bienvenue sur B-WORK !")).not.toBeInTheDocument();
  });

  it("defaults to free plan when currentPlan is not provided", () => {
    const { currentPlan, ...propsWithoutPlan } = defaultProps;
    render(<WelcomeOnboardingModal {...propsWithoutPlan} />);
    expect(screen.getByText("Gratuit")).toBeInTheDocument();
  });
});
