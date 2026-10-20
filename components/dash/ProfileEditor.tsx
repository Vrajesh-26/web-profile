"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Field";
import { FileOrUrlInput } from "@/components/dash/FileOrUrlInput";
import { saveProfile, uploadProfilePhoto, type ProfileActionState } from "@/app/dashboard/profile/actions";
import type { profile } from "@/db/schema";
import styles from "./ProfileEditor.module.css";

type Profile = typeof profile.$inferSelect;

const profileFields = [
  ["fullName", "Full name"], ["tagline", "Tagline"], ["roleLine", "Role line"],
  ["location", "Location"], ["portraitAlt", "Portrait description"],
  ["resumeDriveUrl", "Resume URL"],
] as const;

export function ProfileEditor({ profile: current }: { profile: Profile | null }) {
  const [state, action, pending] = useActionState<ProfileActionState, FormData>(saveProfile, null);
  const [avatarUrl, setAvatarUrl] = useState<string>(current?.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus("Uploading picture...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadProfilePhoto(formData);
      if (result.error) {
        setUploadStatus(`Upload failed: ${result.error}`);
      } else if (result.url) {
        setAvatarUrl(result.url);
        setUploadStatus("Picture uploaded! Save profile to publish.");
      }
    } catch {
      setUploadStatus("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form action={action} className={styles.form}>
      <div className={styles.grid}>
        {/* Photo Upload & Preview Section */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarPreview}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Portrait preview"
                className={styles.avatarImg}
                onError={() => setUploadStatus("Image failed to load. Check the URL.")}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                Vector Art (Default)
              </div>
            )}
          </div>
          <div className={styles.avatarControls}>
            <FieldLabel htmlFor="profile-avatarUrl">Portrait Picture</FieldLabel>
            <div className={styles.avatarButtons}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                onChange={handleFileSelected}
                style={{ display: "none" }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading..." : "Upload picture"}
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => {
                    setAvatarUrl("");
                    setUploadStatus("Reset to default vector art. Save to apply.");
                  }}
                >
                  Reset to vector art
                </Button>
              )}
            </div>
            {uploadStatus && <span className={styles.avatarStatus}>{uploadStatus}</span>}
            <Input
              id="profile-avatarUrl"
              name="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Or enter image URL / relative path (e.g. /avatar.jpg)"
            />
          </div>
        </div>

        {profileFields.map(([name, label]) => (
          <div key={name}>
            <FieldLabel htmlFor={`profile-${name}`}>{label}</FieldLabel>
            {name === "resumeDriveUrl" ? (
              <FileOrUrlInput
                id={`profile-${name}`}
                name={name}
                defaultValue={current?.[name] ?? ""}
                fileTypeHint="document"
                accept=".pdf,.doc,.docx,application/pdf"
                placeholder="Paste Google Drive link or upload resume PDF"
              />
            ) : (
              <Input
                id={`profile-${name}`}
                name={name}
                defaultValue={current?.[name] ?? ""}
                required
                maxLength={name === "portraitAlt" ? 300 : 240}
              />
            )}
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