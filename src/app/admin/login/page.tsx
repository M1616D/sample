import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Factory, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";
import { Notice } from "@/components/ui/primitives";
import { getSession } from "@/server/auth";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  // Already signed in? Skip the form.
  const session = await getSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const [settings] = await Promise.all([getSettings()]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center border border-accent-600 text-accent-500">
            <Factory className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold leading-tight">{settings.company.name}</p>
            <p className="text-xs text-steel-400">Content management</p>
          </div>
        </div>

        <div className="border border-steel-800 bg-white p-6 shadow-raised sm:p-8">
          <h1 className="text-xl">Sign in</h1>
          <p className="mt-1.5 text-sm text-steel-600">Authorised staff only. Sessions expire automatically.</p>

          {params.reason === "auth" ? (
            <Notice tone="warning" className="mt-5">
              Your session has ended or you are not signed in. Please sign in to continue.
            </Notice>
          ) : null}

          <div className="mt-6">
            <LoginForm />
          </div>

          <p className="mt-6 flex items-start gap-2 border-t border-steel-100 pt-5 text-xs text-steel-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel-400" aria-hidden />
            <span>
              Credentials are created by the site administrator (see the project README for first-run setup). Passwords are
              stored only as bcrypt hashes.
            </span>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-steel-500">
          <Link href="/" className="hover:text-white">
            ← Back to the public website
          </Link>
        </p>
      </div>
    </div>
  );
}
