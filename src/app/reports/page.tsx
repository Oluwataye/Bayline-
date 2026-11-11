"use client";

import React from "react";
import { BarChart3, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";

export default function ReportsPage() {
  const { selectedWarehouse } = useWarehouse();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            Reports & Analytics
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Operational summaries and inventory intelligence for {selectedWarehouse.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm">
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-700" />
            <span>Export XLSX</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm">
            <FileText className="w-3.5 h-3.5 text-red-600" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Stock Valuation", desc: "FIFO and weighted average inventory cost analysis." },
          { title: "ABC Velocity Analysis", desc: "Pareto 80/20 product turnover classification." },
          { title: "Stock Ageing Report", desc: "Slow-moving and dead stock identification." },
          { title: "Warehouse Comparison", desc: "Capacity, throughput, and utilization across nodes." },
          { title: "Supplier Scorecard", desc: "Lead time, fulfillment rate, and accuracy metrics." },
          { title: "Audit Trail Summary", desc: "Comprehensive user modification history log." },
        ].map((rep) => (
          <div key={rep.title} className="wms-card p-5 flex flex-col justify-between hover:border-gray-300 transition-colors cursor-pointer">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <BarChart3 className="w-4 h-4 text-[#111111]" />
                <h3 className="text-sm font-semibold text-[#111111]">{rep.title}</h3>
              </div>
              <p className="text-xs text-[#6B7280]">{rep.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#EEF0F2] flex items-center justify-between">
              <span className="text-[11px] text-[#8A8A8A]">Generated Daily</span>
              <span className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1">
                Run Report
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

