import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/db/queries";
import { getStoreContext } from "@/lib/store/context";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { slug } = await getStoreContext();
  const baseUrl =
    slug === "streaming"
      ? "https://streaming.libroteck.xyz"
      : "https://libroteck.xyz";
  const now = new Date();
  const products = await getActiveProducts();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/home`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/producto/${product.slug}`,
    lastModified: product.createdAt ?? now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
