"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type InboxHubOrderPayload = {
  productSummary: string;
  message: string;
};

type InboxHubContextValue = {
  open: boolean;
  order: InboxHubOrderPayload | null;
  openGuide: () => void;
  openWithOrder: (order: InboxHubOrderPayload) => void;
  close: () => void;
};

const InboxHubContext = createContext<InboxHubContextValue | null>(null);

export function InboxHubProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<InboxHubOrderPayload | null>(null);

  const openGuide = useCallback(() => {
    setOrder(null);
    setOpen(true);
  }, []);

  const openWithOrder = useCallback((next: InboxHubOrderPayload) => {
    setOrder(next);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, order, openGuide, openWithOrder, close }),
    [open, order, openGuide, openWithOrder, close],
  );

  return (
    <InboxHubContext.Provider value={value}>{children}</InboxHubContext.Provider>
  );
}

export function useInboxHub() {
  const ctx = useContext(InboxHubContext);
  if (!ctx) {
    throw new Error("useInboxHub must be used within InboxHubProvider");
  }
  return ctx;
}
