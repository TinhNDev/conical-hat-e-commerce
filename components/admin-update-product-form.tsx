"use client";

import Image from "next/image";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { AdminSubmitButton } from "@/components/admin-submit-button";
import { updateProductStateAction, type AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = {
  status: "idle",
  message: "",
};

type AdminUpdateProductFormProps = {
  product: {
    id: string;
    name: string;
    description: string | null;
    currency: string;
    status: string;
    basePriceAmount: { toString(): string } | number | string | null;
    images: Array<{ url: string }>;
  };
  formClassName: string;
  labelClassName: string;
  inputClassName: string;
  primaryButtonClassName: string;
};

export const AdminUpdateProductForm = ({
  product,
  formClassName,
  labelClassName,
  inputClassName,
  primaryButtonClassName,
}: AdminUpdateProductFormProps) => {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProductStateAction, initialState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    router.refresh();
  }, [router, state.status]);

  return (
    <form action={formAction} className={formClassName}>
      <UpdateProductFields
        product={product}
        state={state}
        labelClassName={labelClassName}
        inputClassName={inputClassName}
        primaryButtonClassName={primaryButtonClassName}
      />
    </form>
  );
};

const UpdateProductFields = ({
  product,
  state,
  labelClassName,
  inputClassName,
  primaryButtonClassName,
}: {
  product: AdminUpdateProductFormProps["product"];
  state: AdminActionState;
  labelClassName: string;
  inputClassName: string;
  primaryButtonClassName: string;
}) => {
  const { pending } = useFormStatus();

return (
  <fieldset disabled={pending} className="space-y-5 disabled:cursor-not-allowed">
    <input type="hidden" name="productId" value={product.id} />
    <input type="hidden" name="existingImages" value={product.images.map((image) => image.url).join(",")} />

    {state.status !== "idle" ? (
      <div
        className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
          state.status === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
        }`}
      >
        {state.message}
      </div>
    ) : null}

    <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <div className="space-y-4 rounded-[1.5rem] border border-stone-200 bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] p-4 dark:border-stone-700 dark:bg-stone-900/60">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Thư viện ảnh
          </p>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:bg-stone-950 dark:text-stone-300">
            {product.images.length} ảnh
          </span>
        </div>

        {product.images.length ? (
          <div className="grid grid-cols-2 gap-3">
            {product.images.map((image, index) => (
              <div
                key={`${product.id}-${image.url}-${index}`}
                className="overflow-hidden rounded-[1rem] border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`${product.name} hình ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 180px, (min-width: 768px) 20vw, 40vw"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-stone-300 bg-white/80 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-950">
            Sản phẩm này chưa có hình ảnh.
          </div>
        )}

        <label className={labelClassName}>
          Thay thế hình ảnh
          <input
            name="imageFiles"
            type="file"
            accept="image/*"
            multiple
            className={inputClassName}
          />
        </label>
      </div>

      <div className="space-y-5 rounded-[1.5rem] border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-950">
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClassName}>
            Tên sản phẩm
            <input name="name" required defaultValue={product.name} className={inputClassName} />
          </label>

          <label className={labelClassName}>
            Giá
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product.basePriceAmount ? Number(product.basePriceAmount).toFixed(2) : ""}
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Tiền tệ
            <input
              name="currency"
              defaultValue={product.currency.toUpperCase()}
              className={inputClassName}
            />
          </label>

          <label className={`${labelClassName} flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-900`}>
            <input
              name="active"
              type="checkbox"
              defaultChecked={product.status === "active"}
              className="h-4 w-4 rounded border-stone-300"
            />
            Hiển thị trên cửa hàng
          </label>
        </div>

        <label className={labelClassName}>
          Mô tả
          <textarea
            name="description"
            rows={5}
            defaultValue={product.description ?? ""}
            className={inputClassName}
          />
        </label>
      </div>
    </div>

    <div className="flex flex-wrap gap-3">
      <AdminSubmitButton
        idleLabel="Lưu thay đổi"
        pendingLabel="Đang cập nhật sản phẩm..."
        className={primaryButtonClassName}
        fullscreenPending
      />

      <span className="inline-flex items-center rounded-full bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:bg-stone-950 dark:text-stone-300">
        Tải ảnh mới sẽ thay thế toàn bộ thư viện ảnh hiện tại
      </span>
    </div>
  </fieldset>
);
};
