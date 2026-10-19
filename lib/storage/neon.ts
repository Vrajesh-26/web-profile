import "server-only";

import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

function createNeonFiles(): Files | null {
  if (!process.env.AWS_ENDPOINT_URL_S3) {
    return null;
  }
  try {
    return new Files({
      adapter: neon({ bucket: "uploads" }),
    });
  } catch (err) {
    console.warn("Neon storage initialization failed:", err);
    return null;
  }
}

export const neonFiles = createNeonFiles();
