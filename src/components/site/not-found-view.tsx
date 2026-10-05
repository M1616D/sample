import { Compass, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/primitives";

/** Shared 404 body so the root and site-group not-found pages stay identical. */
export function NotFoundView() {
  return (
    <section className="section">
      <div className="container flex max-w-2xl flex-col items-center py-16 text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-accent-600">Error 404</p>
        <Compass className="mt-6 h-12 w-12 text-steel-300" aria-hidden />
        <h1 className="mt-6 text-3xl sm:text-4xl">This page could not be found</h1>
        <p className="prose-industrial mt-4">
          The page you are looking for may have been moved, renamed, or never existed. Use the links below to get back on
          track, or search the website.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="primary">
            <Home className="h-4 w-4" aria-hidden />
            Back to home
          </Button>
          <Button href="/products" variant="outline">
            Browse products
          </Button>
          <Button href="/search" variant="outline">
            <Search className="h-4 w-4" aria-hidden />
            Search
          </Button>
        </div>
      </div>
    </section>
  );
}
