/**
 * Guidance Types
 *
 * Types for the hybrid intelligent guidance system.
 * Supports conversational flow with contextual options and real-time artifact building.
 */

import type { ArtifactBase, Entity, Field, Rule } from "./artifact";

// ============================================
// Guidance State
// ============================================

/**
 * Current phase of the guidance conversation
 */
export type GuidancePhase =
  | "welcome" // Initial state, waiting for user description
  | "discovering" // Understanding user needs, detecting domain
  | "refining" // Refining entities and fields
  | "confirming" // Final review before generation
  | "complete"; // Ready to generate

/**
 * Type of option presented to user
 */
export type OptionType =
  | "single" // Select one option
  | "multi" // Select multiple options
  | "confirm" // Yes/No confirmation
  | "text"; // Free text input expected

/**
 * A clickable option in the guidance UI
 */
export interface GuidanceOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  selected?: boolean;
}

/**
 * Active question with options (the mini-form part of hybrid)
 */
export interface ActiveQuestion {
  id: string;
  type: OptionType;
  question: string;
  options: GuidanceOption[];
  allowCustom: boolean; // Allow "Autre" free text
  required: boolean;
}

/**
 * A message in the guidance conversation
 */
export interface GuidanceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  // For assistant messages, may include options
  activeQuestion?: ActiveQuestion;
  // For user messages, tracks selected options
  selectedOptions?: string[];
}

/**
 * Detected context from user input
 */
export interface DetectedContext {
  domain: string; // "crm", "project", "inventory", "finance", "custom"
  confidence: number; // 0-1
  suggestedPatterns: string[]; // Patterns AI will draw from
  complexity: "simple" | "medium" | "complex";
}

/**
 * Complete guidance state
 */
export interface GuidanceState {
  toolId: string;
  messages: GuidanceMessage[];
  artifact: Partial<ArtifactBase>;
  detectedContext: DetectedContext | null;
  phase: GuidancePhase;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// AI Response Structure
// ============================================

/**
 * Structured response from AI guidance
 */
export interface GuidanceAIResponse {
  // The conversational message
  message: string;

  // Optional question with clickable options
  question?: {
    type: OptionType;
    text: string;
    options: Array<{
      label: string;
      description?: string;
    }>;
    allowCustom: boolean;
  };

  // Updates to the artifact being built
  artifactUpdate?: {
    toolName?: string;
    entities?: Array<{
      name: string;
      fields?: Array<{
        name: string;
        type: Field["type"];
      }>;
    }>;
    rules?: Array<{
      condition: string;
      action: string;
    }>;
  };

  // Detected context (updated as conversation progresses)
  contextUpdate?: {
    domain: string;
    confidence: number;
    suggestedPatterns: string[];
    complexity: "simple" | "medium" | "complex";
  };

  // Phase transition
  nextPhase?: GuidancePhase;

  // Should we show confirmation screen?
  readyToConfirm?: boolean;
}

// ============================================
// API Types
// ============================================

/**
 * Request body for guidance chat API
 */
export interface GuidanceChatRequest {
  toolId: string;
  message: string;
  selectedOptions?: string[];
  currentArtifact: Partial<ArtifactBase>;
  currentPhase: GuidancePhase;
  messageHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

/**
 * Streamed response from guidance chat API
 */
export interface GuidanceChatResponse {
  success: boolean;
  data?: GuidanceAIResponse;
  error?: string;
}

// ============================================
// UI Component Props
// ============================================

export interface GuidanceChatProps {
  toolId: string;
  initialArtifact?: Partial<ArtifactBase>;
  onComplete: (artifact: ArtifactBase) => void;
}

export interface GuidanceMessageProps {
  message: GuidanceMessage;
  onOptionSelect?: (optionIds: string[]) => void;
  isLatest?: boolean;
}

export interface GuidanceOptionsProps {
  question: ActiveQuestion;
  onSelect: (optionIds: string[]) => void;
  disabled?: boolean;
}

export interface GuidanceInputProps {
  onSend: (message: string, selectedOptions?: string[]) => void;
  activeQuestion?: ActiveQuestion;
  disabled?: boolean;
  placeholder?: string;
}

export interface GuidancePreviewProps {
  artifact: Partial<ArtifactBase>;
  phase: GuidancePhase;
  detectedContext: DetectedContext | null;
}

// ============================================
// Constants
// ============================================

export const GUIDANCE_PHASES: Record<
  GuidancePhase,
  { label: string; description: string; progress: number }
> = {
  welcome: {
    label: "Bienvenue",
    description: "Decris ton outil",
    progress: 0,
  },
  discovering: {
    label: "Decouverte",
    description: "Comprendre tes besoins",
    progress: 25,
  },
  refining: {
    label: "Precision",
    description: "Affiner les details",
    progress: 60,
  },
  confirming: {
    label: "Confirmation",
    description: "Valider avant generation",
    progress: 90,
  },
  complete: {
    label: "Pret",
    description: "Pret a generer",
    progress: 100,
  },
};

export const MAX_GUIDANCE_MESSAGES = 20;
export const GUIDANCE_MESSAGE_MAX_LENGTH = 1000;
