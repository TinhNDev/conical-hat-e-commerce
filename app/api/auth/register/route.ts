import { NextResponse } from "next/server";
import { issueAuthSession, registerUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    if (!body.name?.trim() || !body.email?.trim() || !body.password?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!body.email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const user = await registerUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    const publicUser = await issueAuthSession({
      user,
      rememberMe: Boolean(body.rememberMe),
    });

    return NextResponse.json({ user: publicUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
