"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className: string;
  fullscreenPending?: boolean;
};

export const AdminSubmitButton = ({
  idleLabel,
  pendingLabel,
  className,
  fullscreenPending = false,
}: AdminSubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <>
      {fullscreenPending && pending ? (
        <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-5 text-center text-stone-950">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-stone-300/70" />
              <div className="absolute inset-2 rounded-full border-4 border-stone-300/60 border-t-amber-500 animate-spin" />
              <div className="absolute inset-5 rounded-full border-4 border-transparent border-r-emerald-500 animate-spin [animation-direction:reverse] [animation-duration:1.2s]" />
              <LoaderCircle className="relative z-10 h-7 w-7 animate-spin text-stone-950" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold tracking-[0.18em] uppercase">Processing</p>
              <p className="text-sm text-stone-600">{pendingLabel}</p>
            </div>
          </div>
        </div>
      ) : null}
      <button type="submit" disabled={pending} className={className}>
        {pending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {pendingLabel}
          </>
        ) : (
          idleLabel
        )}
      </button>
    </>
  );
};
