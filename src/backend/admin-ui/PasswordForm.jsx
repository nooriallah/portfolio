"use client";
/**
 * src/backend/admin-ui/PasswordForm.jsx — change-password form (client, shows the result inline).
 */
import { useActionState } from "react";
import { changePassword } from "@backend/cms/actions.js";
import { INPUT, Field } from "./Fields.jsx";
import { BTN_PRIMARY } from "./Forms.jsx";

export default function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, null);
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Current password">
        <input name="current" type="password" required autoComplete="current-password" className={INPUT} />
      </Field>
      <Field label="New password" hint="At least 8 characters.">
        <input name="next" type="password" required minLength={8} autoComplete="new-password" className={INPUT} />
      </Field>
      <Field label="Repeat new password">
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={INPUT} />
      </Field>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.saved && <p className="text-sm text-accent">Password changed.</p>}
      <button type="submit" disabled={pending} className={BTN_PRIMARY}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
