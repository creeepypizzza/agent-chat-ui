import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

import { Play, Search, Terminal, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { config } from "../../config";

interface MCPTool {
  name: string;
  description: string;
  input_schema: any;
}

export function ToolsExplorer() {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [filterText, setFilterText] = useState("");
  const [argsJson, setArgsJson] = useState("{}");
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Fetch tools
  useEffect(() => {
    fetch(`${config.api.baseUrl}/admin/tools`)
      .then(res => res.json())
      .then(data => {
        if (data.tools) {
          setTools(data.tools);
          if (data.tools.length > 0) setSelectedTool(data.tools[0]);
        }
      })
      .catch(err => console.error("Failed to fetch tools", err))
      .finally(() => setLoading(false));
  }, []);

  // Reset args when tool changes
  useEffect(() => {
    if (selectedTool) {
      setArgsJson(JSON.stringify(generateExampleArgs(selectedTool.input_schema), null, 2));
      setExecutionResult(null);
    }
  }, [selectedTool]);

  const generateExampleArgs = (schema: any) => {
    if (!schema?.properties) return {};
    const example: any = {};
    for (const key in schema.properties) {
        const prop = schema.properties[key];
        if (prop.default) example[key] = prop.default;
        else if (prop.type === "string") example[key] = "example_value";
        else if (prop.type === "integer") example[key] = 0;
        else if (prop.type === "boolean") example[key] = false;
        else example[key] = null;
    }
    return example;
  };

  const handleExecute = async () => {
    if (!selectedTool) return;
    setExecuting(true);
    setExecutionResult(null);

    try {
      const args = JSON.parse(argsJson);
      const res = await fetch(`${config.api.baseUrl}/admin/tools/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool_name: selectedTool.name,
          arguments: args,
        }),
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({ success: false, error: err.message || "Invalid JSON arguments" });
    } finally {
      setExecuting(false);
    }
  };

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(filterText.toLowerCase()) || 
    t.description.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="flex h-[600px] border border-[#30363d] rounded-lg bg-[#0d1117] overflow-hidden">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-[#30363d] flex flex-col bg-[#161b22]">
        <div className="p-3 border-b border-[#30363d]">
           <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-[#8b949e]" />
              <Input
                placeholder="Search tools..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className="pl-8 bg-[#0d1117] border-[#30363d] h-8 text-xs"
              />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
           {loading ? (
             <div className="text-center text-[#8b949e] py-10">Loading tools...</div>
           ) : filteredTools.map(tool => (
             <div
               key={tool.name}
               onClick={() => setSelectedTool(tool)}
               className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                 selectedTool?.name === tool.name 
                   ? "bg-[#1f6feb26] text-[#58a6ff] border border-[#1f6feb] border-opacity-50" 
                   : "text-[#c9d1d9] hover:bg-[#21262d]"
               }`}
             >
               <div className="font-mono font-semibold truncate">{tool.name}</div>
               <div className="text-xs text-[#8b949e] truncate">{tool.description}</div>
             </div>
           ))}
        </div>
        <div className="p-2 border-t border-[#30363d] text-xs text-[#8b949e] text-center">
            {tools.length} available tools
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-[#0d1117]">
        {selectedTool ? (
          <>
            {/* Tool Header */}
            <div className="p-4 border-b border-[#30363d] bg-[#161b22]">
              <div className="flex items-center gap-2 mb-2">
                 <Terminal className="h-5 w-5 text-[#8b949e]" />
                 <h2 className="text-lg font-bold text-[#c9d1d9] font-mono">{selectedTool.name}</h2>
              </div>
              <p className="text-sm text-[#8b949e]">{selectedTool.description}</p>
            </div>

            {/* Execution Form */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
               <div>
                  <label className="text-xs font-semibold text-[#8b949e] mb-1 block">ARGUMENTS (JSON)</label>
                  <textarea
                    value={argsJson}
                    onChange={e => setArgsJson(e.target.value)}
                    className="w-full h-40 bg-[#0d1117] border border-[#30363d] rounded p-3 font-mono text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] resize-none"
                    spellCheck={false}
                  />
                  {/* Schema Hint */}
                  <div className="mt-2 p-2 bg-[#161b22] rounded border border-[#30363d] text-[10px] text-[#8b949e] font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                      <span className="font-bold text-[#c9d1d9]">Schema:</span> {JSON.stringify(selectedTool.input_schema, null, 2)}
                  </div>
               </div>

               <Button 
                 onClick={handleExecute} 
                 disabled={executing}
                 className={`w-full ${executing ? "bg-[#21262d]" : "bg-[#238636] hover:bg-[#2ea043] text-white"}`}
               >
                 {executing ? (
                    <span className="flex items-center gap-2">Running...</span>
                 ) : (
                    <span className="flex items-center gap-2"><Play className="h-4 w-4" /> Execute Tool</span>
                 )}
               </Button>
               
               {/* Result Area */}
               {executionResult && (
                 <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-2">
                       {executionResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                       ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                       )}
                       <span className="text-sm font-bold text-[#c9d1d9]">Execution Result</span>
                    </div>
                    <div className={`p-3 rounded border overflow-auto text-xs font-mono max-h-60 whitespace-pre-wrap ${
                        executionResult.success 
                          ? "bg-[#0d1117] border-[#30363d] text-[#c9d1d9]" 
                          : "bg-red-900/10 border-red-900/30 text-red-300"
                    }`}>
                        {executionResult.success 
                           ? executionResult.output 
                           : (executionResult.error || "Unknown error occurred")
                        }
                    </div>
                 </div>
               )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8b949e]">
            Select a tool to view details
          </div>
        )}
      </div>
    </div>
  );
}
