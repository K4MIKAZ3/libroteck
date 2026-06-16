const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function validateUploadFile(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Solo se permiten imágenes JPG, PNG, WEBP o GIF";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return "La imagen no puede superar 5 MB";
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
    return "Extensión de archivo no permitida";
  }

  return null;
}

export function safeUploadFilename(originalName: string) {
  const extension = originalName.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
    ? extension
    : "jpg";

  return `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;
}
