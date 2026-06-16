const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  ".public.blob.vercel-storage.com",
] as const;

export function isSafeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafePromoLink(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return !trimmed.includes("://");
  }

  return isSafeHttpUrl(trimmed);
}

export function isSafeImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return !/\.(svg|html?|js)$/i.test(trimmed);
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") {
      return false;
    }

    return ALLOWED_IMAGE_HOSTS.some((host) =>
      host.startsWith(".")
        ? url.hostname.endsWith(host.slice(1))
        : url.hostname === host,
    );
  } catch {
    return false;
  }
}
