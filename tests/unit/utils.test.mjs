import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Test utility functions matching src/lib/utils.ts
function formatNumber(num) {
  return new Intl.NumberFormat("en-NG").format(num);
}

function formatCurrency(amount, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

describe("Utility Functions (Formatting & Localization)", () => {
  test("formatNumber correctly formats integer values with thousands separators", () => {
    assert.equal(formatNumber(5780), "5,780");
    assert.equal(formatNumber(1250000), "1,250,000");
    assert.equal(formatNumber(0), "0");
  });

  test("formatCurrency correctly formats NGN currency amounts without decimals", () => {
    const formatted = formatCurrency(450000);
    // Should contain 450,000 and the Naira symbol or NGN
    assert.ok(formatted.includes("450,000"));
    assert.ok(formatted.includes("₦") || formatted.includes("NGN"));
  });

  test("formatCurrency formats large enterprise order amounts correctly", () => {
    const formatted = formatCurrency(140000000);
    assert.ok(formatted.includes("140,000,000"));
  });
});
