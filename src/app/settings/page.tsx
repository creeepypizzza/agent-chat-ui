"use client";

import React from "react";
import { useZiion } from "../../hooks/useZiion";

export default function SettingsPage() {
  const { services, loading, error } = useZiion();
  const [ziionStatus, setZiionStatus] = React.useState<{
    ip: string;
    status: "connected" | "disconnected" | "loading";
  }>({
    ip: "192.168.64.12",
    status: "loading"
  });

  React.useEffect(() => {
    if (loading) {
        setZiionStatus(prev => ({ ...prev, status: "loading" }));
    } else if (error) {
        setZiionStatus(prev => ({ ...prev, status: "disconnected" }));
    } else if (services.length > 0) {
        const isConnected = services.some(s => s.status !== "unknown");
        setZiionStatus(prev => ({ ...prev, status: isConnected ? "connected" : "disconnected" }));
    }
  }, [services, loading, error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#f0f6fc]">Settings</h1>
        <p className="text-sm text-[#8b949e]">Configure system and API settings</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* ZIION Settings */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="font-semibold text-[#f0f6fc] mb-4">🖥️ ZIION VM</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#8b949e] mb-1">SSH Host</label>
              <input 
                type="text" 
                value={ziionStatus.ip} 
                readOnly
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8b949e] mb-1">Status</label>
              <div className="flex items-center gap-2 text-sm">
                {ziionStatus.status === "loading" ? (
                  <span className="text-yellow-400">○ Checking...</span>
                ) : ziionStatus.status === "connected" ? (
                  <>
                    <span className="text-green-400">●</span> Connected
                  </>
                ) : (
                  <>
                    <span className="text-red-400">●</span> Disconnected
                  </>
                )}
              </div>
            </div>
          </div>
        </div>



        {/* Langfuse Link */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="font-semibold text-[#f0f6fc] mb-4">📊 Observability</h2>
          <a 
            href="https://cloud.langfuse.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#58a6ff] hover:underline"
          >
            Open Langfuse Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
