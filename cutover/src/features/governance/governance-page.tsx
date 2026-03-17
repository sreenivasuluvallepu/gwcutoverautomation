import { PageHeader } from "../../components/ui/page-header";
import { Card, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useApproveDecision, useApprovals } from "../../hooks/useData";
import { useControlPlaneStore } from "../../store/control-plane";

export function GovernancePage() {
  const { data: approvals = [] } = useApprovals();
  const decide = useApproveDecision();
  const role = useControlPlaneStore((s) => s.role);
  const canApprove = role === "approver" || role === "admin";

  return (
    <div className="space-y-4">
      <PageHeader title="Audit, RBAC & Approval Workflow" subtitle="Track approvals, RBAC enforcement, environment isolation, and immutable operational history." />

      <Card>
        <CardTitle>Approval Queue</CardTitle>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                {["ID", "Action", "Requested By", "Status", "Created", "Decision"].map((x) => (
                  <th key={x} className="px-3 py-2 text-xs uppercase text-muted-foreground">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvals.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">{item.id}</td>
                  <td className="px-3 py-2">{item.action}</td>
                  <td className="px-3 py-2">{item.requestedBy}</td>
                  <td className="px-3 py-2 capitalize">{item.status}</td>
                  <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    {item.status === "pending" && canApprove ? (
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => decide.mutate({ id: item.id, decision: "approved" })}>
                          Approve
                        </Button>
                        <Button variant="danger" onClick={() => decide.mutate({ id: item.id, decision: "rejected" })}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>Policy Controls</CardTitle>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>1. Production cutover requires operator + approver dual control.</li>
          <li>2. Full cutover blocked unless shadow or parallel pass rate exceeds 98%.</li>
          <li>3. Rollback is always allowed for operator/admin roles.</li>
          <li>4. Environment isolation enforces separate routing policies per env.</li>
        </ul>
      </Card>
    </div>
  );
}
