import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminNav() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <Link href="/admin" className="text-2xl font-bold text-[#1E3A5F]">
          LibroTeck Admin
        </Link>
        <p className="text-sm text-[#1A1A2E]/60">
          Gestiona tu catálogo y configuración
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/">Ver tienda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/configuracion">
            <Settings className="size-4" />
            Configuración
          </Link>
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
  );
}
