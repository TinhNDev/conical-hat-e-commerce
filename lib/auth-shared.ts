export type UserRole = "admin" | "customer";

export const AUTH_ROLE_COOKIE = "atelier-role";
export const AUTH_EMAIL_COOKIE = "atelier-email";

const DEFAULT_ADMIN_EMAILS = ["admin@atelier.store"];

const parseAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? DEFAULT_ADMIN_EMAILS.join(","))
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const getRoleForEmail = (email: string): UserRole => {
  const normalizedEmail = email.trim().toLowerCase();
  return parseAdminEmails().includes(normalizedEmail) ? "admin" : "customer";
};
