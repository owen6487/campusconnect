import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../apis";
import usePageMeta from "../Hooks/usePageMeta";
import { getImageUrl, useFallback as onImgError } from "../utils/imageUrl";

const formatPrice = (p) => `KSh ${Number(p || 0).toLocaleString()}`;
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "";

function ListingCard({ listing, onDelete, onEdit, deleting }) {
  const images = Array.isArray(listing.images) ? listing.images : [];
  const location = [listing.campus?.name, listing.branch?.name].filter(Boolean).join(" · ");

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:shadow-md ${
        deleting ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {/* Whole top part is one link to the listing */}
      <Link to={`/product/${listing._id}`} className="block">
        <div className="relative aspect-[4/3] bg-slate-100">
          <img
            src={getImageUrl(images[0] ?? null)}
            alt={listing.name}
            onError={onImgError}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {images.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded bg-black/65 px-1.5 py-0.5 text-[11px] font-medium text-white">
              {images.length} photos
            </span>
          )}
        </div>

        <div className="space-y-1 p-3">
          <p className="text-base font-bold text-slate-900 sm:text-lg">{formatPrice(listing.price)}</p>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-700">{listing.name}</h3>
          <div className="flex items-center justify-between gap-2 pt-1 text-xs text-slate-500">
            <span className="truncate">{listing.category || "General"}</span>
            <span className="shrink-0">{formatDate(listing.createdAt)}</span>
          </div>
          {location && <p className="truncate text-xs text-slate-400">{location}</p>}
        </div>
      </Link>

      {/* Owner actions (outside the link so they don't navigate) */}
      <div className="mt-auto flex gap-2 border-t border-slate-100 p-2">
        <button
          type="button"
          onClick={() => onEdit(listing)}
          className="flex-1 rounded-md border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:text-sm"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(listing._id)}
          disabled={deleting}
          className="flex-1 rounded-md border border-red-200 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 sm:text-sm"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

function Mylistings() {
  usePageMeta({ title: "My listings", noindex: true, description: "Review, edit or delete the items you've posted on Campus Connect." });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const fetchListings = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/api/products/mylistings", { signal });
      setListings(data);
    } catch (err) {
      if (err.code === "ERR_CANCELED") return; // component left the page
      console.error("Fetch listings error:", err);
      setError(err.response?.data?.message || "Failed to load your listings");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchListings(controller.signal);
    return () => controller.abort();
  }, [fetchListings]);

  const handleEdit = (listing) => navigate(`/updatelistings/${listing._id}`, { state: { listing } });

  const handleDelete = async (id) => {
    if (deletingId) return;
    if (!window.confirm("Delete this listing? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/products/delete/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete the listing");
    } finally {
      setDeletingId(null);
    }
  };

  const visible = listings.filter((l) => l.name?.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">My listings</h1>
          {!loading && !error && (
            <p className="text-sm text-slate-500">
              {listings.length} {listings.length === 1 ? "item" : "items"}
            </p>
          )}
        </div>
        <Link
          to="/sell"
          className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          + New listing
        </Link>
      </div>

      {listings.length > 4 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your listings"
          className="mb-4 w-full rounded-lg border border-slate-300 p-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 sm:max-w-sm sm:text-sm"
        />
      )}

      {/* States */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchListings()}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center">
          <p className="mb-4 text-slate-600">You haven't posted anything yet.</p>
          <Link
            to="/sell"
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            + Post your first item
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-slate-500">No listings match "{query}".</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onDelete={handleDelete}
              onEdit={handleEdit}
              deleting={deletingId === listing._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Mylistings;