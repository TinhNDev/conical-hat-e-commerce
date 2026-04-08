import { NextResponse } from "next/server";
import { toggleWishlistItem } from "@/lib/account-data";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string;
    };

    if (!body.productId?.trim()) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const data = await toggleWishlistItem(body.productId);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update wishlist.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
