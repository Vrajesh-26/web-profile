"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Select } from "@/components/ui/Field";
import { deleteSkill, moveSkill, saveSkill, setSkillVisibility, type SkillActionState } from "@/app/dashboard/skills/actions";
import type { skills } from "@/db/schema";
import styles from "./SkillEditor.module.css";

type Skill = typeof skills.$inferSelect;

export function SkillEditor({ skill, index, count }: { skill?: Skill; index?: number; count?: number }) {
  const [state, formAction, pending] = useActionState<SkillActionState, FormData>(saveSkill, null);
  const prefix = skill?.id ?? "new";

  return (
    <div className={`${styles.editor} ${skill ? styles.existing : styles.create}`}>
      <form action={formAction} className={styles.fields}>
        {skill && <input type="hidden" name="id" value={skill.id} />}
        <div className={styles.nameField}>
          <FieldLabel htmlFor={`${prefix}-name`}>Skill name</FieldLabel>
          <Input id={`${prefix}-name`} name="name" defaultValue={skill?.name} required maxLength={80} />
        </div>
        <div>
          <FieldLabel htmlFor={`${prefix}-category`}>Category</FieldLabel>
          <Select id={`${prefix}-category`} name="category" defaultValue={skill?.category ?? "web"}>
            <option value="web">Web</option><option value="backend">Backend</option>
            <option value="security">Security</option><option value="data">Data</option>
            <option value="tools">Tools</option><option value="other">Other</option>
          </Select>
        </div>
        <div>
          <FieldLabel htmlFor={`${prefix}-label`}>Display group</FieldLabel>
          <Input id={`${prefix}-label`} name="categoryLabel" defaultValue={skill?.categoryLabel ?? "Development"} required maxLength={40} />
        </div>
        <div>
          <FieldLabel htmlFor={`${prefix}-icon`}>Icon key</FieldLabel>
          <Input id={`${prefix}-icon`} name="iconKey" defaultValue={skill?.iconKey ?? ""} maxLength={80} />
        </div>
        <div className={styles.orderField}>
          <FieldLabel htmlFor={`${prefix}-order`}>Order</FieldLabel>
          <Input id={`${prefix}-order`} name="sortOrder" type="number" min="0" max="9999" defaultValue={skill?.sortOrder ?? count ?? 0} required />
        </div>
        <label className={styles.visibleField}>
          <input type="checkbox" name="visible" defaultChecked={skill?.visible ?? true} />
          Visible
        </label>
        <Button size="small" type="submit" disabled={pending}>{pending ? "Saving..." : skill ? "Save changes" : "Add skill"}</Button>
        {state?.error && <p className={styles.error} role="alert">{state.error}</p>}
        {state?.success && <p className={styles.success} role="status">{state.success}</p>}
      </form>
      {skill && (
        <div className={styles.actions}>
          <form action={moveSkill}>
            <input type="hidden" name="id" value={skill.id} />
            <input type="hidden" name="direction" value="up" />
            <Button variant="icon" type="submit" disabled={index === 0} title="Move up" aria-label={`Move ${skill.name} up`}><ArrowUp size={16} /></Button>
          </form>
          <form action={moveSkill}>
            <input type="hidden" name="id" value={skill.id} />
            <input type="hidden" name="direction" value="down" />
            <Button variant="icon" type="submit" disabled={index === (count ?? 0) - 1} title="Move down" aria-label={`Move ${skill.name} down`}><ArrowDown size={16} /></Button>
          </form>
          <form action={setSkillVisibility}>
            <input type="hidden" name="id" value={skill.id} />
            <input type="hidden" name="visible" value={String(!skill.visible)} />
            <Button variant="icon" type="submit" title={skill.visible ? "Hide skill" : "Show skill"} aria-label={skill.visible ? `Hide ${skill.name}` : `Show ${skill.name}`}>
              {skill.visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </form>
          <form action={deleteSkill}>
            <input type="hidden" name="id" value={skill.id} />
            <Button variant="icon" type="submit" title="Delete skill" aria-label={`Delete ${skill.name}`}><Trash2 size={16} /></Button>
          </form>
        </div>
      )}
    </div>
  );
}