import { useState, useCallback, useEffect } from "react";
import { WorkflowStatus, Program } from "../components/dashboard/types";
import { Edge, Node } from "@xyflow/react";
import { config } from "../config";

export function useAnalysis() {
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch(`${config.api.baseUrl}/programs`);
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch (e) {
      console.error("Failed to fetch programs:", e);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${config.api.baseUrl}/debug/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        return data;
      }
    } catch (e) {
      console.error("Failed to fetch status:", e);
    }
    return null;
  }, []);

  // Note: Graph fetching logic is specific to ReactFlow and might need
  // to be handled in the component or a separate hook if it gets complex.
  // For now, we'll keep the basic state here but let the view handle layout.

  const startAnalysis = async (programId: string) => {
    try {
      await fetch(`${config.api.baseUrl}/runs/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program_ids: [programId] }),
      });
      fetchStatus();
    } catch (e) {
      console.error("Failed to start analysis:", e);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchPrograms, fetchStatus]);

  return {
    status,
    programs,
    selectedProgram,
    setSelectedProgram,
    nodes,
    setNodes,
    edges,
    setEdges,
    fetchStatus,
    startAnalysis,
  };
}
