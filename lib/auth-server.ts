import "server-only";

import { cookies } from "next/headers";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE } from "@/lib/auth-shared";

export const getSessionFromCookies = async () => {
  const cookieStore = await cookies();
  const role = cookieStore.get(AUTH_ROLE_COOKIE)?.value;
  const email = cookieStore.get(AUTH_EMAIL_COOKIE)?.value;

  return {
    role: role === "admin" ? "admin" : "customer",
    email: email ?? null,
    isAdmin: role === "admin",
  };
};
