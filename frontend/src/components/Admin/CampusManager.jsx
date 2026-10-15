// pages/admin/CampusManager.jsx
import { useState, useEffect } from "react";
import api from "../../apis";

const inputCls = "w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700";

export default function CampusManager() {
    const [mode, setMode] = useState("bulk");          // 'single' | 'bulk'
    const [singleName, setSingleName] = useState("");
    const [bulkText, setBulkText] = useState("");
    const [targetCampus, setTargetCampus] = useState("");  // for branches
    const [campuses, setCampuses] = useState([]);
    const [entity, setEntity] = useState("campuses");  // 'campuses' | 'branches'
    const [result, setResult] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get("/api/campuses/all").then((r) => setCampuses(r.data)).catch(console.error);
    }, []);

    const parseLines = (text) =>
        text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

    const handleSingle = async (e) => {
        e.preventDefault();
        setSaving(true);
        setResult(null);
        try {
            const url = entity === "campuses"
                ? "/api/admin/campuses"
                : `/api/admin/campuses/${targetCampus}/branches`;
            await api.post(url, entity === "campuses" ? { name: singleName } : { name: singleName, campus: targetCampus });
            setResult({ type: "success", text: `"${singleName}" added.` });
            setSingleName("");
        } catch (err) {
            setResult({ type: "error", text: err.response?.data?.message || "Failed to add" });
        } finally {
            setSaving(false);
        }
    };

    const handleBulk = async () => {
        const names = parseLines(bulkText);
        if (!names.length) return setResult({ type: "error", text: "Paste at least one name." });
        if (entity === "branches" && !targetCampus) return setResult({ type: "error", text: "Pick a campus first." });

        setSaving(true);
        setResult(null);
        try {
            const url = entity === "campuses"
                ? "/api/admin/campuses/bulk"
                : `/api/admin/campuses/${targetCampus}/branches/bulk`;
            const res = await api.post(url, { names });
            const { added, skippedCount } = res.data;
            setResult({
                type: "success",
                text: `✅ ${added} added${skippedCount ? ` · ⏭ ${skippedCount} skipped (already exist)` : ""}`,
            });
            setBulkText("");
        } catch (err) {
            setResult({ type: "error", text: err.response?.data?.message || "Bulk add failed" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Manage campuses &amp; branches</h1>

            {/* What are we adding? */}
            <div className="flex gap-2 mb-4">
                {["campuses", "branches"].map((e) => (
                    <button key={e} onClick={() => { setEntity(e); setResult(null); }}
                        className={`px-4 py-1.5 rounded-full text-sm border capitalize ${
                            entity === e ? "bg-blue-700 text-white border-blue-700" : "text-gray-600"
                        }`}>
                        {e}
                    </button>
                ))}
            </div>

            {/* Branches need a target campus */}
            {entity === "branches" && (
                <select value={targetCampus} onChange={(e) => setTargetCampus(e.target.value)}
                    className={`${inputCls} mb-4`}>
                    <option value="">Select campus…</option>
                    {campuses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
            )}

            {/* Single vs bulk */}
            <div className="flex gap-4 text-sm mb-4 border-b">
                {[["bulk", "➕ Add many"], ["single", "Add one"]].map(([m, label]) => (
                    <button key={m} onClick={() => setMode(m)}
                        className={`pb-2 ${mode === m ? "border-b-2 border-blue-700 font-medium text-blue-700" : "text-gray-500"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {mode === "single" ? (
                <form onSubmit={handleSingle} className="flex gap-2">
                    <input value={singleName} onChange={(e) => setSingleName(e.target.value)}
                        placeholder={`e.g. ${entity === "campuses" ? "Kenyatta University" : "Main Campus"}`}
                        required className={inputCls} />
                    <button disabled={saving || (entity === "branches" && !targetCampus)}
                        className="bg-blue-700 text-white px-5 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 shrink-0">
                        Add
                    </button>
                </form>
            ) : (
                <div>
                    <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)}
                        rows={8}
                        placeholder={"Paste one name per line — copy a whole column from Excel or Google Sheets:\n\nKenyatta University\nUniversity of Nairobi\nStrathmore University\nMount Kenya University"}
                        className={`${inputCls} font-mono`} />
                    <p className="text-xs text-gray-400 mt-1">
                        {parseLines(bulkText).length} {entity} ready to add
                    </p>
                    <button onClick={handleBulk} disabled={saving}
                        className="mt-3 bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                        {saving ? "Adding…" : `Add all (${parseLines(bulkText).length})`}
                    </button>
                </div>
            )}

            {result && (
                <p className={`mt-4 text-sm rounded-lg px-3 py-2 ${
                    result.type === "success" ? "bg-green-50 text-green-700 border border-green-200"
                                              : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                    {result.text}
                </p>
            )}
        </div>
    );
}