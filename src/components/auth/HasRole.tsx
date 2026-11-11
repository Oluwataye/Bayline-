"use client";

import React, { useState, useEffect } from "react";
import { UserRole } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_USE_DEMO_SEED === "true";

interface HasRoleProps {
  role: UserRole | UserRole[];
  warehouseId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Guards its children behind a role check.
 *
 * Demo mode: always renders children (no network calls).
 * Live mode: checks the warehouse_members table for the current user's role.
 */
export function HasRole({ role, warehouseId, fallback = null, children }: HasRoleProps) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(IS_DEMO_MODE);

  useEffect(() => {
    if (IS_DEMO_MODE) {
      setHasAccess(true);
      return;
    }

    if (!user) {
      setHasAccess(false);
      return;
    }

    const allowedRoles = Array.isArray(role) ? role : [role];

    // If no warehouseId is specified, check the user's top-level role from AuthContext
    if (!warehouseId) {
      setHasAccess(allowedRoles.includes(user.role));
      return;
    }

    // For warehouse-scoped checks, query the warehouse_members table
    const supabase = createClient();
    supabase
      .from("warehouse_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("warehouse_id", warehouseId)
      .maybeSingle()
      .then(({ data }) => {
        if (data && allowedRoles.includes(data.role as UserRole)) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      });
  }, [user, role, warehouseId]);

  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
}
