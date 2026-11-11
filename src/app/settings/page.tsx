"use client";

import React from "react";
import { Settings, Building, Shield, Bell, DollarSign, Database } from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
          System Settings
        </h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage organization profiles, facilities, user roles, and security policies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Organization Profile", icon: Building, desc: "Legal entity, currency (NGN default), and regional locale." },
          { title: "Warehouses & Bins", icon: Settings, desc: "Configure locations, aisles, racks, and storage capacity." },
          { title: "Users & RBAC", icon: Shield, desc: "Manage 6 role levels, invitations, and warehouse assignments." },
          { title: "Alert Thresholds", icon: Bell, desc: "Low-stock triggers, buffer days, and escalation routes." },
          { title: "Payroll & Taxes", icon: DollarSign, desc: "Nigeria PAYE, Pension (8%), NHF (2.5%) statutory setup." },
          { title: "Data & Audit Logs", icon: Database, desc: "System activity logs, CSV backups, and Supabase sync." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="wms-card p-5 hover:border-gray-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-[#111111]">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#111111]">{item.title}</h3>
              </div>
              <p className="text-xs text-[#6B7280]">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

