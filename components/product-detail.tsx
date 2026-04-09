"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { RatingStars } from "./rating-stars";
import {
  CatalogProduct,
  enrichProduct,
  formatPrice,
  ProductReview,
} from "@/lib/ecommerce";
import { useAppStore } from "@/store/app-store";
import { useCartStore } from "@/store/cart-store";
import { useToastStore } from "@/store/toast-store";

interface Props {
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
  initialReviews: ProductReview[];
}

export const ProductDetail = ({ product, relatedProducts, initialReviews }: Props) => {
  const router = useRouter();
  const details = enrichProduct(product);
  const { items, addItem, updateQuantity } = useCartStore();
  const { auth, wishlist, toggleWishlist } = useAppStore();
  const { addToast } = useToastStore();
  const [activeImage, setActiveImage] = useState(product.images?.[0] ?? null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewError, setReviewError] = useState("");
  const [productReviews, setProductReviews] = useState(initialReviews);
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const isWishlisted = wishlist.includes(product.id);

  const onAddItem = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: details.price ?? 0,
      imageUrl: product.images?.[0] ?? null,
      quantity: 1,
    });
    addToast({
      title: "Added to cart",
      description: `${product.name} was added to your shopping cart.`,
      variant: "success",
    });
  };

  const onSubmitReview = () => {
    if (!auth.isAuthenticated || !auth.user) {
      setReviewError("Login is required before submitting a review.");
      addToast({
        title: "Login required",
        description: "Sign in to submit a review under your account.",
        variant: "error",
      });
      router.push(`/login?redirect=/products/${product.id}`);
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Review text is required.");
      return;
    }

    setReviewError("");
    fetch(`/api/products/${product.id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as { reviews?: ProductReview[]; error?: string };

        if (!response.ok || !payload.reviews) {
          throw new Error(payload.error ?? "Unable to submit review.");
        }

        setProductReviews(payload.reviews);
        addToast({
          title: "Review submitted",
          description: "Your rating and comment were added successfully.",
          variant: "success",
        });
        setReviewComment("");
        setReviewRating("5");
      })
      .catch((error: unknown) => {
        setReviewError(error instanceof Error ? error.message : "Unable to submit review.");
      });
  };

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
    <div className="space-y-10 pb-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100">
            {activeImage ? (
              <div className="relative h-[420px]">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            ) : (
              <div className="flex h-[420px] items-center justify-center text-stone-500">
                Product image unavailable
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(product.images ?? []).slice(0, 4).map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`relative overflow-hidden rounded-[1.25rem] border ${
                  activeImage === image ? "border-stone-950" : "border-stone-200"
                }`}
              >
                <div className="relative h-24">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="8rem"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-stone-500">
                {details.category}
              </p>
              <h1 className="mt-2 font-display text-4xl leading-tight text-stone-950">
                {product.name}
              </h1>
            </div>
            <button
              type="button"
              onClick={onToggleWishlist}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500"
            >
              <span className="inline-flex items-center gap-2">
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? "fill-current text-rose-500" : ""}`}
                />
                {isWishlisted ? "Saved" : "Save"}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <RatingStars rating={details.rating} />
            <span className="text-sm text-stone-500">
              {details.reviewCount} verified ratings
            </span>
            {details.discountPercentage > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
                {details.discountPercentage}% promotional discount
              </span>
            ) : null}
          </div>

          <p className="text-base leading-7 text-stone-700">{details.description}</p>
          <p className="text-3xl font-semibold text-stone-950">
            {formatPrice(details.price, details.currency)}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {details.tags.map((tag) => (
              <div
                key={tag}
                className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700"
              >
                {tag}
              </div>
            ))}
          </div>

          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => updateQuantity(product.id, Math.max(0, quantity - 1))}
              >
                -
              </Button>
              <span className="min-w-8 text-center text-lg font-semibold">{quantity}</span>
              <Button onClick={onAddItem}>+</Button>
              <Button
                asChild
                className="ml-auto rounded-full bg-stone-950 px-6 hover:bg-stone-800"
              >
                <Link href="/checkout">Go to checkout</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] p-6">
            <h2 className="text-lg font-semibold text-stone-950">
              Technical specifications
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {details.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3"
                >
                  <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-stone-900">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
          <h2 className="font-display text-3xl text-stone-950">
            Reviews & ratings
          </h2>
          <div className="mt-6 space-y-4">
            {productReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-stone-900">{review.author}</p>
                  <RatingStars rating={review.rating} className="text-sm" />
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-stone-950 p-6 text-stone-50">
          <h2 className="font-display text-3xl">
            Leave a review
          </h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-200">
              {auth.user ? `Reviewing as ${auth.user.name}` : "Login required to review"}
            </div>
            <select
              value={reviewRating}
              onChange={(event) => setReviewRating(event.target.value)}
              className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="What stood out about the product?"
              rows={5}
              className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-white outline-none"
            />
            {reviewError ? <p className="text-sm text-rose-300">{reviewError}</p> : null}
            <Button
              onClick={onSubmitReview}
              className="rounded-full bg-amber-200 px-6 text-stone-950 hover:bg-amber-100"
            >
              Submit review
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Related products
            </p>
            <h2 className="mt-2 font-display text-3xl text-stone-950">
              More from this collection
            </h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-stone-700 underline-offset-4 hover:underline">
            Browse all products
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {relatedProducts.map((relatedProduct) => {
            const related = enrichProduct(relatedProduct);
            const image = relatedProduct.images?.[0];

            return (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.id}`}
                className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.1)]"
              >
                <div className="relative h-56">
                  {image ? (
                    <Image
                      src={image}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-100 text-stone-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    {related.category}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-stone-950">
                    {relatedProduct.name}
                  </h3>
                  <p className="mt-3 text-sm text-stone-600">
                    {formatPrice(related.price, related.currency)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
