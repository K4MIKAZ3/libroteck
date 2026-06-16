import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/request";
import { setProductFeatured } from "@/lib/db/queries";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = (await request.json()) as {
      isFeatured?: boolean;
      _token?: string;
    };

    try {
      await requireAdminRequest(request, body._token, "products", "products:write");
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (typeof body.isFeatured !== "boolean") {
      return NextResponse.json(
        { error: "isFeatured es obligatorio" },
        { status: 400 },
      );
    }

    const { id } = await params;
    const product = await setProductFeatured(Number(id), body.isFeatured, request);

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/productos");
    revalidatePath(`/producto/${product.slug}`);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Failed to update featured status", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el destacado" },
      { status: 500 },
    );
  }
}
