
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} Quiet Hours &amp; Noise Rules. Data verified against public
          bylaws; always confirm with official city sources.
        </p>
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-4">
            <li>
              <Link className="hover:text-primary" href="/about">
                Editorial policy
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary" href="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
