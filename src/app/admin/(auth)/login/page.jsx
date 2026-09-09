/**
 * src/app/admin/(auth)/login/page.jsx — ADMIN LOGIN PAGE (/admin/login).
 * Plain email + password form; the check happens in loginAction
 * (src/lib/cms/actions.js). Already-logged-in visitors are redirected by src/proxy.js.
 */
import LoginForm from "@/components/admin/LoginForm.jsx";

export const metadata = { title: "Admin login", robots: { index: false } };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  return (
    <main className="min-h-screen grid place-items-center px-6 bg-bg">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 text-heading font-bold text-lg">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            N
          </span>
          Portfolio admin
        </div>
        <LoginForm next={typeof next === "string" ? next : "/admin"} />
      </div>
    </main>
  );
}
