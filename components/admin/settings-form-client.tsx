"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Settings } from "@/lib/db/schema";

type SettingsFormClientProps = {
  initialSettings: Settings;
  saveToken: string;
};

export function SettingsFormClient({
  initialSettings,
  saveToken,
}: SettingsFormClientProps) {
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings.whatsappNumber,
  );
  const [storeName, setStoreName] = useState(initialSettings.storeName);
  const [welcomeMessage, setWelcomeMessage] = useState(
    initialSettings.welcomeMessage,
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          whatsappNumber,
          storeName,
          welcomeMessage,
          _token: saveToken,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        settings?: Settings;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar");
      }

      if (data.settings) {
        setWhatsappNumber(data.settings.whatsappNumber);
        setStoreName(data.settings.storeName);
        setWelcomeMessage(data.settings.welcomeMessage);
      }

      setFeedback({
        type: "success",
        text: "Configuración guardada correctamente.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la configuración.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav active="configuracion" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Configuración de la tienda</CardTitle>
        </CardHeader>
        <CardContent>
          {feedback && (
            <p
              className={`mb-4 text-sm ${
                feedback.type === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {feedback.text}
            </p>
          )}

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
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                "Guardar configuración"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
