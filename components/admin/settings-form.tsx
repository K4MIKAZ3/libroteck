"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Settings } from "@/lib/db/schema";

function SettingsFormInner({ settings }: { settings: Settings | null }) {
  const searchParams = useSearchParams();
  const saved = searchParams.get("saved") === "1";
  const error = searchParams.get("error");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Configuración de la tienda</CardTitle>
      </CardHeader>
      <CardContent>
        {saved && (
          <p className="mb-4 text-sm text-green-700">
            Configuración guardada correctamente.
          </p>
        )}
        {error && (
          <p className="mb-4 text-sm text-red-600">
            {error === "missing-fields"
              ? "WhatsApp y nombre de tienda son obligatorios."
              : "No se pudo guardar la configuración. Intenta de nuevo."}
          </p>
        )}

        <form
          action="/api/admin/settings"
          method="POST"
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número de WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsappNumber"
              defaultValue={settings?.whatsappNumber ?? "5212345678900"}
              placeholder="5212345678900"
              required
            />
            <p className="text-xs text-[#1A1A2E]/60">
              Incluye código de país sin + ni espacios.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeName">Nombre de la tienda</Label>
            <Input
              id="storeName"
              name="storeName"
              defaultValue={settings?.storeName ?? "LibroTeck"}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Mensaje principal</Label>
            <Textarea
              id="welcomeMessage"
              name="welcomeMessage"
              defaultValue={
                settings?.welcomeMessage ?? "Cursos y libros digitales"
              }
              rows={3}
              required
            />
          </div>
          <Button type="submit">Guardar configuración</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SettingsForm({ settings }: { settings: Settings | null }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-[#1E3A5F]" />
        </div>
      }
    >
      <SettingsFormInner settings={settings} />
    </Suspense>
  );
}

export default function SettingsPageWrapper({
  settings,
}: {
  settings: Settings | null;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav />
      <SettingsForm settings={settings} />
    </div>
  );
}
