/**
 * src/backend/admin-ui/PageHeader.jsx — title + description + optional right-side action.
 */
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-heading tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
