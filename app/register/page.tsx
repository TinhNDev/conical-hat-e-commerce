import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";

export default function RegisterPage() {
  return (
    <div className="space-y-6 pb-10">
      <AuthPanel mode="register" />
      <p className="text-center text-sm text-stone-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-stone-950 underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
