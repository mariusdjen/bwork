"use client";

/**
 * Retry Button Component
 *
 * Button to retry a failed sandbox generation.
 */

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RetryButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  sandboxId: string;
  onRetryStart?: () => void;
  onRetryComplete?: (success: boolean) => void;
}

export function RetryButton({
  sandboxId,
  onRetryStart,
  onRetryComplete,
  children,
  ...props
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    onRetryStart?.();

    try {
      const response = await fetch(`/api/sandbox/${sandboxId}/retry`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Retry failed");
      }

      if (data.success) {
        toast.success("Generation relancee!");
        onRetryComplete?.(true);
      } else {
        toast.error(data.userMessage || "Echec de la regeneration");
        onRetryComplete?.(false);
      }
    } catch (error) {
      console.error("Retry failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du retry"
      );
      onRetryComplete?.(false);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button onClick={handleRetry} disabled={isRetrying} {...props}>
      {isRetrying ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4 mr-2" />
      )}
      {children || "Regenerer"}
    </Button>
  );
}
