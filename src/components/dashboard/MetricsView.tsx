import React from "react";
import { useMetrics } from "../../hooks/useMetrics";
import { UsageStats } from "./types";

function formatUptime(seconds: number): string {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function formatCost(usd: number): string {
  return `$${(usd || 0).toFixed(4)}`;
}

function StatusBadge({ status }: { status: string }) {
  const isOk = status === "connected" || status === "configured" || status === "OK" || status === "running";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
        isOk ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
      }`}
    >
      {status}
    </span>
  );
}

export function MetricsView() {
  const { stats, loading, error } = useMetrics();

  if (loading) {
    return <div className="flex items-center justify-center h-full text-[#8b949e]">Loading metrics...</div>;
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        Error loading metrics: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#c9d1d9] p-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gemini API */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🧠</span>
            <h2 className="font-semibold text-[#f0f6fc]">Gemini API</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Requests</span>
              <span className="font-mono">{stats.llm.total_requests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Input Tokens</span>
              <span className="font-mono">{stats.llm.total_input_tokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Output Tokens</span>
              <span className="font-mono">{stats.llm.total_output_tokens.toLocaleString()}</span>
            </div>
            <div className="border-t border-[#30363d] pt-3 mt-3">
              <div className="flex justify-between text-base">
                <span className="text-[#c9d1d9]">Est. Cost</span>
                <span className="font-mono text-green-400 font-bold">
                  {formatCost(stats.llm.total_cost_usd)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Etherscan API */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔍</span>
            <h2 className="font-semibold text-[#f0f6fc]">Etherscan API</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Requests</span>
              <span className="font-mono">{stats.etherscan.requests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Success Rate</span>
              <span className="font-mono">{stats.etherscan.success_rate}%</span>
            </div>
             <div className="flex justify-between">
              <span className="text-[#8b949e]">Successful</span>
              <span className="font-mono text-green-400">{stats.etherscan.successful}</span>
            </div>
            <div className="border-t border-[#30363d] pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-[#c9d1d9]">Status</span>
                <StatusBadge status={stats.etherscan.status} />
              </div>
            </div>
          </div>
        </div>

        {/* ZIION VM */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🖥️</span>
            <h2 className="font-semibold text-[#f0f6fc]">ZIION VM</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Commands</span>
              <span className="font-mono">{stats.ziion.commands_executed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Session Time</span>
              <span className="font-mono">{formatUptime(stats.ziion.total_connection_time_seconds)}</span>
            </div>
            <div className="border-t border-[#30363d] pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-[#c9d1d9]">Status</span>
                <StatusBadge status={stats.ziion.is_connected ? "connected" : "disconnected"} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <h3 className="font-semibold text-[#f0f6fc] mb-4">Node Cost Breakdown (USD)</h3>
        <div className="space-y-2">
           {stats.llm.by_node ? (
             Object.entries(stats.llm.by_node).map(([nodeName, nodeStats]: [string, any]) => {
               // Calculate node total cost (simple sum of model costs)
               const nodeCost = Object.values(nodeStats).reduce((acc: number, val: any) => acc + (val.cost_usd || 0), 0);
               const width = Math.min(100, (nodeCost / stats.llm.total_cost_usd) * 100);
               
               return (
                 <div key={nodeName} className="flex items-center gap-4 text-sm">
                    <div className="w-40 truncate text-[#8b949e] font-mono">{nodeName}</div>
                    <div className="flex-1 bg-[#0d1117] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#3fb950] h-full" style={{ width: `${width || 0}%` }} />
                    </div>
                    <div className="w-20 text-right font-mono text-[#c9d1d9]">{formatCost(nodeCost)}</div>
                 </div>
               );
             })
           ) : (
             <div className="text-[#8b949e] text-sm">No usage data yet.</div>
           )}
        </div>
      </div>
    </div>
  );
}
