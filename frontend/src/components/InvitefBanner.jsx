// components/InviteBanner.jsx
import { useState } from "react";
import { LuShare2 } from "react-icons/lu";
import ShareButton from "./ShareButton";

export default function InviteBanner() {
    const [open, setOpen] = useState(false);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpen(true);
                    }
                }}
                aria-label="Share Campus Connect with friends"
                className="relative border rounded-2xl p-4 flex items-center gap-4 mb-5 cursor-pointer
                           hover:border-blue-300 hover:bg-blue-50/40 transition
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
                <img src="/org.jpg" alt="Campus Connect" className="w-20 h-11 object-cover rounded" />
                <div className="flex-1">
                    <p className="font-semibold text-sm">Campus Connect grows by sharing</p>
                    <p className="text-xs text-gray-500">
                        Invite friends from your campus — more sellers, more buyers, better for everyone.
                    </p>
                </div>

                <span className="shrink-0 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <LuShare2 className="w-3.5 h-3.5" />
                    Share
                </span>

                <ShareButton
                    hideTrigger
                    open={open}
                    onClose={() => setOpen(false)}
                    title="Campus Connect"
                    subtitle="Buy · Sell · Discover"
                    image="/org.jpg"
                    url={window.location.origin}
                    text="No more word of mouth — buy & sell anything with students on your campus:"
                />
            </div>
        </div>
    );
}