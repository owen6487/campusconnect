import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuMail, LuMessageSquare, LuShieldAlert, LuClock } from "react-icons/lu";
import api from "../apis";
import useAuth from "../Hooks/useAuth";
import usePageMeta from "../Hooks/usePageMeta";

const supportMailto = (subject = "Campus Connect support") => {
    const body = "Hi Campus Connect team,\n\nI need help with the following:\n\n";
    return `mailto:support@campusconnect.co.ke?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const CHANNELS = [
    {
        icon: LuMessageSquare,
        title: "Feedback & suggestions",
        text: "Ideas, complaints, or \"this confuses me\" moments — they go straight to the team and shape what we build next.",
        action: { to: "/feedback", label: "Open feedback form" },
    },
    {
        icon: LuMail,
        title: "Email us directly",
        text: "For anything private — account issues, partnership questions, or press.",
        action: { href: supportMailto(), label: "support@campusconnect.co.ke" },
    },
    {
        icon: LuShieldAlert,
        title: "Report a scam or safety issue",
        text: "See a suspicious listing or a dishonest user? Tell us immediately — we investigate every report and suspend offenders.",
        action: { href: supportMailto("Report a scam or safety issue"), label: "Email us" },
    },
];

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100";

export default function ContactPage() {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [topic, setTopic] = useState("general");
    const [listingLink, setListingLink] = useState("");
    const [website, setWebsite] = useState("");
    const [state, setState] = useState("idle");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);

    usePageMeta({
        title: "Contact us",
        description: "Reach the Campus Connect team for support, safety reports, listing issues, and general questions.",
    });

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setState("sending");
        setError("");

        const cleanName = name.trim();
        const cleanEmail = (user?.email || email).trim();
        const cleanMessage = message.trim();

        if (!cleanName || cleanName.length < 2) {
            setError("Please enter your name.");
            setState("idle");
            return;
        }

        if (!cleanEmail) {
            setError("Please add your email so we can reply.");
            setState("idle");
            return;
        }

        if (!cleanMessage || cleanMessage.length < 10) {
            setError("Please write a message with at least 10 characters.");
            setState("idle");
            return;
        }

        try {
            await api.post("/api/contact", {
                name: cleanName,
                email: cleanEmail,
                topic,
                listingLink: listingLink.trim(),
                message: cleanMessage,
                website,
            });
            setSent(true);
            setState("done");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
            setState("idle");
        }
    };

    if (sent) {
        return (
            <div className="mx-auto max-w-xl px-4 py-16 text-center">
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Message sent</p>
                    <h1 className="mt-3 text-3xl font-bold text-slate-900">Thanks for reaching out</h1>
                    <p className="mt-3 text-slate-600">
                        We’ve received your message and will get back to you at {user ? user.email : email || "your email"} as soon as possible.
                    </p>
                    <Link to="/" className="mt-6 inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
                        Back home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Talk to us</h1>
                    <p className="mt-2 text-slate-600">
                        Questions, problems, ideas — we actually read everything and respond as quickly as we can.
                    </p>

                    <div className="mt-8 space-y-4">
                        {CHANNELS.map((c) => (
                            <div key={c.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
                                    <c.icon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="font-semibold text-slate-900">{c.title}</h2>
                                    <p className="mt-1 text-sm text-slate-600">{c.text}</p>
                                    {c.action.to ? (
                                        <Link to={c.action.to} className="mt-3 inline-block text-sm font-medium text-sky-700 hover:underline">
                                            {c.action.label} →
                                        </Link>
                                    ) : (
                                        <a href={c.action.href} className="mt-3 inline-block break-all text-sm font-medium text-sky-700 hover:underline">
                                            {c.action.label}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                        <LuClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <p>
                            We usually reply within <span className="font-medium text-slate-800">24–48 hours</span>. For logged-in users, your email is picked up automatically.
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Send a message</h2>
                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Your name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="James Otis"
                                className={inputClass}
                            />
                        </div>

                        {!user && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Your email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className={inputClass}
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Topic</label>
                            <select value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass}>
                                <option value="general">General question</option>
                                <option value="account">Account issue</option>
                                <option value="report">Safety / listing report</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {topic === "report" && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Listing link <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="url"
                                    value={listingLink}
                                    onChange={(e) => setListingLink(e.target.value)}
                                    placeholder="https://campusconnect.co.ke/product/..."
                                    className={inputClass}
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={6}
                                maxLength={2000}
                                placeholder="Tell us what you need help with..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="hidden"
                            tabIndex={-1}
                            autoComplete="off"
                        />

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={state === "sending"}
                            className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {state === "sending" ? "Sending..." : "Send message"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}