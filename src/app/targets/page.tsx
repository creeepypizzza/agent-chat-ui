"use client";

import React, { useState } from "react";
import { Plus, ExternalLink, Play, Trash2, Target, BookOpen, FlaskConical } from "lucide-react";

// Types
interface BountyTarget {
  id: string;
  name: string;
  platform: string;
  category: "production" | "training" | "sandbox";
  rewardMax: number;
  status: "active" | "pending" | "archived";
  lastAudit: string | null;
  scope: string[];
  url?: string;
}

// Local storage key
const STORAGE_KEY = "hacker_ai_targets";

// Load/save from localStorage
function loadTargets(): BountyTarget[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveTargets(targets: BountyTarget[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
}

// Category Badge Component
function CategoryBadge({ category }: { category: BountyTarget["category"] }) {
  const config = {
    production: { 
      icon: <Target size={12} />, 
      label: "Production", 
      color: "bg-[#f85149] text-white" 
    },
    training: { 
      icon: <BookOpen size={12} />, 
      label: "Training", 
      color: "bg-[#a371f7] text-white" 
    },
    sandbox: { 
      icon: <FlaskConical size={12} />, 
      label: "Sandbox", 
      color: "bg-[#8b949e] text-white" 
    },
  };
  const { icon, label, color } = config[category];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {icon} {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-[#238636] text-white",
    pending: "bg-[#d29922] text-black",
    archived: "bg-[#484f58] text-[#8b949e]",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

// Empty State Component
function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-[#21262d] rounded-full flex items-center justify-center">
        <Target size={32} className="text-[#8b949e]" />
      </div>
      <h2 className="text-lg font-semibold text-[#f0f6fc] mb-2">バウンティターゲットがありません</h2>
      <p className="text-[#8b949e] mb-6 max-w-md mx-auto">
        監査対象を追加して、バグバウンティハンティングを開始しましょう。
        Production（本番）、Training（学習）、Sandbox（実験）のカテゴリで管理できます。
      </p>
      <div className="flex justify-center gap-4">
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]"
        >
          <Plus size={16} /> ターゲットを追加
        </button>
      </div>
      
      {/* Quick Guide */}
      <div className="mt-8 pt-8 border-t border-[#30363d]">
        <h3 className="text-sm font-medium text-[#f0f6fc] mb-4">カテゴリについて</h3>
        <div className="grid grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
          <div className="p-3 bg-[#21262d] rounded-lg">
            <CategoryBadge category="production" />
            <p className="text-xs text-[#8b949e] mt-2">実際のバグバウンティ。発見は報酬対象。</p>
          </div>
          <div className="p-3 bg-[#21262d] rounded-lg">
            <CategoryBadge category="training" />
            <p className="text-xs text-[#8b949e] mt-2">CTF/学習用。スキル向上が目的。</p>
          </div>
          <div className="p-3 bg-[#21262d] rounded-lg">
            <CategoryBadge category="sandbox" />
            <p className="text-xs text-[#8b949e] mt-2">テスト/実験用。自由に試行錯誤。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TargetsPage() {
  const [targets, setTargets] = useState<BountyTarget[]>(() => loadTargets());
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Form state
  const [newTarget, setNewTarget] = useState({
    name: "",
    platform: "Manual",
    category: "sandbox" as BountyTarget["category"],
    rewardMax: 0,
    url: "",
  });

  const handleAddTarget = () => {
    const target: BountyTarget = {
      id: `target-${Date.now()}`,
      name: newTarget.name,
      platform: newTarget.platform,
      category: newTarget.category,
      rewardMax: newTarget.rewardMax,
      status: "pending",
      lastAudit: null,
      scope: [],
      url: newTarget.url,
    };
    const updated = [...targets, target];
    setTargets(updated);
    saveTargets(updated);
    setShowAddModal(false);
    setNewTarget({ name: "", platform: "Manual", category: "sandbox", rewardMax: 0, url: "" });
  };

  const handleDeleteTarget = (id: string) => {
    const updated = targets.filter(t => t.id !== id);
    setTargets(updated);
    saveTargets(updated);
  };

  const filteredTargets = categoryFilter === "all" 
    ? targets 
    : targets.filter(t => t.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc]">Bounty Targets</h1>
          <p className="text-sm text-[#8b949e]">バウンティプログラムと監査対象の管理</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
        >
          <Plus size={16} />
          Add Target
        </button>
      </div>

      {/* Empty State */}
      {targets.length === 0 && <EmptyState onAddClick={() => setShowAddModal(true)} />}

      {/* Filter & Table */}
      {targets.length > 0 && (
        <>
          {/* Category Filter */}
          <div className="flex gap-2">
            {["all", "production", "training", "sandbox"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  categoryFilter === cat
                    ? "bg-[#1f6feb] text-white"
                    : "bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Targets Table */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#30363d] text-left text-xs text-[#8b949e] uppercase tracking-wider">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Max Reward</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map((target) => (
                  <tr key={target.id} className="border-b border-[#30363d] hover:bg-[#21262d] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#f0f6fc]">{target.name}</div>
                      <div className="text-xs text-[#8b949e]">{target.scope.length} files in scope</div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={target.category} />
                    </td>
                    <td className="px-4 py-3 text-[#8b949e]">
                      <span className="flex items-center gap-1">
                        {target.platform}
                        {target.platform !== "Manual" && <ExternalLink size={12} />}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#238636]">
                      {target.rewardMax > 0 ? `$${target.rewardMax.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={target.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-2 text-[#58a6ff] hover:bg-[#1f6feb26] rounded transition-colors"
                          title="Start Audit"
                        >
                          <Play size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTarget(target.id)}
                          className="p-2 text-[#f85149] hover:bg-[#f8514926] rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-[#f0f6fc] mb-4">ターゲットを追加</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">名前 *</label>
                <input 
                  type="text"
                  value={newTarget.name}
                  onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                  placeholder="e.g., Uniswap V4"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm focus:border-[#58a6ff] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">カテゴリ *</label>
                <select
                  value={newTarget.category}
                  onChange={(e) => setNewTarget({ ...newTarget, category: e.target.value as BountyTarget["category"] })}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm"
                >
                  <option value="sandbox">🧪 Sandbox (テスト/実験)</option>
                  <option value="training">📚 Training (学習/CTF)</option>
                  <option value="production">🎯 Production (本番バウンティ)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">プラットフォーム</label>
                <select
                  value={newTarget.platform}
                  onChange={(e) => setNewTarget({ ...newTarget, platform: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm"
                >
                  <option value="Manual">Manual</option>
                  <option value="Immunefi">Immunefi</option>
                  <option value="Code4rena">Code4rena</option>
                  <option value="Sherlock">Sherlock</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">最大報酬 (USD)</label>
                <input 
                  type="number"
                  value={newTarget.rewardMax}
                  onChange={(e) => setNewTarget({ ...newTarget, rewardMax: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">URL (GitHub/Etherscan)</label>
                <input 
                  type="url"
                  value={newTarget.url}
                  onChange={(e) => setNewTarget({ ...newTarget, url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-[#c9d1d9] text-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-[#21262d] text-[#c9d1d9] rounded-md hover:bg-[#30363d]"
              >
                キャンセル
              </button>
              <button 
                onClick={handleAddTarget}
                disabled={!newTarget.name}
                className="flex-1 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
