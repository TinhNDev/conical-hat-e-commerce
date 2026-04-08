import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#eef6f0_0%,#faf7f2_100%)] px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
        Order placed
      </p>
      <h1 className="mt-4 font-display text-5xl text-stone-950">
        Payment successful
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700">
        Thank you for your purchase. Your demo order has been recorded and will
        now appear in the dashboard and order history views.
      </p>
      {orderId ? (
        <p className="mt-4 text-sm font-medium text-stone-800">Reference: {orderId}</p>
      ) : null}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/orders"
          className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white"
        >
          View order history
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
