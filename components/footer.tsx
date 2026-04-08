import Link from "next/link";
import { teamMembers } from "@/lib/ecommerce";

const footerLinks = [
  { href: "/products", label: "Products" },
  { href: "/products?q=studio", label: "Search" },
  { href: "/cart", label: "Cart" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog / FAQ" },
];

const socialLinks = [
  { href: "https://github.com/thanhtinh", label: "GitHub" },
  { href: "https://www.facebook.com", label: "Facebook" },
  { href: "https://www.instagram.com", label: "Instagram" },
];

export const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-100">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr_1fr]">
        <div>
          <p className="font-display text-3xl">Atelier Store</p>
          <div className="mt-5 space-y-2 text-sm text-stone-300">
            <p>Email: support@atelier-store.demo</p>
            <p>Phone: +84 28 1234 5678</p>
            <p>Address: 227 Nguyen Van Cu, District 5, Ho Chi Minh City</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
            Quick Links
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-stone-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
              Social
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-200 transition hover:border-stone-500 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
            Project Team
          </p>
          <div className="mt-4 space-y-4">
            {teamMembers.map((member) => (
              <div key={member.studentId} className="text-sm text-stone-300">
                <p className="font-medium text-stone-100">{member.name}</p>
                <p>{member.role}</p>
                <p>{member.studentId}</p>
                <Link
                  href={member.github}
                  className="text-stone-200 underline-offset-4 hover:underline"
                >
                  GitHub
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
