import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdminCreateProductForm } from "@/components/admin-create-product-form";
import { AdminDeleteProductForm } from "@/components/admin-delete-product-form";
import { AdminUpdateProductForm } from "@/components/admin-update-product-form";
import { ProductList } from "@/components/product-list";
import { getAdminCustomers, getAdminProducts, syncAdminDataFromStripe } from "@/lib/admin-data";
import { getSessionFromCookies } from "@/lib/auth";
import { getCatalogProducts } from "@/lib/catalog-data";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  createCustomerAction,
  deleteCustomerAction,
  updateCustomerAction,
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
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#8f5f2a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#7a5124] dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200";
const dangerButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-200 dark:hover:bg-rose-950/30";

function AdminProductEditorItem({
  product,
  labelClassName,
  inputClassName,
  primaryButtonClassName,
  dangerButtonClassName,
  subPanelClassName,
}: {
  product: {
    id: string;
    name: string;
    description: string | null;
    currency: string;
    status: string;
    basePriceAmount: string | null;
    images: Array<{ url: string }>;
  };
  labelClassName: string;
  inputClassName: string;
  primaryButtonClassName: string;
  dangerButtonClassName: string;
  subPanelClassName: string;
}) {
  return (
    <article className={`${subPanelClassName} space-y-5`}>
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#ffffff_100%)] p-5 dark:border-stone-700 dark:bg-stone-900/50 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-stone-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-stone-100 dark:text-stone-950">
              {product.status === "active" ? "Đang bán" : "Đã ẩn"}
            </span>
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
              {product.images.length} ảnh
            </span>
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
              {product.currency.toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-stone-950 dark:text-stone-100">
              {product.name}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300">
              {product.description || "Sản phẩm này chưa có mô tả chi tiết."}
            </p>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Mã sản phẩm
          </p>
          <p className="mt-2 break-all font-mono text-xs">
            {product.id}
          </p>
        </div>
      </div>

      <AdminUpdateProductForm
        product={product}
        formClassName="space-y-5"
        labelClassName={labelClassName}
        inputClassName={inputClassName}
        primaryButtonClassName={primaryButtonClassName}
      />

      <div className="flex justify-end border-t border-stone-200 pt-4 dark:border-stone-700">
        <AdminDeleteProductForm
          productId={product.id}
          className={dangerButtonClassName}
        />
      </div>
    </article>
  );
}

type AdminPageProps = {
  searchParams?: Promise<{
    type?: string;
    message?: string;
    view?: string;
    productTab?: string;
  }>;
};

type AdminSearchParams = {
  type?: string;
  message?: string;
  view?: string;
  productTab?: string;
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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getSessionFromCookies();

  if (!session.isAdmin || !session.user) {
    redirect("/login?redirect=/admin");
  }

  const resolvedSearchParams = await ((searchParams ?? Promise.resolve({})) as Promise<AdminSearchParams>);
  const selectedView = resolvedSearchParams.view === "customers" ? "customers" : "products";
  const selectedProductTab = resolvedSearchParams.productTab === "catalog" ? "catalog" : "create";

  if (selectedView === "customers") {
    await syncAdminDataFromStripe();
  }

  const [products, customers] = await Promise.all([getAdminProducts(), getAdminCustomers()]);
  const editableProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    currency: product.currency,
    status: product.status,
    basePriceAmount:
      product.basePriceAmount != null ? product.basePriceAmount.toString() : null,
    images: product.images.map((image) => ({ url: image.url })),
  }));
  const activeProductRecords = editableProducts.filter((product) => product.status === "active");
  const archivedProductRecords = editableProducts.filter((product) => product.status === "archived");
  const activeProducts = activeProductRecords.length;
  const customersWithEmail = customers.filter((customer) => Boolean(customer.email)).length;
  const storefrontProducts =
    selectedView === "products" && selectedProductTab === "catalog"
      ? await getCatalogProducts(Math.max(activeProducts, 1))
      : [];

return (
  <div className="space-y-8 pb-10">
    <Breadcrumbs
      items={[
        { href: "/", label: "Trang chủ" },
        { label: "Quản trị" },
      ]}
    />

    <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#f6efe4_0%,#faf7f2_42%,#e8f1ec_100%)] px-6 py-10">
      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600">
            <ShieldCheck className="h-4 w-4" />
            Bảng điều khiển
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
              Quản lý cửa hàng
            </p>
            <h1 className="mt-4 text-5xl font-display text-stone-950">
              Quản lý nón lá, giá bán và khách hàng
            </h1>
            <p className="mt-4 text-sm text-stone-700">
              Quản lý sản phẩm, cập nhật giá và theo dõi khách hàng một cách đơn giản và nhanh chóng.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-stone-700">
            <div className="rounded-full border bg-white px-4 py-2">
              {session.user.email}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <AdminStatCard
            label="Sản phẩm"
            value={products.length.toString()}
            detail={`${activeProducts} đang hiển thị`}
          />
          <AdminStatCard
            label="Khách hàng"
            value={customers.length.toString()}
            detail={`${customersWithEmail} có email`}
          />
        </div>
      </div>
    </section>

    <div className="flex gap-3">
      <Link href={`/admin?view=products`}>
        <button className="px-5 py-3 rounded-full bg-[#8f5f2a] text-white">
          Sản phẩm
        </button>
      </Link>

      <Link href="/admin?view=customers">
        <button className="px-5 py-3 rounded-full border">
          Khách hàng
        </button>
      </Link>
    </div>

    {/* ================= PRODUCTS ================= */}
    {selectedView === "products" && (
      <section className={panelClassName}>
        <div>
          <p className="text-xs uppercase text-stone-500">
            Quản lý sản phẩm
          </p>
          <h2 className="text-3xl font-semibold text-stone-950">
            Danh mục nón lá
          </h2>
          <p className="text-sm text-stone-600">
            Tạo mới, chỉnh sửa và quản lý sản phẩm nón lá trong cửa hàng.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            href="/admin?view=products&productTab=create"
            className={`px-5 py-3 rounded-full ${
              selectedProductTab === "create"
                ? "bg-[#8f5f2a] text-white"
                : "border border-stone-300 bg-white text-stone-700"
            }`}
          >
            Thêm sản phẩm
          </Link>

          <Link
            href="/admin?view=products&productTab=catalog"
            className={`px-5 py-3 rounded-full ${
              selectedProductTab === "catalog"
                ? "bg-[#8f5f2a] text-white"
                : "border border-stone-300 bg-white text-stone-700"
            }`}
          >
            Danh sách sản phẩm
          </Link>
        </div>

        {/* CREATE */}
        {selectedProductTab === "create" && (
          <AdminCreateProductForm
            formClassName={formShellClassName}
            labelClassName={labelClassName}
            inputClassName={inputClassName}
            primaryButtonClassName={primaryButtonClassName}
          />
        )}

        {/* CATALOG */}
        {selectedProductTab === "catalog" && (
          <div className="space-y-6 mt-6">
            <ProductList products={storefrontProducts} />

            <div>
              <p className="text-xs uppercase text-stone-500">
                Sản phẩm đang bán
              </p>

              {activeProductRecords.map((product) => (
                <AdminProductEditorItem
                  key={product.id}
                  product={product}
                  labelClassName={labelClassName}
                  inputClassName={inputClassName}
                  primaryButtonClassName={primaryButtonClassName}
                  dangerButtonClassName={dangerButtonClassName}
                  subPanelClassName={subPanelClassName}
                />
              ))}
            </div>

            <div>
              <p className="text-xs uppercase text-stone-500">
                Sản phẩm ngưng hiển thị
              </p>

              {archivedProductRecords.length ? (
                archivedProductRecords.map((product) => (
                  <AdminProductEditorItem
                    key={product.id}
                    product={product}
                    labelClassName={labelClassName}
                    inputClassName={inputClassName}
                    primaryButtonClassName={primaryButtonClassName}
                    dangerButtonClassName={dangerButtonClassName}
                    subPanelClassName={subPanelClassName}
                  />
                ))
              ) : (
                <div className={subPanelClassName}>
                  <p className="text-sm text-stone-600">
                    Chưa có sản phẩm nào ở trạng thái ngưng hiển thị.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    )}

    {/* ================= CUSTOMERS ================= */}
    {selectedView === "customers" && (
      <section className={panelClassName}>
        <div>
          <p className="text-xs uppercase text-stone-500">
            Quản lý khách hàng
          </p>
          <h2 className="text-3xl font-semibold text-stone-950">
            Danh sách khách hàng
          </h2>
          <p className="text-sm text-stone-600">
            Lưu thông tin khách hàng để hỗ trợ bán hàng và chăm sóc tốt hơn.
          </p>
        </div>

        <form action={createCustomerAction} className={formShellClassName}>
          <h3 className="text-lg font-semibold">Thêm khách hàng</h3>

          <input name="name" placeholder="Tên khách hàng" />
          <input name="email" placeholder="Email" />
          <input name="phone" placeholder="Số điện thoại" />

          <textarea name="notes" placeholder="Ghi chú..." />

          <button className={primaryButtonClassName}>
            Tạo khách hàng
          </button>
        </form>

        <div>
          {customers.map((customer) => (
            <div key={customer.id} className={subPanelClassName}>
              <h3>{customer.name || "Khách hàng"}</h3>

              <form action={updateCustomerAction}>
                <input name="name" defaultValue={customer.name ?? ""} />
                <input name="email" defaultValue={customer.email ?? ""} />
                <input name="phone" defaultValue={customer.phone ?? ""} />

                <button className={primaryButtonClassName}>
                  Lưu
                </button>
              </form>

              <form action={deleteCustomerAction}>
                <button className={dangerButtonClassName}>
                  Xóa khách hàng
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    )}
  </div>
);
}
