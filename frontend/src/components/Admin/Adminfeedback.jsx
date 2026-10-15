// pages/admin/AdminFeedback.jsx
import { useState, useEffect, useCallback } from "react";
import {
    LuBug, LuThumbsUp, LuThumbsDown, LuStar,
    LuMessageSquare, LuInbox, LuChartNoAxesColumn
} from "react-icons/lu";
import api from "../../apis";

const TABS = [
    { key: "", label: "All" },
    { key: "new", label: "New" },
    { key: "bugs", label: "Bugs", icon: LuBug },
    { key: "resolved", label: "Resolved" },
];

const BADGE = {
    new: "bg-orange-100 text-orange-700",
    read: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
};

const labelFor = (key) =>
    ({ easy_to_use: "Easy to use", found_what_they_wanted: "Found it", would_recommend: "Would recommend" })[key] || key;

const MiniStars = ({ n }) => (
    <span className="inline-flex gap-0.5 align-middle">
        {[1, 2, 3, 4, 5].map((i) => (
            <LuStar
                key={i}
                className={`w-3.5 h-3.5 ${i <= n ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
        ))}
    </span>
);

export default function AdminFeedback() {
    const [stats, setStats] = useState(null);
    const [tab, setTab] = useState("");
    const [data, setData] = useState({ items: [], total: 0, pages: 1 });
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(null);

    const loadStats = useCallback(() => {
        api.get("/api/feedback/stats").then((r) => setStats(r.data)).catch(console.error);
    }, []);

    const loadItems = useCallback(() => {
        const params = new URLSearchParams({ page, limit: 20 });
        if (tab === "bugs") params.set("type", "bugs");
        else if (tab) params.set("status", tab);

        api.get(`/api/feedback?${params}`)
            .then((r) => setData(r.data))
            .catch(console.error);
    }, [tab, page]);

    useEffect(() => { loadStats(); }, [loadStats]);
    useEffect(() => { setPage(1); }, [tab]);
    useEffect(() => { loadItems(); }, [loadItems]);

    const setStatus = async (id, status) => {
        try {
            await api.patch(`/api/feedback/${id}`, { status });
            loadItems();
            loadStats();
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
    };

    const cards = [
        { label: "Total feedback", value: stats?.total, color: "text-gray-900" },
        { label: "New", value: stats?.byStatus?.new, color: "text-orange-600" },
        { label: "Avg rating", value: stats?.avgRating ?? "—", color: "text-yellow-500" },
        { label: "Bugs", value: stats?.bugs, color: "text-red-600" },
        { label: "Yes rate", value: stats?.yesPercent != null ? `${stats.yesPercent}%` : "—", color: "text-blue-700" },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Feedback</h1>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {cards.map((c) => (
                    <div key={c.label} className="bg-white border rounded-xl p-4 text-center">
                        <p className={`text-2xl font-bold ${c.color}`}>{c.value ?? "—"}</p>
                        <p className="text-xs text-gray-500 mt-1">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`pb-2 text-sm flex items-center gap-1.5 ${tab === t.key
                            ? "border-b-2 border-blue-700 font-medium text-blue-700"
                            : "text-gray-500 hover:text-gray-700"}`}
                    >
                        {t.icon && <t.icon className="w-3.5 h-3.5" />}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-2">
                {data.items.length === 0 && (
                    <p className="text-center text-gray-400 py-10">No feedback here yet.</p>
                )}

                {data.items.map((f) => {
                    const ans = f.answers || {};
                    const open = expanded === f._id;
                    return (
                        <div key={f._id} className="bg-white border rounded-xl overflow-hidden">
                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                                onClick={() => setExpanded(open ? null : f._id)}
                            >
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${BADGE[f.status]}`}>
                                    {f.status}
                                </span>

                                {/* answers at a glance */}
                                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                    {Object.entries(ans).map(([k, v]) => (
                                        <span key={k} className="inline-flex items-center gap-1 text-gray-600">
                                            {labelFor(k)}:
                                            {v === "yes"
                                                ? <LuThumbsUp className="w-3.5 h-3.5 text-blue-700" />
                                                : <LuThumbsDown className="w-3.5 h-3.5 text-orange-500" />}
                                        </span>
                                    ))}
                                    {!Object.keys(ans).length && (
                                        <span className="inline-flex items-center gap-1 text-gray-400 italic">
                                            {f.bug?.whatHappened ? (
                                                <><LuBug className="w-3.5 h-3.5" /> bug report</>
                                            ) : (
                                                <><LuMessageSquare className="w-3.5 h-3.5" /> message only</>
                                            )}
                                        </span>
                                    )}
                                </span>

                                <span className="ml-auto flex items-center gap-2 text-xs text-gray-400 shrink-0">
                                    {f.rating ? <MiniStars n={f.rating} /> : null}
                                    {f.user?.name || f.email || "guest"} · {new Date(f.createdAt).toLocaleDateString("en-KE")}
                                </span>
                            </button>

                            {open && (
                                <div className="border-t px-4 py-3 space-y-3 text-sm">
                                    {f.suggestion && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500">SUGGESTION</p>
                                            <p className="text-gray-700 whitespace-pre-line">{f.suggestion}</p>
                                        </div>
                                    )}
                                    {f.bug?.whatHappened && (
                                        <div>
                                            <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                                                <LuBug className="w-3.5 h-3.5" /> BUG
                                            </p>
                                            <p className="text-gray-700"><span className="font-medium">What happened:</span> {f.bug.whatHappened}</p>
                                            {f.bug.expected && (
                                                <p className="text-gray-700"><span className="font-medium">Expected:</span> {f.bug.expected}</p>
                                            )}
                                        </div>
                                    )}
                                    {(f.user?.email || f.email) && (
                                        <p className="text-xs text-gray-400">Reply to: {f.user?.email || f.email}</p>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        {f.status !== "read" && (
                                            <button onClick={() => setStatus(f._id, "read")}
                                                className="text-xs border rounded-lg px-3 py-1.5 text-blue-700 border-blue-200 hover:bg-blue-50">
                                                Mark read
                                            </button>
                                        )}
                                        {f.status !== "resolved" && (
                                            <button onClick={() => setStatus(f._id, "resolved")}
                                                className="text-xs border rounded-lg px-3 py-1.5 text-green-700 border-green-200 hover:bg-green-50">
                                                Mark resolved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded text-sm ${p === page ? "bg-blue-700 text-white" : "border text-gray-600"}`}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}