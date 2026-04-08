import Link from "next/link";

interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-stone-900">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-stone-900" : ""}>
                {item.label}
              </span>
            )}
            {!isLast ? <span>/</span> : null}
          </div>
        );
      })}
    </nav>
  );
};
