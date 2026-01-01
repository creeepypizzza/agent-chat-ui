"use client";

import React from "react";
import Link from "next/link";
import { Play, Pause, Eye, Clock, Zap, Target } from "lucide-react";

// Load operations from localStorage (placeholder - will be replaced with API)
function loadOperations() {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("hacker_ai_operations");
  return stored ? JSON.parse(stored) : [];
}

function OperationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    running: { color: "text-[#58a6ff]", icon: <span className="animate-pulse">●</span> },
    paused: { color: "text-[#d29922]", icon: <Pause size={12} /> },
    completed: { color: "text-[#238636]", icon: "✓" },
  };
  const { color, icon } = config[status] || config.paused;
  
  return (
    <span className={`flex items-center gap-1 ${color}`}>
      {icon} {status}
    </span>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-[#21262d] rounded-full flex items-center justify-center">
        <Zap size={32} className="text-[#8b949e]" />
      </div>
      <h2 className="text-lg font-semibold text-[#f0f6fc] mb-2">進行中の監査がありません</h2>
      <p className="text-[#8b949e] mb-6 max-w-md mx-auto">
        まずターゲットを追加し、「Start Audit」ボタンから監査を開始してください。
        監査が開始されると、ここにリアルタイムで進捗が表示されます。
      </p>
      <Link 
        href="/targets"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]"
      >
        <Target size={16} /> ターゲットを確認
      </Link>
    </div>
  );
}

export default function OperationsPage() {
  const operations = loadOperations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#f0f6fc]">Operations</h1>
        <p className="text-sm text-[#8b949e]">進行中および過去の監査セッション</p>
      </div>

      {/* Empty State */}
      {operations.length === 0 && <EmptyState />}

      {/* Operations List */}
      {operations.length > 0 && (
        <div className="space-y-4">
          {operations.map((op: any) => (
            <div 
              key={op.id}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#f0f6fc]">{op.targetName}</h3>
                  <div className="text-xs text-[#8b949e] flex items-center gap-2">
                    <Clock size={12} />
                    Started: {new Date(op.startedAt).toLocaleString()}
                  </div>
                </div>
                <OperationStatusBadge status={op.status} />
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[#8b949e] mb-1">
                  <span>Phase: {op.currentPhase}</span>
                  <span>{op.progress}%</span>
                </div>
                <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${op.status === "completed" ? "bg-[#238636]" : "bg-[#1f6feb]"}`}
                    style={{ width: `${op.progress}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-[#8b949e]">Findings: </span>
                  <span className="text-[#f78166] font-mono">{op.findingsCount}</span>
                </div>
                <div className="flex gap-2">
                  {op.status === "running" && (
                    <button className="px-3 py-1 text-xs bg-[#d29922] text-black rounded hover:bg-[#e3b341]">
                      <Pause size={12} className="inline mr-1" /> Pause
                    </button>
                  )}
                  {op.status === "paused" && (
                    <button className="px-3 py-1 text-xs bg-[#238636] text-white rounded hover:bg-[#2ea043]">
                      <Play size={12} className="inline mr-1" /> Resume
                    </button>
                  )}
                  <Link 
                    href={`/operations/${op.id}`}
                    className="px-3 py-1 text-xs bg-[#21262d] text-[#c9d1d9] rounded hover:bg-[#30363d] flex items-center gap-1"
                  >
                    <Eye size={12} /> View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
