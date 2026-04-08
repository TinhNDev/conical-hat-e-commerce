import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from "@/lib/auth-session";

const adminPaths = ["/admin"];
const authenticatedPaths = ["/dashboard", "/orders", "/checkout"];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requiresAdminAccess = adminPaths.some((path) => pathname.startsWith(path));
  const requiresAuthenticatedAccess =
    requiresAdminAccess ||
    authenticatedPaths.some((path) => pathname.startsWith(path));

  if (!requiresAuthenticatedAccess) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const user = await verifyAccessToken(token);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (requiresAdminAccess && user.role !== "admin" && user.role !== "manager") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/orders/:path*", "/checkout/:path*"],
};
