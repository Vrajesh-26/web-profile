import { createHash, createHmac } from "node:crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { accessLog, apiKeys, profile, profilePrivate, rateLimits } from "@/db/schema";
import { getDb } from "@/lib/db";

const path = "/api/agent/contact";

function hashIp(ip: string, secret: string) {
  return createHmac("sha256", secret).update(ip).digest("hex");
}

async function recordAccess(request: Request, keyId: string | null, status: number, secret: string) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  await getDb().insert(accessLog).values({
    keyId,
    path,
    status,
    ua: request.headers.get("user-agent")?.slice(0, 500) ?? null,
    ipHash: hashIp(ip, secret),
  });
}

export async function GET(request: Request) {
  const secret = process.env.RATE_LIMIT_HASH_SECRET;
  if (!secret) return NextResponse.json({ error: "Service unavailable." }, { status: 503 });

  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(pf_[A-Za-z0-9_-]{32,})$/.exec(authorization);
  if (!match) {
    await recordAccess(request, null, 401, secret);
    return NextResponse.json({ error: "A valid bearer key is required." }, { status: 401 });
  }

  const keyHash = createHash("sha256").update(match[1]).digest("hex");
  const db = getDb();
  const [key] = await db.select({ id: apiKeys.id, scopes: apiKeys.scopes, rateLimitPerHour: apiKeys.rateLimitPerHour })
    .from(apiKeys).where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt))).limit(1);
  if (!key) {
    await recordAccess(request, null, 401, secret);
    return NextResponse.json({ error: "A valid bearer key is required." }, { status: 401 });
  }
  if (!key.scopes.includes("contact:read")) {
    await recordAccess(request, key.id, 403, secret);
    return NextResponse.json({ error: "This key does not have the required scope." }, { status: 403 });
  }

  const [rate] = await db.insert(rateLimits).values({ key: `agent:${key.id}`, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        windowStart: sql`CASE WHEN ${rateLimits.windowStart} <= NOW() - INTERVAL '1 hour' THEN NOW() ELSE ${rateLimits.windowStart} END`,
        count: sql`CASE WHEN ${rateLimits.windowStart} <= NOW() - INTERVAL '1 hour' THEN 1 ELSE ${rateLimits.count} + 1 END`,
      },
    }).returning({ count: rateLimits.count });
  const status = rate && rate.count <= key.rateLimitPerHour ? 200 : 429;
  await recordAccess(request, key.id, status, secret);
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, key.id));
  if (status === 429) {
    return NextResponse.json({ error: "Hourly request limit reached." }, {
      status,
      headers: { "Retry-After": "3600", "Cache-Control": "no-store" },
    });
  }

  const [privateCard] = await db.select({ email: profilePrivate.email, phone: profilePrivate.phone })
    .from(profilePrivate).where(eq(profilePrivate.id, 1)).limit(1);
  const [publicCard] = await db.select({ name: profile.fullName, resumeUrl: profile.resumeDriveUrl })
    .from(profile).where(eq(profile.id, 1)).limit(1);
  return NextResponse.json({
    name: publicCard?.name ?? null,
    email: privateCard?.email ?? null,
    phone: privateCard?.phone ?? null,
    resumeUrl: publicCard?.resumeUrl ?? null,
  }, { headers: { "Cache-Control": "private, no-store", "Vary": "Authorization" } });
}