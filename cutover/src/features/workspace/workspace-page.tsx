import { useEffect, useMemo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useLegacyEndpoints } from "../../hooks/useData";
import { modeColor, modeLabel } from "../../lib/mode";
import { EndpointRecord, TestingMode } from "../../types/domain";
import { useGatewayName } from "../../hooks/useGatewayName";
import { useControlPlaneStore } from "../../store/control-plane";

type Pane = "source" | "target";

const inferConsumer = (row: EndpointRecord) => {
  if (row.path.includes("/partner")) return "Partner Apps";
  if (row.path.includes("/payments")) return "Payment Channels";
  if (row.path.includes("/accounts")) return "Retail Banking Apps";
  return "Internal Consumers";
};

function EndpointGrid({
  title,
  rows,
  selected,
  pane,
  onToggleSelect,
  onDragStart,
  onDrop
}: {
  title: string;
  rows: EndpointRecord[];
  selected: string[];
  pane: Pane;
  onToggleSelect: (id: string) => void;
  onDragStart: (pane: Pane, rowId: string) => void;
  onDrop: (pane: Pane) => void;
}) {
  const [query, setQuery] = useState("");
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.service, row.method, row.path, row.owner, inferConsumer(row)]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, rows]);

  const columns = useMemo<ColumnDef<EndpointRecord>[]>(
    () => [
      {
        id: "select",
        header: "",
        cell: ({ row }) => (
          <input type="checkbox" checked={selected.includes(row.original.id)} onChange={() => onToggleSelect(row.original.id)} />
        )
      },
      {
        id: "consumer",
        header: "Consumer",
        cell: ({ row }) => inferConsumer(row.original)
      },
      { header: "API Name", accessorKey: "service" },
      {
        id: "endpoint",
        header: "Endpoint",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.method} {row.original.path}
          </span>
        )
      },
      {
        id: "mode",
        header: "Mode",
        cell: ({ row }) => <Badge className={modeColor[row.original.mode]}>{modeLabel[row.original.mode]}</Badge>
      },
      { header: "Traffic %", accessorKey: "trafficPercent" }
    ],
    [onToggleSelect, selected]
  );

  const table = useReactTable({ columns, data: filteredRows, getCoreRowModel: getCoreRowModel() });
  return (
    <Card
      className="min-h-[420px]"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(pane);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-8 w-40 pl-7 text-xs"
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {filteredRows.length}/{rows.length} endpoints
        </span>
      </div>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border"
                draggable
                onDragStart={() => onDragStart(pane, row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function WorkspacePage() {
  const gatewayName = useGatewayName();
  const { data: legacy = [] } = useLegacyEndpoints();
  const setMigrationTargetIds = useControlPlaneStore((s) => s.setMigrationTargetIds);
  const [initialized, setInitialized] = useState(false);
  const [sourceRows, setSourceRows] = useState<EndpointRecord[]>([]);
  const [targetRows, setTargetRows] = useState<EndpointRecord[]>([]);
  const [selectedSource, setSelectedSource] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string[]>([]);
  const [dragContext, setDragContext] = useState<{ from: Pane; ids: string[] } | null>(null);
  const [bulkMode, setBulkMode] = useState<TestingMode>("canary");
  const [bulkPercent, setBulkPercent] = useState(10);

  useEffect(() => {
    if (!initialized && legacy.length > 0) {
      const preMigrated = legacy.filter((item) => item.migrated).map((item) => ({ ...item, migrated: true }));
      const source = legacy.filter((item) => !item.migrated);
      setSourceRows(source);
      setTargetRows(preMigrated);
      setInitialized(true);
    }
  }, [initialized, legacy]);

  useEffect(() => {
    setMigrationTargetIds(targetRows.map((row) => row.id));
  }, [setMigrationTargetIds, targetRows]);

  const toggle = (ids: string[], setIds: (value: string[]) => void, value: string) => {
    setIds(ids.includes(value) ? ids.filter((x) => x !== value) : [...ids, value]);
  };

  const moveRows = (from: Pane, ids: string[]) => {
    if (ids.length === 0) return;
    if (from === "source") {
      const moving = sourceRows.filter((item) => ids.includes(item.id)).map((item) => ({ ...item, migrated: true }));
      const nextSource = sourceRows.filter((item) => !ids.includes(item.id));
      const existing = new Set(targetRows.map((item) => item.id));
      const nextTarget = [...targetRows, ...moving.filter((item) => !existing.has(item.id))];
      setSourceRows(nextSource);
      setTargetRows(nextTarget);
      setSelectedSource((prev) => prev.filter((id) => !ids.includes(id)));
      return;
    }

    const moving = targetRows.filter((item) => ids.includes(item.id)).map((item) => ({ ...item, migrated: false }));
    const nextTarget = targetRows.filter((item) => !ids.includes(item.id));
    const existing = new Set(sourceRows.map((item) => item.id));
    const nextSource = [...sourceRows, ...moving.filter((item) => !existing.has(item.id))];
    setTargetRows(nextTarget);
    setSourceRows(nextSource);
    setSelectedTarget((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const applyBulk = () => {
    setTargetRows((prev) => prev.map((row) => (selectedTarget.includes(row.id) ? { ...row, mode: bulkMode, trafficPercent: bulkPercent } : row)));
  };

  const onRowDragStart = (from: Pane, rowId: string) => {
    const selectedIds = from === "source" ? selectedSource : selectedTarget;
    const ids = selectedIds.includes(rowId) ? selectedIds : [rowId];
    setDragContext({ from, ids });
  };

  const onPaneDrop = (to: Pane) => {
    if (!dragContext || dragContext.from === to) return;
    moveRows(dragContext.from, dragContext.ids);
    setDragContext(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Endpoint Migration Workspace" subtitle={`Select endpoints from ${gatewayName}, assign advanced testing mode, and build migration batches.`} />

      <Card>
        <CardTitle>Bulk Actions and Drag-Drop</CardTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={bulkMode} onChange={(e) => setBulkMode(e.target.value as TestingMode)}>
            <option value="none">None</option>
            <option value="mirror">Mirror</option>
            <option value="shadow">Shadow</option>
            <option value="parallel">Parallel</option>
            <option value="canary">Canary</option>
            <option value="cutover">Full Cutover</option>
          </Select>
          <Select value={String(bulkPercent)} onChange={(e) => setBulkPercent(Number(e.target.value))}>
            {[1, 5, 10, 25, 50, 75, 100].map((x) => (
              <option key={x} value={x}>
                {x}%
              </option>
            ))}
          </Select>
          <Button onClick={applyBulk}>Apply Mode/Traffic to Selected</Button>
          <Button variant="secondary" onClick={() => moveRows("source", selectedSource)}>
            Move Selected →
          </Button>
          <Button variant="secondary" onClick={() => moveRows("target", selectedTarget)}>
            ← Move Back
          </Button>
          <span className="text-xs text-muted-foreground">Tip: Drag one or many selected rows between panels.</span>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <EndpointGrid
          title={`${gatewayName} Endpoints`}
          rows={sourceRows}
          selected={selectedSource}
          pane="source"
          onToggleSelect={(id) => toggle(selectedSource, setSelectedSource, id)}
          onDragStart={onRowDragStart}
          onDrop={onPaneDrop}
        />
        <EndpointGrid
          title="Selected for Migration / Testing"
          rows={targetRows}
          selected={selectedTarget}
          pane="target"
          onToggleSelect={(id) => toggle(selectedTarget, setSelectedTarget, id)}
          onDragStart={onRowDragStart}
          onDrop={onPaneDrop}
        />
      </div>
    </div>
  );
}
