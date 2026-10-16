import Link from "next/link";
import { DashboardSignOut } from "@/components/dash/DashboardSignOut";
import styles from "./DashboardShell.module.css";

const sections = [
  ["Overview", "/dashboard"],
  ["Profile", "/dashboard/profile"],
  ["Skills", "/dashboard/skills"],
  ["Projects", "/dashboard/projects"],
  ["Journey", "/dashboard/journey"],
  ["Documents", "/dashboard/documents"],
  ["Social links", "/dashboard/links"],
  ["Inbox", "/dashboard/inbox"],
  ["Agent access", "/dashboard/agents"],
  ["Settings", "/dashboard/settings"],
] as const;

export function DashboardShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/dashboard" className={styles.brand}>Profile admin</Link>
        <p className={styles.groupLabel}>Workspace</p>
        <nav aria-label="Dashboard navigation" className={styles.navigation}>
          {sections.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" target="_blank">View public profile</Link>
          <DashboardSignOut />
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}