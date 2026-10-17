import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";
import { getSiteUrl } from "@/lib/seo/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const projects = await getProjects();
  return [
    { url: new URL("/", base).toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/agents", base).toString(), changeFrequency: "monthly", priority: 0.6 },
    ...projects.map((project) => ({
      url: new URL(`/projects/${project.slug}`, base).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}