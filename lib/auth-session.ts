import { jwtVerify, SignJWT } from "jose";
import { UserProfile } from "@/lib/ecommerce";

export const ACCESS_TOKEN_COOKIE = "atelier-access-token";
export const REFRESH_TOKEN_COOKIE = "atelier-refresh-token";

const ACCESS_TOKEN_TTL = 60 * 15;
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30;
const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-session-secret-change-me";

type SessionClaims = UserProfile & {
  type: "access";
};

const secretKey = new TextEncoder().encode(SESSION_SECRET);

export const getAccessTokenMaxAge = () => ACCESS_TOKEN_TTL;
export const getRefreshTokenMaxAge = (rememberMe: boolean) =>
  rememberMe ? REFRESH_TOKEN_TTL : 60 * 60 * 24;

export const createAccessToken = async (user: UserProfile) => {
  return new SignJWT({
    ...user,
    type: "access",
  } satisfies SessionClaims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
    .sign(secretKey);
};

export const verifyAccessToken = async (token: string | undefined | null): Promise<UserProfile | null> => {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (payload.type !== "access") {
      return null;
    }

    return {
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      studentId: String(payload.studentId ?? ""),
      role:
        payload.role === "admin"
          ? "admin"
          : payload.role === "manager"
            ? "manager"
            : "customer",
    };
  } catch {
    return null;
  }
};
