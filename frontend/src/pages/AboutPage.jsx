import usePageMeta from "../Hooks/usePageMeta";

export default function AboutPage() {
  usePageMeta({
    title: "About Campus Connect",
    description: "Campus Connect is a student-first marketplace for buying and selling items safely across Kenyan campuses.",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-600">About us</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Campus Connect brings students, student-run sellers, and local campus businesses together.
        </h1>

        <p className="mt-5 text-base leading-7 text-slate-600">
          Campus Connect was built for students and the businesses around them. It gives students a
          simpler, safer way to discover what they need on campus, whether that is a used item, a
          student-run service, a nearby bike, a room or housing option, or a local business selling
          useful products close to their school. We created a trusted marketplace organised by campus,
          branch, and category so students can find what they need quickly, while local sellers and
          nearby businesses also have a clear place to reach campus customers in a genuine and organised way.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-2xl font-bold text-slate-900">Built for campus life</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Discover student listings, student-run offers, local services, and nearby businesses around
              your university or college in one place.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-2xl font-bold text-slate-900">Safer by design</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              We encourage in-person meetings in public places, transparent communication, and sensible
              checks before every transaction.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-2xl font-bold text-slate-900">Made for students</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Whether you are buying used essentials, booking a service, searching for a bike, exploring
              housing options, or shopping from a trusted local seller nearby, Campus Connect helps you do
              it with less stress and more confidence.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-6 text-slate-600">
          <p>
            We believe campus commerce should be easy, transparent, and low-risk. Students should be able
            to buy a textbook, a phone accessory, a meal deal, a hostel essential, a bike, or a service
            without confusion or lost time. Campus Connect brings that convenience into one place.
          </p>

          <p>
            We also make room for local businesses, student-run sellers, and legitimate vendors near campuses
            who want to serve students with useful, affordable products, housing options, and services. If
            you run a nearby shop, side business, or student-led venture operating close to a campus, you
            can still reach students in a safe and structured way.
          </p>

          <p>
            From first-year essentials to graduation items, our goal is to help students discover what they
            need faster, meet safely, and keep transactions within a trusted campus community.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-sky-100 bg-sky-50 p-5 text-sm leading-7 text-slate-700">
          <p className="font-semibold text-sky-800">Why students use Campus Connect</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Find deals from students, student-run sellers, and trusted local businesses around campus.</li>
            <li>List products, housing, services, or bikes quickly with clear descriptions and photos.</li>
            <li>Connect directly with buyers and sellers in a familiar student community.</li>
            <li>Build trust with safer local meetups and transparent communication.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
