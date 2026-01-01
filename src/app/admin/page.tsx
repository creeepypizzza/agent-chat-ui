"use client";

import React, { useState, useEffect } from "react";
import { useServices, ZiionService } from "../../hooks/useServices";
import { config } from "../../config";

export default function AdminPage() {
  const { services, executeAction, isExecuting, error: servicesError } = useServices();
  const [apiStatus, setApiStatus] = useState<string>("unknown");

  const checkApiStatus = async () => {
    setApiStatus("checking...");
    try {
        const res = await fetch(`${config.api.baseUrl}/info`);
        if (res.ok) {
            setApiStatus("online");
        } else {
            setApiStatus("offline");
        }
    } catch (e) {
         setApiStatus("offline");
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (serviceId: string, action: string) => {
    try {
      await executeAction({ serviceId, action });
    } catch (error) {
      // Error is already handled by React Query
      console.error(`Failed to ${action} ${serviceId}:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-mono p-8">
      <header className="mb-8 border-b border-[#30363d] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-gradient-to-br from-[#58a6ff] to-[#238636] rounded-full flex items-center justify-center">
               <span className="text-white font-bold">H</span>
             </div>
             <h1 className="text-2xl font-bold text-white">System Admin</h1>
        </div>
        <button onClick={checkApiStatus} disabled={isExecuting} className="px-4 py-2 bg-[#238636] text-white rounded hover:bg-[#2ea043] disabled:opacity-50">
            Refresh Status
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#58a6ff]">System Health</h2>
            <div className="space-y-4">
                <StatusItem label="LangGraph Server" status={apiStatus} />
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">HOST ENVIRONMENT</p>
                  <StatusItem label="Watchdog Service" status={apiStatus === 'online' ? 'active' : 'unknown'} />
                </div>
            </div>
        </div>

        {/* Dynamic Service Control Panel */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#f78166]">Service Control</h2>
             
             {servicesError && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded mb-4 text-red-400 text-sm">
                    {servicesError.message || "Failed to fetch services"}
                </div>
             )}

             <div className="space-y-4">
                {services.length === 0 && !isExecuting && (
                    <p className="text-gray-500 text-center py-4">No managed services found.</p>
                )}
                
                {services.map((service) => (
                    <ServiceRow 
                        key={service.id} 
                        service={service} 
                        allServices={services}
                        loading={isExecuting} 
                        onAction={handleAction} 
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: string }) {
    let color = "text-gray-400";
    let icon = "○";
    
    if (status === "online" || status === "running" || status === "active" || status === "connected") {
        color = "text-green-400";
        icon = "●";
    } else if (status === "checking..." || status === "starting" || status === "stopping") {
        color = "text-yellow-400";
        icon = "◌";
    } else if (status === "offline" || status === "stopped" || status === "disconnected" || status === "failed") {
        color = "text-red-400";
        icon = "●";
    }
    
    return (
        <div className="flex justify-between items-center bg-[#0d1117] p-3 rounded border border-[#30363d]">
            <span>{label}</span>
            <span className={`uppercase font-bold ${color} flex items-center gap-2`}>
                {icon} {status}
            </span>
        </div>
    )
}

function ServiceRow({ service, allServices, loading, onAction }: { service: ZiionService; allServices: ZiionService[]; loading: boolean; onAction: (id: string, action: string) => void }) {
    // Calculate unsatisfied dependencies
    const unsatisfiedDeps = service.deps?.filter(depId => {
        const dep = allServices.find(s => s.id === depId);
        // Consider running or active as valid states
        return !dep || (dep.status !== "running" && dep.status !== "active");
    }) || [];

    const isReady = unsatisfiedDeps.length === 0;

    return (
        <div className="bg-[#0d1117] p-4 rounded border border-[#30363d]">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                        {service.label}
                        <span className="text-xs px-1.5 py-0.5 rounded border border-[#30363d] text-gray-500">{service.group}</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                    
                    {!isReady && (
                        <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                            <span>⚠️ Waiting for:</span>
                            {unsatisfiedDeps.map(depId => {
                                const dep = allServices.find(s => s.id === depId);
                                return <span key={depId} className="font-mono bg-yellow-900/30 px-1 rounded">{dep?.label || depId}</span>
                            })}
                        </p>
                    )}
                </div>
                <StatusItem label="" status={service.status} />
            </div>
            
            <div className="flex gap-2 justify-end pt-2 border-t border-[#30363d]/50">
                {service.actions.includes("start") && (
                    <button 
                        onClick={() => onAction(service.id, "start")}
                        disabled={loading || service.status === "running" || !isReady}
                        className="px-3 py-1 text-xs font-medium bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/50 rounded hover:bg-[#1f6feb]/40 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={!isReady ? "Dependencies not running" : ""}
                    >
                        Start
                    </button>
                )}
                 {service.actions.includes("restart") && (
                    <button 
                        onClick={() => onAction(service.id, "restart")}
                        disabled={loading || !isReady}
                        className="px-3 py-1 text-xs font-medium bg-[#d29922]/20 text-[#d29922] border border-[#d29922]/50 rounded hover:bg-[#d29922]/40 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={!isReady ? "Dependencies not running" : ""}
                    >
                        Restart
                    </button>
                )}
                {service.actions.includes("stop") && (
                    <button 
                         onClick={() => onAction(service.id, "stop")}
                        disabled={loading || service.status === "stopped"}
                        className="px-3 py-1 text-xs font-medium bg-[#da3633]/20 text-[#f85149] border border-[#da3633]/50 rounded hover:bg-[#da3633]/40 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Stop
                    </button>
                )}
            </div>
        </div>
    );
}
