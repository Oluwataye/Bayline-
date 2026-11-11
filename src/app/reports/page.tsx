"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Layers,
  Building,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useWarehouse } from "@/context/WarehouseContext";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type ReportTab = "valuation" | "velocity" | "abc" | "comparison";

export default function ReportsPage() {
  const { selectedWarehouse, warehouses } = useWarehouse();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<ReportTab>("valuation");
  const [dateRange, setDateRange] = useState("month");

  // Stock Valuation breakdown
  const valuationData = [
    { category: "Electronics", items: 1850, value: 425000000, avgUnitCost: 229729 },
    { category: "Furniture", items: 1618, value: 168000000, avgUnitCost: 103831 },
    { category: "Accessories", items: 1387, value: 45000000, avgUnitCost: 32444 },
    { category: "Others (Packaging)", items: 925, value: 12500000, avgUnitCost: 13513 },
  ];
  const totalValuation = valuationData.reduce((acc, curr) => acc + curr.value, 0);

  // Velocity data (Inbound vs Outbound)
  const velocityData = [
    { period: "Week 1", inbound: 240, outbound: 190 },
    { period: "Week 2", inbound: 310, outbound: 280 },
    { period: "Week 3", inbound: 420, outbound: 390 },
    { period: "Week 4", inbound: 280, outbound: 320 },
  ];

  // ABC Analysis distribution
  const abcData = [
    {
      grade: "Category A (High Value)",
      desc: "Top 15% SKUs accounting for ~70% total inventory value (Laptops, Servers, Smart Displays)",
      skuCount: 9,
      valueShare: "70.5%",
      turnover: "High (4.8x/yr)",
      policy: "Strict daily cycle counts & tight reorder thresholds",
    },
    {
      grade: "Category B (Moderate Value)",
      desc: "Next 30% SKUs accounting for ~20% total inventory value (Chairs, Desks, Keyboards)",
      skuCount: 18,
      valueShare: "21.2%",
      turnover: "Moderate (2.5x/yr)",
      policy: "Bi-weekly review & automated standard reorder triggers",
    },
    {
      grade: "Category C (Low Value / Bulk)",
      desc: "Remaining 55% SKUs accounting for ~10% total value (Cables, Boxes, Tape, Bubble Wrap)",
      skuCount: 36,
      valueShare: "8.3%",
      turnover: "Low-Medium (1.2x/yr)",
      policy: "Periodic monthly count & high safety stock buffers",
    },
  ];

  // Multi-warehouse comparison metrics
  const comparisonData = warehouses
    .filter((w) => w.id !== "wh-all")
    .map((w) => ({
      name: w.name,
      code: w.code,
      city: w.city,
      capacitySqm: w.capacitySqm,
      utilization: w.utilizationRate,
      activeBins: Math.round(w.totalBins * (w.utilizationRate / 100)),
      totalBins: w.totalBins,
    }));

  const handleExportCSV = () => {
    addToast(`Exported ${activeTab.toUpperCase()} report as CSV`, "success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            Reports &amp; Intelligence Analytics
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Operational summaries, turnover analysis, and inventory intelligence for {selectedWarehouse.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range picker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#EEF0F2] rounded-xl text-xs text-[#4B4B4B]">
            <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none font-semibold text-[#111111]"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-700" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EEF0F2] pb-2 overflow-x-auto">
        {[
          { id: "valuation", label: "Stock Valuation", icon: DollarSign },
          { id: "velocity", label: "Movement & Velocity", icon: TrendingUp },
          { id: "abc", label: "ABC Classification", icon: Layers },
          { id: "comparison", label: "Warehouse Comparison", icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#111111] text-white shadow-sm"
                  : "bg-white text-[#6B7280] hover:bg-gray-100 hover:text-[#111111] border border-[#EEF0F2]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STOCK VALUATION */}
      {activeTab === "valuation" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="wms-card p-4">
              <div className="text-xs text-[#6B7280]">Total Inventory Worth (Cost Basis)</div>
              <div className="text-2xl font-extrabold text-[#111111] mt-1">
                {formatCurrency(totalValuation)}
              </div>
              <div className="text-[11px] text-[#16A34A] font-semibold mt-1">
                ▲ +4.2% vs previous quarter
              </div>
            </div>

            <div className="wms-card p-4">
              <div className="text-xs text-[#6B7280]">Total Active Stock Units</div>
              <div className="text-2xl font-extrabold text-[#111111] mt-1">
                5,780 pcs
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">Across 63 SKU catalogue items</div>
            </div>

            <div className="wms-card p-4">
              <div className="text-xs text-[#6B7280]">Valuation Methodology</div>
              <div className="text-2xl font-extrabold text-[#111111] mt-1">
                FIFO
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">First-In, First-Out ledger derived</div>
            </div>
          </div>

          <div className="wms-card overflow-hidden">
            <div className="p-4 border-b border-[#EEF0F2]">
              <h3 className="text-sm font-bold text-[#111111]">
                Valuation by Category Segment
              </h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F6] text-[#111111]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Unit Count</th>
                  <th className="py-3 px-4 font-semibold">Average Unit Cost</th>
                  <th className="py-3 px-4 font-semibold">Total Segment Value</th>
                  <th className="py-3 px-4 font-semibold text-right">% of Inventory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {valuationData.map((row) => {
                  const share = ((row.value / totalValuation) * 100).toFixed(1);
                  return (
                    <tr key={row.category} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4 font-semibold text-[#111111]">{row.category}</td>
                      <td className="py-3 px-4 text-[#4B4B4B]">{formatNumber(row.items)} units</td>
                      <td className="py-3 px-4 text-[#4B4B4B]">{formatCurrency(row.avgUnitCost)}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#111111]">
                        {formatCurrency(row.value)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#111111]">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MOVEMENT & VELOCITY */}
      {activeTab === "velocity" && (
        <div className="space-y-4">
          <div className="wms-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">
                  Weekly Inbound vs Outbound Velocity
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Comparative item throughput volume (units transacted)
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F2" vertical={false} />
                  <XAxis dataKey="period" stroke="#8A8A8A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8A8A8A" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="inbound" name="Inbound (Restock)" fill="#111111" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outbound" name="Outbound (Dispatched)" fill="#8A8A8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ABC CLASSIFICATION */}
      {activeTab === "abc" && (
        <div className="space-y-4">
          <div className="wms-card p-5">
            <h3 className="text-sm font-bold text-[#111111] mb-1">
              Pareto 80/20 Inventory Categorization
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">
              Items classified by annual dollar usage to prioritize warehouse picking routes and cycle counts.
            </p>

            <div className="space-y-3">
              {abcData.map((item) => (
                <div key={item.grade} className="p-4 rounded-xl border border-[#EEF0F2] bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#111111]">{item.grade}</span>
                    <span className="text-xs font-mono font-bold text-[#111111] bg-gray-100 px-2 py-0.5 rounded-full">
                      Value Contribution: {item.valueShare}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B4B4B] mb-2">{item.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-[#F4F5F7] p-2.5 rounded-lg">
                    <div>
                      <span className="text-[#6B7280]">SKU Allocation: </span>
                      <span className="font-semibold text-[#111111]">{item.skuCount} items</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280]">Velocity / Turnover: </span>
                      <span className="font-semibold text-[#111111]">{item.turnover}</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280]">Audit Strategy: </span>
                      <span className="font-semibold text-[#111111]">{item.policy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WAREHOUSE COMPARISON */}
      {activeTab === "comparison" && (
        <div className="wms-card overflow-hidden">
          <div className="p-4 border-b border-[#EEF0F2]">
            <h3 className="text-sm font-bold text-[#111111]">
              Cross-Warehouse Capacity &amp; Utilization Comparison
            </h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#111111]">
              <tr>
                <th className="py-3 px-4 font-semibold">Warehouse Name</th>
                <th className="py-3 px-4 font-semibold">Facility Code</th>
                <th className="py-3 px-4 font-semibold">City</th>
                <th className="py-3 px-4 font-semibold">Floor Area</th>
                <th className="py-3 px-4 font-semibold">Occupied Bins</th>
                <th className="py-3 px-4 font-semibold text-right">Utilization Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {comparisonData.map((w) => (
                <tr key={w.code} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-semibold text-[#111111]">{w.name}</td>
                  <td className="py-3 px-4 font-mono text-[#6B7280]">{w.code}</td>
                  <td className="py-3 px-4 text-[#4B4B4B]">{w.city}</td>
                  <td className="py-3 px-4 text-[#4B4B4B]">{formatNumber(w.capacitySqm)} m²</td>
                  <td className="py-3 px-4 text-[#4B4B4B]">
                    {w.activeBins} / {w.totalBins} bins
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-[#111111]">{w.utilization}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
