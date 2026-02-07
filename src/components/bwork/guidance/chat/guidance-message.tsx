"use client";

/**
 * GuidanceMessage Component
 *
 * Displays a single message in the guidance conversation.
 * Supports user and assistant messages with different styling.
 */

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuidanceMessage as GuidanceMessageType } from "@/types/guidance";
import { GuidanceOptions } from "./guidance-options";

interface GuidanceMessageProps {
  message: GuidanceMessageType;
  onOptionSelect?: (optionIds: string[]) => void;
  isLatest?: boolean;
  disabled?: boolean;
}

export function GuidanceMessage({
  message,
  onOptionSelect,
  isLatest = false,
  disabled = false,
}: GuidanceMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-3 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Text Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {message.content}
        </div>

        {/* Selected Options (for user messages) */}
        {isUser && message.selectedOptions && message.selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-end">
            {message.selectedOptions.map((opt) => (
              <span
                key={opt}
                className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
              >
                {opt}
              </span>
            ))}
          </div>
        )}

        {/* Options (for assistant messages) */}
        {!isUser && message.activeQuestion && isLatest && (
          <GuidanceOptions
            question={message.activeQuestion}
            onSelect={onOptionSelect || (() => {})}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
