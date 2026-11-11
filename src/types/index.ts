export type UserRole =
  | "super_admin"
  | "warehouse_manager"
  | "stock_clerk"
  | "payroll_officer"
  | "sales_agent"
  | "viewer";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  currency: string;
  locale: string;
}

export interface Warehouse {
  id: string;
  orgId: string;
  code: string;
  name: string;
  address: string;
  city: string;
  country: string;
  capacitySqm: number;
  totalBins: number;
  utilizationRate: number; // percentage, e.g. 78
  isActive: boolean;
}

export interface Zone {
  id: string;
  warehouseId: string;
  code: string;
  name: string;
  type: "ambient" | "cold" | "hazmat" | "bulk";
}

export interface Bin {
  id: string;
  zoneId: string;
  warehouseId: string;
  code: string; // e.g. A-01-02-03
  aisle: string;
  rack: string;
  shelf: string;
  binNumber: string;
  isOccupied: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minLevel: number; // reorder point
  maxLevel: number;
  warehouseId: string;
  warehouseName: string;
  zoneCode?: string;
  binCode?: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
  imageUrl?: string;
  updatedAt: string;
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  costPerUnit: number;
}

export type MovementType = "inbound" | "outbound" | "transfer" | "adjustment" | "return";
export type MovementStatus = "draft" | "pending" | "in_transit" | "completed" | "cancelled";

export interface StockMovement {
  id: string;
  movementNumber: string;
  type: MovementType;
  status: MovementStatus;
  sourceWarehouseId?: string;
  sourceWarehouseName?: string;
  destWarehouseId?: string;
  destWarehouseName?: string;
  totalItems: number;
  totalQuantity: number;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  items?: StockMovementItem[];
}

export interface StockMovementItem {
  id: string;
  movementId: string;
  productId: string;
  productName: string;
  sku: string;
  quantityRequested: number;
  quantityTransacted: number;
  unitCost: number;
  sourceBinId?: string;
  destBinId?: string;
}

export type AlertSeverity = "info" | "warning" | "danger";

export interface Alert {
  id: string;
  warehouseId: string;
  warehouseName: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  productId?: string;
  productName?: string;
}

export interface AuditLogEntry {
  id: string;
  warehouseId?: string;
  warehouseName?: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

// Dashboard Specific Widgets
export interface DashboardKPIs {
  totalStockItems: {
    value: number;
    deltaPercent: number;
    deltaPeriod: string;
  };
  totalInbound: {
    value: number;
    deltaPercent: number;
    deltaPeriod: string;
  };
  totalOutbound: {
    value: number;
    deltaPercent: number;
    deltaPeriod: string;
  };
  warehouseUtilization: {
    value: number; // e.g. 78
    deltaPercent: number;
    deltaPeriod: string;
  };
}

export interface StockTrendDataPoint {
  date: string; // e.g. "Nov 1"
  stockLevel: number; // e.g. 1900
}

export interface CategoryStockDistribution {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface LowStockAlertItem {
  id: string;
  product: string;
  sku: string;
  currentStock: number;
  minLevel: number;
  status: "Low Stock";
  warehouseId: string;
}

export interface RecentActivityItem {
  id: string;
  dateTime: string;
  activity: string;
  user: string;
  type: "inbound" | "outbound" | "adjustment" | "transfer";
}

export interface DashboardData {
  lastUpdated: string;
  kpis: DashboardKPIs;
  trend: StockTrendDataPoint[];
  categories: {
    total: number;
    items: CategoryStockDistribution[];
  };
  lowStockItems: LowStockAlertItem[];
  recentActivities: RecentActivityItem[];
}

