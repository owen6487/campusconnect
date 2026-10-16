// components/ShareButton.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    LuShare2, LuX, LuLink, LuCheck,
} from "react-icons/lu";
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaTiktok } from "react-icons/fa6";

// Usage:
//
// 1. Product page / My Listings (self-contained button + modal):
//    <ShareButton title={product.name} subtitle={`KSh ${product.price}`}
//      image={getImageUrl(product.images?.[0])}
//      url={`${API_ORIGIN}/share/${product._id}`}
//      text={`${product.name} for KSh ${product.price} on Campus Connect:`} />
//
// 2. Controlled by a parent (invite card, hero) — hide the trigger,
//    pass open + onClose:
//    <ShareButton hideTrigger open={open} onClose={() => setOpen(false)}
//      title="Campus Connect" image="/og.jpg" url={window.location.origin}
//      text="Buy & sell with students on your campus:" />
//
// IMPORTANT: for products, `url` must be the BACKEND share link
// (…/share/PRODUCT_ID) — that's the page WhatsApp reads the preview from.

const enc = encodeURIComponent;

export default function ShareButton({
    title,
    text,
    url,
    image,
    subtitle,
    compact = false,
    className = "",
    variant = "default",          // "default" | "overlay" (invisible full-parent trigger)
    hideTrigger = false,          // render only the modal (parent controls opening)
    triggerText = "Share",
    open: controlledOpen,
    onOpen,
    onClose,
}) {
    const shareUrl =
        typeof window !== "undefined"
            ? url || `${window.location.origin}${window.location.pathname}`
            : url || "";
    const message = text || title || "Check this out on Campus Connect";

    const [internalOpen, setInternalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const isControlled = typeof controlledOpen === "boolean";
    const open = isControlled ? controlledOpen : internalOpen;

    const setOpen = (next) => {
        if (!isControlled) setInternalOpen(next);
        if (next) onOpen?.(); else onClose?.();
    };

    // Close on Escape
    useEffect(() => {
        if (!open || typeof document === "undefined") return;
        const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset "copied" after 2s
    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(t);
    }, [copied]);

    const handleClick = async () => {
        if (!shareUrl) return;
        // Phones: native share sheet first
        if (navigator.share) {
            try {
                await navigator.share({ title: title || "Campus Connect", text: message, url: shareUrl });
                return;
            } catch (err) {
                if (err.name !== "AbortError") setOpen(true);
                return;
            }
        }
        setOpen(true);
    };

    const copyLink = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
        } catch {
            if (typeof window !== "undefined") window.prompt("Copy this link:", shareUrl);
        }
    };

    const rowClass =
        "flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

    const triggerClass =
        variant === "overlay"
            ? "absolute inset-0 h-full w-full cursor-pointer opacity-0"
            : `flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  compact ? "px-2 py-2 text-xs sm:text-sm" : "px-4 py-3 text-sm"
              }`;

    return (
        <div className={className || "inline-block"}>
            {!hideTrigger && (
                <button
                    type="button"
                    onClick={handleClick}
                    aria-label={`${triggerText} ${title || "this page"}`}
                    className={triggerClass}
                >
                    <LuShare2 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
                    {triggerText}
                </button>
            )}

            {open && typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
                        onClick={() => setOpen(false)}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Share"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-start gap-3">
                                {image && (
                                    <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg bg-slate-100 object-cover" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 font-semibold text-slate-900">{title}</p>
                                    {subtitle && <p className="text-sm font-bold text-slate-700">{subtitle}</p>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    autoFocus
                                    aria-label="Close"
                                    className="-mr-2 -mt-2 rounded-full p-2 text-slate-500 hover:bg-slate-100"
                                >
                                    <LuX className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="mt-3 text-xs text-slate-500">
                             invites others to join.
                            </p>

                            <div className="mt-4 grid gap-2">
                                <a
                                    href={`https://wa.me/?text=${enc(`${message} ${shareUrl}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                >
                                    <FaWhatsapp className="w-4 h-4" />
                                    Share on WhatsApp
                                </a>
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpen(false)}
                                    className={rowClass}
                                >
                                    <FaFacebookF className="w-4 h-4" />
                                    Facebook
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${enc(message)}&url=${enc(shareUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpen(false)}
                                    className={rowClass}
                                >
                                    <FaXTwitter className="w-4 h-4" />
                                    X (Twitter)
                                </a>
                                <a
                                    href={`https://www.tiktok.com/upload?text=${enc(`${message} ${shareUrl}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpen(false)}
                                    className={rowClass}
                                >
                                    <FaTiktok className="w-4 h-4" />
                                    TikTok
                                </a>
                                <button type="button" onClick={copyLink} className={rowClass}>
                                    {copied
                                        ? <><LuCheck className="w-4 h-4 text-green-600" /> Link copied</>
                                        : <><LuLink className="w-4 h-4" /> Copy link</>}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}