import { cacheLife } from "next/cache";
import { and, eq, asc } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { documents, journey, profile, projectSkills, projects, skills } from "@/db/schema";
import { seedData } from "@/data/seed";
import type {
  DocumentSeed,
  JourneySeed,
  MenuRoomSeed,
  ProfileSeed,
  ProjectSeed,
  RoomSeed,
  SkillSeed,
} from "@/data/seed";

export type {
  DocumentSeed,
  JourneySeed,
  MenuRoomSeed,
  ProfileSeed,
  ProjectSeed,
  ProjectAccent,
  RoomSeed,
  SkillSeed,
  SeedData,
} from "@/data/seed";

export function getRooms(): readonly RoomSeed[] {
  return seedData.rooms;
}

export function getMenuRooms(): readonly MenuRoomSeed[] {
  return seedData.menuRooms;
}

export async function getProfile(): Promise<ProfileSeed> {
  "use cache";
  cacheLife("hours");
  if (!hasDatabaseUrl()) return seedData.profile;

  const [row] = await getDb().select().from(profile).where(eq(profile.id, 1)).limit(1);
  if (!row) return seedData.profile;
  const [firstName, ...lastNames] = row.fullName.split(" ");

  return {
    firstName,
    lastName: lastNames.join(" "),
    role: row.roleLine,
    availability: row.availability === "open" ? "Open to roles" : row.availability,
    intro: row.tagline,
    portraitAlt: row.portraitAlt,
    bio: row.bioMd,
    now: row.nowMd,
    location: row.location,
  };
}

export async function getSkills(): Promise<readonly SkillSeed[]> {
  "use cache";
  cacheLife("hours");
  if (!hasDatabaseUrl()) return seedData.skills;

  const rows = await getDb().select().from(skills)
    .where(eq(skills.visible, true))
    .orderBy(asc(skills.sortOrder));
  return rows.map((row) => ({ name: row.name, category: row.categoryLabel }));
}

export async function getProjects(): Promise<readonly ProjectSeed[]> {
  "use cache";
  cacheLife("hours");
  if (!hasDatabaseUrl()) return seedData.projects;

  const db = getDb();
  const rows = await db.select({
    project: projects,
    skillName: skills.name,
  })
    .from(projects)
    .leftJoin(projectSkills, eq(projectSkills.projectId, projects.id))
    .leftJoin(skills, and(
      eq(projectSkills.skillId, skills.id),
      eq(skills.visible, true),
    ))
    .where(eq(projects.visible, true))
    .orderBy(asc(projects.sortOrder));

  const byId = new Map<string, ProjectSeed>();
  for (const row of rows) {
    const project = row.project;
    let mapped = byId.get(project.id);
    if (!mapped) {
      mapped = {
        slug: project.slug,
        title: project.title,
        description: project.summary,
        outcome: project.outcome,
        year: project.publishedAt?.getUTCFullYear().toString() ?? "",
        role: project.role,
        accent: project.accent as ProjectSeed["accent"],
        skills: [],
        caseStudy: project.bodyMd.split("\n\n").filter(Boolean),
        liveUrl: project.liveUrl ?? undefined,
        repoUrl: project.repoUrl ?? undefined,
      };
      byId.set(project.id, mapped);
    }
    if (row.skillName) mapped.skills.push(row.skillName);
  }
  return [...byId.values()];
}

export async function getProject(slug: string): Promise<ProjectSeed | undefined> {
  "use cache";
  cacheLife("hours");
  if (!hasDatabaseUrl()) {
    return seedData.projects.find((project) => project.slug === slug);
  }
  return (await getProjects()).find((project) => project.slug === slug);
}

export async function getJourney(): Promise<readonly JourneySeed[]> {
  "use cache";
  cacheLife("hours");
  if (!hasDatabaseUrl()) return seedData.journey;

  const rows = await getDb().select().from(journey)
    .where(eq(journey.visible, true))
    .orderBy(asc(journey.sortOrder));
  return rows.map((row) => ({
    period: [row.startDate, row.endDate].filter(Boolean).join(" - "),
    title: row.title,
    organization: row.org,
    description: row.body,
  }));
}

export async function getDocuments(): Promise<readonly DocumentSeed[]> {
  "use cache";
  cacheLife("hours");
  if (!hasDatabaseUrl()) return seedData.documents;

  const rows = await getDb().select().from(documents)
    .where(eq(documents.visible, true))
    .orderBy(asc(documents.sortOrder));
  return rows.map((row) => ({
    title: row.title,
    description: row.description,
    format: row.format,
    previewUrl: row.driveUrl ?? undefined,
    downloadUrl: row.driveUrl ?? undefined,
  }));
}
