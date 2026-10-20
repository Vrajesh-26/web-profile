"use client";

import { useRef, useState } from "react";
import { ExternalLink, FileText, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { uploadAsset } from "@/app/dashboard/upload-action";
import { isGoogleDriveUrl, extractGoogleDriveId } from "@/lib/utils/drive";
import styles from "./FileOrUrlInput.module.css";

type FileOrUrlInputProps = {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  accept?: string;
  fileTypeHint?: "document" | "image" | "video" | "any";
  required?: boolean;
  onChange?: (val: string) => void;
};

export function FileOrUrlInput({
  id,
  name,
  defaultValue = "",
  placeholder,
  accept = "image/*,.pdf,.doc,.docx",
  fileTypeHint = "any",
  required,
  onChange,
}: FileOrUrlInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDrive = isGoogleDriveUrl(value);
  const driveInfo = isDrive ? extractGoogleDriveId(value) : null;
  const isUploaded = value.startsWith("/uploads/") || value.includes("/api/storage/");
  const isPdf = value.toLowerCase().includes(".pdf");
  const isImage =
    fileTypeHint === "image" ||
    /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?.*)?$/i.test(value);

  function handleValueChange(newVal: string) {
    setValue(newVal);
    setStatusMessage(null);
    onChange?.(newVal);
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 4.5 * 1024 * 1024;
    if (file.size > maxBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setStatusMessage({
        type: "error",
        text: `File is too large (${sizeMb} MB). Direct upload limit is 4.5 MB. For larger files, paste a URL or Google Drive link.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadAsset(formData);
      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else if (res.url) {
        handleValueChange(res.url);
        setStatusMessage({
          type: "success",
          text: `Uploaded "${file.name}" to storage.`,
        });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <Input
          id={id}
          name={name}
          type="text"
          className={styles.textInput}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={
            placeholder ||
            (fileTypeHint === "document"
              ? "Paste Google Drive URL or upload PDF/Doc"
              : fileTypeHint === "image"
                ? "Paste Image URL or upload picture"
                : "Enter URL or upload file")
          }
          required={required}
        />

        <input
          ref={fileInputRef}
          type="file"
          className={styles.hiddenFileInput}
          accept={accept}
          onChange={handleFileSelected}
        />

        <button
          type="button"
          className={styles.uploadButton}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          title="Upload file to Neon Object Storage"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud size={14} />
              <span>Upload</span>
            </>
          )}
        </button>

        {value && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => handleValueChange("")}
            title="Clear value"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {statusMessage && (
        <p className={statusMessage.type === "error" ? styles.statusError : styles.statusSuccess}>
          {statusMessage.text}
        </p>
      )}

      <div className={styles.badgeRow}>
        {isDrive && (
          <span className={`${styles.badge} ${styles.badgeDrive}`}>
            Google Drive ({driveInfo ? "Preview-ready" : "Drive link"})
          </span>
        )}
        {isUploaded && (
          <span className={`${styles.badge} ${styles.badgeUploaded}`}>
            Neon Storage ({value.split("/").pop()})
          </span>
        )}
        {isPdf && (
          <span className={`${styles.badge} ${styles.badgePdf}`}>
            <FileText size={12} /> PDF
          </span>
        )}
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.testLink}
          >
            <span>Test link</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {isImage && value && (
        <div className={styles.previewThumb}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview thumbnail" className={styles.thumbImg} />
          <div className={styles.thumbDetails}>
            <ImageIcon size={12} style={{ display: "inline", marginRight: "4px" }} />
            <span>Image preview ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
