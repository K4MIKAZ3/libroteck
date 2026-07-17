"use client";

import { useEffect, useState } from "react";

type Props = {
  src: string;
};

/**
 * Chat Inbox Hub embebido. Se oculta en /admin.
 * En móvil sube un poco para no tapar el botón de carrito.
 */
export function InboxHubChat({ src }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <iframe
      src={src}
      title="Chat de soporte"
      allow="clipboard-write"
      className="fixed bottom-20 right-3 z-[60] h-[min(560px,calc(100vh-6rem))] w-[min(380px,calc(100vw-1.5rem))] rounded-2xl border-0 shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:bottom-4 sm:right-4"
    />
  );
}
