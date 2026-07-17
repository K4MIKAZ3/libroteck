"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, ShoppingCart, X } from "lucide-react";
import { useInboxHub } from "@/components/providers/inbox-hub-provider";
import { Button } from "@/components/ui/button";
import { HOME_PATH } from "@/lib/routes";

type Props = {
  /** Base widget URL without order params, e.g. .../widget?embed=1&siteKey=... */
  baseSrc: string;
};

export function InboxHubChat({ baseSrc }: Props) {
  const { open, order, openGuide, close } = useInboxHub();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!window.location.pathname.startsWith("/admin"));
  }, []);

  const iframeSrc = useMemo(() => {
    if (!order) return null;
    const url = new URL(baseSrc);
    url.searchParams.set("product", order.productSummary.slice(0, 180));
    url.searchParams.set("awaitOrder", "1");
    return url.toString();
  }, [baseSrc, order]);

  useEffect(() => {
    if (!open || !order || !iframeSrc) return;

    const payload = {
      type: "inbox-hub-order" as const,
      product: order.productSummary,
      message: order.message,
    };

    const post = () => {
      iframeRef.current?.contentWindow?.postMessage(payload, "*");
    };

    const t1 = window.setTimeout(post, 600);
    const t2 = window.setTimeout(post, 1500);
    const t3 = window.setTimeout(post, 3000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [open, order, iframeSrc]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-20 right-3 z-[60] flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {open && (
        <div className="flex h-[min(560px,calc(100vh-8rem))] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between gap-2 border-b border-black/10 bg-[var(--primary)] px-3 py-2.5 text-white">
            <p className="text-sm font-semibold">Ordenar en línea</p>
            <button
              type="button"
              onClick={close}
              className="rounded-md p-1 text-white/80 hover:bg-white/15 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
          </div>

          {order && iframeSrc ? (
            <iframe
              ref={iframeRef}
              key={iframeSrc}
              src={iframeSrc}
              title="Chat para ordenar en línea"
              allow="clipboard-write"
              className="h-full w-full flex-1 border-0 bg-transparent"
              onLoad={() => {
                iframeRef.current?.contentWindow?.postMessage(
                  {
                    type: "inbox-hub-order",
                    product: order.productSummary,
                    message: order.message,
                  },
                  "*",
                );
              }}
            />
          ) : (
            <div className="flex flex-1 flex-col justify-center gap-4 p-5 text-[var(--foreground)]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                <ShoppingCart className="size-6" />
              </div>
              <div className="space-y-2 text-center">
                <p className="font-heading text-lg font-black">
                  Primero elige tus productos
                </p>
                <p className="text-sm text-[#666]">
                  Selecciona el producto que quieres, añádelo al carrito y en el
                  carrito elige <strong>Ordenar en línea</strong> para pagar con
                  ayuda del chat (o WhatsApp si lo prefieres).
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href={HOME_PATH} onClick={close}>
                    Ver catálogo
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/carrito" onClick={close}>
                    Ir al carrito
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? close() : openGuide())}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[var(--primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
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
