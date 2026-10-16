"use client";

import { useEffect, useRef, useState } from "react";
import type { DocumentSeed } from "@/lib/data";
import styles from "./DocumentsRoom.module.css";

export function DriveModal({
  item,
  onClose,
}: {
  item: DocumentSeed;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function closeModal() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles["drive-modal"]}
      aria-labelledby="drive-modal-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div className={styles["modal-header"]}>
        <div>
          <p>{item.format}</p>
          <h3 id="drive-modal-title">{item.title}</h3>
        </div>
        <button type="button" onClick={closeModal} aria-label="Close preview">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {item.previewUrl ? (
        <iframe
          className={styles["document-preview"]}
          src={item.previewUrl}
          title={`${item.title} preview`}
          allow="autoplay"
        />
      ) : (
        <div className={styles["preview-empty"]}>
          <span aria-hidden="true">↗</span>
          <p>
            This preview is ready for a Google Drive share link. Add the
            document link in the seed data to show it here.
          </p>
        </div>
      )}
      <div className={styles["modal-actions"]}>
        {item.downloadUrl ? (
          <a href={item.downloadUrl} target="_blank" rel="noreferrer">
            Open or download
          </a>
        ) : (
          <span>Share link not connected</span>
        )}
        <button type="button" onClick={closeModal}>
          Done
        </button>
      </div>
    </dialog>
  );
}

export function DocumentsRoom({
  documents,
}: {
  documents: readonly DocumentSeed[];
}) {
  const [activeDocument, setActiveDocument] = useState<DocumentSeed | null>(null);

  return (
    <section
      className={styles["documents-room"]}
      id="documents"
      aria-labelledby="documents-title"
    >
      <div className={styles["documents-intro"]}>
        <p className={styles["eyebrow"]}>A little more detail</p>
        <h2 id="documents-title">Useful things to take with you.</h2>
        <p>Open a document for a quick preview.</p>
      </div>
      <div className={styles["document-list"]}>
        {documents.map((item, index) => (
          <article className={styles["document-item"]} key={item.title}>
            <span className={styles["document-index"]} aria-hidden="true">
              0{index + 1}
            </span>
            <div className={styles["document-copy"]}>
              <p>{item.format}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <button type="button" onClick={() => setActiveDocument(item)}>
              Preview <span aria-hidden="true">↗</span>
            </button>
          </article>
        ))}
      </div>
      {activeDocument && (
        <DriveModal
          item={activeDocument}
          onClose={() => setActiveDocument(null)}
        />
      )}
    </section>
  );
}
