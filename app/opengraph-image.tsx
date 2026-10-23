import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Vrajesh Darji, Software Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Load fonts once at module scope — no network dependency, bundled with the app
const anybodyBold = await readFile(join(process.cwd(), "app/fonts/anybody-bold.ttf"));
const hankenRegular = await readFile(join(process.cwd(), "app/fonts/hanken-grotesk-regular.ttf"));

export default async function OpenGraphImage() {

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