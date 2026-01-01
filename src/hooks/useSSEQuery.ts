import { useQuery, QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

/**
 * Generic hook for Server-Sent Events (SSE) with React Query integration
 * 
 * @param queryKey - React Query key for caching
 * @param url - SSE endpoint URL
 * @param initialData - Initial data before SSE connection
 * @returns React Query result with SSE-driven updates
 */
export function useSSEQuery<T>(
  queryKey: QueryKey,
  url: string,
  initialData: T
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => initialData,
    initialData,
    staleTime: Infinity, // SSE handles updates, cache is always fresh
  });

  useEffect(() => {
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        queryClient.setQueryData(queryKey, data);
      } catch (error) {
        console.error("Failed to parse SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url, queryKey, queryClient]);

  return query;
}
