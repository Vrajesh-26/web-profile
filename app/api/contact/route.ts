import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { contactRequests, rateLimits } from "@/db/schema";
import { getDb } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  turnstileToken: z.string().min(1).max(2048),
});

const RATE_WINDOW_MINUTES = 15;
const RATE_MAX_REQUESTS = 5;

function failure(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function verifyTurnstile(token: string, remoteIp: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("Turnstile is not configured");

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    },
  );
  if (!response.ok) return false;

  const result: { success?: boolean; hostname?: string } = await response.json();
  const expectedHostname = process.env.TURNSTILE_HOSTNAME;
  return result.success === true &&
    (!expectedHostname || result.hostname === expectedHostname);
}

function hashIp(ip: string, secret: string) {
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return failure("Request could not be accepted.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return failure("Request is too large.", 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return failure("Invalid request.", 400);
  }
  if (Buffer.byteLength(rawBody, "utf8") > 16_384) {
    return failure("Request is too large.", 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return failure("Invalid request.", 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the submitted fields." },
      { status: 400 },
    );
  }

  const rateSecret = process.env.RATE_LIMIT_HASH_SECRET;
  if (!rateSecret || !process.env.DATABASE_URL || !process.env.TURNSTILE_SECRET_KEY) {
    return failure("Contact service is temporarily unavailable.", 503);
  }

  const ip = request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const ipHash = hashIp(ip, rateSecret);

  try {
    const db = getDb();
    const [rate] = await db.insert(rateLimits)
      .values({ key: `contact:${ipHash}`, count: 1 })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          windowStart: sql`CASE WHEN ${rateLimits.windowStart} <= NOW() - INTERVAL '${sql.raw(String(RATE_WINDOW_MINUTES))} minutes' THEN NOW() ELSE ${rateLimits.windowStart} END`,
          count: sql`CASE WHEN ${rateLimits.windowStart} <= NOW() - INTERVAL '${sql.raw(String(RATE_WINDOW_MINUTES))} minutes' THEN 1 ELSE ${rateLimits.count} + 1 END`,
        },
      })
      .returning({ count: rateLimits.count });

    if (!rate || rate.count > RATE_MAX_REQUESTS) {
      return failure("Too many messages. Please try again later.", 429);
    }

    const tokenValid = await verifyTurnstile(
      parsed.data.turnstileToken,
      ip === "unknown" ? null : ip,
    );
    if (!tokenValid) return failure("Verification failed. Please try again.", 400);

    await db.insert(contactRequests).values({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      message: parsed.data.message,
      source: "human",
      ipHash,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Contact request failed.", error);
    return failure("Contact service is temporarily unavailable.", 503);
  }
}