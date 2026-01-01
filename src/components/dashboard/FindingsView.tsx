import React, { useState } from "react";
import { useFindings } from "../../hooks/useFindings";
import { Finding } from "./types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-900/30 text-red-400 border-red-900/50",
    high: "bg-orange-900/30 text-orange-400 border-orange-900/50",
    medium: "bg-yellow-900/30 text-yellow-400 border-yellow-900/50",
    low: "bg-blue-900/30 text-blue-400 border-blue-900/50",
    informational: "bg-gray-800 text-gray-400 border-gray-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase border ${colors[severity] || colors.informational}`}>
      {severity}
    </span>
  );
}

function PoCDetail({ finding }: { finding: Finding }) {
  if (!finding.poc_code) return <div className="text-[#8b949e] italic">No PoC available yet.</div>;

  return (
    <div className="space-y-4">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#21262d] border-b border-[#30363d]">
          <span className="text-xs font-mono text-[#8b949e]">test/Exploit.t.sol</span>
          <div className="flex gap-2">
            <button className="text-xs text-[#58a6ff] hover:underline">Copy</button>
            <button className="text-xs text-[#58a6ff] hover:underline">Download</button>
          </div>
        </div>
        <pre className="p-4 text-sm font-mono text-[#c9d1d9] overflow-auto max-h-[300px]">
          {finding.poc_code}
        </pre>
      </div>
      
      <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
        <h4 className="text-xs font-semibold text-[#8b949e] uppercase mb-2">Execution Result</h4>
        {finding.poc_status === "success" ? (
          <div className="text-green-400 font-mono text-sm">✅ [PASS] testExploit() (gas: 123456)</div>
        ) : finding.poc_status === "failure" ? (
          <div className="text-red-400 font-mono text-sm">❌ [FAIL] Revert: Execution reverted</div>
        ) : (
          <div className="text-[#8b949e] font-mono text-sm">⏳ Pending execution...</div>
        )}
      </div>
      
       <div className="flex gap-2">
          <button className="px-3 py-1 bg-[#238636] text-white rounded text-sm hover:bg-[#2ea043]">
            Run in Foundry
          </button>
          <button className="px-3 py-1 bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded text-sm hover:border-[#8b949e]">
             Verify Logic
          </button>
       </div>
    </div>
  );
}

export function FindingsView() {
  const { findings, loading, error } = useFindings();
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  if (loading) return <div className="text-[#8b949e] p-4">Loading findings...</div>;
  if (error) return <div className="text-red-400 p-4">Error: {error}</div>;

  return (
    <div className="h-full flex flex-col p-2 space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-[#f0f6fc] font-semibold text-lg">Vulnerability Findings</h2>
        <div className="flex gap-2">
          <select className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] text-sm rounded px-2 py-1">
             <option>All Severity</option>
             <option>Critical</option>
             <option>High</option>
          </select>
          <button className="px-3 py-1 bg-[#1f6feb] text-white rounded text-sm hover:bg-[#388bfd]">
             Export Report
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 border border-[#30363d] rounded-lg overflow-hidden bg-[#0d1117]">
        <table className="w-full text-left text-sm text-[#c9d1d9]">
          <thead className="bg-[#161b22] text-[#8b949e]">
            <tr>
              <th className="p-3 font-medium">Severity</th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Location</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">PoC</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {findings.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-[#8b949e]">No findings detected yet.</td></tr>
            ) : (
              findings.map((f) => (
                <tr key={f.id} className="hover:bg-[#161b22] transition-colors">
                  <td className="p-3"><SeverityBadge severity={f.severity} /></td>
                  <td className="p-3 font-medium">{f.title}</td>
                  <td className="p-3 font-mono text-xs text-[#8b949e]">
                    {f.file_path}:{f.line_number}
                  </td>
                  <td className="p-3">
                     <span className={`text-xs ${f.status === 'verified' ? 'text-green-400' : 'text-[#8b949e]'}`}>
                       {f.status}
                     </span>
                  </td>
                  <td className="p-3">
                    {f.poc_status === "success" && <span className="text-green-400 text-xs">✅ Ready</span>}
                    {f.poc_status === "pending" && <span className="text-yellow-400 text-xs">⏳ Generating</span>}
                    {f.poc_status === "none" && <span className="text-[#8b949e] text-xs">-</span>}
                  </td>
                  <td className="p-3">
                    <Dialog>
                      <DialogTrigger asChild>
                         <button 
                           className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs hover:border-[#8b949e] text-[#58a6ff]"
                           onClick={() => setSelectedFinding(f)}
                         >
                           Details
                         </button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] sm:max-w-[700px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            {f.title} <SeverityBadge severity={f.severity} />
                          </DialogTitle>
                          <DialogDescription className="text-[#8b949e]">
                            {f.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                           <PoCDetail finding={f} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
