import React, { useState, useEffect, useRef, useMemo } from "react";
import { LogEntry, LogLevel } from "./types";
import { useGraphStream } from "../../hooks/useGraphStream";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

import { 
  Pause, 
  Play, 
  Search, 
  Download, 
  Trash2, 
  Filter 
} from "lucide-react";

interface LogViewerProps {
  maxEntries?: number;
}

const levelColors: Record<LogLevel, string> = {
  debug: "text-gray-400 border-gray-700 bg-gray-900/50",
  info: "text-blue-400 border-blue-800 bg-blue-900/20",
  warning: "text-yellow-400 border-yellow-700 bg-yellow-900/20",
  error: "text-red-400 border-red-700 bg-red-900/20",
  critical: "text-red-100 border-red-500 bg-red-600/50",
};

export function LogViewer({ maxEntries = 1000 }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [levelFilter, setLevelFilter] = useState<Set<LogLevel>>(
    new Set(["info", "warning", "error", "critical"]) // Default: hide debug
  );
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Define callbacks for SSE
  const handleLogEvent = React.useCallback((entry: LogEntry) => {
    if (isPaused) return;
    
    setLogs(prev => {
      const newLogs = [...prev, entry];
      if (newLogs.length > maxEntries) {
        return newLogs.slice(newLogs.length - maxEntries);
      }
      return newLogs;
    });
  }, [isPaused, maxEntries]);

  // SSE streaming - disabled by default, only enable when operation is running
  // Set to false to prevent SSE errors when API is not available
  const [streamEnabled, setStreamEnabled] = useState(false);
  useGraphStream({ onLogEvent: handleLogEvent }, streamEnabled);

  // Auto-scroll effect
  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  // Initial logs fetch (mock for now, real implementation would fetch /api/logs)
  useEffect(() => {
      // In production, fetch historical logs here
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (!levelFilter.has(log.level)) return false;
      if (!filterText) return true;
      return (
        log.message.toLowerCase().includes(filterText.toLowerCase()) ||
        log.source.toLowerCase().includes(filterText.toLowerCase())
      );
    });
  }, [logs, levelFilter, filterText]);

  const toggleLevel = (level: LogLevel) => {
    const newFilter = new Set(levelFilter);
    if (newFilter.has(level)) {
      newFilter.delete(level);
    } else {
      newFilter.add(level);
    }
    setLevelFilter(newFilter);
  };

  const clearLogs = () => setLogs([]);

  const downloadLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hacker-ai-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-[600px] border border-[#30363d] rounded-lg bg-[#0d1117] overflow-hidden">
      {/* Header / Toolbar */}
      <div className="p-3 border-b border-[#30363d] bg-[#161b22] flex items-center gap-3">
        <h3 className="font-semibold text-sm text-[#c9d1d9] mr-2">System Logs</h3>
        
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1.5 h-4 w-4 text-[#8b949e]" />
          <Input 
            placeholder="Search logs..." 
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="pl-8 h-8 bg-[#0d1117] border-[#30363d] text-xs"
          />
        </div>

        {/* Level Filters */}
        <div className="flex gap-1 items-center px-2">
          {(["debug", "info", "warning", "error"] as LogLevel[]).map(level => (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={`px-2 py-1 text-[10px] uppercase font-bold rounded border transition-all ${
                levelFilter.has(level) 
                  ? levelColors[level]
                  : "text-[#8b949e] border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsPaused(!isPaused)}
          className={`h-8 w-8 p-0 ${isPaused ? "text-yellow-400" : "text-[#8b949e]"}`}
          title={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearLogs}
          className="h-8 w-8 p-0 text-[#8b949e] hover:text-red-400"
          title="Clear logs"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={downloadLogs}
          className="h-8 w-8 p-0 text-[#8b949e]"
          title="Download logs"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Log List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs bg-[#0d1117]"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-[#8b949e]">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div 
              key={log.id || index} 
              className="flex gap-2 items-start p-1.5 hover:bg-[#161b22] rounded group"
            >
              <span className="text-[#8b949e] shrink-0 w-20">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}  
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold w-14 text-center shrink-0 ${levelColors[log.level].split(' ')[0]} bg-[rgba(255,255,255,0.05)]`}>
                {log.level.toUpperCase()}
              </span>
              <span className="text-[#8b949e] shrink-0 w-24 truncate" title={log.source}>
                [{log.source}]
              </span>
              <span className="text-[#c9d1d9] break-all whitespace-pre-wrap flex-1">
                {log.message}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                   <span className="block mt-1 text-[#8b949e] text-[10px]">
                     {JSON.stringify(log.metadata)}
                   </span>
                )}
              </span>
            </div>
          ))
        )}
      </div>
      
      {/* Footer Status */}
      <div className="px-3 py-1 bg-[#161b22] border-t border-[#30363d] text-[10px] text-[#8b949e] flex justify-between">
         <span>{filteredLogs.length} entries shown (Total: {logs.length})</span>
         <span>{isPaused ? "PAUSED" : "LIVE"}</span>
      </div>
    </div>
  );
}
