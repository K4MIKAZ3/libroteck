import type { Metadata } from "next";
import { Inter, Literata, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
    metadataBase: new URL("https://libroteck.xyz"),
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
        className={`${inter.variable} ${jakarta.variable} ${literata.variable} min-h-full bg-[#f4f6fb] font-[family-name:var(--font-inter)] text-[#0b1020] antialiased`}
      >
        <AppProviders>
          {children}
          <FloatingCartButton />
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
