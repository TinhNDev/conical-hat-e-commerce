import { NextResponse } from "next/server";
import { authenticateUser, issueAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    if (!body.email?.trim() || !body.password?.trim()) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await authenticateUser({
      email: body.email,
      password: body.password,
    });

    const publicUser = await issueAuthSession({
      user,
      rememberMe: Boolean(body.rememberMe),
    });

    return NextResponse.json({ user: publicUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to login.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
