import { useEffect, useCallback, useRef } from "react";
import { LogEntry, ApprovalRequest } from "../components/dashboard/types";
import { config } from "../config";

export interface GraphEvent {
  type: "connected" | "start" | "end" | "done" | "update";
  node?: string;
  status?: string;
  data?: any;
}

export interface ProgressEvent {
  agent: string;
  message: string;
  progress?: number;
  details?: any;
}

export interface FindingEvent {
  finding_id: string;
  severity: string;
  title: string;
  description: string;
  location?: string;
  code_snippet?: string;
}

export interface CodeEvent {
  code_type: string;
  filename: string;
  content: string;
  language: string;
  line_count?: number;
}

export interface StreamCallbacks {
  onGraphEvent?: (event: GraphEvent) => void;
  onLogEvent?: (entry: LogEntry) => void;
  onApprovalRequest?: (req: ApprovalRequest) => void;
  onProgress?: (event: ProgressEvent) => void;
  onFinding?: (event: FindingEvent) => void;
  onCode?: (event: CodeEvent) => void;
  onError?: (event: any) => void;
}

export function useGraphStream(
  callbacks: StreamCallbacks,
  enabled: boolean = false
) {
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Use the new multiplexed stream
    const source = new EventSource(`${config.api.baseUrl}/api/events/stream`);
    eventSourceRef.current = source;

    source.addEventListener("connected", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      callbacks.onGraphEvent?.({ type: "connected", status: data.status });
    });

    // Handle graph events (supported both legacy and new node_update)
    source.addEventListener("graph", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      
      // Node Update (New)
      if (data.type === "node_update") {
         callbacks.onGraphEvent?.({ 
            type: "update", 
            node: data.node, 
            status: "running",
            data: data.data 
         });
      }
      // Legacy wrapper support
      else if (data.type === "on_chain_start") {
         callbacks.onGraphEvent?.({ type: "start", node: data.node, status: "running" });
      } else if (data.type === "on_chain_end") {
         callbacks.onGraphEvent?.({ type: "end", node: data.node, status: "completed" });
      }
    });

    // Handle Progress
    source.addEventListener("progress", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        callbacks.onProgress?.(data);
        // Also emit as log for visibility
        callbacks.onLogEvent?.({
            level: "info",
            source: data.agent,
            message: data.message,
            metadata: { progress: data.progress }
        } as LogEntry);
    });

    // Handle Findings
    source.addEventListener("finding", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        callbacks.onFinding?.(data);
        callbacks.onLogEvent?.({
            level: "warning",
            source: "scanner",
            message: `New Finding: ${data.title} (${data.severity})`,
            metadata: data
        } as LogEntry);
    });

    // Handle Code Updates
    source.addEventListener("code", (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        callbacks.onCode?.(data);
    });

    // Handle Errors
    source.addEventListener("error", (e) => {
        // This is the SSE event type "error", separate from source.onerror
        try {
            const data = JSON.parse((e as MessageEvent).data);
            callbacks.onError?.(data);
            callbacks.onLogEvent?.({
                level: "error",
                source: "system",
                message: data.message || "Unknown error",
                metadata: data
            } as LogEntry);
        } catch (err) {
            console.error("Failed to parse error event", err);
        }
    });

    // Handle Logs (Legacy/Generic)
    source.addEventListener("log", (e) => {
      const entry = JSON.parse((e as MessageEvent).data) as LogEntry;
      callbacks.onLogEvent?.(entry);
    });

    // Handle Approval Requests
    source.addEventListener("approval_request", (e) => {
        const req = JSON.parse((e as MessageEvent).data) as ApprovalRequest;
        callbacks.onApprovalRequest?.(req);
    });

    source.addEventListener("done", (e) => {
      callbacks.onGraphEvent?.({ type: "done" });
      source.close();
      eventSourceRef.current = null;
    });

    source.onerror = () => {
      console.debug("SSE connection unavailable - backend may be offline");
      source.close();
      eventSourceRef.current = null;
    };

    return source;
  }, [callbacks]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => disconnect();
  }, [enabled, connect, disconnect]);

  return { connect, disconnect, isConnected: !!eventSourceRef.current };
}
