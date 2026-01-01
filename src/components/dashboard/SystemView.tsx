import React, { useState } from "react";
import { useSystem } from "../../hooks/useSystem";
import { LogViewer } from "./LogViewer";
import { ToolsExplorer } from "./ToolsExplorer";

function StatusIndicator({ status, label }: { status: string; label: string }) {
  const isOk = status === "OK" || status === "connected" || status === "configured";
  
  // Handle empty or missing status
  if (!status) status = "Unknown";
  
  return (
    <div className="flex items-center justify-between p-3 bg-[#0d1117] rounded border border-[#30363d]">
      <span className="text-[#c9d1d9] font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isOk ? "bg-green-400" : "bg-red-400"}`} />
        <span className={`text-sm ${isOk ? "text-green-400" : "text-red-400"}`}>{status}</span>
      </div>
    </div>
  );
}

export function SystemView() {
  const { health, loading, error } = useSystem();
  
  if (loading) {
    return <div className="flex items-center justify-center h-full text-[#8b949e]">Loading system status...</div>;
  }

  if (error || !health) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        Error loading system status: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2 min-h-full pb-8">
      {/* Component Health - Top Left */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 h-fit">
        <h2 className="text-[#f0f6fc] font-semibold mb-4 flex items-center gap-2">
          <span>💚</span> Component Health
        </h2>
        <div className="space-y-3">
          <StatusIndicator label="ZIION VM" status={health.components.ziion?.status || "Unknown"} />
          <StatusIndicator label="Slither" status={health.components.slither?.version ? "OK" : "Missing"} />
          <StatusIndicator label="Foundry" status={health.components.foundry?.version ? "OK" : "Missing"} />
          <div className="border-t border-[#30363d] my-3" />
          <StatusIndicator label="Gemini API" status={health.api_keys.google} />
          <StatusIndicator label="Etherscan API" status={health.api_keys.etherscan} />
          <StatusIndicator label="LangSmith Trace" status={health.api_keys.langsmith} />
        </div>
      </div>

      {/* Log Viewer - Top Right (replaces Error Panel) */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col h-[500px]">
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-[#f0f6fc] font-semibold flex items-center gap-2">
                <span>📜</span> System Logs
             </h2>
        </div>
        <LogViewer maxEntries={500} />
      </div>

       {/* MCP Tools Explorer - Bottom Full Width */}
      <div className="lg:col-span-2">
         <h2 className="text-[#f0f6fc] font-semibold mb-3 flex items-center gap-2 ml-1">
          <span>🔧</span> MCP Tools Workbench
        </h2>
        <ToolsExplorer />
      </div>
    </div>
  );
}
