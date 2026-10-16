import { seedData } from "@/data/seed";
import type { MenuRoomSeed, ProfileSeed, RoomSeed } from "@/data/seed";

export type {
  MenuRoomSeed,
  ProfileSeed,
  ProjectAccent,
  RoomSeed,
  SeedData,
} from "@/data/seed";

export function getRooms(): readonly RoomSeed[] {
  return seedData.rooms;
}

export function getMenuRooms(): readonly MenuRoomSeed[] {
  return seedData.menuRooms;
}

export function getProfile(): ProfileSeed {
  return seedData.profile;
}
