"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";

export function LowStockAlertTable() {
  const { dashboardData } = useWarehouse();
  const items = dashboardData.lowStockItems;

  return (
    <div className="wms-card p-5 flex flex-col h-full min-h-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#111111]" />
          <h2 className="text-base font-semibold text-[#111111] tracking-tight">
            Low Stock Alert
          </h2>
        </div>
        <Link
          href="/inventory?filter=low_stock"
          className="text-xs font-medium text-[#6B7280] hover:text-[#111111] flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F3F4F6] text-[#111111] border-b border-[#EEF0F2]">
              <th className="py-2.5 px-4 font-semibold rounded-l-lg">Product</th>
              <th className="py-2.5 px-4 font-semibold">Current Stock</th>
              <th className="py-2.5 px-4 font-semibold">Min Level</th>
              <th className="py-2.5 px-4 font-semibold text-right rounded-r-lg">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF0F2]">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
              >
                <td className="py-3 px-4 font-medium text-[#111111]">
                  <span className="group-hover:underline">{item.product}</span>
                </td>
                <td className="py-3 px-4 text-[#111111] font-semibold">
                  {item.currentStock}
                </td>
                <td className="py-3 px-4 text-[#6B7280]">
                  {item.minLevel}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="wms-badge-danger">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#6B7280]">
                  No items currently below minimum stock levels.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

