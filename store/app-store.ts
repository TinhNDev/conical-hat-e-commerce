"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { OrderRecord, ProductReview, UserProfile } from "@/lib/ecommerce";
import {
  AUTH_EMAIL_COOKIE,
  AUTH_ROLE_COOKIE,
  getRoleForEmail,
  UserRole,
} from "@/lib/auth-shared";

interface AuthState {
  isAuthenticated: boolean;
  rememberMe: boolean;
  user: UserProfile | null;
}

interface AppStore {
  auth: AuthState;
  wishlist: string[];
  reviews: ProductReview[];
  orders: OrderRecord[];
  login: (payload: { email: string; rememberMe: boolean }) => void;
  register: (
    payload: Omit<UserProfile, "role"> & { rememberMe: boolean }
  ) => void;
  logout: () => void;
  toggleWishlist: (productId: string) => void;
  addReview: (review: Omit<ProductReview, "id" | "createdAt">) => void;
  addOrder: (order: OrderRecord) => void;
}

const defaultAuth: AuthState = {
  isAuthenticated: false,
  rememberMe: false,
  user: null,
};

const setAuthCookies = (email: string, role: UserRole, rememberMe: boolean) => {
  if (typeof document === "undefined") {
    return;
  }

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined;
  const cookieSuffix = `; path=/; SameSite=Lax${maxAge ? `; max-age=${maxAge}` : ""}`;

  document.cookie = `${AUTH_EMAIL_COOKIE}=${encodeURIComponent(email)}${cookieSuffix}`;
  document.cookie = `${AUTH_ROLE_COOKIE}=${role}${cookieSuffix}`;
};

const clearAuthCookies = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_EMAIL_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${AUTH_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      auth: defaultAuth,
      wishlist: [],
      reviews: [],
      orders: [],
      login: ({ email, rememberMe }) =>
        set(() => {
          const normalizedEmail = email.trim().toLowerCase();
          const role = getRoleForEmail(normalizedEmail);
          setAuthCookies(normalizedEmail, role, rememberMe);

          return {
            auth: {
              isAuthenticated: true,
              rememberMe,
              user: {
                name: normalizedEmail.split("@")[0],
                email: normalizedEmail,
                studentId: "MSSV-DEMO",
                role,
              },
            },
          };
        }),
      register: ({ name, email, studentId, rememberMe }) =>
        set(() => {
          const normalizedEmail = email.trim().toLowerCase();
          const role = getRoleForEmail(normalizedEmail);
          setAuthCookies(normalizedEmail, role, rememberMe);

          return {
            auth: {
              isAuthenticated: true,
              rememberMe,
              user: { name, email: normalizedEmail, studentId, role },
            },
          };
        }),
      logout: () =>
        set(() => {
          clearAuthCookies();
          return { auth: defaultAuth };
        }),
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),
      addReview: (review) =>
        set((state) => ({
          reviews: [
            {
              ...review,
              id: `${review.productId}-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.reviews,
          ],
        })),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
    }),
    {
      name: "ecommerce-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        auth: state.auth.rememberMe ? state.auth : defaultAuth,
        wishlist: state.wishlist,
        reviews: state.reviews,
        orders: state.orders,
      }),
    }
  )
);
