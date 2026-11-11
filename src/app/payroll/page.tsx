"use client";

import React, { useState } from "react";
import {
  Wallet,
  Plus,
  Download,
  CheckCircle2,
  FileText,
  Eye,
  X,
  Printer,
  Building,
  UserCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface EmployeePayroll {
  id: string;
  name: string;
  role: string;
  warehouseId: string;
  warehouseName: string;
  bankName: string;
  accountNumber: string;
  basicSalary: number;
  housing: number;
  transport: number;
  grossPay: number;
  pension8: number;
  nhf25: number;
  payeTax: number;
  totalDeductions: number;
  netPay: number;
  status: "Draft" | "Reviewed" | "Approved" | "Paid";
}

const SEED_EMPLOYEES: EmployeePayroll[] = [
  {
    id: "emp-001",
    name: "Babatunde Adeleke",
    role: "Warehouse Operations Manager",
    warehouseId: "wh-1",
    warehouseName: "Lagos Central Hub",
    bankName: "Access Bank",
    accountNumber: "0123456789",
    basicSalary: 350000,
    housing: 150000,
    transport: 80000,
    grossPay: 580000,
    pension8: 28000,
    nhf25: 8750,
    payeTax: 62450,
    totalDeductions: 99200,
    netPay: 480800,
    status: "Approved",
  },
  {
    id: "emp-002",
    name: "Chidinma Nwosu",
    role: "Senior Stock Clerk",
    warehouseId: "wh-1",
    warehouseName: "Lagos Central Hub",
    bankName: "GTBank",
    accountNumber: "0234567890",
    basicSalary: 180000,
    housing: 70000,
    transport: 40000,
    grossPay: 290000,
    pension8: 14400,
    nhf25: 4500,
    payeTax: 21500,
    totalDeductions: 40400,
    netPay: 249600,
    status: "Approved",
  },
  {
    id: "emp-003",
    name: "Musa Ibrahim",
    role: "Forklift Operator & Logistics Lead",
    warehouseId: "wh-1",
    warehouseName: "Lagos Central Hub",
    bankName: "Zenith Bank",
    accountNumber: "0345678901",
    basicSalary: 150000,
    housing: 60000,
    transport: 35000,
    grossPay: 245000,
    pension8: 12000,
    nhf25: 3750,
    payeTax: 16800,
    totalDeductions: 32550,
    netPay: 212450,
    status: "Approved",
  },
  {
    id: "emp-004",
    name: "Emeka Okafor",
    role: "Inventory Auditor",
    warehouseId: "wh-2",
    warehouseName: "Ikeja Logistics Depot",
    bankName: "First Bank",
    accountNumber: "0456789012",
    basicSalary: 220000,
    housing: 90000,
    transport: 50000,
    grossPay: 360000,
    pension8: 17600,
    nhf25: 5500,
    payeTax: 31200,
    totalDeductions: 54300,
    netPay: 305700,
    status: "Draft",
  },
  {
    id: "emp-005",
    name: "Fatima Aliyu",
    role: "Regional Facility Supervisor",
    warehouseId: "wh-3",
    warehouseName: "Abuja Regional Facility",
    bankName: "UBA",
    accountNumber: "0567890123",
    basicSalary: 320000,
    housing: 140000,
    transport: 70000,
    grossPay: 530000,
    pension8: 25600,
    nhf25: 8000,
    payeTax: 54100,
    totalDeductions: 87700,
    netPay: 442300,
    status: "Draft",
  },
];

export default function PayrollPage() {
  const { selectedWarehouse } = useWarehouse();
  const { addToast } = useToast();

  const [employees, setEmployees] = useState<EmployeePayroll[]>(SEED_EMPLOYEES);
  const [selectedPayslip, setSelectedPayslip] = useState<EmployeePayroll | null>(null);
  const [payrollStatus, setPayrollStatus] = useState<"Draft" | "Reviewed" | "Approved" | "Paid">("Draft");

  const warehouseEmployees =
    selectedWarehouse.id === "wh-all"
      ? employees
      : employees.filter((e) => e.warehouseId === selectedWarehouse.id);

  const totalGross = warehouseEmployees.reduce((acc, e) => acc + e.grossPay, 0);
  const totalDeductions = warehouseEmployees.reduce((acc, e) => acc + e.totalDeductions, 0);
  const totalNet = warehouseEmployees.reduce((acc, e) => acc + e.netPay, 0);
  const totalPension = warehouseEmployees.reduce((acc, e) => acc + e.pension8, 0);
  const totalPaye = warehouseEmployees.reduce((acc, e) => acc + e.payeTax, 0);

  const handleAdvanceStatus = () => {
    const nextStatus =
      payrollStatus === "Draft"
        ? "Reviewed"
        : payrollStatus === "Reviewed"
        ? "Approved"
        : "Paid";
    setPayrollStatus(nextStatus);
    setEmployees((prev) => prev.map((e) => ({ ...e, status: nextStatus })));
    addToast(`Payroll run advanced to status: ${nextStatus}`, "success");
  };

  const handleExportBankSchedule = () => {
    const rows = [
      ["Employee", "Bank", "Account Number", "Gross", "Deductions", "Net Pay", "Status"],
      ...warehouseEmployees.map((e) => [
        `"${e.name}"`,
        e.bankName,
        `'${e.accountNumber}`,
        e.grossPay.toString(),
        e.totalDeductions.toString(),
        e.netPay.toString(),
        e.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bank_schedule_${selectedWarehouse.code || "all"}_Nov2026.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast("Exported Bank Payment Schedule CSV", "success");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#111111]">
            Payroll &amp; Compensation Ledger
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Nigeria Statutory Remittances (PAYE, Pension 8%, NHF 2.5%) for {selectedWarehouse.name} • Period: November 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBankSchedule}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EEF0F2] rounded-xl text-xs font-semibold text-[#111111] hover:bg-gray-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Bank Schedule</span>
          </button>
          <button
            onClick={handleAdvanceStatus}
            disabled={payrollStatus === "Paid"}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-black shadow-sm disabled:opacity-40"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {payrollStatus === "Draft"
                ? "Mark as Reviewed"
                : payrollStatus === "Reviewed"
                ? "Approve Payroll"
                : payrollStatus === "Approved"
                ? "Execute Disbursal"
                : "Disbursal Completed"}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="wms-card p-4">
          <div className="text-xs text-[#6B7280]">Total Gross Payroll</div>
          <div className="text-2xl font-extrabold text-[#111111] mt-1">
            {formatCurrency(totalGross)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1">
            {warehouseEmployees.length} staff on payroll
          </div>
        </div>

        <div className="wms-card p-4">
          <div className="text-xs text-[#6B7280]">Total Statutory PAYE Tax</div>
          <div className="text-2xl font-extrabold text-[#111111] mt-1">
            {formatCurrency(totalPaye)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1">State Internal Revenue Service</div>
        </div>

        <div className="wms-card p-4">
          <div className="text-xs text-[#6B7280]">Employee Pension (8%)</div>
          <div className="text-2xl font-extrabold text-[#111111] mt-1">
            {formatCurrency(totalPension)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1">PenCom RSA accounts</div>
        </div>

        <div className="wms-card p-4">
          <div className="text-xs text-[#6B7280]">Total Net Disbursal</div>
          <div className="text-2xl font-extrabold text-[#111111] mt-1">
            {formatCurrency(totalNet)}
          </div>
          <div className="text-[11px] font-semibold text-blue-600 mt-1">
            Status: {payrollStatus}
          </div>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="wms-card overflow-hidden">
        <div className="p-4 border-b border-[#EEF0F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#111111]" />
            <span className="text-sm font-semibold text-[#111111]">
              Monthly Payroll Register
            </span>
          </div>
          <span className="text-xs bg-[#F3F4F6] text-[#4B4B4B] font-semibold px-2.5 py-1 rounded-lg">
            Batch: NOV-2026-RUN-01
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#111111] border-b border-[#EEF0F2]">
              <tr>
                <th className="py-3 px-4 font-semibold">Employee Name</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Bank Account</th>
                <th className="py-3 px-4 font-semibold">Gross Pay</th>
                <th className="py-3 px-4 font-semibold">Pension (8%)</th>
                <th className="py-3 px-4 font-semibold">PAYE Tax</th>
                <th className="py-3 px-4 font-semibold">Net Payable</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F2]">
              {warehouseEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-semibold text-[#111111]">
                    {emp.name}
                  </td>
                  <td className="py-3 px-4 text-[#4B4B4B]">{emp.role}</td>
                  <td className="py-3 px-4 text-[#6B7280]">
                    {emp.bankName} • <span className="font-mono">{emp.accountNumber}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[#111111]">
                    {formatCurrency(emp.grossPay)}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#6B7280]">
                    {formatCurrency(emp.pension8)}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#6B7280]">
                    {formatCurrency(emp.payeTax)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#111111]">
                    {formatCurrency(emp.netPay)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        emp.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : emp.status === "Approved"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-[#4B4B4B]"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedPayslip(emp)}
                      className="p-1 rounded hover:bg-gray-100 text-[#6B7280] hover:text-[#111111]"
                      aria-label={`View payslip for ${emp.name}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Viewer Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedPayslip(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-[#EEF0F2] z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0F2] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Official Payslip</h3>
                <p className="text-[11px] text-[#6B7280]">Period: November 2026</p>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#F4F5F7] p-3 rounded-xl flex justify-between">
                <div>
                  <div className="font-bold text-[#111111]">{selectedPayslip.name}</div>
                  <div className="text-[11px] text-[#6B7280]">{selectedPayslip.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[#6B7280]">{selectedPayslip.bankName}</div>
                  <div className="font-mono font-semibold text-[#111111]">
                    {selectedPayslip.accountNumber}
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Earnings Breakdown
                </h4>
                <div className="space-y-1.5 border border-[#EEF0F2] p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Basic Salary</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Housing Allowance</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.housing)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Transport Allowance</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.transport)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-[#EEF0F2] font-bold">
                    <span>Gross Earnings</span>
                    <span className="font-mono">{formatCurrency(selectedPayslip.grossPay)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Statutory Deductions (Nigeria)
                </h4>
                <div className="space-y-1.5 border border-[#EEF0F2] p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">PAYE Income Tax</span>
                    <span className="font-mono text-red-600">
                      -{formatCurrency(selectedPayslip.payeTax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Employee Pension (8%)</span>
                    <span className="font-mono text-red-600">
                      -{formatCurrency(selectedPayslip.pension8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">National Housing Fund (2.5%)</span>
                    <span className="font-mono text-red-600">
                      -{formatCurrency(selectedPayslip.nhf25)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-[#EEF0F2] font-bold">
                    <span>Total Deductions</span>
                    <span className="font-mono text-red-600">
                      -{formatCurrency(selectedPayslip.totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="p-3 bg-[#111111] text-white rounded-xl flex justify-between items-center">
                <span className="font-bold">Net Take-Home Pay</span>
                <span className="text-base font-extrabold font-mono">
                  {formatCurrency(selectedPayslip.netPay)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EEF0F2]">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#EEF0F2] rounded-xl hover:bg-gray-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Payslip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
