import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DISCOUNT_CODES } from "@/lib/ecommerce";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  discountCode: string | null;
  discountPercentage: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyDiscountCode: (code: string) => { success: boolean; message: string };
  clearDiscount: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      discountCode: null,
      discountPercentage: 0,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => {
          return {
            items: state.items
              .map((item) =>
                item.id === id ? { ...item, quantity: item.quantity - 1 } : item
              )
              .filter((item) => item.quantity > 0),
          };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) =>
                  item.id === id ? { ...item, quantity } : item
                ),
        })),
      applyDiscountCode: (code) => {
        const normalizedCode = code.trim().toUpperCase() as keyof typeof DISCOUNT_CODES;
        const percentage = DISCOUNT_CODES[normalizedCode];

        if (!percentage) {
          return { success: false, message: "Invalid discount code." };
        }

        set(() => ({
          discountCode: normalizedCode,
          discountPercentage: percentage,
        }));

        return {
          success: true,
          message: `${normalizedCode} applied for ${percentage}% off.`,
        };
      },
      clearDiscount: () =>
        set(() => ({
          discountCode: null,
          discountPercentage: 0,
        })),
      clearCart: () =>
        set(() => {
          return { items: [], discountCode: null, discountPercentage: 0 };
        }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
