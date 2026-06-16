import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/request";
import { deleteProduct, getProductById, updateProduct } from "@/lib/db/queries";
import type { CountryCode, ProductType } from "@/lib/pricing/countries";
import { slugify } from "@/lib/utils";

type ProductInput = {
  name: string;
  slug?: string;
  type: ProductType;
  description: string;
  coverUrl: string;
  isActive: boolean;
  isNew: boolean;
  prices: Array<{
    countryCode: CountryCode;
    currency: string;
    amount: number;
  }>;
  _token?: string;
};

async function readToken(request: Request) {
  try {
    const body = (await request.json()) as { _token?: string };
    return body._token;
  } catch {
    return undefined;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = (await request.json()) as ProductInput;

    try {
      await requireAdminRequest(request, body._token, "products");
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const productId = Number(id);
    const existing = await getProductById(productId, request);

    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const product = await updateProduct(productId, {
      name: body.name,
      slug: body.slug || slugify(body.name),
      type: body.type,
      description: body.description,
      coverUrl: body.coverUrl,
      isActive: body.isActive,
      isNew: body.isNew,
      prices: body.prices,
    }, request);

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/productos");
    revalidatePath(`/producto/${product.slug}`);

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update product", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el producto" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = await readToken(request);

    try {
      await requireAdminRequest(request, token, "products");
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getProductById(Number(id), request);

    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

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
