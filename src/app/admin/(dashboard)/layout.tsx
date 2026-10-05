import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Protected admin shell. `requireAdmin()` redirects to the login page when
 * there is no valid session, so every route beneath this layout is guarded
 * server-side — the middleware is only an extra layer.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell user={{ name: session.name, email: session.email }}>{children}</AdminShell>;
}
