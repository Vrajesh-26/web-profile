import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/data";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return (await getProjects()).map((project) => ({ slug: project.slug }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <main className={styles["case-study"]} data-accent={project.accent}>
      <nav className={styles["case-nav"]} aria-label="Case study navigation">
        <Link href="/#projects">← Back to projects</Link>
        <span>{project.year}</span>
      </nav>
      <header className={styles["case-header"]}>
        <p className={styles["eyebrow"]}>{project.role}</p>
        <h1>{project.title}</h1>
        <p className={styles["case-summary"]}>{project.description}</p>
        <p className={styles["case-outcome"]}>{project.outcome}</p>
      </header>
      <div className={styles["case-art"]} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles["case-content"]}>
        {project.caseStudy.map((paragraph, index) => (
          <section key={paragraph} aria-labelledby={`chapter-${index + 1}`}>
            <p className={styles["chapter-index"]}>
              Chapter {String(index + 1).padStart(2, "0")}
            </p>
            <h2 id={`chapter-${index + 1}`}>
              {["The idea", "The approach", "What I learned"][index] ??
                "The details"}
            </h2>
            <p>{paragraph}</p>
          </section>
        ))}
        <section className={styles["case-toolkit"]} aria-labelledby="toolkit-title">
          <p className={styles["chapter-index"]}>In the work</p>
          <h2 id="toolkit-title">Tools and technologies</h2>
          <ul>
            {project.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
      </div>
      {(project.liveUrl || project.repoUrl) && (
        <nav className={styles["case-links"]} aria-label="Project links">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer">
              Visit the project ↗
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer">
              View source ↗
            </a>
          )}
        </nav>
      )}
      <footer className={styles["case-footer"]}>
        <Link href="/#projects">Explore more projects <span aria-hidden="true">↗</span></Link>
      </footer>
    </main>
  );
}
