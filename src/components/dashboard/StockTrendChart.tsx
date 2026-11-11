"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ChevronDown } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { formatNumber } from "@/lib/utils";

const PERIOD_OPTIONS = [
  "Today",
  "Last 7 Days",
  "This Month",
  "This Year",
  "Custom",
];

export function StockTrendChart() {
  const { dashboardData } = useWarehouse();
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const data = dashboardData.trend;

  return (
    <div className="wms-card p-5 flex flex-col h-full min-h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#111111]" />
          <h2 className="text-base font-semibold text-[#111111] tracking-tight">
            Stock Trend
          </h2>
        </div>

        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#111111] bg-white border border-[#EEF0F2] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>

          {periodDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#EEF0F2] rounded-xl shadow-dropdown py-1 z-30">
              {PERIOD_OPTIONS.map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period);
                    setPeriodDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    selectedPeriod === period
                      ? "bg-[#F3F4F6] text-[#111111] font-semibold"
                      : "text-[#4B4B4B] hover:bg-gray-50"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="stockTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8A8A8A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#F3F4F6"
              strokeDasharray="0"
              vertical={true}
              horizontal={true}
            />

            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#EEF0F2" }}
              dy={6}
            />

            <YAxis
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#EEF0F2" }}
              domain={[0, 5000]}
              ticks={[0, 1000, 2000, 3000, 4000, 5000]}
              tickFormatter={(val) => (val === 0 ? "0" : `${val / 1000}K`)}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#111111] text-white px-3 py-1.5 rounded-lg shadow-lg text-xs">
                      <p className="font-medium text-[#E5E5E5]">
                        {payload[0].payload.date}
                      </p>
                      <p className="font-bold text-white text-sm">
                        {formatNumber(Number(payload[0].value))} units
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="stockLevel"
              stroke="#111111"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#stockTrendGradient)"
              dot={{
                r: 4,
                fill: "#111111",
                stroke: "#111111",
                strokeWidth: 1,
              }}
              activeDot={{
                r: 6,
                fill: "#111111",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

