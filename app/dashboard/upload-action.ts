"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { requireOwner } from "@/lib/auth/require-owner";
import { neonFiles } from "@/lib/storage";

export type UploadResult = {
  url?: string;
  filename?: string;
  contentType?: string;
  size?: number;
  error?: string;
};

/**
 * Universal asset upload server action for documents, images, and media.
 * Stores to local public/uploads for local development and Neon Object Storage for production.
 */
export async function uploadAsset(formData: FormData): Promise<UploadResult> {
  try {
    await requireOwner();
  } catch {
    return { error: "Authentication required to upload files." };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { error: "No file was provided for upload." };
  }

  // 25MB maximum file size limit
  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { error: "File exceeds the 25MB size limit." };
  }

  const originalName = file.name || "document";
  const lastDot = originalName.lastIndexOf(".");
  const extension = lastDot !== -1 ? originalName.slice(lastDot + 1).toLowerCase() : "bin";
  const rawBase = lastDot !== -1 ? originalName.slice(0, lastDot) : originalName;

  // Sanitize base name to alphanumeric, dashes, underscores
  const cleanBase = rawBase
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .slice(0, 50) || "file";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "").slice(0, 10) || "bin";

  const filename = `${cleanBase}-${Date.now()}.${safeExtension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // 1. Write to public/uploads directory
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, filename), buffer);
  } catch (err) {
    console.error("Local disk upload write error:", err);
  }

  // 2. Upload to Neon Object Storage if configured
  if (neonFiles) {
    try {
      await neonFiles.upload(`uploads/${filename}`, buffer, {
        contentType: file.type || "application/octet-stream",
      });
    } catch (neonErr) {
      console.warn("Neon storage upload skipped or failed:", neonErr);
    }
  }

  const publicUrl = `/uploads/${filename}`;
  return {
    url: publicUrl,
    filename,
    contentType: file.type || "application/octet-stream",
    size: file.size,
  };
}
