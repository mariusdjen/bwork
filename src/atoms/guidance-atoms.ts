/**
 * Guidance Atoms
 *
 * Jotai atoms for managing the hybrid guidance conversation state.
 */

import { atom } from "jotai";
import type { ArtifactBase } from "@/types/artifact";
import type {
  GuidanceMessage,
  GuidancePhase,
  DetectedContext,
  ActiveQuestion,
} from "@/types/guidance";
import { nanoid } from "nanoid";

// ============================================
// Core State Atoms
// ============================================

/**
 * Current tool ID being guided
 */
export const guidanceToolIdAtom = atom<string | null>(null);

/**
 * Conversation messages
 */
export const guidanceMessagesAtom = atom<GuidanceMessage[]>([]);

/**
 * Artifact being built progressively
 */
export const guidanceArtifactAtom = atom<Partial<ArtifactBase>>({});

/**
 * Current phase of guidance
 */
export const guidancePhaseAtom = atom<GuidancePhase>("welcome");

/**
 * Detected context from user input
 */
export const guidanceContextAtom = atom<DetectedContext | null>(null);

/**
 * Loading state during AI response
 */
export const guidanceLoadingAtom = atom<boolean>(false);

/**
 * Error state
 */
export const guidanceErrorAtom = atom<string | null>(null);

// ============================================
// Derived Atoms
// ============================================

/**
 * Get the latest active question (if any)
 */
export const activeQuestionAtom = atom<ActiveQuestion | null>((get) => {
  const messages = get(guidanceMessagesAtom);
  const lastMessage = messages[messages.length - 1];

  if (lastMessage?.role === "assistant" && lastMessage.activeQuestion) {
    return lastMessage.activeQuestion;
  }

  return null;
});

/**
 * Check if guidance is complete (ready to generate)
 */
export const guidanceCompleteAtom = atom<boolean>((get) => {
  const phase = get(guidancePhaseAtom);
  return phase === "complete";
});

/**
 * Get progress percentage based on phase
 */
export const guidanceProgressAtom = atom<number>((get) => {
  const phase = get(guidancePhaseAtom);
  const progressMap: Record<GuidancePhase, number> = {
    welcome: 0,
    discovering: 25,
    refining: 60,
    confirming: 90,
    complete: 100,
  };
  return progressMap[phase] || 0;
});

/**
 * Summary of current artifact for display
 */
export const artifactSummaryAtom = atom((get) => {
  const artifact = get(guidanceArtifactAtom);

  return {
    hasName: !!artifact.toolName,
    name: artifact.toolName || "Sans nom",
    entityCount: artifact.entities?.length || 0,
    fieldCount: artifact.entities?.reduce((sum, e) => sum + (e.fields?.length || 0), 0) || 0,
    ruleCount: artifact.rules?.length || 0,
    entities: artifact.entities || [],
  };
});

// ============================================
// Action Atoms (Write operations)
// ============================================

/**
 * Flag to indicate if initial AI call is needed (when user provided description)
 */
export const needsInitialAICallAtom = atom<boolean>(false);

/**
 * The initial description provided by user (from start page)
 */
export const initialDescriptionAtom = atom<string | null>(null);

/**
 * Initialize guidance for a tool
 * Returns true if there's a description that needs to be sent to AI
 */
export const initGuidanceAtom = atom(
  null,
  (get, set, params: { toolId: string; existingArtifact?: Partial<ArtifactBase> }) => {
    const { toolId, existingArtifact } = params;

    // Reset all state
    set(guidanceToolIdAtom, toolId);
    set(guidanceArtifactAtom, existingArtifact || {});
    set(guidanceContextAtom, null);
    set(guidanceErrorAtom, null);
    set(guidanceLoadingAtom, false);
    set(guidanceMessagesAtom, []);

    // Check if user already provided a description
    const hasDescription = existingArtifact?.customDescription && existingArtifact.customDescription.length > 0;
    const hasEntities = existingArtifact?.entities && existingArtifact.entities.length > 0;

    if (hasEntities) {
      // Already has content - go to refining phase
      set(guidancePhaseAtom, "refining");
      set(needsInitialAICallAtom, false);
      set(initialDescriptionAtom, null);
    } else if (hasDescription) {
      // Has description but no entities yet - need to process with AI
      set(guidancePhaseAtom, "discovering");
      set(needsInitialAICallAtom, true);
      set(initialDescriptionAtom, existingArtifact.customDescription!);
    } else {
      // No description - show empty welcome
      set(guidancePhaseAtom, "welcome");
      set(needsInitialAICallAtom, false);
      set(initialDescriptionAtom, null);

      // Add simple welcome message without predefined options
      const welcomeMessage: GuidanceMessage = {
        id: nanoid(),
        role: "assistant",
        content: "Salut ! Decris-moi l'outil que tu veux creer. Ca peut etre n'importe quoi - gestion de clients, suivi de projets, inventaire, planning, ou autre chose de completement different !",
        timestamp: new Date(),
      };
      set(guidanceMessagesAtom, [welcomeMessage]);
    }
  }
);

/**
 * Add a user message
 */
export const addUserMessageAtom = atom(
  null,
  (get, set, params: { content: string; selectedOptions?: string[] }) => {
    const { content, selectedOptions } = params;
    const messages = get(guidanceMessagesAtom);

    const userMessage: GuidanceMessage = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: new Date(),
      selectedOptions,
    };

    set(guidanceMessagesAtom, [...messages, userMessage]);
  }
);

/**
 * Add an assistant message with optional updates
 */
export const addAssistantMessageAtom = atom(
  null,
  (
    get,
    set,
    params: {
      content: string;
      activeQuestion?: ActiveQuestion;
      artifactUpdate?: Partial<ArtifactBase>;
      contextUpdate?: DetectedContext;
      nextPhase?: GuidancePhase;
    }
  ) => {
    const { content, activeQuestion, artifactUpdate, contextUpdate, nextPhase } = params;
    const messages = get(guidanceMessagesAtom);

    // Add message
    const assistantMessage: GuidanceMessage = {
      id: nanoid(),
      role: "assistant",
      content,
      timestamp: new Date(),
      activeQuestion,
    };
    set(guidanceMessagesAtom, [...messages, assistantMessage]);

    // Update artifact if provided
    if (artifactUpdate) {
      const currentArtifact = get(guidanceArtifactAtom);
      set(guidanceArtifactAtom, { ...currentArtifact, ...artifactUpdate });
    }

    // Update context if provided
    if (contextUpdate) {
      set(guidanceContextAtom, contextUpdate);
    }

    // Update phase if provided
    if (nextPhase) {
      set(guidancePhaseAtom, nextPhase);
    }
  }
);

/**
 * Update artifact directly (for real-time preview updates)
 */
export const updateArtifactAtom = atom(
  null,
  (get, set, update: Partial<ArtifactBase>) => {
    const current = get(guidanceArtifactAtom);
    set(guidanceArtifactAtom, { ...current, ...update });
  }
);

/**
 * Set loading state
 */
export const setGuidanceLoadingAtom = atom(
  null,
  (get, set, loading: boolean) => {
    set(guidanceLoadingAtom, loading);
  }
);

/**
 * Set error state
 */
export const setGuidanceErrorAtom = atom(
  null,
  (get, set, error: string | null) => {
    set(guidanceErrorAtom, error);
  }
);

/**
 * Reset guidance state
 */
export const resetGuidanceAtom = atom(null, (get, set) => {
  set(guidanceToolIdAtom, null);
  set(guidanceMessagesAtom, []);
  set(guidanceArtifactAtom, {});
  set(guidancePhaseAtom, "welcome");
  set(guidanceContextAtom, null);
  set(guidanceLoadingAtom, false);
  set(guidanceErrorAtom, null);
});
