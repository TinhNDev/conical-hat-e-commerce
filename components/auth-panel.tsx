"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useAppStore } from "@/store/app-store";
import { useToastStore } from "@/store/toast-store";
import { getRoleForEmail } from "@/lib/auth-shared";
import { syncRegisteredCustomer } from "@/app/register/actions";

interface AuthPanelProps {
  mode: "login" | "register";
}

export const AuthPanel = ({ mode }: AuthPanelProps) => {
  const router = useRouter();
  const { login, register } = useAppStore();
  const { addToast } = useToastStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rolePreview = form.email.trim() ? getRoleForEmail(form.email.trim()) : "customer";

  const onSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      addToast({
        title: "Form error",
        description: "Email and password are required.",
        variant: "error",
      });
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      addToast({
        title: "Form error",
        description: "Please enter a valid email address.",
        variant: "error",
      });
      return;
    }

    if (mode === "register") {
      if (!form.name.trim() || !form.studentId.trim()) {
        setError("Name and student ID are required.");
        addToast({
          title: "Form error",
          description: "Name and student ID are required.",
          variant: "error",
        });
        return;
      }

      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        addToast({
          title: "Form error",
          description: "Password must be at least 6 characters.",
          variant: "error",
        });
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Password confirmation does not match.");
        addToast({
          title: "Form error",
          description: "Password confirmation does not match.",
          variant: "error",
        });
        return;
      }

      try {
        setIsSubmitting(true);
        await syncRegisteredCustomer({
          name: form.name.trim(),
          email: form.email.trim(),
          studentId: form.studentId.trim(),
          rememberMe: form.rememberMe,
        });
        register({
          name: form.name.trim(),
          email: form.email.trim(),
          studentId: form.studentId.trim(),
          rememberMe: form.rememberMe,
        });
      } catch (registrationError) {
        const message =
          registrationError instanceof Error
            ? registrationError.message
            : "Unable to create your Stripe customer profile.";
        setError(message);
        addToast({
          title: "Registration error",
          description: message,
          variant: "error",
        });
        setIsSubmitting(false);
        return;
      }
    } else {
      login({
        email: form.email.trim(),
        rememberMe: form.rememberMe,
      });
    }

    setError("");
    addToast({
      title: mode === "login" ? "Login successful" : "Registration successful",
      description:
        mode === "login"
          ? `You are now signed in as ${getRoleForEmail(form.email.trim())}.`
          : `Your account has been created with ${getRoleForEmail(form.email.trim())} access.`,
      variant: "success",
    });
    router.push(getRoleForEmail(form.email.trim()) === "admin" ? "/admin" : "/dashboard");
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
        {mode === "login" ? "Login" : "Register"}
      </p>
      <h1 className="mt-4 font-display text-4xl text-stone-950">
        {mode === "login"
          ? "Welcome back"
          : "Create your shopper profile"}
      </h1>
      <p className="mt-3 text-sm leading-7 text-stone-600">
        Includes client-side validation, clear inline error messages, and a
        remember me option stored locally for this demo project.
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">
        Current role for this email: {rolePreview}
      </p>

      <div className="mt-8 space-y-4">
        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Full name</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
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
            <span className="text-sm font-medium text-stone-700">
              Confirm password
            </span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
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
              setForm((current) => ({
                ...current,
                rememberMe: event.target.checked,
              }))
            }
          />
          Remember me
        </label>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full rounded-full bg-stone-950 py-6 text-sm uppercase tracking-[0.18em] hover:bg-stone-800"
        >
          {isSubmitting ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </div>
    </div>
  );
};
