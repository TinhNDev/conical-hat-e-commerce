import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductDetail } from "@/components/product-detail";
import { getRelatedProducts } from "@/lib/ecommerce";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await stripe.products.retrieve(id, {
    expand: ["default_price"],
  });
  const products = await stripe.products.list({
    expand: ["data.default_price"],
    limit: 12,
  });
  const relatedProducts = getRelatedProducts(product, products.data);

  const plainProduct = JSON.parse(JSON.stringify(product));
  const plainRelatedProducts = JSON.parse(JSON.stringify(relatedProducts));

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
        product={plainProduct}
        relatedProducts={plainRelatedProducts}
      />
    </div>
  );
}
