"use client";
/**
 * src/components/admin/LoginForm.jsx — the login form (client component so it
 * can show the "wrong password" message without a page reload).
 */
import { useActionState, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { loginAction } from "@/lib/cms/actions.js";
import { INPUT, Field } from "./Fields.jsx";
import { BTN_PRIMARY } from "./Forms.jsx";

export default function LoginForm({ next }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  // React resets uncontrolled inputs after a server action runs, which would
  // wipe the email after a wrong password — so keep it in state.
  const [email, setEmail] = useState("");
  return (
    <form action={formAction} className="space-y-4 p-6 rounded-2xl border border-line bg-surface">
      <input type="hidden" name="next" value={next} />
      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT}
        />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required autoComplete="current-password" className={INPUT} />
      </Field>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${BTN_PRIMARY} w-full`}>
        {pending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        Sign in
      </button>
    </form>
  );
}
