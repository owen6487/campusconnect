import { useState, useEffect } from "react";
import api from "../../apis";
import useAuth from "../../Hooks/useAuth";
import useDebounce from "../../Hooks/useDebounce";
import { PageHeader, Badge, Pagination, ListSkeleton } from "./AdminUI";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const myId = String(me?.id ?? me?._id ?? "");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounce(q);

  const [data, setData] = useState({ users: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api
      .get("/api/admin/users", {
        params: { q: debouncedQ.trim(), status, page, limit: 10 },
        signal: controller.signal,
      })
      .then(({ data }) => setData(data))
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        console.error("Admin users error:", err);
        setError(err.response?.data?.message || "Couldn't load users.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQ, status, page, reloadKey]);

  const toggleActive = async (u) => {
    if (busyId) return;
    const next = !u.isActive;
    const ok = window.confirm(
      next
        ? `Reactivate ${u.name}?`
        : `Deactivate ${u.name}? They will be signed out and won't be able to log in.`
    );
    if (!ok) return;

    setBusyId(u._id);
    try {
      await api.patch(`/api/users/${u._id}/${next ? "reactivate" : "deactivate"}`);
      setData((d) => ({
        ...d,
        users: d.users.map((x) => (x._id === u._id ? { ...x, isActive: next } : x)),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "That didn't work. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Users" subtitle="Search accounts and control who can sign in" />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search by name or email"
          aria-label="Search users"
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-sm sm:text-sm"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          aria-label="Filter by status"
          className="rounded-lg border border-slate-300 bg-white p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
        >
          <option value="all">All accounts</option>
          <option value="active">Active only</option>
          <option value="inactive">Deactivated only</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Column labels: tablets and up */}
        <div className="hidden gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 md:flex">
          <span className="flex-1">User</span>
          <span className="w-36">Campus</span>
          <span className="w-28">Joined</span>
          <span className="w-24">Status</span>
          <span className="w-28 text-right">Action</span>
        </div>

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
        ) : data.users.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No users match your search.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.users.map((u) => {
              const isMe = String(u._id) === myId;
              const isAdmin = u.role === "admin";
              return (
                <li key={u._id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                      <span className="truncate">{u.name}</span>
                      {isAdmin && <Badge tone="slate">Admin</Badge>}
                    </p>
                    <p className="truncate text-sm text-slate-500">{u.email}</p>
                    {u.phoneNumber && <p className="text-xs text-slate-400">{u.phoneNumber}</p>}
                  </div>
                  <p className="text-sm text-slate-600 md:w-36">{u.campus?.name || "No campus yet"}</p>
                  <p className="text-sm text-slate-500 md:w-28">{formatDate(u.createdAt)}</p>
                  <div className="md:w-24">
                    <Badge tone={u.isActive ? "green" : "red"}>{u.isActive ? "Active" : "Deactivated"}</Badge>
                  </div>
                  <div className="md:w-28 md:text-right">
                    {isMe || isAdmin ? (
                      <span className="text-xs text-slate-400">{isMe ? "This is you" : "Protected"}</span>
                    ) : (
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={busyId === u._id}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50 md:px-3 md:py-1.5 ${
                          u.isActive
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-green-300 text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {busyId === u._id ? "Working…" : u.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Pagination page={page} pages={data.pages} total={data.total} onChange={setPage} />
    </div>
  );
}
