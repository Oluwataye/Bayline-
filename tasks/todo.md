# Warehouse Dashboard - Master Implementation Plan

> **Application Name:** Configurable in `src/config/app.config.ts` (default: `"Warehouse Dashboard"`, short code `"WMS"`)
> **Design Philosophy:** Pixel-accurate replication of reference screenshot; strict monochrome SaaS aesthetic with purposeful semantic accents (green for positive growth, soft red for alert badges); production-grade multi-tenancy with Postgres RLS, immutable movement ledgers, and strict TypeScript.

---

## 1. System Architecture & Tech Stack

- **Framework:** Next.js 14 (App Router, React Server Components where optimal, Client Components for interactive dashboard widgets and tables)
- **Language:** TypeScript 5.x (`strict: true`, no `any`, strict null checks)
- **Styling & UI:** Tailwind CSS, Radix UI primitives (`shadcn/ui`), `lucide-react` icons
- **Data Visualisation:** Recharts (monochrome palette: `#111111`, `#4B4B4B`, `#8A8A8A`, `#D9D9DE`)
- **Tables & Forms:** TanStack Table v8 (virtualized/paginated), React Hook Form, Zod validation
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security, Supabase Auth, Realtime Postgres Changes, Storage for product images and payslip PDFs)
- **Offline / Local Fallback:** Next.js Route Handlers + Mock/Demo Seed Mode if live Supabase keys are not immediately configured in local development, ensuring full immediate visual and functional review.

---

## 2. Design System & Visual Tokens (Reference Screenshot Parity)

- [ ] **CSS Variables & Tailwind Extension (`src/styles/globals.css` & `tailwind.config.ts`)**
  - [ ] App Background: `#F4F5F7`
  - [ ] Sidebar Background: `#111111` (near-black)
  - [ ] Card Background: `#FFFFFF`, border `1px solid #EEF0F2`, radius `14px` (`rounded-[14px]`), soft shadow `0 1px 3px rgba(0,0,0,0.06)`
  - [ ] Inactive Nav Text/Icons: `#E5E5E5` on dark sidebar; hover: `#1F1F1F`
  - [ ] Active Nav Pill: Light grey `#E5E5E5` with `#111111` dark text and icon
  - [ ] Primary Text/Ink: `#111111`; Secondary Text: `#6B7280`
  - [ ] Table Header Background: `#F3F4F6`
  - [ ] Semantic Badges:
    - [ ] Low Stock Pill: bg `#FECACA`, text `#B91C1C`, fully rounded (`rounded-full`)
    - [ ] Delta Positive: text `#16A34A` (with green ▲)
    - [ ] Delta Negative: text `#DC2626` (with red ▼)
    - [ ] Notification Badge on Alerts Nav: small circular red badge with white count
  - [ ] Typography: Inter / Plus Jakarta Sans, card titles semi-bold (font-semibold, 16px), KPI values extra-bold (font-extrabold, ~32px)

---

## 3. Database Schema & RLS Architecture (PostgreSQL)

- [ ] **Core Tenancy & Organizations**
  - [ ] `organizations` (id, name, slug, logo_url, currency_code DEFAULT 'NGN', created_at)
  - [ ] `warehouses` (id, org_id, code, name, address, city, country, capacity_sqm, is_active)
  - [ ] `zones` (id, warehouse_id, code, name, zone_type: 'ambient'|'cold'|'hazmat'|'bulk')
  - [ ] `bins` (id, zone_id, code, aisle, rack, shelf, bin, max_weight_kg, max_volume_cbm)
- [ ] **Identity & Role-Based Access Control (RBAC)**
  - [ ] `profiles` (id references auth.users, org_id, full_name, email, avatar_url, phone)
  - [ ] `warehouse_members` (id, profile_id, warehouse_id, role: 'super_admin'|'warehouse_manager'|'stock_clerk'|'payroll_officer'|'sales_agent'|'viewer')
  - [ ] Helper DB functions: `get_current_org_id()`, `has_warehouse_role(w_id, allowed_roles[])`
  - [ ] RLS policies on all tables enforcing tenant isolation by `org_id` and warehouse assignment
- [ ] **Inventory & Product Catalogue**
  - [ ] `categories` (id, org_id, name, slug)
  - [ ] `suppliers` (id, org_id, name, contact_email, phone, address, rating)
  - [ ] `products` (id, org_id, sku, barcode, qr_code, name, description, category_id, unit, cost_price, selling_price, reorder_level, max_level, image_url, valuation_method: 'FIFO'|'AVCO')
  - [ ] `product_batches` (id, product_id, batch_number, mfg_date, expiry_date, cost_per_unit)
  - [ ] `inventory_balances` (view or materialized table derived from immutable movement ledger: product_id, warehouse_id, bin_id, batch_id, quantity_on_hand, quantity_reserved, quantity_available)
- [ ] **Immutable Stock Ledger & Movements**
  - [ ] `stock_movements` (id, org_id, movement_number, movement_type: 'inbound'|'outbound'|'transfer'|'adjustment'|'return', status: 'draft'|'pending_approval'|'in_transit'|'completed'|'cancelled', source_warehouse_id, dest_warehouse_id, reference_type, reference_id, notes, created_by, approved_by, created_at)
  - [ ] `stock_movement_items` (id, movement_id, product_id, batch_id, source_bin_id, dest_bin_id, quantity_requested, quantity_transacted, unit_cost)
  - [ ] Triggers to validate no negative stock (unless specifically enabled in organization settings)
- [ ] **Alerts & Thresholds**
  - [ ] `alert_rules` (id, org_id, warehouse_id, rule_type: 'low_stock'|'overstock'|'expiring_batch'|'stalled_transfer', threshold_value, severity: 'info'|'warning'|'critical')
  - [ ] `alerts` (id, org_id, warehouse_id, rule_id, title, message, severity, is_read, acknowledged_by, resolved_by, created_at)
- [ ] **Audit Log Engine**
  - [ ] `audit_logs` (id, org_id, warehouse_id, user_id, action, entity_type, entity_id, old_values JSONB, new_values JSONB, ip_address, created_at)
- [ ] **Payroll & CRM Extensions**
  - [ ] Payroll: `employees`, `pay_grades`, `salary_components`, `payroll_runs`, `payslips` (with Nigeria PAYE, Pension 8%, NHF 2.5% pre-configured)
  - [ ] CRM: `crm_contacts`, `crm_companies`, `crm_deals` (stages: Lead → Quoted → Won → Lost), `crm_quotes`

---

## 4. Module Breakdown & Build Order

### Phase 1: Foundation, App Shell & Dashboard (Pixel-Perfect Match)
- [x] **1.1 Project Initialization & Dependencies**
  - [x] Initialize Next.js 14 App Router with TypeScript, Tailwind CSS, Lucide icons, Recharts, TanStack Table
  - [x] Set up path aliases, configuration constants, ESLint, and Prettier
- [x] **1.2 Design Tokens & Base Shell Components**
  - [x] Sidebar:
    - [x] Top: Outline warehouse icon with 3 boxes + "Warehouse Dashboard" in bold white
    - [x] Primary Nav items with exact 44px rows: Overview (Active pill `#E5E5E5`, black icon/text), Inventory, Stock Movement, Alerts (red badge "2"), Reports, Settings (1:1 match with reference screenshot)
    - [x] Operations section: Payroll, CRM (subdued group header / expandable)
    - [x] Bottom: Calendar icon + "Last Updated" + live timestamp (`Nov 9, 2026 10:45 AM`)
    - [x] Tablet collapse (icon-only) & Mobile responsive drawer (390px)
  - [x] Top Bar:
    - [x] Rounded search input with magnifying glass (`Search item...`) + Cmd+K shortcut
    - [x] Warehouse switcher dropdown ("All Warehouses", "Main Hub - Lagos", "Ikeja Distribution", "Abuja Depot")
    - [x] Notification bell with pulse indicator
    - [x] User chip: round black avatar icon + "Admin" + chevron dropdown
- [x] **1.3 Dashboard Widgets (Screenshot Parity)**
  - [x] **Row 1: 4 KPI Cards**
    - [x] *Total Stock Items*: `5,780` | `▲ +2.5% vs last month` | Box icon in black circular badge
    - [x] *Total Inbound*: `1,250` | `▲ +8.7% vs last month` | Cart icon in black circular badge
    - [x] *Total Outbound*: `1,180` | `▲ +6.3% vs last month` | Export/outbound icon in black circular badge
    - [x] *Warehouse Utilization*: `78%` | `▲ +1.2% vs last month` | Warehouse building icon in black circular badge
  - [x] **Row 2: 2/3 + 1/3 Chart Grid**
    - [x] *Stock Trend Card*: Line/Area chart with smooth black line, solid black circular dots at data points, soft light grey gradient fading down to transparent/white, y-axis formatted in `K` (0, 1K, 2K, 3K, 4K, 5K), x-axis `Nov 1` to `Nov 9`, "This Month" filter dropdown
    - [x] *Stock by Category Card*: Grayscale donut chart with `5,780 Total` in bold center, segments: Electronics (32%), Furniture (28%), Accessories (24%), Others (16%), right-side legend with dot markers and percentages
  - [x] **Row 3: 1/2 + 1/2 Tables Grid**
    - [x] *Low Stock Alert Table*: Icon + title, light grey header (`#F3F4F6`), columns: `Product`, `Current Stock`, `Min Level`, `Status` (red pill badge "Low Stock"), rows for Wireless Mouse (12/50), USB Cable (20/50), Laptop Bag (25/50)
    - [x] *Recent Activities Table*: Icon + title, columns: `Date & Time`, `Activity`, `User`, live audit rows (Stock In 200 units, Stock Out 50 units, Stock Adjusted 10 units)
- [x] **1.4 Demo Seed Engine & Visual Proof Point**
  - [x] Seed realistic data for 3 warehouses and ~60 products
  - [x] **PAUSE FOR VISUAL REVIEW** against reference screenshot at 1440px, 1024px, 390px

---

### Phase 2: Tenancy, Auth, Warehouse Switching & Audit Logging
- [ ] **2.1 Supabase Auth & Multi-Tenancy Scoping**
  - [ ] Supabase SSR client setup (`@supabase/ssr`) with cookie session handling
  - [ ] Organization & Warehouse switcher state stored in cookie/context
  - [ ] Automatic query filtering by selected warehouse
- [ ] **2.2 RBAC & Permissions Gate**
  - [ ] Role check components (`<HasRole role={...}>`)
  - [ ] RLS policies verification
- [ ] **2.3 Audit Logging Service**
  - [ ] Server action wrapper to automatically log all mutations to `audit_logs`

---

### Phase 3: Core WMS Modules (Inventory, Stock Movement, Alerts)
- [ ] **3.1 Inventory Management**
  - [ ] Product catalogue with TanStack Table: search, filter by category/supplier/warehouse, sort, pagination
  - [ ] Product create/edit modal (Zod schema validation, image upload, SKU/barcode generator)
  - [ ] Batch & expiry tracking with visual shelf-life warnings
  - [ ] Warehouse bin allocation (Aisle-Rack-Shelf-Bin)
  - [ ] CSV bulk product import & export
  - [ ] Stock-take / Cycle-count reconciliation workflow with variance approval
- [ ] **3.2 Stock Movement & Immutable Ledger**
  - [ ] Movement ledger view with timeline and filters (type, date, warehouse, user)
  - [ ] Inbound flow: Purchase Order receipt → goods verification → put-away to bin
  - [ ] Outbound flow: Dispatch order → pick list → pack → ship
  - [ ] Inter-warehouse transfer workflow: Requested → Approved → In Transit → Received (with partial receipt handling)
  - [ ] Stock adjustments with mandatory reason codes (Damage, Loss, Found, Correction)
- [ ] **3.3 Alerts & Rules Engine**
  - [ ] Realtime alert notifications (Supabase Realtime subscription)
  - [ ] Alert drawer & dedicated list with severity filters
  - [ ] Actionable alerts: acknowledge, resolve, reorder trigger
  - [ ] Threshold configuration per warehouse/product

---

### Phase 4: Extended Business Modules (Reports, Payroll, CRM, Settings)
- [ ] **4.1 Reports & Analytics**
  - [ ] Valuation report (FIFO vs Weighted Average)
  - [ ] ABC Analysis (Revenue / Velocity classification)
  - [ ] Stock ageing & turnover analysis
  - [ ] Multi-warehouse comparison matrix
  - [ ] Export to CSV, XLSX, and printable PDF
- [ ] **4.2 Payroll Module**
  - [ ] Employee directory per warehouse
  - [ ] Pay grade & salary structure setup
  - [ ] Configurable country statutory deductions with Nigeria preset (PAYE progressive tax brackets, 8% employee Pension, 2.5% NHF)
  - [ ] Monthly payroll run generator (Draft → Review → Approve → Paid)
  - [ ] Automated payslip PDF generation
- [ ] **4.3 CRM Module**
  - [ ] Customer & Supplier directory with full activity history
  - [ ] Sales pipeline Kanban board (Lead → Quoted → Won → Lost)
  - [ ] Quotes generator converting directly into Outbound Stock Movement orders
- [ ] **4.4 Settings Module**
  - [ ] Organization profile, currency (NGN default, USD/EUR options), numbering formats (PO-, SO-, TR-)
  - [ ] Warehouse, Zone, and Bin master manager
  - [ ] User management & role assignments
  - [ ] Full audit log viewer with JSON diff inspection

---

### Phase 5: Verification, Quality Assurance & Deployment
- [ ] **5.1 Type-check & Linting**
  - [ ] `tsc --noEmit` clean with 0 errors
  - [ ] ESLint clean
- [ ] **5.2 Automated Testing**
  - [ ] Unit tests for ledger calculation & tax/payroll calculations
  - [ ] Integration tests for stock transfer state machine
  - [ ] End-to-end test specifications
- [ ] **5.3 Responsive & Accessibility Testing**
  - [ ] Verification at 1440px desktop
  - [ ] Verification at 1024px tablet (sidebar collapsed to icons)
  - [ ] Verification at 390px mobile (off-canvas drawer)
  - [ ] WCAG AA color contrast check
- [ ] **5.4 Deployment Readiness**
  - [ ] `.env.example` with Supabase credentials documentation
  - [ ] SQL migration files in `supabase/migrations/`
  - [ ] Comprehensive `README.md` with setup instructions

---

## Review & Sign-Off Checkpoints

| Checkpoint | Scope | Status | Proof / Evidence |
|------------|-------|--------|------------------|
| **Checkpoint 1** | Plan Approval (`tasks/todo.md`) | ✅ Approved | Approved by user |
| **Checkpoint 2** | Design System + Shell + Dashboard UI | ✅ Verified & Pushed | Pushed to https://github.com/Oluwataye/Bayline-.git (`fff9095`) |
| **Checkpoint 3** | Tenancy + Auth + RBAC + Audit | ⏳ In Progress | Schema & seed files generated (`00001_initial_schema.sql`, `seed.sql`) |
| **Checkpoint 4** | Inventory + Stock Movement + Alerts | ⏹ Pending | Ledger invariant & transfer state test logs |
| **Checkpoint 5** | Reports + Payroll + CRM + Settings | ⏹ Pending | Payslip generation, CRM quotes & settings test logs |
| **Checkpoint 6** | Final Delivery & Deployment Prep | ⏹ Pending | Type-check, lint, build & test suite passes |

