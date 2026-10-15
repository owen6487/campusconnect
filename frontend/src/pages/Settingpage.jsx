import React from 'react'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuLock, LuTrash2, LuEye, LuEyeOff, LuTriangleAlert, LuShieldCheck } from "react-icons/lu";
import api from "../apis";
import useAuth from "../Hooks/useAuth";

const inputCls =
    "w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

function PasswordInput({ value, onChange, placeholder, show, onToggle, ringColor = "blue" }) {
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                className={`${inputCls} pr-10`}
            />
            <button
                type="button"
                onClick={onToggle}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
            >
                {show ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
            </button>
        </div>
    );
}

 function Settingpage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // ── change password state ──
    const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const [pwMsg, setPwMsg] = useState(null);
    const [pwSaving, setPwSaving] = useState(false);

    // ── delete account state ──
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [delConfirmation, setDelConfirmation] = useState("");
    const [delSaving, setDelSaving] = useState(false);

    const set = (key) => (e) => setPw((p) => ({ ...p, [key]: e.target.value }));

    // live password-strength hint (matches your backend rule)
    const pwChecks = [
        { ok: pw.newPassword.length >= 8, label: "8+ characters" },
        { ok: /[A-Z]/.test(pw.newPassword), label: "Uppercase" },
        { ok: /[a-z]/.test(pw.newPassword), label: "Lowercase" },
        { ok: /\d/.test(pw.newPassword), label: "Number" },
        { ok: /[@$!%*?&]/.test(pw.newPassword), label: "Special char" },
    ];
    const pwValid = pwChecks.every((c) => c.ok);
    const confirmMismatch = pw.confirm.length > 0 && pw.newPassword !== pw.confirm;

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMsg(null);
        if (!pwValid) return setPwMsg({ type: "error", text: "Your new password doesn't meet all requirements yet." });
        if (pw.newPassword !== pw.confirm) return setPwMsg({ type: "error", text: "New passwords do not match." });

        setPwSaving(true);
        try {
            await api.put("/api/users/change-password", {
                currentPassword: pw.currentPassword,
                newPassword: pw.newPassword,
            });
            setPwMsg({ type: "success", text: "Password changed successfully." });
            setPw({ currentPassword: "", newPassword: "", confirm: "" });
        } catch (err) {
            setPwMsg({ type: "error", text: err.response?.data?.message || "Failed to change password." });
        } finally {
            setPwSaving(false);
        }
    };

    const handleDelete = async () => {
        if (delConfirmation.trim().toUpperCase() !== "DELETE") {
            alert("Type DELETE to confirm account deletion.");
            return;
        }

        setDelSaving(true);
        try {
            await api.delete("/api/users/delete", {
                data: { confirmation: delConfirmation.trim() }
            });
            setConfirmOpen(false);
            setDelConfirmation("");
            await logout();
            navigate("/", { replace: true });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete account.");
        } finally {
            setDelSaving(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto px-4 py-10">
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account security.</p>
            </div>

            <div className="space-y-6">
                {/* ── CHANGE PASSWORD ── */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <span className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center">
                            <LuLock className="w-4 h-4" />
                        </span>
                        <div>
                            <h2 className="font-semibold text-gray-900">Change password</h2>
                            <p className="text-xs text-gray-500">You'll use the new one next time you sign in.</p>
                        </div>
                    </div>

                    <div className="p-5">
                        {pwMsg && (
                            <div className={`mb-4 flex items-start gap-2 text-sm rounded-lg px-3 py-2.5 border ${
                                pwMsg.type === "success"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                                {pwMsg.type === "success" ? <LuShieldCheck className="w-4 h-4 mt-0.5 shrink-0" /> : <LuTriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />}
                                <p>{pwMsg.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className={labelCls}>Current password</label>
                                <PasswordInput
                                    value={pw.currentPassword}
                                    onChange={set("currentPassword")}
                                    placeholder="••••••••"
                                    show={show.current}
                                    onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>New password</label>
                                <PasswordInput
                                    value={pw.newPassword}
                                    onChange={set("newPassword")}
                                    placeholder="At least 8 characters"
                                    show={show.next}
                                    onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
                                />
                                {/* live requirement checklist */}
                                {pw.newPassword && (
                                    <ul className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                                        {pwChecks.map((c) => (
                                            <li key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-green-600" : "text-gray-400"}`}>
                                                <span className={`w-3.5 h-3.5 rounded-full text-[10px] flex items-center justify-center
                                                    ${c.ok ? "bg-green-100" : "bg-gray-100"}`}>
                                                    {c.ok ? "✓" : "•"}
                                                </span>
                                                {c.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <label className={labelCls}>Confirm new password</label>
                                <PasswordInput
                                    value={pw.confirm}
                                    onChange={set("confirm")}
                                    placeholder="Repeat the new password"
                                    show={show.confirm}
                                    onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                                />
                                {confirmMismatch && (
                                    <p className="text-xs text-red-600 mt-1.5">Passwords don't match yet.</p>
                                )}
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={pwSaving || !pwValid || pw.newPassword !== pw.confirm}
                                    className="bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {pwSaving ? "Saving..." : "Update password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* ── DANGER ZONE ── */}
                <section className="border-2 border-red-200 rounded-2xl overflow-hidden bg-red-50/50">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-red-100 bg-red-50">
                        <span className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center">
                            <LuTrash2 className="w-4 h-4" />
                        </span>
                        <div>
                            <h2 className="font-semibold text-red-700">Danger zone</h2>
                            <p className="text-xs text-red-500">Irreversible actions — be careful.</p>
                        </div>
                    </div>

                    <div className="p-5">
                        {!confirmOpen ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <p className="text-sm text-gray-600">
                                    Permanently delete your account and all your listings.
                                </p>
                                <button
                                    onClick={() => setConfirmOpen(true)}
                                    className="shrink-0 border border-red-300 text-red-700 text-sm font-medium rounded-lg px-4 py-2 hover:bg-red-100 transition"
                                >
                                    Delete account
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                                    <LuTriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>
                                        This permanently removes your profile and listings. You can't get them back,
                                        and you'll need to sign up again to use Campus Connect.
                                    </p>
                                </div>

                                <div>
                                    <label className={labelCls}>Type DELETE to confirm</label>
                                    <input
                                        type="text"
                                        value={delConfirmation}
                                        onChange={(e) => setDelConfirmation(e.target.value)}
                                        placeholder="DELETE"
                                        className="w-full text-sm border border-red-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setConfirmOpen(false); setDelConfirmation(""); }}
                                        className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm text-gray-700 bg-white hover:bg-gray-50 transition"
                                    >
                                        Keep my account
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={delSaving || delConfirmation.trim().toUpperCase() !== "DELETE"}
                                        className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {delSaving ? "Deleting..." : "Delete forever"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}



export default Settingpage;