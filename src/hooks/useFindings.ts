import { useState, useCallback, useEffect } from "react";
import { Finding } from "../components/dashboard/types";

export function useFindings() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFindings = useCallback(async () => {
    try {
      // TODO: Implement /api/findings endpoint
      // const res = await fetch(`${API_URL}/api/findings`);
      
      // Mock data for now
      const mockFindings: Finding[] = [
        {
          id: "f1",
          title: "Reentrancy in withdraw()",
          severity: "critical",
          description: "The withdraw function does not follow the checks-effects-interactions pattern.",
          file_path: "src/Vault.sol",
          line_number: 45,
          tool: "slither",
          status: "verified",
          poc_status: "success",
          poc_code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Vault.sol";

contract ExploitTest is Test {
    Vault public vault;
    Exploiter public exploiter;

    function setUp() public {
        vault = new Vault();
        exploiter = new Exploiter(address(vault));
    }

    function testExploit() public {
        exploiter.attack{value: 1 ether}();
        assertEq(address(vault).balance, 0);
        assertGt(address(exploiter).balance, 1 ether);
    }
}
`,
          created_at: new Date().toISOString()
        },
        {
          id: "f2",
          title: "Unchecked Return Value",
          severity: "high",
          description: "The return value of an external call is not checked.",
          file_path: "src/Token.sol",
          line_number: 123,
          tool: "aderyn",
          status: "open",
          poc_status: "pending",
          created_at: new Date().toISOString()
        }
      ];
      
      setFindings(mockFindings);
      setLoading(false);
      
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFindings();
  }, [fetchFindings]);

  return { findings, loading, error, refetch: fetchFindings };
}
