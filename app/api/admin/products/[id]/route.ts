import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteProduct, getProductById, updateProduct } from "@/lib/db/queries";
import type { CountryCode, ProductType } from "@/lib/pricing/countries";
import { slugify } from "@/lib/utils";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);
  const existing = await getProductById(productId);

  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const body = (await request.json()) as {
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
  };

  const product = await updateProduct(productId, {
    name: body.name,
    slug: body.slug || slugify(body.name),
    type: body.type,
    description: body.description,
    coverUrl: body.coverUrl,
    isActive: body.isActive,
    isNew: body.isNew,
    prices: body.prices,
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await deleteProduct(Number(id));
  return NextResponse.json({ success: true });
}
