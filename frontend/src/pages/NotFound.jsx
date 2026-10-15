import { Link } from "react-router-dom";
import usePageMeta from "../Hooks/usePageMeta";

export default function NotFound() {
  usePageMeta({
    title: "Page not found",
    noindex: true,
    description: "The page you requested could not be found on Campus Connect.",
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-600">404</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        The link may be broken or the page may have moved. Head back to the homepage to keep browsing listings.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Go home
      </Link>
    </div>
  );
}
