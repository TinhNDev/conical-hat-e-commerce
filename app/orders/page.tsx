"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/ecommerce";
import { useAppStore } from "@/store/app-store";

export default function OrdersPage() {
  const { orders } = useAppStore();

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
          Order history
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Track every order placed in the demo
        </h1>
      </section>

      {orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[1.75rem] border border-stone-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                    {order.id}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                </div>
                <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
                  {order.status}
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm text-stone-700">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-4 text-sm">
                <span>Payment: {order.paymentMethod.toUpperCase()}</span>
                <span className="font-semibold text-stone-950">
                  Total: {formatPrice(order.total)}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
          <h2 className="font-display text-4xl text-stone-950">
            No orders yet
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Place an order from checkout to populate this history.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white"
          >
            Start shopping
          </Link>
        </div>
      )}
    </div>
  );
}
