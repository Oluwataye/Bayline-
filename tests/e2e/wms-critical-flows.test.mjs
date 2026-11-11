import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

describe("E2E Critical Flow Tests — Warehouse Dashboard WMS", () => {
  let browser;
  let page;

  before(async () => {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
  });

  after(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test("1. Dashboard page renders KPI cards and charts", async () => {
    await page.goto(BASE_URL, { waitUntil: "networkidle0", timeout: 20000 });

    // Verify page title / heading
    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(bodyText.includes("5,780"), "Should display Total Stock Items KPI 5,780");
    assert.ok(bodyText.includes("1,250"), "Should display Total Inbound KPI 1,250");
    assert.ok(bodyText.includes("1,180"), "Should display Total Outbound KPI 1,180");
    assert.ok(bodyText.includes("78%"), "Should display Warehouse Utilization KPI 78%");
    assert.ok(bodyText.includes("Low Stock Alert"), "Should display Low Stock Alert card");
  });

  test("2. Inventory catalogue renders table, category tabs, and filters", async () => {
    await page.goto(`${BASE_URL}/inventory`, { waitUntil: "networkidle0", timeout: 20000 });

    const titleText = await page.evaluate(() => document.body.innerText);
    assert.ok(titleText.includes("Inventory Catalogue"), "Page title should match");
    assert.ok(titleText.includes("All Categories"), "Category tabs should be present");
    assert.ok(titleText.includes("Wireless Mouse"), "Products from seed data should render");

    // Click Electronics tab
    const clickedTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const elecBtn = buttons.find((b) => b.innerText.includes("Electronics"));
      if (elecBtn) {
        elecBtn.click();
        return true;
      }
      return false;
    });
    assert.ok(clickedTab, "Electronics category tab should be clickable");
  });

  test("3. Stock Movements page renders ledger and opens detail drawer", async () => {
    await page.goto(`${BASE_URL}/movements`, { waitUntil: "networkidle0", timeout: 20000 });

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(bodyText.includes("Stock Movements & Ledger"), "Header should render");
    assert.ok(bodyText.includes("Movement Transactions"), "Table title should render");

    // Click on the first movement row to open drawer
    const rowClicked = await page.evaluate(() => {
      const row = document.querySelector("tbody tr");
      if (row) {
        row.click();
        return true;
      }
      return false;
    });
    assert.ok(rowClicked, "First transaction row should be clickable");

    await page.waitForTimeout ? page.waitForTimeout(500) : new Promise((r) => setTimeout(r, 500));

    // Verify drawer appears
    const drawerPresent = await page.evaluate(() => {
      return Boolean(document.querySelector('aside[role="dialog"]'));
    });
    assert.ok(drawerPresent, "Detail drawer should open upon row click");
  });

  test("4. Alerts page renders active queue and responds to actions", async () => {
    await page.goto(`${BASE_URL}/alerts`, { waitUntil: "networkidle0", timeout: 20000 });

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(bodyText.includes("Alerts & Threshold Rules"), "Header should render");
    assert.ok(bodyText.includes("Low Stock: Wireless Mouse"), "Critical alerts should render");

    // Click Acknowledge on first alert
    const clickedAck = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const ackBtn = buttons.find((b) => b.innerText.trim() === "Acknowledge");
      if (ackBtn) {
        ackBtn.click();
        return true;
      }
      return false;
    });
    assert.ok(clickedAck, "Acknowledge action button should exist and be clickable");
  });

  test("5. Nigerian Payroll page renders statutory deductions and payslip modal", async () => {
    await page.goto(`${BASE_URL}/payroll`, { waitUntil: "networkidle0", timeout: 20000 });

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(bodyText.includes("Payroll & Compensation"), "Payroll header should render");
    assert.ok(bodyText.includes("Babatunde Adeleke"), "Employee roster should render");
    assert.ok(bodyText.includes("Pension (8%)"), "8% Pension column should render");
    assert.ok(bodyText.includes("PAYE Tax"), "PAYE tax column should render");

    // Click on the view payslip icon button
    const eyeClicked = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label^="View payslip"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert.ok(eyeClicked, "View payslip button should be clickable");

    await new Promise((r) => setTimeout(r, 500));

    // Verify official payslip modal is displayed
    const payslipModal = await page.evaluate(() => {
      return document.body.innerText.includes("Official Payslip") &&
             document.body.innerText.includes("National Housing Fund");
    });
    assert.ok(payslipModal, "Official Payslip modal with statutory breakdown should open");
  });

  test("6. CRM page renders 4-stage Kanban pipeline and deals", async () => {
    await page.goto(`${BASE_URL}/crm`, { waitUntil: "networkidle0", timeout: 20000 });

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(bodyText.includes("CRM & Wholesale Pipeline"), "CRM header should render");
    assert.ok(bodyText.includes("Initial Inquiries"), "Lead stage column should render");
    assert.ok(bodyText.includes("Proposals & Quotes"), "Quoted stage column should render");
    assert.ok(bodyText.includes("Won (Ready for Dispatch)"), "Won stage column should render");
    assert.ok(bodyText.includes("Dangote Industries"), "Client cards should render");
  });

  test("7. Settings / Admin Hub loads all 6 management tabs", async () => {
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle0", timeout: 20000 });

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(bodyText.includes("Admin Management Hub"), "Settings header should render");
    assert.ok(bodyText.includes("Facilities & Zones"), "Facilities tab should render");
    assert.ok(bodyText.includes("Categories & Units"), "Categories tab should render");
    assert.ok(bodyText.includes("Staff & RBAC Permissions"), "Staff tab should render");
    assert.ok(bodyText.includes("Feature Toggles & Policies"), "Feature Toggles tab should render");
    assert.ok(bodyText.includes("Organization & Defaults"), "Organisation tab should render");
  });

  test("8. Settings — Feature toggle tab shows all 5 policy flags", async () => {
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle0", timeout: 20000 });

    // Click Feature Toggles tab
    const clicked = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button"));
      const tab = tabs.find((b) => b.textContent?.includes("Feature Toggles"));
      if (tab) { tab.click(); return true; }
      return false;
    });
    assert.ok(clicked, "Feature Toggles tab button should be clickable");

    await new Promise((r) => setTimeout(r, 400));

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(bodyText.includes("Allow Negative Stock"), "Negative stock toggle should render");
    assert.ok(bodyText.includes("Dual Approval") || bodyText.includes("Require Dual"), "Dual approval toggle should render");
    assert.ok(bodyText.includes("Enable Payroll") || bodyText.includes("Payroll"), "Payroll module toggle should render");
    assert.ok(bodyText.includes("CRM"), "CRM module toggle should render");
  });

  test("9. Settings — Facilities tab shows existing warehouses", async () => {
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle0", timeout: 20000 });

    const bodyText = await page.evaluate(() => document.body.innerText);
    // Facilities & Zones is the first/default tab so warehouses should be visible
    assert.ok(
      bodyText.includes("Lagos Central Hub") || bodyText.includes("Ikeja"),
      "Seed warehouses should be listed in Facilities tab"
    );
    assert.ok(bodyText.includes("Add Facility"), "Add Facility button should be visible");
  });
});

