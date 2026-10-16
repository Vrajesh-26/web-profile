import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthServer } from "@/lib/auth/server";

export async function requireOwner() {
  const session = await getAuthServer().api.getSession({ headers: await headers() });
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();

  if (
    !session?.user ||
    !ownerEmail ||
    session.user.email.toLowerCase() !== ownerEmail ||
    !session.user.emailVerified
  ) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

export async function requireOwnerPage() {
  try {
    await requireOwner();
  } catch {
    redirect("/login");
  }
}