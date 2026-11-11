"use client";

import React from "react";
import { Repeat, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, SlidersHorizontal } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";

export default function StockMovementsPage() {
  const { selectedWarehouse, dashboardData } = useWarehouse();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            Stock Movements & Ledger
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Immutable transaction records for {selectedWarehouse.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm">
            <ArrowDownLeft className="w-3.5 h-3.5 text-green-600" />
            <span>Receive Goods</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm">
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Dispatch Order</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      <div className="wms-card overflow-hidden">
        <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-[#111111]" />
            <span className="text-sm font-semibold text-[#111111]">
              Recent Movement Transactions
            </span>
          </div>
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-[#EEF0F2] rounded-lg text-[#6B7280]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter by Type</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#111111] border-b border-[#EEF0F2]">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Activity</th>
                <th className="py-3 px-4 font-semibold">Initiated By</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {dashboardData.recentActivities.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 text-[#6B7280]">{act.dateTime}</td>
                  <td className="py-3 px-4 font-medium text-[#111111]">{act.activity}</td>
                  <td className="py-3 px-4 text-[#111111]">{act.user}</td>
                  <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#6B7280]">
                    {act.type}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-[#111111]">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

