"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Play, Pause, RefreshCw } from "lucide-react";
import Link from "next/link";

// Mock activity log
const mockActivityLog = [
  { time: "12:25:30", node: "input_coordinator", message: "Received audit request for UniswapV4", type: "info" },
  { time: "12:25:31", node: "supervisor", message: "Dispatching to scanner", type: "info" },
  { time: "12:25:35", node: "scanner", message: "Running Slither analysis...", type: "running" },
  { time: "12:25:42", node: "scanner", message: "Slither found 3 potential issues", type: "warning" },
  { time: "12:25:45", node: "scanner", message: "Running Aderyn analysis...", type: "running" },
  { time: "12:25:50", node: "scanner", message: "Aderyn completed. 1 critical finding.", type: "error" },
  { time: "12:25:52", node: "supervisor", message: "Dispatching to planner for attack strategy", type: "info" },
  { time: "12:26:00", node: "planner", message: "Analyzing reentrancy vector...", type: "running" },
];

// Mock ZIION activity
const mockZiionActivity = [
  { time: "12:25:35", cmd: "cd /workspace/audit-1 && slither . --json slither-output.json", status: "done" },
  { time: "12:25:45", cmd: "aderyn . --output aderyn-report.md", status: "done" },
  { time: "12:26:00", cmd: "cat src/UniswapV4Pool.sol | head -100", status: "running" },
];

function LogEntry({ log }: { log: typeof mockActivityLog[0] }) {
  const colors: Record<string, string> = {
    info: "text-[#8b949e]",
    running: "text-[#58a6ff]",
    warning: "text-[#d29922]",
    error: "text-[#f85149]",
  };
  
  return (
    <div className="flex gap-3 py-1 font-mono text-xs">
      <span className="text-[#484f58] shrink-0">{log.time}</span>
      <span className="text-[#7ee787] shrink-0 w-24">[{log.node}]</span>
      <span className={colors[log.type]}>{log.message}</span>
    </div>
  );
}

export default function OperationDetailPage() {
  const params = useParams();
  const operationId = params.sessionId as string;
  
  const [logs, setLogs] = useState(mockActivityLog);
  const [ziionLogs, setZiionLogs] = useState(mockZiionActivity);
  const [activeTab, setActiveTab] = useState<"agent" | "ziion">("agent");

  // Simulate streaming logs
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        node: ["scanner", "planner", "coder", "supervisor"][Math.floor(Math.random() * 4)],
        message: "Processing...",
        type: ["info", "running"][Math.floor(Math.random() * 2)],
      };
      setLogs(prev => [...prev.slice(-50), newLog]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/operations" className="p-2 hover:bg-[#21262d] rounded">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#f0f6fc]">Operation: {operationId}</h1>
            <p className="text-sm text-[#8b949e]">Uniswap V4 Audit Session</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#d29922] text-black rounded text-sm hover:bg-[#e3b341] flex items-center gap-1">
            <Pause size={14} /> Pause
          </button>
          <button className="px-3 py-1.5 bg-[#21262d] text-[#c9d1d9] rounded text-sm hover:bg-[#30363d] flex items-center gap-1">
            <RefreshCw size={14} /> Restart
          </button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 border-b border-[#30363d]">
        <button 
          onClick={() => setActiveTab("agent")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "agent" 
              ? "border-[#58a6ff] text-[#58a6ff]" 
              : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
          }`}
        >
          🤖 Agent Activity
        </button>
        <button 
          onClick={() => setActiveTab("ziion")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "ziion" 
              ? "border-[#58a6ff] text-[#58a6ff]" 
              : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
          }`}
        >
          🖥️ ZIION Terminal
        </button>
      </div>

      {/* Log Panel */}
      <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="h-full overflow-auto p-4">
          {activeTab === "agent" ? (
            <div className="space-y-0.5">
              {logs.map((log, i) => (
                <LogEntry key={i} log={log} />
              ))}
              <div className="text-[#58a6ff] animate-pulse">▌</div>
            </div>
          ) : (
            <div className="space-y-2">
              {ziionLogs.map((cmd, i) => (
                <div key={i} className="font-mono text-xs">
                  <div className="text-[#484f58]"># {cmd.time}</div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#7ee787]">$</span>
                    <span className="text-[#c9d1d9]">{cmd.cmd}</span>
                  </div>
                  <div className={`ml-4 ${cmd.status === "running" ? "text-[#58a6ff]" : "text-[#8b949e]"}`}>
                    {cmd.status === "running" ? "⏳ Running..." : "✓ Done"}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 text-[#58a6ff]">
                <span className="text-[#7ee787]">$</span>
                <span className="animate-pulse">▌</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-[#8b949e] border-t border-[#30363d] pt-4">
        <div>
          Current Phase: <span className="text-[#58a6ff] font-mono">planner</span>
        </div>
        <div className="flex gap-4">
          <span>Duration: <span className="text-[#c9d1d9] font-mono">00:05:23</span></span>
          <span>Tokens: <span className="text-[#c9d1d9] font-mono">12,456</span></span>
          <span>Cost: <span className="text-[#c9d1d9] font-mono">$0.0234</span></span>
        </div>
      </div>
    </div>
  );
}
