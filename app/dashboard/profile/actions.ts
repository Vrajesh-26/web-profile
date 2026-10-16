"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { profile } from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth/require-owner";

export type ProfileActionState = { error?: string; success?: string } | null;

const urlOrEmpty = z.union([z.string().url(), z.literal("")]).transform((value) => value || null);
const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  tagline: z.string().trim().min(1).max(240),
  roleLine: z.string().trim().min(1).max(160),
  bioMd: z.string().trim().min(1).max(10000),
  portraitAlt: z.string().trim().min(1).max(300),
  location: z.string().trim().min(1).max(120),
  avatarUrl: urlOrEmpty,
  resumeDriveUrl: urlOrEmpty,
  availability: z.enum(["open", "busy", "closed"]),
  nowMd: z.string().trim().min(1).max(5000),
});

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