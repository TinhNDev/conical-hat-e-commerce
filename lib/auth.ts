import "server-only";

import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { UserProfile } from "@/lib/ecommerce";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  createAccessToken,
  getAccessTokenMaxAge,
  getRefreshTokenMaxAge,
  verifyAccessToken,
} from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

type UserRole = "admin" | "manager" | "customer";

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

const toPublicUser = (user: {
  name: string;
  email: string;
  studentId: string;
  role: UserRole;
}): UserProfile => ({
  name: user.name,
  email: user.email,
  studentId: user.studentId,
  role: user.role,
});

const hashPassword = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString("hex");

const generatePasswordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPassword(password, salt)}`;
};

const generateStudentId = () => `CUS-${randomBytes(4).toString("hex").toUpperCase()}`;

const verifyPassword = (password: string, storedHash: string) => {
  const [salt, hashedValue] = storedHash.split(":");

  if (!salt || !hashedValue) {
    return false;
  }

  const suppliedHash = hashPassword(password, salt);
  return timingSafeEqual(Buffer.from(suppliedHash, "hex"), Buffer.from(hashedValue, "hex"));
};

const generateOpaqueToken = () => randomBytes(32).toString("hex");

const hashOpaqueToken = (token: string) => createHash("sha256").update(token).digest("hex");

const setAuthCookies = async ({
  accessToken,
  refreshToken,
  rememberMe,
}: {
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
}) => {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: getAccessTokenMaxAge(),
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: getRefreshTokenMaxAge(rememberMe),
  });
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 0,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 0,
  });
};

const persistRefreshToken = async ({
  userId,
  rememberMe,
}: {
  userId: string;
  rememberMe: boolean;
}) => {
  const refreshToken = generateOpaqueToken();
  const refreshTokenHash = hashOpaqueToken(refreshToken);
  const expiresAt = new Date(Date.now() + getRefreshTokenMaxAge(rememberMe) * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: refreshTokenHash,
      expiresAt,
    },
  });

  return refreshToken;
};

export const revokeRefreshToken = async (token: string | undefined | null) => {
  if (!token) {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash: hashOpaqueToken(token),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const issueAuthSession = async ({
  user,
  rememberMe,
}: {
  user: { id: string; name: string; email: string; studentId: string; role: UserRole };
  rememberMe: boolean;
}) => {
  const publicUser = toPublicUser(user);
  const accessToken = await createAccessToken(publicUser);
  const refreshToken = await persistRefreshToken({
    userId: user.id,
    rememberMe,
  });

  await setAuthCookies({
    accessToken,
    refreshToken,
    rememberMe,
  });

  return publicUser;
};

export const getSessionFromCookies = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const user = await verifyAccessToken(token);

  return {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin" || user?.role === "manager",
  };
};

export const rotateRefreshToken = async (refreshToken: string | undefined | null) => {
  if (!refreshToken) {
    return null;
  }

  const existingToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash: hashOpaqueToken(refreshToken),
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!existingToken) {
    return null;
  }

  await prisma.refreshToken.update({
    where: {
      id: existingToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  const rememberMe = existingToken.expiresAt.getTime() - existingToken.createdAt.getTime() > 24 * 60 * 60 * 1000;
  return issueAuthSession({
    user: existingToken.user,
    rememberMe,
  });
};

export const syncStripeCustomerForUser = async (user: UserProfile) => {
  const existingCustomers = await stripe.customers.list({
    email: user.email,
    limit: 1,
  });

  const existingCustomer = existingCustomers.data[0];

  if (existingCustomer) {
    await stripe.customers.update(existingCustomer.id, {
      name: user.name,
      email: user.email,
      metadata: {
        ...existingCustomer.metadata,
        studentId: user.studentId,
        role: user.role,
      },
      description: `Student ID: ${user.studentId}`,
    });

    await prisma.user.updateMany({
      where: { email: user.email },
      data: { stripeCustomerId: existingCustomer.id },
    });
    return existingCustomer.id;
  }

  const customer = await stripe.customers.create({
    name: user.name,
    email: user.email,
    metadata: {
      studentId: user.studentId,
      role: user.role,
    },
    description: `Student ID: ${user.studentId}`,
  });

  await prisma.user.updateMany({
    where: { email: user.email },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
};

export const registerUser = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      studentId: generateStudentId(),
      role: getRoleForEmail(normalizedEmail),
      passwordHash: generatePasswordHash(password),
    },
  });

  await syncStripeCustomerForUser(toPublicUser(user));

  return user;
};

export const authenticateUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password.");
  }

  return user;
};

const createTokenRecord = async ({
  type,
  userId,
  expiresInHours,
}: {
  type: "verification" | "passwordReset";
  userId: string;
  expiresInHours: number;
}) => {
  const token = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(token);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  if (type === "verification") {
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  } else {
    await prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  return token;
};

export const createEmailVerificationToken = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return createTokenRecord({
    type: "verification",
    userId: user.id,
    expiresInHours: 24,
  });
};

export const verifyEmailToken = async (token: string) => {
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      tokenHash: hashOpaqueToken(token),
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new Error("Verification token is invalid or expired.");
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);
};

export const createPasswordResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return createTokenRecord({
    type: "passwordReset",
    userId: user.id,
    expiresInHours: 2,
  });
};

export const consumePasswordResetToken = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: hashOpaqueToken(token),
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new Error("Password reset token is invalid or expired.");
  }

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: generatePasswordHash(password) },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
};

export const getRefreshTokenFromCookies = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
};
