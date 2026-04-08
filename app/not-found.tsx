import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-[2rem] border border-dashed border-stone-300 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] px-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
        404
      </p>
      <h1 className="mt-4 font-display text-6xl text-stone-950">
        This page wandered off
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700">
        The page you requested does not exist or has been moved. Use the button
        below to return to the storefront.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white"
      >
        Return home
      </Link>
    </div>
  );
}
