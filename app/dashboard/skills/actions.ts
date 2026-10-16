"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { skills } from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth/require-owner";

const skillSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(["web", "backend", "security", "data", "tools", "other"]),
  categoryLabel: z.string().trim().min(1).max(40),
  iconKey: z.string().trim().max(80).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  visible: z.boolean(),
});

export type SkillActionState = { error?: string; success?: string } | null;

function revalidateSkills() {
  revalidatePath("/");
  revalidatePath("/dashboard/skills");
}

function readSkill(formData: FormData) {
  return skillSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    categoryLabel: formData.get("categoryLabel"),
    iconKey: formData.get("iconKey") || undefined,
    sortOrder: formData.get("sortOrder"),
    visible: formData.get("visible") === "on",
  });
}

export async function saveSkill(_state: SkillActionState, formData: FormData): Promise<SkillActionState> {
  await requireOwner();
  const parsed = readSkill(formData);
  if (!parsed.success) return { error: "Check the skill fields and try again." };

  const id = String(formData.get("id") ?? "").trim();
  const values = { ...parsed.data, iconKey: parsed.data.iconKey || null };
  const db = getDb();

  try {
    if (id) {
      await db.update(skills).set(values).where(eq(skills.id, id));
    } else {
      await db.insert(skills).values(values);
    }
  } catch {
    return { error: "That skill could not be saved. Check for a duplicate name." };
  }

  revalidateSkills();
  return { success: "Skill saved." };
}

export async function setSkillVisibility(formData: FormData) {
  await requireOwner();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const visible = formData.get("visible") === "true";
  if (!id.success) throw new Error("Invalid skill.");

  await getDb().update(skills).set({ visible }).where(eq(skills.id, id.data));
  revalidateSkills();
}

export async function moveSkill(formData: FormData) {
  await requireOwner();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const direction = z.enum(["up", "down"]).safeParse(formData.get("direction"));
  if (!id.success || !direction.success) throw new Error("Invalid skill reorder request.");

  const db = getDb();
  const rows = await db.select({ id: skills.id }).from(skills).orderBy(asc(skills.sortOrder));
  const index = rows.findIndex((row) => row.id === id.data);
  const targetIndex = index + (direction.data === "up" ? -1 : 1);
  if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) return;

  const reordered = [...rows];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  await Promise.all(reordered.map((row, sortOrder) =>
    db.update(skills).set({ sortOrder }).where(eq(skills.id, row.id)),
  ));
  revalidateSkills();
}

export async function deleteSkill(formData: FormData) {
  await requireOwner();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) throw new Error("Invalid skill.");

  await getDb().delete(skills).where(and(eq(skills.id, id.data)));
  revalidateSkills();
}