import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductDetail } from "@/components/product-detail";
import { getProductReviewsByCatalogId } from "@/lib/account-data";
import { getCatalogProductById, getCatalogProducts } from "@/lib/catalog-data";
import { getRelatedProducts } from "@/lib/ecommerce";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product;

  try {
    product = await getCatalogProductById(id);
  } catch {
    notFound();
  }

  const products = await getCatalogProducts(12);
  const relatedProducts = getRelatedProducts(product, products);
  const reviews = await getProductReviewsByCatalogId(id);

  return (
    <div className="pb-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
          { label: product.name },
        ]}
      />
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        initialReviews={reviews}
      />
    </div>
  );
}
