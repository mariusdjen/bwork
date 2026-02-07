"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type CustomDescriptionInputProps = {
  onSubmit: (description: string) => void;
  isPending: boolean;
};

export interface CustomDescriptionInputRef {
  setValue: (value: string) => void;
}

export const CustomDescriptionInput = forwardRef<
  CustomDescriptionInputRef,
  CustomDescriptionInputProps
>(function CustomDescriptionInput({ onSubmit, isPending }, ref) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose setValue to parent
  useImperativeHandle(ref, () => ({
    setValue: (newValue: string) => {
      setValue(newValue);
      if (error) setError(null);
      textareaRef.current?.focus();
    },
  }));

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setError("Decrivez votre besoin en au moins 3 caracteres.");
      return;
    }
    if (trimmed.length > 500) {
      setError("La description ne peut pas depasser 500 caracteres.");
      return;
    }
    setError(null);
    onSubmit(trimmed);
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Textarea
        ref={textareaRef}
        placeholder="Ex: Je veux gerer un planning de rendez-vous pour mon cabinet, suivre les stocks de mon magasin, organiser les conges de mon equipe..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        maxLength={500}
        rows={3}
        className="min-h-[100px] resize-none text-base"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {value.length}/500 caracteres
        </p>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || value.trim().length < 3}
        >
          {isPending ? (
            "Creation..."
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Commencer
            </>
          )}
        </Button>
      </div>
    </div>
  );
});
