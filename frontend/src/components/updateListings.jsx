import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../apis";
import useAuth from "../Hooks/useAuth";
import usePageMeta from "../Hooks/usePageMeta";
import { getImageUrl, useFallback as onImgError } from "../utils/imageUrl";
import { normalizeKenyanPhone } from "../utils/phone";

// Match this to your router: the URL and method of your update-product route.
const sendUpdate = (id, payload) => api.put(`/api/products/update/${id}`, payload);

const NAME_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000; // same rule as the backend

// Same rules as the backend. The server checks again, so these are only for fast feedback.
const validators = {
  name: (v) => {
    const t = v.trim().replace(/\s+/g, " ");
    return t.length >= 3 && t.length <= 100 ? { value: t } : { error: "Title must be 3 to 100 characters." };
  },
  price: (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 && n <= 100000000 ? { value: n } : { error: "Enter a valid price." };
  },
  description: (v) => {
    const t = v.trim();
    return t.length >= 1 && t.length <= 2000 ? { value: t } : { error: "Description must be 1 to 2000 characters." };
  },
  phoneNumber: (v) => {
    const p = normalizeKenyanPhone(v);
    return p ? { value: p } : { error: "Enter a valid Kenyan number, e.g. 0712 345 678." };
  },
};

const inputClass = (hasError) =>
  `w-full rounded-lg border p-3 text-base focus:outline-none focus:ring-2 sm:text-sm ${
    hasError ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-blue-500"
  }`;

function Field({ id, label, error, helper, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="mt-1 text-sm text-red-600">{error}</p>
      ) : (
        helper && <p id={`${id}-msg`} className="mt-1 text-xs text-slate-500">{helper}</p>
      )}
    </div>
  );
}

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
  </svg>
);

export default function Updatelisting() {
  usePageMeta({ title: "Update listing", noindex: true, description: "Update your Campus Connect listing details and pricing." });
  const { id: routeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const id = routeId || location.state?.listing?._id;

  const [product, setProduct] = useState(location.state?.listing || null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [draft, setDraft] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }

    if (location.state?.listing && location.state.listing._id === id) {
      const data = location.state.listing;
      setProduct(data);
      setDraft({
        name: data.name ?? "",
        price: String(data.price ?? ""),
        description: data.description ?? "",
        phoneNumber: data.phoneNumber ?? "",
      });
      setStatus("ready");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    api.get(`/api/products/${id}`, { signal: controller.signal })
      .then(({ data }) => {
        setProduct(data);
        setDraft({
          name: data.name ?? "",
          price: String(data.price ?? ""),
          description: data.description ?? "",
          phoneNumber: data.phoneNumber ?? "",
        });
        setStatus("ready");
      })
      .catch((err) => {
        if (err.code === "ERR_CANCELED") return;
        console.error("Load listing error:", err);
        setStatus("error");
      });
    return () => controller.abort();
  }, [id, location.state]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-4 px-4 py-6">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-40 rounded-xl bg-slate-200" />
        <div className="h-80 rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (status === "error" || !product) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Listing not found</h1>
        <p className="mt-2 text-slate-500">It may have been removed.</p>
        <Link to="/mylistings" className="mt-4 inline-block text-blue-600 hover:underline">Back to my listings</Link>
      </div>
    );
  }

  // Block only when both ids are known and different. The server enforces this anyway.
  const ownerId = String(product.sellerId?._id ?? product.sellerId ?? "");
  const myId = String(user?.id ?? user?._id ?? "");
  if (ownerId && myId && ownerId !== myId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">This isn't your listing</h1>
        <p className="mt-2 text-slate-500">You can only edit items you posted.</p>
        <Link to="/mylistings" className="mt-4 inline-block text-blue-600 hover:underline">Back to my listings</Link>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const postedAt = product.createdAt ? new Date(product.createdAt).getTime() : 0;
  const msLeft = NAME_EDIT_WINDOW_MS - (Date.now() - postedAt);
  const nameEditable = msLeft > 0;
  const hoursLeft = Math.max(1, Math.ceil(msLeft / 3600000));

  const fields = ["price", "description", "phoneNumber", ...(nameEditable ? ["name"] : [])];

  const setField = (key) => (e) => {
    const value = key === "price" ? e.target.value.replace(/\D/g, "") : e.target.value;
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const initial = {
    name: product.name ?? "",
    price: String(product.price ?? ""),
    description: product.description ?? "",
    phoneNumber: product.phoneNumber ?? "",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Only check and send what actually changed, so an old short description
    // can't block someone who only wants to lower the price.
    const changes = {};
    const nextErrors = {};
    for (const key of fields) {
      const raw = String(draft[key] ?? "");
      if (raw === initial[key]) continue;
      const result = validators[key](raw);
      if (result.error) nextErrors[key] = result.error;
      else if (String(result.value) !== initial[key]) changes[key] = result.value;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!Object.keys(changes).length) return navigate(`/product/${id}`);

    setSaving(true);
    setSaveError("");
    try {
      await sendUpdate(id, changes);
      navigate(`/product/${id}`, { replace: true });
    } catch (err) {
      console.error("Update listing error:", err);
      setSaveError(err.response?.data?.message || "Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const priceNumber = Number(draft.price);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/mylistings" className="text-sm text-slate-500 hover:underline">&larr; My listings</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit listing</h1>

      {/* Photos: shown, never editable */}
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((img, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-lg bg-slate-100">
              <img src={getImageUrl(img)} alt="" loading="lazy" onError={onImgError} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <p className="mt-3 flex gap-2 text-sm text-slate-600">
          <LockIcon />
          <span>
            Photos, category and campus can't be changed after posting, so buyers always get the item they saw.
            To use different photos, delete this listing from <Link to="/mylistings" className="text-blue-600 underline">My listings</Link> and post a new one.
          </span>
        </p>
      </section>

      {/* Details: only the allowed fields */}
      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Details</h2>

        {nameEditable ? (
          <Field id="name" label="Title" error={errors.name}
            helper={`You can fix the title for ${hoursLeft} more hour${hoursLeft === 1 ? "" : "s"}. After that it's locked.`}>
            <input id="name" value={draft.name} onChange={setField("name")} maxLength={100}
              aria-invalid={!!errors.name} aria-describedby="name-msg" className={inputClass(!!errors.name)} />
          </Field>
        ) : (
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-700">Title</p>
            <p className="flex gap-2 rounded-lg bg-slate-50 p-3 text-slate-700"><LockIcon /> {product.name}</p>
          </div>
        )}

        <Field id="price" label="Price (KSh)" error={errors.price}
          helper={priceNumber > 0 ? `KSh ${priceNumber.toLocaleString()}` : undefined}>
          <input id="price" inputMode="numeric" value={draft.price} onChange={setField("price")} maxLength={9}
            aria-invalid={!!errors.price} aria-describedby="price-msg" className={inputClass(!!errors.price)} />
        </Field>

        <Field id="description" label="Description" error={errors.description}
          helper={`${draft.description.length}/2000`}>
          <textarea id="description" rows={6} value={draft.description} onChange={setField("description")} maxLength={2000}
            aria-invalid={!!errors.description} aria-describedby="description-msg" className={inputClass(!!errors.description)} />
        </Field>

        <Field id="phoneNumber" label="Contact phone number" error={errors.phoneNumber}
          helper="Buyers reach you on WhatsApp at this number.">
          <input id="phoneNumber" type="tel" inputMode="tel" autoComplete="tel" value={draft.phoneNumber}
            onChange={setField("phoneNumber")} maxLength={30} placeholder="07XX XXX XXX"
            aria-invalid={!!errors.phoneNumber} aria-describedby="phoneNumber-msg" className={inputClass(!!errors.phoneNumber)} />
        </Field>

        {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link to="/mylistings"
            className="rounded-lg border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className={`rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 ${saving ? "cursor-not-allowed opacity-50" : ""}`}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}