import type { ProductWithPrices } from "@/lib/db/schema";
import type { ProductType } from "@/lib/pricing/countries";
import { PRODUCT_TYPE_LABELS } from "@/lib/pricing/countries";

const TYPE_PRIORITY: Record<ProductType, number> = {
  bundle: 3,
  course: 2,
  book: 1,
};

export function sortProductsForDisplay(products: ProductWithPrices[]) {
  return [...products].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }
    if (a.sortOrder !== b.sortOrder) {
      return b.sortOrder - a.sortOrder;
    }
    const typeDiff = TYPE_PRIORITY[b.type as ProductType] - TYPE_PRIORITY[a.type as ProductType];
    if (typeDiff !== 0) {
      return typeDiff;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function matchesProductSearch(
  product: ProductWithPrices,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }

  const typeLabel = PRODUCT_TYPE_LABELS[product.type as ProductType].toLowerCase();

  return (
    product.name.toLowerCase().includes(q) ||
    product.slug.toLowerCase().includes(q) ||
    product.description.toLowerCase().includes(q) ||
    product.type.toLowerCase().includes(q) ||
    typeLabel.includes(q)
  );
}

export function filterProductsBySearch(
  products: ProductWithPrices[],
  query: string,
) {
  return products.filter((product) => matchesProductSearch(product, query));
}
