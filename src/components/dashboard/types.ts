export interface WorkflowStatus {
  current_program: string | null;
  current_phase: string;
  run_id: string | null;
  agents: Array<{ name: string; status: string }>;
  total_cost_usd: number;
  findings_count: number;
  valid_findings_count: number;
  errors: string[];
  warnings: string[];
  programs_count: number;
}

export interface Program {
  id: string;
  name: string;
  platform: string;
  url: string;
  bounty_min: number;
  bounty_max: number;
  status: string;
}

export interface UsageStats {
  uptime_seconds: number;
  llm: {
    total_requests: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_cost_usd: number;
    by_model: Record<string, { input_tokens: number; output_tokens: number; requests: number; cost_usd: number }>;
    by_node: Record<string, Record<string, { input_tokens: number; output_tokens: number; requests: number }>>;
  };
  etherscan: {
    requests: number;
    successful: number;
    success_rate: number;
    status: string;
    by_chain: Record<string, number>;
  };
  ziion: {
    commands_executed: number;
    is_connected: boolean;
    total_connection_time_seconds: number;
    by_tool: Record<string, number>;
  };
  recent_activities: Array<{
    timestamp: string;
    node: string | null;
    action: string;
    details: string;
    status: string;
    duration_ms: number | null;
  }>;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  components: {
    ziion?: { status: string; host?: string; error?: string };
    slither?: { version: string };
    foundry?: { version: string };
  };
  api_keys: {
    etherscan: string;
    google: string;
    langsmith: string;
  };
}

export interface Finding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  description: string;
  file_path: string;
  line_number?: number;
  tool: string;
  status: "open" | "verified" | "fixed" | "false_positive";
  poc_status: "none" | "pending" | "success" | "failure";
  poc_code?: string;
  created_at: string;
}

export interface FindingsSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export type LogLevel = "debug" | "info" | "warning" | "error" | "critical";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface ApprovalRequest {
  id: string;
  run_id: string;
  request_type: string;
  context: Record<string, any>;
  status: "pending" | "approved" | "rejected" | "expired";
  created_at: string;
  timeout_seconds: number;
}
