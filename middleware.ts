import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ROLE_COOKIE } from "@/lib/auth-shared";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;

  if (role !== "admin") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
