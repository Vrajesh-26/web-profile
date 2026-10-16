"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Field";
import { saveProfile, type ProfileActionState } from "@/app/dashboard/profile/actions";
import type { profile } from "@/db/schema";
import styles from "./ProfileEditor.module.css";

type Profile = typeof profile.$inferSelect;

const profileFields = [
  ["fullName", "Full name"], ["tagline", "Tagline"], ["roleLine", "Role line"],
  ["location", "Location"], ["portraitAlt", "Portrait description"],
  ["avatarUrl", "Avatar URL"], ["resumeDriveUrl", "Resume URL"],
] as const;

export function ProfileEditor({ profile: current }: { profile: Profile | null }) {
  const [state, action, pending] = useActionState<ProfileActionState, FormData>(saveProfile, null);
  return (
    <form action={action} className={styles.form}>
      <div className={styles.grid}>
        {profileFields.map(([name, label]) => (
          <div key={name}>
            <FieldLabel htmlFor={`profile-${name}`}>{label}</FieldLabel>
            <Input id={`profile-${name}`} name={name} defaultValue={current?.[name] ?? ""} required={name !== "avatarUrl" && name !== "resumeDriveUrl"} maxLength={name === "portraitAlt" ? 300 : 240} />
          </div>
        ))}
        <div>
          <FieldLabel htmlFor="profile-availability">Availability</FieldLabel>
          <Select id="profile-availability" name="availability" defaultValue={current?.availability ?? "open"}>
            <option value="open">Open to roles</option><option value="busy">Busy</option><option value="closed">Closed</option>
          </Select>
        </div>
        <div className={styles.wide}>
          <FieldLabel htmlFor="profile-bioMd">Bio</FieldLabel>
          <Textarea id="profile-bioMd" name="bioMd" defaultValue={current?.bioMd ?? ""} required maxLength={10000} />
        </div>
        <div className={styles.wide}>
          <FieldLabel htmlFor="profile-nowMd">What I&apos;m doing now</FieldLabel>
          <Textarea id="profile-nowMd" name="nowMd" defaultValue={current?.nowMd ?? ""} required maxLength={5000} />
        </div>
      </div>
      <div className={styles.footer}>
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save profile"}</Button>
        {state?.error && <p className={styles.error} role="alert">{state.error}</p>}
        {state?.success && <p className={styles.success} role="status">{state.success}</p>}
      </div>
    </form>
  );
}