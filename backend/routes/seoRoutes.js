// backend/routes/seoRoutes.js
//
// Serves the frontend's index.html with per-product meta tags injected,
// so WhatsApp/Facebook/Google get real previews from /product/:id.
// Works WITH Cloudinary (transformations) — no sharp, no local disk needed.

const mongoose = require("mongoose");
const Product = require("../models/product");

const SITE_URL = (process.env.SITE_URL || "https://campusconnect.co.ke").replace(/\/$/, "");
const API_URL = process.env.API_URL || null;                    // e.g. https://api.campusconnect.co.ke
const SITE_NAME = "Campus Connect";
const DEFAULT_IMAGE = `${SITE_URL}/org.jpg`;                    // your branded card in frontend/public

if (process.env.NODE_ENV === "production" && !process.env.SITE_URL) {
    console.warn("⚠️  seoRoutes: SITE_URL is missing in production; using https://campusconnect.co.ke");
}

const STATIC_PATHS = ["/", "/search", "/about", "/contact", "/how-to-buy", "/how-to-sell",
    "/faq", "/safety-tips", "/privacy", "/terms"];

const STATIC_PAGE_META = {
    "/about": {
        title: `About Campus Connect | Student marketplace in Kenya`,
        description: `Learn how Campus Connect helps students buy and sell items safely, quickly, and with more trust on campus across Kenya.`,
    },
    "/contact": {
        title: `Contact Campus Connect`,
        description: `Get support, ask a question, report a listing, or send feedback to the Campus Connect team at support@campusconnect.co.ke.`,
    },
};

/* ── helpers ── */

const esc = (s = "") =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const clip = (s = "", n) => {
    const t = String(s).replace(/\s+/g, " ").trim();
    return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
};

// Cloudinary builds the 1200×630 preview itself — blurred-pad, compressed, under WhatsApp's limit
const toOgImage = (url) => {
    if (!url) return DEFAULT_IMAGE;
    if (/res\.cloudinary\.com/.test(url)) {
        return url.replace("/upload/", "/upload/w_1200,h_630,c_lpad,b_auto,f_jpg,q_auto/");
    }
    return toAbsolute(url, API_URL || SITE_URL);
};

const toAbsolute = (url, apiOrigin) => {
    if (!url) return DEFAULT_IMAGE;
    if (/^https?:\/\//i.test(url)) return url;
    return `${apiOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
};

/* ── fetch the frontend's index.html (with stale fallback) ── */

let remote = { html: null, at: 0 };

const getTemplate = async () => {
    try {
        if (remote.html && Date.now() - remote.at < 15 * 1000) return remote.html;
        const r = await fetch(`${SITE_URL}/index.html`, { signal: AbortSignal.timeout(5000) });
        if (!r.ok) throw new Error(`index.html responded ${r.status}`);
        remote = { html: await r.text(), at: Date.now() };
        return remote.html;
    } catch (err) {
        if (remote.html) {
            console.error("seoRoutes: fetch failed, using stale template:", err.message);
            return remote.html;
        }
        throw err;
    }
};

// Only strips tags written with name/property FIRST — keep index.html in that format!
const stripExisting = (html) =>
    html
        .replace(/<title>[\s\S]*?<\/title>/i, "")
        .replace(/<meta\s+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, "")
        .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "");

const inject = (html, tags) => stripExisting(html).replace("</head>", `${tags}\n</head>`);

/* ── tags for one product ── */

const productTags = (p) => {
    const url = `${SITE_URL}/product/${p._id}`;
    const price = Number(p.price) || 0;
    const where = [p.campus?.name, p.branch?.name].filter(Boolean).join(", ");
    const title = `${p.name} for KSh ${price.toLocaleString("en-KE")} | ${SITE_NAME}`;
    const description = clip(`${where ? where + ". " : ""}${p.description || ""}`, 160);
    const first = p.images?.[0];
    const image = toOgImage(first);
    const images = (p.images || []).slice(0, 4).map((i) => toAbsolute(i, API_URL || SITE_URL));
    const isLive = !p.expiresAt || new Date(p.expiresAt) > new Date();
    const statusValue = String(p.status ?? "").trim().toLowerCase();
    const isUnavailable = statusValue === "sold" || statusValue === "inactive" || p.isActive === false || !isLive;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: clip(p.description || "", 500),
        image: images.length ? images : [image],
        offers: {
            "@type": "Offer",
            url,
            priceCurrency: "KES",
            price,
            availability: isUnavailable ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        },
    };

    return [
        `<title>${esc(title)}</title>`,
        `<meta name="description" content="${esc(description)}" />`,
        `<link rel="canonical" href="${esc(url)}" />`,
        `<meta property="og:type" content="product" />`,
        `<meta property="og:site_name" content="${SITE_NAME}" />`,
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(description)}" />`,
        `<meta property="og:url" content="${esc(url)}" />`,
        `<meta property="og:image" content="${esc(image)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${esc(p.name)}" />`,
        `<meta property="product:price:amount" content="${price}" />`,
        `<meta property="product:price:currency" content="KES" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(title)}" />`,
        `<meta name="twitter:description" content="${esc(description)}" />`,
        `<meta name="twitter:image" content="${esc(image)}" />`,
        `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`,
    ].join("\n");
};

/* ── static pages (about/contact/etc) ── */

const staticPageTags = (slug, meta) => {
    const url = `${SITE_URL}${slug}`;
    const title = `${meta.title} | ${SITE_NAME}`;
    const description = clip(meta.description || "", 160);

    return [
        `<title>${esc(title)}</title>`,
        `<meta name="description" content="${esc(description)}" />`,
        `<link rel="canonical" href="${esc(url)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${SITE_NAME}" />`,
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(description)}" />`,
        `<meta property="og:url" content="${esc(url)}" />`,
        `<meta property="og:image" content="${esc(DEFAULT_IMAGE)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(title)}" />`,
        `<meta name="twitter:description" content="${esc(description)}" />`,
        `<meta name="twitter:image" content="${esc(DEFAULT_IMAGE)}" />`,
    ].join("\n");
};

const staticPage = async (req, res) => {
    let template;
    try {
        template = await getTemplate();
    } catch (err) {
        console.error("seoRoutes template error:", err.message);
        return res.status(502).send("Temporarily unavailable. Please try again.");
    }

    const slug = req.path.replace(/\/$/, "") || "/";
    const meta = STATIC_PAGE_META[slug] || STATIC_PAGE_META["/about"];
    res.status(200)
        .set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" })
        .send(inject(template, staticPageTags(slug, meta)));
};

/* ── /product/:id ── */

const productPage = async (req, res) => {
    let template;
    try {
        template = await getTemplate();
    } catch (err) {
        console.error("seoRoutes template error:", err.message);
        return res.status(502).send("Temporarily unavailable. Please try again.");
    }

    let html = template;
    let status = 200;

    try {
        const { id } = req.params;
        const product = mongoose.Types.ObjectId.isValid(id)
            ? await Product.findById(id).populate("campus", "name").populate("branch", "name")
            : null;

        if (product) {
            const statusValue = String(product.status ?? "").trim().toLowerCase();
            const isUnavailable = statusValue === "sold" || statusValue === "inactive" || product.isActive === false;
            if (isUnavailable) {
                status = 404;
                html = inject(template,
                    `<title>Listing not found | ${SITE_NAME}</title>\n<meta name="robots" content="noindex" />`);
            } else {
                html = inject(template, productTags(product));
            }
        } else {
            status = 404;
            html = inject(template,
                `<title>Listing not found | ${SITE_NAME}</title>\n<meta name="robots" content="noindex" />`);
        }
    } catch (err) {
        console.error("seoRoutes product page error:", err);
    }

    res.status(status)
        .set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" })
        .send(html);
};

/* ── sitemap + robots ── */

const sitemap = async (req, res) => {
    try {
        const products = await Product.find({
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } },
            ],
        })
            .select("_id updatedAt createdAt")
            .sort({ createdAt: -1 })
            .limit(5000)
            .lean();

        const urls = [
            ...STATIC_PATHS.map((p) => `<url><loc>${SITE_URL}${p}</loc></url>`),
            ...products.map((p) => {
                const d = p.updatedAt || p.createdAt;
                return `<url><loc>${SITE_URL}/product/${p._id}</loc>${d ? `<lastmod>${new Date(d).toISOString()}</lastmod>` : ""}</url>`;
            }),
        ];

        res.set({ "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" })
            .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
    } catch (err) {
        console.error("Sitemap error:", err);
        res.status(500).send("Server error");
    }
};

const robots = (req, res) => {
    res.type("text/plain").send(
        ["User-agent: *", "Allow: /",
            "Disallow: /login", "Disallow: /signup", "Disallow: /admin",
            "Disallow: /profile", "Disallow: /mylistings", "Disallow: /updatelistings",
            "", `Sitemap: ${SITE_URL}/sitemap.xml`].join("\n"));
};

module.exports = (app) => {
    app.get(Object.keys(STATIC_PAGE_META), staticPage);
    app.get("/product/:id", productPage);
    app.get("/sitemap.xml", sitemap);
    app.get("/robots.txt", robots);
};