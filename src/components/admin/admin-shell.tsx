"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ChevronRight,
  ExternalLink,
  FileText,
  Factory,
  Gauge,
  HelpCircle,
  Home,
  Images,
  LayoutList,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { logoutAction } from "@/server/actions/admin";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  icon: ReactNode;
}

const navGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Overview",
    links: [{ href: "/admin", label: "Dashboard", icon: <Gauge className="h-4 w-4" aria-hidden /> }],
  },
  {
    title: "Leads & CRM",
    links: [
      { href: "/admin/quotes", label: "Quote requests", icon: <FileText className="h-4 w-4" aria-hidden /> },
      { href: "/admin/service-requests", label: "Service requests", icon: <Wrench className="h-4 w-4" aria-hidden /> },
      { href: "/admin/messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" aria-hidden /> },
      { href: "/admin/customers", label: "Customers", icon: <Users className="h-4 w-4" aria-hidden /> },
    ],
  },
  {
    title: "Catalogue",
    links: [
      { href: "/admin/products", label: "Products & machinery", icon: <Package className="h-4 w-4" aria-hidden /> },
      { href: "/admin/categories", label: "Categories", icon: <LayoutList className="h-4 w-4" aria-hidden /> },
      { href: "/admin/spare-parts", label: "Spare parts", icon: <Factory className="h-4 w-4" aria-hidden /> },
    ],
  },
  {
    title: "Content",
    links: [
      { href: "/admin/services", label: "Services", icon: <Wrench className="h-4 w-4" aria-hidden /> },
      { href: "/admin/capabilities", label: "Capabilities", icon: <Factory className="h-4 w-4" aria-hidden /> },
      { href: "/admin/projects", label: "Projects", icon: <FileText className="h-4 w-4" aria-hidden /> },
      { href: "/admin/news", label: "News", icon: <FileText className="h-4 w-4" aria-hidden /> },
      { href: "/admin/faqs", label: "FAQs", icon: <HelpCircle className="h-4 w-4" aria-hidden /> },
      { href: "/admin/team", label: "Team", icon: <Users className="h-4 w-4" aria-hidden /> },
    ],
  },
  {
    title: "System",
    links: [
      { href: "/admin/media", label: "Media library", icon: <Images className="h-4 w-4" aria-hidden /> },
      { href: "/admin/settings", label: "Settings", icon: <Settings className="h-4 w-4" aria-hidden /> },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ user, children }: { user: { name: string; email: string }; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
      <div className="flex items-center justify-between gap-2 px-2">
        <Link href="/admin" className="flex items-center gap-2 font-semibold tracking-tight text-white">
          <span className="flex h-7 w-7 items-center justify-center border border-accent-600 text-accent-500">
            <Factory className="h-4 w-4" aria-hidden />
          </span>
          Admin
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="p-1 text-steel-400 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="px-2 text-2xs font-semibold uppercase tracking-wider text-steel-500">{group.title}</p>
          <ul className="mt-2 space-y-0.5">
            {group.links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 border-l-2 px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "border-accent-500 bg-white/10 font-medium text-white"
                        : "border-transparent text-steel-300 hover:border-steel-600 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {link.icon}
                    <span className="flex-1">{link.label}</span>
                    {active ? <ChevronRight className="h-3.5 w-3.5 text-accent-500" aria-hidden /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-auto space-y-2 border-t border-white/10 px-2 pt-4">
        <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-steel-400 hover:text-white">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          View public site
        </Link>
        <Link href="/" className="flex items-center gap-2 text-xs text-steel-400 hover:text-white">
          <Home className="h-3.5 w-3.5" aria-hidden />
          Homepage
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-steel-100 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-ink-950 lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute left-0 top-0 h-full w-72 bg-ink-950 shadow-raised">{sidebar}</aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-steel-200 bg-white px-4 py-3 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-steel-600 hover:text-ink-900 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{user.name || user.email}</p>
            <p className="truncate text-xs text-steel-500">{user.email}</p>
          </div>
          <Link href="/request-quote" className="hidden text-xs text-steel-500 hover:text-ink-900 sm:inline">
            Public enquiry form
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-outline btn-sm">
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </form>
        </header>

        <main id="main" className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
