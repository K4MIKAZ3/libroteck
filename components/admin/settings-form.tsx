import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Settings } from "@/lib/db/schema";

type SettingsPageProps = {
  settings: Settings;
  saved?: boolean;
  error?: string | null;
};

function errorMessage(code: string | null | undefined) {
  switch (code) {
    case "missing-fields":
      return "WhatsApp y nombre de tienda son obligatorios.";
    case "save-failed":
      return "No se pudo guardar la configuración. Intenta de nuevo.";
    default:
      return code ? "Ocurrió un error. Intenta de nuevo." : null;
  }
}

export default function SettingsPageWrapper({
  settings,
  saved = false,
  error = null,
}: SettingsPageProps) {
  const settingsError = errorMessage(error);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav active="configuracion" />

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
          {settingsError && (
            <p className="mb-4 text-sm text-red-600">{settingsError}</p>
          )}

          <form
            action="/admin/configuracion/guardar"
            method="POST"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Número de WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsappNumber"
                defaultValue={settings.whatsappNumber}
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
                defaultValue={settings.storeName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Mensaje principal</Label>
              <Textarea
                id="welcomeMessage"
                name="welcomeMessage"
                defaultValue={settings.welcomeMessage}
                rows={3}
                required
              />
            </div>
            <Button type="submit">Guardar configuración</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
