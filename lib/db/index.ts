import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

function createDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set in .env.local");
  }

  return drizzle(neon(connectionString), { schema });
}

type Database = ReturnType<typeof createDatabase>;
let database: Database | undefined;

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): Database {
  database ??= createDatabase();
  return database;
}