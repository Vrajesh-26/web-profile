"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contactRequests } from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth/require-owner";

export async function updateContactStatus(formData: FormData) {
  await requireOwner();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const status = z.enum(["new", "read", "replied"]).safeParse(formData.get("status"));
  if (!id.success || !status.success) throw new Error("Invalid contact request.");
  await getDb().update(contactRequests).set({ status: status.data }).where(eq(contactRequests.id, id.data));
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/[module]", "page");
}

export async function deleteContactRequest(formData: FormData) {
  await requireOwner();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid contact request.");
  await getDb().delete(contactRequests).where(eq(contactRequests.id, id.data));
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/[module]", "page");
}