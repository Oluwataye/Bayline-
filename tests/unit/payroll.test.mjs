import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * Calculates Nigerian statutory payroll components
 * - Pension: 8% of Basic Salary
 * - NHF (National Housing Fund): 2.5% of Basic Salary
 * - PAYE (graduated tax approximation on taxable income)
 */
function calculateNigerianPayroll({ basic, housing, transport, payeTax }) {
  const grossPay = basic + housing + transport;
  const pension8 = Math.round(basic * 0.08);
  const nhf25 = Math.round(basic * 0.025);
  const totalDeductions = pension8 + nhf25 + payeTax;
  const netPay = grossPay - totalDeductions;

  return {
    grossPay,
    pension8,
    nhf25,
    payeTax,
    totalDeductions,
    netPay,
  };
}

describe("Nigerian Statutory Payroll Calculations", () => {
  test("calculates gross pay as sum of basic, housing, and transport allowances", () => {
    const result = calculateNigerianPayroll({
      basic: 350000,
      housing: 150000,
      transport: 80000,
      payeTax: 62450,
    });

    assert.equal(result.grossPay, 580000);
  });

  test("calculates mandatory 8% employee Pension contribution on basic salary", () => {
    const result = calculateNigerianPayroll({
      basic: 350000,
      housing: 150000,
      transport: 80000,
      payeTax: 62450,
    });

    // 8% of 350,000 = 28,000
    assert.equal(result.pension8, 28000);
  });

  test("calculates 2.5% National Housing Fund (NHF) on basic salary", () => {
    const result = calculateNigerianPayroll({
      basic: 350000,
      housing: 150000,
      transport: 80000,
      payeTax: 62450,
    });

    // 2.5% of 350,000 = 8,750
    assert.equal(result.nhf25, 8750);
  });

  test("verifies net pay invariant: netPay === grossPay - totalDeductions", () => {
    const employees = [
      { basic: 350000, housing: 150000, transport: 80000, payeTax: 62450 },
      { basic: 180000, housing: 70000, transport: 40000, payeTax: 21500 },
      { basic: 150000, housing: 60000, transport: 35000, payeTax: 16800 },
    ];

    for (const emp of employees) {
      const calc = calculateNigerianPayroll(emp);
      assert.equal(calc.netPay, calc.grossPay - calc.totalDeductions);
      assert.ok(calc.netPay > 0, "Net pay must be positive");
      assert.ok(calc.netPay < calc.grossPay, "Net pay cannot exceed gross pay");
    }
  });
});

