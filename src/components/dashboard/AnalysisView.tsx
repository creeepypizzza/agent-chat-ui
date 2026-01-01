import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";
import { useAnalysis } from "../../hooks/useAnalysis";
import { useGraphStream, GraphEvent } from "../../hooks/useGraphStream";

// Node Styling
const nodeColorSchemes: Record<string, { border: string; bg: string; text: string }> = {
  __start__: { border: "#6b7280", bg: "rgba(107,114,128,0.15)", text: "#9ca3af" },
  recon: { border: "#3b82f6", bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  scan: { border: "#8b5cf6", bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
  review: { border: "#f59e0b", bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
  exploit: { border: "#ef4444", bg: "rgba(239,68,68,0.15)", text: "#f87171" },
  exploit_dispatcher: { border: "#ef4444", bg: "rgba(239,68,68,0.15)", text: "#f87171" },
  exploit_worker: { border: "#f97316", bg: "rgba(249,115,22,0.15)", text: "#fb923c" },
  exploit_aggregator: { border: "#ef4444", bg: "rgba(239,68,68,0.15)", text: "#f87171" },
  report: { border: "#10b981", bg: "rgba(16,185,129,0.15)", text: "#34d399" },
  __end__: { border: "#6b7280", bg: "rgba(107,114,128,0.15)", text: "#9ca3af" },
};

function WorkflowNode({ data, id }: { data: { label: string; status: string; active: boolean }; id: string }) {
  const colors = nodeColorSchemes[id] || (id.startsWith("exploit") ? nodeColorSchemes.exploit : nodeColorSchemes.recon);
  
  // Status-based styling
  let borderColor = colors.border;
  let bgColor = colors.bg;
  let boxShadow = "none";
  
  if (data.status === "running") {
    boxShadow = `0 0 0 3px ${colors.border}40, 0 0 20px ${colors.border}60`;
  } else if (data.status === "completed") {
    borderColor = "#22c55e";
    bgColor = "rgba(34,197,94,0.15)";
  }

  const baseStyle: React.CSSProperties = {
    padding: "10px 24px",
    borderRadius: "9999px",
    border: `2px solid ${borderColor}`,
    backgroundColor: bgColor,
    color: data.status === "completed" ? "#22c55e" : colors.text,
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "center",
    minWidth: "160px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    boxShadow,
  };

  if (id === "__start__" || id === "__end__") {
    baseStyle.borderStyle = "dashed";
    baseStyle.backgroundColor = "transparent";
  }

  return (
    <div style={baseStyle}>
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: borderColor, width: 8, height: 8, border: "2px solid #0d1117" }} 
      />
      {data.status === "running" && "⏳ "}
      {data.status === "completed" && "✅ "}
      {data.label}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: borderColor, width: 8, height: 8, border: "2px solid #0d1117" }} 
      />
    </div>
  );
}

const nodeTypes = { workflow: WorkflowNode };
import { config } from "../../config";

// Dagre layout
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 25,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function AnalysisView() {
  const { 
    status, 
    programs, 
    selectedProgram, 
    setSelectedProgram, 
    startAnalysis,
  } = useAnalysis();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string>("idle");

  const phaseLabels: Record<string, string> = {
    __start__: "▶ Start",
    recon: "Reconnaissance",
    scan: "Vulnerability Scan",
    review: "LLM Review",
    exploit: "PoC Exploit",
    exploit_dispatcher: "Exploit Dispatcher",
    exploit_worker: "Exploit Worker",
    exploit_aggregator: "Result Aggregator",
    report: "Report Generation",
    __end__: "✅ End",
  };

  // Handle SSE events
  const handleGraphEvent = useCallback((event: GraphEvent) => {
    if (event.type === "connected") {
      setStreamStatus("connected");
    } else if (event.type === "start" && event.node) {
      setStreamStatus(`Running: ${event.node}`);
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === event.node || (event.node === "exploit" && n.id.startsWith("exploit"))) {
            return { ...n, data: { ...n.data, status: "running", active: true } };
          }
          return n;
        })
      );
    } else if (event.type === "end" && event.node) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === event.node || (event.node === "exploit" && n.id.startsWith("exploit"))) {
            return { ...n, data: { ...n.data, status: "completed", active: false } };
          }
          return n;
        })
      );
    } else if (event.type === "done") {
      setStreamStatus("completed");
      setIsStreaming(false);
    }
  }, [setNodes]);

  const { connect } = useGraphStream({ onGraphEvent: handleGraphEvent }, isStreaming);

  const fetchGraph = useCallback(async (currentPhase: string) => {
    try {
      const res = await fetch(`${config.api.baseUrl}/debug/graph`);
      const graphData = await res.json();
      
      const nodeOrder = graphData.nodes.map((n: { id: string }) => n.id);
      const currentIdx = nodeOrder.indexOf(currentPhase);

      const flowNodes: Node[] = graphData.nodes.map((n: { id: string; name: string }, i: number) => ({
        id: n.id,
        type: "workflow",
        position: { x: 0, y: 0 },
        data: {
          label: phaseLabels[n.id] || n.name,
          status: i < currentIdx ? "completed" : i === currentIdx ? "running" : "pending",
          active: i === currentIdx,
        },
      }));

      const flowEdges: Edge[] = graphData.edges.map((e: { source: string; target: string; conditional: boolean }, i: number) => {
        const sourceColors = nodeColorSchemes[e.source] || nodeColorSchemes.recon;
        return {
          id: `e${i}`,
          source: e.source,
          target: e.target,
          type: "smoothstep",
          animated: false,
          style: { 
            stroke: sourceColors.border,
            strokeWidth: 2,
            strokeDasharray: e.conditional ? "6 4" : "none"
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: sourceColors.border, width: 12, height: 12 },
        };
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err) {
      console.error("Failed to fetch graph:", err);
    }
  }, [setNodes, setEdges]);

  // Update graph when status changes
  React.useEffect(() => {
    if (status) {
      fetchGraph(status.current_phase || "idle");
    }
  }, [status, fetchGraph]);

  const handleRunDemo = () => {
    // Reset all nodes to pending first
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, status: "pending", active: false } }))
    );
    setIsStreaming(true);
    setStreamStatus("connecting...");
  };

  return (
    <div className="flex h-full border border-[#30363d] rounded-lg overflow-hidden bg-[#0d1117]">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#30363d] bg-[#161b22] flex flex-col">
        <div className="p-4 border-b border-[#30363d] font-bold text-[#8b949e] text-xs uppercase tracking-wider">
          Target Programs
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {programs.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProgram(p.id)}
              className={`p-3 rounded-lg cursor-pointer border transition-all ${
                selectedProgram === p.id 
                  ? "bg-[#1f6feb26] border-[#58a6ff] text-[#58a6ff]" 
                  : "bg-transparent border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]"
              }`}
            >
              <div className="font-semibold text-sm mb-1">{p.name}</div>
              <div className="flex justify-between text-xs text-[#8b949e]">
                <span>{p.platform}</span>
                <span>${p.bounty_max.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-[#30363d] space-y-2">
          <button
            onClick={() => selectedProgram && startAnalysis(selectedProgram)}
            disabled={!selectedProgram}
            className={`w-full py-2 px-4 rounded-md font-semibold text-sm transition-colors ${
              selectedProgram 
                ? "bg-[#238636] text-white hover:bg-[#2ea043]" 
                : "bg-[#21262d] text-[#484f58] cursor-not-allowed"
            }`}
          >
            ▶ Start Analysis
          </button>
          <button
            onClick={handleRunDemo}
            disabled={isStreaming}
            className={`w-full py-2 px-4 rounded-md font-semibold text-sm transition-colors ${
              isStreaming 
                ? "bg-[#21262d] text-[#484f58] cursor-not-allowed" 
                : "bg-[#1f6feb] text-white hover:bg-[#388bfd]"
            }`}
          >
            {isStreaming ? "⏳ Running..." : "🎬 Run Demo"}
          </button>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative bg-[#0d1117]">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <div className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded-full text-xs text-[#8b949e]">
            Stream: <span className={`font-mono ${streamStatus === "completed" ? "text-green-400" : streamStatus.startsWith("Running") ? "text-blue-400" : "text-[#c9d1d9]"}`}>{streamStatus}</span>
          </div>
          {status && (
             <div className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded-full text-xs text-[#8b949e]">
               Phase: <span className="text-[#c9d1d9] font-mono">{status.current_phase}</span>
             </div>
          )}
        </div>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#0d1117]"
        >
          <Background variant={BackgroundVariant.Dots} color="#30363d" gap={20} size={1} />
          <Controls className="bg-[#161b22] border-[#30363d]" />
        </ReactFlow>
      </div>
    </div>
  );
}
