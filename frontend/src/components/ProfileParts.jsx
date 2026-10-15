import { useState } from "react";
import { Link } from "react-router-dom";
import { getImageUrl, useFallback as onImgError } from "../utils/imageUrl";

// Display-only pieces of the profile page. They show what they are given
// and hold no data-loading or saving logic. That all lives in Profilepage.jsx.

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

/* ───────────────────────── small components ───────────────────────── */

export function Avatar({ profile }) {
  const [failed, setFailed] = useState(false);
  const base =
    "flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow sm:h-28 sm:w-28";
  if (profile.profilePicture && !failed) {
    return (
      <img
        src={profile.profilePicture}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${base} object-cover`}
      />
    );
  }
  return <div className={base} aria-hidden="true">{initials(profile.name)}</div>;
}

export function Row({ icon: Icon, label, children, hint }) {
  return (
    <div className="flex gap-3 py-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="break-words text-slate-900">{children}</div>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6 px-4 py-6">
      <div className="h-56 rounded-xl bg-slate-200" />
      <div className="grid gap-6 md:grid-cols-[17rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="h-64 rounded-xl bg-slate-200" />
        <div className="h-64 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export function ListingsPreview({ status, listings }) {
  const shown = listings.slice(0, 6);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          My listings{status === "ready" && ` (${listings.length})`}
        </h2>
        {status === "ready" && listings.length > 0 && (
          <Link to="/mylistings" className="text-sm font-medium text-blue-600 hover:underline">
            Manage all
          </Link>
        )}
      </div>

      {status === "loading" && (
        <div className="grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-lg bg-slate-200" />)}
        </div>
      )}

      {status === "error" && (
        <p className="py-6 text-center text-sm text-slate-500">Couldn't load your listings right now.</p>
      )}

      {status === "ready" && listings.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
          <p className="mb-4 text-slate-600">You haven't posted anything yet.</p>
          <Link to="/sell" className="inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
            + Post your first item
          </Link>
        </div>
      )}

      {status === "ready" && listings.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((l) => (
              <Link
                key={l._id}
                to={`/product/${l._id}`}
                className="block overflow-hidden rounded-lg border border-slate-200 bg-white hover:shadow-md"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  <img
                    src={getImageUrl(l.images?.[0] ?? null)}
                    alt={l.name}
                    loading="lazy"
                    onError={onImgError}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="font-bold text-slate-900">KSh {Number(l.price || 0).toLocaleString()}</p>
                  <p className="line-clamp-1 text-sm text-slate-600">{l.name}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to="/sell"
            className="mt-4 inline-block rounded-lg border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
          >
            + New listing
          </Link>
        </>
      )}
    </section>
  );
}