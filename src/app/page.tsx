"use client";

import React from "react";
import { KPICards } from "@/components/dashboard/KPICards";
import { StockTrendChart } from "@/components/dashboard/StockTrendChart";
import { StockByCategoryChart } from "@/components/dashboard/StockByCategoryChart";
import { LowStockAlertTable } from "@/components/dashboard/LowStockAlertTable";
import { RecentActivitiesTable } from "@/components/dashboard/RecentActivitiesTable";

export default function OverviewPage() {
  return (
    <div className="space-y-4 md:space-y-5">
      {/* Row 1: 4 KPI Cards */}
      <KPICards />

      {/* Row 2: Stock Trend (2/3) + Stock by Category (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        <div className="lg:col-span-2">
          <StockTrendChart />
        </div>
        <div className="lg:col-span-1">
          <StockByCategoryChart />
        </div>
      </div>

      {/* Row 3: Low Stock Alert (1/2) + Recent Activities (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <LowStockAlertTable />
        <RecentActivitiesTable />
      </div>
    </div>
  );
}

