"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { OrderRecord, ProductReview, UserProfile } from "@/lib/ecommerce";

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
  register: (payload: UserProfile & { rememberMe: boolean }) => void;
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

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      auth: defaultAuth,
      wishlist: [],
      reviews: [],
      orders: [],
      login: ({ email, rememberMe }) =>
        set(() => ({
          auth: {
            isAuthenticated: true,
            rememberMe,
            user: {
              name: email.split("@")[0],
              email,
              studentId: "MSSV-DEMO",
            },
          },
        })),
      register: ({ name, email, studentId, rememberMe }) =>
        set(() => ({
          auth: {
            isAuthenticated: true,
            rememberMe,
            user: { name, email, studentId },
          },
        })),
      logout: () => set(() => ({ auth: defaultAuth })),
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
