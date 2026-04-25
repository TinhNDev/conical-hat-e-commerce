import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const footerColumns = [
  {
    title: "Mua sắm",
    links: [
      { href: "/products", label: "Bộ sưu tập" },
      { href: "/cart", label: "Giỏ hàng" },
      { href: "/checkout", label: "Thanh toán" },
      { href: "/orders", label: "Đơn hàng" },
    ],
  },
  {
    title: "Thương hiệu",
    links: [
      { href: "/about", label: "Giới thiệu" },
      { href: "/blog", label: "Blog / FAQ" },
      { href: "/contact", label: "Liên hệ" },
      { href: "/dashboard", label: "Tài khoản" },
    ],
  },
];

const contactItems = [
  {
    icon: EnvelopeIcon,
    label: "support@nonla.vn",
  },
  {
    icon: PhoneIcon,
    label: "0900 000 000",
  },
  {
    icon: MapPinIcon,
    label: "227 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh",
  },
];

const socialLinks = [
  { href: "https://github.com", label: "GitHub" },
  { href: "/contact", label: "Liên hệ" },
  { href: "/blog", label: "FAQ" },
];

export const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-[#f8f3ec] text-stone-700 transition-colors duration-300 dark:border-stone-800 dark:bg-stone-950">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] lg:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white shadow-[0_12px_26px_rgba(23,23,23,0.14)] dark:bg-stone-900">
                <Image
                  src="/atelier-logo.svg"
                  alt="LUMI logo"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>

              <div>
                <p className="font-display text-3xl leading-none text-stone-950 dark:text-stone-50">
                  LUMI
                </p>
                <p className="mt-1 text-sm font-medium text-stone-500 dark:text-stone-400">
                  Nón lá Việt Nam hiện đại
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-stone-600 dark:text-stone-300">
              Thiết kế nón lá thanh lịch, giữ tinh thần thủ công Việt trong một
              trải nghiệm mua sắm hiện đại.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-400 dark:hover:text-white"
                >
                  {link.label}
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  {column.title}
                </h3>
                <div className="mt-4 grid gap-3">
                  {column.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="w-fit text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
              Liên hệ
            </h3>
            <div className="mt-4 grid gap-3">
              {contactItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4.5 w-4.5 flex-none text-[#8f5f2a] dark:text-stone-300" />
                    <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-stone-300/70 pt-5 text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LUMI. All rights reserved.</p>
          <p>Modern Vietnamese craft, curated by LUMI.</p>
        </div>
      </div>
    </footer>
  );
};
