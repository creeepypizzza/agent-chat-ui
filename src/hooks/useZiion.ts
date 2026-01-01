import { useState, useEffect, useCallback } from "react";
import { config } from "../config";

export interface ZiionService {
  id: string;
  label: string;
  group: string;
  description: string;
  status: "running" | "stopped" | "failed" | "unknown" | "active" | "online" | "starting" | "stopping";
  actions: string[];
  deps?: string[];
}

interface UseZiionReturn {
  services: ZiionService[];
  loading: boolean;
  error: string | null;
  executeAction: (serviceId: string, action: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useZiion(): UseZiionReturn {
  const [services, setServices] = useState<ZiionService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${config.api.baseUrl}/ziion/services`);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
        setError(null);
      } else {
        throw new Error("Failed to fetch services");
      }
    } catch (e) {
      console.error("Failed to check ZIION status", e);
      // Don't clear services on error, just set error
      setError("Failed to fetch service status");
    }
  }, []);

  const executeAction = async (serviceId: string, action: string) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    // Optimistic update? No, wait for confirmation
    try {
      const res = await fetch(`${config.api.baseUrl}/ziion/services/${serviceId}/${action}`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        // Refresh immediately to show new status
        await fetchStatus();
      } else {
        setError(data.detail || "Unknown error");
      }
    } catch (e) {
        setError(`Failed to execute ${action}`);
        console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto refresh every 5 seconds for lighter checks
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    services,
    loading,
    error,
    executeAction,
    refreshStatus: fetchStatus,
  };
}
