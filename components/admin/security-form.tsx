import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SecurityPageProps = {
  saved?: boolean;
  error?: string | null;
};

function errorMessage(code: string | null | undefined) {
  switch (code) {
    case "wrong-password":
      return "La contraseña actual no es correcta.";
    case "password-mismatch":
      return "La nueva contraseña y la confirmación no coinciden.";
    case "password-too-short":
      return "La nueva contraseña debe tener al menos 8 caracteres.";
    case "password-failed":
      return "No se pudo cambiar la contraseña. Intenta de nuevo.";
    default:
      return code ? "Ocurrió un error. Intenta de nuevo." : null;
  }
}

export default function SecurityPageWrapper({
  saved = false,
  error = null,
}: SecurityPageProps) {
  const passwordError = errorMessage(error);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav active="seguridad" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Cambiar contraseña admin</CardTitle>
        </CardHeader>
        <CardContent>
          {saved && (
            <p className="mb-4 text-sm text-green-700">
              Contraseña actualizada correctamente.
            </p>
          )}
          {passwordError && (
            <p className="mb-4 text-sm text-red-600">{passwordError}</p>
          )}

          <form action="/admin/seguridad/cambiar" method="POST" className="space-y-4">
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
            <Button type="submit">Cambiar contraseña</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
