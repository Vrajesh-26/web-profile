import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { neonFiles } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  if (!key || key.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Sanitize path components to prevent directory traversal
  const safeParts = key.filter((part) => !part.includes("..") && !part.includes("/"));
  const relativePath = safeParts.join("/");

  // 1. Check local public/uploads directory
  try {
    const localPath = path.join(process.cwd(), "public", "uploads", relativePath);
    const data = await fs.readFile(localPath);
    const ext = path.extname(localPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".json": "application/json",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Fall through to storage
  }

  // 2. Fall back to Neon Object Storage
  if (neonFiles) {
    try {
      const stored = await neonFiles.download(`uploads/${relativePath}`);
      const ext = path.extname(relativePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".avif": "image/avif",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".txt": "text/plain",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
      };
      const contentType = stored.contentType || mimeTypes[ext] || "application/octet-stream";
      return new NextResponse(stored.stream(), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": "inline",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Ignore and fall through to 404
    }
  }

  return new NextResponse("File not found", { status: 404 });
}
