import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { deleteContactRequest, updateContactStatus } from "@/app/dashboard/inbox/actions";
import type { contactRequests } from "@/db/schema";
import styles from "./InboxManager.module.css";

type ContactRequest = typeof contactRequests.$inferSelect;

export function InboxManager({ requests }: { requests: readonly ContactRequest[] }) {
  return (
    <div className={styles.list}>
      {requests.length === 0 ? <p className={styles.empty}>No messages yet.</p> : requests.map((item) => (
        <article className={styles.item} key={item.id}>
          <header className={styles.itemHeader}>
            <div>
              <h2>{item.name}</h2>
              <a href={`mailto:${item.email}`}>{item.email}</a>
            </div>
            <div className={styles.meta}>
              <span className={styles.statusBadge} data-status={item.status}>
                {item.status}
              </span>
              <time dateTime={item.createdAt.toISOString()}>{item.createdAt.toLocaleString()}</time>
            </div>
          </header>
          <p className={styles.message}>{item.message}</p>
          <footer>
            <span className={styles.source}>{item.source === "agent" ? "Agent request" : "Website form"}</span>
            <form key={`${item.id}-${item.status}`} action={updateContactStatus}>
              <input type="hidden" name="id" value={item.id} />
              <Select
                key={`${item.id}-${item.status}`}
                aria-label={`Status for message from ${item.name}`}
                name="status"
                defaultValue={item.status}
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </Select>
              <Button variant="secondary" size="small" type="submit">Update status</Button>
            </form>
            <form action={deleteContactRequest}>
              <input type="hidden" name="id" value={item.id} />
              <Button variant="icon" type="submit" title="Delete message" aria-label={`Delete message from ${item.name}`}>
                <Trash2 size={16} />
              </Button>
            </form>
          </footer>
        </article>
      ))}
    </div>
  );
}