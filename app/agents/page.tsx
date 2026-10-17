import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/seo/site-url";
import styles from "./page.module.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "For hiring agents",
  description: "Public profile data and approved, rate-limited contact access for hiring agents.",
  alternates: { canonical: new URL("/agents", siteUrl) },
  openGraph: { title: "For hiring agents", description: "Public profile data and approved contact access.", url: "/agents", type: "website" },
  twitter: { card: "summary_large_image", title: "For hiring agents", description: "Public profile data and approved contact access." },
};

export default function AgentsPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation"><Link href="/">Vrajesh Darji</Link><Link href="/">Profile</Link></nav>
      <article className={styles.content}>
        <p className={styles.eyebrow}>Integration guide</p>
        <h1>Information for hiring agents</h1>
        <p className={styles.lead}>Public career information is available without authentication. Contact details are shared only with owner-approved keys.</p>
        <section aria-labelledby="public-title">
          <h2 id="public-title">Public endpoints</h2>
          <dl>
            <div><dt><code>GET /api/profile.json</code></dt><dd>Profile, skills, projects, journey, public documents, and social links. Contains no email or phone number.</dd></div>
            <div><dt><code>GET /llms.txt</code></dt><dd>Plain-text overview with links to public profile information.</dd></div>
          </dl>
        </section>
        <section aria-labelledby="private-title">
          <h2 id="private-title">Approved contact access</h2>
          <p>Request access through the <Link href="/#contact">contact form</Link>. The owner can issue and revoke scoped keys. Keys are displayed once, stored as hashes, and limited to their configured hourly request budget.</p>
          <pre><code>{`GET /api/agent/contact\nAuthorization: Bearer pf_<approved-key>`}</code></pre>
          <p>The <code>contact:read</code> scope returns the approved contact card and resume link. Requests are logged. Missing, invalid, revoked, or out-of-scope keys are rejected.</p>
        </section>
        <p className={styles.footer}>Please request access before collecting private contact information.</p>
      </article>
    </main>
  );
}