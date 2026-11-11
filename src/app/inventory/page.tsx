"use client";

import React from "react";
import { Package, Plus, Filter, Download } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { formatNumber, formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const { selectedWarehouse } = useWarehouse();

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            Inventory Catalogue
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Showing stock items for {selectedWarehouse.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="wms-card overflow-hidden">
        <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#111111]" />
            <span className="text-sm font-semibold text-[#111111]">
              Products ({SEED_PRODUCTS.length})
            </span>
          </div>
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-[#EEF0F2] rounded-lg text-[#6B7280]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#111111] border-b border-[#EEF0F2]">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU / Code</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Cost Price</th>
                <th className="py-3 px-4 font-semibold">Selling Price</th>
                <th className="py-3 px-4 font-semibold">On Hand</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {SEED_PRODUCTS.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-mono text-[#6B7280]">{p.sku}</td>
                  <td className="py-3 px-4 font-medium text-[#111111]">{p.name}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{p.categoryName}</td>
                  <td className="py-3 px-4 text-[#6B7280] font-mono">{p.binCode}</td>
                  <td className="py-3 px-4 text-[#111111]">{formatCurrency(p.costPrice)}</td>
                  <td className="py-3 px-4 text-[#111111]">{formatCurrency(p.sellingPrice)}</td>
                  <td className="py-3 px-4 font-bold text-[#111111]">{p.currentStock}</td>
                  <td className="py-3 px-4 text-right">
                    {p.status === "low_stock" ? (
                      <span className="wms-badge-danger">Low Stock</span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

