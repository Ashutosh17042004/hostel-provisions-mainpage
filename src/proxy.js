import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const ROUTE_ROLES = {
  "/AdminDashboard": "admin",
  "/UserPage": "user",
};

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const home = NextResponse.redirect(new URL("/", request.url));

  const token = request.cookies.get("auth")?.value;
  if (!token) return home;

  const decoded = verifyToken(token);
  if (!decoded) return home;

  const requiredRole = ROUTE_ROLES[pathname];
  if (requiredRole && decoded.role !== requiredRole) return home;

  return NextResponse.next();
}

export const config = {
  matcher: ["/AdminDashboard", "/UserPage"],
};
