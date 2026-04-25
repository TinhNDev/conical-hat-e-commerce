"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { RatingStars } from "./rating-stars";
import { CatalogProduct, enrichProduct, formatPrice } from "@/lib/ecommerce";
import { useAppStore } from "@/store/app-store";
import { useToastStore } from "@/store/toast-store";

interface Props {
  product: CatalogProduct;
}

export const ProductCard = ({ product }: Props) => {
  const router = useRouter();
  const details = enrichProduct(product);
  const { auth, wishlist, toggleWishlist } = useAppStore();
  const { addToast } = useToastStore();
  const isWishlisted = wishlist.includes(product.id);
  const image = product.images?.[0];

  const onToggleWishlist = () => {
    if (!auth.isAuthenticated) {
      addToast({
        title: "Login required",
        description: "Sign in to save items to your wishlist.",
        variant: "error",
      });
      router.push(`/login?redirect=/products/${product.id}`);
      return;
    }

    void toggleWishlist(product.id);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
      <Link href={`/products/${product.id}`} className="relative block h-64 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 22rem, (min-width: 768px) 30rem, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100 text-stone-500">
            No image available
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700">
          {details.category}
        </div>
        {details.discountPercentage > 0 ? (
          <div className="absolute right-4 top-4 rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-900">
            {details.discountPercentage}% off
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/products/${product.id}`}
              className="mt-2 block font-display text-2xl leading-tight text-stone-950"
            >
              {product.name}
            </Link>
          </div>
          <button
            type="button"
            onClick={onToggleWishlist}
            className="rounded-full border border-stone-200 p-2 text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 ${isWishlisted ? "fill-current text-rose-500" : ""}`}
            />
          </button>
        </div>

        <p className="min-h-16 text-sm leading-6 text-stone-600">
          {details.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {details.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4">
          <RatingStars rating={details.rating} />
        </div>

        <div className="mt-auto flex items-center justify-between pt-6">
          <div>
            <p className="text-xl font-semibold text-stone-950">
              {formatPrice(details.price, details.currency)}
            </p>
          </div>
          <Button asChild className="rounded-full bg-stone-950 px-5 text-stone-50 hover:bg-stone-800">
            <Link href={`/products/${product.id}`}>Chi tiết sản phẩm</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
