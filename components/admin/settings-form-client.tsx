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
import { AD_NETWORK_GUIDE, AD_SIZE_GUIDE } from "@/lib/ads/config";

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
  const [promoEnabled, setPromoEnabled] = useState(initialSettings.promoEnabled);
  const [promoTitle, setPromoTitle] = useState(initialSettings.promoTitle);
  const [promoMessage, setPromoMessage] = useState(initialSettings.promoMessage);
  const [promoLink, setPromoLink] = useState(initialSettings.promoLink);
  const [promoButtonLabel, setPromoButtonLabel] = useState(
    initialSettings.promoButtonLabel,
  );
  const [adsEnabled, setAdsEnabled] = useState(initialSettings.adsEnabled);
  const [adsenseClientId, setAdsenseClientId] = useState(
    initialSettings.adsenseClientId,
  );
  const [adSlotTop, setAdSlotTop] = useState(initialSettings.adSlotTop);
  const [adSlotLeft, setAdSlotLeft] = useState(initialSettings.adSlotLeft);
  const [adSlotRight, setAdSlotRight] = useState(initialSettings.adSlotRight);
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
          promoEnabled,
          promoTitle,
          promoMessage,
          promoLink,
          promoButtonLabel,
          adsEnabled,
          adsenseClientId,
          adSlotTop,
          adSlotLeft,
          adSlotRight,
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
        setPromoEnabled(data.settings.promoEnabled);
        setPromoTitle(data.settings.promoTitle);
        setPromoMessage(data.settings.promoMessage);
        setPromoLink(data.settings.promoLink);
        setPromoButtonLabel(data.settings.promoButtonLabel);
        setAdsEnabled(data.settings.adsEnabled);
        setAdsenseClientId(data.settings.adsenseClientId);
        setAdSlotTop(data.settings.adSlotTop);
        setAdSlotLeft(data.settings.adSlotLeft);
        setAdSlotRight(data.settings.adSlotRight);
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

            <div className="rounded-xl border border-[#E8E0D5] bg-[#FAF7F2]/60 p-4 space-y-4">
              <div>
                <p className="font-medium text-[#1E3A5F]">Publicidad suave</p>
                <p className="mt-1 text-xs text-[#1A1A2E]/60">
                  Banner opcional debajo del hero. El usuario puede cerrarlo. No
                  interrumpe la compra.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={promoEnabled}
                  onChange={(event) => setPromoEnabled(event.target.checked)}
                  className="size-4 rounded border-[#E8E0D5]"
                />
                <span className="text-sm font-medium">Mostrar banner promocional</span>
              </label>

              <div className="space-y-2">
                <Label htmlFor="promoTitle">Etiqueta (ej. Oferta del mes)</Label>
                <Input
                  id="promoTitle"
                  value={promoTitle}
                  onChange={(event) => setPromoTitle(event.target.value)}
                  placeholder="Oferta especial"
                  disabled={!promoEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoMessage">Mensaje</Label>
                <Textarea
                  id="promoMessage"
                  value={promoMessage}
                  onChange={(event) => setPromoMessage(event.target.value)}
                  rows={2}
                  placeholder="Packs TF VICTOR con descuento esta semana"
                  disabled={!promoEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoLink">Enlace (opcional)</Label>
                <Input
                  id="promoLink"
                  value={promoLink}
                  onChange={(event) => setPromoLink(event.target.value)}
                  placeholder="/producto/tf-victor-tomos-18-19-y-20"
                  disabled={!promoEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoButtonLabel">Texto del botón</Label>
                <Input
                  id="promoButtonLabel"
                  value={promoButtonLabel}
                  onChange={(event) => setPromoButtonLabel(event.target.value)}
                  placeholder="Ver promoción"
                  disabled={!promoEnabled}
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#E8E0D5] bg-[#FAF7F2]/60 p-4 space-y-4">
              <div>
                <p className="font-medium text-[#1E3A5F]">Espacios publicitarios</p>
                <p className="mt-1 text-xs text-[#1A1A2E]/60">
                  Barra superior + columnas laterales en pantallas grandes. En móvil
                  solo se muestra la barra de arriba.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={adsEnabled}
                  onChange={(event) => setAdsEnabled(event.target.checked)}
                  className="size-4 rounded border-[#E8E0D5]"
                />
                <span className="text-sm font-medium">Activar anuncios AdSense</span>
              </label>

              <div className="space-y-2">
                <Label htmlFor="adsenseClientId">ID de cliente AdSense</Label>
                <Input
                  id="adsenseClientId"
                  value={adsenseClientId}
                  onChange={(event) => setAdsenseClientId(event.target.value)}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  disabled={!adsEnabled}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="adSlotTop">Unidad superior</Label>
                  <Input
                    id="adSlotTop"
                    value={adSlotTop}
                    onChange={(event) => setAdSlotTop(event.target.value)}
                    placeholder="1234567890"
                    disabled={!adsEnabled}
                  />
                  <p className="text-xs text-[#1A1A2E]/50">{AD_SIZE_GUIDE.top}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adSlotLeft">Unidad izquierda</Label>
                  <Input
                    id="adSlotLeft"
                    value={adSlotLeft}
                    onChange={(event) => setAdSlotLeft(event.target.value)}
                    placeholder="1234567891"
                    disabled={!adsEnabled}
                  />
                  <p className="text-xs text-[#1A1A2E]/50">{AD_SIZE_GUIDE.left}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adSlotRight">Unidad derecha</Label>
                  <Input
                    id="adSlotRight"
                    value={adSlotRight}
                    onChange={(event) => setAdSlotRight(event.target.value)}
                    placeholder="1234567892"
                    disabled={!adsEnabled}
                  />
                  <p className="text-xs text-[#1A1A2E]/50">{AD_SIZE_GUIDE.right}</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#E8E0D5] bg-white p-3 text-xs text-[#1A1A2E]/70">
                <p className="font-semibold text-[#1E3A5F]">Redes recomendadas</p>
                <ul className="mt-2 space-y-2">
                  {AD_NETWORK_GUIDE.map((network) => (
                    <li key={network.name}>
                      <a
                        href={network.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#1E3A5F] underline-offset-2 hover:underline"
                      >
                        {network.name}
                        {network.recommended ? " (recomendado)" : ""}
                      </a>
                      {" — "}
                      {network.note}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[#1A1A2E]/55">
                  En AdSense crea 3 unidades: una horizontal (arriba) y dos
                  verticales (laterales). Copia el ca-pub y cada data-ad-slot aquí.
                </p>
              </div>
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
