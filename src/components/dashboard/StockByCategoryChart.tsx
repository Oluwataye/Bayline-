"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Package } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { formatNumber } from "@/lib/utils";

export function StockByCategoryChart() {
  const { dashboardData } = useWarehouse();
  const { categories } = dashboardData;

  return (
    <div className="wms-card p-5 flex flex-col h-full min-h-[340px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-5 h-5 text-[#111111]" />
        <h2 className="text-base font-semibold text-[#111111] tracking-tight">
          Stock by Category
        </h2>
      </div>

      {/* Donut and Legend Container */}
      <div className="flex flex-col sm:flex-row items-center justify-around flex-1 gap-4">
        {/* Donut Chart with Centered Total */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories.items}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                stroke="none"
              >
                {categories.items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-[#111111] text-white px-2.5 py-1.5 rounded-lg text-xs shadow-lg">
                        <p className="font-semibold">{item.category}</p>
                        <p className="text-[#E5E5E5]">
                          {formatNumber(item.count)} units ({item.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Text matching screenshot */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[19px] sm:text-[21px] font-extrabold text-[#111111] tracking-tight leading-tight">
              {formatNumber(categories.total)}
            </span>
            <span className="text-[11px] font-medium text-[#6B7280]">
              Total
            </span>
          </div>
        </div>

        {/* Legend List on Right matching screenshot */}
        <div className="flex flex-col justify-center gap-2.5 w-full sm:w-auto px-2">
          {categories.items.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between gap-5 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-[#111111] text-xs">
                  {cat.category}
                </span>
              </div>
              <span className="font-semibold text-[#111111] text-xs">
                {cat.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
