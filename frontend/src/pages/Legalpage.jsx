// Shared layout for text-heavy pages (Privacy Policy, Terms of Use).
// sections: [{ id, heading, paragraphs?: string[], items?: string[] }]

export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {updated}</p>
        {intro && <p className="mt-4 text-lg leading-relaxed text-slate-600">{intro}</p>}
      </header>

      <div className="mt-10 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
        {/* Contents: collapsible on phones, pinned on desktop */}
        <nav aria-label="On this page" className="mb-8 lg:mb-0">
          <details className="rounded-lg border border-slate-200 p-4 lg:sticky lg:top-6 lg:border-0 lg:p-0" open>
            <summary className="cursor-pointer font-semibold text-slate-900 lg:cursor-default lg:list-none">
              On this page
            </summary>
            <ol className="mt-3 space-y-2 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-slate-600 hover:text-blue-700 focus:outline-none focus-visible:underline"
                  >
                    {i + 1}. {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        </nav>

        <div className="max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {i + 1}. {s.heading}
              </h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-slate-700">{p}</p>
              ))}
              {s.items && (
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-700 marker:text-slate-400">
                  {s.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}