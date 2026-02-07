"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type ToolStatusChange = {
  toolId: string;
  toolName: string;
  newStatus: string;
};

/**
 * Subscribes to Supabase Realtime changes on the tools table
 * filtered by org_id. Calls onStatusChange when a tool's status changes.
 *
 * Cleanup: automatically removes the channel on unmount.
 */
export function useRealtimeTools(
  orgId: string | null,
  onStatusChange: (change: ToolStatusChange) => void,
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(onStatusChange);
  callbackRef.current = onStatusChange;

  const stableCallback = useCallback((change: ToolStatusChange) => {
    callbackRef.current(change);
  }, []);

  useEffect(() => {
    if (!orgId) return;

    // createBrowserClient() from @supabase/ssr returns a singleton — safe to call per-effect
    const supabase = createClient();
    const channel = supabase
      .channel(`tools:org:${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tools",
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as string;
          const toolId = payload.new.id as string;
          const toolName = payload.new.name as string;

          stableCallback({ toolId, toolName, newStatus });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.info("[B-WORK:realtime] Subscribed to tools changes", {
            orgId,
          });
        }
        if (status === "CHANNEL_ERROR") {
          console.error("[B-WORK:realtime] Channel error", { orgId });
        }
      });

    channelRef.current = channel;

    return () => {
      console.info("[B-WORK:realtime] Unsubscribing from tools changes", {
        orgId,
      });
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [orgId, stableCallback]);
}
