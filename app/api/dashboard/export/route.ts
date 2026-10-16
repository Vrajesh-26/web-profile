import { NextResponse } from "next/server";
import { accessLog, apiKeys, contactRequests, documents, journey, profile, profilePrivate, projectSkills, projects, rateLimits, skills, socialLinks } from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireOwner } from "@/lib/auth/require-owner";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Request could not be accepted." }, { status: 403 });
  }

  await requireOwner();
  const db = getDb();
  const [profileRows, privateProfile, skillRows, projectRows, projectSkillRows, journeyRows, documentRows, linkRows, contactRows, keyRows, logRows, rateRows] = await Promise.all([
    db.select().from(profile), db.select().from(profilePrivate), db.select().from(skills),
    db.select().from(projects), db.select().from(projectSkills), db.select().from(journey),
    db.select().from(documents), db.select().from(socialLinks), db.select().from(contactRequests),
    db.select().from(apiKeys), db.select().from(accessLog), db.select().from(rateLimits),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: profileRows,
    profilePrivate: privateProfile,
    skills: skillRows,
    projects: projectRows,
    projectSkills: projectSkillRows,
    journey: journeyRows,
    documents: documentRows,
    socialLinks: linkRows,
    contactRequests: contactRows,
    apiKeys: keyRows,
    accessLog: logRows,
    rateLimits: rateRows,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="profile-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}