import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/auth/request";
import { safeUploadFilename, validateUploadFile } from "@/lib/security/upload";

async function authorizeUpload(request: Request, formToken: string) {
  try {
    await requireAdminMutation(request, formToken, "products");
    return true;
  } catch {
    try {
      await requireAdminMutation(request, formToken, "settings");
      return true;
    } catch {
      return false;
    }
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const formToken = String(formData.get("_token") ?? "");

  if (!(await authorizeUpload(request, formToken))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }

  const validationError = validateUploadFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const filename = safeUploadFilename(file.name);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`covers/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
