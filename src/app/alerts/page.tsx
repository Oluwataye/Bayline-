"use client";

import React from "react";
import { Bell, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";

export default function AlertsPage() {
  const { dashboardData } = useWarehouse();
  const lowStock = dashboardData.lowStockItems;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
          Alerts & System Notifications
        </h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Real-time stock breaches, expiration warnings, and threshold triggers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="wms-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6B7280]">Active Low Stock</div>
            <div className="text-xl font-bold text-[#111111]">{lowStock.length}</div>
          </div>
        </div>

        <div className="wms-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6B7280]">Expiring Batches (30d)</div>
            <div className="text-xl font-bold text-[#111111]">1</div>
          </div>
        </div>

        <div className="wms-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6B7280]">Resolved Today</div>
            <div className="text-xl font-bold text-[#111111]">4</div>
          </div>
        </div>
      </div>

      <div className="wms-card overflow-hidden">
        <div className="p-4 border-b border-[#EEF0F2] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#111111]" />
          <span className="text-sm font-semibold text-[#111111]">
            Active Alerts Queue
          </span>
        </div>
        <div className="p-4 space-y-3">
          {lowStock.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-red-200 bg-red-50/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-[#111111]">
                    {item.product} ({item.sku}) is below threshold
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    Current Stock: {item.currentStock} units • Minimum Required: {item.minLevel} units
                  </div>
                </div>
              </div>
              <span className="wms-badge-danger">Low Stock</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

