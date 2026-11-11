"use client";

import React, { useState } from "react";
import {
  Settings,
  Building,
  Shield,
  Bell,
  DollarSign,
  Database,
  Save,
  UserPlus,
  History,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  Sliders,
  Check,
  AlertTriangle,
  Lock,
  Eye,
  ToggleLeft,
  ToggleRight,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";
import { useWarehouse, SystemUser } from "@/context/WarehouseContext";
import { useToast } from "@/components/ui/Toast";
import { formatNumber } from "@/lib/utils";
import { Warehouse, Category, Zone, UserRole } from "@/types";

type SettingsTab = "facilities" | "categories" | "rbac" | "features" | "org" | "audit";

const AUDIT_LOGS = [
  {
    id: "aud-1",
    timestamp: "Nov 9, 2026 10:30 AM",
    user: "John Doe (Stock Clerk)",
    action: "RESTOCK",
    entity: "Product",
    details: "Inbound receipt of 200 units Business Laptop 14\" (PO-2026-0045)",
  },
  {
    id: "aud-2",
    timestamp: "Nov 9, 2026 09:15 AM",
    user: "Jane Smith (Stock Clerk)",
    action: "DISPATCH",
    entity: "Movement",
    details: "Outbound dispatch of 50 units Wireless Mouse (SO-2026-0210)",
  },
  {
    id: "aud-3",
    timestamp: "Nov 9, 2026 08:50 AM",
    user: "Admin (Super Admin)",
    action: "ADJUSTMENT",
    entity: "Cycle Count",
    details: "Stock correction -10 units damaged Wireless Mouse (ADJ-2026-0030)",
  },
  {
    id: "aud-4",
    timestamp: "Nov 8, 2026 16:45 PM",
    user: "Admin (Super Admin)",
    action: "ROLE_CHANGE",
    entity: "User RBAC",
    details: "Promoted Chidinma Nwosu to Senior Stock Clerk",
  },
  {
    id: "aud-5",
    timestamp: "Nov 8, 2026 11:20 AM",
    user: "Babatunde Adeleke (Manager)",
    action: "TRANSFER_INIT",
    entity: "Movement",
    details: "Created inter-facility transfer TRF-2026-0021 (Lagos → Ikeja)",
  },
];

const ROLE_PERMISSIONS: {
  role: UserRole;
  label: string;
  permissions: { module: string; access: "Full Access" | "Read & Write" | "View Only" | "No Access" }[];
}[] = [
  {
    role: "super_admin",
    label: "Super Admin",
    permissions: [
      { module: "Dashboard & KPIs", access: "Full Access" },
      { module: "Inventory Catalogue", access: "Full Access" },
      { module: "Stock Movements & Ledger", access: "Full Access" },
      { module: "Alerts & Rules", access: "Full Access" },
      { module: "Reports & Valuation", access: "Full Access" },
      { module: "Payroll & Compensation", access: "Full Access" },
      { module: "CRM & Pipelines", access: "Full Access" },
      { module: "System Settings", access: "Full Access" },
    ],
  },
  {
    role: "warehouse_manager",
    label: "Warehouse Manager",
    permissions: [
      { module: "Dashboard & KPIs", access: "Read & Write" },
      { module: "Inventory Catalogue", access: "Full Access" },
      { module: "Stock Movements & Ledger", access: "Full Access" },
      { module: "Alerts & Rules", access: "Full Access" },
      { module: "Reports & Valuation", access: "Read & Write" },
      { module: "Payroll & Compensation", access: "View Only" },
      { module: "CRM & Pipelines", access: "Read & Write" },
      { module: "System Settings", access: "View Only" },
    ],
  },
  {
    role: "stock_clerk",
    label: "Stock Clerk",
    permissions: [
      { module: "Dashboard & KPIs", access: "View Only" },
      { module: "Inventory Catalogue", access: "Read & Write" },
      { module: "Stock Movements & Ledger", access: "Read & Write" },
      { module: "Alerts & Rules", access: "View Only" },
      { module: "Reports & Valuation", access: "View Only" },
      { module: "Payroll & Compensation", access: "No Access" },
      { module: "CRM & Pipelines", access: "No Access" },
      { module: "System Settings", access: "No Access" },
    ],
  },
  {
    role: "payroll_officer",
    label: "HR / Payroll Officer",
    permissions: [
      { module: "Dashboard & KPIs", access: "View Only" },
      { module: "Inventory Catalogue", access: "No Access" },
      { module: "Stock Movements & Ledger", access: "No Access" },
      { module: "Alerts & Rules", access: "No Access" },
      { module: "Reports & Valuation", access: "View Only" },
      { module: "Payroll & Compensation", access: "Full Access" },
      { module: "CRM & Pipelines", access: "No Access" },
      { module: "System Settings", access: "View Only" },
    ],
  },
  {
    role: "sales_agent",
    label: "Sales / CRM Agent",
    permissions: [
      { module: "Dashboard & KPIs", access: "View Only" },
      { module: "Inventory Catalogue", access: "View Only" },
      { module: "Stock Movements & Ledger", access: "View Only" },
      { module: "Alerts & Rules", access: "No Access" },
      { module: "Reports & Valuation", access: "View Only" },
      { module: "Payroll & Compensation", access: "No Access" },
      { module: "CRM & Pipelines", access: "Full Access" },
      { module: "System Settings", access: "No Access" },
    ],
  },
  {
    role: "viewer",
    label: "Viewer / Auditor",
    permissions: [
      { module: "Dashboard & KPIs", access: "View Only" },
      { module: "Inventory Catalogue", access: "View Only" },
      { module: "Stock Movements & Ledger", access: "View Only" },
      { module: "Alerts & Rules", access: "View Only" },
      { module: "Reports & Valuation", access: "View Only" },
      { module: "Payroll & Compensation", access: "No Access" },
      { module: "CRM & Pipelines", access: "View Only" },
      { module: "System Settings", access: "View Only" },
    ],
  },
];

export default function SettingsPage() {
  const {
    warehouses,
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
    deleteZone,
    setFeatureFlag,
  } = useWarehouse();

  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("facilities");

  // Organization state
  const [appName, setAppName] = useState<string>(APP_CONFIG.name);
  const [currency, setCurrency] = useState<string>(APP_CONFIG.defaultCurrency);
  const [orgLegalName, setOrgLegalName] = useState("Bayline Logistics Ltd");
  const [taxId, setTaxId] = useState("TIN-893452109");

  // Warehouse Modals State
  const [whModalOpen, setWhModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState<Warehouse | null>(null);
  const [whName, setWhName] = useState("");
  const [whCode, setWhCode] = useState("");
  const [whAddress, setWhAddress] = useState("");
  const [whCity, setWhCity] = useState("");
  const [whCapacity, setWhCapacity] = useState("");
  const [whBins, setWhBins] = useState("");
  const [whUtilization, setWhUtilization] = useState("75");

  // Zone Modal State
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [zoneWhId, setZoneWhId] = useState("wh-1");
  const [zoneCode, setZoneCode] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [zoneType, setZoneType] = useState<Zone["type"]>("ambient");

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");

  // User Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<SystemUser["role"]>("stock_clerk");
  const [userWhScope, setUserWhScope] = useState("wh-all");

  // -------------------------------------------------------------
  // Warehouse Handlers
  // -------------------------------------------------------------
  const handleOpenWhModal = (wh?: Warehouse) => {
    if (wh) {
      setEditingWh(wh);
      setWhName(wh.name);
      setWhCode(wh.code);
      setWhAddress(wh.address);
      setWhCity(wh.city);
      setWhCapacity(wh.capacitySqm.toString());
      setWhBins(wh.totalBins.toString());
      setWhUtilization(wh.utilizationRate.toString());
    } else {
      setEditingWh(null);
      setWhName("");
      setWhCode(`FAC-0${warehouses.length}`);
      setWhAddress("");
      setWhCity("Lagos");
      setWhCapacity("5000");
      setWhBins("400");
      setWhUtilization("65");
    }
    setWhModalOpen(true);
  };

  const handleSaveWh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName || !whCode) return;

    if (editingWh) {
      updateWarehouse(editingWh.id, {
        name: whName,
        code: whCode,
        address: whAddress,
        city: whCity,
        capacitySqm: parseInt(whCapacity) || 5000,
        totalBins: parseInt(whBins) || 400,
        utilizationRate: parseInt(whUtilization) || 70,
      });
      addToast(`Updated facility "${whName}"`, "success");
    } else {
      addWarehouse({
        orgId: "org-1",
        name: whName,
        code: whCode,
        address: whAddress,
        city: whCity,
        country: "Nigeria",
        capacitySqm: parseInt(whCapacity) || 5000,
        totalBins: parseInt(whBins) || 400,
        utilizationRate: parseInt(whUtilization) || 65,
        isActive: true,
      });
      addToast(`Created facility "${whName}"`, "success");
    }

    setWhModalOpen(false);
  };

  const handleDeleteWh = (wh: Warehouse) => {
    if (confirm(`Are you sure you want to decommission facility "${wh.name}"?`)) {
      deleteWarehouse(wh.id);
      addToast(`Facility "${wh.name}" removed`, "info");
    }
  };

  // -------------------------------------------------------------
  // Zone Handlers
  // -------------------------------------------------------------
  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneCode || !zoneName) return;

    addZone({
      warehouseId: zoneWhId,
      code: zoneCode,
      name: zoneName,
      type: zoneType,
    });
    addToast(`Added zone "${zoneCode}"`, "success");
    setZoneModalOpen(false);
    setZoneCode("");
    setZoneName("");
  };

  // -------------------------------------------------------------
  // Category Handlers
  // -------------------------------------------------------------
  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatName(cat.name);
      setCatSlug(cat.slug);
    } else {
      setEditingCat(null);
      setCatName("");
      setCatSlug("");
    }
    setCatModalOpen(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    const slug = catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingCat) {
      updateCategory(editingCat.id, {
        name: catName,
        slug,
      });
      addToast(`Updated category "${catName}"`, "success");
    } else {
      addCategory({
        name: catName,
        slug,
        color: "#4B4B4B",
      });
      addToast(`Created category "${catName}"`, "success");
    }

    setCatModalOpen(false);
  };

  const handleDeleteCat = (cat: Category) => {
    if (confirm(`Delete category "${cat.name}"?`)) {
      deleteCategory(cat.id);
      addToast(`Category "${cat.name}" deleted`, "info");
    }
  };

  // -------------------------------------------------------------
  // User Handlers
  // -------------------------------------------------------------
  const handleOpenUserModal = (user?: SystemUser) => {
    if (user) {
      setEditingUser(user);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserRole(user.role);
      setUserWhScope(user.warehouseAccess);
    } else {
      setEditingUser(null);
      setUserName("");
      setUserEmail("");
      setUserRole("stock_clerk");
      setUserWhScope("wh-1");
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;

    const assignedWh = warehouses.find((w) => w.id === userWhScope);
    const warehouseName = userWhScope === "wh-all" ? "All Warehouses" : assignedWh?.name || "Lagos Central Hub";

    if (editingUser) {
      updateUser(editingUser.id, {
        name: userName,
        email: userEmail,
        role: userRole,
        warehouseAccess: userWhScope,
        warehouseName,
      });
      addToast(`Updated user permissions for "${userName}"`, "success");
    } else {
      addUser({
        name: userName,
        email: userEmail,
        role: userRole,
        warehouseAccess: userWhScope,
        warehouseName,
        isActive: true,
        lastActive: "Pending invite",
      });
      addToast(`Invited "${userName}" to ${warehouseName}`, "success");
    }

    setUserModalOpen(false);
  };

  const handleDeleteUser = (usr: SystemUser) => {
    if (usr.id === "usr-1") {
      alert("Cannot delete primary Super Admin.");
      return;
    }
    if (confirm(`Revoke access and delete user "${usr.name}"?`)) {
      deleteUser(usr.id);
      addToast(`User "${usr.name}" access revoked`, "info");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            Admin Management Hub
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Full administrative control over Facilities, Zones, Categories, Staff Roles &amp; System Policies
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EEF0F2] pb-2 overflow-x-auto">
        {[
          { id: "facilities", label: "Facilities & Zones", icon: WarehouseIcon },
          { id: "categories", label: "Categories & Units", icon: Layers },
          { id: "rbac", label: "Staff & RBAC Permissions", icon: Shield },
          { id: "features", label: "Feature Toggles & Policies", icon: Sliders },
          { id: "org", label: "Organization & Defaults", icon: Building },
          { id: "audit", label: "Audit Trail", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: FACILITIES & ZONES (FULL CRUD) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "facilities" && (
        <div className="space-y-6">
          {/* Facilities Table */}
          <div className="wms-card overflow-hidden">
            <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Warehouse Facilities</h3>
                <p className="text-xs text-[#6B7280]">
                  Configure physical logistics hubs, capacity limits, and operational states
                </p>
              </div>
              <button
                onClick={() => handleOpenWhModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Facility</span>
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F6] text-[#111111]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Warehouse Name</th>
                  <th className="py-3 px-4 font-semibold">Code</th>
                  <th className="py-3 px-4 font-semibold">City &amp; Address</th>
                  <th className="py-3 px-4 font-semibold">Floor Space</th>
                  <th className="py-3 px-4 font-semibold">Bins</th>
                  <th className="py-3 px-4 font-semibold">Utilization</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {warehouses
                  .filter((w) => w.id !== "wh-all")
                  .map((wh) => (
                    <tr key={wh.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4 font-semibold text-[#111111]">{wh.name}</td>
                      <td className="py-3 px-4 font-mono text-[#6B7280]">{wh.code}</td>
                      <td className="py-3 px-4 text-[#4B4B4B]">
                        {wh.address ? `${wh.address}, ` : ""}{wh.city}
                      </td>
                      <td className="py-3 px-4 text-[#4B4B4B]">{formatNumber(wh.capacitySqm)} m²</td>
                      <td className="py-3 px-4 text-[#4B4B4B]">{wh.totalBins} bins</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#111111]">{wh.utilizationRate}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenWhModal(wh)}
                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111111] hover:bg-gray-100"
                            aria-label={`Edit ${wh.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWh(wh)}
                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50"
                            aria-label={`Delete ${wh.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Zones & Storage Bins */}
          <div className="wms-card overflow-hidden">
            <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Storage Zones &amp; Bins</h3>
                <p className="text-xs text-[#6B7280]">
                  Aisles, racks, and functional zones (Ambient, Cold, Hazmat, Bulk Pallet)
                </p>
              </div>
              <button
                onClick={() => setZoneModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Storage Zone</span>
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F6] text-[#111111]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Zone Code</th>
                  <th className="py-3 px-4 font-semibold">Zone Name</th>
                  <th className="py-3 px-4 font-semibold">Assigned Warehouse</th>
                  <th className="py-3 px-4 font-semibold">Storage Type</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {zones.map((zn) => {
                  const wh = warehouses.find((w) => w.id === zn.warehouseId);
                  return (
                    <tr key={zn.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-[#111111]">{zn.code}</td>
                      <td className="py-3 px-4 font-medium text-[#111111]">{zn.name}</td>
                      <td className="py-3 px-4 text-[#4B4B4B]">{wh?.name || "Main Facility"}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-[#4B4B4B]">
                          {zn.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteZone(zn.id)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: CATEGORIES & UNITS MASTER (FULL CRUD) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="wms-card overflow-hidden">
            <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Product Categories</h3>
                <p className="text-xs text-[#6B7280]">
                  Manage SKU groupings and catalog segmentation across all facilities
                </p>
              </div>
              <button
                onClick={() => handleOpenCatModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F6] text-[#111111]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Category Name</th>
                  <th className="py-3 px-4 font-semibold">Slug</th>
                  <th className="py-3 px-4 font-semibold">Color Marker</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-semibold text-[#111111]">{cat.name}</td>
                    <td className="py-3 px-4 font-mono text-[#6B7280]">{cat.slug}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: cat.color || "#111111" }}
                        />
                        <span className="font-mono text-[11px] text-[#6B7280]">{cat.color || "#111111"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenCatModal(cat)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111111] hover:bg-gray-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCat(cat)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Standard Units of Measure */}
          <div className="wms-card p-5">
            <h3 className="text-sm font-bold text-[#111111] mb-1">Standard Units of Measure</h3>
            <p className="text-xs text-[#6B7280] mb-3">
              Configured packaging and counting units for stock receipt and dispatch:
            </p>
            <div className="flex flex-wrap gap-2">
              {["pcs", "kg", "litre", "bundle", "roll", "box", "pair", "carton", "pallet"].map((u) => (
                <span
                  key={u}
                  className="px-3 py-1 bg-[#F4F5F7] border border-[#EEF0F2] rounded-lg text-xs font-semibold text-[#111111]"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: STAFF & RBAC PERMISSIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "rbac" && (
        <div className="space-y-6">
          <div className="wms-card overflow-hidden">
            <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">User Directory &amp; Role Assignments</h3>
                <p className="text-xs text-[#6B7280]">
                  Row-Level Security (RLS) restricts data access by facility and role assignment
                </p>
              </div>
              <button
                onClick={() => handleOpenUserModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Staff Member</span>
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F6] text-[#111111]">
                <tr>
                  <th className="py-3 px-4 font-semibold">User Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Assigned Role</th>
                  <th className="py-3 px-4 font-semibold">Facility Scope</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-semibold text-[#111111]">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-[#6B7280]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-[#111111]">
                        {u.role.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#4B4B4B]">{u.warehouseName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111111] hover:bg-gray-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== "usr-1" && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Granular Permission Matrix */}
          <div className="wms-card overflow-hidden">
            <div className="p-4 border-b border-[#EEF0F2]">
              <h3 className="text-sm font-bold text-[#111111]">RBAC Permission Matrix</h3>
              <p className="text-xs text-[#6B7280]">
                Security access matrix enforced across API routes and client interfaces
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F4F6] text-[#111111]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Module</th>
                    <th className="py-3 px-3 font-semibold">Super Admin</th>
                    <th className="py-3 px-3 font-semibold">Warehouse Manager</th>
                    <th className="py-3 px-3 font-semibold">Stock Clerk</th>
                    <th className="py-3 px-3 font-semibold">Payroll Officer</th>
                    <th className="py-3 px-3 font-semibold">Sales Agent</th>
                    <th className="py-3 px-3 font-semibold">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F2]">
                  {[
                    "Dashboard & KPIs",
                    "Inventory Catalogue",
                    "Stock Movements & Ledger",
                    "Alerts & Rules",
                    "Reports & Valuation",
                    "Payroll & Compensation",
                    "CRM & Pipelines",
                    "System Settings",
                  ].map((mod) => (
                    <tr key={mod} className="hover:bg-gray-50/70">
                      <td className="py-2.5 px-4 font-semibold text-[#111111]">{mod}</td>
                      {ROLE_PERMISSIONS.map((rp) => {
                        const perm = rp.permissions.find((p) => p.module === mod)?.access || "No Access";
                        const isFull = perm === "Full Access";
                        const isRW = perm === "Read & Write";
                        const isView = perm === "View Only";
                        return (
                          <td key={rp.role} className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                                isFull
                                  ? "bg-green-100 text-green-800"
                                  : isRW
                                  ? "bg-blue-100 text-blue-800"
                                  : isView
                                  ? "bg-gray-100 text-gray-700"
                                  : "text-gray-400"
                              }`}
                            >
                              {perm}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: FEATURE TOGGLES & SYSTEM POLICIES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "features" && (
        <div className="wms-card p-6 space-y-5 max-w-3xl">
          <div>
            <h3 className="text-sm font-bold text-[#111111]">Feature Flags &amp; Stock Policies</h3>
            <p className="text-xs text-[#6B7280]">
              Toggle organization-level behavior, safeguards, and module visibility
            </p>
          </div>

          <div className="space-y-4 divide-y divide-[#EEF0F2]">
            {/* Toggle 1: Negative stock */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111111]">Allow Negative Stock Operations</div>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  When disabled, dispatches and adjustments that would reduce inventory balance below 0 are strictly rejected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !featureFlags.allowNegativeStock;
                  setFeatureFlag("allowNegativeStock", next);
                  addToast(`Negative stock policy set to ${next ? "ALLOWED" : "DISALLOWED"}`, "info");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  featureFlags.allowNegativeStock ? "bg-[#111111]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    featureFlags.allowNegativeStock ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Dual Approval */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111111]">Require Dual Approval for Movements ≥ ₦10,000,000</div>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  High-value outbound orders and transfers require secondary sign-off from a Super Admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !featureFlags.requireDualApproval;
                  setFeatureFlag("requireDualApproval", next);
                  addToast(`Dual approval requirement ${next ? "ENABLED" : "DISABLED"}`, "info");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  featureFlags.requireDualApproval ? "bg-[#111111]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    featureFlags.requireDualApproval ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Realtime Alerts */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111111]">Realtime Stock Alert Subscriptions</div>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Push live websocket alerts and sound notifications when low stock or batch expiry triggers occur.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !featureFlags.realtimeAlerts;
                  setFeatureFlag("realtimeAlerts", next);
                  addToast(`Realtime alerts ${next ? "ENABLED" : "DISABLED"}`, "info");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  featureFlags.realtimeAlerts ? "bg-[#111111]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    featureFlags.realtimeAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4: Payroll module */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111111]">Enable Payroll &amp; Remittances Module</div>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Surface Nigerian statutory compensation and monthly payslips in navigation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !featureFlags.showPayrollModule;
                  setFeatureFlag("showPayrollModule", next);
                  addToast(`Payroll module ${next ? "SHOWN" : "HIDDEN"}`, "info");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  featureFlags.showPayrollModule ? "bg-[#111111]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    featureFlags.showPayrollModule ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5: CRM pipeline */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111111]">Enable CRM Wholesale Quotes &amp; Pipeline</div>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Provide Kanban deal pipeline and automatic conversion of won quotes into outbound dispatches.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !featureFlags.showCrmModule;
                  setFeatureFlag("showCrmModule", next);
                  addToast(`CRM module ${next ? "SHOWN" : "HIDDEN"}`, "info");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  featureFlags.showCrmModule ? "bg-[#111111]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    featureFlags.showCrmModule ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: ORGANIZATION & DEFAULTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "org" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addToast("Organization profile and currency settings saved", "success");
          }}
          className="wms-card p-6 max-w-2xl space-y-4"
        >
          <div className="border-b border-[#EEF0F2] pb-3 mb-4">
            <h3 className="text-sm font-bold text-[#111111]">Organization Profile</h3>
            <p className="text-xs text-[#6B7280]">
              Global configuration applying across all warehouse nodes and export documents
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#111111] mb-1">
                Application Brand Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111111] mb-1">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={orgLegalName}
                onChange={(e) => setOrgLegalName(e.target.value)}
                className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#111111] mb-1">
                Default Currency Code
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl bg-white font-semibold"
              >
                <option value="NGN">NGN (₦) — Nigerian Naira (Default)</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="EUR">EUR (€) — Euro</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#111111] mb-1">
                Tax Identification Number (TIN)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl bg-white font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#EEF0F2] flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: AUDIT TRAIL LOG */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "audit" && (
        <div className="wms-card overflow-hidden">
          <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">System Mutation Audit Trail</h3>
              <p className="text-xs text-[#6B7280]">
                Immutable tamper-evident record of all stock adjustments, shipments, and role updates
              </p>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#111111]">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Operator</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Target Entity</th>
                <th className="py-3 px-4 font-semibold">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 text-[#6B7280] whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-[#111111]">{log.user}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded text-[#111111]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#4B4B4B]">{log.entity}</td>
                  <td className="py-3 px-4 text-[#111111]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WAREHOUSE CREATE / EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {whModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setWhModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-[#EEF0F2] z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0F2] pb-3">
              <h3 className="text-sm font-bold text-[#111111]">
                {editingWh ? "Edit Facility" : "Add Warehouse Facility"}
              </h3>
              <button onClick={() => setWhModalOpen(false)} className="p-1 rounded-lg text-[#6B7280]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWh} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#111111] mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Port Harcourt Hub"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Facility Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="PH-04"
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Port Harcourt"
                    value={whCity}
                    onChange={(e) => setWhCity(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Physical Street Address</label>
                <input
                  type="text"
                  placeholder="Trans-Amadi Industrial Layout"
                  value={whAddress}
                  onChange={(e) => setWhAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Floor Area (m²)</label>
                  <input
                    type="number"
                    value={whCapacity}
                    onChange={(e) => setWhCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Total Bins</label>
                  <input
                    type="number"
                    value={whBins}
                    onChange={(e) => setWhBins(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Utilization (%)</label>
                  <input
                    type="number"
                    max="100"
                    min="0"
                    value={whUtilization}
                    onChange={(e) => setWhUtilization(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EEF0F2]">
                <button
                  type="button"
                  onClick={() => setWhModalOpen(false)}
                  className="px-3.5 py-1.5 font-semibold text-[#6B7280]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#111111] text-white rounded-xl hover:bg-black"
                >
                  {editingWh ? "Update Facility" : "Create Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ZONE CREATE MODAL */}
      {/* ------------------------------------------------------------- */}
      {zoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setZoneModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#EEF0F2] z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0F2] pb-3">
              <h3 className="text-sm font-bold text-[#111111]">Add Storage Zone</h3>
              <button onClick={() => setZoneModalOpen(false)} className="p-1 rounded-lg text-[#6B7280]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#111111] mb-1">Warehouse Facility *</label>
                <select
                  value={zoneWhId}
                  onChange={(e) => setZoneWhId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs bg-white"
                >
                  {warehouses
                    .filter((w) => w.id !== "wh-all")
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Zone Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COLD-01"
                  value={zoneCode}
                  onChange={(e) => setZoneCode(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Zone Name / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="Cold Chain Storage Bay"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Storage Type</label>
                <select
                  value={zoneType}
                  onChange={(e) => setZoneType(e.target.value as Zone["type"])}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs bg-white"
                >
                  <option value="ambient">Ambient Standard</option>
                  <option value="cold">Cold Storage (Temperature Controlled)</option>
                  <option value="hazmat">Hazardous Materials (Hazmat)</option>
                  <option value="bulk">Bulk Pallet Racking</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EEF0F2]">
                <button
                  type="button"
                  onClick={() => setZoneModalOpen(false)}
                  className="px-3.5 py-1.5 font-semibold text-[#6B7280]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#111111] text-white rounded-xl hover:bg-black"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CATEGORY CREATE / EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setCatModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#EEF0F2] z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0F2] pb-3">
              <h3 className="text-sm font-bold text-[#111111]">
                {editingCat ? "Edit Category" : "Add Product Category"}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="p-1 rounded-lg text-[#6B7280]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#111111] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial Tools"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="industrial-tools"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EEF0F2]">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-3.5 py-1.5 font-semibold text-[#6B7280]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#111111] text-white rounded-xl hover:bg-black"
                >
                  {editingCat ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* USER INVITE / EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setUserModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#EEF0F2] z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0F2] pb-3">
              <h3 className="text-sm font-bold text-[#111111]">
                {editingUser ? "Edit User Permissions" : "Invite Staff Member"}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="p-1 rounded-lg text-[#6B7280]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#111111] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olumide Bakare"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="o.bakare@bayline.ng"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Role *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as SystemUser["role"])}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs bg-white font-semibold"
                >
                  <option value="super_admin">Super Admin (Full Access)</option>
                  <option value="warehouse_manager">Warehouse Manager</option>
                  <option value="stock_clerk">Stock Clerk</option>
                  <option value="payroll_officer">HR / Payroll Officer</option>
                  <option value="sales_agent">Sales / CRM Agent</option>
                  <option value="viewer">Viewer / Auditor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Facility Access Scope *</label>
                <select
                  value={userWhScope}
                  onChange={(e) => setUserWhScope(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs bg-white"
                >
                  <option value="wh-all">All Warehouses (National)</option>
                  {warehouses
                    .filter((w) => w.id !== "wh-all")
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EEF0F2]">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-3.5 py-1.5 font-semibold text-[#6B7280]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#111111] text-white rounded-xl hover:bg-black"
                >
                  {editingUser ? "Save Permissions" : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
