import Link from "next/link";
import styles from "./page.module.css";

const entries = [
  ["Profile", "Edit the introduction and availability", "/dashboard/profile"],
  ["Skills", "Manage skills shown across the portfolio", "/dashboard/skills"],
  ["Projects", "Update work and case studies", "/dashboard/projects"],
  ["Journey", "Edit education and experience", "/dashboard/journey"],
  ["Documents", "Manage public documents", "/dashboard/documents"],
  ["Social links", "Update public destinations", "/dashboard/links"],
  ["Inbox", "Review messages and mark their status", "/dashboard/inbox"],
  ["Agent access", "Manage credentials and access records", "/dashboard/agents"],
  ["Settings", "Account, sessions, and export", "/dashboard/settings"],
] as const;

export default function DashboardHome() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Workspace</p>
        <h1>Dashboard</h1>
        <p>Manage the content and access for your public profile.</p>
      </header>
      <nav className={styles.moduleList} aria-label="Dashboard modules">
        {entries.map(([name, description, href]) => (
          <Link className={styles.moduleLink} href={href} key={href}>
            <span><strong>{name}</strong><small>{description}</small></span>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}