import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };

    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const token = await createPasswordResetToken(body.email);

    return NextResponse.json({
      ok: true,
      token,
      message: "Password reset token generated. Send this token via your email provider.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create password reset token.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
