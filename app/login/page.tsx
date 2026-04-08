import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <div className="space-y-6 pb-10">
      <AuthPanel mode="login" />
      <p className="text-center text-sm text-stone-600">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-stone-950 underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
