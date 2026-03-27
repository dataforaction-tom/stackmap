import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-primary-950 text-primary-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="text-white font-display text-lg font-semibold mb-2">Stackmap</p>
            <p className="text-sm text-primary-300 leading-relaxed">
              Lightweight architecture mapping for social purpose organisations.
              Open source and free to use.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">Navigate</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/wizard" className="hover:text-white transition-colors">
                  Wizard
                </Link>
              </li>
              <li>
                <Link href="/view/diagram" className="hover:text-white transition-colors">
                  Diagram
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">About</p>
            <p className="text-sm text-primary-300 leading-relaxed">
              Stackmap helps charities, social enterprises, co-operatives, councils, and
              businesses understand their technology landscape.
            </p>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-300">
          <p>
            Built by{' '}
            <a
              href="https://good-ship.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 hover:text-white transition-colors underline underline-offset-2"
            >
              The Good Ship
            </a>
            {' '}and{' '}
            <a
              href="https://tomcw.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 hover:text-white transition-colors underline underline-offset-2"
            >
              tomcw.xyz
            </a>
          </p>
          <p>
            Released under the{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 hover:text-white transition-colors underline underline-offset-2"
            >
              MIT License
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
