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
    rememberMe: false,
  });
  const [error, setError] = useState("");

  const onSubmit = async () => {
    try {
      setError("");

      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          setError("Mật khẩu xác nhận không khớp.");
          return;
        }

        await register({
          name: form.name,
          email: form.email,
          password: form.password,
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
      setError(
        submitError instanceof Error ? submitError.message : "Không thể gửi biểu mẫu.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f8f2ea_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
        {mode === "login" ? "Đăng nhập" : "Đăng ký"}
      </p>
      <h1 className="mt-4 font-display text-4xl leading-tight text-stone-950">
        {mode === "login"
          ? "Chào mừng bạn quay lại với LUMI"
          : "Tạo tài khoản để bắt đầu mua sắm"}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-stone-700">
        {mode === "login"
          ? "Đăng nhập để theo dõi đơn hàng, lưu sản phẩm yêu thích và tiếp tục hành trình chọn chiếc nón phù hợp với dấu ấn của bạn."
          : "Đăng ký tài khoản để lưu danh sách yêu thích, quản lý đơn hàng và nhận trải nghiệm mua sắm thuận tiện hơn."}
      </p>

      <div className="mt-8 space-y-4">
        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Họ và tên</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nhập họ và tên của bạn"
              className="w-full rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="ban@email.com"
            className="w-full rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">Mật khẩu</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Nhập mật khẩu"
            className="w-full rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
          />
        </label>

        {mode === "register" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Xác nhận mật khẩu</span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              placeholder="Nhập lại mật khẩu"
              className="w-full rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-stone-500"
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
          Ghi nhớ đăng nhập
        </label>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button
          onClick={onSubmit}
          disabled={auth.isLoading}
          className="w-full rounded-full bg-stone-950 py-6 text-sm uppercase tracking-[0.18em] hover:bg-stone-800"
        >
          {auth.isLoading
            ? "Vui lòng chờ"
            : mode === "login"
              ? "Đăng nhập"
              : "Tạo tài khoản"}
        </Button>
      </div>
    </div>
  );
};
