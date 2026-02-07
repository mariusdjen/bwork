/**
 * SSE Stream Utilities
 *
 * Utilities for Server-Sent Events streaming for progress updates.
 */

import type { SSEEvent, SSEEventType, PipelineProgress } from "@/types/sandbox";

/**
 * Create an SSE response stream
 */
export function createSSEStream(): {
  stream: ReadableStream;
  send: (event: SSEEvent) => void;
  close: () => void;
} {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    cancel() {
      controller = null;
    },
  });

  const send = (event: SSEEvent) => {
    if (!controller) return;

    const data = JSON.stringify(event);
    const message = `data: ${data}\n\n`;
    controller.enqueue(encoder.encode(message));
  };

  const close = () => {
    if (controller) {
      controller.close();
      controller = null;
    }
  };

  return { stream, send, close };
}

/**
 * Create SSE headers
 */
export function getSSEHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

/**
 * Create progress event
 */
export function createProgressEvent(
  sandboxId: string,
  status: string,
  step: string,
  percent: number,
  message: string
): SSEEvent {
  return {
    type: "progress",
    data: {
      sandboxId,
      status: status as PipelineProgress["status"],
      step,
      percent,
      message,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create error event
 */
export function createErrorEvent(error: string): SSEEvent {
  return {
    type: "error",
    data: { error },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create completion event
 */
export function createCompleteEvent(
  success: boolean,
  sandboxUrl?: string
): SSEEvent {
  return {
    type: "complete",
    data: {
      sandboxId: "",
      status: success ? "ready" : "failed",
      step: success ? "complete" : "failed",
      percent: 100,
      message: success ? "Generation terminee!" : "Generation echouee",
      timestamp: new Date().toISOString(),
    } as PipelineProgress,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Stream pipeline progress through SSE
 */
export function createPipelineStream(
  sandboxId: string
): {
  response: Response;
  sendProgress: (step: string, percent: number, message: string) => void;
  sendError: (error: string) => void;
  sendComplete: (success: boolean, sandboxUrl?: string) => void;
} {
  const { stream, send, close } = createSSEStream();

  const sendProgress = (step: string, percent: number, message: string) => {
    send(createProgressEvent(sandboxId, step, step, percent, message));
  };

  const sendError = (error: string) => {
    send(createErrorEvent(error));
    close();
  };

  const sendComplete = (success: boolean, sandboxUrl?: string) => {
    send(createCompleteEvent(success, sandboxUrl));
    close();
  };

  const response = new Response(stream, {
    headers: getSSEHeaders(),
  });

  return { response, sendProgress, sendError, sendComplete };
}

/**
 * Progress steps mapping for pipeline
 */
export const PROGRESS_STEPS: Record<
  string,
  { percent: number; message: string }
> = {
  pending: { percent: 0, message: "Demarrage..." },
  provisioning: { percent: 10, message: "Creation de l'environnement..." },
  setup: { percent: 25, message: "Configuration de Vite..." },
  applying_code: { percent: 40, message: "Application du code..." },
  installing_packages: { percent: 55, message: "Installation des packages..." },
  validating: { percent: 75, message: "Verification du build..." },
  repairing: { percent: 85, message: "Correction des erreurs..." },
  ready: { percent: 100, message: "Pret!" },
  failed: { percent: 100, message: "Echec" },
};

/**
 * Get progress info for a status
 */
export function getProgressInfo(status: string): {
  percent: number;
  message: string;
} {
  return PROGRESS_STEPS[status] || { percent: 0, message: status };
}
