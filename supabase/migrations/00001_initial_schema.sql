-- ============================================================================
-- Warehouse Dashboard - Production PostgreSQL Schema & Security Migration
-- Migration: 00001_initial_schema.sql
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin',
    'warehouse_manager',
    'stock_clerk',
    'payroll_officer',
    'sales_agent',
    'viewer'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE movement_type AS ENUM (
    'inbound',
    'outbound',
    'transfer',
    'adjustment',
    'return'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE movement_status AS ENUM (
    'draft',
    'pending',
    'in_transit',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE zone_type AS ENUM (
    'ambient',
    'cold',
    'hazmat',
    'bulk'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE alert_severity AS ENUM (
    'info',
    'warning',
    'danger'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE MULTI-TENANCY & LOCATION TABLES
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  locale TEXT NOT NULL DEFAULT 'en-NG',
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  capacity_sqm NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_bins INTEGER NOT NULL DEFAULT 0,
  utilization_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_warehouses_org_code UNIQUE (org_id, code)
);

CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type zone_type NOT NULL DEFAULT 'ambient',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_zones_warehouse_code UNIQUE (warehouse_id, code)
);

CREATE TABLE IF NOT EXISTS bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  aisle TEXT NOT NULL,
  rack TEXT NOT NULL,
  shelf TEXT NOT NULL,
  bin_number TEXT NOT NULL,
  max_weight_kg NUMERIC(10,2),
  max_volume_cbm NUMERIC(10,2),
  is_occupied BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_bins_warehouse_code UNIQUE (warehouse_id, code)
);

-- 4. IDENTITY & MEMBERSHIP
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouse_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'stock_clerk',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_member_profile_warehouse UNIQUE (profile_id, warehouse_id)
);

-- 5. CATALOGUE & SUPPLY CHAIN
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_categories_org_slug UNIQUE (org_id, slug)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Nigeria',
  rating NUMERIC(3,2) DEFAULT 5.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  cost_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 0,
  max_level INTEGER NOT NULL DEFAULT 0,
  valuation_method TEXT NOT NULL DEFAULT 'FIFO' CHECK (valuation_method IN ('FIFO', 'LIFO', 'AVCO', 'STANDARD')),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  mfg_date DATE,
  expiry_date DATE,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_product_batches_number UNIQUE (product_id, batch_number)
);

-- 6. STOCK MOVEMENTS & INVENTORY BALANCES
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  movement_number TEXT NOT NULL UNIQUE,
  type movement_type NOT NULL,
  status movement_status NOT NULL DEFAULT 'draft',
  source_warehouse_id UUID REFERENCES warehouses(id) ON DELETE RESTRICT,
  dest_warehouse_id UUID REFERENCES warehouses(id) ON DELETE RESTRICT,
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_movement_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL REFERENCES stock_movements(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL,
  source_bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  dest_bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  quantity_requested NUMERIC(12,2) NOT NULL,
  quantity_transacted NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL,
  quantity_on_hand NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity_reserved NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_positive_balances CHECK (quantity_on_hand >= 0 AND quantity_reserved >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_balances_idx 
ON inventory_balances (
  warehouse_id, 
  product_id, 
  COALESCE(bin_id, '00000000-0000-0000-0000-000000000000'::uuid), 
  COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- 7. ALERTS ENGINE
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('low_stock', 'overstock', 'expiring_batch', 'stalled_transfer')),
  threshold_value NUMERIC(12,2) NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'warning',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'warning',
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. PAYROLL MODULE (Nigeria Statutory Compliance: PAYE, Pension 8%, NHF 2.5%)
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid', 'cancelled')),
  total_gross NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_tax NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_pension NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_nhf NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_net NUMERIC(14,2) NOT NULL DEFAULT 0,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_payroll_runs_org_month UNIQUE (org_id, month_year)
);

CREATE TABLE IF NOT EXISTS payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  employee_role TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  basic_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
  housing_allowance NUMERIC(14,2) NOT NULL DEFAULT 0,
  transport_allowance NUMERIC(14,2) NOT NULL DEFAULT 0,
  other_allowances NUMERIC(14,2) NOT NULL DEFAULT 0,
  gross_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  pension_employee NUMERIC(14,2) NOT NULL DEFAULT 0,
  pension_employer NUMERIC(14,2) NOT NULL DEFAULT 0,
  nhf_deduction NUMERIC(14,2) NOT NULL DEFAULT 0,
  paye_tax NUMERIC(14,2) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_payslips_run_profile UNIQUE (payroll_run_id, profile_id)
);

-- 10. CRM MODULE
CREATE TABLE IF NOT EXISTS crm_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Nigeria',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  job_title TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  value NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
  quote_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  valid_until DATE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 11. INDEXES FOR PERFORMANCE & SEARCH
-- ============================================================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_org ON warehouses(org_id);
CREATE INDEX IF NOT EXISTS idx_zones_warehouse ON zones(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_bins_zone ON bins(zone_id);
CREATE INDEX IF NOT EXISTS idx_bins_warehouse ON bins(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_members_profile ON warehouse_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_members_warehouse ON warehouse_members(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_categories_org ON categories(org_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_org ON suppliers(org_id);
CREATE INDEX IF NOT EXISTS idx_products_org ON products(org_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_batches_product ON product_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_org ON stock_movements(org_id);
CREATE INDEX IF NOT EXISTS idx_movements_src_wh ON stock_movements(source_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movements_dest_wh ON stock_movements(dest_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_by ON stock_movements(created_by);
CREATE INDEX IF NOT EXISTS idx_movement_items_movement ON stock_movement_items(movement_id);
CREATE INDEX IF NOT EXISTS idx_movement_items_product ON stock_movement_items(product_id);
CREATE INDEX IF NOT EXISTS idx_movement_items_batch ON stock_movement_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_movement_items_src_bin ON stock_movement_items(source_bin_id);
CREATE INDEX IF NOT EXISTS idx_movement_items_dest_bin ON stock_movement_items(dest_bin_id);
CREATE INDEX IF NOT EXISTS idx_inv_balances_wh ON inventory_balances(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inv_balances_prod ON inventory_balances(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_balances_bin ON inventory_balances(bin_id);
CREATE INDEX IF NOT EXISTS idx_inv_balances_batch ON inventory_balances(batch_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_org ON alert_rules(org_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_wh ON alert_rules(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_alerts_org ON alerts(org_id);
CREATE INDEX IF NOT EXISTS idx_alerts_wh ON alerts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_alerts_product ON alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_alerts_rule ON alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_wh ON audit_logs(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_org ON payroll_runs(org_id);
CREATE INDEX IF NOT EXISTS idx_payslips_run ON payslips(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payslips_profile ON payslips(profile_id);
CREATE INDEX IF NOT EXISTS idx_crm_companies_org ON crm_companies(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_org ON crm_contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company ON crm_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_org ON crm_deals(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_company ON crm_deals(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_assigned ON crm_deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_quotes_org ON crm_quotes(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_quotes_deal ON crm_quotes(deal_id);

-- Search and filter indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_movements_number ON stock_movements(movement_number);
CREATE INDEX IF NOT EXISTS idx_movements_status ON stock_movements(status);
CREATE INDEX IF NOT EXISTS idx_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_month ON payroll_runs(month_year);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_quotes_status ON crm_quotes(status);

-- ============================================================================
-- 12. AUTOMATION FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Generic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all updateable tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'organizations', 'warehouses', 'zones', 'bins', 'profiles', 
    'warehouse_members', 'categories', 'suppliers', 'products', 
    'product_batches', 'stock_movements', 'stock_movement_items', 
    'inventory_balances', 'alert_rules', 'alerts', 'payroll_runs', 
    'payslips', 'crm_companies', 'crm_contacts', 'crm_deals', 'crm_quotes'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;', t);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t);
  END LOOP;
END $$;

-- Trigger Function: prevent_negative_stock()
-- Verifies that execution of a stock movement will not deplete stock below 0
CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
  v_available NUMERIC(12,2);
  v_prod_sku TEXT;
BEGIN
  -- We only evaluate stock sufficiency when a movement is being completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    -- Inbound and return do not draw from source warehouse
    IF NEW.type IN ('outbound', 'transfer', 'adjustment') THEN
      FOR v_item IN 
        SELECT smi.product_id, smi.batch_id, smi.source_bin_id, smi.quantity_transacted
        FROM stock_movement_items smi
        WHERE smi.movement_id = NEW.id
      LOOP
        -- Calculate current on-hand quantity at source
        SELECT COALESCE(SUM(quantity_on_hand), 0)
        INTO v_available
        FROM inventory_balances
        WHERE warehouse_id = NEW.source_warehouse_id
          AND product_id = v_item.product_id
          AND (v_item.source_bin_id IS NULL OR bin_id = v_item.source_bin_id)
          AND (v_item.batch_id IS NULL OR batch_id = v_item.batch_id);

        IF v_available < v_item.quantity_transacted THEN
          SELECT sku INTO v_prod_sku FROM products WHERE id = v_item.product_id;
          RAISE EXCEPTION 'Negative stock prevented: SKU % in warehouse % has % units on hand, but % units requested for transaction.',
            COALESCE(v_prod_sku, v_item.product_id::text),
            NEW.source_warehouse_id,
            v_available,
            v_item.quantity_transacted;
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_negative_stock ON stock_movements;
CREATE TRIGGER trg_prevent_negative_stock
  BEFORE UPDATE OF status ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION prevent_negative_stock();

-- Trigger Function: update_inventory_balances()
-- Updates the inventory_balances table atomically when stock_movements transitions to 'completed'
CREATE OR REPLACE FUNCTION update_inventory_balances()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
  v_default_bin UUID;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    FOR v_item IN
      SELECT 
        smi.id AS item_id,
        smi.product_id,
        smi.batch_id,
        smi.source_bin_id,
        smi.dest_bin_id,
        smi.quantity_transacted
      FROM stock_movement_items smi
      WHERE smi.movement_id = NEW.id
    LOOP
      -- 1. Inbound Movement: Increase destination warehouse inventory
      IF NEW.type = 'inbound' THEN
        INSERT INTO inventory_balances (
          warehouse_id, product_id, bin_id, batch_id, quantity_on_hand, quantity_reserved
        )
        VALUES (
          NEW.dest_warehouse_id, v_item.product_id, v_item.dest_bin_id, v_item.batch_id, v_item.quantity_transacted, 0
        )
        ON CONFLICT (
          warehouse_id, 
          product_id, 
          COALESCE(bin_id, '00000000-0000-0000-0000-000000000000'::uuid), 
          COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'::uuid)
        )
        DO UPDATE SET
          quantity_on_hand = inventory_balances.quantity_on_hand + EXCLUDED.quantity_on_hand,
          updated_at = now();

        -- Update batch quantity if applicable
        IF v_item.batch_id IS NOT NULL THEN
          UPDATE product_batches
          SET quantity = quantity + v_item.quantity_transacted
          WHERE id = v_item.batch_id;
        END IF;

      -- 2. Outbound Movement: Decrease source warehouse inventory
      ELSIF NEW.type = 'outbound' THEN
        UPDATE inventory_balances
        SET quantity_on_hand = GREATEST(0, quantity_on_hand - v_item.quantity_transacted),
            updated_at = now()
        WHERE warehouse_id = NEW.source_warehouse_id
          AND product_id = v_item.product_id
          AND (v_item.source_bin_id IS NULL OR bin_id = v_item.source_bin_id)
          AND (v_item.batch_id IS NULL OR batch_id = v_item.batch_id);

        -- Update batch quantity if applicable
        IF v_item.batch_id IS NOT NULL THEN
          UPDATE product_batches
          SET quantity = GREATEST(0, quantity - v_item.quantity_transacted)
          WHERE id = v_item.batch_id;
        END IF;

      -- 3. Warehouse Transfer: Deduct from source and credit destination
      ELSIF NEW.type = 'transfer' THEN
        -- Deduct from source
        UPDATE inventory_balances
        SET quantity_on_hand = GREATEST(0, quantity_on_hand - v_item.quantity_transacted),
            updated_at = now()
        WHERE warehouse_id = NEW.source_warehouse_id
          AND product_id = v_item.product_id
          AND (v_item.source_bin_id IS NULL OR bin_id = v_item.source_bin_id)
          AND (v_item.batch_id IS NULL OR batch_id = v_item.batch_id);

        -- Add to destination
        INSERT INTO inventory_balances (
          warehouse_id, product_id, bin_id, batch_id, quantity_on_hand, quantity_reserved
        )
        VALUES (
          NEW.dest_warehouse_id, v_item.product_id, v_item.dest_bin_id, v_item.batch_id, v_item.quantity_transacted, 0
        )
        ON CONFLICT (
          warehouse_id, 
          product_id, 
          COALESCE(bin_id, '00000000-0000-0000-0000-000000000000'::uuid), 
          COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'::uuid)
        )
        DO UPDATE SET
          quantity_on_hand = inventory_balances.quantity_on_hand + EXCLUDED.quantity_on_hand,
          updated_at = now();

      -- 4. Adjustment: Positive or negative delta
      ELSIF NEW.type = 'adjustment' THEN
        IF NEW.dest_warehouse_id IS NOT NULL THEN
          INSERT INTO inventory_balances (
            warehouse_id, product_id, bin_id, batch_id, quantity_on_hand, quantity_reserved
          )
          VALUES (
            NEW.dest_warehouse_id, v_item.product_id, v_item.dest_bin_id, v_item.batch_id, v_item.quantity_transacted, 0
          )
          ON CONFLICT (
            warehouse_id, 
            product_id, 
            COALESCE(bin_id, '00000000-0000-0000-0000-000000000000'::uuid), 
            COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'::uuid)
          )
          DO UPDATE SET
            quantity_on_hand = GREATEST(0, inventory_balances.quantity_on_hand + EXCLUDED.quantity_on_hand),
            updated_at = now();
        ELSIF NEW.source_warehouse_id IS NOT NULL THEN
          UPDATE inventory_balances
          SET quantity_on_hand = GREATEST(0, quantity_on_hand - v_item.quantity_transacted),
              updated_at = now()
          WHERE warehouse_id = NEW.source_warehouse_id
            AND product_id = v_item.product_id
            AND (v_item.source_bin_id IS NULL OR bin_id = v_item.source_bin_id)
            AND (v_item.batch_id IS NULL OR batch_id = v_item.batch_id);
        END IF;

      -- 5. Customer / Vendor Return: Restock to destination
      ELSIF NEW.type = 'return' THEN
        INSERT INTO inventory_balances (
          warehouse_id, product_id, bin_id, batch_id, quantity_on_hand, quantity_reserved
        )
        VALUES (
          NEW.dest_warehouse_id, v_item.product_id, v_item.dest_bin_id, v_item.batch_id, v_item.quantity_transacted, 0
        )
        ON CONFLICT (
          warehouse_id, 
          product_id, 
          COALESCE(bin_id, '00000000-0000-0000-0000-000000000000'::uuid), 
          COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'::uuid)
        )
        DO UPDATE SET
          quantity_on_hand = inventory_balances.quantity_on_hand + EXCLUDED.quantity_on_hand,
          updated_at = now();
      END IF;
    END LOOP;

    -- Update completed_at timestamp
    NEW.completed_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_inventory_balances ON stock_movements;
CREATE TRIGGER trg_update_inventory_balances
  AFTER UPDATE OF status ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_balances();

-- Trigger Function: log_audit_event()
-- Automated mutation auditing for regulatory and operational tracking
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
  v_wh_id UUID;
  v_user_id UUID;
  v_entity_id TEXT;
BEGIN
  v_user_id := auth.uid();

  IF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id::text;
    BEGIN v_org_id := OLD.org_id; EXCEPTION WHEN OTHERS THEN v_org_id := NULL; END;
    BEGIN v_wh_id := OLD.warehouse_id; EXCEPTION WHEN OTHERS THEN v_wh_id := NULL; END;

    INSERT INTO audit_logs (
      org_id, warehouse_id, user_id, action, entity_type, entity_id, old_values, new_values, timestamp
    )
    VALUES (
      v_org_id, v_wh_id, v_user_id, TG_OP, TG_TABLE_NAME, v_entity_id, to_jsonb(OLD), NULL, now()
    );
    RETURN OLD;
  ELSE
    v_entity_id := NEW.id::text;
    BEGIN v_org_id := NEW.org_id; EXCEPTION WHEN OTHERS THEN v_org_id := NULL; END;
    BEGIN v_wh_id := NEW.warehouse_id; EXCEPTION WHEN OTHERS THEN v_wh_id := NULL; END;

    INSERT INTO audit_logs (
      org_id, warehouse_id, user_id, action, entity_type, entity_id, old_values, new_values, timestamp
    )
    VALUES (
      v_org_id, v_wh_id, v_user_id, TG_OP, TG_TABLE_NAME, v_entity_id,
      CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
      to_jsonb(NEW),
      now()
    );
    RETURN NEW;
  END IF;
END;
$$;

-- Attach audit log triggers to key operational tables
DROP TRIGGER IF EXISTS trg_audit_products ON products;
CREATE TRIGGER trg_audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_audit_stock_movements ON stock_movements;
CREATE TRIGGER trg_audit_stock_movements
  AFTER INSERT OR UPDATE OR DELETE ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_audit_inventory_balances ON inventory_balances;
CREATE TRIGGER trg_audit_inventory_balances
  AFTER INSERT OR UPDATE OR DELETE ON inventory_balances
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_audit_payroll_runs ON payroll_runs;
CREATE TRIGGER trg_audit_payroll_runs
  AFTER INSERT OR UPDATE OR DELETE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ============================================================================

-- Helper: Retrieve current user's organization ID
CREATE OR REPLACE FUNCTION get_auth_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Helper: Verify user has authorized role for a specific warehouse
CREATE OR REPLACE FUNCTION check_warehouse_permission(w_id UUID, roles TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_role user_role;
  v_user_org UUID;
  v_target_org UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT role, org_id INTO v_role, v_user_org FROM profiles WHERE id = auth.uid();
  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  -- Super Admin has unconstrained tenant-wide access
  IF v_role = 'super_admin' THEN
    IF w_id IS NULL THEN
      RETURN true;
    END IF;
    SELECT org_id INTO v_target_org FROM warehouses WHERE id = w_id;
    RETURN (v_user_org = v_target_org);
  END IF;

  -- Organization check
  IF w_id IS NULL THEN
    RETURN true;
  END IF;

  -- Warehouse membership check
  RETURN EXISTS (
    SELECT 1 FROM warehouse_members wm
    JOIN warehouses w ON w.id = wm.warehouse_id
    WHERE wm.profile_id = auth.uid()
      AND wm.warehouse_id = w_id
      AND (roles IS NULL OR wm.role::text = ANY(roles))
      AND w.org_id = v_user_org
  );
END;
$$;

-- Enable RLS across all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_quotes ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS Policies: organizations
-- ----------------------------------------------------------------------------
CREATE POLICY "org_select_policy" ON organizations
  FOR SELECT TO authenticated
  USING (id = get_auth_org_id());

CREATE POLICY "org_update_policy" ON organizations
  FOR UPDATE TO authenticated
  USING (id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ----------------------------------------------------------------------------
-- RLS Policies: profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ----------------------------------------------------------------------------
-- RLS Policies: warehouses
-- ----------------------------------------------------------------------------
CREATE POLICY "warehouses_select_policy" ON warehouses
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "warehouses_manage_policy" ON warehouses
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager')
  ));

-- ----------------------------------------------------------------------------
-- RLS Policies: zones & bins
-- ----------------------------------------------------------------------------
CREATE POLICY "zones_select_policy" ON zones
  FOR SELECT TO authenticated
  USING (check_warehouse_permission(warehouse_id, NULL));

CREATE POLICY "zones_manage_policy" ON zones
  FOR ALL TO authenticated
  USING (check_warehouse_permission(warehouse_id, ARRAY['super_admin', 'warehouse_manager']));

CREATE POLICY "bins_select_policy" ON bins
  FOR SELECT TO authenticated
  USING (check_warehouse_permission(warehouse_id, NULL));

CREATE POLICY "bins_manage_policy" ON bins
  FOR ALL TO authenticated
  USING (check_warehouse_permission(warehouse_id, ARRAY['super_admin', 'warehouse_manager']));

-- ----------------------------------------------------------------------------
-- RLS Policies: warehouse_members
-- ----------------------------------------------------------------------------
CREATE POLICY "members_select_policy" ON warehouse_members
  FOR SELECT TO authenticated
  USING (check_warehouse_permission(warehouse_id, NULL));

CREATE POLICY "members_manage_policy" ON warehouse_members
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ----------------------------------------------------------------------------
-- RLS Policies: categories & suppliers
-- ----------------------------------------------------------------------------
CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "categories_manage_policy" ON categories
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager')
  ));

CREATE POLICY "suppliers_select_policy" ON suppliers
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "suppliers_manage_policy" ON suppliers
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager')
  ));

-- ----------------------------------------------------------------------------
-- RLS Policies: products & product_batches
-- ----------------------------------------------------------------------------
CREATE POLICY "products_select_policy" ON products
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "products_manage_policy" ON products
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager')
  ));

CREATE POLICY "batches_select_policy" ON product_batches
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM products p WHERE p.id = product_batches.product_id AND p.org_id = get_auth_org_id()
  ));

CREATE POLICY "batches_manage_policy" ON product_batches
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM products p 
    WHERE p.id = product_batches.product_id 
      AND p.org_id = get_auth_org_id()
      AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager', 'stock_clerk')
      )
  ));

-- ----------------------------------------------------------------------------
-- RLS Policies: stock_movements & stock_movement_items
-- ----------------------------------------------------------------------------
CREATE POLICY "movements_select_policy" ON stock_movements
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "movements_insert_policy" ON stock_movements
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id = get_auth_org_id() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager', 'stock_clerk')
    )
  );

CREATE POLICY "movements_update_policy" ON stock_movements
  FOR UPDATE TO authenticated
  USING (
    org_id = get_auth_org_id() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager', 'stock_clerk')
    )
  );

CREATE POLICY "movement_items_select_policy" ON stock_movement_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stock_movements sm WHERE sm.id = stock_movement_items.movement_id AND sm.org_id = get_auth_org_id()
  ));

CREATE POLICY "movement_items_manage_policy" ON stock_movement_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stock_movements sm 
    WHERE sm.id = stock_movement_items.movement_id 
      AND sm.org_id = get_auth_org_id()
      AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager', 'stock_clerk')
      )
  ));

-- ----------------------------------------------------------------------------
-- RLS Policies: inventory_balances
-- ----------------------------------------------------------------------------
CREATE POLICY "inv_balances_select_policy" ON inventory_balances
  FOR SELECT TO authenticated
  USING (check_warehouse_permission(warehouse_id, NULL));

CREATE POLICY "inv_balances_manage_policy" ON inventory_balances
  FOR ALL TO authenticated
  USING (check_warehouse_permission(warehouse_id, ARRAY['super_admin', 'warehouse_manager', 'stock_clerk']));

-- ----------------------------------------------------------------------------
-- RLS Policies: alert_rules & alerts
-- ----------------------------------------------------------------------------
CREATE POLICY "alert_rules_select_policy" ON alert_rules
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "alert_rules_manage_policy" ON alert_rules
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager')
  ));

CREATE POLICY "alerts_select_policy" ON alerts
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "alerts_update_policy" ON alerts
  FOR UPDATE TO authenticated
  USING (org_id = get_auth_org_id());

-- ----------------------------------------------------------------------------
-- RLS Policies: audit_logs
-- ----------------------------------------------------------------------------
CREATE POLICY "audit_logs_select_policy" ON audit_logs
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'warehouse_manager')
  ));

-- ----------------------------------------------------------------------------
-- RLS Policies: payroll_runs & payslips
-- ----------------------------------------------------------------------------
CREATE POLICY "payroll_runs_select_policy" ON payroll_runs
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'payroll_officer')
  ));

CREATE POLICY "payroll_runs_manage_policy" ON payroll_runs
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'payroll_officer')
  ));

CREATE POLICY "payslips_select_policy" ON payslips
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'payroll_officer')
    )
  );

CREATE POLICY "payslips_manage_policy" ON payslips
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'payroll_officer')
  ));

-- ----------------------------------------------------------------------------
-- RLS Policies: CRM Module
-- ----------------------------------------------------------------------------
CREATE POLICY "crm_companies_select_policy" ON crm_companies
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "crm_companies_manage_policy" ON crm_companies
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sales_agent')
  ));

CREATE POLICY "crm_contacts_select_policy" ON crm_contacts
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "crm_contacts_manage_policy" ON crm_contacts
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sales_agent')
  ));

CREATE POLICY "crm_deals_select_policy" ON crm_deals
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "crm_deals_manage_policy" ON crm_deals
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sales_agent')
  ));

CREATE POLICY "crm_quotes_select_policy" ON crm_quotes
  FOR SELECT TO authenticated
  USING (org_id = get_auth_org_id());

CREATE POLICY "crm_quotes_manage_policy" ON crm_quotes
  FOR ALL TO authenticated
  USING (org_id = get_auth_org_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sales_agent')
  ));
