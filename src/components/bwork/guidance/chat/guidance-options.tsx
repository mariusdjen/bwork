"use client";

/**
 * GuidanceOptions Component
 *
 * Displays clickable options for the hybrid guidance system.
 * Supports single select, multi-select, and confirmation modes.
 */

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ActiveQuestion, GuidanceOption } from "@/types/guidance";

interface GuidanceOptionsProps {
  question: ActiveQuestion;
  onSelect: (optionIds: string[]) => void;
  disabled?: boolean;
}

export function GuidanceOptions({
  question,
  onSelect,
  disabled = false,
}: GuidanceOptionsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isMulti = question.type === "multi";
  const isConfirm = question.type === "confirm";

  const handleOptionClick = (option: GuidanceOption) => {
    if (disabled) return;

    if (isMulti) {
      // Toggle selection for multi-select
      setSelectedIds((prev) =>
        prev.includes(option.id)
          ? prev.filter((id) => id !== option.id)
          : [...prev, option.id]
      );
    } else {
      // Single select - immediate action
      onSelect([option.id]);
    }
  };

  const handleConfirmMulti = () => {
    if (selectedIds.length > 0) {
      onSelect(selectedIds);
    }
  };

  // Confirmation type (Yes/No)
  if (isConfirm) {
    return (
      <div className="flex gap-2 mt-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => onSelect(["yes"])}
          disabled={disabled}
        >
          <Check className="w-4 h-4 mr-1" />
          Oui, c'est bon
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(["no"])}
          disabled={disabled}
        >
          Modifier
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full mt-2">
      {/* Options List */}
      <div className="flex flex-col gap-2">
        {question.options.map((option) => {
          const isSelected = selectedIds.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              disabled={disabled}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Checkbox/Radio indicator for multi-select */}
              {isMulti && (
                <div
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded border mt-0.5 flex items-center justify-center",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              )}

              {/* Option Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {option.icon && <span className="text-lg">{option.icon}</span>}
                  <span className="font-medium text-sm text-foreground">
                    {option.label}
                  </span>
                </div>
                {option.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                )}
              </div>

              {/* Arrow for single select */}
              {!isMulti && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm button for multi-select */}
      {isMulti && selectedIds.length > 0 && (
        <Button
          onClick={handleConfirmMulti}
          disabled={disabled}
          className="mt-2"
          size="sm"
        >
          Confirmer ({selectedIds.length} selectionne{selectedIds.length > 1 ? "s" : ""})
        </Button>
      )}

      {/* Custom input hint */}
      {question.allowCustom && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Ou ecris ta reponse ci-dessous
        </p>
      )}
    </div>
  );
}
