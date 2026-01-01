import React, { useState, useEffect } from "react";
import { ApprovalRequest } from "./types";
import { useGraphStream } from "../../hooks/useGraphStream";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";

export function ApprovalModal() {
  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Listen for approval requests via SSE
  useGraphStream({
    onApprovalRequest: (req) => {
      console.log("Approval Request received:", req);
      setRequest(req);
      setTimeLeft(req.timeout_seconds || 300);
    }
  }, true);

  // Timer countdown
  useEffect(() => {
    if (!request || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [request, timeLeft]);

  const handleResolve = async (approved: boolean) => {
    // In a real implementation, call POST /api/approvals/{id}/resolve
    console.log(`Request ${request?.id} resolved: ${approved ? "APPROVED" : "REJECTED"}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setRequest(null);
  };

  if (!request) return null;

  return (
    <Dialog open={!!request} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] bg-[#161b22] border-[#30363d] text-[#c9d1d9]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <AlertTriangle className="h-6 w-6" />
            <DialogTitle className="text-xl">Approval Required</DialogTitle>
          </div>
          <DialogDescription className="text-[#8b949e]">
            The system requires human approval to proceed with the following action.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-[#0d1117] rounded-md border border-[#30363d] p-4 space-y-3">
          <div className="flex justify-between items-start">
             <div>
                <span className="text-xs text-[#8b949e] uppercase font-bold">Request Type</span>
                <div className="font-mono text-lg font-semibold">{request.request_type}</div>
             </div>
             <div className="flex items-center gap-1 text-[#8b949e] text-xs bg-[#21262d] px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                <span className={timeLeft < 60 ? "text-red-400 font-bold" : ""}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")} remaining
                </span>
             </div>
          </div>

          <div className="border-t border-[#30363d] pt-3">
            <span className="text-xs text-[#8b949e] uppercase font-bold mb-1 block">Context</span>
            <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(request.context).map(([key, value]) => (
                   <div key={key}>
                      <span className="text-[#8b949e] mr-2">{key}:</span>
                      <span className="text-[#c9d1d9] font-mono">{String(value)}</span>
                   </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end mt-4">
          <Button
            variant="ghost"
            onClick={() => handleResolve(false)}
            className="border border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            onClick={() => handleResolve(true)}
            className="bg-green-600 hover:bg-green-700 text-white border-none"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve & Execute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
