"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Warehouse, DashboardData, Category, Zone } from "@/types";
import { SEED_WAREHOUSES, SCREENSHOT_DASHBOARD_DATA } from "@/lib/seed-data";
import { APP_CONFIG } from "@/config/app.config";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "warehouse_manager" | "stock_clerk" | "payroll_officer" | "sales_agent" | "viewer";
  warehouseAccess: string; // "all" or specific warehouse id
  warehouseName: string;
  isActive: boolean;
  lastActive: string;
}

export interface FeatureFlags {
  allowNegativeStock: boolean;
  requireDualApproval: boolean;
  realtimeAlerts: boolean;
  showPayrollModule: boolean;
  showCrmModule: boolean;
  enforceFifo: boolean;
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Electronics", slug: "electronics", color: "#111111" },
  { id: "cat-2", name: "Furniture", slug: "furniture", color: "#4B4B4B" },
  { id: "cat-3", name: "Accessories", slug: "accessories", color: "#8A8A8A" },
  { id: "cat-4", name: "Others", slug: "others", color: "#D9D9DE" },
];

export const INITIAL_USERS: SystemUser[] = [
  {
    id: "usr-1",
    name: "Admin",
    email: "admin@bayline.ng",
    role: "super_admin",
    warehouseAccess: "wh-all",
    warehouseName: "All Warehouses",
    isActive: true,
    lastActive: "Just now",
  },
  {
    id: "usr-2",
    name: "Babatunde Adeleke",
    email: "b.adeleke@bayline.ng",
    role: "warehouse_manager",
    warehouseAccess: "wh-1",
    warehouseName: "Lagos Central Hub",
    isActive: true,
    lastActive: "15 mins ago",
  },
  {
    id: "usr-3",
    name: "Chidinma Nwosu",
    email: "c.nwosu@bayline.ng",
    role: "stock_clerk",
    warehouseAccess: "wh-1",
    warehouseName: "Lagos Central Hub",
    isActive: true,
    lastActive: "1 hour ago",
  },
  {
    id: "usr-4",
    name: "Fatima Aliyu",
    email: "f.aliyu@bayline.ng",
    role: "warehouse_manager",
    warehouseAccess: "wh-3",
    warehouseName: "Abuja Regional Facility",
    isActive: true,
    lastActive: "3 hours ago",
  },
  {
    id: "usr-5",
    name: "Emeka Okafor",
    email: "e.okafor@bayline.ng",
    role: "stock_clerk",
    warehouseAccess: "wh-2",
    warehouseName: "Ikeja Logistics Depot",
    isActive: true,
    lastActive: "Yesterday",
  },
];

export const INITIAL_ZONES: Zone[] = [
  { id: "zn-1", warehouseId: "wh-1", code: "A-01", name: "High-Density Electronics Zone", type: "ambient" },
  { id: "zn-2", warehouseId: "wh-1", code: "SEC-01", name: "High-Value Secured Storage", type: "ambient" },
  { id: "zn-3", warehouseId: "wh-1", code: "BULK-01", name: "Pallet Bulk Staging Area", type: "bulk" },
  { id: "zn-4", warehouseId: "wh-2", code: "BULK-02", name: "Furniture Racking Depots", type: "bulk" },
  { id: "zn-5", warehouseId: "wh-3", code: "MAT-01", name: "Packaging Materials Bay", type: "ambient" },
];

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  allowNegativeStock: false,
  requireDualApproval: true,
  realtimeAlerts: true,
  showPayrollModule: true,
  showCrmModule: true,
  enforceFifo: true,
};

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
  // Admin Management state & handlers
  categories: Category[];
  users: SystemUser[];
  zones: Zone[];
  featureFlags: FeatureFlags;
  addWarehouse: (wh: Omit<Warehouse, "id">) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;
  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addUser: (usr: Omit<SystemUser, "id">) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  addZone: (zn: Omit<Zone, "id">) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
  setFeatureFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

// --- localStorage helpers (safe SSR) ---
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silent fail
  }
}

export function WarehouseProvider({ children }: { children: React.ReactNode }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() =>
    loadFromStorage("wms_warehouses", SEED_WAREHOUSES)
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("wh-all");
  const [dashboardData, setDashboardData] = useState<DashboardData>(SCREENSHOT_DASHBOARD_DATA);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin Master State — rehydrated from localStorage
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage("wms_categories", INITIAL_CATEGORIES)
  );
  const [users, setUsers] = useState<SystemUser[]>(() =>
    loadFromStorage("wms_users", INITIAL_USERS)
  );
  const [zones, setZones] = useState<Zone[]>(() =>
    loadFromStorage("wms_zones", INITIAL_ZONES)
  );
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(() =>
    loadFromStorage("wms_featureFlags", DEFAULT_FEATURE_FLAGS)
  );

  // Persist admin state to localStorage whenever it changes
  useEffect(() => { saveToStorage("wms_warehouses", warehouses); }, [warehouses]);
  useEffect(() => { saveToStorage("wms_categories", categories); }, [categories]);
  useEffect(() => { saveToStorage("wms_users", users); }, [users]);
  useEffect(() => { saveToStorage("wms_zones", zones); }, [zones]);
  useEffect(() => { saveToStorage("wms_featureFlags", featureFlags); }, [featureFlags]);

  const selectedWarehouse =
    warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

  // Adjust metrics dynamically if an individual warehouse is selected
  useEffect(() => {
    if (selectedWarehouseId === "wh-all") {
      setDashboardData(SCREENSHOT_DASHBOARD_DATA);
    } else {
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

  // Warehouse CRUD
  const addWarehouse = (wh: Omit<Warehouse, "id">) => {
    const id = `wh-${Date.now()}`;
    setWarehouses((prev) => [...prev, { ...wh, id }]);
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const deleteWarehouse = (id: string) => {
    if (id === "wh-all") return; // Prevent deleting master pseudo-warehouse
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
    if (selectedWarehouseId === id) {
      setSelectedWarehouseId("wh-all");
    }
  };

  // Category CRUD
  const addCategory = (cat: Omit<Category, "id">) => {
    const id = `cat-${Date.now()}`;
    setCategories((prev) => [...prev, { ...cat, id }]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // User CRUD
  const addUser = (usr: Omit<SystemUser, "id">) => {
    const id = `usr-${Date.now()}`;
    setUsers((prev) => [...prev, { ...usr, id }]);
  };

  const updateUser = (id: string, updates: Partial<SystemUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Zone CRUD
  const addZone = (zn: Omit<Zone, "id">) => {
    const id = `zn-${Date.now()}`;
    setZones((prev) => [...prev, { ...zn, id }]);
  };

  const updateZone = (id: string, updates: Partial<Zone>) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...updates } : z)));
  };

  const deleteZone = (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
  };

  // Feature Flag Setter
  const setFeatureFlag = <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => {
    setFeatureFlags((prev) => ({ ...prev, [key]: value }));
  };

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
        categories,
        users,
        zones,
        featureFlags,
        addWarehouse,
        updateWarehouse,
        deleteWarehouse,
        addCategory,
        updateCategory,
        deleteCategory,
        addUser,
        updateUser,
        deleteUser,
        addZone,
        updateZone,
        deleteZone,
        setFeatureFlag,
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
