"use client";

import { useMemo, useState } from "react";
import Stripe from "stripe";
import { ProductCard } from "./product-card";
import { enrichProduct } from "@/lib/ecommerce";

interface Props {
  products: Stripe.Product[];
}

const PAGE_SIZE = 6;

export const ProductList = ({ products }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);

  const productDetails = useMemo(
    () => products.map((product) => ({ product, details: enrichProduct(product) })),
    [products]
  );

  const categories = useMemo(
    () => Array.from(new Set(productDetails.map(({ details }) => details.category))),
    [productDetails]
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = productDetails.filter(({ details }) => {
      const matchesTerm =
        !term ||
        details.name.toLowerCase().includes(term) ||
        details.description.toLowerCase().includes(term) ||
        details.tags.some((tag) => tag.toLowerCase().includes(term));

      const matchesCategory = category === "all" || details.category === category;

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under-50" && (details.price ?? 0) < 5000) ||
        (priceFilter === "50-100" &&
          (details.price ?? 0) >= 5000 &&
          (details.price ?? 0) <= 10000) ||
        (priceFilter === "above-100" && (details.price ?? 0) > 10000);

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
  }, [category, priceFilter, productDetails, ratingFilter, searchTerm, sortBy]);

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
      <div className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                onFilterChange(() => setSearchTerm(event.target.value))
              }
              placeholder="Search products..."
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-stone-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Category
            </span>
            <select
              value={category}
              onChange={(event) =>
                onFilterChange(() => setCategory(event.target.value))
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">All categories</option>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Price
            </span>
            <select
              value={priceFilter}
              onChange={(event) =>
                onFilterChange(() => setPriceFilter(event.target.value))
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">All prices</option>
              <option value="under-50">Under $50</option>
              <option value="50-100">$50 to $100</option>
              <option value="above-100">Above $100</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Rating
            </span>
            <select
              value={ratingFilter}
              onChange={(event) =>
                onFilterChange(() => setRatingFilter(event.target.value))
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">All ratings</option>
              <option value="4+">4 stars & up</option>
              <option value="4.5+">4.5 stars & up</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Sort
            </span>
            <select
              value={sortBy}
              onChange={(event) =>
                onFilterChange(() => setSortBy(event.target.value))
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-stone-200 bg-white px-5 py-4">
        <div>
          <p className="text-sm text-stone-600">
            Showing {pagedProducts.length} of {filteredProducts.length} products
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            Page {currentPage} of {totalPages}
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
          Reset filters
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
            No products match these filters
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Try a broader search term or reset the current filter set.
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
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            type="button"
            onClick={() => setPage(index + 1)}
            className={`h-10 w-10 rounded-full text-sm font-medium transition ${
              currentPage === index + 1
                ? "bg-stone-950 text-white"
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
          Next
        </button>
      </div>
    </div>
  );
};
