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

export type InboxHubMode = "choice" | "chat" | "order";

type InboxHubContextValue = {
  open: boolean;
  mode: InboxHubMode;
  order: InboxHubOrderPayload | null;
  openMenu: () => void;
  openChat: () => void;
  openWithOrder: (order: InboxHubOrderPayload) => void;
  close: () => void;
};

const InboxHubContext = createContext<InboxHubContextValue | null>(null);

export function InboxHubProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<InboxHubMode>("choice");
  const [order, setOrder] = useState<InboxHubOrderPayload | null>(null);

  const openMenu = useCallback(() => {
    setOrder(null);
    setMode("choice");
    setOpen(true);
  }, []);

  const openChat = useCallback(() => {
    setOrder(null);
    setMode("chat");
    setOpen(true);
  }, []);

  const openWithOrder = useCallback((next: InboxHubOrderPayload) => {
    setOrder(next);
    setMode("order");
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, mode, order, openMenu, openChat, openWithOrder, close }),
    [open, mode, order, openMenu, openChat, openWithOrder, close],
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
