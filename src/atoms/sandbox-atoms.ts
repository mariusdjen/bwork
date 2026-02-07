/**
 * Sandbox Atoms
 *
 * Jotai atoms for sandbox state management.
 */

import { atom } from "jotai";
import type { SandboxStatus } from "@/types/sandbox";

/**
 * Current sandbox state
 */
export interface SandboxState {
  id: string;
  toolId: string;
  status: SandboxStatus;
  url: string | null;
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  buildPassed: boolean | null;
  testsPassed: boolean | null;
  healthCheckPassed: boolean | null;
}

/**
 * Active sandbox atom
 */
export const activeSandboxAtom = atom<SandboxState | null>(null);

/**
 * Sandbox progress state
 */
export interface SandboxProgressState {
  step: string;
  percent: number;
  message: string;
  isRepairing: boolean;
}

/**
 * Sandbox progress atom
 */
export const sandboxProgressAtom = atom<SandboxProgressState | null>(null);

/**
 * Sandbox loading state
 */
export const sandboxLoadingAtom = atom<boolean>(false);

/**
 * Sandbox error state
 */
export const sandboxErrorAtom = atom<string | null>(null);

/**
 * Derived atom: is sandbox ready?
 */
export const isSandboxReadyAtom = atom(
  (get) => get(activeSandboxAtom)?.status === "ready"
);

/**
 * Derived atom: is sandbox failed?
 */
export const isSandboxFailedAtom = atom(
  (get) => get(activeSandboxAtom)?.status === "failed"
);

/**
 * Derived atom: can retry sandbox?
 */
export const canRetrySandboxAtom = atom((get) => {
  const sandbox = get(activeSandboxAtom);
  return sandbox?.status === "failed" && sandbox.retryCount < sandbox.maxRetries;
});

/**
 * Progress step labels (French)
 */
export const PROGRESS_LABELS: Record<string, { label: string; percent: number }> = {
  pending: { label: "Demarrage...", percent: 0 },
  provisioning: { label: "Creation de l'environnement...", percent: 15 },
  setup: { label: "Configuration de Vite...", percent: 30 },
  applying_code: { label: "Application du code...", percent: 45 },
  installing_packages: { label: "Installation des packages...", percent: 60 },
  validating: { label: "Verification du build...", percent: 75 },
  repairing: { label: "Correction automatique...", percent: 85 },
  ready: { label: "Pret!", percent: 100 },
  failed: { label: "Echec", percent: 100 },
  terminated: { label: "Termine", percent: 100 },
};

/**
 * Get progress info for a status
 */
export function getProgressForStatus(status: SandboxStatus): {
  label: string;
  percent: number;
} {
  return PROGRESS_LABELS[status] || { label: status, percent: 0 };
}
