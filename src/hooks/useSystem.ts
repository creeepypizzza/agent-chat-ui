import { useState, useCallback, useEffect } from "react";
import { HealthStatus } from "../components/dashboard/types";

import { config } from "../config";

const API_URL = config.api.baseUrl;

export function useSystem() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/info`);
      if (res.ok) {
        const data = await res.json();
        // Map /info response to HealthStatus structure
        setHealth({
             status: data.status,
             timestamp: new Date().toISOString(),
             components: {
                 ziion: { status: "unknown" },
                 slither: { version: "" },
                 foundry: { version: "" }
             },
             api_keys: {
                 etherscan: "unknown",
                 google: "unknown",
                 langsmith: "unknown"
             }
        });
        setError(null);
      } else {
        throw new Error("Failed to fetch system health");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return { health, loading, error, refetch: fetchHealth };
}
