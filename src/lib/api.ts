/**
 * Hacker AI API Client
 * 
 * Unified API client for communicating with LangGraph backend
 * and custom Hacker AI endpoints.
 */

import { config } from "../config";

const API_URL = config.api.baseUrl;

// Types
export interface Target {
  id: string;
  name: string;
  platform: string;
  category: "production" | "training" | "sandbox";
  scope: string;
  status: "active" | "paused" | "inactive";
  maxReward: string;
  createdAt: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  targetId: string;
  targetName: string;
  status: "draft" | "verified" | "submitted" | "accepted" | "rejected";
  createdAt: string;
  description?: string;
}

export interface Operation {
  id: string;
  targetId: string;
  targetName: string;
  status: "running" | "paused" | "completed" | "failed";
  progress: number;
  findingsCount: number;
  startedAt: string;
  completedAt?: string;
}

export interface SystemStatus {
  api: "connected" | "disconnected";
  ziion: "connected" | "disconnected" | "unknown";
  neo4j: "connected" | "disconnected" | "unknown";
  langfuse: "connected" | "disconnected" | "unknown";
}

// API Client Class
class HackerAIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      await fetch(`${this.baseUrl}/info`, { signal: AbortSignal.timeout(3000) });
      return true;
    } catch {
      return false;
    }
  }

  // LangGraph info endpoint
  async getInfo(): Promise<{ version: string; graphs: string[] }> {
    return this.fetch("/info");
  }

  // Threads (LangGraph standard)
  async getThreads(limit: number = 20): Promise<any[]> {
    return this.fetch(`/threads?limit=${limit}`);
  }

  async createThread(): Promise<{ thread_id: string }> {
    return this.fetch("/threads", { method: "POST", body: JSON.stringify({}) });
  }

  // Invoke graph
  async invoke(input: Record<string, unknown>, threadId?: string): Promise<any> {
    const config = threadId ? { configurable: { thread_id: threadId } } : {};
    return this.fetch("/runs", {
      method: "POST",
      body: JSON.stringify({
        assistant_id: "agent",
        input,
        config,
      }),
    });
  }

  // Stream graph execution
  streamRun(input: Record<string, unknown>, threadId?: string): EventSource {
    const config = threadId ? { configurable: { thread_id: threadId } } : {};
    const body = JSON.stringify({
      assistant_id: "agent",
      input,
      config,
      stream_mode: "events",
    });

    // Note: EventSource doesn't support POST, need custom SSE implementation
    // For now, return EventSource for existing events endpoint
    return new EventSource(`${this.baseUrl}/api/events/stream`);
  }
}

// Singleton instance
export const api = new HackerAIClient();

// Helper hooks for data fetching
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const apiConnected = await api.checkHealth();
  
  // TODO: Add ZIION status check via backend proxy
  return {
    api: apiConnected ? "connected" : "disconnected",
    ziion: "unknown",
    neo4j: "unknown",
    langfuse: "unknown",
  };
}

// Fetch metrics for dashboard
export async function fetchMetrics(): Promise<{
  activeTargets: number;
  runningOps: number;
  pendingFindings: { critical: number; high: number; medium: number };
  estimatedRewards: string;
}> {
  // TODO: Replace with actual API calls when backend is ready
  // For now, return zeroes as empty state
  return {
    activeTargets: 0,
    runningOps: 0,
    pendingFindings: { critical: 0, high: 0, medium: 0 },
    estimatedRewards: "$0",
  };
}

export default api;
