import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingModal } from "./pricing-modal";

// Mock PlanComparison to isolate pricing-modal tests
vi.mock("./plan-comparison", () => ({
  PlanComparison: ({ currentPlan }: { currentPlan: string }) => (
    <div data-testid="plan-comparison">Plan actuel: {currentPlan}</div>
  ),
}));

describe("PricingModal", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    currentPlan: "free" as const,
  };

  it("renders dialog title when open", () => {
    render(<PricingModal {...defaultProps} />);
    expect(screen.getByText("Choisissez votre plan")).toBeInTheDocument();
  });

  it("renders dialog description", () => {
    render(<PricingModal {...defaultProps} />);
    expect(
      screen.getByText("Comparez les plans et passez a celui qui vous convient."),
    ).toBeInTheDocument();
  });

  it("renders PlanComparison with currentPlan", () => {
    render(<PricingModal {...defaultProps} currentPlan="pro" />);
    const comparison = screen.getByTestId("plan-comparison");
    expect(comparison).toBeInTheDocument();
    expect(comparison).toHaveTextContent("Plan actuel: pro");
  });

  it("passes free plan to PlanComparison by default", () => {
    render(<PricingModal {...defaultProps} />);
    expect(screen.getByTestId("plan-comparison")).toHaveTextContent(
      "Plan actuel: free",
    );
  });

  it("does not render content when open is false", () => {
    render(<PricingModal {...defaultProps} open={false} />);
    expect(
      screen.queryByText("Choisissez votre plan"),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when dialog close button is clicked", async () => {
    const onClose = vi.fn();
    render(<PricingModal {...defaultProps} onClose={onClose} />);

    // The Dialog has a close button (X) rendered by DialogContent
    const closeButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
