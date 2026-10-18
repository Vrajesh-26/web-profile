"use client";

import { useActionState } from "react";
import { Monitor, Smartphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Field";
import { changeOwnerPassword, revokeOwnerSession, type PasswordActionState } from "@/app/dashboard/settings/actions";
import styles from "./SettingsManager.module.css";

export type SessionView = {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  current: boolean;
};

function deviceIcon(userAgent: string | null) {
  return /mobile|android|iphone/i.test(userAgent ?? "") ? <Smartphone size={17} /> : <Monitor size={17} />;
}

function formatUtcDateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${pad(value.getUTCDate())}/${pad(value.getUTCMonth() + 1)}/${value.getUTCFullYear()} ${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())} UTC`;
}

function formatUtcDate(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${pad(value.getUTCDate())}/${pad(value.getUTCMonth() + 1)}/${value.getUTCFullYear()} UTC`;
}

export function SettingsManager({ sessions }: { sessions: readonly SessionView[] }) {
  const [state, action, pending] = useActionState<PasswordActionState, FormData>(changeOwnerPassword, null);
  return (
    <div className={styles.settings}>
      <section className={styles.section} aria-labelledby="password-title">
        <h2 id="password-title">Change password</h2>
        <form action={action} className={styles.passwordForm}>
          <div><FieldLabel htmlFor="current-password">Current password</FieldLabel><Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required /></div>
          <div><FieldLabel htmlFor="new-password">New password</FieldLabel><Input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></div>
          <div className={styles.formFooter}><Button type="submit" disabled={pending}>{pending ? "Updating..." : "Update password"}</Button>{state?.error && <p className={styles.error} role="alert">{state.error}</p>}{state?.success && <p className={styles.success} role="status">{state.success}</p>}</div>
        </form>
      </section>
      <section className={styles.section} aria-labelledby="sessions-title">
        <div className={styles.sectionHeader}><div><h2 id="sessions-title">Active sessions</h2><p>End sessions you no longer recognize.</p></div><span>{sessions.length}</span></div>
        {sessions.length === 0 ? <p className={styles.empty}>No active sessions.</p> : (
          <div className={styles.sessionList}>{sessions.map((session) => (
            <article className={styles.session} key={session.id}>
              {deviceIcon(session.userAgent)}
              <div>
                <strong>{session.current ? "This device" : "Signed-in device"}</strong>
                <span>{session.userAgent || "Unknown browser"}</span>
                <small>
                  {session.ipAddress || "Unknown IP"} · Started <time dateTime={session.createdAt.toISOString()}>{formatUtcDateTime(session.createdAt)}</time> · Expires <time dateTime={session.expiresAt.toISOString()}>{formatUtcDate(session.expiresAt)}</time>
                </small>
              </div>
              {!session.current && <form action={revokeOwnerSession}><input type="hidden" name="id" value={session.id} /><Button variant="icon" type="submit" title="Revoke session" aria-label="Revoke this session"><Trash2 size={16} /></Button></form>}
            </article>
          ))}</div>
        )}
      </section>
      <section className={styles.section} aria-labelledby="export-title">
        <h2 id="export-title">Data export</h2>
        <p>Download the profile content, private contact details, inbox, agent keys, and access records as JSON.</p>
        <form action="/api/dashboard/export" method="post"><Button variant="secondary" type="submit">Download JSON export</Button></form>
      </section>
    </div>
  );
}