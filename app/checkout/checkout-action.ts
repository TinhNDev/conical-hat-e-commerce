"use server";

import { stripe } from "@/lib/stripe";
import { CartItem } from "@/store/cart-store";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const getBaseUrl = async () => {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (configuredBaseUrl) {
    try {
      return new URL(configuredBaseUrl).origin;
    } catch {
      // Fall back to request headers when the configured value is malformed.
    }
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    throw new Error(
      "Unable to determine the application URL. Set NEXT_PUBLIC_BASE_URL to an absolute URL."
    );
  }

  return `${protocol}://${host}`;
};

export const checkoutAction = async (formData: FormData): Promise<void> => {
  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson);
  const baseUrl = await getBaseUrl();
  const line_items = items.map((item: CartItem) => ({
    price_data: {
      currency: "cad",
      product_data: { name: item.name },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${baseUrl}/success`,
    cancel_url: `${baseUrl}/checkout`,
  });

  redirect(session.url!);
};
