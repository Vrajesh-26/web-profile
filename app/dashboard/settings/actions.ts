"use server";

import { and, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authSession } from "@/db/auth-schema";
import { getDb } from "@/lib/db";
import { getAuthServer } from "@/lib/auth/server";
import { requireOwner } from "@/lib/auth/require-owner";

export type PasswordActionState = { error?: string; success?: string } | null;

export async function changeOwnerPassword(_state: PasswordActionState, formData: FormData): Promise<PasswordActionState> {
  await requireOwner();
  const parsed = z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(12).max(128),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Use a new password of at least 12 characters." };

  try {
    await getAuthServer().api.changePassword({
      body: { ...parsed.data, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch {
    return { error: "Password could not be changed. Check the current password and try again." };
  }
  revalidatePath("/dashboard/settings");
  return { success: "Password changed. Other sessions have been revoked." };
}

export async function revokeOwnerSession(formData: FormData) {
  const owner = await requireOwner();
  const id = z.string().min(1).max(128).safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid session.");

  const [session] = await getDb().select({ token: authSession.token })
    .from(authSession)
    .where(and(
      eq(authSession.id, id.data),
      eq(authSession.userId, owner.id),
      gt(authSession.expiresAt, new Date()),
    ))
    .limit(1);
  if (!session) throw new Error("Session not found.");

  await getAuthServer().api.revokeSession({ body: { token: session.token }, headers: await headers() });
  revalidatePath("/dashboard/settings");
}