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
  passwordSaved?: boolean;
  passwordError?: string | null;
};

function errorMessage(code: string | null | undefined) {
  switch (code) {
    case "missing-fields":
      return "WhatsApp y nombre de tienda son obligatorios.";
    case "wrong-password":
      return "La contraseña actual no es correcta.";
    case "password-mismatch":
      return "La nueva contraseña y la confirmación no coinciden.";
    case "password-too-short":
      return "La nueva contraseña debe tener al menos 8 caracteres.";
    case "password-failed":
      return "No se pudo cambiar la contraseña. Intenta de nuevo.";
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
  passwordSaved = false,
  passwordError = null,
}: SettingsPageProps) {
  const settingsError = errorMessage(error);
  const passwordErrorMessage = errorMessage(passwordError);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav />

      <div className="grid max-w-2xl gap-6">
        <Card>
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
              action="/api/admin/settings"
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

        <Card>
          <CardHeader>
            <CardTitle>Cambiar contraseña admin</CardTitle>
          </CardHeader>
          <CardContent>
            {passwordSaved && (
              <p className="mb-4 text-sm text-green-700">
                Contraseña actualizada correctamente.
              </p>
            )}
            {passwordErrorMessage && (
              <p className="mb-4 text-sm text-red-600">{passwordErrorMessage}</p>
            )}

            <form
              action="/api/admin/password"
              method="POST"
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" variant="secondary">
                Cambiar contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
