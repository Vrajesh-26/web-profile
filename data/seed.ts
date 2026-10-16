export type ProjectAccent =
  | "moss"
  | "deep-moss"
  | "oat"
  | "marigold"
  | "orchid"
  | "sage";

export type RoomSeed = {
  slug: string;
  title: string;
  description: string;
  accent: ProjectAccent;
};

export type SeedData = {
  rooms: RoomSeed[];
};

export const seedData: SeedData = {
  rooms: [
    {
      slug: "welcome",
      title: "A little about me",
      description: "This space is ready for a story to take shape.",
      accent: "moss",
    },
  ],
};
