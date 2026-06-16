import { CookieSettingsLink } from "@/components/layout/cookie-settings-link";
import { getPaymentMethods } from "@/lib/store/payment-methods";
import type { StoreSlug } from "@/lib/store/context";

type SiteFooterProps = {
  brandPrimary: string;
  brandAccent: string;
  tagline: string;
  storeSlug: StoreSlug;
};

export function SiteFooter({
  brandPrimary,
  brandAccent,
  tagline,
  storeSlug,
}: SiteFooterProps) {
  const paymentMethods = getPaymentMethods(storeSlug);

  return (
    <footer className="mt-16 bg-[var(--footer-bg)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd600]">
            Métodos de pago
          </p>
          <h2 className="font-heading mt-2 text-xl font-bold sm:text-2xl">
            Aceptamos los siguientes medios
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--footer-muted)]">
            Al ordenar por WhatsApp te indicamos los datos para completar tu pago
            de forma segura.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 px-4 py-5 text-center transition-shadow hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-[var(--primary)]/30 text-[#ffd600]">
                <method.icon className="size-5" />
              </div>
              <p className="mt-3 font-semibold">{method.name}</p>
              <p className="mt-1 text-xs text-[var(--footer-muted)]/80">
                {method.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-[var(--footer-muted)]/70">
          © {new Date().getFullYear()} {brandPrimary}
          {brandAccent} — {tagline}
          {" · "}
          <a
            href="/privacidad"
            className="text-[#ffd600] underline-offset-2 hover:underline"
          >
            Privacidad
          </a>
          {" · "}
          <CookieSettingsLink />
        </p>
      </div>
    </footer>
  );
}
