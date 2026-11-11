"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_USE_DEMO_SEED === "true";

const DEMO_USER: UserProfile = {
  id: "demo-1",
  name: "Admin",
  email: "admin@bayline.ng",
  role: "super_admin",
  organizationId: "org-1",
};

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(IS_DEMO_MODE ? DEMO_USER : null);
  const [isLoading, setIsLoading] = useState(!IS_DEMO_MODE);

  useEffect(() => {
    if (IS_DEMO_MODE) return;

    const supabase = createClient();

    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name as string ?? session.user.email ?? "User",
          email: session.user.email ?? "",
          role: (session.user.user_metadata?.role as UserProfile["role"]) ?? "viewer",
          avatarUrl: session.user.user_metadata?.avatar_url as string | undefined,
          organizationId: session.user.user_metadata?.organization_id as string ?? "",
        });
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name as string ?? session.user.email ?? "User",
          email: session.user.email ?? "",
          role: (session.user.user_metadata?.role as UserProfile["role"]) ?? "viewer",
          avatarUrl: session.user.user_metadata?.avatar_url as string | undefined,
          organizationId: session.user.user_metadata?.organization_id as string ?? "",
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    if (IS_DEMO_MODE) {
      router.push("/auth/login");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
