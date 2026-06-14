import type { Metadata } from "next";
import { Inter, Literata, Plus_Jakarta_Sans } from "next/font/google";
import { AdSenseHead } from "@/components/ads/adsense-head";
import { FloatingCartButton } from "@/components/cart/floating-cart-button";
import { AppProviders } from "@/components/providers/app-providers";
import {
  resolveAdsenseClientId,
  shouldLoadAdsenseScript,
} from "@/lib/ads/client-id";
import { getSettings } from "@/lib/db/queries";
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
  const settings = await getSettings();
  const clientId = resolveAdsenseClientId(settings);

  return {
    title: {
      default: "LibroTeck — Cursos y libros digitales",
      template: "%s | LibroTeck",
    },
    description:
      "Catálogo de cursos y libros digitales con precios por país. Ordena fácilmente por WhatsApp.",
    metadataBase: new URL("https://libroteck.vercel.app"),
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? {
          verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
          },
        }
      : {}),
    ...(clientId
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
  const settings = await getSettings();
  const clientId = resolveAdsenseClientId(settings);
  const loadAdsense = shouldLoadAdsenseScript(settings);

  return (
    <html lang="es" className="h-full">
      <body
        className={`${inter.variable} ${jakarta.variable} ${literata.variable} min-h-full bg-[#FAF7F2] font-[family-name:var(--font-inter)] text-[#1A1A2E] antialiased`}
      >
        {loadAdsense && <AdSenseHead clientId={clientId} />}
        <AppProviders>
          {children}
          <FloatingCartButton />
        </AppProviders>
      </body>
    </html>
  );
}
