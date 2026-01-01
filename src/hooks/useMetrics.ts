import { useState, useCallback, useEffect } from "react";
import { UsageStats } from "../components/dashboard/types";
import { config } from "../config";

export function useMetrics() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${config.api.baseUrl}/admin/usage`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setError(null);
      } else {
        throw new Error("Failed to fetch metrics");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
