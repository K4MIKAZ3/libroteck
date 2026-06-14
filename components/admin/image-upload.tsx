"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImageUpload({
  value,
  onChange,
  uploadToken,
}: {
  value: string;
  onChange: (url: string) => void;
  uploadToken?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (uploadToken) {
        formData.append("_token", uploadToken);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("No se pudo subir la imagen");
      }

      const data = (await response.json()) as { url: string };
      onChange(data.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Error al subir imagen",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Label>Portada</Label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative aspect-[3/4] w-full max-w-[160px] overflow-hidden rounded-xl border border-[#E8E0D5] bg-[#FAF7F2]">
          {value ? (
            <Image src={value} alt="Portada" fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#1A1A2E]/40">
              Sin imagen
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="URL de la portada o sube un archivo"
          />
          <div>
            <Button variant="outline" asChild disabled={uploading}>
              <label className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Subir imagen
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
