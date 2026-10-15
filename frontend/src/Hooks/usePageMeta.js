// Save as src/Hooks/usePageMeta.js
//
// Gives each page its OWN title, description and canonical address, which Google needs so that
// /faq, /how-to-buy and the rest don't all look like copies of the home page.
//
//   usePageMeta({ title: "FAQ", description: "Answers to common questions..." });
//   usePageMeta({ title: "Admin", noindex: true });            // keep out of search results
//   usePageMeta({ title: `${category} for sale`, keepParams: ["category"] });
//
// keepParams: the canonical address normally drops everything after "?", so tracking links like
// ?utm_source=whatsapp don't count as separate pages. But on a page like /search?category=Books the
// "?category=" part IS the page. List it in keepParams and it stays in the canonical address.
// Without it, every category page would claim to be a copy of plain /search.
//
// Google runs JavaScript, so it sees these. WhatsApp/Facebook don't, which is why product pages
// ALSO get their tags from the server (seoRoutes.js).
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "Campus Connect";
const ORIGIN = import.meta.env.VITE_SITE_URL || "https://campusconnect.co.ke";

const upsert = (selector, create) => {
  let el = document.head.querySelector(selector);
  const created = !el;
  if (created) {
    el = create();
    document.head.appendChild(el);
  }
  return { el, created };
};

export default function usePageMeta({ title, description, noindex = false, keepParams = [] } = {}) {
  const { pathname, search } = useLocation();
  const keep = keepParams.join(","); // a stable value to depend on (a new array every render would re-run the effect)

  useEffect(() => {
    const undo = [];

    if (title) {
      const before = document.title;
      document.title = `${title} | ${SITE}`;
      undo.push(() => { document.title = before; });
    }

    if (description) {
      const { el, created } = upsert('meta[name="description"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        return m;
      });
      const before = el.getAttribute("content");
      el.setAttribute("content", description);
      undo.push(() => (created ? el.remove() : el.setAttribute("content", before ?? "")));
    }

    {
      const current = new URLSearchParams(search);
      const kept = new URLSearchParams();
      (keep ? keep.split(",") : []).forEach((k) => {
        const v = current.get(k);
        if (v) kept.set(k, v);
      });
      const qs = kept.toString();
      const href = `${ORIGIN}${pathname}${qs ? `?${qs}` : ""}`;

      const { el, created } = upsert('link[rel="canonical"]', () => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        return l;
      });
      const before = el.getAttribute("href");
      el.setAttribute("href", href);
      undo.push(() => (created ? el.remove() : el.setAttribute("href", before ?? "")));
    }

    if (noindex) {
      const { el, created } = upsert('meta[name="robots"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("name", "robots");
        return m;
      });
      const before = el.getAttribute("content");
      el.setAttribute("content", "noindex, nofollow");
      undo.push(() => (created ? el.remove() : el.setAttribute("content", before ?? "")));
    }

    // Leaving the page puts everything back, so the next page starts clean
    return () => undo.reverse().forEach((fn) => fn());
  }, [title, description, noindex, pathname, search, keep]);
}
