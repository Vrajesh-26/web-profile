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

export type MenuRoomSeed = {
  label: string;
  href: string;
  description: string;
  accent: ProjectAccent;
};

export type ProfileSeed = {
  firstName: string;
  lastName: string;
  role: string;
  availability: string;
  intro: string;
  portraitAlt: string;
};

export type SeedData = {
  rooms: RoomSeed[];
  menuRooms: MenuRoomSeed[];
  profile: ProfileSeed;
};

export const seedData: SeedData = {
  profile: {
    firstName: "Vrajesh",
    lastName: "Darji",
    role: "Full-stack developer",
    availability: "Open to roles",
    intro: "I build thoughtful digital experiences from idea to interface.",
    portraitAlt: "Illustrated portrait of Vrajesh Darji",
  },
  menuRooms: [
    {
      label: "Home",
      href: "#home",
      description: "A thoughtful introduction.",
      accent: "moss",
    },
    {
      label: "About",
      href: "#welcome",
      description: "The person behind the work.",
      accent: "sage",
    },
    {
      label: "Skills",
      href: "#skills",
      description: "Tools for turning ideas into useful things.",
      accent: "marigold",
    },
    {
      label: "Projects",
      href: "#projects",
      description: "Selected work and the thinking behind it.",
      accent: "deep-moss",
    },
    {
      label: "Journey",
      href: "#journey",
      description: "A few steps along the way.",
      accent: "orchid",
    },
    {
      label: "Contact",
      href: "#contact",
      description: "Start a conversation.",
      accent: "oat",
    },
  ],
  rooms: [
    {
      slug: "welcome",
      title: "A little about me",
      description: "This space is ready for a story to take shape.",
      accent: "moss",
    },
  ],
};
