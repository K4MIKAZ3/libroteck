import type { MetadataRoute } from "next";
import { getStoreContext } from "@/lib/store/context";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { slug } = await getStoreContext();
  const baseUrl =
    slug === "streaming"
      ? "https://streaming.libroteck.xyz"
      : "https://libroteck.xyz";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/carrito"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
