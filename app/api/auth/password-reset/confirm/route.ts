import { NextResponse } from "next/server";
import { consumePasswordResetToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; password?: string };

    if (!body.token?.trim() || !body.password?.trim()) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    await consumePasswordResetToken({
      token: body.token,
      password: body.password,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reset password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
