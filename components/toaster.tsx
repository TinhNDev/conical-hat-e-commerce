"use client";

import { useToastStore } from "@/store/toast-store";

const toastStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  error: "border-rose-200 bg-rose-50 text-rose-950",
  info: "border-stone-200 bg-white text-stone-950",
};

export const Toaster = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-[1.25rem] border p-4 shadow-[0_18px_44px_rgba(15,23,42,0.12)] ${toastStyles[toast.variant ?? "info"]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm opacity-80">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-xs font-medium uppercase tracking-[0.18em]"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
