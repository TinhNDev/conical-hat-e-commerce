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

export const ProductDetail = ({
  product,
  relatedProducts,
  initialReviews,
}: Props) => {
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
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng.`,
      variant: "success",
    });
  };

  const onSubmitReview = () => {
    if (!auth.isAuthenticated || !auth.user) {
      setReviewError("Vui lòng đăng nhập trước khi gửi đánh giá.");

      addToast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để gửi đánh giá bằng tài khoản của bạn.",
        variant: "error",
      });

      router.push(`/login?redirect=/products/${product.id}`);
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Nội dung đánh giá không được để trống.");
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
        const payload = (await response.json()) as {
          reviews?: ProductReview[];
          error?: string;
        };

        if (!response.ok || !payload.reviews) {
          throw new Error(payload.error ?? "Không thể gửi đánh giá.");
        }

        setProductReviews(payload.reviews);

        addToast({
          title: "Đã gửi đánh giá",
          description: "Đánh giá và bình luận của bạn đã được thêm thành công.",
          variant: "success",
        });

        setReviewComment("");
        setReviewRating("5");
      })
      .catch((error: unknown) => {
        setReviewError(
          error instanceof Error ? error.message : "Không thể gửi đánh giá.",
        );
      });
  };

  const onToggleWishlist = () => {
    if (!auth.isAuthenticated) {
      addToast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để lưu sản phẩm yêu thích.",
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
                Chưa có hình ảnh sản phẩm
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
                  className={`h-4 w-4 ${
                    isWishlisted ? "fill-current text-rose-500" : ""
                  }`}
                />
                {isWishlisted ? "Đã lưu" : "Lưu"}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <RatingStars rating={details.rating} />

            <span className="text-sm text-stone-500">
              {details.reviewCount} đánh giá đã xác thực
            </span>

            {details.discountPercentage > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
                Giảm {details.discountPercentage}% khuyến mãi
              </span>
            ) : null}
          </div>

          <p className="text-base leading-7 text-stone-700">
            {details.description}
          </p>

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
                onClick={() =>
                  updateQuantity(product.id, Math.max(0, quantity - 1))
                }
              >
                -
              </Button>

              <span className="min-w-8 text-center text-lg font-semibold">
                {quantity}
              </span>

              <Button onClick={onAddItem}>+</Button>

              <Button
                asChild
                className="ml-auto rounded-full bg-stone-950 px-6 hover:bg-stone-800"
              >
                <Link href="/checkout">Thanh toán</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] p-6">
            <h2 className="text-lg font-semibold text-stone-950">
              Thông số kỹ thuật
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
            Đánh giá sản phẩm
          </h2>

          <div className="mt-6 space-y-4">
            {productReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-stone-900">
                    {review.author}
                  </p>

                  <RatingStars rating={review.rating} className="text-sm" />
                </div>

                <p className="mt-3 text-sm leading-6 text-stone-700">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>

<div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] p-6 text-stone-950">
  <h2 className="font-display text-3xl">Viết đánh giá</h2>

  <div className="mt-6 space-y-4">
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
      {auth.user
        ? `Đang đánh giá với tên ${auth.user.name}`
        : "Vui lòng đăng nhập để đánh giá"}
    </div>

    <select
      value={reviewRating}
      onChange={(event) => setReviewRating(event.target.value)}
      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400"
    >
      <option value="5">5 sao</option>
      <option value="4">4 sao</option>
      <option value="3">3 sao</option>
      <option value="2">2 sao</option>
      <option value="1">1 sao</option>
    </select>

    <textarea
      value={reviewComment}
      onChange={(event) => setReviewComment(event.target.value)}
      placeholder="Bạn thích điểm nào ở sản phẩm này?"
      rows={5}
      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
    />

    {reviewError ? (
      <p className="text-sm text-rose-600">{reviewError}</p>
    ) : null}

    <Button
      onClick={onSubmitReview}
      className="rounded-full bg-stone-950 px-6 text-white hover:bg-stone-800"
    >
      Gửi đánh giá
    </Button>
  </div>
</div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Sản phẩm liên quan
            </p>

            <h2 className="mt-2 font-display text-3xl text-stone-950">
              Sản phẩm cùng bộ sưu tập
            </h2>
          </div>

          <Link
            href="/products"
            className="text-sm font-medium text-stone-700 underline-offset-4 hover:underline"
          >
            Xem tất cả sản phẩm
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
                      Chưa có hình ảnh
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