"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import styles from "./DashboardSignOut.module.css";

export function DashboardSignOut() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <button className={styles.button} onClick={signOut} type="button"><LogOut size={15} /> Sign out</button>;
}