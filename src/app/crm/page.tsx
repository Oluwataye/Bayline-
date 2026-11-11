"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
  DollarSign,
  Briefcase,
  X,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type DealStage = "Lead" | "Quoted" | "Won" | "Lost";

interface Deal {
  id: string;
  title: string;
  client: string;
  contactPerson: string;
  phone: string;
  email: string;
  value: number;
  stage: DealStage;
  targetWarehouse: string;
  itemsSummary: string;
  updatedAt: string;
}

const INITIAL_DEALS: Deal[] = [
  {
    id: "deal-1",
    title: "Bulk Hardware Fleet Restock (250 Laptops)",
    client: "Dangote Industries",
    contactPerson: "Alhaji Garba Sanusi",
    phone: "+234 803 111 2233",
    email: "procurement@dangote.com",
    value: 140000000,
    stage: "Quoted",
    targetWarehouse: "Lagos Central Hub",
    itemsSummary: "250 × Business Laptop 14\"",
    updatedAt: "Nov 9, 2026",
  },
  {
    id: "deal-2",
    title: "HQ Office Ergonomic Fitout (80 Desks + 80 Chairs)",
    client: "Kuda Microfinance Bank",
    contactPerson: "Folake Adeyemi",
    phone: "+234 812 444 5566",
    email: "facilities@kudabank.com",
    value: 26400000,
    stage: "Lead",
    targetWarehouse: "Ikeja Logistics Depot",
    itemsSummary: "80 × Standing Desks, 80 × Office Chairs",
    updatedAt: "Nov 8, 2026",
  },
  {
    id: "deal-3",
    title: "Distribution Centre Packaging Material Supply",
    client: "Jumia Logistics Hub",
    contactPerson: "Chukwudi Eze",
    phone: "+234 705 999 0011",
    email: "c.eze@jumia.com",
    value: 9500000,
    stage: "Won",
    targetWarehouse: "Abuja Regional Facility",
    itemsSummary: "500 bundles Heavy Duty Boxes",
    updatedAt: "Nov 7, 2026",
  },
  {
    id: "deal-4",
    title: "Accessories Starter Kits (Keyboards & Cables)",
    client: "Andela Nigeria",
    contactPerson: "Tunde Ojo",
    phone: "+234 802 333 4455",
    email: "ops@andela.com",
    value: 4800000,
    stage: "Quoted",
    targetWarehouse: "Lagos Central Hub",
    itemsSummary: "100 × Mechanical Keyboards, 150 × USB Cables",
    updatedAt: "Nov 6, 2026",
  },
  {
    id: "deal-5",
    title: "Retail Distribution Pilot Run",
    client: "Shoprite Nigeria",
    contactPerson: "Ngozi Obi",
    phone: "+234 901 777 8899",
    email: "merchandising@shoprite.ng",
    value: 18200000,
    stage: "Won",
    targetWarehouse: "Lagos Central Hub",
    itemsSummary: "200 × Wireless Mice, 300 × Cables",
    updatedAt: "Nov 5, 2026",
  },
];

const STAGES: { stage: DealStage; label: string; color: string }[] = [
  { stage: "Lead", label: "Initial Inquiries", color: "border-t-gray-400" },
  { stage: "Quoted", label: "Proposals & Quotes", color: "border-t-blue-500" },
  { stage: "Won", label: "Won (Ready for Dispatch)", color: "border-t-green-500" },
  { stage: "Lost", label: "Lost / Abandoned", color: "border-t-red-400" },
];

export default function CRMPage() {
  const { addToast } = useToast();
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [viewMode, setViewMode] = useState<"kanban" | "accounts">("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Deal form fields
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newItems, setNewItems] = useState("");

  const totalPipeline = deals.reduce((acc, d) => (d.stage !== "Lost" ? acc + d.value : acc), 0);
  const totalWon = deals.reduce((acc, d) => (d.stage === "Won" ? acc + d.value : acc), 0);

  const handleAdvanceStage = (dealId: string, currentStage: DealStage) => {
    const next: Record<DealStage, DealStage> = {
      Lead: "Quoted",
      Quoted: "Won",
      Won: "Won",
      Lost: "Lead",
    };
    const targetStage = next[currentStage];
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
    );
    addToast(`Deal advanced to "${targetStage}"`, "success");
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClient) return;

    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      title: newTitle,
      client: newClient,
      contactPerson: newContact || "Key Account Lead",
      phone: newPhone || "+234 800 000 0000",
      email: newEmail || "client@company.ng",
      value: parseFloat(newValue) || 5000000,
      stage: "Lead",
      targetWarehouse: "Lagos Central Hub",
      itemsSummary: newItems || "Custom stock quotation",
      updatedAt: "Just now",
    };

    setDeals([newDeal, ...deals]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewClient("");
    setNewValue("");
    setNewItems("");
    addToast(`Created deal for "${newClient}"`, "success");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            CRM &amp; Wholesale Pipeline
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            B2B accounts, wholesale quotes, and automated outbound dispatch order creation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-[#EEF0F2] rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                viewMode === "kanban" ? "bg-[#111111] text-white" : "text-[#6B7280]"
              }`}
            >
              Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode("accounts")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                viewMode === "accounts" ? "bg-[#111111] text-white" : "text-[#6B7280]"
              }`}
            >
              Accounts Table
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="wms-card p-4">
          <div className="text-xs text-[#6B7280]">Active Pipeline Value</div>
          <div className="text-2xl font-extrabold text-[#111111] mt-1">
            {formatCurrency(totalPipeline)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1">Across 5 enterprise accounts</div>
        </div>

        <div className="wms-card p-4">
          <div className="text-xs text-[#6B7280]">Won Deals (Closed This Month)</div>
          <div className="text-2xl font-extrabold text-[#16A34A] mt-1">
            {formatCurrency(totalWon)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1">Connected to dispatch queue</div>
        </div>

        <div className="wms-card p-4">
          <div className="text-xs text-[#6B7280]">Win Rate Ratio</div>
          <div className="text-2xl font-extrabold text-[#111111] mt-1">
            66.7%
          </div>
          <div className="text-[11px] text-[#16A34A] font-semibold mt-1">▲ +8.5% conversion increase</div>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((col) => {
            const columnDeals = deals.filter((d) => d.stage === col.stage);
            const columnValue = columnDeals.reduce((acc, d) => acc + d.value, 0);

            return (
              <div
                key={col.stage}
                className={`bg-[#F4F5F7] rounded-2xl p-3 border-t-4 ${col.color} border border-[#EEF0F2] flex flex-col`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <h3 className="text-xs font-bold text-[#111111]">{col.label}</h3>
                    <div className="text-[10px] text-[#6B7280]">
                      {columnDeals.length} deals • {formatCurrency(columnValue)}
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="wms-card p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[11px] font-bold text-[#111111] truncate">
                            {deal.client}
                          </span>
                          <span className="text-xs font-bold font-mono text-[#111111] shrink-0">
                            {formatCurrency(deal.value)}
                          </span>
                        </div>
                        <h4 className="text-xs font-medium text-[#4B4B4B] mb-2 leading-snug">
                          {deal.title}
                        </h4>
                        <div className="text-[11px] text-[#6B7280] bg-[#F4F5F7] p-2 rounded-lg mb-3">
                          {deal.itemsSummary}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#EEF0F2] flex items-center justify-between text-[11px]">
                        <span className="text-[#8A8A8A]">{deal.updatedAt}</span>

                        {col.stage === "Won" ? (
                          <Link
                            href="/movements"
                            className="flex items-center gap-1 font-semibold text-green-700 hover:underline"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch</span>
                          </Link>
                        ) : col.stage !== "Lost" ? (
                          <button
                            onClick={() => handleAdvanceStage(deal.id, deal.stage)}
                            className="flex items-center gap-1 font-semibold text-[#111111] hover:underline"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACCOUNTS VIEW */}
      {viewMode === "accounts" && (
        <div className="wms-card overflow-hidden">
          <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111111]">Enterprise B2B Client Accounts</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#111111]">
              <tr>
                <th className="py-3 px-4 font-semibold">Account / Company</th>
                <th className="py-3 px-4 font-semibold">Contact Person</th>
                <th className="py-3 px-4 font-semibold">Contact Info</th>
                <th className="py-3 px-4 font-semibold">Assigned Facility</th>
                <th className="py-3 px-4 font-semibold">Active Opportunity</th>
                <th className="py-3 px-4 font-semibold text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-semibold text-[#111111]">{deal.client}</td>
                  <td className="py-3 px-4 text-[#4B4B4B]">{deal.contactPerson}</td>
                  <td className="py-3 px-4 text-[#6B7280]">
                    <div>{deal.email}</div>
                    <div className="text-[10px]">{deal.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-[#4B4B4B]">{deal.targetWarehouse}</td>
                  <td className="py-3 px-4 font-medium text-[#111111]">{deal.title}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#111111]">
                    {formatCurrency(deal.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-[#EEF0F2] z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0F2] pb-3">
              <h3 className="text-sm font-bold text-[#111111]">Create Wholesale Quote / Deal</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-[#6B7280]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#111111] mb-1">Company / Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Bank Plc"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Branch Networking Hardware Supply"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Procurement Manager"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">Quote Value (₦)</label>
                  <input
                    type="number"
                    placeholder="15000000"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#111111] mb-1">Quotation Items Summary</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 50 × Office Desks, 100 × Ergonomic Chairs"
                  value={newItems}
                  onChange={(e) => setNewItems(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEF0F2] rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EEF0F2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 font-semibold text-[#6B7280]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#111111] text-white rounded-xl hover:bg-black"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
