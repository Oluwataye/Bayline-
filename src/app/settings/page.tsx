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
  KeyRound,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";
import { useWarehouse } from "@/context/WarehouseContext";
import { useToast } from "@/components/ui/Toast";
import { formatNumber } from "@/lib/utils";

type SettingsTab = "org" | "warehouses" | "rbac" | "audit";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  warehouseAccess: string;
  lastActive: string;
}

const SEED_USERS: SystemUser[] = [
  {
    id: "usr-1",
    name: "Admin",
    email: "admin@bayline.ng",
    role: "Super Admin",
    warehouseAccess: "All Warehouses",
    lastActive: "Just now",
  },
  {
    id: "usr-2",
    name: "Babatunde Adeleke",
    email: "b.adeleke@bayline.ng",
    role: "Warehouse Manager",
    warehouseAccess: "Lagos Central Hub",
    lastActive: "15 mins ago",
  },
  {
    id: "usr-3",
    name: "Chidinma Nwosu",
    email: "c.nwosu@bayline.ng",
    role: "Stock Clerk",
    warehouseAccess: "Lagos Central Hub",
    lastActive: "1 hour ago",
  },
  {
    id: "usr-4",
    name: "Fatima Aliyu",
    email: "f.aliyu@bayline.ng",
    role: "Warehouse Manager",
    warehouseAccess: "Abuja Regional Facility",
    lastActive: "3 hours ago",
  },
  {
    id: "usr-5",
    name: "Emeka Okafor",
    email: "e.okafor@bayline.ng",
    role: "Stock Clerk",
    warehouseAccess: "Ikeja Logistics Depot",
    lastActive: "Yesterday",
  },
];

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

export default function SettingsPage() {
  const { warehouses } = useWarehouse();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("org");
  const [appName, setAppName] = useState<string>(APP_CONFIG.name);
  const [currency, setCurrency] = useState<string>(APP_CONFIG.defaultCurrency);
  const [orgLegalName, setOrgLegalName] = useState("Bayline Logistics Ltd");
  const [taxId, setTaxId] = useState("TIN-893452109");

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Organization profile and currency settings updated", "success");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
          System Settings &amp; Administration
        </h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Configure organization parameters, facility nodes, role-based access control, and audit logs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EEF0F2] pb-2 overflow-x-auto">
        {[
          { id: "org", label: "Organization & Currency", icon: Building },
          { id: "warehouses", label: "Warehouse Facilities", icon: Settings },
          { id: "rbac", label: "Users & RBAC Roles", icon: Shield },
          { id: "audit", label: "Audit Log Trail", icon: History },
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

      {/* TAB 1: ORGANIZATION & CURRENCY */}
      {activeTab === "org" && (
        <form onSubmit={handleSaveOrg} className="wms-card p-6 max-w-2xl space-y-4">
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

      {/* TAB 2: WAREHOUSE FACILITIES */}
      {activeTab === "warehouses" && (
        <div className="wms-card overflow-hidden">
          <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Configured Warehouse Nodes</h3>
              <p className="text-xs text-[#6B7280]">
                Active physical logistics hubs registered in your multi-facility network
              </p>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#111111]">
              <tr>
                <th className="py-3 px-4 font-semibold">Warehouse Name</th>
                <th className="py-3 px-4 font-semibold">Facility Code</th>
                <th className="py-3 px-4 font-semibold">Physical Address</th>
                <th className="py-3 px-4 font-semibold">Capacity</th>
                <th className="py-3 px-4 font-semibold">Total Bins</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
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
                      {wh.address}, {wh.city}
                    </td>
                    <td className="py-3 px-4 text-[#4B4B4B]">{formatNumber(wh.capacitySqm)} m²</td>
                    <td className="py-3 px-4 text-[#4B4B4B]">{wh.totalBins} bins</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: USERS & RBAC ROLES */}
      {activeTab === "rbac" && (
        <div className="wms-card overflow-hidden">
          <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Authorized Staff &amp; Roles</h3>
              <p className="text-xs text-[#6B7280]">
                Row-Level Security (RLS) enforcement ensures users only access assigned facilities
              </p>
            </div>
            <button
              onClick={() => addToast("Invitation link copied to clipboard", "info")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Staff</span>
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#111111]">
              <tr>
                <th className="py-3 px-4 font-semibold">User Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Assigned Role</th>
                <th className="py-3 px-4 font-semibold">Warehouse Scope</th>
                <th className="py-3 px-4 font-semibold text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {SEED_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-semibold text-[#111111]">{user.name}</td>
                  <td className="py-3 px-4 text-[#6B7280] font-mono">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-[#111111]">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#4B4B4B]">{user.warehouseAccess}</td>
                  <td className="py-3 px-4 text-right text-[#8A8A8A]">{user.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: AUDIT LOG TRAIL */}
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
    </div>
  );
}
