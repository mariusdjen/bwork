"use client";

import { forwardRef } from "react";

type FillInBlankProps = {
  prefix: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
};

export const FillInBlank = forwardRef<HTMLInputElement, FillInBlankProps>(
  function FillInBlank(
    {
      prefix,
      placeholder,
      value,
      onChange,
      onSubmit,
      suggestions,
      onSuggestionClick,
    },
    ref,
  ) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg text-foreground">
          <span>{prefix} </span>
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit?.();
            }}
            placeholder={placeholder}
            maxLength={50}
            className="inline-block w-48 border-b-2 border-primary bg-muted/50 px-2 py-0.5 text-lg font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground focus:bg-muted"
            aria-label={`${prefix} (champ a completer)`}
          />
        </p>

        {suggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onSuggestionClick?.(s);
                  if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.focus();
                  }
                }}
                className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);
