"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Warehouse, DashboardData } from "@/types";
import { SEED_WAREHOUSES, SCREENSHOT_DASHBOARD_DATA } from "@/lib/seed-data";
import { APP_CONFIG } from "@/config/app.config";

interface WarehouseContextType {
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  selectedWarehouse: Warehouse;
  setSelectedWarehouseId: (id: string) => void;
  dashboardData: DashboardData;
  lastUpdated: string;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export function WarehouseProvider({ children }: { children: React.ReactNode }) {
  const [warehouses] = useState<Warehouse[]>(SEED_WAREHOUSES);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("wh-all");
  const [dashboardData, setDashboardData] = useState<DashboardData>(SCREENSHOT_DASHBOARD_DATA);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedWarehouse =
    warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

  // Adjust metrics dynamically if an individual warehouse is selected
  useEffect(() => {
    if (selectedWarehouseId === "wh-all") {
      setDashboardData(SCREENSHOT_DASHBOARD_DATA);
    } else {
      // Calculate warehouse-specific scaled metrics
      const ratio = selectedWarehouseId === "wh-1" ? 0.58 : selectedWarehouseId === "wh-2" ? 0.26 : 0.16;
      setDashboardData({
        ...SCREENSHOT_DASHBOARD_DATA,
        kpis: {
          totalStockItems: {
            value: Math.round(5780 * ratio),
            deltaPercent: +(2.5 * (ratio > 0.3 ? 1 : -0.5)).toFixed(1),
            deltaPeriod: "vs last month",
          },
          totalInbound: {
            value: Math.round(1250 * ratio),
            deltaPercent: 8.7,
            deltaPeriod: "vs last month",
          },
          totalOutbound: {
            value: Math.round(1180 * ratio),
            deltaPercent: 6.3,
            deltaPeriod: "vs last month",
          },
          warehouseUtilization: {
            value: selectedWarehouse.utilizationRate,
            deltaPercent: 1.2,
            deltaPeriod: "vs last month",
          },
        },
        lowStockItems: SCREENSHOT_DASHBOARD_DATA.lowStockItems.filter(
          (item) => item.warehouseId === selectedWarehouseId || selectedWarehouseId === "wh-all"
        ),
      });
    }
  }, [selectedWarehouseId, selectedWarehouse]);

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        selectedWarehouseId,
        selectedWarehouse,
        setSelectedWarehouseId,
        dashboardData,
        lastUpdated: APP_CONFIG.defaultTimestamp,
        isSearchOpen,
        setIsSearchOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
}

