"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSubmitButton } from "@/components/admin-submit-button";
import { deleteProductStateAction, type AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = {
  status: "idle",
  message: "",
};

type AdminDeleteProductFormProps = {
  productId: string;
  className: string;
};

export const AdminDeleteProductForm = ({
  productId,
  className,
}: AdminDeleteProductFormProps) => {
  const router = useRouter();
  const [state, formAction] = useActionState(deleteProductStateAction, initialState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    router.refresh();
  }, [router, state.status]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="productId" value={productId} />
      {state.status === "error" ? (
        <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {state.message}
        </div>
      ) : null}
      <AdminSubmitButton
        idleLabel="Xóa vĩnh viễn"
        pendingLabel="Đang xóa vĩnh viễn..."
        className={className}
        fullscreenPending
      />
    </form>
  );
};
