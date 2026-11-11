export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "super_admin"
  | "warehouse_manager"
  | "stock_clerk"
  | "payroll_officer"
  | "sales_agent"
  | "viewer";

export type MovementType =
  | "inbound"
  | "outbound"
  | "transfer"
  | "adjustment"
  | "return";

export type MovementStatus =
  | "draft"
  | "pending"
  | "in_transit"
  | "completed"
  | "cancelled";

export type ZoneType = "ambient" | "cold" | "hazmat" | "bulk";

export type AlertSeverity = "info" | "warning" | "danger";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          currency: string;
          locale: string;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          currency?: string;
          locale?: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          currency?: string;
          locale?: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      warehouses: {
        Row: {
          id: string;
          org_id: string;
          code: string;
          name: string;
          address: string;
          city: string;
          country: string;
          capacity_sqm: number;
          total_bins: number;
          utilization_rate: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          code: string;
          name: string;
          address: string;
          city: string;
          country?: string;
          capacity_sqm?: number;
          total_bins?: number;
          utilization_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          code?: string;
          name?: string;
          address?: string;
          city?: string;
          country?: string;
          capacity_sqm?: number;
          total_bins?: number;
          utilization_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "warehouses_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      zones: {
        Row: {
          id: string;
          warehouse_id: string;
          code: string;
          name: string;
          type: ZoneType;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          warehouse_id: string;
          code: string;
          name: string;
          type?: ZoneType;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          warehouse_id?: string;
          code?: string;
          name?: string;
          type?: ZoneType;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "zones_warehouse_id_fkey";
            columns: ["warehouse_id"];
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          }
        ];
      };
      bins: {
        Row: {
          id: string;
          zone_id: string;
          warehouse_id: string;
          code: string;
          aisle: string;
          rack: string;
          shelf: string;
          bin_number: string;
          max_weight_kg: number | null;
          max_volume_cbm: number | null;
          is_occupied: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          zone_id: string;
          warehouse_id: string;
          code: string;
          aisle: string;
          rack: string;
          shelf: string;
          bin_number: string;
          max_weight_kg?: number | null;
          max_volume_cbm?: number | null;
          is_occupied?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          zone_id?: string;
          warehouse_id?: string;
          code?: string;
          aisle?: string;
          rack?: string;
          shelf?: string;
          bin_number?: string;
          max_weight_kg?: number | null;
          max_volume_cbm?: number | null;
          is_occupied?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bins_warehouse_id_fkey";
            columns: ["warehouse_id"];
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bins_zone_id_fkey";
            columns: ["zone_id"];
            referencedRelation: "zones";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          org_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          org_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      warehouse_members: {
        Row: {
          id: string;
          profile_id: string;
          warehouse_id: string;
          role: UserRole;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          warehouse_id: string;
          role?: UserRole;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          warehouse_id?: string;
          role?: UserRole;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "warehouse_members_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "warehouse_members_warehouse_id_fkey";
            columns: ["warehouse_id"];
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          slug: string;
          color: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          slug: string;
          color?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          slug?: string;
          color?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      suppliers: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          rating: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          rating?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          rating?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "suppliers_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          org_id: string;
          sku: string;
          barcode: string | null;
          name: string;
          description: string | null;
          category_id: string | null;
          unit: string;
          cost_price: number;
          selling_price: number;
          reorder_level: number;
          max_level: number;
          valuation_method: "FIFO" | "LIFO" | "AVCO" | "STANDARD";
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          sku: string;
          barcode?: string | null;
          name: string;
          description?: string | null;
          category_id?: string | null;
          unit?: string;
          cost_price?: number;
          selling_price?: number;
          reorder_level?: number;
          max_level?: number;
          valuation_method?: "FIFO" | "LIFO" | "AVCO" | "STANDARD";
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          sku?: string;
          barcode?: string | null;
          name?: string;
          description?: string | null;
          category_id?: string | null;
          unit?: string;
          cost_price?: number;
          selling_price?: number;
          reorder_level?: number;
          max_level?: number;
          valuation_method?: "FIFO" | "LIFO" | "AVCO" | "STANDARD";
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      product_batches: {
        Row: {
          id: string;
          product_id: string;
          batch_number: string;
          mfg_date: string | null;
          expiry_date: string | null;
          quantity: number;
          cost_per_unit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          batch_number: string;
          mfg_date?: string | null;
          expiry_date?: string | null;
          quantity?: number;
          cost_per_unit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          batch_number?: string;
          mfg_date?: string | null;
          expiry_date?: string | null;
          quantity?: number;
          cost_per_unit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_batches_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      stock_movements: {
        Row: {
          id: string;
          org_id: string;
          movement_number: string;
          type: MovementType;
          status: MovementStatus;
          source_warehouse_id: string | null;
          dest_warehouse_id: string | null;
          reference: string | null;
          notes: string | null;
          created_by: string | null;
          approved_by: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          movement_number: string;
          type: MovementType;
          status?: MovementStatus;
          source_warehouse_id?: string | null;
          dest_warehouse_id?: string | null;
          reference?: string | null;
          notes?: string | null;
          created_by?: string | null;
          approved_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          movement_number?: string;
          type?: MovementType;
          status?: MovementStatus;
          source_warehouse_id?: string | null;
          dest_warehouse_id?: string | null;
          reference?: string | null;
          notes?: string | null;
          created_by?: string | null;
          approved_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_movements_dest_warehouse_id_fkey";
            columns: ["dest_warehouse_id"];
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movements_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movements_source_warehouse_id_fkey";
            columns: ["source_warehouse_id"];
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          }
        ];
      };
      stock_movement_items: {
        Row: {
          id: string;
          movement_id: string;
          product_id: string;
          batch_id: string | null;
          source_bin_id: string | null;
          dest_bin_id: string | null;
          quantity_requested: number;
          quantity_transacted: number;
          unit_cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          movement_id: string;
          product_id: string;
          batch_id?: string | null;
          source_bin_id?: string | null;
          dest_bin_id?: string | null;
          quantity_requested: number;
          quantity_transacted?: number;
          unit_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          movement_id?: string;
          product_id?: string;
          batch_id?: string | null;
          source_bin_id?: string | null;
          dest_bin_id?: string | null;
          quantity_requested?: number;
          quantity_transacted?: number;
          unit_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_movement_items_dest_bin_id_fkey";
            columns: ["dest_bin_id"];
            referencedRelation: "bins";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movement_items_movement_id_fkey";
            columns: ["movement_id"];
            referencedRelation: "stock_movements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movement_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movement_items_source_bin_id_fkey";
            columns: ["source_bin_id"];
            referencedRelation: "bins";
            referencedColumns: ["id"];
          }
        ];
      };
      inventory_balances: {
        Row: {
          id: string;
          warehouse_id: string;
          product_id: string;
          bin_id: string | null;
          batch_id: string | null;
          quantity_on_hand: number;
          quantity_reserved: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          warehouse_id: string;
          product_id: string;
          bin_id?: string | null;
          batch_id?: string | null;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          warehouse_id?: string;
          product_id?: string;
          bin_id?: string | null;
          batch_id?: string | null;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_balances_bin_id_fkey";
            columns: ["bin_id"];
            referencedRelation: "bins";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_balances_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_balances_warehouse_id_fkey";
            columns: ["warehouse_id"];
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          }
        ];
      };
      alert_rules: {
        Row: {
          id: string;
          org_id: string;
          warehouse_id: string | null;
          rule_name: string;
          rule_type: "low_stock" | "overstock" | "expiring_batch" | "stalled_transfer";
          threshold_value: number;
          severity: AlertSeverity;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          warehouse_id?: string | null;
          rule_name: string;
          rule_type: "low_stock" | "overstock" | "expiring_batch" | "stalled_transfer";
          threshold_value: number;
          severity?: AlertSeverity;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          warehouse_id?: string | null;
          rule_name?: string;
          rule_type?: "low_stock" | "overstock" | "expiring_batch" | "stalled_transfer";
          threshold_value?: number;
          severity?: AlertSeverity;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alert_rules_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alert_rules_warehouse_id_fkey";
            columns: ["warehouse_id"];
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          }
        ];
      };
      alerts: {
        Row: {
          id: string;
          org_id: string;
          warehouse_id: string | null;
          product_id: string | null;
          rule_id: string | null;
          title: string;
          message: string;
          severity: AlertSeverity;
          is_read: boolean;
          is_resolved: boolean;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          warehouse_id?: string | null;
          product_id?: string | null;
          rule_id?: string | null;
          title: string;
          message: string;
          severity?: AlertSeverity;
          is_read?: boolean;
          is_resolved?: boolean;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          warehouse_id?: string | null;
          product_id?: string | null;
          rule_id?: string | null;
          title?: string;
          message?: string;
          severity?: AlertSeverity;
          is_read?: boolean;
          is_resolved?: boolean;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alerts_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alerts_warehouse_id_fkey";
            columns: ["warehouse_id"];
            referencedRelation: "warehouses";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          org_id: string | null;
          warehouse_id: string | null;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          org_id?: string | null;
          warehouse_id?: string | null;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          warehouse_id?: string | null;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          timestamp?: string;
        };
        Relationships: [];
      };
      payroll_runs: {
        Row: {
          id: string;
          org_id: string;
          month_year: string;
          period_start: string;
          period_end: string;
          status: "draft" | "processing" | "approved" | "paid" | "cancelled";
          total_gross: number;
          total_tax: number;
          total_pension: number;
          total_nhf: number;
          total_deductions: number;
          total_net: number;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          month_year: string;
          period_start: string;
          period_end: string;
          status?: "draft" | "processing" | "approved" | "paid" | "cancelled";
          total_gross?: number;
          total_tax?: number;
          total_pension?: number;
          total_nhf?: number;
          total_deductions?: number;
          total_net?: number;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          month_year?: string;
          period_start?: string;
          period_end?: string;
          status?: "draft" | "processing" | "approved" | "paid" | "cancelled";
          total_gross?: number;
          total_tax?: number;
          total_pension?: number;
          total_nhf?: number;
          total_deductions?: number;
          total_net?: number;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_runs_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      payslips: {
        Row: {
          id: string;
          payroll_run_id: string;
          profile_id: string;
          employee_name: string;
          employee_email: string;
          employee_role: string;
          bank_name: string | null;
          account_number: string | null;
          basic_salary: number;
          housing_allowance: number;
          transport_allowance: number;
          other_allowances: number;
          gross_pay: number;
          pension_employee: number;
          pension_employer: number;
          nhf_deduction: number;
          paye_tax: number;
          other_deductions: number;
          total_deductions: number;
          net_pay: number;
          payment_status: "pending" | "paid" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          payroll_run_id: string;
          profile_id: string;
          employee_name: string;
          employee_email: string;
          employee_role: string;
          bank_name?: string | null;
          account_number?: string | null;
          basic_salary?: number;
          housing_allowance?: number;
          transport_allowance?: number;
          other_allowances?: number;
          gross_pay?: number;
          pension_employee?: number;
          pension_employer?: number;
          nhf_deduction?: number;
          paye_tax?: number;
          other_deductions?: number;
          total_deductions?: number;
          net_pay?: number;
          payment_status?: "pending" | "paid" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payroll_run_id?: string;
          profile_id?: string;
          employee_name?: string;
          employee_email?: string;
          employee_role?: string;
          bank_name?: string | null;
          account_number?: string | null;
          basic_salary?: number;
          housing_allowance?: number;
          transport_allowance?: number;
          other_allowances?: number;
          gross_pay?: number;
          pension_employee?: number;
          pension_employer?: number;
          nhf_deduction?: number;
          paye_tax?: number;
          other_deductions?: number;
          total_deductions?: number;
          net_pay?: number;
          payment_status?: "pending" | "paid" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payslips_payroll_run_id_fkey";
            columns: ["payroll_run_id"];
            referencedRelation: "payroll_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payslips_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      crm_companies: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          industry: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crm_companies_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      crm_contacts: {
        Row: {
          id: string;
          org_id: string;
          company_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          job_title: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          company_id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          job_title?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          company_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          job_title?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crm_contacts_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "crm_companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_contacts_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      crm_deals: {
        Row: {
          id: string;
          org_id: string;
          company_id: string | null;
          contact_id: string | null;
          assigned_to: string | null;
          title: string;
          stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
          value: number;
          currency: string;
          expected_close_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          company_id?: string | null;
          contact_id?: string | null;
          assigned_to?: string | null;
          title: string;
          stage?: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
          value?: number;
          currency?: string;
          expected_close_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          company_id?: string | null;
          contact_id?: string | null;
          assigned_to?: string | null;
          title?: string;
          stage?: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
          value?: number;
          currency?: string;
          expected_close_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crm_deals_assigned_to_fkey";
            columns: ["assigned_to"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_deals_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "crm_companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey";
            columns: ["contact_id"];
            referencedRelation: "crm_contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_deals_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      crm_quotes: {
        Row: {
          id: string;
          org_id: string;
          deal_id: string | null;
          quote_number: string;
          status: "draft" | "sent" | "accepted" | "rejected" | "expired";
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          currency: string;
          valid_until: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          deal_id?: string | null;
          quote_number: string;
          status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          valid_until?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          deal_id?: string | null;
          quote_number?: string;
          status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          valid_until?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crm_quotes_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_quotes_deal_id_fkey";
            columns: ["deal_id"];
            referencedRelation: "crm_deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_quotes_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_auth_org_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      check_warehouse_permission: {
        Args: {
          w_id: string;
          roles: string[];
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      movement_type: MovementType;
      movement_status: MovementStatus;
      zone_type: ZoneType;
      alert_severity: AlertSeverity;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
