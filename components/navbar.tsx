"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useCartStore } from "@/store/cart-store";
import { useAppStore } from "@/store/app-store";

const quickSearchSuggestions = [
  "work essentials",
  "minimal",
  "travel",
  "premium",
  "studio",
  "duoi 500.000 vnd",
];

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/admin", label: "Admin" },
  { href: "/blog", label: "Blog / FAQ" },
  { href: "/contact", label: "Liên hệ" },
  { href: "/about", label: "Về chúng tôi" },
];

export const Navbar = () => {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickSearchTerm, setQuickSearchTerm] = useState("");
  const { items } = useCartStore();
  const { auth } = useAppStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const trimmedQuickSearchTerm = quickSearchTerm.trim();
  const highlightedSuggestions = useMemo(
    () =>
      quickSearchSuggestions.filter((item) =>
        trimmedQuickSearchTerm
          ? item.toLowerCase().includes(trimmedQuickSearchTerm.toLowerCase())
          : true
      ),
    [trimmedQuickSearchTerm]
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    searchInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen]);

  const submitQuickSearch = (value: string) => {
    const nextValue = value.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    setQuickSearchTerm(nextValue);
    router.push(
      nextValue ? `/products?q=${encodeURIComponent(nextValue)}` : "/products"
    );
  };

  const handleSearchButtonClick = () => {
    if (!searchOpen) {
      setSearchOpen(true);
      setMobileOpen(false);
      return;
    }

    if (trimmedQuickSearchTerm) {
      submitQuickSearch(trimmedQuickSearchTerm);
      return;
    }

    searchInputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,247,242,0.92)_100%)] backdrop-blur-xl transition-colors duration-300 dark:border-stone-800 dark:bg-[linear-gradient(180deg,rgba(17,24,39,0.96)_0%,rgba(10,10,10,0.92)_100%)]">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl shadow-[0_12px_24px_rgba(23,23,23,0.18)]">
              <Image
                src="/atelier-logo.svg"
                alt="LUMI logo"
                fill
                className="object-cover"
                sizes="48px"
                priority
              />
            </div>
            <div>
              <p className="font-display text-3xl leading-none text-stone-950 dark:text-stone-100 sm:text-[2.15rem]">
                LUMI
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
                className="rounded-full px-4 py-2 text-[15px] font-medium text-stone-700 transition hover:bg-[#8f5f2a] hover:text-white dark:text-stone-200 dark:hover:bg-stone-100 dark:hover:text-stone-950"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitQuickSearch(quickSearchTerm);
              }}
              className={`hidden items-center overflow-hidden rounded-full border bg-white/85 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 dark:bg-stone-900/85 sm:flex ${
                searchOpen
                  ? "w-[min(26rem,42vw)] border-stone-400 pr-2 dark:border-stone-500"
                  : "w-11 border-stone-200 dark:border-stone-700"
              }`}
            >
              <button
                type="button"
                onClick={handleSearchButtonClick}
                className="flex h-11 w-11 flex-none items-center justify-center text-stone-700 transition hover:text-stone-950 dark:text-stone-100 dark:hover:text-white"
                aria-label={searchOpen ? "Submit search" : "Open search"}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              <div
                className={`flex items-center gap-2 transition-all duration-300 ${
                  searchOpen ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
              >
                <input
                  ref={searchInputRef}
                  value={quickSearchTerm}
                  onChange={(event) => setQuickSearchTerm(event.target.value)}
                  placeholder="Tìm kiếm sản phẩm"
                  className="w-full bg-transparent py-2 text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
                />
                {trimmedQuickSearchTerm ? (
                  <button
                    type="submit"
                    className="rounded-full bg-[#8f5f2a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#7a5124] dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                  >
                    Go
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setQuickSearchTerm("");
                    setSearchOpen(false);
                  }}
                  className="rounded-full p-1.5 text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="Close search"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </form>

            <button
              type="button"
              onClick={() => {
                setSearchOpen((value) => !value);
                setMobileOpen(false);
              }}
              className="rounded-full border border-stone-200 bg-white/80 p-2.5 text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100 dark:hover:border-stone-500 dark:hover:text-white sm:hidden"
              aria-label="Search products"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
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
              className="hidden rounded-full bg-[#8f5f2a] px-5 py-2.5 text-[15px] font-medium text-white shadow-[0_12px_24px_rgba(143,95,42,0.18)] transition hover:bg-[#7a5124] dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 sm:inline-flex"
            >
              {auth.isAuthenticated ? "Dashboard" : "Đăng Nhập"}
            </Link>
            <Button
              variant="ghost"
              className="rounded-full border border-stone-200 bg-white/80 p-2.5 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100 lg:hidden"
              onClick={() => {
                setMobileOpen((prev) => !prev);
                setSearchOpen(false);
              }}
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
                className="rounded-2xl bg-[#8f5f2a] px-4 py-3 text-base font-medium text-white transition hover:bg-[#7a5124] dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                onClick={() => setMobileOpen(false)}
              >
                {auth.isAuthenticated ? "Dashboard" : "Login"}
              </Link>
            </div>
          </div>
        ) : null}
        {searchOpen ? (
          <div className="mt-4 space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:border-stone-700 dark:bg-stone-950 sm:hidden">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitQuickSearch(quickSearchTerm);
              }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 rounded-[1.25rem] border border-stone-300 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
                <MagnifyingGlassIcon className="h-5 w-5 flex-none text-stone-400" />
                <input
                  ref={searchInputRef}
                  value={quickSearchTerm}
                  onChange={(event) => setQuickSearchTerm(event.target.value)}
                  placeholder="Search products or styles"
                  className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100"
                />
                {trimmedQuickSearchTerm ? (
                  <button
                    type="submit"
                    className="rounded-full bg-[#8f5f2a] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#7a5124] dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                  >
                    Go
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setQuickSearchTerm("");
                    setSearchOpen(false);
                  }}
                  className="text-stone-500 dark:text-stone-400"
                  aria-label="Close search"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {highlightedSuggestions.slice(0, 4).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => submitQuickSearch(term)}
                    className="rounded-full border border-stone-300 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:text-stone-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>
        ) : null}
      </nav>
    </header>
  );
};
