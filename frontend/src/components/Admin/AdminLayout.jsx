import { NavLink, Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import usePageMeta from "../../Hooks/usePageMeta";

const nav = [
  {
    to: "/admin",
    label: "Dashboard",
    end: true,
    icon: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </>
    ),
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
      </>
    ),
  },
  {
    to: "/admin/listings",
    label: "Listings",
    icon: (
      <>
        <path d="M3 12V4h8l10 10-8 8L3 12Z" />
        <circle cx="7.5" cy="8.5" r="1.2" />
      </>
    ),
  },
  {
    to: "/admin/campusmanager",
    label: "Campus Manager",
    icon: (
      <>
        <path d="M3 10.5 12 4l9 6.5" />
        <path d="M5 9.5V18h14v-8.5" />
        <path d="M9 18v-6h6v6" />
      </>
    ),
  },
  {
    to: "/admin/feedback",
    label: "Feedback",
    icon: (
      <>
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
        <path d="M8.5 11h7M8.5 14h4" />
      </>
    ),
  },
];

const Icon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {children}
  </svg>
);

// The admin area is its own "shell": no site navbar, no footer.
// This component also guards the whole section. The server enforces the same rule.
export default function AdminLayout() {
  usePageMeta({ title: "Admin", noindex: true, description: "Campus Connect admin dashboard." });
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="grid min-h-dvh place-items-center text-slate-500">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-dvh bg-slate-50 text-slate-900">
      {/* Sidebar: tablets and up */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:sticky md:top-0 md:flex md:h-dvh">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-lg font-bold">Campus Connect</p>
          <p className="text-xs font-medium text-blue-600">Admin</p>
        </div>

        <nav aria-label="Admin" className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon>{item.icon}</Icon>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-slate-200 p-4 text-sm">
          <p className="truncate font-medium text-slate-900">{user.name}</p>
          <Link to="/" className="block text-slate-600 hover:underline">Back to site</Link>
          <button onClick={handleLogout} className="text-red-600 hover:underline">Log out</button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar: phones only */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <p className="font-bold">Admin</p>
          <div className="flex items-center gap-5 text-sm">
            <Link to="/" className="text-slate-600">Site</Link>
            <button onClick={handleLogout} className="text-red-600">Log out</button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom tabs: phones only */}
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                isActive ? "text-blue-600" : "text-slate-500"
              }`
            }
          >
            <Icon>{item.icon}</Icon>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
