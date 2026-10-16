import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const availabilityEnum = pgEnum("availability", ["open", "busy", "closed"]);
export const skillCategoryEnum = pgEnum("skill_category", [
  "web",
  "backend",
  "security",
  "data",
  "tools",
  "other",
]);
export const projectStatusEnum = pgEnum("project_status", [
  "live",
  "building",
  "archived",
]);
export const journeyKindEnum = pgEnum("journey_kind", [
  "education",
  "experience",
  "certificate",
  "award",
]);
export const documentKindEnum = pgEnum("document_kind", [
  "resume",
  "certificate",
  "other",
]);
export const contactSourceEnum = pgEnum("contact_source", ["human", "agent"]);
export const contactStatusEnum = pgEnum("contact_status", [
  "new",
  "read",
  "replied",
]);

export const profile = pgTable("profile", {
  id: integer("id").primaryKey().default(1),
  fullName: text("full_name").notNull(),
  tagline: text("tagline").notNull(),
  roleLine: text("role_line").notNull(),
  bioMd: text("bio_md").notNull(),
  portraitAlt: text("portrait_alt").notNull(),
  location: text("location").notNull(),
  avatarUrl: text("avatar_url"),
  resumeDriveUrl: text("resume_drive_url"),
  availability: availabilityEnum("availability").notNull().default("open"),
  nowMd: text("now_md").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const profilePrivate = pgTable("profile_private", {
  id: integer("id").primaryKey().default(1),
  email: text("email"),
  phone: text("phone"),
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  category: skillCategoryEnum("category").notNull(),
  categoryLabel: text("category_label").notNull(),
  iconKey: text("icon_key"),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  outcome: text("outcome").notNull(),
  bodyMd: text("body_md").notNull(),
  role: text("role").notNull(),
  status: projectStatusEnum("status").notNull().default("live"),
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  coverUrl: text("cover_url"),
  videoUrl: text("video_url"),
  accent: text("accent").notNull(),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

export const projectSkills = pgTable(
  "project_skills",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.skillId] })],
);

export const journey = pgTable("journey", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: journeyKindEnum("kind").notNull().default("experience"),
  org: text("org").notNull(),
  title: text("title").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  body: text("body").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  format: text("format").notNull(),
  kind: documentKindEnum("kind").notNull().default("other"),
  driveUrl: text("drive_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const socialLinks = pgTable("social_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const contactRequests = pgTable("contact_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  source: contactSourceEnum("source").notNull().default("human"),
  status: contactStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  ipHash: text("ip_hash"),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  scopes: text("scopes").array().notNull(),
  rateLimitPerHour: integer("rate_limit_per_hour").notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accessLog = pgTable("access_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  ts: timestamp("ts", { withTimezone: true }).notNull().defaultNow(),
  keyId: uuid("key_id").references(() => apiKeys.id, { onDelete: "set null" }),
  path: text("path").notNull(),
  status: integer("status").notNull(),
  ua: text("ua"),
  ipHash: text("ip_hash"),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true })
    .notNull()
    .defaultNow(),
  count: integer("count").notNull().default(0),
});