import { NextResponse } from "next/server";
import { getAccountData } from "@/lib/account-data";

export async function GET() {
  try {
    const data = await getAccountData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load account data.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
