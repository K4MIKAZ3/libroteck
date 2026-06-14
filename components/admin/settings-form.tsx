"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSettingsAction } from "@/app/admin/(protected)/configuracion/actions";
import type { Settings } from "@/lib/db/schema";

export function SettingsForm({ settings }: { settings: Settings | null }) {
  const [whatsappNumber, setWhatsappNumber] = useState(
    settings?.whatsappNumber ?? "5212345678900",
  );
  const [storeName, setStoreName] = useState(settings?.storeName ?? "LibroTeck");
  const [welcomeMessage, setWelcomeMessage] = useState(
    settings?.welcomeMessage ?? "Cursos y libros digitales",
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setIsError(false);

    try {
      const result = await saveSettingsAction({
        whatsappNumber,
        storeName,
        welcomeMessage,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setMessage("Configuración guardada correctamente.");
      setIsError(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Error al guardar",
      );
      setIsError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Configuración de la tienda</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número de WhatsApp</Label>
            <Input
              id="whatsapp"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
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
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Mensaje principal</Label>
            <Textarea
              id="welcomeMessage"
              value={welcomeMessage}
              onChange={(event) => setWelcomeMessage(event.target.value)}
              rows={3}
              required
            />
          </div>
          {message && (
            <p className={`text-sm ${isError ? "text-red-600" : "text-green-700"}`}>
              {message}
            </p>
          )}
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Guardar configuración
          </Button>
        </form>
      </CardContent>
    </Card>
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
