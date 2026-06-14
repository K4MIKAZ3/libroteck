import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/request";
import { deleteProduct } from "@/lib/db/queries";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { id } = await params;
  await deleteProduct(Number(id));
  return NextResponse.redirect(new URL("/admin/productos", request.url));
}
