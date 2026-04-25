"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/store/toast-store";

const SHOP_EMAIL = "24126125@student.hcmute.edu.vn";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToastStore();

  const onSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin liên hệ.");
      setSubmitted(false);

      addToast({
        title: "Gửi thất bại",
        description: "Vui lòng nhập đầy đủ thông tin liên hệ.",
        variant: "error",
      });

      return;
    }

    if (!form.email.includes("@")) {
      setError("Vui lòng nhập email hợp lệ.");
      setSubmitted(false);

      addToast({
        title: "Gửi thất bại",
        description: "Vui lòng nhập email hợp lệ.",
        variant: "error",
      });

      return;
    }

    try {
      setLoading(true);
      setError("");
      setSubmitted(false);

await emailjs.send(
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
  {
    from_name: form.name,
    from_email: form.email,
    message: form.message,
  },
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
);
      setSubmitted(true);
      setForm({
        name: "",
        email: "",
        message: "",
      });

      addToast({
        title: "Gửi thành công",
        description: "Thông tin liên hệ đã được gửi tới shop.",
        variant: "success",
      });
    } catch {
      setError("Không thể gửi email. Vui lòng thử lại sau.");

      addToast({
        title: "Gửi thất bại",
        description: "Không thể gửi email. Vui lòng thử lại sau.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 pb-10 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f5f2a]">
          Liên hệ
        </p>

        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Liên hệ với LUMI
        </h1>

        <p className="mt-4 text-sm leading-7 text-stone-600">
          Bạn có thể gửi thông tin để được tư vấn sản phẩm, đặt thiết kế riêng
          hoặc trao đổi thêm với shop.
        </p>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-[#f8f1e8] p-4 text-sm text-stone-700">
          <p className="font-semibold text-stone-950">Email shop</p>
          <p className="mt-1">{SHOP_EMAIL}</p>

          <p className="mt-3 font-semibold text-stone-950">Địa chỉ</p>
          <p className="mt-1">
            Trường Đại học Sư phạm Kỹ thuật TP.HCM, 1 Võ Văn Ngân, TP. Thủ Đức,
            TP.HCM
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder="Họ và tên"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
          />

          <input
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="Email của bạn"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
          />

          <textarea
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            placeholder="Bạn cần LUMI hỗ trợ gì?"
            rows={6}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
          />

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          {submitted ? (
            <p className="text-sm text-emerald-700">
              Gửi thành công. Shop sẽ liên hệ lại qua email bạn đã cung cấp.
            </p>
          ) : null}

          <Button
            onClick={onSubmit}
            disabled={loading}
            className="rounded-full bg-stone-950 px-7 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang gửi..." : "Gửi liên hệ"}
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100 shadow-sm">
        <iframe
          title="Google Map - HCMUTE"
          src="https://www.google.com/maps?q=Tr%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20h%E1%BB%8Dc%20S%C6%B0%20ph%E1%BA%A1m%20K%E1%BB%B9%20thu%E1%BA%ADt%20TP.HCM%2C%201%20V%C3%B5%20V%C4%83n%20Ng%C3%A2n%2C%20TP.%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%2C%20TP.HCM&z=17&output=embed"
          className="h-full min-h-[520px] w-full"
          loading="lazy"
        />
      </section>
    </div>
  );
}