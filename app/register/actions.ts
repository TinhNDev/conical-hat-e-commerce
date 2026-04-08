"use server";

import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";
import { AUTH_EMAIL_COOKIE, AUTH_ROLE_COOKIE, getRoleForEmail } from "@/lib/auth-shared";

type RegisterCustomerInput = {
  name: string;
  email: string;
  studentId: string;
  rememberMe: boolean;
};

export async function syncRegisteredCustomer({
  name,
  email,
  studentId,
  rememberMe,
}: RegisterCustomerInput) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  const normalizedStudentId = studentId.trim();
  const role = getRoleForEmail(normalizedEmail);

  const existingCustomers = await stripe.customers.list({
    email: normalizedEmail,
    limit: 1,
  });

  const existingCustomer = existingCustomers.data[0];

  if (existingCustomer) {
    await stripe.customers.update(existingCustomer.id, {
      name: normalizedName,
      email: normalizedEmail,
      metadata: {
        ...existingCustomer.metadata,
        studentId: normalizedStudentId,
      },
      description: `Student ID: ${normalizedStudentId}`,
    });
  } else {
    await stripe.customers.create({
      name: normalizedName,
      email: normalizedEmail,
      metadata: {
        studentId: normalizedStudentId,
      },
      description: `Student ID: ${normalizedStudentId}`,
    });
  }

  const cookieStore = await cookies();
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined;

  cookieStore.set(AUTH_EMAIL_COOKIE, normalizedEmail, {
    path: "/",
    sameSite: "lax",
    maxAge,
  });
  cookieStore.set(AUTH_ROLE_COOKIE, role, {
    path: "/",
    sameSite: "lax",
    maxAge,
  });

  return { role };
}
