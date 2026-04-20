import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const userRole = request.cookies.get("role")?.value; // 'admin', 'staff', 'user'

  const { pathname } = request.nextUrl;

  // 1. Protect Admin routes
  if (pathname.startsWith("/admin")) {
    if (!sessionToken || userRole !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. Protect Staff routes
  if (pathname.startsWith("/staff")) {
    if (!sessionToken || (userRole !== "staff" && userRole !== "admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Prevent logged in users from visiting auth pages
  if (sessionToken && (pathname === "/login" || pathname === "/register")) {
    if (userRole === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (userRole === "staff") return NextResponse.redirect(new URL("/staff/dashboard", request.url));
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // 4. Protect User App routes
  const protectedUserRoutes = ["/home", "/matches", "/wallet", "/profile"];
  if (protectedUserRoutes.some(route => pathname.startsWith(route))) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/home/:path*",
    "/matches/:path*",
    "/wallet/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
