"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export const HeroActions = () => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Button
        asChild
        size="lg"
        className="h-12 rounded-full bg-[#8f5f2a] px-7 text-sm uppercase tracking-[0.2em] text-stone-50 hover:bg-[#7a5124]"
      >
        <Link href="/products">Shop The Collection</Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="h-12 rounded-full border-stone-400 bg-white/70 px-7 text-sm uppercase tracking-[0.2em] text-stone-900 hover:bg-white"
      >
        <Link href="/checkout">View Cart</Link>
      </Button>
    </div>
  );
};
