import type { Metadata } from "next";
import { Inter, Literata, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { FloatingCartButton } from "@/components/cart/floating-cart-button";
import { InboxHubChat } from "@/components/inbox-hub/chat-widget";
import { AppProviders } from "@/components/providers/app-providers";
import {
  resolveAdsenseClientId,
  shouldLoadAdsenseScript,
} from "@/lib/ads/client-id";
import { isAdsEligiblePath } from "@/lib/ads/eligibility";
import { buildInboxHubWidgetSrc } from "@/lib/inbox-hub";
import { getStoreContext } from "@/lib/store/context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { store, settings, slug } = await getStoreContext();
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "/";
  const adsEligible = isAdsEligiblePath(pathname);
  const clientId = resolveAdsenseClientId(settings);
  const brand = `${store.brandPrimary}${store.brandAccent}`;
  const isStreaming = slug === "streaming";

  return {
    title: {
      default: isStreaming
        ? `${brand} — Cuentas premium de streaming`
        : `${brand} — Cursos y libros digitales`,
      template: `%s | ${brand}`,
    },
    description: isStreaming
      ? "Cuentas premium de streaming con precios por país. Ordena fácilmente por WhatsApp."
      : "Catálogo de cursos y libros digitales con precios por país. Ordena fácilmente por WhatsApp.",
    metadataBase: new URL(
      isStreaming ? "https://streaming.libroteck.xyz" : "https://libroteck.xyz",
    ),
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? {
          verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
          },
        }
      : {}),
    ...(clientId && adsEligible && settings.adsEnabled
      ? {
          other: {
            "google-adsense-account": clientId,
          },
        }
      : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings, slug } = await getStoreContext();
  const requestHeaders = await headers();
  const adsEligible = requestHeaders.get("x-ads-eligible") === "1";
  const clientId = resolveAdsenseClientId(settings);
  const loadAdsense =
    adsEligible && shouldLoadAdsenseScript(settings);
  const inboxHubSrc = buildInboxHubWidgetSrc(slug);

  return (
    <html lang="es" className="h-full" data-store={slug}>
      <head>
        {loadAdsense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className={`${inter.variable} ${jakarta.variable} ${literata.variable} min-h-full bg-[var(--background)] font-[family-name:var(--font-inter)] text-[var(--foreground)] antialiased`}
      >
        <AppProviders>
          {children}
          <FloatingCartButton />
          {inboxHubSrc ? <InboxHubChat baseSrc={inboxHubSrc} /> : null}
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
