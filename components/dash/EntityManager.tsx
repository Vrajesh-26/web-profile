"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Field";
import { FileOrUrlInput } from "@/components/dash/FileOrUrlInput";
import { deleteContent, moveContent, saveContent, setContentVisibility, type ContentActionState, type ContentKind } from "@/app/dashboard/content-actions";
import styles from "./EntityManager.module.css";

type FieldSpec = {
  name: string;
  label: string;
  type?: "text" | "number" | "url" | "textarea" | "select" | "checkbox" | "fileOrUrl";
  options?: readonly (readonly [string, string])[];
  required?: boolean;
  maxLength?: number;
  accept?: string;
  fileTypeHint?: "document" | "image" | "video" | "any";
};

export type EntityRow = Record<string, string | number | boolean | readonly string[] | null>;

const fields: Record<ContentKind, readonly FieldSpec[]> = {
  projects: [
    { name: "title", label: "Title", required: true, maxLength: 140 },
    { name: "slug", label: "URL slug", required: true, maxLength: 100 },
    { name: "summary", label: "Summary", type: "textarea", required: true, maxLength: 500 },
    { name: "outcome", label: "Outcome", type: "textarea", required: true, maxLength: 500 },
    { name: "bodyMd", label: "Case study", type: "textarea", required: true, maxLength: 20000 },
    { name: "role", label: "Role", required: true, maxLength: 160 },
    { name: "status", label: "Status", type: "select", options: [["live", "Live"], ["building", "Building"], ["archived", "Archived"]] },
    { name: "year", label: "Year", type: "number", maxLength: 4 },
    { name: "accent", label: "Card color", type: "select", options: [["marigold", "Marigold"], ["orchid", "Orchid"], ["oat", "Oat"], ["sage", "Sage"]] },
    { name: "liveUrl", label: "Live URL", type: "url" },
    { name: "repoUrl", label: "Repository URL", type: "url" },
    { name: "coverUrl", label: "Cover image", type: "fileOrUrl", fileTypeHint: "image", accept: "image/*" },
    { name: "videoUrl", label: "Video", type: "fileOrUrl", fileTypeHint: "video", accept: "video/*" },
    { name: "sortOrder", label: "Order", type: "number", required: true },
    { name: "featured", label: "Featured", type: "checkbox" },
    { name: "visible", label: "Visible", type: "checkbox" },
  ],
  journey: [
    { name: "category", label: "Category", type: "select", required: true, options: [["education", "Education"], ["experience", "Experience"], ["achievement", "Achievement"], ["certification", "Certification"]] },
    { name: "title", label: "Title", required: true, maxLength: 180 },
    { name: "org", label: "Organization", required: true, maxLength: 180 },
    { name: "startDate", label: "Start date", maxLength: 80 },
    { name: "endDate", label: "End date", maxLength: 80 },
    { name: "body", label: "Description", type: "textarea", required: true, maxLength: 5000 },
    { name: "sortOrder", label: "Order", type: "number", required: true },
    { name: "visible", label: "Visible", type: "checkbox" },
  ],
  documents: [
    { name: "title", label: "Title", required: true, maxLength: 180 },
    { name: "description", label: "Description", type: "textarea", required: true, maxLength: 1000 },
    { name: "format", label: "Format", required: true, maxLength: 40 },
    { name: "kind", label: "Type", type: "select", options: [["resume", "Resume"], ["certification", "Certification"], ["other", "Other"]] },
    { name: "driveUrl", label: "Document (Google Drive URL or Upload File)", type: "fileOrUrl", fileTypeHint: "document", accept: ".pdf,.doc,.docx,application/pdf" },
    { name: "sortOrder", label: "Order", type: "number", required: true },
    { name: "visible", label: "Visible", type: "checkbox" },
  ],
  links: [
    { name: "label", label: "Label", required: true, maxLength: 80 },
    { name: "url", label: "URL", type: "url", required: true, maxLength: 2048 },
    { name: "sortOrder", label: "Order", type: "number", required: true },
    { name: "visible", label: "Visible", type: "checkbox" },
  ],
};

function EntityForm({ kind, row, skills, count }: { kind: ContentKind; row?: EntityRow; skills: readonly { id: string; name: string }[]; count: number }) {
  const [state, action, pending] = useActionState<ContentActionState, FormData>(saveContent, null);
  const prefix = String(row?.id ?? `new-${kind}`);
  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="contentKind" value={kind} />
      {row?.id && <input type="hidden" name="id" value={String(row.id)} />}
      <div className={styles.fieldGrid}>
        {fields[kind].map((field) => {
          const id = `${prefix}-${field.name}`;
          const value = row?.[field.name];
          if (field.type === "checkbox") {
            return <label className={styles.checkbox} htmlFor={id} key={field.name}><input id={id} name={field.name} type="checkbox" defaultChecked={row ? Boolean(value) : field.name === "visible"} />{field.label}</label>;
          }
          if (field.type === "textarea") {
            return <div className={styles.wideField} key={field.name}><FieldLabel htmlFor={id}>{field.label}</FieldLabel><Textarea id={id} name={field.name} defaultValue={String(value ?? "")} required={field.required} maxLength={field.maxLength} /></div>;
          }
          if (field.type === "select") {
            return <div key={field.name}><FieldLabel htmlFor={id}>{field.label}</FieldLabel><Select id={id} name={field.name} defaultValue={String(value ?? field.options?.[0]?.[0] ?? "")} required={field.required}>{field.options?.map(([option, label]) => <option key={option} value={option}>{label}</option>)}</Select></div>;
          }
          if (field.type === "fileOrUrl") {
            return (
              <div className={styles.wideField} key={field.name}>
                <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
                <FileOrUrlInput
                  id={id}
                  name={field.name}
                  defaultValue={String(value ?? "")}
                  accept={field.accept}
                  fileTypeHint={field.fileTypeHint}
                  required={field.required}
                />
              </div>
            );
          }
          return <div key={field.name}><FieldLabel htmlFor={id}>{field.label}</FieldLabel><Input id={id} name={field.name} type={field.type ?? "text"} defaultValue={String(value ?? (field.name === "sortOrder" ? count : ""))} required={field.required} maxLength={field.maxLength} min={field.type === "number" ? "0" : undefined} /></div>;
        })}
        {kind === "projects" && (
          <fieldset className={styles.skillPicker}>
            <legend>Project skills</legend>
            <div>{skills.map((skill) => <label key={skill.id}><input type="checkbox" name="skillIds" value={skill.id} defaultChecked={Array.isArray(row?.skillIds) && row.skillIds.includes(skill.id)} />{skill.name}</label>)}</div>
          </fieldset>
        )}
      </div>
      <div className={styles.formFooter}>
        <Button type="submit" size="small" disabled={pending}>{pending ? "Saving..." : row ? "Save changes" : "Add item"}</Button>
        {state?.error && <p className={styles.error} role="alert">{state.error}</p>}
        {state?.success && <p className={styles.success} role="status">{state.success}</p>}
      </div>
    </form>
  );
}

export function EntityManager({ kind, rows, skills = [] }: { kind: ContentKind; rows: readonly EntityRow[]; skills?: readonly { id: string; name: string }[] }) {
  const names: Record<ContentKind, string> = { projects: "project", journey: "journey entry", documents: "document", links: "social link" };
  return (
    <div className={styles.manager}>
      <section className={styles.create} aria-labelledby="add-item-title"><h2 id="add-item-title">Add {names[kind]}</h2><EntityForm kind={kind} skills={skills} count={rows.length} /></section>
      <section className={styles.list} aria-label={`All ${kind}`}>
        <div className={styles.listHeader}><h2>All {kind}</h2><span>{rows.length} items</span></div>
        {rows.length === 0 ? <p className={styles.empty}>Nothing here yet.</p> : rows.map((row, index) => (
          <article className={styles.item} key={String(row.id)}>
            <EntityForm kind={kind} row={row} skills={skills} count={rows.length} />
            <div className={styles.actions}>
              <form action={moveContent}><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={String(row.id)} /><input type="hidden" name="direction" value="up" /><Button variant="icon" type="submit" title="Move up" aria-label="Move item up" disabled={index === 0}><ArrowUp size={16} /></Button></form>
              <form action={moveContent}><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={String(row.id)} /><input type="hidden" name="direction" value="down" /><Button variant="icon" type="submit" title="Move down" aria-label="Move item down" disabled={index === rows.length - 1}><ArrowDown size={16} /></Button></form>
              <form action={setContentVisibility}><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={String(row.id)} /><input type="hidden" name="visible" value={String(!row.visible)} /><Button variant="icon" type="submit" title={row.visible ? "Hide item" : "Show item"} aria-label={row.visible ? "Hide item" : "Show item"}>{row.visible ? <EyeOff size={16} /> : <Eye size={16} />}</Button></form>
              <form action={deleteContent}><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={String(row.id)} /><Button variant="icon" type="submit" title="Delete item" aria-label="Delete item"><Trash2 size={16} /></Button></form>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
