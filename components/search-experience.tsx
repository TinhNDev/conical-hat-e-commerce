"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Stripe from "stripe";
import { enrichProduct, formatPrice, highlightText } from "@/lib/ecommerce";

interface Props {
  products: Stripe.Product[];
}

export const SearchExperience = ({ products }: Props) => {
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return [];
    }

    return products
      .filter((product) => product.name.toLowerCase().includes(term))
      .slice(0, 5);
  }, [products, query]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return [];
    }

    return products.filter((product) => {
      const details = enrichProduct(product);
      return (
        product.name.toLowerCase().includes(term) ||
        details.description.toLowerCase().includes(term) ||
        details.category.toLowerCase().includes(term) ||
        details.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    });
  }, [products, query]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Search by keyword
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try 'studio', 'minimal', or a product name"
            className="mt-3 w-full rounded-[1.5rem] border border-stone-300 px-5 py-4 text-base outline-none"
          />
        </label>
        {suggestions.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setQuery(product.name)}
                className="rounded-full border border-stone-300 px-3 py-2 text-sm text-stone-700"
              >
                {product.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {query ? (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            {results.length} result{results.length === 1 ? "" : "s"} for
            {" "}&quot;{query}&quot;
          </p>
          {results.length ? (
            <div className="grid gap-4">
              {results.map((product) => {
                const details = enrichProduct(product);
                const parts = highlightText(product.name, query);

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="rounded-[1.75rem] border border-stone-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                      {details.category}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                      {parts.map((part, index) =>
                        part.match ? (
                          <mark
                            key={`${part.text}-${index}`}
                            className="rounded bg-amber-200 px-1 text-stone-950"
                          >
                            {part.text}
                          </mark>
                        ) : (
                          <span key={`${part.text}-${index}`}>{part.text}</span>
                        )
                      )}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-stone-600">
                      {details.description}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-stone-900">
                      {formatPrice(details.price, details.currency)}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center text-stone-600">
              No results found. Try a broader keyword.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center text-stone-600">
          Start typing to see autocomplete suggestions and highlighted results.
        </div>
      )}
    </div>
  );
};
