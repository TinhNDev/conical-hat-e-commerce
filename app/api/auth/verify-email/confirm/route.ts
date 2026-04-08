import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };

    if (!body.token?.trim()) {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
    }

    await verifyEmailToken(body.token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify email.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
