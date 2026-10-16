"use server";

import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiKeys } from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth/require-owner";

export type AgentKeyState = { error?: string; key?: string; label?: string } | null;

export async function createAgentKey(_state: AgentKeyState, formData: FormData): Promise<AgentKeyState> {
  await requireOwner();
  const label = z.string().trim().min(1).max(80).safeParse(formData.get("label"));
  if (!label.success) return { error: "Enter a label of up to 80 characters." };

  const key = `pf_${randomBytes(32).toString("base64url")}`;
  const keyHash = createHash("sha256").update(key).digest("hex");
  await getDb().insert(apiKeys).values({
    label: label.data,
    keyHash,
    scopes: ["contact:read"],
    rateLimitPerHour: 20,
  });
  revalidatePath("/dashboard/agents");
  return { key, label: label.data };
}

export async function revokeAgentKey(formData: FormData) {
  await requireOwner();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid access key.");
  await getDb().update(apiKeys).set({ revokedAt: new Date() }).where(eq(apiKeys.id, id.data));
  revalidatePath("/dashboard/agents");
}