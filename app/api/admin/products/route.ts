import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/request";
import { createProduct } from "@/lib/db/queries";
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductInput;

    try {
      await requireAdminRequest(request, body._token, "products");
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const product = await createProduct({
      name: body.name,
      slug: body.slug || slugify(body.name),
      type: body.type,
      description: body.description,
      coverUrl: body.coverUrl,
      isActive: body.isActive,
      isNew: body.isNew,
      prices: body.prices,
    }, request);

    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/admin/productos");

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to create product", error);
    return NextResponse.json(
      { error: "No se pudo crear el producto" },
      { status: 500 },
    );
  }
}
