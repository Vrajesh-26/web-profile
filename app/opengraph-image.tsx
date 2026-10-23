import { ImageResponse } from "next/og";

export const alt = "Vrajesh Darji, Software Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  // Load fonts from local files — bundled at build time, no external CDN dependency
  const [anybodyBold, hankenRegular] = await Promise.all([
    fetch(new URL("./fonts/anybody-bold.ttf", import.meta.url)).then((r) =>
      r.arrayBuffer()
    ),
    fetch(new URL("./fonts/hanken-grotesk-regular.ttf", import.meta.url)).then(
      (r) => r.arrayBuffer()
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "#1b2a22",
          color: "#efe9d8",
        }}
      >
        <div style={{ display: "flex", fontSize: 20, color: "#f4b223", fontFamily: "Hanken Grotesk" }}>
          WEB-PROFILE | GUJARAT, INDIA
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: "Anybody",
            }}
          >
            Vrajesh Darji
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#8fa394", fontFamily: "Hanken Grotesk" }}>
            Software Developer
          </div>
        </div>
        <div style={{ display: "flex", width: 132, height: 8, background: "#f4b223" }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anybody", data: anybodyBold, weight: 700, style: "normal" },
        { name: "Hanken Grotesk", data: hankenRegular, weight: 400, style: "normal" },
      ],
    }
  );
}