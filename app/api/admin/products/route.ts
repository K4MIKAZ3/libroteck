import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/request";
import { createProduct } from "@/lib/db/queries";
import type { CountryCode, ProductType } from "@/lib/pricing/countries";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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

  const product = await createProduct({
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
