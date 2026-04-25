import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const articles = [
  {
    title: "Nón Lá Huế - Nét Đẹp Truyền Thống Giữa Lòng Phố Thị",
    date: "30/05/2025",
    category: "Văn hóa Huế",
    readTime: "5 phút đọc",
    image: "/non-la-vector.jpg",
    href: "https://thesunart.vn/non-la-hue-net-dep-truyen-thong-giua-long-pho-thi/",
    excerpt:
      "Khám phá nón lá Huế, làng nghề thủ công, chất liệu tự nhiên và vẻ đẹp nhẹ nhàng gắn với hình ảnh người phụ nữ Việt.",
  },
  {
    title: "Nón Lá Cờ Đỏ Sao Vàng - Biểu Tượng Văn Hóa Trong Sự Kiện Lịch Sử",
    date: "27/05/2025",
    category: "Sự kiện",
    readTime: "4 phút đọc",
    image: "/44a40acd-41a9-4453-8df9-f1cf2faf9f15.jpeg",
    href: "https://thesunart.vn/non-la-co-do-sao-vang-bieu-tuong-van-hoa-trong-su-kien-lich-su-80-nam-cach-mang-thang-tam-quoc-khanh-2-9/",
    excerpt:
      "Một góc nhìn về nón lá cờ đỏ sao vàng trong các hoạt động kỷ niệm, diễu hành, văn nghệ và quà tặng văn hóa.",
  },
  {
    title: "Túi & Nón Cỏ Bàng - Tặng Phẩm Gắn Liền Với Giá Trị Văn Hóa Việt",
    date: "2025",
    category: "Quà tặng",
    readTime: "4 phút đọc",
    image: "/3c27f3ab-6fdf-48a8-873d-4a66cf72e1ef.jpeg",
    href: "https://thesunart.vn/tui-non-co-bang-tang-pham-gan-lien-voi-gia-tri-van-hoa-viet-%f0%9f%87%bb%f0%9f%87%b3-tu-the-sun-art-tam-hon-viet-trong-moi-tac-pham/",
    excerpt:
      "Cảm hứng từ cỏ bàng, túi và nón thủ công như một lựa chọn tặng phẩm mang tính tự nhiên, bền vững và đậm tinh thần Việt.",
  },
  {
    title: "Mùa Hoa Phượng Nở",
    date: "01/06/2024",
    category: "Cảm hứng",
    readTime: "3 phút đọc",
    image: "/2086ffee-e7e2-4783-ae8e-401dcd895463.jpeg",
    href: "https://thesunart.vn/992-2/",
    excerpt:
      "Một bài viết giàu cảm xúc về mùa hoa phượng, ký ức học trò và combo nón lá bàng, túi đệm trong những khoảnh khắc tri ân.",
  },
];

const featuredArticle = articles[0];
const secondaryArticles = articles.slice(1);

export default function BlogPage() {
  return (
    <div className="space-y-10 pb-10">
      <section className="relative -mx-4 overflow-hidden rounded-[2rem] border border-stone-200 bg-[#f6efe4] shadow-[0_30px_80px_rgba(120,98,68,0.12)]">
        <div className="grid min-h-[580px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-8 lg:px-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dfc9ab] bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8f5f2a]">
              <BookOpenIcon className="h-4 w-4" />
              LUMI Journal
            </div>

            <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.94] text-stone-950 sm:text-6xl lg:text-7xl">
              Những câu chuyện sau chiếc nón lá Việt.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
              Tuyển chọn bài viết về nón lá Huế, nón cờ đỏ sao vàng, túi nón
              cỏ bàng và những cảm hứng thủ công gắn với đời sống Việt Nam.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-stone-700">
              <span className="rounded-full bg-white/65 px-4 py-2">
                Văn hóa
              </span>
              <span className="rounded-full bg-white/65 px-4 py-2">
                Thủ công
              </span>
              <span className="rounded-full bg-white/65 px-4 py-2">
                Quà tặng
              </span>
            </div>
          </div>

          <Link
            href={featuredArticle.href}
            target="_blank"
            rel="noreferrer"
            className="group relative min-h-[420px] overflow-hidden bg-stone-200"
          >
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.title}
              fill
              priority
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(min-width: 1024px) 52vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,25,23,0.08)_0%,rgba(28,25,23,0.76)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
                Bài nổi bật
              </p>
              <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
                {featuredArticle.title}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/82">
                {featuredArticle.excerpt}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-stone-950">
                Đọc bài viết
                <ArrowUpRightIcon className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {secondaryArticles.map((article) => (
          <Link
            key={article.href}
            href={article.href}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)] dark:border-stone-800 dark:bg-stone-950"
          >
            <div className="relative h-64 overflow-hidden bg-stone-200">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1.5 text-xs font-semibold text-stone-800 backdrop-blur">
                {article.category}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDaysIcon className="h-4 w-4" />
                  {article.date}
                </span>
                <span>{article.readTime}</span>
              </div>

              <h2 className="mt-4 font-display text-3xl leading-tight text-stone-950 dark:text-stone-50">
                {article.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-300">
                {article.excerpt}
              </p>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#8f5f2a] transition group-hover:text-stone-950 dark:text-stone-200 dark:group-hover:text-white">
                Xem chi tiết
                <ArrowUpRightIcon className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </section>

<section className="grid gap-6 rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] p-6 text-stone-950 shadow-[0_24px_64px_rgba(15,23,42,0.08)] sm:p-8 lg:grid-cols-[0.85fr_1.15fr]">
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
      Hướng dẫn đọc
    </p>

    <h2 className="mt-4 max-w-lg font-display text-4xl leading-tight text-stone-950 sm:text-5xl">
      Đọc để hiểu sâu hơn về sản phẩm thủ công.
    </h2>
  </div>

  <div className="grid gap-3 sm:grid-cols-2">
    {articles.map((article) => (
      <Link
        key={article.href}
        href={article.href}
        target="_blank"
        rel="noreferrer"
        className="group rounded-xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              {article.category}
            </p>

            <h3 className="mt-2 text-base font-semibold leading-6 text-stone-950">
              {article.title}
            </h3>
          </div>

          <ArrowUpRightIcon className="h-5 w-5 flex-none text-stone-400 transition group-hover:text-stone-950" />
        </div>
      </Link>
    ))}
  </div>
</section>

      <section className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(135deg,#fffaf3_0%,#eef6f0_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8f5f2a] text-white">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight text-stone-950">
              Tìm một chiếc nón mang câu chuyện riêng?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Sau khi đọc cảm hứng từ các bài viết, bạn có thể khám phá bộ sưu
              tập LUMI hoặc liên hệ để đặt thiết kế thủ công theo ý tưởng riêng.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-full bg-stone-950 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-stone-800"
            >
              Xem sản phẩm
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-stone-300 bg-white/70 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-stone-800 transition hover:bg-white"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
