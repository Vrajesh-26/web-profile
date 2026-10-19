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
  avatarUrl?: string | null;
  bio: string;
  now: string;
  location: string;
};

export type SkillSeed = {
  name: string;
  category: string;
};

export type ProjectSeed = {
  slug: string;
  title: string;
  description: string;
  outcome: string;
  year: string;
  role: string;
  accent: ProjectAccent;
  skills: string[];
  caseStudy: string[];
  liveUrl?: string;
  repoUrl?: string;
};

export type JourneySeed = {
  period: string;
  title: string;
  organization: string;
  description: string;
};

export type DocumentSeed = {
  title: string;
  description: string;
  format: string;
  previewUrl?: string;
  downloadUrl?: string;
};

export type SeedData = {
  rooms: RoomSeed[];
  menuRooms: MenuRoomSeed[];
  profile: ProfileSeed;
  skills: SkillSeed[];
  projects: ProjectSeed[];
  journey: JourneySeed[];
  documents: DocumentSeed[];
};

export const seedData: SeedData = {
  profile: {
    firstName: "Vrajesh",
    lastName: "Darji",
    role: "Full-stack developer",
    availability: "Open to roles",
    intro: "I build thoughtful digital experiences from idea to interface.",
    portraitAlt: "Portrait of Vrajesh Darji",
    avatarUrl: null,
    bio: "I’m a developer who enjoys shaping useful ideas into thoughtful digital products. I like working across the stack, bringing care to the details people see and the systems that make them work.",
    now: "Exploring product ideas, sharpening my craft, and looking for a team where curious people build things that matter.",
    location: "Based in India · Open to remote",
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
      label: "Documents",
      href: "#documents",
      description: "A closer look at my experience.",
      accent: "oat",
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
      description: "A developer who likes making useful things feel considered.",
      accent: "moss",
    },
    {
      slug: "skills",
      title: "What I work with",
      description: "A flexible toolkit, always growing.",
      accent: "marigold",
    },
    {
      slug: "projects",
      title: "A few things I’ve made",
      description: "Selected projects, from first sketch to shipped detail.",
      accent: "deep-moss",
    },
    {
      slug: "journey",
      title: "The path so far",
      description: "A few moments that shaped how I work.",
      accent: "orchid",
    },
    {
      slug: "documents",
      title: "Take a closer look",
      description: "A resume and a short introduction.",
      accent: "oat",
    },
    {
      slug: "contact",
      title: "Have something in mind?",
      description: "I’d be glad to hear what you’re working on.",
      accent: "sage",
    },
  ],
  skills: [
    { name: "TypeScript", category: "Development" },
    { name: "React", category: "Development" },
    { name: "Next.js", category: "Development" },
    { name: "Node.js", category: "Development" },
    { name: "PostgreSQL", category: "Development" },
    { name: "REST APIs", category: "Development" },
    { name: "CSS", category: "Design & UI" },
    { name: "Figma", category: "Design & UI" },
    { name: "Accessibility", category: "Design & UI" },
    { name: "Git", category: "Tools" },
    { name: "Testing", category: "Tools" },
  ],
  projects: [
    {
      slug: "fieldnotes",
      title: "Fieldnotes",
      description:
        "A calm space for collecting observations, organizing ideas, and finding a thread worth following.",
      outcome: "A focused writing flow with a lightweight, searchable archive.",
      year: "2025",
      role: "Product design · Full-stack development",
      accent: "sage",
      skills: ["Next.js", "TypeScript", "PostgreSQL", "CSS"],
      caseStudy: [
        "Fieldnotes began with a simple question: how might a personal knowledge tool feel inviting enough to use every day? The interface favors a clear writing surface and keeps organization close at hand.",
        "I shaped the core flow around quick capture, gentle structure, and search that stays out of the way until it is needed. The result is a small, coherent product rather than a collection of disconnected features.",
        "The project brought together interface design, typed application code, and a relational data model. Its strongest lesson was that reducing friction often matters more than adding another feature.",
      ],
    },
    {
      slug: "common-ground",
      title: "Common Ground",
      description:
        "A community events concept that helps people discover small gatherings close to home.",
      outcome: "A clear path from browsing local events to planning a visit.",
      year: "2024",
      role: "Interface design · Front-end development",
      accent: "marigold",
      skills: ["React", "TypeScript", "CSS", "Figma"],
      caseStudy: [
        "Common Ground explores a more human way to find local events. Instead of beginning with a long list of filters, the experience makes place, time, and the character of a gathering easy to understand at a glance.",
        "I built the interface around readable event details and reusable pieces that work from a wide desktop view down to a small phone. The visual system uses warm color and open space without hiding practical information.",
        "The design exercise emphasized progressive disclosure: show enough to help someone decide, then make the next step obvious when they are ready.",
      ],
    },
    {
      slug: "steady-state",
      title: "Steady State",
      description:
        "A small dashboard concept for making personal routines easier to review and adjust.",
      outcome: "A weekly overview that puts useful patterns before noisy metrics.",
      year: "2023",
      role: "Full-stack development",
      accent: "orchid",
      skills: ["Next.js", "Node.js", "REST APIs", "Testing"],
      caseStudy: [
        "Steady State is a dashboard concept built around reflection rather than streaks. Its weekly view highlights a few useful patterns and lets people adjust their routines without treating every missed day as a failure.",
        "The implementation pairs a compact data model with a responsive interface. I paid particular attention to the empty and error states so the product remains understandable when there is little data to show.",
        "This project reinforced the value of making a product’s tone consistent with its purpose, from the wording of a prompt to the way a chart is presented.",
      ],
    },
  ],
  journey: [
    {
      period: "Today",
      title: "Building with curiosity",
      organization: "Independent practice",
      description:
        "Working across product thinking and full-stack development while exploring what makes digital tools feel genuinely useful.",
    },
    {
      period: "Recently",
      title: "Turning ideas into interfaces",
      organization: "Selected projects",
      description:
        "Practiced taking a project from its first sketch through implementation, refining the experience as the details became real.",
    },
    {
      period: "Before",
      title: "Finding my footing in software",
      organization: "Learning by making",
      description:
        "Built a foundation in web technologies through small experiments, steady iteration, and a habit of learning in public.",
    },
  ],
  documents: [
    {
      title: "Resume",
      description: "Experience, skills, and the work I’m proud to share.",
      format: "PDF · 2 pages",
    },
    {
      title: "A short introduction",
      description: "A little more context on how I approach product work.",
      format: "PDF · 1 page",
    },
  ],
};
