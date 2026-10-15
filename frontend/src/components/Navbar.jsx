import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../apis";
import AccountsMenu from "./AccountsMenu";
import campusLogo from "../assets/logo.png";
 
const NAV_LINKS = [
    { to: "/about", label: "About" },
    { to: "/how-to-sell", label: "How to sell" },
    { to: "/how-to-buy", label: "How to buy" },
    { to: "/faq", label: "FAQ" },
];
 
const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [campuses, setCampuses] = useState([]);
    const [query, setQuery] = useState("");
 
    const [searchParams] = useSearchParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const navRef = useRef(null);
 
    const campus = searchParams.get("campus") || "";
 
    // ── load campuses once ──
    useEffect(() => {
        api
            .get("/api/campuses/all")
            .then((res) => setCampuses(res.data))
            .catch((err) => console.error("Error fetching campuses:", err));
    }, []);
 
    // ── keep the search box in sync with the URL ──
    useEffect(() => {
        setQuery(searchParams.get("query") || "");
    }, [searchParams]);
 
    // ── close the mobile menu on route change ──
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);
 
    // ── close the mobile menu on Escape or outside click ──
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        const onClick = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, [menuOpen]);
 
    // ── go to /search, carrying params with us ──
    // Keep existing filters only when we're already on /search.
    const goSearch = (updates) => {
        const params = new URLSearchParams(pathname === "/search" ? searchParams : "");
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        navigate(`/search?${params.toString()}`);
        setMenuOpen(false);
    };
 
    const handleSearch = (e) => {
        e.preventDefault();
        goSearch({ query: query.trim() });
    };
 
    const handleCampusChange = (e) => goSearch({ campus: e.target.value, branch: "" });
 
    const linkClass = ({ isActive }) =>
        `transition-colors hover:text-blue-700 ${isActive ? "text-blue-700 font-medium" : "text-gray-600"}`;
 
    return (
        <nav ref={navRef} className="sticky top-0 z-50 bg-white border-b border-gray-200">
            {/* ── MAIN ROW ──
                Mobile:  logo · [sell · account · menu] / search (full width below)
                Desktop: logo · search (stretches) · sell · account */}
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-x-3 gap-y-2 md:flex-nowrap md:gap-x-5">
                {/* Logo */}
                <Link to="/" aria-label="Campus Connect home" className="order-1 md:order-none flex items-center gap-2 sm:gap-3 shrink-0">
                    <img src={campusLogo} alt="Campus Connect" className="h-10 md:h-12 w-auto" />
                    <h1 className="text-base sm:text-lg md:text-xl font-bold leading-none tracking-tight">
                        <span className="text-blue-700">Campus</span>{" "}
                        <span className="text-orange-500">Connect</span>
                    </h1>
                </Link>

 
                {/* Search: campus + input in one group */}
                <form
                    onSubmit={handleSearch}
                    role="search"
                    className="order-3 md:order-none basis-full md:basis-auto md:flex-1 md:max-w-2xl md:mx-auto
                               flex items-stretch border border-gray-300 rounded-lg bg-white overflow-hidden
                               focus-within:ring-2 focus-within:ring-blue-700 focus-within:border-blue-700"
                >
                    <select
                        value={campus}
                        onChange={handleCampusChange}
                        aria-label="Filter by campus"
                        className="shrink-0 w-28 sm:w-44 text-xs sm:text-sm text-gray-700 bg-gray-50
                                   border-r border-gray-300 pl-2 pr-1 sm:px-3 py-2 truncate focus:outline-none"
                    >
                        <option value="">All campuses</option>
                        {campuses.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
 
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for items..."
                        aria-label="Search for items"
                        className="flex-1 min-w-0 px-3 py-2 text-sm bg-transparent focus:outline-none"
                    />
 
                    <button
                        type="submit"
                        aria-label="Search"
                        className="shrink-0 px-3 sm:px-4 bg-blue-700 text-white hover:bg-blue-800
                                   focus-visible:outline-none focus-visible:bg-blue-800"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                        </svg>
                    </button>
                </form>
 
                {/* Actions */}
                <div className="order-2 md:order-none ml-auto md:ml-0 flex items-center gap-2 md:gap-4 shrink-0">
                    <Link
                        to="/sell"
                        className="bg-orange-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium
                                   shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2
                                   focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                        + Sell
                    </Link>
 
                    <AccountsMenu />
 
                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        {menuOpen ? (
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
 
            {/* ── DESKTOP LINKS ── */}
            <div className="hidden md:block border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-6 text-sm">
                    {NAV_LINKS.map((l) => (
                        <NavLink key={l.to} to={l.to} className={linkClass}>
                            {l.label}
                        </NavLink>
                    ))}
                </div>
            </div>
 
            {/* ── MOBILE MENU: links only ── */}
            {menuOpen && (
                <div
                    id="mobile-menu"
                    className="md:hidden absolute top-full inset-x-0 bg-white border-t border-gray-100 shadow-lg px-4 py-2"
                >
                    <div className="flex flex-col text-sm">
                        {NAV_LINKS.map((l, i) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                className={({ isActive }) =>
                                    `py-3 ${i < NAV_LINKS.length - 1 ? "border-b border-gray-100" : ""} ${
                                        isActive ? "text-blue-700 font-medium" : "text-gray-700"
                                    }`
                                }
                            >
                                {l.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};
 
export default Navbar;