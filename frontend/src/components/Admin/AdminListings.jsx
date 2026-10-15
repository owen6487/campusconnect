import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../apis";
import useDebounce from "../../Hooks/useDebounce";
import { getImageUrl, useFallback as onImgError } from "../../utils/imageUrl";
import { PageHeader, Pagination, ListSkeleton } from "./AdminUI";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function AdminListings() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounce(q);

  const [data, setData] = useState({ listings: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api
      .get("/api/admin/listings", {
        params: { q: debouncedQ.trim(), page, limit: 10 },
        signal: controller.signal,
      })
      .then(({ data }) => setData(data))
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        console.error("Admin listings error:", err);
        setError(err.response?.data?.message || "Couldn't load listings.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQ, page, reloadKey]);

  const handleDelete = async (l) => {
    if (busyId) return;
    if (!window.confirm(`Delete "${l.name}"? This can't be undone.`)) return;

    setBusyId(l._id);
    try {
      await api.delete(`/api/admin/listings/${l._id}`);
      // last item on a later page? step back one page; otherwise just drop the row
      if (data.listings.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        setData((d) => ({
          ...d,
          listings: d.listings.filter((x) => x._id !== l._id),
          total: Math.max(d.total - 1, 0),
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't delete that listing.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Listings" subtitle="Find and remove listings that break the rules" />

      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setPage(1); }}
        placeholder="Search by title"
        aria-label="Search listings"
        className="mb-4 w-full rounded-lg border border-slate-300 bg-white p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-sm sm:text-sm"
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <ListSkeleton />
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        ) : data.listings.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No listings match your search.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.listings.map((l) => (
              <li key={l._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <img
                    src={getImageUrl(l.images?.[0] ?? null)}
                    alt=""
                    loading="lazy"
                    onError={onImgError}
                    className="h-16 w-16 shrink-0 rounded-lg bg-slate-100 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{l.name}</p>
                    <p className="text-sm font-bold text-slate-700">KSh {Number(l.price || 0).toLocaleString()}</p>
                    <p className="truncate text-xs text-slate-500">
                      {l.sellerId?.name || "Unknown seller"}
                      {l.sellerId?.email ? ` · ${l.sellerId.email}` : ""}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {[l.campus?.name, formatDate(l.createdAt)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 sm:shrink-0">
                  <Link
                    to={`/product/${l._id}`}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex-none sm:px-3 sm:py-1.5"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(l)}
                    disabled={busyId === l._id}
                    className="flex-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 sm:flex-none sm:px-3 sm:py-1.5"
                  >
                    {busyId === l._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination page={page} pages={data.pages} total={data.total} onChange={setPage} />
    </div>
  );
}
