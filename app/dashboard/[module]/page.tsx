import { and, asc, desc, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { io } from "next/cache";
import { notFound } from "next/navigation";
import { AgentAccessManager } from "@/components/dash/AgentAccessManager";
import { EntityManager, type EntityRow } from "@/components/dash/EntityManager";
import { InboxManager } from "@/components/dash/InboxManager";
import { ProfileEditor } from "@/components/dash/ProfileEditor";
import { SettingsManager } from "@/components/dash/SettingsManager";
import { accessLog, apiKeys, contactRequests, documents, journey, profile, projectSkills, projects, skills, socialLinks } from "@/db/schema";
import { authSession } from "@/db/auth-schema";
import { getAuthServer } from "@/lib/auth/server";
import { requireOwner } from "@/lib/auth/require-owner";
import { getDb } from "@/lib/db";
import styles from "./page.module.css";

export const instant = false;

const titles: Record<string, string> = {
  profile: "Profile", projects: "Projects", journey: "Journey", documents: "Documents",
  links: "Social links", inbox: "Inbox", agents: "Agent access", settings: "Settings",
};

export default async function DashboardModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const title = titles[module];
  if (!title) notFound();
  const db = getDb();
  let content: React.ReactNode;

  if (module === "profile") {
    const [row] = await db.select().from(profile).where(eq(profile.id, 1)).limit(1);
    content = <ProfileEditor profile={row ?? null} />;
  } else if (module === "projects") {
    const [projectRows, associations, skillRows] = await Promise.all([
      db.select().from(projects).orderBy(asc(projects.sortOrder)),
      db.select().from(projectSkills),
      db.select({ id: skills.id, name: skills.name }).from(skills).orderBy(asc(skills.sortOrder)),
    ]);
    const byProject = new Map<string, string[]>();
    for (const association of associations) {
      const ids = byProject.get(association.projectId) ?? [];
      ids.push(association.skillId);
      byProject.set(association.projectId, ids);
    }
    const rows: EntityRow[] = projectRows.map((row) => ({
      id: row.id, slug: row.slug, title: row.title, summary: row.summary, outcome: row.outcome,
      bodyMd: row.bodyMd, role: row.role, status: row.status, liveUrl: row.liveUrl,
      repoUrl: row.repoUrl, coverUrl: row.coverUrl, videoUrl: row.videoUrl, accent: row.accent,
      featured: row.featured, sortOrder: row.sortOrder, visible: row.visible,
      year: row.publishedAt?.getUTCFullYear() ?? "", skillIds: byProject.get(row.id) ?? [],
    }));
    content = <EntityManager kind="projects" rows={rows} skills={skillRows} />;
  } else if (module === "journey") {
    const rows = await db.select().from(journey).orderBy(asc(journey.sortOrder));
    const records: EntityRow[] = rows.map((row) => ({ ...row, startDate: row.startDate ?? "", endDate: row.endDate ?? "" }));
    content = <EntityManager kind="journey" rows={records} />;
  } else if (module === "documents") {
    const rows = await db.select().from(documents).orderBy(asc(documents.sortOrder));
    const records: EntityRow[] = rows.map((row) => ({ ...row, driveUrl: row.driveUrl ?? "" }));
    content = <EntityManager kind="documents" rows={records} />;
  } else if (module === "links") {
    const rows = await db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder));
    content = <EntityManager kind="links" rows={rows} />;
  } else if (module === "inbox") {
    const rows = await db.select().from(contactRequests).orderBy(desc(contactRequests.createdAt));
    content = <InboxManager requests={rows} />;
  } else if (module === "agents") {
    const [keys, logs] = await Promise.all([
      db.select({ id: apiKeys.id, label: apiKeys.label, scopes: apiKeys.scopes, rateLimitPerHour: apiKeys.rateLimitPerHour, lastUsedAt: apiKeys.lastUsedAt, revokedAt: apiKeys.revokedAt, createdAt: apiKeys.createdAt }).from(apiKeys).orderBy(desc(apiKeys.createdAt)),
      db.select().from(accessLog).orderBy(desc(accessLog.ts)).limit(100),
    ]);
    content = <AgentAccessManager keys={keys} logs={logs} />;
  } else {
    const owner = await requireOwner();
    const current = await getAuthServer().api.getSession({ headers: await headers() });
    await io();
    const now = new Date();
    const sessions = await db.select({ id: authSession.id, createdAt: authSession.createdAt, expiresAt: authSession.expiresAt, ipAddress: authSession.ipAddress, userAgent: authSession.userAgent })
      .from(authSession)
      .where(and(eq(authSession.userId, owner.id), gt(authSession.expiresAt, now)))
      .orderBy(desc(authSession.createdAt));
    content = <SettingsManager sessions={sessions.map((session) => ({ ...session, current: session.id === current?.session.id }))} />;
  }

  return <div className={styles.page}><header className={styles.header}><p>Workspace</p><h1>{title}</h1></header>{content}</div>;
}