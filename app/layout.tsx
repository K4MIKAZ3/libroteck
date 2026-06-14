import type { Metadata } from "next";
import { Inter, Literata, Plus_Jakarta_Sans } from "next/font/google";
import { FloatingCartButton } from "@/components/cart/floating-cart-button";
import { AppProviders } from "@/components/providers/app-providers";
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

export const metadata: Metadata = {
  title: {
    default: "LibroTeck — Cursos y libros digitales",
    template: "%s | LibroTeck",
  },
  description:
    "Catálogo de cursos y libros digitales con precios por país. Ordena fácilmente por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${inter.variable} ${jakarta.variable} ${literata.variable} min-h-full bg-[#FAF7F2] font-[family-name:var(--font-inter)] text-[#1A1A2E] antialiased`}
      >
        <AppProviders>
          {children}
          <FloatingCartButton />
        </AppProviders>
      </body>
    </html>
  );
}
