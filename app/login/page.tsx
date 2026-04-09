import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <AuthPanel mode="login" />
      <p className="text-center text-sm text-stone-600">
        Bạn chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-stone-950 underline">
          Đăng ký tại đây
        </Link>
      </p>
    </div>
  );
}
