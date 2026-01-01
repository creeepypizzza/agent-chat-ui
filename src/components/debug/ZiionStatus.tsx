"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Server, CheckCircle2, XCircle } from "lucide-react";
import { config } from "../../config";

interface HealthData {
  status: string;
  components: {
    ziion?: {
      status: string;
      tool_count?: number;
      mode?: string;
      error?: string;
    };
    slither?: {
      version: string;
    };
    foundry?: {
      version: string;
    };
  };
}

export function ZiionStatus() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${config.api.baseUrl}/admin/health`);
      if (!res.ok) throw new Error("Failed to fetch health data");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Server className="h-4 w-4" /> ZIION MCP Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-3 w-3 animate-spin" /> Connecting...
          </div>
        </CardContent>
      </Card>
    );
  }

  const ziion = data?.components?.ziion;
  const isConnected = ziion?.status === "connected";

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" /> ZIION MCP Status
          </div>
          {isConnected ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">Connected</Badge>
          ) : (
            <Badge variant="destructive">Disconnected</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-destructive text-sm bg-destructive/10 p-2 rounded">
            {error}
          </div>
        ) : !isConnected ? (
          <div className="text-destructive text-sm">
            Failed to connect to ZIION MCP Server.<br/>
            {ziion?.error && <span className="text-xs opacity-80">{ziion.error}</span>}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tools Loaded:</span>
              <span className="font-mono font-bold">{ziion?.tool_count ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mode:</span>
              <span className="capitalize">{ziion?.mode ?? "Unknown"}</span>
            </div>
            
            <div className="border-t pt-2 mt-2 space-y-1">
               <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Slither:</span>
                <span className="font-mono">{data?.components?.slither?.version ?? "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Foundry:</span>
                <span className="font-mono">{data?.components?.foundry?.version ?? "N/A"}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
