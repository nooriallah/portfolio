/**
 * src/app/admin/(panel)/account/page.jsx — CHANGE THE ADMIN PASSWORD (/admin/account).
 */
import { getSession } from "@backend/auth/index.js";
import PasswordForm from "@backend/admin-ui/PasswordForm.jsx";
import { PageHeader } from "@backend/admin-ui/PageHeader.jsx";

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
