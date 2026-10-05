import type { Metadata } from "next";

import { NotFoundView } from "@/components/site/not-found-view";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main id="main" className="flex-1">
        <NotFoundView />
      </main>
    </div>
  );
}
