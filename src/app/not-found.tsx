import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  // Overrides the root layout's "index, follow" so it doesn't sit beside Next's noindex
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export default function NotFound() {
  return (
    <article className="relative bg-background z-10 w-full min-h-[105vh] rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden">
      <div className="wrapper mx-auto flex min-h-screen flex-col justify-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Error 404
        </p>
        <h1 className="bold-title mt-1 text-primary">Page not found</h1>
        <p className="mt-4 max-w-xl text-sm leading-loose text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
          Check the URL, or head back and pick up from somewhere familiar.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex h-11 w-fit items-center gap-1.5 border border-transparent bg-primary px-4 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/80"
        >
          ← Back home
        </Link>

        <nav aria-label="Other pages" className="mt-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Or try
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="header text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </article>
  );
}
