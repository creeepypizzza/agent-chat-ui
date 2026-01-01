"use client";

import React from "react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#f0f6fc]">Reports</h1>
        <p className="text-sm text-[#8b949e]">Generate and export vulnerability reports</p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📄</div>
        <h2 className="text-lg font-semibold text-[#f0f6fc] mb-2">Report Builder Coming Soon</h2>
        <p className="text-[#8b949e] max-w-md mx-auto">
          Create professional vulnerability reports in Immunefi, PDF, or Markdown format. 
          Select findings, customize the template, and export.
        </p>
      </div>
    </div>
  );
}
