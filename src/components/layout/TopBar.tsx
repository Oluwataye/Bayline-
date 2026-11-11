"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Building2,
  ChevronDown,
  User,
  Bell,
  Menu,
  Check,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { cn } from "@/lib/utils";

export function TopBar() {
  const {
    warehouses,
    selectedWarehouseId,
    selectedWarehouse,
    setSelectedWarehouseId,
    setMobileMenuOpen,
  } = useWarehouse();

  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const warehouseMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        warehouseMenuRef.current &&
        !warehouseMenuRef.current.contains(event.target as Node)
      ) {
        setWarehouseDropdownOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 bg-[#F4F5F7]">
      {/* Left: Mobile hamburger & Search input */}
      <div className="flex items-center gap-3 w-full max-w-md">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-lg bg-white border border-[#EEF0F2] text-[#111111] hover:bg-gray-50 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8A8A8A]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search item..."
            className="w-full h-10 pl-10 pr-12 text-sm bg-white border border-[#EEF0F2] rounded-xl text-[#111111] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          />
          <div className="absolute inset-y-0 right-0 hidden sm:flex items-center pr-3 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-[#8A8A8A] bg-[#F3F4F6] border border-[#E5E7EB] rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls: Warehouse Switcher, Notifications, User Chip */}
      <div className="flex items-center gap-3">
        {/* Warehouse Switcher Dropdown */}
        <div className="relative" ref={warehouseMenuRef}>
          <button
            onClick={() => setWarehouseDropdownOpen(!warehouseDropdownOpen)}
            className="hidden sm:flex items-center gap-2 h-10 px-3.5 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
            <span className="truncate max-w-[130px]">{selectedWarehouse.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>

          {warehouseDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#EEF0F2] rounded-xl shadow-dropdown py-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Select Active Facility
              </div>
              {warehouses.map((wh) => (
                <button
                  key={wh.id}
                  onClick={() => {
                    setSelectedWarehouseId(wh.id);
                    setWarehouseDropdownOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-xs text-left transition-colors",
                    selectedWarehouseId === wh.id
                      ? "bg-[#F3F4F6] text-[#111111] font-semibold"
                      : "text-[#4B4B4B] hover:bg-gray-50"
                  )}
                >
                  <div className="flex flex-col">
                    <span>{wh.name}</span>
                    <span className="text-[10px] text-[#8A8A8A]">{wh.city} • {wh.code}</span>
                  </div>
                  {selectedWarehouseId === wh.id && (
                    <Check className="w-4 h-4 text-[#111111]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button
          className="relative flex items-center justify-center w-10 h-10 bg-white border border-[#EEF0F2] rounded-xl text-[#111111] hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4 text-[#111111]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white" />
        </button>

        {/* User Chip matching screenshot: black circular avatar + "Admin" + chevron */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 h-10 pl-1.5 pr-2.5 bg-white border border-[#EEF0F2] rounded-xl hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            {/* Round black avatar icon with white person glyph */}
            <div className="flex items-center justify-center w-7 h-7 bg-[#111111] rounded-full text-white">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#111111]">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#EEF0F2] rounded-xl shadow-dropdown py-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#EEF0F2]">
                <p className="text-xs font-semibold text-[#111111]">Super Admin</p>
                <p className="text-[11px] text-[#6B7280]">admin@wms.internal</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#4B4B4B] hover:bg-gray-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Security & Roles</span>
                </button>
                <button
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#DC2626] hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

