"use client";
/**
 * src/components/admin/Forms.jsx — THE TWO GENERIC ADMIN FORMS + ROW BUTTONS.
 *
 *  <SettingsForm group values />        edits one settings group (Site, Hero …)
 *  <ItemForm collection def item />     creates / edits one collection row
 *  <RowActions collection id … />       ↑ ↓ 🗑 buttons in the list tables
 *
 * Both forms are generated from the field definitions in src/lib/cms/schema.js
 * and submit to the server actions in src/lib/cms/actions.js.
 */
import { useActionState, startTransition } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Trash2, Loader2, Check } from "lucide-react";
import { FieldInput } from "./Fields.jsx";
import { saveSettings, saveItem, deleteItem, moveItem } from "@/lib/cms/actions.js";

// Amber button with dark text (colours: `.admin .btn-accent` in globals.css).
export const BTN_PRIMARY =
  "btn-accent inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition";
export const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-line text-heading hover:border-accent hover:bg-chip transition";

/** Save button showing a spinner while the action runs. */
function SaveButton({ pending, label = "Save changes" }) {
  return (
    <button type="submit" disabled={pending} className={BTN_PRIMARY}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
      {pending ? "Saving…" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Settings group form
 * ------------------------------------------------------------------ */
export function SettingsForm({ group, values }) {
  const action = saveSettings.bind(null, group.key);
  const [state, formAction, pending] = useActionState(action, null);

  // Submit manually instead of <form action={…}>: React resets a form to its
  // default values after a form action succeeds, which would flash the OLD
  // texts back for a moment. Calling the action ourselves avoids that.
  function onSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {group.fields.map((f) => (
        <FieldInput key={f.name} field={f} value={values?.[f.name]} error={state?.errors?.[f.name]} />
      ))}
      <div className="flex items-center gap-4 pt-2 border-t border-line-soft">
        <SaveButton pending={pending} />
        {state?.saved && !pending && (
          <span className="text-sm text-accent">Saved — the site is updated.</span>
        )}
        {state?.error && <span className="text-sm text-red-500">{state.error}</span>}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * Collection item form (new or edit)
 * ------------------------------------------------------------------ */
export function ItemForm({ collection, def, item }) {
  const action = saveItem.bind(null, collection, item?.id ?? null);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {def.fields.map((f) => (
        <FieldInput key={f.name} field={f} value={item?.[f.name]} error={state?.errors?.[f.name]} />
      ))}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-line-soft">
        <SaveButton pending={pending} label={item ? "Save changes" : `Create ${def.singular.toLowerCase()}`} />
        <Link href={`/admin/${collection}`} className={BTN_GHOST}>
          Cancel
        </Link>
        {state?.error && <span className="text-sm text-red-500">{state.error}</span>}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * Row buttons in the list tables
 * ------------------------------------------------------------------ */
export function RowActions({ collection, id, first, last, title }) {
  const icon = "grid place-items-center w-8 h-8 rounded-md border border-line text-muted hover:text-heading hover:border-accent disabled:opacity-30 disabled:pointer-events-none transition";
  return (
    <div className="flex items-center gap-1.5">
      <form action={moveItem.bind(null, collection, id, -1)}>
        <button type="submit" disabled={first} aria-label="Move up" className={icon}>
          <ArrowUp size={14} />
        </button>
      </form>
      <form action={moveItem.bind(null, collection, id, 1)}>
        <button type="submit" disabled={last} aria-label="Move down" className={icon}>
          <ArrowDown size={14} />
        </button>
      </form>
      <form
        action={deleteItem.bind(null, collection, id)}
        onSubmit={(e) => {
          if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) e.preventDefault();
        }}
      >
        <button type="submit" aria-label="Delete" className={`${icon} hover:text-red-500 hover:border-red-400`}>
          <Trash2 size={14} />
        </button>
      </form>
    </div>
  );
}
