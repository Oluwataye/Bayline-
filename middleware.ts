import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_ROUTES = [
  "/",
  "/inventory",
  "/movements",
  "/alerts",
  "/reports",
  "/settings",
  "/payroll",
  "/crm",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth routes through unconditionally
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // In demo mode, bypass auth entirely
  const isDemoMode = process.env.NEXT_PUBLIC_USE_DEMO_SEED === "true";
  if (isDemoMode) {
    return await updateSession(request);
  }

  // Check if the path is protected
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(route))
  );

  if (!isProtected) {
    return await updateSession(request);
  }

  // Run session update (this also validates the session via Supabase)
  const response = await updateSession(request);

  // If Supabase is using placeholder keys, updateSession already passes through.
  // For live mode: check if there's a Supabase session cookie present.
  // The updateSession helper handles the actual auth check in live mode.
  // We additionally check for session cookies to redirect unauthenticated users.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isLiveMode =
    supabaseUrl &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseUrl.includes("your-project");

  if (isLiveMode) {
    // Look for any sb- auth cookie indicating a valid session
    const hasSession = request.cookies.getAll().some((c) =>
      c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    if (!hasSession) {
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
