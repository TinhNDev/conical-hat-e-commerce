import { CartView } from "@/components/cart-view";

export default function CartPage() {
  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] px-6 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
          Cart
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Review your bag before checkout
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700">
          Update quantities, remove items, and apply discount codes before
          moving to the checkout form.
        </p>
      </section>
      <CartView />
    </div>
  );
}
