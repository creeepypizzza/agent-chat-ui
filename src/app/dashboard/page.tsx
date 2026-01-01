"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useZiion } from "../../hooks/useZiion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { AnalysisView } from "../../components/dashboard/AnalysisView";
import { MetricsView } from "../../components/dashboard/MetricsView";
import { SystemView } from "../../components/dashboard/SystemView";
import { FindingsView } from "../../components/dashboard/FindingsView";
import { ApprovalModal } from "../../components/dashboard/ApprovalModal";
import { Target, Zap, AlertTriangle, Rocket } from "lucide-react";

// Metric Card Component
function MetricCard({ title, value, subValue, color, icon }: { title: string; value: string | number; subValue?: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-[#8b949e] uppercase tracking-wider">{title}</div>
        {icon && <div className="text-[#8b949e]">{icon}</div>}
      </div>
      <div className={`text-2xl font-bold ${color || "text-[#f0f6fc]"}`}>{value}</div>
      {subValue && <div className="text-xs text-[#8b949e] mt-1">{subValue}</div>}
    </div>
  );
}

// Welcome State
function WelcomeState() {
  return (
    <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-lg p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-[#238636] rounded-full flex items-center justify-center">
          <Rocket size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#f0f6fc]">Hacker AI へようこそ</h2>
          <p className="text-[#8b949e]">バグバウンティハンティングを始めましょう</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/targets" className="block p-4 bg-[#21262d] rounded-lg hover:bg-[#30363d] transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} className="text-[#58a6ff]" />
            <span className="font-medium text-[#f0f6fc] group-hover:text-[#58a6ff]">1. ターゲットを追加</span>
          </div>
          <p className="text-xs text-[#8b949e]">監査対象のコントラクトを登録</p>
        </Link>
        
        <div className="p-4 bg-[#21262d] rounded-lg opacity-60">
          <div className="flex items-center gap-3 mb-2">
            <Zap size={20} className="text-[#8b949e]" />
            <span className="font-medium text-[#8b949e]">2. 監査を開始</span>
          </div>
          <p className="text-xs text-[#8b949e]">ターゲット追加後に有効化</p>
        </div>
        
        <div className="p-4 bg-[#21262d] rounded-lg opacity-60">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-[#8b949e]" />
            <span className="font-medium text-[#8b949e]">3. 脆弱性を報告</span>
          </div>
          <p className="text-xs text-[#8b949e]">発見後に有効化</p>
        </div>
      </div>
      
      <div className="text-xs text-[#8b949e] border-t border-[#30363d] pt-4">
        💡 ヒント: まずは「Sandbox」カテゴリでテスト監査を試してみてください
      </div>
    </div>
  );
}

// ZIION Status Component
function ZIIONStatus() {
  const { services, error } = useZiion();
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  
  useEffect(() => {
    if (error) {
        setStatus("disconnected");
    } else if (services.length > 0) {
        const isConnected = services.some(s => s.status !== "unknown");
        setStatus(isConnected ? "connected" : "disconnected");
    } else {
        setStatus("checking");
    }
  }, [services, error]);
  
  const statusConfig = {
    connected: { color: "text-green-400", label: "接続中", dot: "●" },
    disconnected: { color: "text-red-400", label: "切断", dot: "●" },
    checking: { color: "text-yellow-400", label: "確認中...", dot: "○" },
  };
  
  const { color, label, dot } = statusConfig[status];
  
  return (
    <span className={`${color}`}>{dot} ZIION: {label}</span>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [hasTargets, setHasTargets] = useState(false);
  
  useEffect(() => {
    // Check if user has any targets
    const stored = localStorage.getItem("hacker_ai_targets");
    const targets = stored ? JSON.parse(stored) : [];
    setHasTargets(targets.length > 0);
  }, []);

  // Real data will come from API (read from localStorage for now)
  const [metrics, setMetrics] = useState({
    activeTargets: 0,
    runningOps: 0,
    pendingFindings: { critical: 0, high: 0, medium: 0 },
    estimatedRewards: "$0"
  });
  
  useEffect(() => {
    const stored = localStorage.getItem("hacker_ai_targets");
    const targets = stored ? JSON.parse(stored) : [];
    setMetrics(prev => ({ ...prev, activeTargets: targets.length }));
  }, []);

  return (
    <div className="space-y-6">
      <ApprovalModal />
      
      {/* Welcome State for new users */}
      {!hasTargets && <WelcomeState />}
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Targets" 
          value={metrics.activeTargets} 
          subValue="Bounty programs"
          icon={<Target size={16} />}
        />
        <MetricCard 
          title="Running Operations" 
          value={metrics.runningOps} 
          subValue="Audit sessions"
          color="text-[#58a6ff]"
          icon={<Zap size={16} />}
        />
        <MetricCard 
          title="Pending Findings" 
          value={metrics.pendingFindings.critical + metrics.pendingFindings.high + metrics.pendingFindings.medium} 
          subValue={`${metrics.pendingFindings.critical} Critical · ${metrics.pendingFindings.high} High · ${metrics.pendingFindings.medium} Med`}
          color="text-[#f78166]"
          icon={<AlertTriangle size={16} />}
        />
        <MetricCard 
          title="Est. Rewards" 
          value={metrics.estimatedRewards} 
          subValue="If all confirmed"
          color="text-[#238636]"
        />
      </div>

      {/* Main Content Tabs */}
      {hasTargets && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-[#161b22] border border-[#30363d]">
              <TabsTrigger value="analysis">Live Operations</TabsTrigger>
              <TabsTrigger value="findings">Recent Findings</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="system">System Status</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto min-h-[500px] rounded-lg border border-[#30363d]">
            <TabsContent value="analysis" className="h-full m-0 p-0 border-none outline-none data-[state=active]:flex data-[state=active]:flex-col">
              <AnalysisView />
            </TabsContent>
            <TabsContent value="findings" className="h-full m-0 p-0 border-none outline-none data-[state=active]:flex data-[state=active]:flex-col">
              <FindingsView />
            </TabsContent>
            <TabsContent value="metrics" className="h-full m-0 p-0 border-none outline-none">
              <MetricsView />
            </TabsContent>
            <TabsContent value="system" className="h-full m-0 p-0 border-none outline-none">
              <SystemView />
            </TabsContent>
          </div>
        </Tabs>
      )}

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-[#8b949e] border-t border-[#30363d] pt-4">
        <div className="flex gap-4">
          <ZIIONStatus />
          <span className="text-green-400">● API: Online</span>
        </div>
        <div className="flex gap-4">
          <span>Total Findings: <span className="text-[#c9d1d9] font-mono">0</span></span>
          <span>Session Cost: <span className="text-[#c9d1d9] font-mono">$0.00</span></span>
        </div>
      </div>
    </div>
  );
}
