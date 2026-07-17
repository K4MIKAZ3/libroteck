"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

type Props = {
  src: string;
};

/**
 * Burbuja flotante "Ordenar en línea" que abre el chat de Inbox Hub.
 * Oculta en /admin. En móvil se eleva para no tapar el carrito.
 */
export function InboxHubChat({ src }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-20 right-3 z-[60] flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {open && (
        <div className="flex h-[min(560px,calc(100vh-8rem))] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#0f1419] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
            <p className="text-sm font-medium text-white">Ordenar en línea</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X className="size-5" />
            </button>
          </div>
          <iframe
            src={src}
            title="Chat para ordenar en línea"
            allow="clipboard-write"
            className="h-full w-full flex-1 border-0 bg-transparent"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-accent,#22c55e)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent,#22c55e)]"
      >
        {open ? (
          <>
            <X className="size-5" />
            Cerrar
          </>
        ) : (
          <>
            <MessageCircle className="size-5" />
            Ordenar en línea
          </>
        )}
      </button>
    </div>
  );
}
