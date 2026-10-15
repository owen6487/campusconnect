import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../apis";
import { PageHeader } from "./AdminUI";

const cards = [
  { key: "totalUsers", label: "Total users" },
  { key: "activeUsers", label: "Active users" },
  { key: "inactiveUsers", label: "Deactivated users" },
  { key: "newUsers", label: "New users, last 7 days" },
  { key: "totalListings", label: "Listings" },
  { key: "newListings", label: "New listings, last 7 days" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (signal) => {
    setError("");
    try {
      const [{ data: adminData }, { data: feedbackData }] = await Promise.all([
        api.get("/api/admin/stats", { signal }),
        api.get("/api/feedback/stats", { signal }),
      ]);

      setStats(adminData);
      setFeedbackStats(feedbackData);
    } catch (err) {
      if (err.code === "ERR_CANCELED") return;
      console.error("Admin stats error:", err);
      setError(err.response?.data?.message || "Couldn't load the numbers.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Dashboard" subtitle="How Campus Connect is doing" />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => load()}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.key} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats ? Number(stats[c.key] ?? 0).toLocaleString() : <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-200" />}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">Feedback overview</p>
            <p className="text-sm text-slate-500">How users are responding to Campus Connect.</p>
          </div>
          <Link to="/admin/feedback" className="text-sm font-medium text-blue-700 hover:underline">
            View feedback
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-500">Total feedback</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{feedbackStats ? Number(feedbackStats.total ?? 0).toLocaleString() : "—"}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-500">New</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">{feedbackStats ? Number(feedbackStats.byStatus?.new ?? 0).toLocaleString() : "—"}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-500">Avg rating</p>
            <p className="mt-2 text-2xl font-bold text-yellow-600">{feedbackStats?.avgRating ?? "—"}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-500">Bugs</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{feedbackStats ? Number(feedbackStats.bugs ?? 0).toLocaleString() : "—"}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link to="/admin/users" className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md">
          <p className="font-semibold text-slate-900">Manage users</p>
          <p className="mt-1 text-sm text-slate-500">Search accounts, deactivate or reactivate them.</p>
        </Link>
        <Link to="/admin/listings" className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md">
          <p className="font-semibold text-slate-900">Review listings</p>
          <p className="mt-1 text-sm text-slate-500">Find and remove listings that break the rules.</p>
        </Link>
      </div>
    </div>
  );
}
