import { describe, expect, it } from "vitest";
import { extractGoogleDriveId, isGoogleDriveUrl, resolveDocumentUrls } from "@/lib/utils/drive";

describe("Drive & Document URL Resolver", () => {
  it("detects Google Drive URLs accurately", () => {
    expect(isGoogleDriveUrl("https://drive.google.com/file/d/12345abcdef/view?usp=sharing")).toBe(true);
    expect(isGoogleDriveUrl("https://docs.google.com/document/d/98765xyz/edit")).toBe(true);
    expect(isGoogleDriveUrl("/uploads/resume.pdf")).toBe(false);
    expect(isGoogleDriveUrl("https://example.com/doc.pdf")).toBe(false);
  });

  it("extracts Google Drive file IDs from /file/d/ URLs", () => {
    const res = extractGoogleDriveId("https://drive.google.com/file/d/1A2B3C4D5E6F/view?usp=sharing");
    expect(res).not.toBeNull();
    expect(res?.id).toBe("1A2B3C4D5E6F");
    expect(res?.type).toBe("file");
  });

  it("extracts Google Drive IDs from ?id= query param", () => {
    const res = extractGoogleDriveId("https://drive.google.com/open?id=FILE_123_ABC");
    expect(res).not.toBeNull();
    expect(res?.id).toBe("FILE_123_ABC");
  });

  it("resolves Google Drive URLs to the embeddable /preview URL", () => {
    const raw = "https://drive.google.com/file/d/12345abcdef/view?usp=sharing";
    const resolved = resolveDocumentUrls(raw);
    expect(resolved.isGoogleDrive).toBe(true);
    expect(resolved.previewUrl).toBe("https://drive.google.com/file/d/12345abcdef/preview");
    expect(resolved.openUrl).toBe("https://drive.google.com/file/d/12345abcdef/view");
    expect(resolved.downloadUrl).toBe("https://drive.google.com/uc?export=download&id=12345abcdef");
  });

  it("resolves Google Docs URLs to preview and PDF export", () => {
    const raw = "https://docs.google.com/document/d/DOC_ID_999/edit?usp=sharing";
    const resolved = resolveDocumentUrls(raw);
    expect(resolved.isGoogleDrive).toBe(true);
    expect(resolved.previewUrl).toBe("https://docs.google.com/document/d/DOC_ID_999/preview");
    expect(resolved.downloadUrl).toBe("https://docs.google.com/document/d/DOC_ID_999/export?format=pdf");
  });

  it("handles uploaded files and direct PDFs cleanly", () => {
    const uploadUrl = "/uploads/resume-1729000.pdf";
    const resolved = resolveDocumentUrls(uploadUrl);
    expect(resolved.isGoogleDrive).toBe(false);
    expect(resolved.isDirectFile).toBe(true);
    expect(resolved.isPdf).toBe(true);
    expect(resolved.previewUrl).toBe(uploadUrl);
    expect(resolved.downloadUrl).toBe(uploadUrl);
  });
});
