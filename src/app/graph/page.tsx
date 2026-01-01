"use client";

import React from "react";
import { GraphViewer } from "@/components/GraphViewer";
import { config } from "../../config";

export default function GraphPage() {
  const apiUrl = config.api.baseUrl;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0d1117",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #30363d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 600,
            background: "linear-gradient(135deg, #a371f7, #58a6ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🔐 Hacker AI - LangGraph Workflow
        </h1>
        <a
          href="/dashboard"
          style={{
            color: "#58a6ff",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← Back to Dashboard
        </a>
      </header>

      {/* Graph Viewer */}
      <div style={{ flex: 1 }}>
        <GraphViewer apiUrl={apiUrl} />
      </div>
    </div>
  );
}
