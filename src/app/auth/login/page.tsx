"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { WarehouseLogo } from "@/components/layout/WarehouseLogo";

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_USE_DEMO_SEED === "true";
const DEMO_EMAIL = "admin@bayline.ng";
const DEMO_PASSWORD = "demo1234";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Auto-fill in demo mode for convenience
  useEffect(() => {
    if (IS_DEMO_MODE) {
      setValue("email", DEMO_EMAIL);
      setValue("password", DEMO_PASSWORD);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);

    // Demo mode bypass: skip Supabase auth entirely
    if (IS_DEMO_MODE && data.email === DEMO_EMAIL) {
      router.push("/");
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      router.push("/");
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  const handleAutoFill = () => {
    setValue("email", DEMO_EMAIL);
    setValue("password", DEMO_PASSWORD);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 bg-[#111111] rounded-2xl mb-4 shadow-lg">
            <WarehouseLogo className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-[#111111] tracking-tight">
            Warehouse Dashboard
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Sign in to your account</p>
        </div>

        {/* Demo banner */}
        {IS_DEMO_MODE && (
          <div className="mb-5 flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-0.5">Demo Mode</p>
              <p className="text-xs text-blue-700">
                Email: <span className="font-mono font-semibold">{DEMO_EMAIL}</span>
                <br />
                Password: <span className="font-mono font-semibold">{DEMO_PASSWORD}</span>
              </p>
              <button
                type="button"
                onClick={handleAutoFill}
                className="mt-2 text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900 transition-colors"
              >
                Auto-fill credentials →
              </button>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#EEF0F2] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Server error */}
            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {serverError}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#111111] mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full h-10 px-3.5 text-sm bg-[#F9FAFB] border border-[#EEF0F2] rounded-xl text-[#111111] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111] transition-all"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#111111] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full h-10 px-3.5 text-sm bg-[#F9FAFB] border border-[#EEF0F2] rounded-xl text-[#111111] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111] transition-all"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full h-10 mt-2 bg-[#111111] hover:bg-[#222222] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
