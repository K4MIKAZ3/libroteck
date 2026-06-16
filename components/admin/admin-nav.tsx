import Link from "next/link";
import { Lock, Plus, Settings, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HOME_PATH } from "@/lib/routes";
import type { StoreSlug } from "@/lib/store/context";

type AdminNavProps = {
  active?: "productos" | "configuracion" | "seguridad";
  brandPrimary: string;
  brandAccent: string;
  storeSlug: StoreSlug;
};

const links = [
  { href: "/admin/productos", label: "Productos", icon: ShoppingBag, key: "productos" as const },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, key: "configuracion" as const },
  { href: "/admin/seguridad", label: "Seguridad", icon: Lock, key: "seguridad" as const },
];

export function AdminNav({
  active = "productos",
  brandPrimary,
  brandAccent,
  storeSlug,
}: AdminNavProps) {
  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/productos" className="text-2xl font-bold text-[#991b1b]">
            {brandPrimary}
            <span className="text-[#C8956C]">{brandAccent}</span> Admin
          </Link>
          <p className="text-sm text-[#1A1A2E]/60">
            Panel {storeSlug === "streaming" ? "XCONDEF" : "LibroTeck"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={HOME_PATH}>Ver tienda</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/productos/nuevo">
              <Plus className="size-4" />
              Nuevo producto
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/api/admin/logout">Salir</Link>
          </Button>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-[#E8E0D5] pb-3">
        {links.map(({ href, label, icon: Icon, key }) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active === key
                ? "bg-[#991b1b] text-white"
                : "text-[#1A1A2E]/70 hover:bg-[#FAF7F2] hover:text-[#991b1b]",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
