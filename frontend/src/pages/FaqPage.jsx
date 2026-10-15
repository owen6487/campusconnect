import { useState } from "react";
import { Link } from "react-router-dom";
import usePageMeta from "../Hooks/usePageMeta";

const faqs = [
  {
    q: "Is it free to post an item?",
    a: "Yes. You can post as many items as you like at no cost.",
  },
  {
    q: "Does Campus Connect handle payments?",
    a: "No. Buyers and sellers agree on the price and pay each other directly, in person. We never hold your money, so only pay once you've inspected the item.",
  },
  {
    q: "How do I contact a seller?",
    a: "Open the listing and tap Chat on WhatsApp. A message about the item is filled in for you, so you only need to press send.",
  },
  {
    q: "Can I buy from a student on another campus?",
    a: "You can browse every campus with the dropdown next to the search bar. Remember that you'll have to meet in person, so most buyers choose their own campus. Local businesses, student-run sellers, and nearby vendors are also allowed to list if they are serving students genuinely.",
  },
  {
    q: "Can a local business or nearby seller list on Campus Connect?",
    a: "Yes. Local businesses, nearby sellers, and legitimate vendors operating close to campuses are welcome to list items, housing, services, or other offers for students, as long as they are genuine, safe, and follow the platform rules.",
  },
  {
    q: "Can students or local people list housing or services?",
    a: "Yes. Housing, services, and related campus-area offers are allowed when they are real, legal, and clearly described. Students and nearby local providers can both use Campus Connect to connect with students.",
  },
  {
    q: "Can I sell a bike or other large item?",
    a: "Yes. Bikes, electrical items, furniture, and other larger essentials are all valid listings as long as the details are honest and the sale is arranged safely.",
  },
  {
    q: "How do I edit or delete my listing?",
    a: "Go to Account, then My listings. Each item has Edit and Delete buttons. Delete an item as soon as it sells.",
  },
  {
    q: "I forgot my password. What do I do?",
    a: "On the login page, choose Forgot password and enter your email. We'll send you a link that is valid for 15 minutes. If you signed up with Google, just use Continue with Google.",
  },
  {
    q: "How do I report a suspicious listing or user?",
    a: "Use the Contact Us details in the footer and include a link to the listing. Don't pay anyone you're unsure about while we look into it.",
  },
  {
    q: "What shouldn't I sell?",
    a: "Anything illegal, stolen, counterfeit or unsafe, including weapons, drugs and exam papers. Listings that break these rules are removed.",
  },
];

function Item({ id, q, a, open, onToggle }) {
  return (
    <div className="border-b border-slate-200">
      <h2>
        <button
          type="button"
          id={`faq-btn-${id}`}
          aria-expanded={open}
          aria-controls={`faq-panel-${id}`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-slate-900 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-lg"
        >
          <span>{q}</span>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          >
            <path d="m5 8 5 5 5-5" />
          </svg>
        </button>
      </h2>

      {/* grid-rows trick animates height without measuring it */}
      <div
        id={`faq-panel-${id}`}
        role="region"
        aria-labelledby={`faq-btn-${id}`}
        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-prose pb-5 leading-relaxed text-slate-600">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // first one open; click again to close

  usePageMeta({
    title: "Frequently asked questions",
    description: "Find quick answers about buying, selling, payments, and safety on Campus Connect.",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-lg text-slate-600">
        Quick answers about buying, selling and staying safe.
      </p>

      <div className="mt-8 border-t border-slate-200 sm:mt-10">
        {faqs.map((f, i) => (
          <Item
            key={f.q}
            id={i}
            q={f.q}
            a={f.a}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-slate-50 p-6 text-center sm:p-8">
        <p className="text-lg font-semibold text-slate-900">Still have a question?</p>
        <p className="mt-1 text-slate-600">We usually reply within a day.</p>
        <Link
          to="/contact"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}