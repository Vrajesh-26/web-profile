import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { revokeAgentKey } from "@/app/dashboard/agents/actions";
import { AgentKeyCreateForm } from "@/components/dash/AgentKeyCreateForm";
import type { accessLog, apiKeys } from "@/db/schema";
import styles from "./AgentAccessManager.module.css";

type KeyRow = Omit<typeof apiKeys.$inferSelect, "keyHash">;
type LogRow = typeof accessLog.$inferSelect;

export function AgentAccessManager({ keys, logs }: { keys: readonly KeyRow[]; logs: readonly LogRow[] }) {
  return (
    <div className={styles.page}>
      <AgentKeyCreateForm />
      <section className={styles.section} aria-labelledby="keys-title">
        <div className={styles.sectionHeading}><h2 id="keys-title">Access keys</h2><span>{keys.length} total</span></div>
        {keys.length === 0 ? <p className={styles.empty}>No access keys created.</p> : (
          <div className={styles.keyList}>{keys.map((key) => (
            <article className={styles.key} key={key.id}>
              <KeyRound size={17} aria-hidden="true" />
              <div className={styles.keyInfo}><strong>{key.label}</strong><span>{key.scopes.join(", ")} · {key.rateLimitPerHour} requests/hour</span><small>Created {key.createdAt.toLocaleDateString()}{key.lastUsedAt ? ` · Last used ${key.lastUsedAt.toLocaleString()}` : " · Never used"}</small></div>
              {key.revokedAt ? <span className={styles.revoked}>Revoked {key.revokedAt.toLocaleDateString()}</span> : (
                <form action={revokeAgentKey}><input type="hidden" name="id" value={key.id} /><Button variant="danger" size="small" type="submit"><ShieldCheck size={15} />Revoke</Button></form>
              )}
            </article>
          ))}</div>
        )}
      </section>
      <section className={styles.section} aria-labelledby="logs-title">
        <div className={styles.sectionHeading}><h2 id="logs-title">Recent access</h2><span>Latest {logs.length}</span></div>
        {logs.length === 0 ? <p className={styles.empty}>No agent requests recorded.</p> : (
          <div className={styles.logList}>
            {logs.map((log) => <div className={styles.log} key={log.id}><time dateTime={log.ts.toISOString()}>{log.ts.toLocaleString()}</time><code>{log.path}</code><span data-status={log.status >= 400 ? "failure" : "success"}>{log.status}</span><small>{log.ua ?? "Unknown client"}</small></div>)}
          </div>
        )}
      </section>
    </div>
  );
}