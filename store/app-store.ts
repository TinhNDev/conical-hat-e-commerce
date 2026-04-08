"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { OrderRecord, UserProfile, ShippingAddress, PaymentMethod } from "@/lib/ecommerce";
import { CartItem } from "./cart-store";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
}

interface AppStore {
  auth: AuthState;
  ownerKey: string | null;
  wishlist: string[];
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
  toggleWishlist: (productId: string) => Promise<void>;
  addOrder: (payload: {
    items: CartItem[];
    discountAmount: number;
    total: number;
    paymentMethod: PaymentMethod;
    shippingAddress: ShippingAddress;
  }) => Promise<OrderRecord>;
}

const defaultAuth: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

type AuthResponse = {
  user: UserProfile | null;
};

type AccountDataResponse = {
  wishlist: string[];
  orders: OrderRecord[];
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
      ownerKey: null,
      wishlist: [],
      orders: [],
      refreshSession: async () => {
        try {
          const payload = await parseResponse<AuthResponse>(await fetch("/api/auth/session"));
          const accountData = payload.user
            ? await parseResponse<AccountDataResponse>(
                await fetch("/api/account/data", {
                  cache: "no-store",
                })
              )
            : { wishlist: [], orders: [] };
          set(() => {
            const nextOwnerKey = payload.user?.email ?? null;

            return {
              auth: {
                isAuthenticated: Boolean(payload.user),
                isLoading: false,
                user: payload.user,
              },
              ownerKey: nextOwnerKey,
              wishlist: accountData.wishlist,
              orders: accountData.orders,
            };
          });
        } catch {
          set({
            auth: {
              isAuthenticated: false,
              isLoading: false,
              user: null,
            },
            ownerKey: null,
            wishlist: [],
            orders: [],
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

        const accountData = payload.user
          ? await parseResponse<AccountDataResponse>(
              await fetch("/api/account/data", {
                cache: "no-store",
              })
            )
          : { wishlist: [], orders: [] };

        set(() => ({
            auth: {
              isAuthenticated: Boolean(payload.user),
              isLoading: false,
              user: payload.user,
            },
            ownerKey: payload.user?.email ?? null,
            wishlist: accountData.wishlist,
            orders: accountData.orders,
          }));
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

        const accountData = payload.user
          ? await parseResponse<AccountDataResponse>(
              await fetch("/api/account/data", {
                cache: "no-store",
              })
            )
          : { wishlist: [], orders: [] };

        set(() => ({
            auth: {
              isAuthenticated: Boolean(payload.user),
              isLoading: false,
              user: payload.user,
            },
            ownerKey: payload.user?.email ?? null,
            wishlist: accountData.wishlist,
            orders: accountData.orders,
          }));
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
          ownerKey: null,
          wishlist: [],
          orders: [],
        });
      },
      toggleWishlist: async (productId) => {
        const payload = await parseResponse<AccountDataResponse>(
          await fetch("/api/account/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
          })
        );

        set({
          wishlist: payload.wishlist,
          orders: payload.orders,
        });
      },
      addOrder: async ({ items, discountAmount, total, paymentMethod, shippingAddress }) => {
        const payload = await parseResponse<{ order: OrderRecord }>(
          await fetch("/api/account/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items,
              discountAmount,
              total,
              paymentMethod,
              shippingAddress,
            }),
          })
        );

        set((state) => ({
          orders: [payload.order, ...state.orders],
        }));

        return payload.order;
      },
    }),
    {
      name: "ecommerce-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ownerKey: state.ownerKey,
      }),
    }
  )
);
