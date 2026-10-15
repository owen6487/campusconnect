
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../apis";
import useListings from "../Hooks/uselisting";
import ProductGrid from "./ProductGrid";
import InviteBanner from "./InvitefBanner";
 
const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];
 
export default function HomeListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, hasMore, loading, loadMore } = useListings();
  const [categories, setCategories] = useState([]);
 
  // The address bar is the one source of truth for the sort choice. Before, a copy lived in state
  // too, and the Back button could leave the dropdown showing something different from the list.
  const urlSort = searchParams.get("sort");
  const sort = SORTS.some((s) => s.value === urlSort) ? urlSort : "newest";
 
  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/api/products/categories", { signal: controller.signal })
      .then(({ data }) => setCategories(data || []))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") console.error("Error fetching categories:", err);
      });
    return () => controller.abort();
  }, []);
 
  const handleSortChange = (e) => {
    const next = new URLSearchParams(searchParams);
    next.set("sort", e.target.value);
    setSearchParams(next);
  };
 
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <InviteBanner />
 
      {/* Real links to real pages: this is how Google (and people) get from here to each category */}
      {categories.length > 0 && (
        <nav aria-label="Categories" className="mb-4 mt-1 flex gap-2 overflow-x-auto pb-3">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/search?category=${encodeURIComponent(c.name)}`}
              className="shrink-0 rounded-full border px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              {c.name} <span className="text-gray-400">({c.count})</span>
            </Link>
          ))}
        </nav>
      )}
 
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {/* The ONE h1 on the home page. The Hero slides use h2. */}
          <h1 className="text-xl font-bold sm:text-2xl">Latest listings from students on your campus</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Textbooks, electronics, hostel essentials and more. Chat with the seller on WhatsApp, meet on
            campus and pay in person.
          </p>
        </div>
 
        <select
          value={sort}
          onChange={handleSortChange}
          aria-label="Sort listings"
          className="rounded-lg border px-3 py-2 text-base text-gray-700 sm:py-1.5 sm:text-sm"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
 
      <ProductGrid products={products} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
    </div>
  );
}