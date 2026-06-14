"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ProductType } from "@/lib/pricing/countries";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  type: ProductType;
  coverUrl: string;
  quantity: number;
  unitPrice: number;
  currency: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "libroteck-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored) as CartItem[]);
      }
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((entry) => entry.productId === item.productId);
        if (existing) {
          return current.map((entry) =>
            entry.productId === item.productId
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry,
          );
        }
        return [...current, { ...item, quantity }];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((entry) => entry.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((entry) => entry.productId !== productId));
      return;
    }
    setItems((current) =>
      current.map((entry) =>
        entry.productId === productId ? { ...entry, quantity } : entry,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    return {
      items,
      itemCount,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [items, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
