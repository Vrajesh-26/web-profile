import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/dash/LoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Owner sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginPanel} aria-labelledby="login-title">
        <Link className={styles.wordmark} href="/">Profile / Owner</Link>
        <p className={styles.eyebrow}>Private workspace</p>
        <h1 id="login-title">Sign in</h1>
        <p className={styles.description}>Use the owner account to manage this profile.</p>
        <LoginForm />
      </section>
    </main>
  );
}