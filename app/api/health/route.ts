import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "conical-hat-e-commerce",
    layer: "nextjs-backend",
    timestamp: new Date().toISOString(),
  });
}
