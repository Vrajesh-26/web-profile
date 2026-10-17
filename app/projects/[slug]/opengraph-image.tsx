import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const colors: Record<string, string> = {
    marigold: "#f4b223", orchid: "#b58ae6", oat: "#efe9d8", sage: "#8fa394",
  };
  const accent = colors[project.accent] ?? colors.sage;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#1b2a22", color: "#efe9d8" }}>
      <div style={{ display: "flex", fontSize: 24, color: accent }}>SELECTED WORK · {project.year}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", maxWidth: 1000, fontSize: 78, fontWeight: 700, lineHeight: 1.05 }}>{project.title}</div>
        <div style={{ display: "flex", maxWidth: 920, fontSize: 28, lineHeight: 1.35, color: "#8fa394" }}>{project.description}</div>
      </div>
      <div style={{ display: "flex", width: 132, height: 8, background: accent }} />
    </div>,
    size,
  );
}