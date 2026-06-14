import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteProduct } from "@/lib/db/queries";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  const { id } = await params;
  await deleteProduct(Number(id));
  return NextResponse.redirect(new URL("/admin/productos", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
