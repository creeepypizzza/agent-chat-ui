"use client";


import { useEffect, useState } from "react";
import { config } from "../../config";
import { useZiion } from "../../hooks/useZiion";

interface ConnectionStatus {
  ziion: "connected" | "disconnected" | "checking";
  api: "connected" | "disconnected" | "checking";
}

export function Header() {
  const [status, setStatus] = useState<ConnectionStatus>({
    ziion: "checking",
    api: "checking",
  });

  useEffect(() => {
    // Check API connection

    const checkConnections = async () => {
      // Check API server
      try {
        const apiUrl = config.api.baseUrl;
        const response = await fetch(`${apiUrl}/info`, { 
          method: "GET",
          signal: AbortSignal.timeout(3000)
        });
        setStatus(prev => ({ ...prev, api: response.ok ? "connected" : "disconnected" }));
      } catch {
        setStatus(prev => ({ ...prev, api: "disconnected" }));
      }
    };
    
    checkConnections();
    const interval = setInterval(checkConnections, 30000);
    return () => clearInterval(interval);
  }, []);

  // Use useZiion hook for ZIION status
  const { services, error: ziionError } = useZiion();
  
  useEffect(() => {
    if (ziionError) {
        setStatus(prev => ({ ...prev, ziion: "disconnected" }));
    } else if (services.length > 0) {
        // If we have services and at least one is known, we are connected
        const isConnected = services.some(s => s.status !== "unknown");
        setStatus(prev => ({ ...prev, ziion: isConnected ? "connected" : "disconnected" }));
    } else {
         setStatus(prev => ({ ...prev, ziion: "checking" }));
    }
  }, [services, ziionError]);



  const getStatusIndicator = (state: "connected" | "disconnected" | "checking") => {
    switch (state) {
      case "connected":
        return <span className="text-green-400">●</span>;
      case "disconnected":
        return <span className="text-red-400">●</span>;
      case "checking":
        return <span className="text-yellow-400 animate-pulse">●</span>;
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#30363d] bg-[#161b22]">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-[#f0f6fc]">Hacker AI Console</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          status.api === "connected" ? "bg-[#238636]" : "bg-[#6e7681]"
        } text-white`}>
          {status.api === "connected" ? "Online" : "Offline"}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-[#8b949e]">
        <span>ZIION: {getStatusIndicator(status.ziion)}</span>
        <span>Host: {getStatusIndicator(status.api)}</span>
      </div>
    </header>
  );
}
