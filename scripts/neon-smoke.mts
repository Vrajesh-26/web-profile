import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { neon as createSqlClient } from "@neondatabase/serverless";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");

async function main() {
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");

  const sql = createSqlClient(databaseUrl);
  const [databaseResult] = await sql`SELECT 1 AS ok`;
  if (databaseResult?.ok !== 1) {
    throw new Error("Neon Postgres smoke query returned an unexpected result.");
  }
  console.info("Postgres connection OK (SELECT 1).");

  const { neonFiles } = await import("../lib/storage");
  if (!neonFiles) {
    throw new Error("Neon Storage is not configured. Check AWS_ENDPOINT_URL_S3 in environment.");
  }
  const objectKey = `smoke/${randomUUID()}.txt`;
  const expected = Buffer.from(`Neon storage smoke test ${randomUUID()}`);

  try {
    await neonFiles.upload(objectKey, expected, { contentType: "text/plain" });
    const downloaded = await neonFiles.download(objectKey);
    const actual = Buffer.from(await downloaded.arrayBuffer());
    if (!actual.equals(expected)) {
      throw new Error("Neon Object Storage returned different bytes.");
    }
    console.info("Object Storage connection OK (upload/download byte match).");
  } finally {
    await neonFiles.delete(objectKey);
  }

  console.info("Object Storage smoke object deleted.");
}

main().catch((error: unknown) => {
  console.error("Neon service smoke check failed.", error);
  process.exitCode = 1;
});