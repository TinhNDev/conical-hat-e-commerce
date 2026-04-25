import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductList } from "@/components/product-list";
import { getCatalogProducts } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
  }>;
}

type ProductsSearchParams = {
  q?: string | string[];
  category?: string | string[];
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await ((searchParams ?? Promise.resolve({})) as Promise<ProductsSearchParams>);
  const initialSearchTerm = typeof resolvedSearchParams.q === "string"
    ? resolvedSearchParams.q
    : "";
  const initialCategory = typeof resolvedSearchParams.category === "string"
    ? resolvedSearchParams.category
    : "all";
  const products = await getCatalogProducts(null);

  return (
    <div className="space-y-8 pb-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Trang chủ" },
          { label: "Sản phẩm" },
        ]}
      />
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] px-6 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
          Danh mục sản phẩm
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Khám phá bộ sưu tập nón lá
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700">
          Dễ dàng tìm kiếm, lọc và lựa chọn những mẫu nón lá phù hợp với phong
          cách của bạn — từ thiết kế truyền thống, thanh lịch đến các mẫu cách
          tân mang đậm dấu ấn riêng.
        </p>
      </section>
      <ProductList
        products={products}
        initialSearchTerm={initialSearchTerm}
        initialCategory={initialCategory}
      />
    </div>
  );
}
