import { Link } from "react-router-dom";
import usePageMeta from "../Hooks/usePageMeta";

const buyerTips = [
  "Meet in a busy, well-lit place on campus, such as the library entrance or cafeteria.",
  "Go in daylight where you can, and tell a friend where you're going and who you're meeting.",
  "Inspect the item properly. Switch on electronics, check for damage, and ask to see proof of ownership for expensive items.",
  "Pay only after you're happy with the item, in person.",
  "Compare the price with similar listings. A price that is far too low is a warning sign.",
];

const sellerTips = [
  "Never hand over the item until you've been paid. Check that M-Pesa payments have actually arrived in your account, not just a screenshot or message.",
  "Meet on campus in a public place, and bring a friend for high-value items.",
  "Share only the contact details on your listing. Keep your hostel room and other personal details private.",
  "Don't send the item with a stranger or a courier before payment.",
  "Delete the listing once the item is sold.",
];

const redFlags = [
  "Asks you to pay a deposit, delivery or \"booking\" fee before you've seen the item.",
  "Refuses to meet on campus or wants to meet somewhere isolated.",
  "Pushes you to decide fast, or says other buyers are about to take it.",
  "Sends a payment message or screenshot but you haven't received money.",
  "Won't answer simple questions or send extra photos.",
];

const Check = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="mt-1 h-4 w-4 shrink-0 text-green-600" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
      clipRule="evenodd"
    />
  </svg>
);

function TipList({ title, tips }) {
  return (
    <section className="rounded-xl border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <ul className="mt-4 space-y-3 text-slate-700">
        {tips.map((t) => (
          <li key={t} className="flex gap-3 leading-relaxed">
            <Check />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SafetyTips() {
  usePageMeta({
    title: "Safety tips",
    description: "Learn how to meet safely, avoid scams, and protect yourself when buying or selling on campus.",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Safety tips</h1>
        <p className="mt-3 text-lg text-slate-600">
          Most deals go smoothly. These habits keep it that way, whether you're buying or selling.
        </p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <TipList title="If you're buying" tips={buyerTips} />
        <TipList title="If you're selling" tips={sellerTips} />
      </div>

      <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-semibold">Red flags: walk away if you see these</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed marker:text-amber-500">
          {redFlags.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </section>

      <section className="mt-6 rounded-xl bg-slate-50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">If something goes wrong</h2>
        <p className="mt-2 max-w-prose leading-relaxed text-slate-700">
          If you feel unsafe, leave and go to a busy place, your campus security office, or report to
          the nearest police station. If you've been scammed or met a suspicious user, report the
          listing to us with a link and what happened, so we can remove it and protect other students.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/contact"
            className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Report a problem
          </Link>
          <Link
            to="/faq"
            className="rounded-lg border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Read the FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}