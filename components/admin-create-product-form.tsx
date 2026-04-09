"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { AdminSubmitButton } from "@/components/admin-submit-button";
import { createProductStateAction, type AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = {
  status: "idle",
  message: "",
};

type AdminCreateProductFormProps = {
  formClassName: string;
  labelClassName: string;
  inputClassName: string;
  primaryButtonClassName: string;
};

export const AdminCreateProductForm = ({
  formClassName,
  labelClassName,
  inputClassName,
  primaryButtonClassName,
}: AdminCreateProductFormProps) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createProductStateAction, initialState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    formRef.current?.reset();
    router.refresh();
  }, [router, state.status]);

  return (
    <form ref={formRef} action={formAction} className={formClassName}>
      <CreateProductFields
        state={state}
        labelClassName={labelClassName}
        inputClassName={inputClassName}
        primaryButtonClassName={primaryButtonClassName}
      />
    </form>
  );
};

const CreateProductFields = ({
  state,
  labelClassName,
  inputClassName,
  primaryButtonClassName,
}: {
  state: AdminActionState;
  labelClassName: string;
  inputClassName: string;
  primaryButtonClassName: string;
}) => {
  const { pending } = useFormStatus();

  return (
    <fieldset disabled={pending} className="space-y-5 disabled:cursor-not-allowed">
      <input type="hidden" name="existingImages" value="" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-stone-950">Create product</h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            Add a new product record in PostgreSQL and upload its images to a media host.
          </p>
        </div>
        <div className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 shadow-sm md:block dark:bg-stone-950 dark:text-stone-300">
          New entry
        </div>
      </div>
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
        Product images
        <input
          name="imageFiles"
          type="file"
          accept="image/*"
          multiple
          className={inputClassName}
        />
      </label>
      <label className={labelClassName}>
        Metadata JSON
        <textarea name="metadata" rows={3} className={inputClassName} placeholder='{"category":"Studio Picks","featured":"true"}' />
      </label>
      <AdminSubmitButton
        idleLabel="Create product"
        pendingLabel="Creating product..."
        className={primaryButtonClassName}
        fullscreenPending
      />
    </fieldset>
  );
};
