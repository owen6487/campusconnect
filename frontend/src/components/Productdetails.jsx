import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import api from "../apis";
import Lightbox from "./Lightbox";
import ShareButton from "./ShareButton";
import { getImageUrl, useFallback as onImgError } from "../utils/imageUrl";

// Kenyan numbers -> normalized local format and wa.me format; null when invalid
const normalizeKenyanPhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(digits)) return digits;
  if (/^254[17]\d{8}$/.test(digits)) return "0" + digits.slice(3);
  if (/^[17]\d{8}$/.test(digits)) return "0" + digits;
  return null;
};

const toWhatsappNumber = (phone = "") => {
  const normalized = normalizeKenyanPhone(phone);
  if (!normalized) return null;
  if (normalized.startsWith("0")) return "254" + normalized.slice(1);
  return normalized.startsWith("254") ? normalized : "254" + normalized;
};

function Productdetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [imageIndex, setImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setImageIndex(0);
    setStatus("loading");
    let ignore = false; // drop responses from outdated requests

    api.get(`/api/products/${id}`)
      .then(({ data }) => {
        if (ignore) return;
        setProduct(data);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        if (!ignore) setStatus("error");
      });

    return () => { ignore = true; };
  }, [id]);

  const images = product?.images?.length ? product.images : [null];
  const total = images.length;

  // Arrow keys move the gallery (not while the lightbox is open)
  useEffect(() => {
    if (lightboxOpen || total < 2) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setImageIndex((i) => (i - 1 + total) % total);
      if (e.key === "ArrowRight") setImageIndex((i) => (i + 1) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, total]);

  if (status === "loading") {
    return (
      <div className="mx-auto grid max-w-6xl animate-pulse gap-4 p-4 lg:grid-cols-3">
        <div className="aspect-[4/3] rounded-lg bg-gray-200 lg:col-span-2" />
        <div className="h-64 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (status === "error" || !product) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h2 className="text-xl font-bold">Listing not found</h2>
        <p className="mt-2 text-gray-500">It may have been removed or sold.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to browsing
        </Link>
      </div>
    );
  }

  const prev = () => setImageIndex((i) => (i - 1 + total) % total);
  const next = () => setImageIndex((i) => (i + 1) % total);

  const price = `Ksh ${Number(product.price).toLocaleString()}`;
  const location = [product.campus?.name, product.branch?.name].filter(Boolean).join(" · ");
  const posted = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const seller = product.sellerId;
  const contactPhone = normalizeKenyanPhone(product.phoneNumber || seller?.phoneNumber || "");
  const whatsappNumber = contactPhone ? toWhatsappNumber(contactPhone) : null;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hi! I'm interested in your "${product.name}" listed for ${price} on Campus Connect. Is it still available?`
      )}`
    : null;
  const callLink = whatsappNumber ? `tel:+${whatsappNumber}` : null;

  const arrow =
    "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow hover:bg-white";

  const shareImage = getImageUrl(images[imageIndex]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 pb-28 lg:pb-8">
      <Helmet>
        <title>{`${product.name} - ${price} | Campus Connect`}</title>
        <meta name="description" content={product.description || "View this listing on Campus Connect."} />
        <meta property="og:title" content={`${product.name} - ${price}`} />
        <meta property="og:description" content={product.description || "View this listing on Campus Connect."} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={shareImage} />
        <meta property="og:url" content={typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : undefined} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} - ${price}`} />
        <meta name="twitter:description" content={product.description || "View this listing on Campus Connect."} />
        <meta name="twitter:image" content={shareImage} />
      </Helmet>

      <nav className="mb-3 text-sm text-gray-500">
        <Link to="/" className="hover:underline">Home</Link>
        {product.category && <> / <span>{product.category}</span></>}
      </nav>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {/* ── Gallery ── */}
        <section className="overflow-hidden rounded-lg border bg-white lg:col-span-2">
          <div className="relative aspect-[4/3] bg-gray-100">
            <img
              src={getImageUrl(images[imageIndex])}
              alt={product.name}
              onClick={() => setLightboxOpen(true)}
              onError={onImgError}
              className="h-full w-full cursor-zoom-in object-contain"
            />
            {total > 1 && (
              <>
                <button onClick={prev} aria-label="Previous image" className={`${arrow} left-3`}>‹</button>
                <button onClick={next} aria-label="Next image" className={`${arrow} right-3`}>›</button>
                <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
                  {imageIndex + 1} / {total}
                </span>
              </>
            )}
          </div>

          {total > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded border-2 ${
                    i === imageIndex ? "border-blue-500" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt=""
                    onError={onImgError}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Price + seller (right column on desktop, pinned while scrolling) ── */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-2xl font-bold">{price}</p>
            <h1 className="mt-1 text-lg font-semibold text-gray-800">{product.name}</h1>
            <p className="mt-2 text-sm text-gray-500">{location}</p>
            {posted && <p className="text-sm text-gray-400">Posted {posted}</p>}
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                {(seller?.name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{seller?.name || "Seller"}</p>
                <p className="text-xs text-gray-500">Campus seller</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {contactPhone ? (
                <>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg bg-green-500 px-4 py-3 text-center font-semibold text-white hover:bg-green-600">
                    Chat on WhatsApp
                  </a>
                  <a href={callLink}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-center font-semibold hover:bg-gray-50">
                    Call seller
                  </a>
                </>
              ) : (
                <p className="text-sm text-gray-500">This seller hasn't added a contact number yet.</p>
              )}

              <ShareButton
                title={product.name}
                text={`Check out "${product.name}" on Campus Connect for ${price}.`}
                subtitle={price}
                image={shareImage}
                url={typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : ""}
                className="w-full"
              />
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Safety tips</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Meet in a public place on campus.</li>
              <li>Check the item before you pay.</li>
              <li>Never pay in advance for something you haven't seen.</li>
            </ul>
          </div>
        </aside>

        {/* ── Description ── */}
        <section className="rounded-lg border bg-white p-4 lg:col-span-2">
          <h2 className="mb-2 text-lg font-semibold">Description</h2>
          <p className="whitespace-pre-line text-gray-700">{product.description}</p>
          {product.category && (
            <p className="mt-4 text-sm text-gray-500">Category: {product.category}</p>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <p className="text-lg font-bold">{price}</p>
        <ShareButton
          title={product.name}
          subtitle={price}
          text={`Check out "${product.name}" on Campus Connect for ${price}.`}
          image={shareImage}
          url={typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : ""}
          triggerText="Share"
          compact
          className="flex-1"
        />
        {whatsappLink && (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-green-500 px-4 py-3 font-semibold text-white">
            WhatsApp
          </a>
        )}
        {callLink && (
          <a href={callLink}
            className="rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700">
            Call
          </a>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox images={images} startindex={imageIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

export default Productdetails;