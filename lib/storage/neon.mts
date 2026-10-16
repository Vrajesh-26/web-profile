import "server-only";

import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

export const neonFiles = new Files({
  adapter: neon({ bucket: "uploads" }),
});