"use client";

import React, { useState, useMemo } from "react";
import {
  Repeat,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { SEED_MOVEMENTS } from "@/lib/seed-movements";
import { StockMovement, MovementType, MovementStatus } from "@/types";
import { formatNumber } from "@/lib/utils";

// ─── Type constants ───────────────────────────────────────────────────────────
const MOVEMENT_TYPES: { label: string; value: MovementType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Inbound", value: "inbound" },
  { label: "Outbound", value: "outbound" },
  { label: "Transfer", value: "transfer" },
  { label: "Adjustment", value: "adjustment" },
  { label: "Return", value: "return" },
];

const STATUSES: MovementStatus[] = [
  "draft",
  "pending",
  "in_transit",
  "completed",
  "cancelled",
];

// ─── Badge helpers ────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: MovementType }) {
  const cfg: Record<MovementType, { label: string; classes: string }> = {
    inbound: { label: "Inbound", classes: "bg-green-100 text-green-700" },
    outbound: { label: "Outbound", classes: "bg-blue-100 text-blue-700" },
    transfer: { label: "Transfer", classes: "bg-purple-100 text-purple-700" },
    adjustment: { label: "Adjustment", classes: "bg-yellow-100 text-yellow-700" },
    return: { label: "Return", classes: "bg-orange-100 text-orange-700" },
  };
  const { label, classes } = cfg[type];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: MovementStatus }) {
  const cfg: Record<MovementStatus, { label: string; classes: string }> = {
    draft: { label: "Draft", classes: "bg-gray-100 text-gray-500" },
    pending: { label: "Pending", classes: "bg-yellow-100 text-yellow-700" },
    in_transit: { label: "In Transit", classes: "bg-blue-100 text-blue-700" },
    completed: { label: "Completed", classes: "bg-green-100 text-green-700" },
    cancelled: { label: "Cancelled", classes: "bg-[#FECACA] text-[#B91C1C]" },
  };
  const { label, classes } = cfg[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

function TypeIcon({ type }: { type: MovementType }) {
  const cls = "w-3.5 h-3.5";
  if (type === "inbound") return <ArrowDownLeft className={`${cls} text-green-600`} />;
  if (type === "outbound") return <ArrowUpRight className={`${cls} text-blue-600`} />;
  if (type === "transfer") return <ArrowLeftRight className={`${cls} text-purple-600`} />;
  if (type === "adjustment") return <SlidersHorizontal className={`${cls} text-yellow-600`} />;
  return <RefreshCw className={`${cls} text-orange-600`} />;
}

// ─── Movement Detail Drawer ───────────────────────────────────────────────────
function MovementDrawer({
  movement,
  onClose,
}: {
  movement: StockMovement | null;
  onClose: () => void;
}) {
  if (!movement) return null;

  const warehouseLabel = (() => {
    if (movement.type === "transfer") {
      return `${movement.sourceWarehouseName ?? "—"} → ${movement.destWarehouseName ?? "—"}`;
    }
    if (movement.type === "inbound") return movement.destWarehouseName ?? "—";
    return movement.sourceWarehouseName ?? "—";
  })();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Movement details — ${movement.movementNumber}`}
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF0F2]">
          <div>
            <div className="text-sm font-bold text-[#111111]">
              {movement.movementNumber}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">{warehouseLabel}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status + Type row */}
          <div className="flex items-center gap-2">
            <TypeBadge type={movement.type} />
            <StatusBadge status={movement.status} />
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[#6B7280] mb-0.5">Reference</div>
              <div className="font-semibold text-[#111111]">
                {movement.reference ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-[#6B7280] mb-0.5">Created By</div>
              <div className="font-semibold text-[#111111]">{movement.createdBy}</div>
            </div>
            <div>
              <div className="text-[#6B7280] mb-0.5">Date</div>
              <div className="font-semibold text-[#111111]">
                {new Date(movement.createdAt).toLocaleString("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
            <div>
              <div className="text-[#6B7280] mb-0.5">Total Qty</div>
              <div className="font-semibold text-[#111111]">
                {formatNumber(movement.totalQuantity)} units
              </div>
            </div>
          </div>

          {/* Notes */}
          {movement.notes && (
            <div className="text-xs">
              <div className="text-[#6B7280] mb-1">Notes</div>
              <div className="p-3 rounded-xl bg-[#F4F5F7] text-[#111111] leading-relaxed">
                {movement.notes}
              </div>
            </div>
          )}

          {/* Line items */}
          {movement.items && movement.items.length > 0 && (
            <div>
              <div className="text-xs text-[#6B7280] mb-2">Line Items</div>
              <div className="space-y-2">
                {movement.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-[#EEF0F2] text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#111111]">
                        {item.productName}
                      </span>
                      <span className="text-[#6B7280]">{item.sku}</span>
                    </div>
                    <div className="flex gap-4 text-[#6B7280]">
                      <span>Qty: {formatNumber(item.quantityTransacted)}</span>
                      <span>
                        Unit: ₦{formatNumber(item.unitCost)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Summary KPI bar ──────────────────────────────────────────────────────────
function SummaryBar({ movements }: { movements: StockMovement[] }) {
  const summary = useMemo(() => {
    const inbound = movements.filter((m) => m.type === "inbound" && m.status === "completed").reduce((a, m) => a + m.totalQuantity, 0);
    const outbound = movements.filter((m) => m.type === "outbound" && m.status === "completed").reduce((a, m) => a + m.totalQuantity, 0);
    const transfers = movements.filter((m) => m.type === "transfer").length;
    const pending = movements.filter((m) => m.status === "pending" || m.status === "in_transit").length;
    return { inbound, outbound, transfers, pending };
  }, [movements]);

  const cards = [
    { label: "Total Inbound (units)", value: formatNumber(summary.inbound), color: "text-[#16A34A]" },
    { label: "Total Outbound (units)", value: formatNumber(summary.outbound), color: "text-blue-600" },
    { label: "Active Transfers", value: String(summary.transfers), color: "text-purple-600" },
    { label: "Pending / In Transit", value: String(summary.pending), color: "text-yellow-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="wms-card p-4">
          <div className="text-[11px] text-[#6B7280] mb-1">{card.label}</div>
          <div className={`text-2xl font-extrabold ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export default function StockMovementsPage() {
  const { selectedWarehouse } = useWarehouse();

  const [typeFilter, setTypeFilter] = useState<MovementType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<MovementStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<StockMovement | null>(null);

  // Filter to warehouse
  const warehouseMovements = useMemo(() => {
    if (selectedWarehouse.id === "wh-all") return SEED_MOVEMENTS;
    return SEED_MOVEMENTS.filter(
      (m) =>
        m.sourceWarehouseId === selectedWarehouse.id ||
        m.destWarehouseId === selectedWarehouse.id
    );
  }, [selectedWarehouse.id]);

  // Apply filters
  const filtered = useMemo(() => {
    return warehouseMovements.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          m.movementNumber.toLowerCase().includes(q) ||
          (m.reference ?? "").toLowerCase().includes(q) ||
          m.createdBy.toLowerCase().includes(q) ||
          (m.notes ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [warehouseMovements, typeFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  const handleTypeFilter = (v: MovementType | "all") => { setTypeFilter(v); setPage(1); };
  const handleStatusFilter = (v: MovementStatus | "all") => { setStatusFilter(v); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  // CSV export
  const handleExport = () => {
    const rows = [
      ["Movement #", "Type", "Status", "Source", "Destination", "Total Qty", "Reference", "Created By", "Date"],
      ...filtered.map((m) => [
        m.movementNumber,
        m.type,
        m.status,
        m.sourceWarehouseName ?? "",
        m.destWarehouseName ?? "",
        String(m.totalQuantity),
        m.reference ?? "",
        m.createdBy,
        new Date(m.createdAt).toLocaleString("en-NG"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock-movements.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const warehouseForMovement = (m: StockMovement) => {
    if (m.type === "transfer") {
      return `${m.sourceWarehouseName ?? "?"} → ${m.destWarehouseName ?? "?"}`;
    }
    if (m.type === "inbound") return m.destWarehouseName ?? "—";
    return m.sourceWarehouseName ?? "—";
  };

  return (
    <>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
              Stock Movements &amp; Ledger
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Immutable transaction records for {selectedWarehouse.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm">
              <ArrowDownLeft className="w-3.5 h-3.5 text-green-600" />
              <span>Receive Goods</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm">
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
              <span>Dispatch</span>
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>New Movement</span>
            </button>
          </div>
        </div>

        {/* Summary KPIs */}
        <SummaryBar movements={warehouseMovements} />

        {/* Filters */}
        <div className="wms-card p-4 flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search by movement #, reference, or user…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/20"
            />
          </div>

          {/* Type tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {MOVEMENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTypeFilter(t.value)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  typeFilter === t.value
                    ? "bg-[#111111] text-white"
                    : "bg-white border border-[#EEF0F2] text-[#6B7280] hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as MovementStatus | "all")}
            className="px-2.5 py-1.5 text-[11px] border border-[#EEF0F2] rounded-xl bg-white text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#111111]/20"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="wms-card overflow-hidden">
          <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#111111]" />
              <span className="text-sm font-semibold text-[#111111]">
                Movement Transactions
              </span>
              <span className="ml-1 text-xs text-[#6B7280]">
                ({filtered.length} records)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F6] text-[#111111] border-b border-[#EEF0F2]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Movement #</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Warehouse</th>
                  <th className="py-3 px-4 font-semibold">Items</th>
                  <th className="py-3 px-4 font-semibold">Total Qty</th>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Created By</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                  <th className="py-3 px-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#6B7280]">
                      <Repeat className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <div className="text-sm font-medium">No movements found</div>
                      <div className="text-xs mt-1">Try adjusting your filters</div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-gray-50/70 cursor-pointer"
                      onClick={() => setSelected(m)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-[#111111]">
                        <div className="flex items-center gap-1.5">
                          <TypeIcon type={m.type} />
                          {m.movementNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <TypeBadge type={m.type} />
                      </td>
                      <td className="py-3 px-4 text-[#111111] max-w-[160px] truncate">
                        {warehouseForMovement(m)}
                      </td>
                      <td className="py-3 px-4 text-[#6B7280]">
                        {m.totalItems} {m.totalItems === 1 ? "item" : "items"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#111111]">
                        {formatNumber(m.totalQuantity)}
                      </td>
                      <td className="py-3 px-4 text-[#6B7280] font-mono text-[11px]">
                        {m.reference ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-[#111111]">{m.createdBy}</td>
                      <td className="py-3 px-4 text-[#6B7280]">
                        {new Date(m.createdAt).toLocaleDateString("en-NG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(m);
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                          aria-label={`View details for ${m.movementNumber}`}
                        >
                          <Eye className="w-3.5 h-3.5 text-[#6B7280]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-[#EEF0F2] flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">
              Showing{" "}
              {filtered.length === 0
                ? "0"
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)}`}{" "}
              of {filtered.length} records
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-[#EEF0F2] disabled:opacity-40 hover:bg-gray-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs px-2 text-[#111111]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-[#EEF0F2] disabled:opacity-40 hover:bg-gray-50"
                aria-label="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <MovementDrawer movement={selected} onClose={() => setSelected(null)} />
    </>
  );
}
