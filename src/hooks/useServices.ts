import { useSSEQuery } from "./useSSEQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { config } from "../config";

const API_URL = config.api.baseUrl;

export interface ZiionService {
  id: string;
  label: string;
  group: string;
  description: string;
  status: "running" | "stopped" | "failed" | "unknown" | "active" | "online" | "starting" | "stopping";
  actions: string[];
  deps?: string[];
}

/**
 * Declarative hook for managing services with real-time updates via SSE
 */
export function useServices() {
  const queryClient = useQueryClient();

  // Real-time SSE updates
  const query = useSSEQuery<ZiionService[]>(
    ["services"],
    `${API_URL}/ziion/events/services`,
    []
  );

  // Mutations for service actions
  const actionMutation = useMutation({
    mutationFn: async ({
      serviceId,
      action,
    }: {
      serviceId: string;
      action: string;
    }) => {
      const res = await fetch(
        `${API_URL}/ziion/services/${serviceId}/${action}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Action failed");
      }

      return res.json();
    },
    onSuccess: () => {
      // SSE will automatically update the cache
      // No manual invalidation needed
    },
  });

  return {
    services: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    executeAction: actionMutation.mutateAsync,
    isExecuting: actionMutation.isPending,
  };
}
