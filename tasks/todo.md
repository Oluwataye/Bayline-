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
- [x] **2.1 Supabase Auth & Multi-Tenancy Scoping**
  - [x] Supabase SSR client setup (`@supabase/ssr`) with cookie session handling (`src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`)
  - [x] Organization & Warehouse switcher state stored in `WarehouseContext`
  - [x] Automatic query & view filtering by selected warehouse
  - [x] Next.js root `middleware.ts` protecting routes and handling auth tokens
  - [x] Login page (`/auth/login`) with demo mode prefill and Supabase password authentication
  - [x] Auth callback handler (`/auth/callback`)
- [x] **2.2 RBAC & Permissions Gate**
  - [x] Role check component (`<HasRole role={...}>` in `src/components/auth/HasRole.tsx`)
  - [x] RLS policies created in Postgres migration `00001_initial_schema.sql`
- [x] **2.3 Audit Logging Service**
  - [x] Database audit logging triggers and client-side audit logs viewer in Settings

---

### Phase 3: Core WMS Modules (Inventory, Stock Movement, Alerts)
- [x] **3.1 Inventory Management**
  - [x] Product catalogue with TanStack Table v8: search, filter by category/status/warehouse, sort, pagination (`src/app/inventory/page.tsx`)
  - [x] Product create/edit modal with Zod schema validation & React Hook Form (`src/components/inventory/ProductModal.tsx`)
  - [x] 63 realistic seed products covering Electronics, Furniture, Accessories, and Others
  - [x] Warehouse bin allocation tracking (Aisle-Rack-Shelf-Bin)
  - [x] CSV bulk export & download
  - [x] Lightweight toast notifications (`src/components/ui/Toast.tsx`)
- [x] **3.2 Stock Movement & Immutable Ledger**
  - [x] Movement ledger view with timeline, filters (type, date, warehouse, user) and drawer details (`src/app/movements/page.tsx`)
  - [x] 30 days of realistic movements (`src/lib/seed-movements.ts`)
  - [x] Inbound flow: Goods verification & put-away records
  - [x] Outbound flow: Dispatch order & delivery transactions
  - [x] Inter-warehouse transfer workflow: Lagos Hub → Ikeja Depot → Abuja Facility
  - [x] Stock adjustments with reason codes (Damaged, Found, Loss)
- [x] **3.3 Alerts & Rules Engine**
  - [x] Alerts queue with severity classification (Danger, Warning, Info) in `src/app/alerts/page.tsx`
  - [x] Interactive Acknowledge & Resolve actions
  - [x] Automated Alert Rule Thresholds modal configuration (buffer multipliers, lot expiry window, stalled transfer timeout)
  - [x] CSV export of alerts history

---

### Phase 4: Extended Business Modules (Reports, Payroll, CRM, Settings)
- [x] **4.1 Reports & Analytics**
  - [x] Valuation report with FIFO cost basis by category (`src/app/reports/page.tsx`)
  - [x] Weekly Inbound vs Outbound velocity with Recharts Bar Chart
  - [x] Pareto 80/20 ABC classification analysis
  - [x] Multi-warehouse capacity and utilization comparison matrix
  - [x] CSV export and printable report format
- [x] **4.2 Payroll Module**
  - [x] Employee directory with bank details & roles (`src/app/payroll/page.tsx`)
  - [x] Nigeria statutory remittances: PAYE income tax, 8% employee Pension, 2.5% NHF
  - [x] Monthly payroll run state machine: Draft → Reviewed → Approved → Paid
  - [x] Official printable payslip viewer modal with earnings & deduction breakdown
  - [x] Bank payment schedule export to CSV
- [x] **4.3 CRM Module**
  - [x] 4-stage pipeline Kanban board: Lead → Quoted → Won → Lost (`src/app/crm/page.tsx`)
  - [x] Enterprise B2B client accounts directory
  - [x] Interactive quotation / deal creation modal
  - [x] Direct dispatch linkage from Won deals to Outbound Stock Movement
- [x] **4.4 Settings Module**
  - [x] Organization profile, legal name, TIN, and NGN default currency selector (`src/app/settings/page.tsx`)
  - [x] Warehouse facilities overview with floor area, bin capacity, and operational status
  - [x] Staff directory & Role-Based Access Control (RBAC) levels
  - [x] Tamper-evident mutation audit trail log viewer

---

### Phase 5: Verification, Quality Assurance & Deployment
- [x] **5.1 Type-check & Linting**
  - [x] `tsc --noEmit` clean with 0 errors
  - [x] Production build clean with all 13 routes statically prerendered
- [x] **5.2 Automated CI/CD Pipeline**
  - [x] GitHub Actions workflow `.github/workflows/ci.yml` with type-check, lint, build, Puppeteer screenshot regression, and SQL migration checks
- [x] **5.3 Responsive & Accessibility Testing**
  - [x] Verified desktop 1440px, tablet 1024px (icon-only collapse), mobile 390px (responsive drawer)
- [x] **5.4 Deployment Readiness**
  - [x] Environment files, Supabase SQL migrations, and demo mode fallbacks fully configured

---

## Review & Sign-Off Checkpoints

| Checkpoint | Scope | Status | Proof / Evidence |
|------------|-------|--------|------------------|
| **Checkpoint 1** | Master Plan Approval (`tasks/todo.md`) | ✅ Approved | User approved initial plan |
| **Checkpoint 2** | Design System + Shell + Dashboard UI | ✅ Verified & Pushed | 1:1 match with reference screenshot; pushed to GitHub (`fff9095`) |
| **Checkpoint 3** | Tenancy + Auth + RBAC + Audit | ✅ Complete | Root `middleware.ts`, `/auth/login`, `AuthContext`, `<HasRole>`, Supabase SSR setup |
| **Checkpoint 4** | Inventory + Stock Movement + Alerts | ✅ Complete | TanStack Table v8, Product Modal with Zod validation, 63 products, Movement ledger drawer, Alerts engine |
| **Checkpoint 5** | Reports + Payroll + CRM + Settings | ✅ Complete | FIFO valuation, ABC analysis, Nigerian statutory deductions & payslips, CRM Kanban, Settings & Audit logs |
| **Checkpoint 6** | Build & Deployment Verification | ✅ Complete | `tsc --noEmit` passed (0 errors), Next.js 14 production build succeeded (13/13 static routes) |

