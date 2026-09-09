"use client";
/**
 * src/app/error.jsx — FRIENDLY ERROR SCREEN for the public site.
 *
 * Shown instead of a crash when the page cannot render — in practice this is
 * almost always "the database is not reachable / not set up yet". It explains
 * the usual causes so you can fix them without reading a stack trace.
 * (In development Next.js still shows its own red overlay with the details.)
 */
export default function Error({ error, reset }) {
  const msg = String(error?.message || "");
  const looksLikeDb = /query|relation|database|connect|ECONNREFUSED|DATABASE_URL|neon|password|SSL|timeout/i.test(msg);
  const missingTables = /does not exist|relation/i.test(msg);

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-bg text-body">
      <div className="max-w-lg w-full p-8 rounded-2xl border border-line bg-surface">
        <h1 className="text-xl font-bold text-heading mb-3">
          {looksLikeDb ? "Database not ready" : "Something went wrong"}
        </h1>

        {looksLikeDb ? (
          <div className="text-sm space-y-3">
            <p>The site could not read its content from the database. Usually one of these:</p>
            <p className="px-3 py-2 rounded-lg bg-chip text-xs font-mono text-heading break-words">{msg}</p>
            {missingTables && (
              <p className="text-accent font-medium">
                ↑ &quot;does not exist&quot; means the tables are missing → run <code>npm run db:push</code>, then <code>npm run db:seed</code>.
              </p>
            )}
            <ol className="list-decimal ps-5 space-y-1.5 text-muted">
              <li>
                <code className="text-heading">.env.local</code> has no valid{" "}
                <code className="text-heading">DATABASE_URL</code>.
              </li>
              <li>
                The tables were not created yet — run{" "}
                <code className="px-1.5 py-0.5 rounded bg-chip text-heading">npm run db:push</code>
              </li>
              <li>
                The tables are empty — run{" "}
                <code className="px-1.5 py-0.5 rounded bg-chip text-heading">npm run db:seed</code>
              </li>
            </ol>
            <p className="text-faint">Restart <code>npm run dev</code> after editing .env.local.</p>
          </div>
        ) : (
          <p className="text-sm text-muted break-words">{msg || "Unknown error."}</p>
        )}

        <button
          onClick={reset}
          className="mt-6 inline-flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-accent hover:opacity-90 transition"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
