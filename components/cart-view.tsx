"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { DISCOUNT_CODES, formatPrice } from "@/lib/ecommerce";
import { useCartStore } from "@/store/cart-store";
import { useToastStore } from "@/store/toast-store";

export const CartView = () => {
  const {
    items,
    discountCode,
    discountPercentage,
    applyDiscountCode,
    clearDiscount,
    removeItem,
    updateQuantity,
  } = useCartStore();
  const { addToast } = useToastStore();
  const [feedback, setFeedback] = useState("");
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const total = subtotal - discountAmount;

  const onApplyCode = (formData: FormData) => {
    const result = applyDiscountCode(String(formData.get("code") ?? ""));
    setFeedback(result.message);
    addToast({
      title: result.success ? "Discount applied" : "Discount error",
      description: result.message,
      variant: result.success ? "success" : "error",
    });
  };

  if (!items.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
        <h1 className="font-display text-4xl text-stone-950">
          Your cart is empty
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Add a few products to start testing the cart, discount, and checkout
          flow.
        </p>
        <Button asChild className="mt-6 rounded-full bg-stone-950 hover:bg-stone-800">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid gap-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 sm:grid-cols-[120px_1fr]"
          >
            <div className="relative h-32 overflow-hidden rounded-[1.25rem] bg-stone-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-500">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-stone-950">{item.name}</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, 0)}
                  className="text-sm font-medium text-rose-600"
                >
                  Remove
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => removeItem(item.id)}
                  className="rounded-full"
                >
                  -
                </Button>
                <span className="min-w-8 text-center text-lg font-semibold">
                  {item.quantity}
                </span>
                <Button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="rounded-full"
                >
                  +
                </Button>
                <p className="ml-auto text-lg font-semibold text-stone-950">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="space-y-5">
        <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Discount code
          </p>
          <form action={onApplyCode} className="mt-4 space-y-3">
            <input
              type="text"
              name="code"
              placeholder="Try SAVE10, WELCOME15, STUDENT20"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none"
            />
            <div className="flex gap-3">
              <Button type="submit" className="rounded-full bg-stone-950 hover:bg-stone-800">
                Apply code
              </Button>
              {discountCode ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={clearDiscount}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </form>
          <p className="mt-4 text-sm text-stone-600">
            Available demo codes: {Object.keys(DISCOUNT_CODES).join(", ")}
          </p>
          {discountCode ? (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              {discountCode} applied for {discountPercentage}% off.
            </p>
          ) : feedback ? (
            <p className="mt-2 text-sm text-rose-600">{feedback}</p>
          ) : null}
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-stone-950 p-6 text-stone-50">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
            Order summary
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between border-t border-stone-800 pt-3 text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button asChild className="mt-6 w-full rounded-full bg-amber-200 text-stone-950 hover:bg-amber-100">
            <Link href="/checkout">Continue to checkout</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
};
