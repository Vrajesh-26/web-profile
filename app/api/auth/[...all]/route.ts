import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { rateLimits } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getAuthServer } from "@/lib/auth/server";

export async function GET(request: Request) {
	return getAuthServer().handler(request);
}

export async function POST(request: Request) {
	const origin = request.headers.get("origin");
	if (!origin || origin !== new URL(request.url).origin) {
		return NextResponse.json({ error: "Request could not be accepted." }, { status: 403 });
	}

	const pathname = new URL(request.url).pathname;
	if (pathname.endsWith("/sign-in/email")) {
		const secret = process.env.RATE_LIMIT_HASH_SECRET;
		if (!secret) {
			return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
		}

		let email = "invalid";
		try {
			const body: unknown = await request.clone().json();
			if (body && typeof body === "object" && "email" in body && typeof body.email === "string") {
				email = body.email.trim().toLowerCase().slice(0, 254);
			}
		} catch {
			email = "invalid";
		}

		const ip = request.headers.get("cf-connecting-ip") ??
			request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
			"unknown";
		const key = createHmac("sha256", secret).update(`${ip}:${email}`).digest("hex");
		const [rate] = await getDb().insert(rateLimits)
			.values({ key: `login:${key}`, count: 1 })
			.onConflictDoUpdate({
				target: rateLimits.key,
				set: {
					windowStart: sql`CASE WHEN ${rateLimits.windowStart} <= NOW() - INTERVAL '15 minutes' THEN NOW() ELSE ${rateLimits.windowStart} END`,
					count: sql`CASE WHEN ${rateLimits.windowStart} <= NOW() - INTERVAL '15 minutes' THEN 1 ELSE ${rateLimits.count} + 1 END`,
				},
			})
			.returning({ count: rateLimits.count });

		if (!rate || rate.count > 5) {
			return NextResponse.json({ error: "Sign-in failed. Check your details and try again." }, { status: 429 });
		}
	}

	return getAuthServer().handler(request);
}