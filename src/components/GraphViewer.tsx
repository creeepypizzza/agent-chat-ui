"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom node component
function CustomNode({ data }: { data: { label: string; status: string } }) {
  const statusColors: Record<string, string> = {
    pending: "#484f58",
    running: "#58a6ff",
    completed: "#238636",
    failed: "#f85149",
  };

  const bgColor = statusColors[data.status] || statusColors.pending;

  return (
    <div
      style={{
        padding: "16px 24px",
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${bgColor}33, ${bgColor}11)`,
        border: `2px solid ${bgColor}`,
        color: "#c9d1d9",
        fontWeight: 600,
        fontSize: "14px",
        textAlign: "center",
        minWidth: "100px",
        boxShadow:
          data.status === "running"
            ? `0 0 20px ${bgColor}66`
            : "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      {data.label}
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

interface GraphData {
  mermaid: string;
  nodes: Array<{ id: string; name: string }>;
  edges: Array<{ source: string; target: string; conditional: boolean }>;
}

export function GraphViewer({ apiUrl }: { apiUrl: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  const fetchGraph = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/debug/graph`);
      const data: GraphData = await response.json();

      // Convert to React Flow format with horizontal layout (left-to-right)
      const nodePositions: Record<string, { x: number; y: number }> = {
        __start__: { x: 0, y: 200 },
        recon: { x: 150, y: 200 },
        scan: { x: 300, y: 200 },
        review: { x: 450, y: 200 },
        exploit: { x: 600, y: 100 },
        report: { x: 750, y: 200 },
        __end__: { x: 900, y: 200 },
      };

      const nodeLabels: Record<string, string> = {
        __start__: "🚀 Start",
        recon: "🔍 Recon",
        scan: "🛡️ Scan",
        review: "🤖 LLM Review",
        exploit: "💥 PoC Exploit",
        report: "📄 Report",
        __end__: "✅ End",
      };

      const flowNodes: Node[] = data.nodes.map((n) => ({
        id: n.id,
        type: "custom",
        position: nodePositions[n.id] || { x: 250, y: 0 },
        data: {
          label: nodeLabels[n.id] || n.name,
          status: "pending",
        },
      }));

      const flowEdges: Edge[] = data.edges.map((e, i) => ({
        id: `e${i}`,
        source: e.source,
        target: e.target,
        animated: e.conditional,
        style: {
          stroke: e.conditional ? "#58a6ff" : "#8b949e",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: e.conditional ? "#58a6ff" : "#8b949e",
        },
        label: e.conditional ? "condition" : undefined,
        labelStyle: { fill: "#8b949e", fontSize: 10 },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load graph:", error);
      setLoading(false);
    }
  }, [apiUrl, setNodes, setEdges]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#8b949e",
        }}
      >
        Loading graph...
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-left"
      style={{ background: "#0d1117" }}
    >
      <Controls
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
        }}
      />
      <MiniMap
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
        }}
        nodeColor="#58a6ff"
        maskColor="#0d111799"
      />
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="#30363d"
      />
    </ReactFlow>
  );
}

export default GraphViewer;
