import { NextResponse } from "next/server";
import { clearAuthCookies, getRefreshTokenFromCookies, revokeRefreshToken } from "@/lib/auth";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();
  await revokeRefreshToken(refreshToken);
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
