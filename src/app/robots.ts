import type { MetadataRoute } from "next";

import { getAppBaseUrl } from "@/lib/app-base-url";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = getAppBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
