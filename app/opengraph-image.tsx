import { ImageResponse } from "next/og";

export const alt = "Vrajesh Darji, full-stack developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#1b2a22", color: "#efe9d8" }}>
      <div style={{ display: "flex", fontSize: 24, color: "#f4b223" }}>PORTFOLIO | INDIA</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, lineHeight: 1 }}>Vrajesh Darji</div>
        <div style={{ display: "flex", fontSize: 36, color: "#8fa394" }}>Full-stack developer</div>
      </div>
      <div style={{ display: "flex", width: 132, height: 8, background: "#f4b223" }} />
    </div>,
    size,
  );
}