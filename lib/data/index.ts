import { seedData } from "@/data/seed";
import type { RoomSeed } from "@/data/seed";

export type { ProjectAccent, RoomSeed, SeedData } from "@/data/seed";

export function getRooms(): readonly RoomSeed[] {
  return seedData.rooms;
}
