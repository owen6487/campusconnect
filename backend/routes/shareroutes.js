// Save as routes/seoRoutes.js
//
// WHY THIS EXISTS
// WhatsApp, Facebook and X read link previews from the HTML the server sends.
// They do not run JavaScript, so tags added by React are invisible to them.
// For /product/:id this file loads the app's index.html, puts the product's tags
// into it, and sends that. Browsers then load the React app exactly as before.
//
// .env
//   SITE_URL=https://your-domain.com      public address people open (no trailing slash)
//   API_URL=https://api.your-domain.com   public address of THIS server (serves /uploads)
//   FRONTEND_DIST=../frontend/dist        optional: only if this server holds the built frontend
//   UPLOADS_DIR=./uploads                 folder where multer saves listing photos
//
// Also run:  npm i sharp     (resizes each listing's photo into its share image)
//
// server.js (before any static or catch-all handling):
//   require("./routes/seoRoutes")(app);

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const sharp = require("sharp"); // npm i sharp
const Product = require("../models/product");

const SITE_URL = (process.env.SITE_URL || "https://campusconnect.co.ke").replace(/\/$/, "");
const SITE_NAME = "Campus Connect";
const DEFAULT_IMAGE = `${SITE_URL}/org.jpg`;
const DIST_INDEX = process.env.FRONTEND_DIST
  ? path.join(process.env.FRONTEND_DIST, "index.html")
  : null;

// Share images: where multer saves photos (the folder behind your /uploads URL)
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads");
const OG_W = 1200;
const OG_H = 630;
const OG_MAX_BYTES = 280 * 1024; // WhatsApp drops preview images much over ~300 KB
const OG_CACHE_MAX = 200;
const ogCache = new Map(); // product id -> JPEG buffer. Safe because photos can't change after posting

// Pages that exist today and should be in the sitemap (add /about, /contact when they exist)
const STATIC_PATHS = ["/", "/how-to-buy", "/how-to-sell", "/faq", "/safety-tips", "/privacy", "/terms"];

/* ───────────── helpers ───────────── */

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const clip = (s = "", n) => {
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
};

// Previews need an absolute https URL for the image
const toAbsolute = (url, apiOrigin) => {
  if (!url) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
};

/* ───────────── the app's index.html ───────────── */

let remote = { html: null, at: 0 };

const getTemplate = async () => {
  // Frontend built on this server: read it directly
  if (DIST_INDEX && fs.existsSync(DIST_INDEX)) {
    return fs.readFileSync(DIST_INDEX, "utf8");
  }
  // Frontend hosted elsewhere (Vercel, Netlify...): fetch its index.html, cached for a minute.
  // Kept short because a new frontend deploy changes the hashed file names inside it.
  if (remote.html && Date.now() - remote.at < 60 * 1000) return remote.html;
  const r = await fetch(`${SITE_URL}/index.html`);
  if (!r.ok) throw new Error(`Couldn't fetch index.html (${r.status})`);
  remote = { html: await r.text(), at: Date.now() };
  return remote.html;
};

// Remove the generic tags from index.html so a page never has two titles or two og:titles.
// (Write tags in index.html with name/property first, like the head snippet I gave you.)
const stripExisting = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "");

const inject = (html, tags) => stripExisting(html).replace("</head>", `${tags}\n</head>`);

/* ───────────── tags for one product ───────────── */

const productTags = (p, apiOrigin) => {
  const url = `${SITE_URL}/product/${p._id}`;
  const price = Number(p.price) || 0;
  const where = [p.campus?.name, p.branch?.name].filter(Boolean).join(", ");
  const title = `${p.name} for KSh ${price.toLocaleString("en-KE")} | ${SITE_NAME}`;
  const description = clip(`${where ? where + ". " : ""}${p.description || ""}`, 160);
  const images = (p.images || []).slice(0, 4).map((i) => toAbsolute(i, apiOrigin));
  // The preview uses our own resized copy (see productImage below), never the raw upload
  const image = images.length ? `${apiOrigin}/og/product/${p._id}/image.jpg` : DEFAULT_IMAGE;

  // Structured data: lets Google show price and availability in results
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
      availability: "https://schema.org/InStock",
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
    `<meta property="og:image:width" content="${OG_W}" />`,
    `<meta property="og:image:height" content="${OG_H}" />`,
    `<meta property="og:image:alt" content="${esc(p.name)}" />`,
    `<meta property="product:price:amount" content="${price}" />`,
    `<meta property="product:price:currency" content="KES" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    // "<" is escaped so a listing can never close the script tag early
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`,
  ].join("\n");
};

/* ───────────── route handlers ───────────── */

const productPage = async (req, res) => {
  let template;
  try {
    template = await getTemplate();
  } catch (err) {
    console.error("SEO template error:", err.message);
    return res.status(502).send("Temporarily unavailable. Please try again.");
  }

  const apiOrigin = process.env.API_URL || `${req.protocol}://${req.get("host")}`;
  let html = template;
  let status = 200;

  try {
    const { id } = req.params;
    const product = mongoose.Types.ObjectId.isValid(id)
      ? await Product.findById(id).populate("campus", "name").populate("branch", "name")
      : null;

    if (product) {
      html = inject(template, productTags(product, apiOrigin));
    } else {
      status = 404; // a real 404 so search engines drop the page; the app still shows its own message
      html = inject(
        template,
        `<title>Listing not found | ${SITE_NAME}</title>\n<meta name="robots" content="noindex" />`
      );
    }
  } catch (err) {
    // Never break the page over SEO: fall back to the plain app
    console.error("SEO product page error:", err);
  }

  res
    .status(status)
    .set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" })
    .send(html);
};

/* ───────────── share image ───────────── */

// 1200x630 preview: the whole photo (never cropped) over a blurred, darkened copy of itself,
// compressed under ~280 KB so WhatsApp always accepts it. Phone photos are often several MB.
const makeShareImage = async (file) => {
  const bg = await sharp(file)
    .rotate() // respect the phone's orientation flag
    .resize(OG_W, OG_H, { fit: "cover" })
    .blur(24)
    .modulate({ brightness: 0.75 })
    .toBuffer();
  const fg = await sharp(file).rotate().resize(OG_W, OG_H, { fit: "inside" }).toBuffer();
  const base = sharp(bg).composite([{ input: fg, gravity: "center" }]);

  let out;
  for (const quality of [82, 72, 62, 52, 42]) {
    out = await base.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
    if (out.length <= OG_MAX_BYTES) break;
  }
  return out;
};

const productImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.redirect(302, DEFAULT_IMAGE);

    let buf = ogCache.get(id);
    if (!buf) {
      const p = await Product.findById(id).select("images");
      const first = p?.images?.[0];
      // External URLs are never fetched or redirected to (that would let a listing point us at any site)
      if (!first || /^https?:\/\//i.test(first)) return res.redirect(302, DEFAULT_IMAGE);

      const file = path.join(UPLOADS_DIR, path.basename(first)); // basename blocks ../ tricks
      if (!fs.existsSync(file)) return res.redirect(302, DEFAULT_IMAGE);

      buf = await makeShareImage(file);
      if (ogCache.size >= OG_CACHE_MAX) ogCache.delete(ogCache.keys().next().value);
      ogCache.set(id, buf);
    }

    res.set({ "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" }).send(buf);
  } catch (err) {
    console.error("Share image error:", err);
    res.redirect(302, DEFAULT_IMAGE);
  }
};

const sitemap = async (req, res) => {
  try {
    const products = await Product.find()
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

    res
      .set({ "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" })
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
  } catch (err) {
    console.error("Sitemap error:", err);
    res.status(500).send("Server error");
  }
};

const robots = (req, res) => {
  res
    .type("text/plain")
    .send(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /profile",
        "Disallow: /mylistings",
        "Disallow: /updatelistings",
        "Disallow: /login",
        "Disallow: /signup",
        "",
        `Sitemap: ${SITE_URL}/sitemap.xml`,
      ].join("\n")
    );
};

module.exports = (app) => {
  app.get("/product/:id", productPage);
  app.get("/og/product/:id/image.jpg", productImage);
  app.get("/sitemap.xml", sitemap);
  app.get("/robots.txt", robots);
};