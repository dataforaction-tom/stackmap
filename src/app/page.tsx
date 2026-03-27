import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex-1">
      {/* ── Hero ── */}
      <section className="bg-surface-50 pt-20 pb-24 sm:pt-32 sm:pb-36 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Large decorative number — background texture, not content */}
          <div
            className="absolute -top-8 -right-8 sm:-top-12 sm:-right-4 text-[12rem] sm:text-[20rem] font-display font-black text-primary-100/40 leading-none select-none pointer-events-none"
            aria-hidden="true"
          >
            ?
          </div>

          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold tracking-widest uppercase text-accent-600 mb-5">
              Free &amp; open source
            </p>
            <h1 className="text-hero font-display text-primary-950 mb-8 leading-[1.05]">
              Do you know what
              <br />
              technology your
              <br />
              organisation
              <br />
              actually uses?
            </h1>
            <p className="text-body-lg text-primary-700 max-w-xl mb-10 leading-relaxed">
              Most don&rsquo;t. Stackmap helps charities, social enterprises, and councils
              build a clear picture of their tech &mdash; systems, costs, risks, and who&rsquo;s
              responsible &mdash; in about an hour. No consultants needed.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/wizard"
                className="btn-primary text-base px-8 py-3.5 rounded-lg inline-flex items-center gap-2.5"
              >
                Start mapping your stack
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <span className="text-sm text-primary-500">
                Your data never leaves your browser.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── The problem — real stat, not a self-quote ── */}
      <section className="bg-primary-950 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
            <p className="text-display-lg font-display text-accent-400 whitespace-nowrap flex-shrink-0">
              54%
            </p>
            <div>
              <p className="text-body-lg text-primary-200 leading-relaxed">
                of councils already document their architecture &mdash; but use spreadsheets.
                They&rsquo;re limiting, hard to share, and impossible to aggregate.
                The same is true across the charity and voluntary sector, often worse.
              </p>
              <p className="text-sm text-primary-400 mt-3">
                GDS Local &ldquo;Sourcing the Stack&rdquo; initiative
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What you get — staggered, not a grid ── */}
      <section className="bg-surface-50 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-display-md font-display text-primary-900 mb-16 max-w-md">
            One afternoon. One clear map.
          </h2>

          <div className="space-y-16 sm:space-y-20">
            {/* Step 1 */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-start">
              <div className="flex-shrink-0">
                <span className="text-5xl sm:text-6xl font-display font-black text-primary-200">01</span>
              </div>
              <div className="max-w-lg">
                <h3 className="font-display text-xl font-semibold text-primary-900 mb-2">
                  Name what you do
                </h3>
                <p className="text-body text-primary-600 leading-relaxed">
                  Pick from common functions &mdash; finance, fundraising, service delivery &mdash; or
                  describe your own services. We give you a starting point so you&rsquo;re
                  never staring at a blank page.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-start sm:pl-16">
              <div className="flex-shrink-0">
                <span className="text-5xl sm:text-6xl font-display font-black text-primary-200">02</span>
              </div>
              <div className="max-w-lg">
                <h3 className="font-display text-xl font-semibold text-primary-900 mb-2">
                  Map your tools
                </h3>
                <p className="text-body text-primary-600 leading-relaxed">
                  For each area, tell us what software you use. We suggest common tools
                  based on your organisation type and size, complete with estimated costs.
                  Spreadsheets and manual processes count too.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-start sm:pl-32">
              <div className="flex-shrink-0">
                <span className="text-5xl sm:text-6xl font-display font-black text-primary-200">03</span>
              </div>
              <div className="max-w-lg">
                <h3 className="font-display text-xl font-semibold text-primary-900 mb-2">
                  See the full picture
                </h3>
                <p className="text-body text-primary-600 leading-relaxed">
                  Get a diagram of your architecture, a cost breakdown, and &mdash; if you
                  choose &mdash; a risk assessment of your technology dependencies. Export
                  everything to share with your board or funders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What makes this different — two-column, not three identical ── */}
      <section className="bg-surface-100 border-y border-surface-300 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div>
              <h2 className="text-display-md font-display text-primary-900 mb-8">
                Not another enterprise tool
              </h2>
              <p className="text-body text-primary-700 leading-relaxed mb-6">
                Commercial architecture tools cost thousands, require training, and are
                designed for organisations with dedicated architects. Stackmap is designed
                for a single person with operational knowledge to complete in an afternoon.
              </p>
              <ul className="space-y-3 text-body text-primary-700">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2.5 flex-shrink-0" aria-hidden="true" />
                  No account required &mdash; works entirely in your browser
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2.5 flex-shrink-0" aria-hidden="true" />
                  Plain language throughout &mdash; no TOGAF, no ArchiMate
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2.5 flex-shrink-0" aria-hidden="true" />
                  Captures reality &mdash; including &ldquo;Sarah exports it on Tuesdays&rdquo;
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center">
              <div className="bg-primary-950 rounded-xl p-8 text-primary-200 text-sm leading-relaxed space-y-4">
                <p className="text-primary-100 font-display font-semibold text-lg">
                  Built for
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent-400 flex-shrink-0" aria-hidden="true" />
                    Small charities with no IT team
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent-400 flex-shrink-0" aria-hidden="true" />
                    Social enterprises managing growth
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent-400 flex-shrink-0" aria-hidden="true" />
                    Councils planning LGR transitions
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent-400 flex-shrink-0" aria-hidden="true" />
                    Co-ops and community organisations
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent-400 flex-shrink-0" aria-hidden="true" />
                    Anyone who thinks &ldquo;we should probably document this&rdquo;
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA — not centered, not generic ── */}
      <section className="bg-surface-50 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-display-md font-display text-primary-900 mb-4">
              You probably already know more than you think.
            </h2>
            <p className="text-body-lg text-primary-600 mb-8 leading-relaxed">
              If you can name the software your organisation uses, you can map your
              architecture. Stackmap turns that knowledge into something you can share,
              analyse, and act on.
            </p>
            <Link
              href="/wizard"
              className="btn-primary text-base px-8 py-3.5 rounded-lg inline-flex items-center gap-2.5"
            >
              Start mapping
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
