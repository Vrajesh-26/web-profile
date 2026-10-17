import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/login", "/dashboard", "/api/agent/"] },
      {
        userAgent: ["Googlebot", "Bingbot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot"],
        allow: "/",
        disallow: ["/login", "/dashboard", "/api/agent/"],
      },
    ],
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}