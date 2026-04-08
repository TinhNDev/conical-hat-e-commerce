"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useCartStore } from "@/store/cart-store";
import { useAppStore } from "@/store/app-store";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/search", label: "Search" },
  { href: "/admin", label: "Admin" },
  { href: "/blog", label: "Blog / FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCartStore();
  const { auth } = useAppStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,247,242,0.92)_100%)] backdrop-blur-xl transition-colors duration-300 dark:border-stone-800 dark:bg-[linear-gradient(180deg,rgba(17,24,39,0.96)_0%,rgba(10,10,10,0.92)_100%)]">
      <div className="border-b border-stone-200/70 bg-stone-950 text-stone-100 dark:border-stone-800">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-300">
          <p>Curated storefront experience</p>
          <div className="hidden gap-6 sm:flex">
            <span>Stripe-ready checkout</span>
            <span>Wishlist and dashboard</span>
          </div>
        </div>
      </div>

      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl shadow-[0_12px_24px_rgba(23,23,23,0.18)]">
              <Image
                src="/atelier-logo.svg"
                alt="Atelier Store logo"
                fill
                className="object-cover"
                sizes="48px"
                priority
              />
            </div>
            <div>
              <p className="font-display text-3xl leading-none text-stone-950 dark:text-stone-100 sm:text-[2.15rem]">
                Atelier Store
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-stone-500 dark:text-stone-400 sm:text-[13px]">
                Modern curated commerce
              </p>
            </div>
          </Link>

          <div className="hidden rounded-full border border-stone-200 bg-white/80 px-3 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-stone-700 dark:bg-stone-900/80 lg:flex lg:items-center lg:gap-1">
            {navLinks
              .filter((link) => (link.href === "/admin" ? auth.user?.role === "admin" || auth.user?.role === "manager" : true))
              .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-[15px] font-medium text-stone-700 transition hover:bg-stone-950 hover:text-white dark:text-stone-200 dark:hover:bg-stone-100 dark:hover:text-stone-950"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/search"
              className="rounded-full border border-stone-200 bg-white/80 p-2.5 text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100 dark:hover:border-stone-500 dark:hover:text-white"
              aria-label="Search products"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="relative rounded-full border border-stone-200 bg-white/80 p-2.5 text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100 dark:hover:border-stone-500 dark:hover:text-white"
              aria-label="Shopping cart"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <Link
              href={auth.isAuthenticated ? "/dashboard" : "/login"}
              className="hidden rounded-full bg-stone-950 px-5 py-2.5 text-[15px] font-medium text-white shadow-[0_12px_24px_rgba(23,23,23,0.16)] transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 sm:inline-flex"
            >
              {auth.isAuthenticated ? "Dashboard" : "Login"}
            </Link>
            <Button
              variant="ghost"
              className="rounded-full border border-stone-200 bg-white/80 p-2.5 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100 lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="mt-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:border-stone-700 dark:bg-stone-950 lg:hidden">
            <div className="grid gap-2">
              {navLinks
                .filter((link) => (link.href === "/admin" ? auth.user?.role === "admin" || auth.user?.role === "manager" : true))
                .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/cart"
                className="rounded-2xl px-4 py-3 text-base font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-900"
                onClick={() => setMobileOpen(false)}
              >
                Cart
              </Link>
              <Link
                href={auth.isAuthenticated ? "/dashboard" : "/login"}
                className="rounded-2xl bg-stone-950 px-4 py-3 text-base font-medium text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                onClick={() => setMobileOpen(false)}
              >
                {auth.isAuthenticated ? "Dashboard" : "Login"}
              </Link>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
};
