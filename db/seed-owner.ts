import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
const password = process.env.OWNER_PASSWORD;
const name = process.env.OWNER_NAME?.trim() || "Profile Owner";

if (!email || !password || password.length < 12) {
  throw new Error("Set OWNER_EMAIL and OWNER_PASSWORD (at least 12 characters) before provisioning the owner.");
}

const ownerEmail: string = email;
const ownerPassword: string = password;

process.env.AUTH_BOOTSTRAP = "true";

async function provisionOwner() {
  const [{ getAuthServer }, { getDb }, { authUser }] = await Promise.all([
    import("@/lib/auth/server"),
    import("@/lib/db"),
    import("@/db/auth-schema"),
  ]);
  const result = await getAuthServer().api.signUpEmail({ body: { name, email: ownerEmail, password: ownerPassword } });
  await getDb().update(authUser).set({ emailVerified: true }).where((await import("drizzle-orm")).eq(authUser.id, result.user.id));
  console.info(`Owner account provisioned for ${ownerEmail}.`);
}

provisionOwner().catch((error: unknown) => {
  console.error("Owner provisioning failed.", error);
  process.exitCode = 1;
});