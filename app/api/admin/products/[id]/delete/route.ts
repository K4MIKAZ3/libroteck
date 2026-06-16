import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/request";
import { deleteProduct } from "@/lib/db/queries";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const formData = await request.formData();
  const formToken = String(formData.get("_token") ?? "");

  try {
    await requireAdminRequest(request, formToken, "products", "products:write");
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteProduct(Number(id), request);
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/productos");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el producto" },
      { status: 500 },
    );
  }
}
