"use client";

/**
 * GuidanceInput Component
 *
 * Input field for sending messages in the guidance chat.
 * Supports text input with send button.
 */

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GUIDANCE_MESSAGE_MAX_LENGTH } from "@/types/guidance";

interface GuidanceInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export function GuidanceInput({
  onSend,
  disabled = false,
  loading = false,
  placeholder = "Ecris ta reponse...",
}: GuidanceInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || loading) return;

    onSend(trimmed);
    setValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isOverLimit = value.length > GUIDANCE_MESSAGE_MAX_LENGTH;
  const canSend = value.trim().length > 0 && !isOverLimit && !disabled && !loading;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex items-end gap-2 p-2 rounded-xl border bg-card transition-colors",
          disabled ? "opacity-50" : "focus-within:border-primary/50"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent border-0 outline-none text-sm",
            "placeholder:text-muted-foreground",
            "min-h-[40px] max-h-[120px] py-2 px-2"
          )}
        />

        <Button
          onClick={handleSubmit}
          disabled={!canSend}
          size="icon"
          className="flex-shrink-0 h-9 w-9 rounded-lg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Character count */}
      {value.length > GUIDANCE_MESSAGE_MAX_LENGTH * 0.8 && (
        <div
          className={cn(
            "text-xs text-right",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {value.length}/{GUIDANCE_MESSAGE_MAX_LENGTH}
        </div>
      )}
    </div>
  );
}
