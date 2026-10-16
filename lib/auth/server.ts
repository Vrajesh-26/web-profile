import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { authSchema } from "@/db/auth-schema";
import { getDb } from "@/lib/db";

function createAuthServer() {
  const secret = process.env.AUTH_SECRET;
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);
  if (!secret) throw new Error("AUTH_SECRET must be set before using authentication.");
  if (!baseURL) throw new Error("NEXT_PUBLIC_SITE_URL must be set before using authentication.");

  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: authSchema,
    }),
    appName: "Profile Dashboard",
    baseURL,
    secret,
    emailAndPassword: {
      enabled: true,
      disableSignUp: process.env.AUTH_BOOTSTRAP !== "true",
    },
    disabledPaths: process.env.AUTH_BOOTSTRAP === "true" ? [] : ["/sign-up/email"],
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
    plugins: [nextCookies()],
  });
}

let authInstance: ReturnType<typeof createAuthServer> | undefined;

export function getAuthServer() {
  if (!authInstance) authInstance = createAuthServer();

  return authInstance;
}