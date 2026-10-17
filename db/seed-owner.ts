import { loadEnvConfig } from "@next/env";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

loadEnvConfig(process.cwd());

const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
const password = process.env.OWNER_PASSWORD;
const name = process.env.OWNER_NAME?.trim() || "Profile Owner";

if (!email || !password || password.length < 12) {
  throw new Error("Set OWNER_EMAIL and OWNER_PASSWORD (at least 12 characters) before provisioning the owner.");
}

const ownerEmail: string = email;
const ownerPassword: string = password;

async function provisionOwner() {
  const [{ getDb }, { authSchema, authUser }] = await Promise.all([
    import("@/lib/db"),
    import("@/db/auth-schema"),
  ]);
  const secret = process.env.AUTH_SECRET;
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);
  if (!secret || !baseURL) {
    throw new Error("Set AUTH_SECRET and NEXT_PUBLIC_SITE_URL before provisioning the owner.");
  }

  const bootstrapAuth = betterAuth({
    database: drizzleAdapter(getDb(), { provider: "pg", schema: authSchema }),
    appName: "Profile Dashboard",
    baseURL,
    secret,
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
  });
  const result = await bootstrapAuth.api.signUpEmail({ body: { name, email: ownerEmail, password: ownerPassword } });
  await getDb().update(authUser).set({ emailVerified: true }).where((await import("drizzle-orm")).eq(authUser.id, result.user.id));
  console.info(`Owner account provisioned for ${ownerEmail}.`);
}

provisionOwner().catch((error: unknown) => {
  console.error("Owner provisioning failed.", error);
  process.exitCode = 1;
});