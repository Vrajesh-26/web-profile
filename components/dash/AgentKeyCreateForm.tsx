"use client";

import { useActionState, useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Field";
import { createAgentKey, type AgentKeyState } from "@/app/dashboard/agents/actions";
import styles from "./AgentKeyCreateForm.module.css";

export function AgentKeyCreateForm() {
  const [state, action, pending] = useActionState<AgentKeyState, FormData>(createAgentKey, null);
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    if (!state?.key) return;
    await navigator.clipboard.writeText(state.key);
    setCopied(true);
  }

  return (
    <section className={styles.section} aria-labelledby="create-key-title">
      <h2 id="create-key-title">Create access key</h2>
      <p>Keys can read the approved contact card. The secret is shown only once.</p>
      {state?.key ? (
        <div className={styles.createdKey} role="status">
          <strong>{state.label}</strong>
          <code>{state.key}</code>
          <Button type="button" variant="secondary" size="small" onClick={copyKey}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy key"}</Button>
        </div>
      ) : (
        <form action={action} className={styles.form}>
          <div><FieldLabel htmlFor="agent-key-label">Label</FieldLabel><Input id="agent-key-label" name="label" required maxLength={80} placeholder="Recruiting team" /></div>
          <Button type="submit" disabled={pending}><KeyRound size={16} />{pending ? "Creating..." : "Create key"}</Button>
          {state?.error && <p className={styles.error} role="alert">{state.error}</p>}
        </form>
      )}
    </section>
  );
}