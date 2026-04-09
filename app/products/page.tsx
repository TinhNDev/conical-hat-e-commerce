import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductList } from "@/components/product-list";
import { getCatalogProducts } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

type ProductsSearchParams = {
  q?: string | string[];
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await ((searchParams ?? Promise.resolve({})) as Promise<ProductsSearchParams>);
  const initialSearchTerm = typeof resolvedSearchParams.q === "string"
    ? resolvedSearchParams.q
    : "";
  const products = await getCatalogProducts(18);

  return (
    <div className="space-y-8 pb-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "Products" },
        ]}
      />
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] px-6 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
          Product Listing
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Filter, sort, and browse the full collection
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700">
          Use the upgraded search studio, category filters, and sorting controls
          to narrow the catalog without losing visual clarity.
        </p>
      </section>
      <ProductList products={products} initialSearchTerm={initialSearchTerm} />
    </div>
  );
}
