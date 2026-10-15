import { useState, useEffect, useCallback } from "react";
import { MdOutlineMail, MdOutlinePerson, MdOutlinePhone, MdOutlineSchool, MdVerified } from "react-icons/md";
import api from "../apis";
import useAuth from "../Hooks/useAuth";
import usePageMeta from "../Hooks/usePageMeta";
import { Avatar, Row, ProfileSkeleton, ListingsPreview } from "../components/ProfileParts";

/* ───────────────────────── helpers ───────────────────────── */

// "0712 345 678", "+254712345678", "712345678" -> "0712345678".
// Returns "" for empty input (allowed: removes the number) and null when invalid.
const normalizeKenyanPhone = (input = "") => {
  const v = input.trim();
  if (!v) return "";
  const d = v.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(d)) return d;
  if (/^254[17]\d{8}$/.test(d)) return "0" + d.slice(3);
  if (/^[17]\d{8}$/.test(d)) return "0" + d;
  return null;
};

// Tidies spaces; returns null when the name is too short or too long.
const normalizeName = (input = "") => {
  const v = input.trim().replace(/\s+/g, " ");
  return v.length >= 2 && v.length <= 50 ? v : null;
};

const formatPhone = (p) => (p && p.length === 10 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p);

const titleCase = (s = "") => s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");


/* ─────────────── editable fields: the ONLY place to change when adding more ───────────────
   To add a bio later, append an entry like:
   { key: "bio", label: "About me", type: "textarea", maxLength: 300,
     placeholder: "Tell buyers a little about you", helper: "Up to 300 characters." }
   (then allow "bio" in the backend EDITABLE_FIELDS and add it to the schema)            */
const EDITABLE_FIELDS = [
  {
    key: "name",
    label: "Full name",
    type: "text",
    icon: MdOutlinePerson,
    placeholder: "Your full name",
    helper: "Buyers see this name on your listings.",
    emptyText: "Not added yet",
    maxLength: 50,
    normalize: normalizeName,
    error: "Enter your name (2 to 50 characters).",
  },
  {
    key: "phoneNumber",
    label: "Phone number",
    type: "tel",
    icon: MdOutlinePhone,
    placeholder: "07XX XXX XXX",
    helper: "Buyers use this to contact you on WhatsApp.",
    emptyText: "Not added yet",
    normalize: normalizeKenyanPhone,
    error: "Enter a valid Kenyan number, e.g. 0712 345 678.",
    format: formatPhone,
  },
];

/* ───────────────────────── page ───────────────────────── */

function Profilepage() {
  usePageMeta({ title: "Profile", noindex: true, description: "Manage your Campus Connect profile, contact details, and listings." });
  const { refreshUser } = useAuth(); // keeps the navbar name in sync after an edit
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [listings, setListings] = useState([]);
  const [listingsStatus, setListingsStatus] = useState("loading");

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async (signal) => {
    setStatus("loading");
    setListingsStatus("loading");
    setLoadError("");

    // Listings are optional: a failure here must not break the profile
    api.get("/api/products/mylistings", { signal })
      .then(({ data }) => { setListings(Array.isArray(data) ? data : []); setListingsStatus("ready"); })
      .catch((err) => { if (err.code !== "ERR_CANCELED") setListingsStatus("error"); });

    try {
      const { data } = await api.get("/api/users/profile", { signal });
      setProfile(data.profile ?? data.existingUser);
      setStatus("ready");
    } catch (err) {
      if (err.code === "ERR_CANCELED") return;
      console.error("Profile load error:", err);
      setLoadError(err.response?.data?.message || "Couldn't load your profile.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // hide the "saved" message after a moment
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  const startEdit = () => {
    setDraft(Object.fromEntries(EDITABLE_FIELDS.map((f) => [f.key, profile[f.key] ?? ""])));
    setErrors({});
    setSaveError("");
    setSaved(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setErrors({});
    setSaveError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    const nextErrors = {};
    const payload = {};
    for (const f of EDITABLE_FIELDS) {
      const raw = String(draft[f.key] ?? "");
      const cleaned = f.normalize ? f.normalize(raw) : raw.trim();
      if (cleaned === null) { nextErrors[f.key] = f.error; continue; }
      if (cleaned !== (profile[f.key] ?? "")) payload[f.key] = cleaned; // only send what changed
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!Object.keys(payload).length) return cancelEdit();

    setSaving(true);
    setSaveError("");
    try {
      const { data } = await api.put("/api/users/update-profile", payload);
      // Merge only the fields we edited, so populated campus/branch names are never overwritten
      const server = data.profile ?? data.existingUser ?? {};
      setProfile((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(payload)) next[key] = server[key] ?? payload[key];
        return next;
      });
      refreshUser?.().catch(() => {}); // navbar picks up the new name
      setEditing(false);
      setSaved(true);
    } catch (err) {
      console.error("Profile save error:", err);
      setSaveError(err.response?.data?.message || "Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return <ProfileSkeleton />;

  if (status === "error" || !profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-red-600">{loadError || "No profile data found."}</p>
        <button
          onClick={() => load()}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const name = titleCase(profile.name || "");
  const location = [profile.campus?.name, profile.branch?.name].filter(Boolean).join(" · ");
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-KE", { month: "long", year: "numeric" })
    : null;
  const missingPhone = !profile.phoneNumber;

  const fieldClass = (hasError) =>
    `w-full rounded-lg border p-3 text-base focus:outline-none focus:ring-2 sm:text-sm ${
      hasError ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-blue-500"
    }`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* ── Identity card ── */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-24 bg-linear-to-r from-blue-700 to-blue-500 sm:h-32" />
        <div className="px-5 pb-6 sm:flex sm:items-end sm:gap-6 sm:px-8">
          <div className="-mt-12 sm:-mt-14">
            <Avatar profile={profile} />
          </div>
          <div className="mt-3 min-w-0 flex-1 sm:mt-0 sm:pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="min-w-0 break-words text-xl font-bold text-slate-900 sm:text-2xl">{name || "Your profile"}</h1>
              {profile.isVerified && (
                <MdVerified className="h-5 w-5 text-blue-600" title="Verified" aria-label="Verified" />
              )}
              {profile.role === "admin" && (
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">Admin</span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {[location, memberSince && `Member since ${memberSince}`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="mt-4 flex gap-6 border-t border-slate-100 pt-4 sm:mt-0 sm:border-0 sm:pt-0 sm:pb-1">
            <div>
              <p className="text-2xl font-bold text-slate-900">{listingsStatus === "ready" ? listings.length : "–"}</p>
              <p className="text-xs text-slate-500">Listings</p>
            </div>
          </div>
        </div>
      </section>

      {saved && (
        <p role="status" className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
          Profile updated.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-[17rem_minmax(0,1fr)] md:items-start lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* ── Details (view / edit in place) ── */}
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Details</h2>
            {!editing && (
              <button
                type="button"
                onClick={startEdit}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:px-3 md:py-1.5"
              >
                Edit profile
              </button>
            )}
          </div>

          {!editing && missingPhone && (
            <div className="my-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Add your phone number so buyers can reach you.{" "}
              <button type="button" onClick={startEdit} className="font-semibold underline">Add it now</button>
            </div>
          )}

          {editing ? (
            <form
              onSubmit={handleSave}
              onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
              className="mt-3 space-y-4"
              noValidate
            >
              {EDITABLE_FIELDS.map((f, i) => {
                const id = `field-${f.key}`;
                const common = {
                  id,
                  name: f.key,
                  value: draft[f.key] ?? "",
                  placeholder: f.placeholder,
                  maxLength: f.maxLength ?? 30,
                  autoFocus: i === 0,
                  "aria-invalid": !!errors[f.key],
                  "aria-describedby": `${id}-msg`,
                  onChange: (e) => {
                    setDraft((d) => ({ ...d, [f.key]: e.target.value }));
                    setErrors((er) => ({ ...er, [f.key]: undefined }));
                  },
                  className: fieldClass(!!errors[f.key]),
                };
                return (
                  <div key={f.key}>
                    <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea rows={4} {...common} />
                    ) : (
                      <input type={f.type} inputMode={f.type === "tel" ? "tel" : undefined} autoComplete={f.type === "tel" ? "tel" : "off"} {...common} />
                    )}
                    {errors[f.key] ? (
                      <p id={`${id}-msg`} role="alert" className="mt-1 text-sm text-red-600">{errors[f.key]}</p>
                    ) : (
                      f.helper && <p id={`${id}-msg`} className="mt-1 text-xs text-slate-500">{f.helper}</p>
                    )}
                  </div>
                );
              })}

              {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 ${saving ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-slate-100">
              {EDITABLE_FIELDS.map((f) => {
                const value = profile[f.key];
                return (
                  <Row key={f.key} icon={f.icon} label={f.label}>
                    {value ? (
                      <span className={f.type === "textarea" ? "whitespace-pre-line" : ""}>
                        {f.format ? f.format(value) : value}
                      </span>
                    ) : (
                      <span className="text-slate-400">{f.emptyText}</span>
                    )}
                  </Row>
                );
              })}
              <Row icon={MdOutlineMail} label="Email" hint="Private. Buyers can't see your email.">
                {profile.email}
              </Row>
              {location && (
                <Row icon={MdOutlineSchool} label="Campus">
                  {location}
                </Row>
              )}
            </div>
          )}
        </section>

        {/* ── Listings ── */}
        <div className="min-w-0">
          <ListingsPreview status={listingsStatus} listings={listings} />
        </div>
      </div>
    </div>
  );
}

export default Profilepage;