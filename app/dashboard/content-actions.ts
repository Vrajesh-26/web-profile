"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { documents, journey, projectSkills, projects, socialLinks } from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth/require-owner";

export type ContentKind = "projects" | "journey" | "documents" | "links";
export type ContentActionState = { error?: string; success?: string } | null;

const slugSchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optionalUrl = z.union([z.string().url(), z.literal("")]).transform((value) => value || null);
const commonFields = {
  sortOrder: z.coerce.number().int().min(0).max(9999),
  visible: z.boolean(),
};

const schemas = {
  projects: z.object({
    slug: slugSchema,
    title: z.string().trim().min(1).max(140),
    summary: z.string().trim().min(1).max(500),
    outcome: z.string().trim().min(1).max(500),
    bodyMd: z.string().trim().min(1).max(20000),
    role: z.string().trim().min(1).max(160),
    status: z.enum(["live", "building", "archived"]),
    liveUrl: optionalUrl,
    repoUrl: optionalUrl,
    coverUrl: optionalUrl,
    videoUrl: optionalUrl,
    accent: z.enum(["marigold", "orchid", "oat", "sage"]),
    featured: z.boolean(),
    sortOrder: commonFields.sortOrder,
    visible: commonFields.visible,
    year: z.string().regex(/^$|^\d{4}$/),
    skillIds: z.array(z.string().uuid()).max(50),
  }),
  journey: z.object({
    kind: z.enum(["education", "experience", "certificate", "award"]),
    org: z.string().trim().min(1).max(180),
    title: z.string().trim().min(1).max(180),
    startDate: z.string().trim().max(80),
    endDate: z.string().trim().max(80),
    body: z.string().trim().min(1).max(5000),
    sortOrder: commonFields.sortOrder,
    visible: commonFields.visible,
  }),
  documents: z.object({
    title: z.string().trim().min(1).max(180),
    description: z.string().trim().min(1).max(1000),
    format: z.string().trim().min(1).max(40),
    kind: z.enum(["resume", "certificate", "other"]),
    driveUrl: optionalUrl,
    sortOrder: commonFields.sortOrder,
    visible: commonFields.visible,
  }),
  links: z.object({
    label: z.string().trim().min(1).max(80),
    url: z.string().trim().url().max(2048),
    sortOrder: commonFields.sortOrder,
    visible: commonFields.visible,
  }),
};

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function bool(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function formValues(formData: FormData) {
  return {
    sortOrder: text(formData, "sortOrder"),
    visible: bool(formData, "visible"),
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    summary: text(formData, "summary"),
    outcome: text(formData, "outcome"),
    bodyMd: text(formData, "bodyMd"),
    role: text(formData, "role"),
    status: text(formData, "status"),
    liveUrl: text(formData, "liveUrl"),
    repoUrl: text(formData, "repoUrl"),
    coverUrl: text(formData, "coverUrl"),
    videoUrl: text(formData, "videoUrl"),
    accent: text(formData, "accent"),
    featured: bool(formData, "featured"),
    year: text(formData, "year"),
    skillIds: formData.getAll("skillIds").map(String),
    kind: text(formData, "kind"),
    org: text(formData, "org"),
    startDate: text(formData, "startDate"),
    endDate: text(formData, "endDate"),
    body: text(formData, "body"),
    description: text(formData, "description"),
    format: text(formData, "format"),
    driveUrl: text(formData, "driveUrl"),
    label: text(formData, "label"),
    url: text(formData, "url"),
  };
}

function revalidateContent(kind: ContentKind) {
  revalidatePath("/");
  revalidatePath(`/dashboard/${kind}`);
  if (kind === "projects") revalidatePath("/projects/[slug]", "page");
}

export async function saveContent(_state: ContentActionState, formData: FormData): Promise<ContentActionState> {
  await requireOwner();
  const kind = z.enum(["projects", "journey", "documents", "links"]).safeParse(formData.get("kind"));
  if (!kind.success) return { error: "This item could not be saved." };
  const idValue = text(formData, "id").trim();
  const id = idValue ? z.string().uuid().safeParse(idValue) : null;
  if (id && !id.success) return { error: "This item could not be saved." };
  const db = getDb();
  try {
    if (kind.data === "projects") {
      const parsed = schemas.projects.safeParse(formValues(formData));
      if (!parsed.success) return { error: "Check the required fields and try again." };
      const { skillIds, year, ...fields } = parsed.data;
      const values = {
        ...fields,
        publishedAt: year ? new Date(`${year}-01-01T00:00:00.000Z`) : null,
      };
      const projectId = idValue
        ? (await db.update(projects).set(values).where(eq(projects.id, id!.data)).returning({ id: projects.id }))[0]?.id
        : (await db.insert(projects).values(values).returning({ id: projects.id }))[0]?.id;
      if (!projectId) return { error: "Project not found." };
      await db.delete(projectSkills).where(eq(projectSkills.projectId, projectId));
      if (skillIds.length) {
        await db.insert(projectSkills).values(skillIds.map((skillId) => ({ projectId, skillId })));
      }
    } else if (kind.data === "journey") {
      const parsed = schemas.journey.safeParse(formValues(formData));
      if (!parsed.success) return { error: "Check the required fields and try again." };
      if (idValue) await db.update(journey).set(parsed.data).where(eq(journey.id, id!.data));
      else await db.insert(journey).values(parsed.data);
    } else if (kind.data === "documents") {
      const parsed = schemas.documents.safeParse(formValues(formData));
      if (!parsed.success) return { error: "Check the required fields and try again." };
      if (idValue) await db.update(documents).set(parsed.data).where(eq(documents.id, id!.data));
      else await db.insert(documents).values(parsed.data);
    } else {
      const parsed = schemas.links.safeParse(formValues(formData));
      if (!parsed.success) return { error: "Check the required fields and try again." };
      if (idValue) await db.update(socialLinks).set(parsed.data).where(eq(socialLinks.id, id!.data));
      else await db.insert(socialLinks).values(parsed.data);
    }
  } catch {
    return { error: "This item could not be saved. Check its values and try again." };
  }

  revalidateContent(kind.data);
  return { success: "Changes saved." };
}

export async function deleteContent(formData: FormData) {
  await requireOwner();
  const kind = z.enum(["projects", "journey", "documents", "links"]).safeParse(formData.get("kind"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!kind.success || !id.success) throw new Error("Invalid item.");
  const db = getDb();
  if (kind.data === "projects") await db.delete(projects).where(eq(projects.id, id.data));
  else if (kind.data === "journey") await db.delete(journey).where(eq(journey.id, id.data));
  else if (kind.data === "documents") await db.delete(documents).where(eq(documents.id, id.data));
  else await db.delete(socialLinks).where(eq(socialLinks.id, id.data));
  revalidateContent(kind.data);
}

export async function setContentVisibility(formData: FormData) {
  await requireOwner();
  const kind = z.enum(["projects", "journey", "documents", "links"]).safeParse(formData.get("kind"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  const visible = formData.get("visible") === "true";
  if (!kind.success || !id.success) throw new Error("Invalid item.");
  const db = getDb();
  if (kind.data === "projects") await db.update(projects).set({ visible }).where(eq(projects.id, id.data));
  else if (kind.data === "journey") await db.update(journey).set({ visible }).where(eq(journey.id, id.data));
  else if (kind.data === "documents") await db.update(documents).set({ visible }).where(eq(documents.id, id.data));
  else await db.update(socialLinks).set({ visible }).where(eq(socialLinks.id, id.data));
  revalidateContent(kind.data);
}

export async function moveContent(formData: FormData) {
  await requireOwner();
  const kind = z.enum(["projects", "journey", "documents", "links"]).safeParse(formData.get("kind"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  const direction = z.enum(["up", "down"]).safeParse(formData.get("direction"));
  if (!kind.success || !id.success || !direction.success) throw new Error("Invalid reorder request.");

  const table = kind.data === "projects" ? projects : kind.data === "journey" ? journey : kind.data === "documents" ? documents : socialLinks;
  const rows = await getDb().select({ id: table.id }).from(table).orderBy(asc(table.sortOrder));
  const index = rows.findIndex((row) => row.id === id.data);
  const targetIndex = index + (direction.data === "up" ? -1 : 1);
  if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) return;
  const reordered = [...rows];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  await Promise.all(reordered.map((row, sortOrder) =>
    getDb().update(table).set({ sortOrder }).where(eq(table.id, row.id)),
  ));
  revalidateContent(kind.data);
}