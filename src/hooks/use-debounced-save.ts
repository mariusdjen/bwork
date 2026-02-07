"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ARTIFACT_DEBOUNCE_MS } from "@/lib/constants";

type SaveResult = { error?: string; success?: string } | null;

export function useDebouncedSave<T>(
  saveFn: (data: T) => Promise<SaveResult>,
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const save = useCallback(
    (data: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        if (!mountedRef.current) return;
        setIsSaving(true);
        setLastError(null);
        try {
          const result = await saveFn(data);
          if (mountedRef.current && result?.error) {
            setLastError(result.error);
          }
        } finally {
          if (mountedRef.current) {
            setIsSaving(false);
          }
        }
      }, ARTIFACT_DEBOUNCE_MS);
    },
    [saveFn],
  );

  return { save, isSaving, lastError };
}
