"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { useAppStore } from "@/store/app-store";

interface AuthPanelProps {
  mode: "login" | "register";
}

export const AuthPanel = ({ mode }: AuthPanelProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAppStore((state) => state.login);
  const register = useAppStore((state) => state.register);
  const auth = useAppStore((state) => state.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");

  const onSubmit = async () => {
    try {
      setError("");

      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          setError("Password confirmation does not match.");
          return;
        }

        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          studentId: form.studentId,
          rememberMe: form.rememberMe,
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
          rememberMe: form.rememberMe,
        });
      }

      const nextRole = useAppStore.getState().auth.user?.role;
      const redirectTarget = searchParams.get("redirect");
      router.push(redirectTarget ?? (nextRole === "admin" ? "/admin" : "/dashboard"));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit form.");
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
        {mode === "login" ? "Login" : "Register"}
      </p>
      <h1 className="mt-4 font-display text-4xl text-stone-950">
        {mode === "login" ? "Welcome back" : "Create your shopper profile"}
      </h1>
      <p className="mt-3 text-sm leading-7 text-stone-600">
        Authentication is now handled by backend API routes, password hashing, and
        signed HTTP-only session cookies.
      </p>

      <div className="mt-8 space-y-4">
        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Full name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none"
          />
        </label>

        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Student ID</span>
            <input
              value={form.studentId}
              onChange={(event) =>
                setForm((current) => ({ ...current, studentId: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none"
          />
        </label>

        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Confirm password</span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none"
            />
          </label>
        ) : null}

        <label className="flex items-center gap-3 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={(event) =>
              setForm((current) => ({ ...current, rememberMe: event.target.checked }))
            }
          />
          Remember me
        </label>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button
          onClick={onSubmit}
          disabled={auth.isLoading}
          className="w-full rounded-full bg-stone-950 py-6 text-sm uppercase tracking-[0.18em] hover:bg-stone-800"
        >
          {auth.isLoading ? "Please wait" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </div>
    </div>
  );
};
