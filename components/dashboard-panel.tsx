"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { formatPrice } from "@/lib/ecommerce";
import { useAppStore } from "@/store/app-store";

export const DashboardPanel = () => {
  const { auth, wishlist, orders, logout, refreshSession } = useAppStore();
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  useEffect(() => {
    if (auth.isLoading) {
      void refreshSession();
    }
  }, [auth.isLoading, refreshSession]);

  if (auth.isLoading) {
    return (
      <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
        <h1 className="font-display text-4xl text-stone-950">Loading dashboard</h1>
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
        <h1 className="font-display text-4xl text-stone-950">Dashboard locked</h1>
        <p className="mt-3 text-sm text-stone-600">
          Login or register to access the user dashboard and order history.
        </p>
        <Button asChild className="mt-6 rounded-full bg-stone-950 hover:bg-stone-800">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
          User dashboard
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Welcome, {auth.user.name}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">
          This dashboard summarizes your backend-authenticated account state, wishlist
          items, and order activity.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Student ID", value: auth.user.studentId },
          { label: "Role", value: auth.user.role },
          { label: "Saved items", value: wishlist.length.toString() },
          { label: "Total spent", value: formatPrice(totalSpent) },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[1.75rem] border border-stone-200 bg-white p-5"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-stone-950">Account snapshot</h2>
          <div className="mt-4 space-y-3 text-sm text-stone-700">
            <p>Email: {auth.user.email}</p>
            <p>Authenticated via backend session cookies.</p>
            <p>Orders placed: {orders.length}</p>
          </div>
          <Button onClick={() => void logout()} variant="outline" className="mt-6 rounded-full">
            Logout
          </Button>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-stone-950 p-6 text-stone-50">
          <h2 className="text-2xl font-semibold">Quick links</h2>
          <div className="mt-4 flex flex-col gap-3">
            {auth.user.role === "admin" ? (
              <Link href="/admin" className="rounded-full border border-stone-700 px-4 py-3 text-sm">
                Open admin panel
              </Link>
            ) : null}
            <Link href="/orders" className="rounded-full border border-stone-700 px-4 py-3 text-sm">
              View order history
            </Link>
            <Link href="/products" className="rounded-full border border-stone-700 px-4 py-3 text-sm">
              Continue shopping
            </Link>
            <Link href="/search" className="rounded-full border border-stone-700 px-4 py-3 text-sm">
              Search catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
