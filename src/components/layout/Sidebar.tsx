"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Repeat,
  Bell,
  BarChart3,
  Settings,
  Wallet,
  Users,
  Calendar,
  ChevronDown,
  X,
} from "lucide-react";
import { WarehouseLogo } from "./WarehouseLogo";
import { useWarehouse } from "@/context/WarehouseContext";
import { APP_CONFIG } from "@/config/app.config";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Stock Movement", href: "/movements", icon: Repeat },
  { name: "Alerts", href: "/alerts", icon: Bell, badge: 2 },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const OPERATIONS_NAV_ITEMS: NavItem[] = [
  { name: "Payroll", href: "/payroll", icon: Wallet },
  { name: "CRM", href: "/crm", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { lastUpdated, mobileMenuOpen, setMobileMenuOpen } = useWarehouse();
  const [operationsExpanded, setOperationsExpanded] = useState(true);

  const renderNavLinks = (items: NavItem[], isCompact = false) => {
    return (
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={item.name}
                className={cn(
                  "flex items-center h-11 rounded-xl text-sm font-medium transition-colors relative",
                  isCompact ? "justify-center px-0 w-11 mx-auto" : "justify-between px-3.5",
                  isActive
                    ? "bg-[#E5E5E5] text-[#111111] font-semibold"
                    : "text-[#E5E5E5] hover:bg-[#1F1F1F] hover:text-white"
                )}
              >
                <div className={cn("flex items-center", isCompact ? "justify-center" : "gap-3")}>
                  <Icon
                    className={cn(
                      "w-[18px] h-[18px] shrink-0",
                      isActive ? "text-[#111111]" : "text-[#E5E5E5]"
                    )}
                  />
                  {!isCompact && <span>{item.name}</span>}
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "flex items-center justify-center text-[10px] font-bold rounded-full",
                      isCompact
                        ? "absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] text-white"
                        : "w-5 h-5 bg-[#DC2626] text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      {/* Desktop & Tablet Adaptive Sidebar */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-30 bg-[#111111] text-white w-[72px] xl:w-[210px] select-none border-r border-[#222222] transition-all duration-200">
        {/* Brand & Warehouse Header */}
        <div className="pt-6 pb-6 px-3 xl:px-5 flex flex-col items-center xl:items-start">
          <WarehouseLogo className="w-10 h-10 xl:w-12 xl:h-12" />
          <div className="mt-3 leading-tight hidden xl:block">
            <div className="text-[17px] font-bold tracking-tight text-white">Warehouse</div>
            <div className="text-[17px] font-bold tracking-tight text-white">Dashboard</div>
          </div>
        </div>

        {/* Nav List */}
        <div className="flex-1 px-2 xl:px-3 overflow-y-auto space-y-4">
          {/* Primary Nav */}
          <div className="xl:hidden">{renderNavLinks(PRIMARY_NAV_ITEMS, true)}</div>
          <div className="hidden xl:block">{renderNavLinks(PRIMARY_NAV_ITEMS, false)}</div>

          {/* Operations / Extended Section */}
          <div className="pt-2 border-t border-[#222222]">
            <div className="hidden xl:block">
              <button
                onClick={() => setOperationsExpanded(!operationsExpanded)}
                className="flex items-center justify-between w-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A8A8A] hover:text-white transition-colors"
              >
                <span>Operations</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    operationsExpanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>
              {operationsExpanded && (
                <div className="mt-1">{renderNavLinks(OPERATIONS_NAV_ITEMS, false)}</div>
              )}
            </div>
            <div className="xl:hidden">
              {renderNavLinks(OPERATIONS_NAV_ITEMS, true)}
            </div>
          </div>
        </div>

        {/* Footer / Last Updated */}
        <div className="p-3 xl:p-4 border-t border-[#222222] bg-[#111111] flex items-center justify-center xl:justify-start">
          <Calendar className="w-4 h-4 text-[#8A8A8A] shrink-0" />
          <div className="text-[11px] leading-tight ml-2.5 hidden xl:block">
            <div className="text-[#8A8A8A] font-medium">{APP_CONFIG.lastUpdatedLabel}</div>
            <div className="text-[#E5E5E5] font-semibold mt-0.5">{lastUpdated}</div>
          </div>
        </div>
      </aside>

      {/* Mobile Off-canvas Drawer (<768px) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex flex-col w-[240px] max-w-full h-full bg-[#111111] z-50 text-white select-none">
            <div className="pt-6 pb-6 px-5 flex flex-col items-start">
              <div className="flex items-center justify-between w-full">
                <WarehouseLogo className="w-12 h-12" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 leading-tight">
                <div className="text-[17px] font-bold tracking-tight text-white">Warehouse</div>
                <div className="text-[17px] font-bold tracking-tight text-white">Dashboard</div>
              </div>
            </div>

            <div className="flex-1 px-3 overflow-y-auto space-y-4">
              <div>{renderNavLinks(PRIMARY_NAV_ITEMS, false)}</div>
              <div className="pt-2 border-t border-[#222222]">
                <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A8A8A]">
                  Operations
                </div>
                <div className="mt-1">{renderNavLinks(OPERATIONS_NAV_ITEMS, false)}</div>
              </div>
            </div>

            <div className="p-4 border-t border-[#222222] bg-[#111111]">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#8A8A8A] mt-0.5 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <div className="text-[#8A8A8A] font-medium">{APP_CONFIG.lastUpdatedLabel}</div>
                  <div className="text-[#E5E5E5] font-semibold mt-0.5">{lastUpdated}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
