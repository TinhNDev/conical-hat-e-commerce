import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] px-6 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
          Checkout
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Complete shipping, payment, and summary review
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700">
          This flow covers the checklist requirements: address form, payment
          method selection, and final order summary before confirmation.
        </p>
      </section>
      <CheckoutForm />
    </div>
  );
}
