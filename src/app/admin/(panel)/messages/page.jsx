/**
 * src/app/admin/(panel)/messages/page.jsx — CONTACT FORM INBOX (/admin/messages).
 * Lists submissions newest first; mark read / unread, delete.
 */
import { desc } from "drizzle-orm";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { getDb, schema } from "@/lib/db/index.js";
import { markMessageRead, deleteMessage } from "@/lib/cms/actions.js";
import { PageHeader } from "@/components/admin/PageHeader.jsx";

export default async function MessagesPage() {
  const db = await getDb();
  const rows = await db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt));
  const icon = "grid place-items-center w-8 h-8 rounded-md border border-line text-muted hover:text-heading hover:border-accent transition";

  return (
    <>
      <PageHeader title="Messages" description="Everything sent through the contact form on the site." />
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No messages yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li
              key={m.id}
              className={`p-5 rounded-2xl border bg-surface ${m.read ? "border-line" : "border-accent/50"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-heading">
                    {!m.read && <span className="inline-block w-2 h-2 rounded-full bg-accent me-2" />}
                    {m.subject || "(no subject)"}
                  </p>
                  <p className="text-sm text-muted">
                    {m.name} · <a href={`mailto:${m.email}`} className="text-accent hover:underline">{m.email}</a>
                    {" · "}
                    <time dateTime={m.createdAt.toISOString()}>{m.createdAt.toLocaleString("en-GB")}</time>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <form action={markMessageRead.bind(null, m.id, !m.read)}>
                    <button type="submit" className={icon} title={m.read ? "Mark as unread" : "Mark as read"}>
                      {m.read ? <Mail size={14} /> : <MailOpen size={14} />}
                    </button>
                  </form>
                  <form action={deleteMessage.bind(null, m.id)}>
                    <button type="submit" className={`${icon} hover:text-red-500 hover:border-red-400`} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 text-sm text-body whitespace-pre-wrap">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
