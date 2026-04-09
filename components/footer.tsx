import Image from "next/image";
import Link from "next/link";
import { teamMembers } from "@/lib/ecommerce";

const footerLinks = [
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog / FAQ" },
];


export const Footer = () => {
  return (
    <footer className="border-t border-[#d9c8ae] bg-[linear-gradient(180deg,#f7efe2_0%,#f6f1e8_48%,#edf4ee_100%)] text-stone-800">
      <div className="container mx-auto grid gap-6 px-4 py-7 md:grid-cols-[1.05fr_0.95fr_1fr] lg:gap-8">
        
        {/* BRAND */}
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl shadow-[0_10px_22px_rgba(143,95,42,0.14)]">
              <Image
                src="/atelier-logo.svg"
                alt="LUMI logo"
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
            <p className="font-display text-3xl text-stone-950">LUMI</p>
          </div>
          <div className="mt-4 space-y-1.5 text-sm leading-6 text-stone-600">
            <p>Email: support@nonla.vn</p>
            <p>Hotline: 0900 000 000</p>
            <p>Địa chỉ: 227 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
            Điều hướng
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-stone-700 transition hover:text-stone-950"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* SOCIAL */}
          <div className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
              Kết nối
            </p>
          </div>
        </div>

        {/* TEAM */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
            Đội ngũ phát triển
          </p>

          <div className="mt-4 space-y-3">
            {teamMembers.map((member, index) => (
              <div
                key={`${member.name}-${member.role}-${index}`}
                className="rounded-[1.1rem] border border-white/70 bg-white/55 px-4 py-2.5 text-sm text-stone-600 shadow-[0_10px_24px_rgba(120,98,68,0.06)]"
              >
                <p className="font-medium text-stone-950">{member.name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
