import { isSafeImageUrl } from "@/lib/security/urls";

export function validateProductCoverUrl(coverUrl: string): string | null {
  if (!isSafeImageUrl(coverUrl)) {
    return "La imagen de portada debe ser una URL segura permitida";
  }

  return null;
}
