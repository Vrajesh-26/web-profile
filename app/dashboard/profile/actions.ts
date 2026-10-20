"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { profile } from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth/require-owner";
import { neonFiles } from "@/lib/storage";

export type ProfileActionState = { error?: string; success?: string } | null;

const urlOrPathOrEmpty = z
  .union([
    z.string().url(),
    z.string().regex(/^\/[a-zA-Z0-9_\-\.\/]+$/),
    z.literal(""),
  ])
  .transform((value) => value || null);

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  tagline: z.string().trim().min(1).max(240),
  roleLine: z.string().trim().min(1).max(160),
  bioMd: z.string().trim().min(1).max(10000),
  portraitAlt: z.string().trim().min(1).max(300),
  location: z.string().trim().min(1).max(120),
  avatarUrl: urlOrPathOrEmpty,
  resumeDriveUrl: urlOrPathOrEmpty,
  availability: z.enum(["open", "busy", "closed"]),
  nowMd: z.string().trim().min(1).max(5000),
});

export async function uploadProfilePhoto(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireOwner();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { error: "No image file provided." };
  }

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
  if (!allowedMimeTypes.includes(file.type)) {
    return { error: "Please upload an image file (JPEG, PNG, WebP, AVIF, or GIF)." };
  }

  if (file.size > 4.5 * 1024 * 1024) {
    return { error: "Image size must be less than 4.5MB." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(extension) ? extension : "jpg";
  const filename = `portrait-${Date.now()}.${safeExtension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, filename), buffer);
  } catch (err) {
    console.error("Local write error:", err);
  }

  if (neonFiles) {
    try {
      await neonFiles.upload(`uploads/${filename}`, buffer, { contentType: file.type });
    } catch (neonErr) {
      console.warn("Neon storage upload skipped or failed:", neonErr);
    }
  }

  const publicUrl = `/uploads/${filename}`;
  return { url: publicUrl };
}

export async function saveProfile(_state: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  await requireOwner();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the profile fields and try again." };

  const values = { ...parsed.data, updatedAt: new Date() };
  const db = getDb();
  try {
    const existing = await db.select({ id: profile.id }).from(profile).where(eq(profile.id, 1)).limit(1);
    if (existing.length) await db.update(profile).set(values).where(eq(profile.id, 1));
    else await db.insert(profile).values({ id: 1, ...values });
  } catch {
    return { error: "Profile could not be saved. Check the URL fields and try again." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard/profile");
  return { success: "Profile saved." };
}