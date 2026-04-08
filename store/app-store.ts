"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { OrderRecord, ProductReview, UserProfile } from "@/lib/ecommerce";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
}

interface AppStore {
  auth: AuthState;
  wishlist: string[];
  reviews: ProductReview[];
  orders: OrderRecord[];
  refreshSession: () => Promise<void>;
  login: (payload: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    rememberMe: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  toggleWishlist: (productId: string) => void;
  addReview: (review: Omit<ProductReview, "id" | "createdAt">) => void;
  addOrder: (order: OrderRecord) => void;
}

const defaultAuth: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

type AuthResponse = {
  user: UserProfile | null;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      auth: defaultAuth,
      wishlist: [],
      reviews: [],
      orders: [],
      refreshSession: async () => {
        try {
          const payload = await parseResponse<AuthResponse>(await fetch("/api/auth/session"));
          set({
            auth: {
              isAuthenticated: Boolean(payload.user),
              isLoading: false,
              user: payload.user,
            },
          });
        } catch {
          set({
            auth: {
              isAuthenticated: false,
              isLoading: false,
              user: null,
            },
          });
        }
      },
      login: async ({ email, password, rememberMe }) => {
        const payload = await parseResponse<AuthResponse>(
          await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, rememberMe }),
          })
        );

        set({
          auth: {
            isAuthenticated: Boolean(payload.user),
            isLoading: false,
            user: payload.user,
          },
        });
      },
      register: async ({ name, email, password, studentId, rememberMe }) => {
        const payload = await parseResponse<AuthResponse>(
          await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password, studentId, rememberMe }),
          })
        );

        set({
          auth: {
            isAuthenticated: Boolean(payload.user),
            isLoading: false,
            user: payload.user,
          },
        });
      },
      logout: async () => {
        await fetch("/api/auth/logout", {
          method: "POST",
        });

        set({
          auth: {
            isAuthenticated: false,
            isLoading: false,
            user: null,
          },
        });
      },
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
        wishlist: state.wishlist,
        reviews: state.reviews,
        orders: state.orders,
      }),
    }
  )
);
