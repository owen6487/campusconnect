// pages/Feedback.jsx
import { useState } from "react";
import { LuThumbsUp, LuThumbsDown, LuStar, LuBug, LuPartyPopper } from "react-icons/lu";
import api from "../apis";
import useAuth from "../Hooks/useAuth";

const QUESTIONS = [
    { key: "easy_to_use", label: "Is Campus Connect easy to use?" },
    { key: "found_what_they_wanted", label: "Did you find what you were looking for?" },
    { key: "would_recommend", label: "Would you recommend it to a friend?" },
];

const inputCls = "w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700";

export default function Feedback() {
    const { user } = useAuth();
    const [answers, setAnswers] = useState({});
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [suggestion, setSuggestion] = useState("");
    const [bugOpen, setBugOpen] = useState(false);
    const [bugWhat, setBugWhat] = useState("");
    const [bugExpected, setBugExpected] = useState("");
    const [email, setEmail] = useState("");
    const [state, setState] = useState("idle"); // idle | sending | done | error

    const answeredCount = Object.keys(answers).length;
    const canSubmit = answeredCount > 0 || suggestion.trim() || bugWhat.trim();

    const pick = (key, value) =>
        setAnswers((a) => ({ ...a, [key]: a[key] === value ? undefined : value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setState("sending");
        try {
            const clean = {};
            Object.entries(answers).forEach(([k, v]) => v && (clean[k] = v));

            await api.post("/api/feedback", {
                answers: clean,
                rating: rating || undefined,
                suggestion,
                bug: { whatHappened: bugWhat, expected: bugExpected },
                email: user ? undefined : email,
            });
            setState("done");
        } catch {
            setState("error");
        }
    };

    if (state === "done") {
        return (
            <div className="max-w-md mx-auto px-4 py-16 text-center">
                <LuPartyPopper className="w-14 h-14 mx-auto mb-3 text-orange-500" />
                <h1 className="text-xl font-bold text-gray-900">Thank you!</h1>
                <p className="text-sm text-gray-500 mt-2">
                    We read every single message — this is how Campus Connect improves.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-1">Quick feedback</h1>
            <p className="text-sm text-gray-500 mb-6">Takes 20 seconds. Seriously.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Yes/No questions */}
                {QUESTIONS.map((q) => (
                    <div key={q.key} className="bg-white border rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-800 mb-3">{q.label}</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => pick(q.key, "yes")}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold border transition
                                    ${answers[q.key] === "yes"
                                        ? "bg-blue-700 text-white border-blue-700"
                                        : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                            >
                                <LuThumbsUp className="w-4 h-4" />
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={() => pick(q.key, "no")}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold border transition
                                    ${answers[q.key] === "no"
                                        ? "bg-orange-500 text-white border-orange-500"
                                        : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                            >
                                <LuThumbsDown className="w-4 h-4" />
                                No
                            </button>
                        </div>
                    </div>
                ))}

                {/* Star rating (optional) */}
                <div className="bg-white border rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-800 mb-2">
                        Overall experience <span className="text-gray-400 font-normal">(optional)</span>
                    </p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setRating(n)}
                                onMouseEnter={() => setHover(n)}
                                onMouseLeave={() => setHover(0)}
                                className="transition-transform hover:scale-110 p-1"
                            >
                                <LuStar
                                    className={`w-7 h-7 ${
                                        (hover || rating) >= n
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Suggestion (optional) */}
                <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="What could we improve? (optional)"
                    className={inputCls}
                />

                {/* Bug report (optional, collapsible) */}
                <div className="border rounded-xl overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setBugOpen((o) => !o)}
                        className="w-full flex items-center gap-2 text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                    >
                        <LuBug className="w-4 h-4" />
                        Report a bug
                        <span className="ml-auto text-gray-400">{bugOpen ? "▲" : "▼"}</span>
                    </button>
                    {bugOpen && (
                        <div className="p-4 space-y-3">
                            <textarea
                                value={bugWhat}
                                onChange={(e) => setBugWhat(e.target.value)}
                                rows={2}
                                placeholder="What happened?"
                                className={inputCls}
                            />
                            <textarea
                                value={bugExpected}
                                onChange={(e) => setBugExpected(e.target.value)}
                                rows={2}
                                placeholder="What did you expect to happen?"
                                className={inputCls}
                            />
                        </div>
                    )}
                </div>

                {/* Email only for guests */}
                {!user && (
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email (so we can reply)"
                        className={inputCls}
                    />
                )}

                {state === "error" && (
                    <p className="text-sm text-red-600">Failed to send. Please try again.</p>
                )}

                <button
                    type="submit"
                    disabled={state === "sending" || !canSubmit}
                    className="w-full bg-orange-500 text-white rounded-lg py-3 text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                    {state === "sending" ? "Sending…" : "Send feedback"}
                </button>
            </form>
        </div>
    );
}