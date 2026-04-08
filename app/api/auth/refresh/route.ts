import { NextResponse } from "next/server";
import { getRefreshTokenFromCookies, rotateRefreshToken } from "@/lib/auth";

export async function POST() {
  const user = await rotateRefreshToken(await getRefreshTokenFromCookies());

  if (!user) {
    return NextResponse.json({ error: "Refresh token is invalid or expired." }, { status: 401 });
  }

  return NextResponse.json({ user });
}
