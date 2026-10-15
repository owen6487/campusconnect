import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const CONTACT = {
  email: "support@campusconnect.co.ke",
  phone: "+254 703392536",
  whatsapp: "254736259713",
};

const getSupportMailto = (subject = "Campus Connect support") => {
  const body = "Hi Campus Connect team,\n\nI need help with the following:\n\n";
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const columns = [
  {
    title: "Quick Links",
    links: [
      { to: "/", label: "Browse items" },
      { to: "/sell", label: "Post an item" },
      { to: "/how-to-buy", label: "How to buy" },
      { to: "/how-to-sell", label: "How to sell" },
      { to: "/about", label: "About us" },
    ],
  },
  {
    title: "Safety & Help",
    links: [
      { to: "/safety-tips", label: "Safety Tips" },
      { to: "/faq", label: "FAQ" },
      { to: "/contact", label: "Contact" },
      { to: "/feedback", label: "Feedback" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Use" },
    ],
  },
];

const linkClass =
  "inline-block py-0.5 text-slate-300 hover:text-white focus:outline-none focus-visible:underline";

export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Campus Connect" className="h-10 w-auto" />
              <p className="text-lg font-bold leading-none tracking-tight">
                <span className="text-blue-700">Campus</span>{" "}
                <span className="text-orange-500">Connect</span>
              </p>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              Buy and sell with students on your campus. Meet safely, pay in person.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-base font-semibold text-white">{col.title}</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className={linkClass}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-800 pt-8">
          <div>
            <h2 className="text-base font-semibold text-white">Contact Us</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8 lg:flex-col">
              <li>
                <a href={getSupportMailto()} className={`${linkClass} break-all`}>{CONTACT.email}</a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className={linkClass}>{CONTACT.phone}</a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Message us on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Campus Connect. All rights reserved.</p>
          <p>Made by students, for students.</p>
        </div>
      </div>
    </footer>
  );
}