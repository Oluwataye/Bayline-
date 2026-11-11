"use client";

import React from "react";
import { Users, Plus, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CRMPage() {
  const deals = [
    { title: "Enterprise Bulk Order - 500 Laptops", client: "Dangote Refinery", val: 280000000, stage: "Quoted" },
    { title: "Office Ergonomic Fitout", client: "Kuda Bank", val: 14500000, stage: "Negotiation" },
    { title: "Warehousing Bins Supply", client: "Jumia Logistics", val: 8200000, stage: "Won" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            CRM & Sales Pipeline
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            B2B accounts, wholesale quotes, and outbound dispatch linkages
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm self-start sm:self-auto">
          <Plus className="w-3.5 h-3.5" />
          <span>New Quote / Deal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deals.map((deal) => (
          <div key={deal.title} className="wms-card p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 rounded text-[#111111]">
                  {deal.stage}
                </span>
                <span className="text-xs font-bold text-[#111111]">
                  {formatCurrency(deal.val)}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#111111]">{deal.title}</h3>
              <p className="text-xs text-[#6B7280] mt-1">{deal.client}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#EEF0F2] text-[11px] text-[#8A8A8A]">
              Connected to Inventory Dispatch
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

