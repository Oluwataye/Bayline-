import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * In-memory ledger calculation engine mirroring PostgreSQL ledger functions
 */
function deriveStockFromLedger(initialStock, movements) {
  let currentStock = initialStock;

  for (const m of movements) {
    if (m.type === "inbound") {
      currentStock += m.quantity;
    } else if (m.type === "outbound") {
      if (currentStock < m.quantity) {
        throw new Error(
          `Insufficient stock: requested ${m.quantity}, available ${currentStock}`
        );
      }
      currentStock -= m.quantity;
    } else if (m.type === "adjustment") {
      currentStock += m.delta;
      if (currentStock < 0) {
        throw new Error("Stock cannot drop below 0 via adjustment");
      }
    }
  }

  return currentStock;
}

describe("Immutable Stock Ledger Invariants", () => {
  test("inbound movements correctly increment stock balance", () => {
    const finalStock = deriveStockFromLedger(50, [
      { type: "inbound", quantity: 100 },
      { type: "inbound", quantity: 50 },
    ]);
    assert.equal(finalStock, 200);
  });

  test("outbound movements correctly decrement stock balance", () => {
    const finalStock = deriveStockFromLedger(200, [
      { type: "outbound", quantity: 50 },
      { type: "outbound", quantity: 30 },
    ]);
    assert.equal(finalStock, 120);
  });

  test("prevents negative stock operations when dispatch exceeds available balance", () => {
    assert.throws(
      () => {
        deriveStockFromLedger(10, [{ type: "outbound", quantity: 50 }]);
      },
      {
        message: /Insufficient stock/,
      }
    );
  });

  test("applies adjustments correctly with positive and negative variance", () => {
    const finalStock = deriveStockFromLedger(100, [
      { type: "adjustment", delta: -10 }, // e.g. Damaged
      { type: "adjustment", delta: +5 },  // e.g. Found in cycle count
    ]);
    assert.equal(finalStock, 95);
  });
});

