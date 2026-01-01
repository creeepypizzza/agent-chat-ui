"use client";

import React, { useState } from "react";
import { Search, Filter, ExternalLink } from "lucide-react";

const mockFindings: any[] = [];

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-[#f85149] text-white",
    high: "bg-[#f78166] text-white",
    medium: "bg-[#d29922] text-black",
    low: "bg-[#8b949e] text-white",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${colors[severity]}`}>
      {severity}
    </span>
  );
}

export default function FindingsPage() {
  const [filter, setFilter] = useState("all");

  const filteredFindings = filter === "all" 
    ? mockFindings 
    : mockFindings.filter(f => f.severity === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc]">Findings Database</h1>
          <p className="text-sm text-[#8b949e]">All discovered vulnerabilities across targets</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" size={16} />
          <input 
            type="text"
            placeholder="Search findings..."
            className="w-full pl-10 pr-4 py-2 bg-[#161b22] border border-[#30363d] rounded-md text-sm focus:border-[#58a6ff] focus:outline-none"
          />
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-md text-sm"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Findings Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#30363d] text-left text-xs text-[#8b949e] uppercase">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Est. Reward</th>
            </tr>
          </thead>
          <tbody>
            {filteredFindings.map((f) => (
              <tr key={f.id} className="border-b border-[#30363d] hover:bg-[#21262d]">
                <td className="px-4 py-3 font-mono text-[#58a6ff]">{f.id}</td>
                <td className="px-4 py-3 text-[#f0f6fc]">{f.title}</td>
                <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                <td className="px-4 py-3 text-[#8b949e]">{f.target}</td>
                <td className="px-4 py-3 text-[#8b949e] capitalize">{f.status.replace("_", " ")}</td>
                <td className="px-4 py-3 font-mono text-[#238636]">
                  {f.reward > 0 ? `$${f.reward.toLocaleString()}` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
