"use client";

import React, { useState, useMemo } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Sliders,
  Check,
  Clock,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useWarehouse } from "@/context/WarehouseContext";
import { Alert, AlertSeverity } from "@/types";
import { useToast } from "@/components/ui/Toast";

const INITIAL_ALERTS: Alert[] = [
  {
    id: "alt-001",
    warehouseId: "wh-1",
    warehouseName: "Lagos Central Hub",
    title: "Low Stock: Wireless Mouse (ELE-WMS-001)",
    message: "Current balance (12 units) has dropped below configured threshold (50 units). Immediate reorder recommended.",
    severity: "danger",
    isRead: false,
    isResolved: false,
    createdAt: "2026-11-09T08:15:00Z",
    productId: "prod-1",
    productName: "Wireless Mouse",
  },
  {
    id: "alt-002",
    warehouseId: "wh-1",
    warehouseName: "Lagos Central Hub",
    title: "Low Stock: USB Cable (ACC-USB-002)",
    message: "Current stock (20 units) is below safety stock minimum (50 units).",
    severity: "danger",
    isRead: false,
    isResolved: false,
    createdAt: "2026-11-09T08:30:00Z",
    productId: "prod-2",
    productName: "USB Cable",
  },
  {
    id: "alt-003",
    warehouseId: "wh-2",
    warehouseName: "Ikeja Logistics Depot",
    title: "Low Stock: Laptop Bag (ACC-LPB-003)",
    message: "Current balance (25 units) is below threshold (50 units).",
    severity: "danger",
    isRead: true,
    isResolved: false,
    createdAt: "2026-11-08T16:20:00Z",
    productId: "prod-3",
    productName: "Laptop Bag",
  },
  {
    id: "alt-004",
    warehouseId: "wh-1",
    warehouseName: "Lagos Central Hub",
    title: "Batch Expiry Warning: Hand Sanitizer (Lot #HS-9021)",
    message: "45 units expiring in 18 days (2026-11-27). Move to front shelf or discount for immediate dispatch.",
    severity: "warning",
    isRead: false,
    isResolved: false,
    createdAt: "2026-11-07T12:00:00Z",
  },
  {
    id: "alt-005",
    warehouseId: "wh-2",
    warehouseName: "Ikeja Logistics Depot",
    title: "Stalled Transfer: TRF-2026-0021",
    message: "Inter-warehouse transit from Lagos Central Hub to Ikeja has exceeded 24 hours without receipt confirmation.",
    severity: "warning",
    isRead: false,
    isResolved: false,
    createdAt: "2026-11-09T09:00:00Z",
  },
  {
    id: "alt-006",
    warehouseId: "wh-3",
    warehouseName: "Abuja Regional Facility",
    title: "Stock Discrepancy Resolved: Heavy Duty Corrugated Box",
    message: "Cycle count variance of 8 units reconciled by Admin via adjustment ADJ-2026-0032.",
    severity: "info",
    isRead: true,
    isResolved: true,
    createdAt: "2026-11-06T14:30:00Z",
  },
  {
    id: "alt-007",
    warehouseId: "wh-1",
    warehouseName: "Lagos Central Hub",
    title: "Overstock Notice: Business Laptop 14\"",
    message: "Stock has reached 145 units against max capacity target of 200 units (72.5% allocation).",
    severity: "info",
    isRead: true,
    isResolved: false,
    createdAt: "2026-11-05T10:15:00Z",
  },
];

export default function AlertsPage() {
  const { selectedWarehouse } = useWarehouse();
  const { addToast } = useToast();

  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [resolvedFilter, setResolvedFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Warehouse-scoped alerts
  const warehouseAlerts = useMemo(() => {
    if (selectedWarehouse.id === "wh-all") return alerts;
    return alerts.filter((a) => a.warehouseId === selectedWarehouse.id);
  }, [alerts, selectedWarehouse.id]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return warehouseAlerts.filter((a) => {
      if (severityFilter !== "all" && a.severity !== severityFilter) return false;
      if (resolvedFilter === "unresolved" && a.isResolved) return false;
      if (resolvedFilter === "resolved" && !a.isResolved) return false;
      return true;
    });
  }, [warehouseAlerts, severityFilter, resolvedFilter]);

  const activeDangerCount = warehouseAlerts.filter((a) => a.severity === "danger" && !a.isResolved).length;
  const activeWarningCount = warehouseAlerts.filter((a) => a.severity === "warning" && !a.isResolved).length;
  const resolvedCount = warehouseAlerts.filter((a) => a.isResolved).length;

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, isResolved: true, isRead: true } : a
      )
    );
    addToast("Alert marked as resolved", "success");
  };

  const handleMarkRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    addToast("Marked alert as acknowledged", "info");
  };

  const handleExportCSV = () => {
    const rows = [
      ["ID", "Warehouse", "Title", "Severity", "Read", "Resolved", "Date"],
      ...filteredAlerts.map((a) => [
        a.id,
        a.warehouseName,
        `"${a.title.replace(/"/g, '""')}"`,
        a.severity,
        a.isRead ? "Yes" : "No",
        a.isResolved ? "Yes" : "No",
        a.createdAt,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alerts_${selectedWarehouse.code || "all"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast("Exported alerts log", "success");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            Alerts &amp; Threshold Rules
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time threshold breaches, lot expirations, and stalled transfers for {selectedWarehouse.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Rules</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="wms-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6B7280]">Critical Breaches (Low Stock)</div>
            <div className="text-xl font-bold text-[#111111]">{activeDangerCount}</div>
          </div>
        </div>

        <div className="wms-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6B7280]">Warnings (Expiring / Stalled)</div>
            <div className="text-xl font-bold text-[#111111]">{activeWarningCount}</div>
          </div>
        </div>

        <div className="wms-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6B7280]">Resolved Alerts</div>
            <div className="text-xl font-bold text-[#111111]">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="wms-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-[#6B7280]">Severity:</span>
          {(["all", "danger", "warning", "info"] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                severityFilter === sev
                  ? "bg-[#111111] text-white"
                  : "bg-gray-100 text-[#4B4B4B] hover:bg-gray-200"
              }`}
            >
              {sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
          <select
            value={resolvedFilter}
            onChange={(e) => setResolvedFilter(e.target.value as "all" | "unresolved" | "resolved")}
            className="px-2.5 py-1 text-xs border border-[#EEF0F2] rounded-xl bg-white text-[#111111]"
          >
            <option value="unresolved">Active (Unresolved)</option>
            <option value="resolved">Resolved</option>
            <option value="all">All Records</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="wms-card overflow-hidden">
        <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#111111]" />
            <span className="text-sm font-semibold text-[#111111]">
              Alert Queue ({filteredAlerts.length})
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-[#6B7280]">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-60" />
              <div className="text-sm font-semibold">No alerts matching filter</div>
              <div className="text-xs mt-0.5">All warehouse thresholds are in optimal operating state</div>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isDanger = alert.severity === "danger";
              const isWarning = alert.severity === "warning";

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all ${
                    alert.isResolved
                      ? "bg-gray-50 border-[#EEF0F2] opacity-70"
                      : isDanger
                      ? "bg-red-50/50 border-red-200"
                      : isWarning
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-blue-50/50 border-blue-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isDanger ? (
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Bell className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#111111]">
                            {alert.title}
                          </h4>
                          {!alert.isRead && !alert.isResolved && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          )}
                          <span className="text-[10px] text-[#6B7280]">
                            • {alert.warehouseName}
                          </span>
                        </div>
                        <p className="text-xs text-[#4B4B4B] mt-1 leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-[#6B7280] mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.createdAt).toLocaleString("en-NG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          {alert.productName && (
                            <Link
                              href="/inventory"
                              className="flex items-center gap-0.5 text-[#111111] font-semibold hover:underline"
                            >
                              <span>View Product</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {!alert.isRead && !alert.isResolved && (
                        <button
                          onClick={() => handleMarkRead(alert.id)}
                          className="px-2.5 py-1 text-xs bg-white border border-[#EEF0F2] rounded-lg text-[#111111] hover:bg-gray-100 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {!alert.isResolved ? (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-[#111111] text-white rounded-lg hover:bg-black transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          <span>Resolved</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Rules Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfigModal(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-[#EEF0F2] z-10 space-y-4">
            <h3 className="text-sm font-bold text-[#111111]">
              Automated Alert Rule Thresholds
            </h3>
            <p className="text-xs text-[#6B7280]">
              Configure rules for triggering in-app notices and supervisor notifications.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 border border-[#EEF0F2] rounded-xl">
                <div className="font-semibold text-[#111111]">Low Stock Notification</div>
                <div className="text-[11px] text-[#6B7280] mb-2">
                  Triggers when current stock reaches or drops below product min level.
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6B7280]">Buffer multiplier:</span>
                  <input
                    type="number"
                    defaultValue={1.0}
                    step={0.1}
                    className="w-20 px-2 py-1 border border-[#EEF0F2] rounded-lg text-xs"
                  />
                  <span className="text-[#6B7280]">× minLevel</span>
                </div>
              </div>

              <div className="p-3 border border-[#EEF0F2] rounded-xl">
                <div className="font-semibold text-[#111111]">Batch Expiry Advance Warning</div>
                <div className="text-[11px] text-[#6B7280] mb-2">
                  Days before lot expiration to surface alert in warehouse queue.
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-20 px-2 py-1 border border-[#EEF0F2] rounded-lg text-xs"
                  />
                  <span className="text-[#6B7280]">days prior to expiry</span>
                </div>
              </div>

              <div className="p-3 border border-[#EEF0F2] rounded-xl">
                <div className="font-semibold text-[#111111]">Stalled Inter-Warehouse Transfer</div>
                <div className="text-[11px] text-[#6B7280] mb-2">
                  Maximum allowable time between dispatch and receiving confirmation.
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={24}
                    className="w-20 px-2 py-1 border border-[#EEF0F2] rounded-lg text-xs"
                  />
                  <span className="text-[#6B7280]">hours before flagging</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EEF0F2]">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111111]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  addToast("Alert rule thresholds saved", "success");
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#111111] text-white rounded-xl hover:bg-black"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
