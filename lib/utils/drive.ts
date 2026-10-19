/**
 * Utility for parsing and resolving Google Drive and document URLs
 * Supports converting raw sharing URLs into embeddable /preview links,
 * direct download links, and identifying direct uploads/PDFs.
 */

export type DocumentUrlResolution = {
  previewUrl: string | undefined;
  downloadUrl: string | undefined;
  openUrl: string | undefined;
  isGoogleDrive: boolean;
  isDirectFile: boolean;
  isPdf: boolean;
  fileId?: string;
};

/**
 * Extracts a Google Drive file or document ID from various Drive URL formats.
 */
export function extractGoogleDriveId(url: string): { id: string; type: "file" | "document" | "spreadsheets" | "presentation" } | null {
  if (!url || typeof url !== "string") return null;

  try {
    // 1. Docs, Sheets, Slides
    const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch?.[1]) return { id: docMatch[1], type: "document" };

    const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetMatch?.[1]) return { id: sheetMatch[1], type: "spreadsheets" };

    const slidesMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slidesMatch?.[1]) return { id: slidesMatch[1], type: "presentation" };

    // 2. Standard Drive file: /file/d/{id}
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch?.[1]) return { id: fileMatch[1], type: "file" };

    // 3. Query param id: ?id={id} or &id={id}
    const queryIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (queryIdMatch?.[1] && (url.includes("drive.google.com") || url.includes("docs.google.com"))) {
      return { id: queryIdMatch[1], type: "file" };
    }

    // 4. Fallback /d/{id} pattern on drive/docs domain
    if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
      const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (dMatch?.[1]) return { id: dMatch[1], type: "file" };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Checks if a URL is a Google Drive or Google Docs URL.
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("drive.google.com") || url.includes("docs.google.com");
}

/**
 * Resolves any document URL into appropriate preview, open, and download URLs.
 * Automatically normalizes Google Drive URLs to the embeddable `/preview` endpoint.
 */
export function resolveDocumentUrls(rawUrl: string | null | undefined): DocumentUrlResolution {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      previewUrl: undefined,
      downloadUrl: undefined,
      openUrl: undefined,
      isGoogleDrive: false,
      isDirectFile: false,
      isPdf: false,
    };
  }

  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();
  const isPdf = lower.endsWith(".pdf") || lower.includes(".pdf?");
  const isDirectFile = trimmed.startsWith("/uploads/") || trimmed.includes("/api/storage/") || isPdf;

  const driveInfo = extractGoogleDriveId(trimmed);

  if (driveInfo) {
    const { id, type } = driveInfo;
    let previewUrl = `https://drive.google.com/file/d/${id}/preview`;
    let openUrl = `https://drive.google.com/file/d/${id}/view`;
    let downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;

    if (type === "document") {
      previewUrl = `https://docs.google.com/document/d/${id}/preview`;
      openUrl = `https://docs.google.com/document/d/${id}/view`;
      downloadUrl = `https://docs.google.com/document/d/${id}/export?format=pdf`;
    } else if (type === "spreadsheets") {
      previewUrl = `https://docs.google.com/spreadsheets/d/${id}/preview`;
      openUrl = `https://docs.google.com/spreadsheets/d/${id}/view`;
      downloadUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=pdf`;
    } else if (type === "presentation") {
      previewUrl = `https://docs.google.com/presentation/d/${id}/preview`;
      openUrl = `https://docs.google.com/presentation/d/${id}/view`;
      downloadUrl = `https://docs.google.com/presentation/d/${id}/export/pdf`;
    }

    return {
      previewUrl,
      downloadUrl,
      openUrl,
      isGoogleDrive: true,
      isDirectFile: false,
      isPdf,
      fileId: id,
    };
  }

  // Local upload or direct link
  return {
    previewUrl: trimmed,
    downloadUrl: trimmed,
    openUrl: trimmed,
    isGoogleDrive: false,
    isDirectFile,
    isPdf,
  };
}
