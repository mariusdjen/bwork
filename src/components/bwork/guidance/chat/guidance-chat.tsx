"use client";

/**
 * GuidanceChat Component
 *
 * Main container for the hybrid guidance conversation.
 * Manages chat messages, options, and artifact building.
 */

import { useEffect, useRef, useCallback } from "react";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GuidanceMessage } from "./guidance-message";
import { GuidanceInput } from "./guidance-input";
import { GuidancePreview } from "./guidance-preview";

import {
  guidanceMessagesAtom,
  guidanceArtifactAtom,
  guidancePhaseAtom,
  guidanceContextAtom,
  guidanceLoadingAtom,
  guidanceErrorAtom,
  initGuidanceAtom,
  addUserMessageAtom,
  addAssistantMessageAtom,
  needsInitialAICallAtom,
  initialDescriptionAtom,
} from "@/atoms/guidance-atoms";

import type { ArtifactBase } from "@/types/artifact";
import type { GuidanceAIResponse, ActiveQuestion } from "@/types/guidance";
import { buildInitialMessageForDescription } from "@/lib/guidance/prompts";

interface GuidanceChatProps {
  toolId: string;
  initialArtifact?: Partial<ArtifactBase>;
}

export function GuidanceChat({ toolId, initialArtifact }: GuidanceChatProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialCallMade = useRef(false);

  // Atoms
  const [messages, setMessages] = useAtom(guidanceMessagesAtom);
  const [artifact, setArtifact] = useAtom(guidanceArtifactAtom);
  const [phase, setPhase] = useAtom(guidancePhaseAtom);
  const [context, setContext] = useAtom(guidanceContextAtom);
  const [isLoading, setIsLoading] = useAtom(guidanceLoadingAtom);
  const [error, setError] = useAtom(guidanceErrorAtom);
  const [needsInitialCall, setNeedsInitialCall] = useAtom(needsInitialAICallAtom);
  const [initialDescription, setInitialDescription] = useAtom(initialDescriptionAtom);

  const initGuidance = useSetAtom(initGuidanceAtom);
  const addUserMessage = useSetAtom(addUserMessageAtom);
  const addAssistantMessage = useSetAtom(addAssistantMessageAtom);

  // Initialize on mount
  useEffect(() => {
    initGuidance({ toolId, existingArtifact: initialArtifact });
  }, [toolId, initialArtifact, initGuidance]);

  // Process initial description if provided (from start page)
  useEffect(() => {
    if (needsInitialCall && initialDescription && !initialCallMade.current) {
      initialCallMade.current = true;

      // Add user's description as a message
      addUserMessage({ content: initialDescription });

      // Clear the flags
      setNeedsInitialCall(false);
      setInitialDescription(null);

      // Send to AI with special context
      processInitialDescription(initialDescription);
    }
  }, [needsInitialCall, initialDescription]);

  // Process the initial description with AI
  const processInitialDescription = async (description: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/guidance/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId,
          message: buildInitialMessageForDescription(description),
          currentArtifact: artifact,
          currentPhase: "discovering",
          messageHistory: [],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la communication avec l'IA");
      }

      const aiResponse = data.data as GuidanceAIResponse;

      // Build active question if AI provided one
      let activeQuestion: ActiveQuestion | undefined;
      if (aiResponse.question) {
        activeQuestion = {
          id: nanoid(),
          type: aiResponse.question.type,
          question: aiResponse.question.text,
          options: aiResponse.question.options.map((opt) => ({
            id: `opt-${nanoid()}`,
            label: opt.label,
            description: opt.description,
          })),
          allowCustom: aiResponse.question.allowCustom,
          required: false,
        };
      }

      // Update artifact
      if (aiResponse.artifactUpdate) {
        setArtifact(aiResponse.artifactUpdate as Partial<ArtifactBase>);
      }

      // Update context
      if (aiResponse.contextUpdate) {
        setContext(aiResponse.contextUpdate);
      }

      // Update phase
      if (aiResponse.nextPhase) {
        setPhase(aiResponse.nextPhase);
      }

      // Add assistant message
      addAssistantMessage({
        content: aiResponse.message,
        activeQuestion,
      });
    } catch (err) {
      console.error("[GuidanceChat] Initial processing error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to API
  const sendMessage = useCallback(
    async (message: string, selectedOptions?: string[]) => {
      if (isLoading) return;

      // Add user message
      addUserMessage({ content: message, selectedOptions });
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/guidance/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolId,
            message,
            selectedOptions,
            currentArtifact: artifact,
            currentPhase: phase,
            messageHistory: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de la communication avec l'IA");
        }

        const aiResponse = data.data as GuidanceAIResponse;

        // Build active question if AI provided one
        let activeQuestion: ActiveQuestion | undefined;
        if (aiResponse.question) {
          activeQuestion = {
            id: nanoid(),
            type: aiResponse.question.type,
            question: aiResponse.question.text,
            options: aiResponse.question.options.map((opt, i) => ({
              id: `opt-${nanoid()}`,
              label: opt.label,
              description: opt.description,
            })),
            allowCustom: aiResponse.question.allowCustom,
            required: false,
          };
        }

        // Update artifact
        if (aiResponse.artifactUpdate) {
          setArtifact(aiResponse.artifactUpdate as Partial<ArtifactBase>);
        }

        // Update context
        if (aiResponse.contextUpdate) {
          setContext(aiResponse.contextUpdate);
        }

        // Update phase
        if (aiResponse.nextPhase) {
          setPhase(aiResponse.nextPhase);
        }

        // Add assistant message
        addAssistantMessage({
          content: aiResponse.message,
          activeQuestion,
        });

        // Check if ready to confirm
        if (aiResponse.readyToConfirm || aiResponse.nextPhase === "complete") {
          toast.success("Ton outil est pret a etre genere!");
        }
      } catch (err) {
        console.error("[GuidanceChat] Error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Une erreur est survenue";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [
      toolId,
      artifact,
      phase,
      messages,
      isLoading,
      addUserMessage,
      addAssistantMessage,
      setArtifact,
      setContext,
      setPhase,
      setIsLoading,
      setError,
    ]
  );

  // Handle option selection
  const handleOptionSelect = useCallback(
    (optionIds: string[]) => {
      // Find option labels from the latest message
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage?.activeQuestion) return;

      const selectedLabels = optionIds
        .map((id) => {
          // Handle special ids
          if (id === "yes") return "Oui";
          if (id === "no") return "Non";

          const option = lastMessage.activeQuestion?.options.find(
            (o) => o.id === id
          );
          return option?.label;
        })
        .filter(Boolean) as string[];

      const message = selectedLabels.join(", ");
      sendMessage(message, selectedLabels);
    },
    [messages, sendMessage]
  );

  // Handle generate button
  const handleGenerate = useCallback(async () => {
    setIsLoading(true);

    try {
      // Finalize the artifact first
      const response = await fetch("/api/guidance/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Impossible de finaliser l'outil");
      }

      // Navigate to generate page
      router.push(`/create/${toolId}/generate`);
    } catch (err) {
      console.error("[GuidanceChat] Finalize error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  }, [router, toolId, setIsLoading]);

  const isComplete = phase === "complete" || phase === "confirming";

  return (
    <div className="flex h-full">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <GuidanceMessage
              key={message.id}
              message={message}
              onOptionSelect={handleOptionSelect}
              isLatest={index === messages.length - 1}
              disabled={isLoading}
            />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input or Generate Button */}
        <div className="p-4 border-t">
          {isComplete ? (
            <Button
              onClick={handleGenerate}
              className="w-full"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generer mon outil
            </Button>
          ) : (
            <GuidanceInput
              onSend={(msg) => sendMessage(msg)}
              disabled={isLoading}
              loading={isLoading}
              placeholder="Ecris ta reponse ou choisis une option ci-dessus..."
            />
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="w-80 border-l bg-muted/30 hidden lg:block">
        <GuidancePreview
          artifact={artifact}
          phase={phase}
          detectedContext={context}
        />
      </div>
    </div>
  );
}
