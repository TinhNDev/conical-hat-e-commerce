import Image from "next/image";
import Link from "next/link";
import { Carousel } from "@/components/carousel";
import { HeroBackgroundGallery } from "@/components/hero-background-gallery";
import { Button } from "@/components/ui/button";
import { getCategorySummary } from "@/lib/ecommerce";
import { getCatalogProducts } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

const formatPrice = (price?: { unit_amount: number | null; currency?: string } | null) => {
  if (!price || price.unit_amount == null) {
    return "Gia lien he";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: (price.currency ?? "vnd").toUpperCase(),
  }).format(price.unit_amount / 100);
};

export default async function Home() {
  const products = await getCatalogProducts(8);

  const heroProduct = products[0];
  const featuredProducts = products.slice(0, 3);
  const categories = getCategorySummary(products).slice(0, 4);
  const heroPrice = heroProduct?.default_price;
  const heroImage = heroProduct?.images?.[0];

  return (
    <div className="space-y-12 pb-10">
      <section className="relative -mx-4 overflow-hidden rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#f6efe4_0%,#faf7f2_45%,#e8f1ec_100%)] px-6 py-8 shadow-[0_30px_80px_rgba(120,98,68,0.12)] sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <HeroBackgroundGallery />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,252,246,0.82)_0%,rgba(255,250,244,0.68)_48%,rgba(255,255,255,0.32)_100%)] p-5 shadow-[0_24px_60px_rgba(120,98,68,0.08)] backdrop-blur-[3px] sm:p-7 lg:p-8">
            <div className="max-w-2xl space-y-5">
              <h1 className="font-display text-5xl leading-[0.92] text-stone-950 sm:text-6xl lg:text-7xl">
                <span className="block">Đội chất riêng</span>
                <span className="mt-2 block text-stone-800">Chạm nét Việt</span>
              </h1>
              <p className="max-w-xl text-base leading-7 text-stone-700 sm:text-lg">
                LUMI là thương hiệu nón lá thủ công hiện đại, nơi mỗi sản phẩm không chỉ để đội mà còn giúp bạn nổi bật và khác biệt. Khác với những chiếc nón lá thông thường, LUMI tập trung vào thiết kế sáng tạo, vẽ tay và cá nhân hóa theo yêu cầu, giúp mỗi chiếc nón trở thành phiên bản duy nhất dành riêng cho bạn.

Từng sản phẩm được làm từ lá tự nhiên, hoàn thiện tỉ mỉ bởi nghệ nhân, đảm bảo bền – đẹp – lên hình ấn tượng cho mọi outfit, từ đi biển, chụp ảnh đến làm quà tặng.

Bạn có thể mua một chiếc nón ở nhiều nơi, nhưng tại LUMI, bạn sở hữu một chiếc nón mang dấu ấn riêng – không trùng lặp, không đại trà.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-white/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,250,244,0.96)_0%,rgba(244,236,224,0.98)_100%)] p-4 text-stone-900 shadow-2xl">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-1 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem] bg-stone-200">
                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={heroProduct?.name ?? "Featured product"}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 24rem, (min-width: 1024px) 30vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#ffffff,transparent_55%)] p-8 text-center text-stone-500">
                      Featured product image coming soon
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between gap-6 rounded-[1.5rem] border border-white/70 bg-white/72 p-5 shadow-[0_18px_40px_rgba(120,98,68,0.08)]">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                      SẢN PHẨM NỔI BẬT
                    </p>
                    <h2 className="font-display text-3xl leading-tight text-stone-950">
                      {heroProduct?.name ?? "New arrivals"}
                    </h2>
                    <p className="text-sm leading-6 text-stone-700">
                      {heroProduct?.description ??
                        "A sharper presentation for your strongest item, with enough contrast and breathing room to feel premium."}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-4 border-t border-stone-200 pt-4">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                          Mức giá hiện tại
                        </p>
                        <p className="mt-1 text-[clamp(1.95rem,4.5vw,2.75rem)] font-semibold leading-tight text-amber-700">
                          {formatPrice(heroPrice)}
                        </p>
                      </div>
                      {heroProduct ? (
                        <div className="flex justify-start">
                          <Link
                            href={`/products/${heroProduct.id}`}
                            className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300/90 bg-stone-50 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-stone-700 transition hover:border-amber-500 hover:text-amber-700"
                          >
                            Chi tiết sản phẩm
                          </Link>
                        </div>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.18em] text-stone-600">
                      <div className="rounded-2xl border border-stone-200 bg-[#fff8f0] p-3">
                        Fast visual scan
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-[#f4efe8] p-3">
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
        <div className="rounded-[2rem] border border-[#d9c8ae] bg-[linear-gradient(160deg,#f6ecde_0%,#efe3d2_52%,#e6efe7_100%)] p-6 text-stone-900 shadow-[0_24px_70px_rgba(120,98,68,0.10)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-800">
            Tinh thần của LUMI
          </p>
          <div className="relative mt-8 w-full max-w-[520px] overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/55 shadow-[0_20px_50px_rgba(120,98,68,0.10)]">
            <div className="relative h-[360px]">
              <Image
                src="/non-la-vector.jpg"
                alt="Tinh thần thiet ke non la LUMI"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 36vw, 100vw"
              />
            </div>
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
                    Tuyển chọn {index + 1}
                  </p>
                  <h3 className="font-display text-2xl leading-tight text-stone-950">
                    {product.name}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-6 text-stone-600">
                    {product.description ||
                      "Mỗi thiết kế được trình bày gọn gàng để họa tiết, chất liệu và cá tính thủ công hiện lên rõ hơn ngay từ cái nhìn đầu tiên."}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-semibold text-stone-950">
                      {formatPrice(price)}
                    </span>
                    <span className="text-sm font-medium text-stone-700 transition group-hover:text-stone-950">
                      Xem mẫu
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
          <Link
            key={category.name}
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className="rounded-[1.75rem] border border-stone-200 bg-white p-6"
          >
            <p className="text-xs uppercase tracking-[0.26em] text-stone-500">
              Danh mục
            </p>
            <h2 className="font-display text-3xl text-stone-950">
              {category.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {category.accent}
            </p>
            <p className="mt-4 text-sm font-medium text-stone-800">
              {category.count} sản phẩm
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <Carousel products={products} />
        </div>
        <div className="rounded-[2rem] border border-emerald-200 bg-[linear-gradient(180deg,#f7fbf8_0%,#eef6f0_100%)] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            Sẵn sàng khám phá
          </p>
          <h2 className="mt-4 max-w-md font-display text-3xl leading-tight text-stone-950 sm:text-4xl">
            Từ cảm hứng đầu tiên đến chiếc nón dành riêng cho bạn.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-stone-700">
            Khám phá bộ sưu tập nón lá thủ công, chọn thiết kế phù hợp cho chụp ảnh,
            du lịch, quà tặng hoặc một dấu ấn cá nhân mang tinh thần Việt theo cách mới mẻ hơn.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-emerald-900 px-7 text-sm uppercase tracking-[0.18em] text-white hover:bg-emerald-800"
            >
              <Link href="/products">Xem toàn bộ sản phẩm</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-emerald-700/40 bg-transparent px-7 text-sm uppercase tracking-[0.18em] text-emerald-900 hover:bg-emerald-50"
            >
              <Link href="/checkout">Đi đến giỏ hàng</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
