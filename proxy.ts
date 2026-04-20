import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const userRole = request.cookies.get("role")?.value;

  const { pathname } = request.nextUrl;

  // 1. Protect Admin routes — but allow /admin/login publicly
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!sessionToken || userRole !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 2. Protect Staff routes — but allow /staff/login publicly
  if (pathname.startsWith("/staff") && pathname !== "/staff/login") {
    if (!sessionToken || (userRole !== "staff" && userRole !== "admin")) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
  }

  // 3. Prevent already-logged-in users from revisiting auth pages
  if (sessionToken && (pathname === "/login" || pathname === "/register")) {
    if (userRole === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (userRole === "staff") return NextResponse.redirect(new URL("/staff/dashboard", request.url));
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // 4. Redirect already-logged-in admins/staff away from their respective login pages
  if (sessionToken && pathname === "/admin/login") {
    if (userRole === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (sessionToken && pathname === "/staff/login") {
    if (userRole === "staff" || userRole === "admin") return NextResponse.redirect(new URL("/staff/dashboard", request.url));
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. Protect Player App routes
  const protectedUserRoutes = ["/home", "/matches", "/wallet", "/profile", "/rank"];
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
    "/rank",
    "/rank/:path*",
    "/login",
    "/register",
  ],
};
