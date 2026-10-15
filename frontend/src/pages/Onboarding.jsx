
// pages/Onboarding.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apis";
import useAuth from "../Hooks/useAuth";

const inputCls = "mt-1 w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700";

export default function Onboarding() {
    const { user, setUser } = useAuth();   // expose setUser from AuthContext (see below)
    const navigate = useNavigate();

    const [campuses, setCampuses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [campus, setCampus] = useState("");
    const [branch, setBranch] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // already onboarded? go home
    useEffect(() => {
        if (user?.campus) navigate("/", { replace: true });
    }, [user, navigate]);

    useEffect(() => {
        api.get("/api/campuses/all").then((r) => setCampuses(r.data)).catch(console.error);
    }, []);

    useEffect(() => {
        setBranch("");
        setBranches([]);
        if (!campus) return;
        api.get(`/api/branches/all/${campus}`).then((r) => setBranches(r.data)).catch(console.error);
    }, [campus]);

    const handleSave = async () => {
        if (!campus) return setError("Please pick your campus.");
        setSaving(true);
        setError("");
        try {
            const res = await api.put("/api/users/update-profile", { campus, branch: branch || undefined });
            const nextUser = res.data?.existingUser || res.data?.user || null;
            if (nextUser) setUser(nextUser);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save. Try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold mb-1">Welcome to Campus Connect 👋</h1>
            <p className="text-sm text-gray-500 mb-6">
                One last thing — which campus are you at? We'll show you listings from there.
            </p>

            {error && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <label className="block text-xs text-gray-500 mb-4">
                Campus *
                <select value={campus} onChange={(e) => setCampus(e.target.value)} className={inputCls}>
                    <option value="">Select your campus</option>
                    {campuses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
            </label>

            <label className="block text-xs text-gray-500 mb-6">
                Branch (optional)
                <select value={branch} onChange={(e) => setBranch(e.target.value)}
                    disabled={!campus || branches.length === 0} className={`${inputCls} disabled:bg-gray-100`}>
                    <option value="">{!campus ? "Pick a campus first" : "Select a branch"}</option>
                    {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
            </label>

            <button onClick={handleSave} disabled={saving}
                className="w-full bg-orange-500 text-white rounded-lg py-3 text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                {saving ? "Saving..." : "Start exploring →"}
            </button>
        </div>
    );
}