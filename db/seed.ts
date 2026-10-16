import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { seedData } from "@/data/seed";
import * as schema from "@/db/schema";

loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set in .env.local");
}

const db = drizzle(neon(connectionString), { schema });

function categoryFor(label: string, name: string) {
  if (label === "Tools") return "tools" as const;
  if (["Node.js", "PostgreSQL", "REST APIs"].includes(name)) {
    return "backend" as const;
  }
  if (label === "Development") return "web" as const;
  return "other" as const;
}

async function seed() {
  await db.delete(schema.projectSkills);
  await db.delete(schema.projects);
  await db.delete(schema.skills);
  await db.delete(schema.journey);
  await db.delete(schema.documents);
  await db.delete(schema.profile).where(eq(schema.profile.id, 1));

  const { profile: profileSeed } = seedData;
  await db.insert(schema.profile).values({
    id: 1,
    fullName: `${profileSeed.firstName} ${profileSeed.lastName}`,
    tagline: profileSeed.intro,
    roleLine: profileSeed.role,
    bioMd: profileSeed.bio,
    avatarUrl: null,
    resumeDriveUrl: seedData.documents[0]?.downloadUrl ?? null,
    availability: "open",
    nowMd: profileSeed.now,
    portraitAlt: profileSeed.portraitAlt,
    location: profileSeed.location,
  });

  await db.insert(schema.skills).values(
    seedData.skills.map((skill, sortOrder) => ({
      name: skill.name,
      category: categoryFor(skill.category, skill.name),
      categoryLabel: skill.category,
      sortOrder,
      visible: true,
    })),
  );

  const skillRows = await db.select({ id: schema.skills.id, name: schema.skills.name })
    .from(schema.skills);
  const skillIds = new Map(skillRows.map((skill) => [skill.name, skill.id]));

  await db.insert(schema.projects).values(
    seedData.projects.map((project, sortOrder) => ({
      slug: project.slug,
      title: project.title,
      summary: project.description,
      outcome: project.outcome,
      bodyMd: project.caseStudy.join("\n\n"),
      role: project.role,
      liveUrl: project.liveUrl ?? null,
      repoUrl: project.repoUrl ?? null,
      accent: project.accent,
      featured: sortOrder === 0,
      sortOrder,
      visible: true,
      publishedAt: new Date(`${project.year}-01-01T00:00:00.000Z`),
    })),
  );

  const projectRows = await db.select({
    id: schema.projects.id,
    slug: schema.projects.slug,
  }).from(schema.projects);
  const projectIds = new Map(projectRows.map((project) => [project.slug, project.id]));
  const projectSkillRows = seedData.projects.flatMap((project) => {
    const projectId = projectIds.get(project.slug);
    if (!projectId) return [];

    return project.skills.flatMap((skillName) => {
      const skillId = skillIds.get(skillName);
      return skillId ? [{ projectId, skillId }] : [];
    });
  });
  if (projectSkillRows.length) {
    await db.insert(schema.projectSkills).values(projectSkillRows);
  }

  await db.insert(schema.journey).values(
    seedData.journey.map((item, sortOrder) => ({
      kind: "experience" as const,
      org: item.organization,
      title: item.title,
      startDate: item.period,
      body: item.description,
      sortOrder,
      visible: true,
    })),
  );

  await db.insert(schema.documents).values(
    seedData.documents.map((document, sortOrder) => ({
      title: document.title,
      description: document.description,
      format: document.format,
      kind: sortOrder === 0 ? "resume" as const : "other" as const,
      driveUrl: document.downloadUrl ?? null,
      sortOrder,
      visible: true,
    })),
  );

  console.info("Seeded public profile content.");
}

seed().catch((error: unknown) => {
  console.error("Database seed failed.", error);
  process.exitCode = 1;
});