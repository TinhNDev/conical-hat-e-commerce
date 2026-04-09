import Image from "next/image";
import Link from "next/link";
import { Carousel } from "@/components/carousel";
import { Button } from "@/components/ui/button";
import { getCategorySummary } from "@/lib/ecommerce";
import { getCatalogProducts } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

const formatPrice = (price?: { unit_amount: number | null } | null) => {
  if (!price || price.unit_amount == null) {
    return "Custom pricing";
  }

  return `$${(price.unit_amount / 100).toFixed(2)}`;
};

export default async function Home() {
  const products = await getCatalogProducts(6);

  const heroProduct = products[0];
  const featuredProducts = products.slice(0, 3);
  const categories = getCategorySummary(products).slice(0, 4);
  const heroPrice = heroProduct?.default_price;
  const heroImage = heroProduct?.images?.[0];

  return (
    <div className="space-y-12 pb-10">
      <section className="relative -mx-4 overflow-hidden rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#f6efe4_0%,#faf7f2_45%,#e8f1ec_100%)] px-6 py-8 shadow-[0_30px_80px_rgba(120,98,68,0.12)] sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-52 w-52 rounded-full bg-emerald-200/60 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-stone-300/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-stone-700 backdrop-blur">
              Curated Pieces For Everyday Living
            </div>
            <div className="max-w-2xl space-y-5">
              <h1 className="font-display text-5xl leading-none text-stone-950 sm:text-6xl lg:text-7xl">
                Build a home page that feels like a boutique, not a template.
              </h1>
              <p className="max-w-xl text-base leading-7 text-stone-700 sm:text-lg">
                Discover a tighter edit of standout products with cleaner
                details, warmer color, and a sharper shopping path from first
                glance to checkout.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-stone-950 px-7 text-sm uppercase tracking-[0.2em] text-stone-50 hover:bg-stone-800"
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
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Featured drops", value: `${products.length}+` },
                { label: "Checkout flow", value: "Database" },
                { label: "Visual style", value: "Editorial" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-stone-300/70 bg-white/65 p-4 backdrop-blur"
                >
                  <p className="text-2xl font-semibold text-stone-950">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-white/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-stone-950 p-4 text-stone-50 shadow-2xl">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-1 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem] bg-stone-900">
                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={heroProduct?.name ?? "Featured product"}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 24rem, (min-width: 1024px) 30vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#d6d3d1,transparent_55%)] p-8 text-center text-stone-300">
                      Featured product image coming soon
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between gap-6 rounded-[1.5rem] bg-stone-900/80 p-5">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-400">
                      Product Spotlight
                    </p>
                    <h2 className="font-display text-3xl leading-tight">
                      {heroProduct?.name ?? "New arrivals"}
                    </h2>
                    <p className="text-sm leading-6 text-stone-300">
                      {heroProduct?.description ??
                        "A sharper presentation for your strongest item, with enough contrast and breathing room to feel premium."}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between border-t border-stone-700 pt-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                          Starting at
                        </p>
                        <p className="text-3xl font-semibold text-amber-200">
                          {formatPrice(heroPrice)}
                        </p>
                      </div>
                      {heroProduct ? (
                        <Link
                          href={`/products/${heroProduct.id}`}
                          className="rounded-full border border-stone-600 px-4 py-2 text-sm font-medium text-stone-100 transition hover:border-amber-200 hover:text-amber-200"
                        >
                          View item
                        </Link>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.18em] text-stone-400">
                      <div className="rounded-2xl border border-stone-800 bg-stone-950 p-3">
                        Fast visual scan
                      </div>
                      <div className="rounded-2xl border border-stone-800 bg-stone-950 p-3">
                        Cleaner CTA flow
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-stone-50 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
            Why This Layout Works
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
            Better hierarchy, better first impression.
          </h2>
          <div className="mt-8 space-y-5 text-sm leading-7 text-stone-300">
            <p>
              The page now leads with one strong promise, one featured product,
              and one clean route into the catalog.
            </p>
            <p>
              Warm neutrals and soft green accents keep the store feeling calm
              and premium without turning into the usual black-and-white demo.
            </p>
            <p>
              Product discovery is still immediate, but the composition gives
              your storefront more personality.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredProducts.map((product, index) => {
            const price = product.default_price;
            const image = product.images?.[0];

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={`group overflow-hidden rounded-[2rem] border border-stone-200 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(24,24,27,0.12)] ${
                  index === 1 ? "bg-[#f4efe8]" : "bg-white"
                }`}
              >
                <div className="relative h-64 overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-100 text-stone-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                    Featured {index + 1}
                  </p>
                  <h3 className="font-display text-2xl leading-tight text-stone-950">
                    {product.name}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-6 text-stone-600">
                    {product.description ||
                      "A tighter card layout gives each product more presence without making the page feel crowded."}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-semibold text-stone-950">
                      {formatPrice(price)}
                    </span>
                    <span className="text-sm font-medium text-stone-700 transition group-hover:text-stone-950">
                      Explore
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className="rounded-[1.75rem] border border-stone-200 bg-white p-6"
          >
            <p className="text-xs uppercase tracking-[0.26em] text-stone-500">
              Category
            </p>
            <h2 className="mt-3 font-display text-3xl text-stone-950">
              {category.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {category.accent}
            </p>
            <p className="mt-4 text-sm font-medium text-stone-800">
              {category.count} products
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <Carousel products={products} />
        </div>
        <div className="rounded-[2rem] border border-emerald-200 bg-[linear-gradient(180deg,#f7fbf8_0%,#eef6f0_100%)] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            Ready To Browse
          </p>
          <h2 className="mt-4 max-w-md font-display text-3xl leading-tight text-stone-950 sm:text-4xl">
            Jump from inspiration to product pages without losing momentum.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-stone-700">
            Use this page as your storefront anchor: a polished first stop that
            still pushes shoppers directly into the product grid and checkout
            flow.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-emerald-900 px-7 text-sm uppercase tracking-[0.18em] text-white hover:bg-emerald-800"
            >
              <Link href="/products">See All Products</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-emerald-700/40 bg-transparent px-7 text-sm uppercase tracking-[0.18em] text-emerald-900 hover:bg-emerald-50"
            >
              <Link href="/checkout">Go To Checkout</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
