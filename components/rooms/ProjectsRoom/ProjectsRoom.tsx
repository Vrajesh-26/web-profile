import Link from "next/link";
import type { ProjectSeed } from "@/lib/data";
import styles from "./ProjectsRoom.module.css";

export function ProjectCard({
  project,
  index,
}: {
  project: ProjectSeed;
  index: number;
}) {
  return (
    <article
      className={styles["project-card"]}
      data-accent={project.accent}
      style={
        {
          "--card-index": index,
          "--card-view-name": `project-${project.slug}`,
        } as React.CSSProperties
      }
    >
      <div className={styles["project-art"]}>
        {project.coverUrl ? (
          <Link
            href={`/projects/${project.slug}`}
            className={styles["project-art-link"]}
            aria-label={`View ${project.title} case study`}
          >
            <div className={styles["project-cover-stage"]}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.coverUrl}
                alt={`${project.title} preview`}
                className={styles["project-cover-img"]}
                loading="lazy"
                decoding="async"
              />
            </div>
          </Link>
        ) : (
          <div className={styles["art-fallback"]} aria-hidden="true">
            <span className={styles["art-orbit"]} />
            <span className={styles["art-sun"]} />
            <span className={styles["art-landscape"]} />
            <span className={styles["art-label"]}>{project.title}</span>
          </div>
        )}
      </div>
      <div className={styles["project-copy"]}>
        <div className={styles["project-meta"]}>
          <span>{project.year}</span>
          <span>{project.role}</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <p className={styles["project-outcome"]}>{project.outcome}</p>
        <ul className={styles["project-skills"]} aria-label="Skills used">
          {project.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        <Link className={styles["case-study-link"]} href={`/projects/${project.slug}`}>
          Read the case study <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

export function ProjectsRoom({
  projects,
  selectedSkill,
}: {
  projects: readonly ProjectSeed[];
  selectedSkill: string | null;
}) {
  const visibleProjects = selectedSkill
    ? projects.filter((project) => project.skills.includes(selectedSkill))
    : projects;

  return (
    <section
      className={styles["projects-room"]}
      id="projects"
      aria-labelledby="projects-title"
      aria-live="polite"
    >
      <div className={styles["projects-heading"]}>
        <div>
          <p className={styles["eyebrow"]}>Selected work</p>
          <h2 id="projects-title">Ideas, made tangible.</h2>
        </div>
        <p>
          {selectedSkill
            ? `Showing projects that use ${selectedSkill}.`
            : "A few projects and the thinking behind them."}
        </p>
      </div>
      {visibleProjects.length > 0 ? (
        <div className={styles["project-deck"]}>
          {visibleProjects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      ) : (
        <p className={styles["no-projects"]}>
          No selected projects use this skill just yet.
        </p>
      )}
    </section>
  );
}
