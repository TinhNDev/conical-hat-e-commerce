import { Breadcrumbs } from "@/components/breadcrumbs";
import { getSessionFromCookies } from "@/lib/auth-server";
import { formatPrice } from "@/lib/ecommerce";
import { stripe } from "@/lib/stripe";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, CircleUserRound, CreditCard, Mail, Package2, Phone, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import {
  createCustomerAction,
  createProductAction,
  deleteCustomerAction,
  deleteProductAction,
  updateCustomerAction,
  updateProductAction,
} from "./actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const inputClassName =
  "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition focus:border-stone-400 focus:bg-stone-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:bg-stone-900";

const labelClassName = "space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200";
const panelClassName =
  "rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-stone-700 dark:bg-stone-950/95";
const subPanelClassName =
  "rounded-[1.75rem] border border-stone-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-stone-700 dark:bg-stone-950";
const formShellClassName =
  "mt-6 space-y-5 rounded-[1.75rem] border border-dashed border-stone-300 bg-[linear-gradient(180deg,rgba(250,247,242,0.8)_0%,rgba(255,255,255,0.95)_100%)] p-5 dark:border-stone-700 dark:bg-stone-900/50";
const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200";
const dangerButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-200 dark:hover:bg-rose-950/30";
const collectionShellClassName =
  "mt-6 rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-700 dark:bg-stone-900/30";

type AdminPageProps = {
  searchParams?: Promise<{
    type?: string;
    message?: string;
    view?: string;
  }>;
};

type AdminSearchParams = {
  type?: string;
  message?: string;
  view?: string;
};

function AdminStatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-stone-700 dark:bg-stone-950/80">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-950">{value}</p>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{detail}</p>
    </div>
  );
}

function ProductPreview({
  image,
  name,
  status,
}: {
  image: string | null;
  name: string;
  status: "active" | "archived";
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-[linear-gradient(180deg,#faf7f2_0%,#f5f5f4_100%)] dark:border-stone-700 dark:bg-stone-900">
      <div className="flex items-center justify-between border-b border-stone-200/80 px-4 py-3 dark:border-stone-700">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Product image
        </p>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-600 dark:bg-stone-950 dark:text-stone-300">
          {status}
        </span>
      </div>
      {image ? (
        <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(245,245,244,0.4)_58%,transparent_100%)] p-4">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-4"
            sizes="(min-width: 1280px) 240px, (min-width: 768px) 220px, 100vw"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/5] items-center justify-center px-5 text-center text-sm text-stone-500 dark:text-stone-300">
          No product image
        </div>
      )}
    </div>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getSessionFromCookies();

  if (!session.isAdmin) {
    redirect("/login?redirect=/admin");
  }

  const [{ data: products }, { data: customers }, resolvedSearchParams] = await Promise.all([
    stripe.products.list({
      expand: ["data.default_price"],
      limit: 24,
    }),
    stripe.customers.list({
      limit: 24,
    }),
    (searchParams ?? Promise.resolve({})) as Promise<AdminSearchParams>,
  ]);

  const feedbackType = resolvedSearchParams.type === "error" ? "error" : "success";
  const feedbackMessage = resolvedSearchParams.message;
  const selectedView = resolvedSearchParams.view === "customers" ? "customers" : "products";
  const activeProductRecords = products.filter((product) => product.active);
  const archivedProductRecords = products.filter((product) => !product.active);
  const activeProducts = activeProductRecords.length;
  const customersWithEmail = customers.filter((customer) => Boolean(customer.email)).length;

  return (
    <div className="space-y-8 pb-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "Admin" },
        ]}
      />

      <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#f6efe4_0%,#faf7f2_42%,#e8f1ec_100%)] px-6 py-10 dark:border-stone-700">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_55%)] lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600">
              <ShieldCheck className="h-4 w-4" />
              Operations console
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
                Stripe admin
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-5xl leading-none text-stone-950">
                Professional control over catalog, pricing, and customer records
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">
                Use this workspace to keep your storefront data clean: publish products,
                revise pricing, and maintain checkout-ready customer profiles with fewer clicks.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-stone-700">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2">
                <Mail className="h-4 w-4" />
                {session.email}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2">
                <Sparkles className="h-4 w-4" />
                Live Stripe workspace
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <AdminStatCard
              label="Products"
              value={products.length.toString()}
              detail={`${activeProducts} active in storefront`}
            />
            <AdminStatCard
              label="Customers"
              value={customers.length.toString()}
              detail={`${customersWithEmail} with email on file`}
            />
          </div>
        </div>
      </section>

      {feedbackMessage ? (
        <div
          className={`rounded-[1.5rem] border px-5 py-4 text-sm ${
            feedbackType === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
          }`}
        >
          {feedbackMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin?view=products"
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
            selectedView === "products"
              ? "bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950"
              : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
          }`}
        >
          <Package2 className="h-4 w-4" />
          Products
        </Link>
        <Link
          href="/admin?view=customers"
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
            selectedView === "customers"
              ? "bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950"
              : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
          }`}
        >
          <CircleUserRound className="h-4 w-4" />
          Customers
        </Link>
      </div>

      <div className="grid gap-8">
        {selectedView === "products" ? (
        <section className={panelClassName}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Product CRUD
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-stone-950">Catalog manager</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                Create new inventory, revise active listings, and keep price updates organized.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-3 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
              <Package2 className="h-5 w-5" />
            </div>
          </div>

          <form action={createProductAction} className={formShellClassName}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-stone-950">Create product</h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                  Add a new Stripe product with pricing, imagery, and storefront metadata.
                </p>
              </div>
              <div className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 shadow-sm md:block dark:bg-stone-950 dark:text-stone-300">
                New entry
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClassName}>
                Name
                <input name="name" required className={inputClassName} placeholder="Lacquer bowl" />
              </label>
              <label className={labelClassName}>
                Price
                <input name="price" type="number" min="0" step="0.01" className={inputClassName} placeholder="49.00" />
              </label>
              <label className={labelClassName}>
                Currency
                <input name="currency" defaultValue="usd" className={inputClassName} placeholder="usd" />
              </label>
              <label className={`${labelClassName} flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-950`}>
                <input name="active" type="checkbox" defaultChecked className="h-4 w-4 rounded border-stone-300" />
                Active in storefront
              </label>
            </div>
            <label className={labelClassName}>
              Description
              <textarea name="description" rows={4} className={inputClassName} placeholder="Short product summary for the storefront." />
            </label>
            <label className={labelClassName}>
              Images
              <input
                name="images"
                className={inputClassName}
                placeholder="https://example.com/image-1.jpg, https://example.com/image-2.jpg"
              />
            </label>
            <label className={labelClassName}>
              Metadata JSON
              <textarea name="metadata" rows={3} className={inputClassName} placeholder='{"category":"Studio Picks","featured":"true"}' />
            </label>
            <button className={primaryButtonClassName}>
              Create product
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className={collectionShellClassName}>
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4 dark:border-stone-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  All products
                </p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                  {activeProducts} active product records shown here.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 dark:bg-stone-950 dark:text-stone-300">
                {archivedProductRecords.length} archived
              </span>
            </div>

            <div className="mt-4 space-y-4">
            {activeProductRecords.map((product) => {
              const defaultPrice =
                product.default_price && typeof product.default_price !== "string"
                  ? product.default_price
                  : null;
              const primaryImage = product.images[0] ?? null;

              return (
                <div key={product.id} className={subPanelClassName}>
                  <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
                    <ProductPreview image={primaryImage} name={product.name} status="active" />

                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold text-stone-950">{product.name}</h3>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                            {product.id}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                              <span className="inline-flex items-center gap-1">
                                <Boxes className="h-3.5 w-3.5" />
                                Product
                              </span>
                            </span>
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                              {product.images.length} image{product.images.length === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                            {product.active ? "Active" : "Archived"}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
                            {formatPrice(defaultPrice?.unit_amount ?? null, defaultPrice?.currency ?? "usd")}
                          </span>
                        </div>
                      </div>

                      {product.description ? (
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                          {product.description}
                        </p>
                      ) : null}

                      <form action={updateProductAction} className="mt-5 space-y-4 rounded-[1.5rem] border border-stone-200/80 bg-stone-50/70 p-4 dark:border-stone-700 dark:bg-stone-900/40">
                        <input type="hidden" name="productId" value={product.id} />
                        <div className="grid gap-4 md:grid-cols-2">
                          <label className={labelClassName}>
                            Name
                            <input name="name" required defaultValue={product.name} className={inputClassName} />
                          </label>
                          <label className={labelClassName}>
                            Price
                            <input
                              name="price"
                              type="number"
                              min="0"
                              step="0.01"
                              defaultValue={defaultPrice?.unit_amount ? (defaultPrice.unit_amount / 100).toFixed(2) : ""}
                              className={inputClassName}
                            />
                          </label>
                          <label className={labelClassName}>
                            Currency
                            <input
                              name="currency"
                              defaultValue={(defaultPrice?.currency ?? "usd").toUpperCase()}
                              className={inputClassName}
                            />
                          </label>
                          <label className={`${labelClassName} flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-950`}>
                            <input name="active" type="checkbox" defaultChecked={product.active} className="h-4 w-4 rounded border-stone-300" />
                            Active in storefront
                          </label>
                        </div>
                        <label className={labelClassName}>
                          Description
                          <textarea
                            name="description"
                            rows={3}
                            defaultValue={product.description ?? ""}
                            className={inputClassName}
                          />
                        </label>
                        <label className={labelClassName}>
                          Images
                          <input
                            name="images"
                            defaultValue={product.images.join(", ")}
                            className={inputClassName}
                          />
                        </label>
                        <label className={labelClassName}>
                          Metadata JSON
                          <textarea
                            name="metadata"
                            rows={3}
                            defaultValue={JSON.stringify(product.metadata, null, 2)}
                            className={inputClassName}
                          />
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <button className={primaryButtonClassName}>
                            Save changes
                          </button>
                          <span className="inline-flex items-center rounded-full bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:bg-stone-950 dark:text-stone-300">
                            Price updates create a new Stripe price
                          </span>
                        </div>
                      </form>

                      <form action={deleteProductAction} className="mt-4">
                        <input type="hidden" name="productId" value={product.id} />
                        <button className={dangerButtonClassName}>
                          <Trash2 className="h-4 w-4" />
                          Delete product
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {archivedProductRecords.length ? (
            <div className={collectionShellClassName}>
              <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4 dark:border-stone-700">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Archived products
                  </p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                    Stripe archives products with prices instead of permanently deleting them.
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 dark:bg-stone-950 dark:text-stone-300">
                  {archivedProductRecords.length} archived
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {archivedProductRecords.map((product) => {
                  const defaultPrice =
                    product.default_price && typeof product.default_price !== "string"
                      ? product.default_price
                      : null;
                  const primaryImage = product.images[0] ?? null;

                  return (
                  <div key={product.id} className={subPanelClassName}>
                    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
                      <ProductPreview image={primaryImage} name={product.name} status="archived" />

                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-stone-950">{product.name}</h3>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                              {product.id}
                            </p>
                          </div>
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                            Archived
                          </span>
                        </div>
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                          This product is no longer active in the storefront. You can reactivate it by
                          editing the record and enabling `Active in storefront`.
                        </p>
                        <form action={updateProductAction} className="mt-5 space-y-4 rounded-[1.5rem] border border-stone-200/80 bg-stone-50/70 p-4 dark:border-stone-700 dark:bg-stone-900/40">
                          <input type="hidden" name="productId" value={product.id} />
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className={labelClassName}>
                              Name
                              <input name="name" required defaultValue={product.name} className={inputClassName} />
                            </label>
                            <label className={labelClassName}>
                              Images
                              <input name="images" defaultValue={product.images.join(", ")} className={inputClassName} />
                            </label>
                            <label className={labelClassName}>
                              Currency
                              <input
                                name="currency"
                                defaultValue={(defaultPrice?.currency ?? "usd").toUpperCase()}
                                className={inputClassName}
                              />
                            </label>
                            <label className={`${labelClassName} flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-950`}>
                              <input name="active" type="checkbox" defaultChecked={product.active} className="h-4 w-4 rounded border-stone-300" />
                              Active in storefront
                            </label>
                          </div>
                          <label className={labelClassName}>
                            Description
                            <textarea name="description" rows={3} defaultValue={product.description ?? ""} className={inputClassName} />
                          </label>
                          <label className={labelClassName}>
                            Metadata JSON
                            <textarea name="metadata" rows={3} defaultValue={JSON.stringify(product.metadata, null, 2)} className={inputClassName} />
                          </label>
                          <label className={labelClassName}>
                            Price
                            <input
                              name="price"
                              type="number"
                              min="0"
                              step="0.01"
                              defaultValue={defaultPrice?.unit_amount ? (defaultPrice.unit_amount / 100).toFixed(2) : ""}
                              className={inputClassName}
                            />
                          </label>
                          <button className={primaryButtonClassName}>Save changes</button>
                        </form>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
        ) : null}

        {selectedView === "customers" ? (
        <section className={panelClassName}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Customer management
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-stone-950">Customer records</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                Keep contact details accurate so support, fulfillment, and billing stay aligned.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-3 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
              <CircleUserRound className="h-5 w-5" />
            </div>
          </div>

          <form action={createCustomerAction} className={formShellClassName}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-stone-950">Create customer</h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                  Capture the essentials now and enrich records later as orders come in.
                </p>
              </div>
              <div className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 shadow-sm md:block dark:bg-stone-950 dark:text-stone-300">
                CRM entry
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClassName}>
                Name
                <input name="name" required className={inputClassName} placeholder="Nguyen Van A" />
              </label>
              <label className={labelClassName}>
                Email
                <input name="email" type="email" required className={inputClassName} placeholder="customer@example.com" />
              </label>
              <label className={labelClassName}>
                Phone
                <input name="phone" className={inputClassName} placeholder="+84 90 000 0000" />
              </label>
            </div>
            <label className={labelClassName}>
              Notes
              <textarea name="notes" rows={3} className={inputClassName} placeholder="VIP customer, wholesale buyer, internal notes..." />
            </label>
            <button className={primaryButtonClassName}>
              Create customer
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className={collectionShellClassName}>
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4 dark:border-stone-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  All customers
                </p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                  {customers.length} customer profiles available in Stripe.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 dark:bg-stone-950 dark:text-stone-300">
                {customersWithEmail} with email
              </span>
            </div>

            <div className="mt-4 space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className={subPanelClassName}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-stone-950">
                      {customer.name || "Unnamed customer"}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      {customer.id}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {customer.email ? (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {customer.email}
                          </span>
                        </span>
                      ) : null}
                      {customer.phone ? (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {customer.phone}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                    {customer.created
                      ? new Date(customer.created * 1000).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "No date"}
                  </p>
                </div>

                <form action={updateCustomerAction} className="mt-5 space-y-4 rounded-[1.5rem] border border-stone-200/80 bg-stone-50/70 p-4 dark:border-stone-700 dark:bg-stone-900/40">
                  <input type="hidden" name="customerId" value={customer.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className={labelClassName}>
                      Name
                      <input name="name" required defaultValue={customer.name ?? ""} className={inputClassName} />
                    </label>
                    <label className={labelClassName}>
                      Email
                      <input
                        name="email"
                        type="email"
                        required
                        defaultValue={customer.email ?? ""}
                        className={inputClassName}
                      />
                    </label>
                    <label className={labelClassName}>
                      Phone
                      <input name="phone" defaultValue={customer.phone ?? ""} className={inputClassName} />
                    </label>
                  </div>
                  <label className={labelClassName}>
                    Notes
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={customer.description ?? ""}
                      className={inputClassName}
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button className={primaryButtonClassName}>
                      <CreditCard className="h-4 w-4" />
                      Save customer
                    </button>
                    <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
                      <Mail className="h-4 w-4" />
                      Keep email and phone current
                    </span>
                  </div>
                </form>

                <form action={deleteCustomerAction} className="mt-4">
                  <input type="hidden" name="customerId" value={customer.id} />
                  <button className={dangerButtonClassName}>
                    <Trash2 className="h-4 w-4" />
                    Delete customer
                  </button>
                </form>
              </div>
            ))}
            </div>
          </div>
        </section>
        ) : null}
      </div>
    </div>
  );
}
