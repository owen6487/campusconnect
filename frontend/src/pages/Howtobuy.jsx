import { Link } from "react-router-dom";
import usePageMeta from "../Hooks/usePageMeta";

const steps = [
  {
    title: "Find what you need",
    body: "Use the search bar and pick your campus from the dropdown, so you only see items you can collect easily. Not sure what to type? Browse by category.",
  },
  {
    title: "Check the listing properly",
    body: "Go through every photo, read the description, and note the price and where the item is. If anything is unclear, ask the seller for more photos before you travel anywhere.",
  },
  {
    title: "Contact the seller",
    body: "Tap Chat on WhatsApp on the listing. Confirm the item is still available, agree on the price, then settle on a time and place to meet.",
  },
  {
    title: "Meet on campus",
    body: "Choose a busy, well-lit spot such as the library entrance, a cafeteria or the main gate. Tell a friend where you're going, or bring one along.",
  },
  {
    title: "Inspect, then pay",
    body: "Test the item before any money changes hands. Pay only when you're happy with it, with M-Pesa or cash, in person.",
  },
];

export default function HowToBuy() {
  usePageMeta({
    title: "How to buy on Campus Connect",
    description: "Learn how to safely buy second-hand items from students on campus, from searching to meeting and paying in person.",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        How to buy on Campus Connect
      </h1>
      <p className="mt-3 max-w-prose text-lg text-slate-600">
        Buying from another student takes five steps, from finding the item to
        handing over the money. Follow them in order and you'll avoid most
        problems.
      </p>

      <ol className="mt-10 sm:mt-12">
        {steps.map((step, i) => (
          <li key={step.title} className="relative pb-10 pl-14 last:pb-0 sm:pl-16">
            {/* connecting line */}
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-5 top-11 bottom-1 w-px bg-slate-200 sm:left-6 sm:top-12"
              />
            )}
            <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white sm:h-12 sm:w-12 sm:text-lg">
              {i + 1}
            </span>
            <h2 className="pt-1.5 text-lg font-semibold text-slate-900 sm:pt-2.5 sm:text-xl">
              {step.title}
            </h2>
            <p className="mt-1.5 max-w-prose leading-relaxed text-slate-600">{step.body}</p>
          </li>
        ))}
      </ol>

      <div
        role="note"
        className="mt-12 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950"
      >
        <p className="font-semibold">Never send money before you've seen the item.</p>
        <p className="mt-1 text-sm leading-relaxed sm:text-base">
          A seller who asks for a deposit or "transport fee" up front is a red
          flag. Walk away and report the listing through Contact Us.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Browse items
        </Link>
        <Link
          to="/faq"
          className="rounded-lg border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Read the FAQ
        </Link>
      </div>
    </div>
  );
}