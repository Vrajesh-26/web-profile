import { io } from "next/cache";
import { asc } from "drizzle-orm";
import { skills } from "@/db/schema";
import { getDb } from "@/lib/db";
import { SkillEditor } from "@/components/dash/SkillEditor";
import styles from "./page.module.css";

export const instant = false;

export default async function SkillsPage() {
  await io();
  const rows = await getDb().select().from(skills).orderBy(asc(skills.sortOrder));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>Content</p><h1>Skills</h1></div>
        <p>{rows.length} {rows.length === 1 ? "skill" : "skills"}</p>
      </header>
      <section className={styles.createSection} aria-labelledby="create-skill-title">
        <h2 id="create-skill-title">Add a skill</h2>
        <SkillEditor />
      </section>
      <section className={styles.listSection} aria-labelledby="skills-list-title">
        <div className={styles.listHeading}><h2 id="skills-list-title">All skills</h2><span>Name, group, and display order</span></div>
        {rows.length === 0 ? (
          <p className={styles.empty}>No skills yet.</p>
        ) : (
          <div className={styles.rows}>
            {rows.map((skill, index) => <SkillEditor key={skill.id} skill={skill} index={index} count={rows.length} />)}
          </div>
        )}
      </section>
    </div>
  );
}