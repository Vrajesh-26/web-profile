import type { Metadata } from "next";
import { DashboardShell } from "@/components/dash/DashboardShell";
import { requireOwnerPage } from "@/lib/auth/require-owner";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Dashboard" },
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireOwnerPage();
  return <DashboardShell>{children}</DashboardShell>;
}