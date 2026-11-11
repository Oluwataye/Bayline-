"use client";

import React from "react";
import { Wallet, Plus, Download, CheckCircle2 } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { formatCurrency } from "@/lib/utils";

export default function PayrollPage() {
  const { selectedWarehouse } = useWarehouse();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            Payroll & Compensation
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Configured for Nigeria statutory deductions (PAYE, Pension 8%, NHF 2.5%) for {selectedWarehouse.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span>Export Bank Schedule</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Run</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="wms-card p-4">
          <span className="text-xs text-[#6B7280]">Total Gross Payroll (Nov 2026)</span>
          <div className="text-2xl font-bold text-[#111111] mt-1">{formatCurrency(4850000)}</div>
          <span className="text-[11px] text-green-600 font-medium">18 Employees active</span>
        </div>
        <div className="wms-card p-4">
          <span className="text-xs text-[#6B7280]">Statutory Remittances (PAYE/Pension/NHF)</span>
          <div className="text-2xl font-bold text-[#111111] mt-1">{formatCurrency(780000)}</div>
          <span className="text-[11px] text-[#6B7280]">Compliant with Nigeria Finance Act</span>
        </div>
        <div className="wms-card p-4">
          <span className="text-xs text-[#6B7280]">Net Payable</span>
          <div className="text-2xl font-bold text-[#111111] mt-1">{formatCurrency(4070000)}</div>
          <span className="text-[11px] text-blue-600 font-medium">Status: Draft for Review</span>
        </div>
      </div>
    </div>
  );
}

