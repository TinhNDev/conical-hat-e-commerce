"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { formatPrice, PaymentMethod } from "@/lib/ecommerce";
import { useAppStore } from "@/store/app-store";
import { useCartStore } from "@/store/cart-store";
import { useToastStore } from "@/store/toast-store";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export const CheckoutForm = () => {
  const router = useRouter();
  const { items, discountPercentage, clearCart } = useCartStore();
  const { addOrder, auth } = useAppStore();
  const { addToast } = useToastStore();

  const [form, setForm] = useState({
    ...initialForm,
    fullName: auth.user?.name ?? "",
    email: auth.user?.email ?? "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || auth.user?.name || "",
      email: current.email || auth.user?.email || "",
    }));
  }, [auth.user?.email, auth.user?.name]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const total = subtotal - discountAmount;

  const paymentMethodLabel: Record<PaymentMethod, string> = {
    card: "Thẻ",
    cod: "COD",
    bank: "Chuyển khoản",
  };

  const onSubmit = () => {
    if (!auth.isAuthenticated || !auth.user) {
      setError("Vui lòng đăng nhập trước khi đặt hàng.");

      addToast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để tiếp tục thanh toán.",
        variant: "error",
      });

      router.push("/login?redirect=/checkout");
      return;
    }

    const requiredFields = [
      form.fullName,
      form.email,
      form.phone,
      form.addressLine1,
      form.city,
      form.state,
      form.postalCode,
      form.country,
    ];

    if (!items.length) {
      setError("Giỏ hàng của bạn đang trống.");

      addToast({
        title: "Không thể thanh toán",
        description: "Giỏ hàng của bạn đang trống.",
        variant: "error",
      });

      return;
    }

    if (requiredFields.some((value) => !value.trim())) {
      setError("Vui lòng điền đầy đủ thông tin giao hàng trước khi đặt hàng.");

      addToast({
        title: "Thông tin chưa đầy đủ",
        description:
          "Vui lòng điền đầy đủ thông tin giao hàng trước khi đặt hàng.",
        variant: "error",
      });

      return;
    }

    setError("");

    addOrder({
      items,
      discountAmount,
      total,
      paymentMethod,
      shippingAddress: form,
    })
      .then((order) => {
        clearCart();

        addToast({
          title: "Đặt hàng thành công",
          description: `Đơn hàng ${order.id} đã được tạo thành công.`,
          variant: "success",
        });

        router.push(`/success?orderId=${order.id}`);
      })
      .catch((submissionError: unknown) => {
        const message =
          submissionError instanceof Error
            ? submissionError.message
            : "Không thể đặt hàng.";

        setError(message);

        addToast({
          title: "Thanh toán thất bại",
          description: message,
          variant: "error",
        });
      });
  };

  if (!items.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
        <h1 className="font-display text-4xl text-stone-950">
          Giỏ hàng của bạn đang trống
        </h1>

        <p className="mt-3 text-sm text-stone-600">
          Hãy thêm sản phẩm vào giỏ hàng trước, sau đó quay lại để hoàn tất
          thông tin giao hàng và thanh toán.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Thông tin giao hàng
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["fullName", "Họ và tên"],
              ["email", "Email"],
              ["phone", "Số điện thoại"],
              ["addressLine1", "Địa chỉ"],
              ["addressLine2", "Địa chỉ bổ sung"],
              ["city", "Thành phố"],
              ["state", "Tỉnh / Khu vực"],
              ["postalCode", "Mã bưu điện"],
              ["country", "Quốc gia"],
            ].map(([key, label]) => (
              <label
                key={key}
                className={`space-y-2 ${
                  key === "addressLine1" || key === "addressLine2"
                    ? "sm:col-span-2"
                    : ""
                }`}
              >
                <span className="text-sm font-medium text-stone-700">
                  {label}
                </span>

                <input
                  value={form[key as keyof typeof form]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#faf7f2_0%,#ffffff_100%)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Phương thức thanh toán
          </p>

          <div className="mt-5 space-y-3">
            {[
              {
                value: "card",
                label: "Thanh toán bằng thẻ",
                note: "Xác nhận đơn hàng ngay lập tức cho đơn demo.",
              },
              {
                value: "cod",
                label: "Thanh toán khi nhận hàng",
                note: "Phù hợp để kiểm tra luồng thanh toán thay thế.",
              },
              {
                value: "bank",
                label: "Chuyển khoản ngân hàng",
                note: "Đơn hàng sẽ được đánh dấu là đang xử lý.",
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-[1.25rem] border px-4 py-4 transition ${
                  paymentMethod === option.value
                    ? "border-[#8f5f2a] bg-[#8f5f2a] text-white"
                    : "border-stone-200 bg-white text-stone-900 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() =>
                    setPaymentMethod(option.value as PaymentMethod)
                  }
                  className="mt-1"
                />

                <div>
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-sm opacity-80">{option.note}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-[1.75rem] border border-[#d9c8ae] bg-[linear-gradient(180deg,#8f5f2a_0%,#6f7f59_100%)] p-6 text-stone-50">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-200/80">
          Tóm tắt đơn hàng
        </p>

        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-stone-200/80">
                  Số lượng {item.quantity}
                </p>
              </div>

              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Giảm giá</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>

          <div className="flex justify-between">
            <span>Phương thức đã chọn</span>
            <span>{paymentMethodLabel[paymentMethod]}</span>
          </div>

          <div className="flex justify-between text-lg font-semibold">
            <span>Tổng cộng</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <Button
          onClick={onSubmit}
          className="mt-6 w-full rounded-full bg-amber-200 text-stone-950 hover:bg-amber-100"
        >
          Đặt hàng
        </Button>
      </aside>
    </div>
  );
};