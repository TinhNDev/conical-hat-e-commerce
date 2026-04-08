import { NextResponse } from "next/server";
import { createOrderForCurrentUser } from "@/lib/account-data";
import { ShippingAddress, OrderRecord } from "@/lib/ecommerce";
import { CartItem } from "@/store/cart-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: CartItem[];
      discountAmount?: number;
      total?: number;
      paymentMethod?: OrderRecord["paymentMethod"];
      shippingAddress?: ShippingAddress;
    };

    if (!body.items?.length || typeof body.discountAmount !== "number" || typeof body.total !== "number" || !body.paymentMethod || !body.shippingAddress) {
      return NextResponse.json({ error: "Order payload is incomplete." }, { status: 400 });
    }

    const order = await createOrderForCurrentUser({
      items: body.items,
      discountAmount: body.discountAmount,
      total: body.total,
      paymentMethod: body.paymentMethod,
      shippingAddress: body.shippingAddress,
    });

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
