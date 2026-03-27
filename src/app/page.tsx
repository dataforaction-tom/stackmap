import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero — asymmetric, text-led */}
      <section className="bg-surface-50 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Left: headline and CTA */}
            <div className="lg:col-span-3 max-w-2xl">
              <h1 className="text-hero font-display text-primary-900 mb-6">
                Map your technology
                <br />
                <span className="text-primary-600">in an afternoon</span>
              </h1>
              <p className="text-body-lg text-primary-700 mb-8 max-w-lg">
                A free, open-source tool that helps charities, social enterprises, and
                councils understand their technology landscape. No consultants. No
                technical expertise. Just honest answers about what you actually use.
              </p>
              <Link
                href="/wizard"
                className="btn-primary text-base px-8 py-3.5 rounded-lg inline-flex items-center gap-2"
              >
                Start mapping
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <p className="text-sm text-primary-500 mt-3">
                Takes 30-60 minutes. Your data stays on your device.
              </p>
            </div>

            {/* Right: decorative architecture sketch */}
            <div className="lg:col-span-2 hidden lg:block" aria-hidden="true">
              <div className="bg-surface-100 border-2 border-surface-300 rounded-xl p-6 space-y-4">
                {/* Mini diagram representation */}
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary-400" />
                  <div className="h-0.5 flex-1 bg-surface-300" />
                  <div className="w-3 h-3 rounded-full bg-accent-400" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['Finance', 'People', 'Comms'].map((label) => (
                    <div key={label} className="bg-surface-50 border border-surface-300 rounded-lg px-3 py-3 text-center">
                      <span className="text-xs font-medium text-primary-600">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="h-0.5 w-8 bg-surface-300" />
                  <div className="h-0.5 w-12 bg-primary-200" />
                  <div className="h-0.5 w-8 bg-surface-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Xero', 'Mailchimp', 'Salesforce', 'Google\u00a0Workspace'].map((label) => (
                    <div key={label} className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-2.5 text-center">
                      <span className="text-xs font-medium text-primary-700">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="h-0.5 w-6 bg-surface-300" />
                  <div className="h-0.5 w-10 bg-accent-200" />
                  <div className="h-0.5 w-6 bg-surface-300" />
                </div>
                <div className="bg-accent-50 border border-accent-200 rounded-lg px-3 py-2.5 text-center">
                  <span className="text-xs font-medium text-accent-700">Your architecture map</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sector context */}
      <section className="bg-surface-100 py-10 sm:py-14 border-y border-surface-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <figure className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <svg className="w-8 h-8 text-accent-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote>
              <p className="text-body-lg text-primary-800 font-medium leading-relaxed">
                Most social purpose organisations know they need to understand their technology
                better, but the process feels overwhelming. Stackmap makes it as simple as
                filling in a well-designed form.
              </p>
              <footer className="mt-3 text-sm text-primary-500">
                Built for the sector, by people who understand it
              </footer>
            </blockquote>
          </figure>
        </div>
      </section>

      {/* How it works — numbered journey, not a grid */}
      <section className="bg-surface-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-display-md font-display text-primary-900 mb-12">
            How it works
          </h2>

          <ol className="space-y-10 list-none p-0 m-0">
            {[
              {
                step: '1',
                title: 'Tell us what your organisation does',
                description:
                  'Select from common functions like finance, fundraising, and service delivery, or add your own. No jargon required.',
              },
              {
                step: '2',
                title: 'List the tools and systems you use',
                description:
                  'For each function, tell us what software, spreadsheets, or paper processes you rely on. We prompt you with common ones to jog your memory.',
              },
              {
                step: '3',
                title: 'See the full picture',
                description:
                  'Get a clear diagram of your technology architecture. Spot gaps, duplicates, and risks. Export it to share with your team or board.',
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-5 sm:gap-8 items-start">
                <span
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white font-display font-bold text-lg flex items-center justify-center"
                  aria-hidden="true"
                >
                  {item.step}
                </span>
                <div className="pt-0.5">
                  <h3 className="font-display text-lg font-semibold text-primary-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-body text-primary-600 leading-relaxed max-w-lg">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Principles — horizontal, not cards */}
      <section className="bg-primary-900 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-display-md font-display text-primary-100 mb-10">
            Built on principles that matter
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                title: 'Your data, your device',
                text: 'Nothing leaves your browser. No accounts, no servers, no tracking. Export everything as JSON anytime.',
              },
              {
                title: 'Open source, always',
                text: 'Free to use, free to adapt. Built for organisations that already stretch every pound.',
              },
              {
                title: 'Made for non-technical people',
                text: 'If you can fill in a form, you can map your architecture. Plain language throughout.',
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-lg font-semibold text-primary-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-primary-300 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-surface-100 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-display-md font-display text-primary-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-body-lg text-primary-600 mb-8 leading-relaxed">
            The whole process takes about an hour. You will have a clear technology
            map you can share with your team, your board, or your funder.
          </p>
          <Link
            href="/wizard"
            className="btn-primary text-base px-8 py-3.5 rounded-lg inline-flex items-center justify-center gap-2"
          >
            Start mapping
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
