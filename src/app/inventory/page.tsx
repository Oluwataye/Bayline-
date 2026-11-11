"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  Package,
  Plus,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
} from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { SEED_PRODUCTS, SEED_WAREHOUSES } from "@/lib/seed-data";
import { Product } from "@/types";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { ProductModal, ProductFormData } from "@/components/inventory/ProductModal";
import { useToast } from "@/components/ui/Toast";

export default function InventoryPage() {
  const { selectedWarehouse, categories } = useWarehouse();
  const { addToast } = useToast();

  const allCategories = useMemo(() => {
    return [{ id: "all", name: "All Categories" }, ...categories];
  }, [categories]);

  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Warehouse-filtered dataset
  const warehouseProducts = useMemo(() => {
    if (selectedWarehouse.id === "wh-all") {
      return products;
    }
    return products.filter((p) => p.warehouseId === selectedWarehouse.id);
  }, [products, selectedWarehouse.id]);

  // Applied category & status filters
  const filteredProducts = useMemo(() => {
    return warehouseProducts.filter((p) => {
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [warehouseProducts, categoryFilter, statusFilter]);

  // Handle Create or Update
  const handleSaveProduct = (data: ProductFormData) => {
    const warehouse = SEED_WAREHOUSES.find((w) => w.id === data.warehouseId);
    const category = allCategories.find((c) => c.id === data.categoryId);

    let status: Product["status"] = "in_stock";
    if (data.currentStock === 0) {
      status = "out_of_stock";
    } else if (data.currentStock <= data.minLevel) {
      status = "low_stock";
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: data.name,
                sku: data.sku,
                barcode: data.barcode,
                description: data.description,
                categoryId: data.categoryId,
                categoryName: category?.name || "Others",
                unit: data.unit,
                costPrice: data.costPrice,
                sellingPrice: data.sellingPrice,
                warehouseId: data.warehouseId,
                warehouseName: warehouse?.name || "Lagos Central Hub",
                zoneCode: data.zoneCode,
                binCode: data.binCode,
                currentStock: data.currentStock,
                minLevel: data.minLevel,
                maxLevel: data.maxLevel,
                status,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      addToast(`Updated product "${data.name}"`, "success");
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        description: data.description,
        categoryId: data.categoryId,
        categoryName: category?.name || "Others",
        unit: data.unit,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        warehouseId: data.warehouseId,
        warehouseName: warehouse?.name || "Lagos Central Hub",
        zoneCode: data.zoneCode,
        binCode: data.binCode,
        currentStock: data.currentStock,
        minLevel: data.minLevel,
        maxLevel: data.maxLevel,
        status,
        updatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      addToast(`Added product "${data.name}"`, "success");
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Delete product
  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete ${product.name} (${product.sku})?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      addToast(`Deleted "${product.name}"`, "info");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ["SKU", "Name", "Category", "Warehouse", "Location", "Cost Price", "Selling Price", "Stock", "Min Level", "Status"],
      ...filteredProducts.map((p) => [
        p.sku,
        p.name,
        p.categoryName,
        p.warehouseName,
        `${p.zoneCode || ""}/${p.binCode || ""}`,
        p.costPrice.toString(),
        p.sellingPrice.toString(),
        p.currentStock.toString(),
        p.minLevel.toString(),
        p.status,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_${selectedWarehouse.code || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported inventory CSV", "success");
  };

  // TanStack Table columns
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-[#EEF0F2] text-[#111111] focus:ring-0 cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-[#EEF0F2] text-[#111111] focus:ring-0 cursor-pointer"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            aria-label={`Select row ${row.original.name}`}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold hover:text-black"
          >
            <span>SKU</span>
            <ArrowUpDown className="w-3 h-3 text-[#8A8A8A]" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono font-medium text-[#111111]">
            {row.original.sku}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold hover:text-black"
          >
            <span>Product Name</span>
            <ArrowUpDown className="w-3 h-3 text-[#8A8A8A]" />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-[#111111]">{row.original.name}</div>
            <div className="text-[10px] text-[#6B7280]">{row.original.description || "—"}</div>
          </div>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => (
          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F3F4F6] text-[#4B4B4B]">
            {row.original.categoryName}
          </span>
        ),
      },
      {
        accessorKey: "warehouseName",
        header: "Warehouse",
        cell: ({ row }) => (
          <div className="text-[#4B4B4B]">
            <div>{row.original.warehouseName}</div>
            <div className="text-[10px] text-[#8A8A8A] font-mono">
              {row.original.binCode || "Bin unassigned"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "costPrice",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold hover:text-black"
          >
            <span>Cost</span>
            <ArrowUpDown className="w-3 h-3 text-[#8A8A8A]" />
          </button>
        ),
        cell: ({ row }) => formatCurrency(row.original.costPrice),
      },
      {
        accessorKey: "sellingPrice",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold hover:text-black"
          >
            <span>Selling</span>
            <ArrowUpDown className="w-3 h-3 text-[#8A8A8A]" />
          </button>
        ),
        cell: ({ row }) => formatCurrency(row.original.sellingPrice),
      },
      {
        accessorKey: "currentStock",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold hover:text-black"
          >
            <span>Stock Level</span>
            <ArrowUpDown className="w-3 h-3 text-[#8A8A8A]" />
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const isLow = item.currentStock <= item.minLevel;
          return (
            <div>
              <span className={`font-bold ${isLow ? "text-[#B91C1C]" : "text-[#111111]"}`}>
                {formatNumber(item.currentStock)}
              </span>
              <span className="text-[10px] text-[#8A8A8A] ml-1">
                / {item.minLevel} min
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === "low_stock") {
            return (
              <span className="wms-badge-danger inline-flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>Low Stock</span>
              </span>
            );
          }
          if (status === "out_of_stock") {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200 text-gray-700">
                <XCircle className="w-2.5 h-2.5" />
                <span>Out of Stock</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-[#16A34A]">
              <CheckCircle className="w-2.5 h-2.5" />
              <span>In Stock</span>
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditingProduct(row.original);
                setIsModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111111] hover:bg-gray-100 transition-colors"
              aria-label={`Edit ${row.original.name}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteProduct(row.original)}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#B91C1C] hover:bg-red-50 transition-colors"
              aria-label={`Delete ${row.original.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            Inventory Catalogue
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time stock ledger &amp; SKU registry for {selectedWarehouse.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="wms-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
            <input
              type="text"
              placeholder="Filter by product name, SKU, or specs..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-[#EEF0F2] rounded-xl bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111]"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          {allCategories.map((cat) => {
            const count =
              cat.id === "all"
                ? warehouseProducts.length
                : warehouseProducts.filter((p) => p.categoryId === cat.id).length;
            const active = categoryFilter === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[#111111] text-white"
                    : "bg-[#F3F4F6] text-[#4B4B4B] hover:bg-gray-200"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-white text-[#6B7280]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk action toolbar if rows selected */}
      {selectedCount > 0 && (
        <div className="p-3 bg-[#111111] text-white rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span>{selectedCount} product(s) selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRowSelection({});
                addToast(`Cleared selection of ${selectedCount} items`, "info");
              }}
              className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg"
            >
              Deselect
            </button>
            <button
              onClick={() => {
                addToast(`Exported batch of ${selectedCount} items`, "success");
              }}
              className="px-2.5 py-1 text-xs bg-white text-[#111111] font-semibold hover:bg-gray-100 rounded-lg"
            >
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Catalogue Table */}
      <div className="wms-card overflow-hidden">
        <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#111111]" />
            <span className="text-sm font-semibold text-[#111111]">
              Catalogue Items ({filteredProducts.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#111111] border-b border-[#EEF0F2]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-4 font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-[#6B7280]">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <div className="text-sm font-semibold">No products found</div>
                    <div className="text-xs mt-0.5">Try adjusting your filters or search query</div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50/70 transition-colors ${
                      row.getIsSelected() ? "bg-gray-50" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-[#EEF0F2] flex items-center justify-between text-xs text-[#6B7280]">
          <div>
            Showing{" "}
            <span className="font-semibold text-[#111111]">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#111111]">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredProducts.length
              )}
            </span>{" "}
            of <span className="font-semibold text-[#111111]">{filteredProducts.length}</span>{" "}
            entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-[#EEF0F2] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium text-[#111111]">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(1, table.getPageCount())}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-[#EEF0F2] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Create/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  );
}
