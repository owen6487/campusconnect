import { Link } from "react-router-dom";
import usePageMeta from "../Hooks/usePageMeta";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-8 w-8",
  "aria-hidden": "true",
};

const CameraIcon = () => (
  <svg {...iconProps}>
    <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

const PostIcon = () => (
  <svg {...iconProps}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const ChatIcon = () => (
  <svg {...iconProps}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </svg>
);

const CashIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6.5 9.5v.01M17.5 14.5v.01" />
  </svg>
);

const steps = [
  {
    Icon: CameraIcon,
    title: "Take clear photos",
    body: "Shoot in daylight against a plain background. Show every side and any scratches or marks.",
  },
  {
    Icon: PostIcon,
    title: "Post your item",
    body: "Tap Sell, add your photos, then write a plain title, an honest description and a fair price.",
  },
  {
    Icon: ChatIcon,
    title: "Reply to buyers",
    body: "Buyers contact you on WhatsApp. Answer quickly and confirm the item is still available.",
  },
  {
    Icon: CashIcon,
    title: "Meet and get paid",
    body: "Meet in a public spot on campus. Hand over the item once you've been paid, then delete the listing.",
  },
];

const tips = [
  "Use the price you'll actually accept. Buyers skip listings that look inflated.",
  "Mention flaws up front. It saves time and avoids arguments at the meet-up.",
  "Delete sold items from My listings so buyers don't keep messaging you.",
];

export default function HowToSell() {
  usePageMeta({
    title: "How to sell on Campus Connect",
    description: "Post your item in minutes, add photos, chat with buyers, and meet safely on campus to sell quickly.",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          How to sell on Campus Connect
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          From a photo to cash in hand in four steps. Most listings take under
          five minutes to post.
        </p>
      </div>

      <ol className="mt-10 grid gap-10 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {steps.map(({ Icon, title, body }, i) => (
          <li key={title} className="relative">
            {/* connector to the next step (desktop only) */}
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[4.5rem] top-8 -right-6 hidden h-px bg-slate-200 lg:block"
              />
            )}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Icon />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              {i + 1}. {title}
            </h2>
            <p className="mt-1.5 leading-relaxed text-slate-600">{body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-14 rounded-xl bg-slate-50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Tips for a faster sale</h2>
        <ul className="mt-4 space-y-3 text-slate-700">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-3">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mt-1 h-4 w-4 shrink-0 text-green-600"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <Link
          to="/sell"
          className="inline-block w-full rounded-lg bg-orange-500 px-6 py-3 text-center font-semibold text-white hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:w-auto"
        >
          Post an item
        </Link>
      </div>
    </div>
  );
}