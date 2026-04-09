"use client";

import { useEffect, useMemo, useState, useDeferredValue, startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./product-card";
import { CatalogProduct, enrichProduct } from "@/lib/ecommerce";

interface Props {
  products: CatalogProduct[];
  initialSearchTerm?: string;
  initialCategory?: string;
}

const PAGE_SIZE = 6;

export const ProductList = ({
  products,
  initialSearchTerm = "",
  initialCategory = "all",
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [category, setCategory] = useState(initialCategory);
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const productDetails = useMemo(
    () => products.map((product) => ({ product, details: enrichProduct(product) })),
    [products]
  );

  const categories = useMemo(
    () => Array.from(new Set(productDetails.map(({ details }) => details.category))),
    [productDetails]
  );

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const normalizedTerm = searchTerm.trim();

    if (normalizedTerm) {
      nextParams.set("q", normalizedTerm);
    } else {
      nextParams.delete("q");
    }

    if (category !== "all") {
      nextParams.set("category", category);
    } else {
      nextParams.delete("category");
    }

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) {
      return;
    }

    startTransition(() => {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    });
  }, [category, pathname, router, searchParams, searchTerm]);

  const filteredProducts = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();

    const filtered = productDetails.filter(({ details }) => {
      const matchesTerm =
        !term ||
        details.name.toLowerCase().includes(term) ||
        details.description.toLowerCase().includes(term) ||
        details.tags.some((tag) => tag.toLowerCase().includes(term));

      const matchesCategory = category === "all" || details.category === category;

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under-500k" && (details.price ?? 0) < 500_000_00) ||
        (priceFilter === "500k-1m" &&
          (details.price ?? 0) >= 500_000_00 &&
          (details.price ?? 0) <= 1_000_000_00) ||
        (priceFilter === "above-1m" && (details.price ?? 0) > 1_000_000_00);

      const matchesRating =
        ratingFilter === "all" ||
        details.rating >= Number(ratingFilter.replace("+", ""));

      return matchesTerm && matchesCategory && matchesPrice && matchesRating;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.details.price ?? 0) - (b.details.price ?? 0);
        case "price-desc":
          return (b.details.price ?? 0) - (a.details.price ?? 0);
        case "rating":
          return b.details.rating - a.details.rating;
        case "name":
          return a.details.name.localeCompare(b.details.name);
        default:
          return Number(b.details.featured) - Number(a.details.featured);
      }
    });

    return filtered;
  }, [category, deferredSearchTerm, priceFilter, productDetails, ratingFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const onFilterChange = (callback: () => void) => {
    callback();
    setPage(1);
  };

return (
  <div className="space-y-8">
    <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(250,247,242,0.96)_0%,rgba(233,244,238,0.96)_54%,rgba(246,239,226,0.96)_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.4fr_0.6fr] lg:px-8 lg:py-8">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              Khám phá nón lá
            </p>
            <h2 className="font-display text-4xl leading-none text-stone-950">
              Tìm chiếc nón lá phù hợp với bạn
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-stone-600">
              Tìm theo tên, chất liệu hoặc phong cách, sau đó lọc theo danh mục,
              giá và đánh giá để dễ dàng lựa chọn chiếc nón phù hợp nhất.
            </p>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Tìm kiếm
            </span>
            <div className="mt-3 flex items-center gap-3 rounded-[1.6rem] border border-stone-300/80 bg-white/90 px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 flex-none text-stone-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
                <circle cx="11" cy="11" r="6.25" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  onFilterChange(() => setSearchTerm(event.target.value))
                }
                placeholder="Tìm nón lá, chất liệu, kiểu dáng..."
                className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />
            </div>
          </label>
        </div>

        <div className="grid gap-3 rounded-[1.7rem] border border-white/70 bg-white/70 p-4 backdrop-blur">
          <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,#8f5f2a_0%,#6f7f59_100%)] px-4 py-4 text-white shadow-[0_18px_40px_rgba(143,95,42,0.2)]">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-300">
              Sản phẩm hiện có
            </p>
            <p className="mt-2 text-3xl font-semibold">{filteredProducts.length}</p>
            <p className="mt-1 text-sm text-stone-300">
              sản phẩm phù hợp
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-stone-700">
            <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                Danh mục
              </p>
              <p className="mt-1 text-lg font-semibold text-stone-950">
                {categories.length}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">
                Trang hiện tại
              </p>
              <p className="mt-1 text-lg font-semibold text-stone-950">
                {currentPage}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200/80 bg-white/70 px-6 py-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Tìm kiếm
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                onFilterChange(() => setSearchTerm(event.target.value))
              }
              placeholder="Nhập từ khóa..."
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-stone-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Danh mục
            </span>
            <select
              value={category}
              onChange={(event) =>
                onFilterChange(() => setCategory(event.target.value))
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả</option>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Giá
            </span>
            <select
              value={priceFilter}
              onChange={(event) =>
                onFilterChange(() => setPriceFilter(event.target.value))
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="under-500k">Dưới 500.000đ</option>
              <option value="500k-1m">500.000đ – 1.000.000đ</option>
              <option value="above-1m">Trên 1.000.000đ</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Đánh giá
            </span>
            <select
              value={ratingFilter}
              onChange={(event) =>
                onFilterChange(() => setRatingFilter(event.target.value))
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="4+">Từ 4 sao</option>
              <option value="4.5+">Từ 4.5 sao</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Sắp xếp
            </span>
            <select
              value={sortBy}
              onChange={(event) =>
                onFilterChange(() => setSortBy(event.target.value))
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="featured">Nổi bật</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
              <option value="rating">Đánh giá</option>
              <option value="name">Tên</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-stone-200 bg-white px-5 py-4">
      <div>
        <p className="text-sm text-stone-600">
          Hiển thị {pagedProducts.length} / {filteredProducts.length} sản phẩm
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
          Trang {currentPage} / {totalPages}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setSearchTerm("");
          setCategory("all");
          setPriceFilter("all");
          setRatingFilter("all");
          setSortBy("featured");
          setPage(1);
        }}
        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
      >
        Xóa bộ lọc
      </button>
    </div>

    {pagedProducts.length ? (
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {pagedProducts.map(({ product }) => (
          <li key={product.id} className="h-full">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    ) : (
      <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
        <h2 className="font-display text-3xl text-stone-950">
          Không tìm thấy sản phẩm phù hợp
        </h2>
        <p className="mt-3 text-sm text-stone-600">
          Hãy thử từ khóa khác hoặc xóa bộ lọc để xem thêm sản phẩm.
        </p>
      </div>
    )}

    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => setPage((value) => Math.max(1, value - 1))}
        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Trước
      </button>

      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          type="button"
          onClick={() => setPage(index + 1)}
          className={`h-10 w-10 rounded-full text-sm font-medium transition ${
            currentPage === index + 1
              ? "bg-[#8f5f2a] text-white"
              : "border border-stone-300 text-stone-700"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sau
      </button>
    </div>
  </div>
);
};
