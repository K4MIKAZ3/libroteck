"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/admin/productos";
  const hasError = searchParams.get("error") === "1";
  const isRateLimited = searchParams.get("error") === "rate";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-literata text-2xl text-[var(--primary-hover)]">
          LibroTeck Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action="/api/admin/login" method="POST" className="space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          {hasError && (
            <p className="text-sm text-red-600">Contraseña incorrecta</p>
          )}
          {isRateLimited && (
            <p className="text-sm text-red-600">
              Demasiados intentos fallidos. Espera unos minutos e inténtalo de
              nuevo.
            </p>
          )}
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="flex h-32 w-full max-w-md items-center justify-center rounded-2xl border border-[#E8E0D5] bg-white">
            <Loader2 className="size-6 animate-spin text-[var(--primary-hover)]" />
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
