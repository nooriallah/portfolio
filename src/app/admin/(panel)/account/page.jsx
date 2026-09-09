/**
 * src/app/admin/(panel)/account/page.jsx — CHANGE THE ADMIN PASSWORD (/admin/account).
 */
import { getSession } from "@/lib/auth.js";
import PasswordForm from "@/components/admin/PasswordForm.jsx";
import { PageHeader } from "@/components/admin/PageHeader.jsx";

export default async function AccountPage() {
  const session = await getSession();
  return (
    <>
      <PageHeader title="Account" description={`Signed in as ${session?.email}.`} />
      <div className="p-6 rounded-2xl border border-line bg-surface max-w-md">
        <PasswordForm />
      </div>
    </>
  );
}
