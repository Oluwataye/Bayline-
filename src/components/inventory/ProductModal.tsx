"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Package, AlertCircle } from "lucide-react";
import { Product } from "@/types";
import { SEED_WAREHOUSES } from "@/lib/seed-data";
import { useWarehouse } from "@/context/WarehouseContext";

const UNITS = ["pcs", "kg", "litre", "bundle", "roll", "box", "pair"];

const productSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    sku: z.string().min(2, "SKU must be at least 2 characters"),
    barcode: z.string().min(3, "Barcode must be at least 3 characters"),
    description: z.string().optional().default(""),
    categoryId: z.string().min(1, "Please select a category"),
    unit: z.string().min(1, "Please select a unit"),
    costPrice: z.coerce.number().min(0, "Cost price must be positive"),
    sellingPrice: z.coerce.number().min(0, "Selling price must be positive"),
    warehouseId: z.string().min(1, "Please select a warehouse"),
    zoneCode: z.string().optional().default("A-01"),
    binCode: z.string().optional().default("A-01-01-01"),
    currentStock: z.coerce.number().min(0, "Stock cannot be negative"),
    minLevel: z.coerce.number().min(0, "Min level must be positive"),
    maxLevel: z.coerce.number().min(0, "Max level must be positive"),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: "Selling price cannot be lower than cost price",
    path: ["sellingPrice"],
  })
  .refine((data) => data.maxLevel >= data.minLevel, {
    message: "Max level must be greater than or equal to min level",
    path: ["maxLevel"],
  });

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  product?: Product | null;
}

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  product,
}: ProductModalProps) {
  const isEdit = Boolean(product);
  const { categories } = useWarehouse();
  // Fall back to built-in list only when context has no categories yet
  const categoryList =
    categories.length > 0
      ? categories
      : [
          { id: "cat-1", name: "Electronics" },
          { id: "cat-2", name: "Furniture" },
          { id: "cat-3", name: "Accessories" },
          { id: "cat-4", name: "Others" },
        ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      description: "",
      categoryId: "cat-1",
      unit: "pcs",
      costPrice: 0,
      sellingPrice: 0,
      warehouseId: "wh-1",
      zoneCode: "A-01",
      binCode: "A-01-01-01",
      currentStock: 0,
      minLevel: 10,
      maxLevel: 100,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        description: product.description || "",
        categoryId: product.categoryId,
        unit: product.unit,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        warehouseId: product.warehouseId,
        zoneCode: product.zoneCode || "A-01",
        binCode: product.binCode || "A-01-01-01",
        currentStock: product.currentStock,
        minLevel: product.minLevel,
        maxLevel: product.maxLevel,
      });
    } else {
      reset({
        name: "",
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        barcode: `8934${Math.floor(1000000 + Math.random() * 9000000)}`,
        description: "",
        categoryId: categoryList[0]?.id ?? "cat-1",
        unit: "pcs",
        costPrice: 5000,
        sellingPrice: 8500,
        warehouseId: "wh-1",
        zoneCode: "A-01",
        binCode: "A-01-01-01",
        currentStock: 50,
        minLevel: 20,
        maxLevel: 200,
      });
    }
  }, [product, reset, isOpen]);

  if (!isOpen) return null;

  const validWarehouses = SEED_WAREHOUSES.filter((w) => w.id !== "wh-all");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#EEF0F2] flex flex-col overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEF0F2]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#111111] text-white">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 id="product-modal-title" className="text-sm font-bold text-[#111111]">
                {isEdit ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                {isEdit ? `Updating ${product?.name}` : "Create a new inventory catalogue item"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111111] hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Row 1: Name and SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Product Name *
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g. Ergonomic Keyboard"
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-[11px] text-[#B91C1C] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                SKU / Code *
              </label>
              <input
                {...register("sku")}
                type="text"
                placeholder="e.g. ELE-KBD-009"
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              />
              {errors.sku && (
                <p className="flex items-center gap-1 text-[11px] text-[#B91C1C] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.sku.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Barcode & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Barcode / QR *
              </label>
              <input
                {...register("barcode")}
                type="text"
                placeholder="8934..."
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              />
              {errors.barcode && (
                <p className="flex items-center gap-1 text-[11px] text-[#B91C1C] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.barcode.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Category *
              </label>
              <select
                {...register("categoryId")}
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              >
                {categoryList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Unit, Warehouse, Zone & Bin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Unit of Measure *
              </label>
              <select
                {...register("unit")}
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Assigned Warehouse *
              </label>
              <select
                {...register("warehouseId")}
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              >
                {validWarehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Bin Code
              </label>
              <input
                {...register("binCode")}
                type="text"
                placeholder="A-01-01-01"
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              />
            </div>
          </div>

          {/* Row 4: Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Cost Price (₦) *
              </label>
              <input
                {...register("costPrice")}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              />
              {errors.costPrice && (
                <p className="flex items-center gap-1 text-[11px] text-[#B91C1C] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.costPrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Selling Price (₦) *
              </label>
              <input
                {...register("sellingPrice")}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              />
              {errors.sellingPrice && (
                <p className="flex items-center gap-1 text-[11px] text-[#B91C1C] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.sellingPrice.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 5: Stock Levels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Current Stock *
              </label>
              <input
                {...register("currentStock")}
                type="number"
                min="0"
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              />
              {errors.currentStock && (
                <p className="flex items-center gap-1 text-[11px] text-[#B91C1C] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.currentStock.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Min Level (Reorder) *
              </label>
              <input
                {...register("minLevel")}
                type="number"
                min="0"
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              />
              {errors.minLevel && (
                <p className="flex items-center gap-1 text-[11px] text-[#B91C1C] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.minLevel.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Max Level *
              </label>
              <input
                {...register("maxLevel")}
                type="number"
                min="0"
                className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
              />
              {errors.maxLevel && (
                <p className="flex items-center gap-1 text-[11px] text-[#B91C1C] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.maxLevel.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder="Product specs, material, or storage notes..."
              className="w-full px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#EEF0F2] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111111] bg-white border border-[#EEF0F2] rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-black rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
