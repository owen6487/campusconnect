// Small shared pieces for the admin pages.

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const tones = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  slate: "bg-slate-900 text-white",
  gray: "bg-slate-100 text-slate-600",
};

export function Badge({ tone = "gray", children }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Pagination({ page, pages, total, onChange }) {
  if (!total) return null;
  const btn =
    "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <p>
        {total} result{total === 1 ? "" : "s"} &middot; Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <button className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <ul className="animate-pulse divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="p-4">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
        </li>
      ))}
    </ul>
  );
}
