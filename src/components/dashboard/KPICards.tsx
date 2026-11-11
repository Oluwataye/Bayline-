"use client";

import React from "react";
import { Package, ShoppingCart } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { formatNumber } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string | number;
  deltaPercent: number;
  deltaPeriod: string;
  icon: React.ReactNode;
}

function KPICard({ label, value, deltaPercent, deltaPeriod, icon }: KPICardProps) {
  const isPositive = deltaPercent >= 0;

  return (
    <div className="wms-card p-4 lg:p-5 flex items-start gap-3.5 sm:gap-4">
      {/* Black Circular Badge with White Glyph matching reference screenshot */}
      <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-[#111111] rounded-full text-white shrink-0 mt-0.5">
        {icon}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs sm:text-[13px] font-medium text-[#111111] leading-none mb-1.5 whitespace-nowrap">
          {label}
        </span>
        <span className="text-[26px] sm:text-[30px] lg:text-[32px] font-extrabold tracking-tight text-[#111111] leading-none mb-2">
          {typeof value === "number" ? formatNumber(value) : value}
        </span>
        <div className="flex items-center gap-1 text-[11px] leading-tight">
          <span
            className={
              isPositive
                ? "text-[#16A34A] font-semibold flex items-center gap-0.5"
                : "text-[#DC2626] font-semibold flex items-center gap-0.5"
            }
          >
            <span>{isPositive ? "▲" : "▼"}</span>
            <span>
              {isPositive ? `+${deltaPercent}%` : `${deltaPercent}%`}
            </span>
          </span>
          <span className="text-[#6B7280] truncate">{deltaPeriod}</span>
        </div>
      </div>
    </div>
  );
}

export function KPICards() {
  const { dashboardData } = useWarehouse();
  const { kpis } = dashboardData;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
      {/* 1: Total Stock Items */}
      <KPICard
        label="Total Stock Items"
        value={kpis.totalStockItems.value}
        deltaPercent={kpis.totalStockItems.deltaPercent}
        deltaPeriod={kpis.totalStockItems.deltaPeriod}
        icon={
          /* Outline isometric box icon matching screenshot */
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        }
      />

      {/* 2: Total Inbound */}
      <KPICard
        label="Total Inbound"
        value={kpis.totalInbound.value}
        deltaPercent={kpis.totalInbound.deltaPercent}
        deltaPeriod={kpis.totalInbound.deltaPeriod}
        icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />}
      />

      {/* 3: Total Outbound */}
      <KPICard
        label="Total Outbound"
        value={kpis.totalOutbound.value}
        deltaPercent={kpis.totalOutbound.deltaPercent}
        deltaPeriod={kpis.totalOutbound.deltaPeriod}
        icon={
          /* Square with arrow leaving top-right matching screenshot */
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="none" />
            <path d="M14 2h8v8" />
            <line x1="22" y1="2" x2="11" y2="13" />
          </svg>
        }
      />

      {/* 4: Warehouse Utilization */}
      <KPICard
        label="Warehouse Utilization"
        value={`${kpis.warehouseUtilization.value}%`}
        deltaPercent={kpis.warehouseUtilization.deltaPercent}
        deltaPeriod={kpis.warehouseUtilization.deltaPeriod}
        icon={
          /* Outline warehouse building with pediment roof & shelves matching screenshot */
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
            <path d="M8 12h8" />
            <path d="M8 16h8" />
            <path d="M12 9v11" />
          </svg>
        }
      />
    </section>
  );
}
