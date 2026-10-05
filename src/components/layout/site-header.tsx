"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mail, Menu, Phone, Search, Send, X } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { primaryNav } from "@/config/navigation";
import { cn, telHref, telegramHref } from "@/lib/utils";

export interface HeaderSiteInfo {
  name: string;
  tagline: string;
  logo: string;
  phone: string;
  email: string;
  telegram: string;
  whatsapp: string;
}

/**
 * Site header.
 *
 * - Desktop: primary nav with click-to-open dropdowns, search, quote CTA.
 * - Mobile (< lg): condensed bar with a full-height drawer.
 * - The search control is a real GET form, so it works without JavaScript.
 * - Closes menus on route change, Escape and outside click.
 */
export function SiteHeader({ site }: { site: HeaderSiteInfo }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close everything on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setSearchOpen(false);
  }, [pathname]);

  // Escape + outside click handling for menus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenMenu(null);
      setSearchOpen(false);
      setMobileOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-steel-200 bg-white/95 backdrop-blur-sm">
      {/* Utility bar */}
      <div className="hidden bg-ink-900 text-steel-300 lg:block">
        <div className="container flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            {site.phone ? (
              <a href={telHref(site.phone)} className="inline-flex items-center gap-1.5 hover:text-white">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                <span>{site.phone}</span>
              </a>
            ) : null}
            {site.email ? (
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                <span>{site.email}</span>
              </a>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            {site.telegram ? (
              <a
                href={telegramHref(site.telegram)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white"
              >
                <Send className="h-3.5 w-3.5" aria-hidden />
                <span>Telegram</span>
              </a>
            ) : null}
            {site.whatsapp ? (
              <a
                href={`https://wa.me/${site.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                WhatsApp
              </a>
            ) : null}
            <Link href="/request-quote" className="font-semibold text-accent-400 hover:text-accent-300">
              Request a Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container" ref={navRef}>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Logo name={site.name} logoUrl={site.logo || undefined} />

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {primaryNav.map((group) => {
                const hasChildren = Boolean(group.children?.length);
                const active = isActive(group.href);
                return (
                  <li key={group.href} className="relative">
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
                        aria-expanded={openMenu === group.label}
                        aria-haspopup="true"
                        className={cn(
                          "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
                          active ? "text-ink-900" : "text-steel-600 hover:text-ink-900",
                        )}
                      >
                        {group.label}
                        <svg viewBox="0 0 10 6" className={cn("h-1.5 w-2.5 transition-transform", openMenu === group.label && "rotate-180")} aria-hidden>
                          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={group.href}
                        className={cn(
                          "block px-3 py-2 text-sm font-medium transition-colors",
                          active ? "text-ink-900" : "text-steel-600 hover:text-ink-900",
                        )}
                      >
                        {group.label}
                      </Link>
                    )}
                    {active ? (
                      <span aria-hidden className="absolute inset-x-3 -bottom-px h-0.5 bg-accent-600" />
                    ) : null}

                    {hasChildren && openMenu === group.label ? (
                      <div className="absolute left-0 top-full z-50 mt-1 w-72 border border-steel-200 bg-white p-1.5 shadow-raised">
                        <ul>
                          {group.children?.map((child) => (
                            <li key={child.href + child.label}>
                              <Link
                                href={child.href}
                                className="block px-3 py-2.5 transition-colors hover:bg-steel-50"
                              >
                                <span className="block text-sm font-medium text-ink-900">{child.label}</span>
                                {child.description ? (
                                  <span className="mt-0.5 block text-xs text-steel-500">{child.description}</span>
                                ) : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form action="/search" method="get" role="search" className="hidden items-center gap-2 lg:flex">
                <label htmlFor="header-search" className="sr-only">
                  Search products, machinery, services and projects
                </label>
                <input
                  id="header-search"
                  name="q"
                  type="search"
                  autoFocus
                  placeholder="Search catalogue…"
                  className="field w-56 py-2 text-sm"
                />
                <button type="submit" className="btn btn-dark btn-sm">
                  Search
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="hidden p-2 text-steel-500 transition-colors hover:text-ink-900 lg:block"
              >
                <Search className="h-5 w-5" aria-hidden />
              </button>
            )}

            <Link href="/request-quote" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Request a Quote
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="p-2 text-ink-900 lg:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Main menu">
          <div className="flex h-16 items-center justify-between border-b border-steel-200 px-4">
            <Logo name={site.name} logoUrl={site.logo || undefined} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 text-ink-900"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <form action="/search" method="get" role="search" className="mb-5">
              <label htmlFor="mobile-search" className="sr-only">
                Search
              </label>
              <div className="flex gap-2">
                <input id="mobile-search" name="q" type="search" placeholder="Search catalogue…" className="field" />
                <button type="submit" className="btn btn-dark btn-sm shrink-0" aria-label="Search">
                  <Search className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </form>

            <nav aria-label="Mobile">
              <ul className="divide-y divide-steel-200">
                {primaryNav.map((group) => (
                  <li key={group.href} className="py-1">
                    <Link href={group.href} className="block py-2.5 text-base font-semibold text-ink-900">
                      {group.label}
                    </Link>
                    {group.children?.length ? (
                      <ul className="mb-2 space-y-0.5 pl-3">
                        {group.children.map((child) => (
                          <li key={child.href + child.label}>
                            <Link href={child.href} className="block py-1.5 text-sm text-steel-600">
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6 space-y-2">
              <Link href="/request-quote" className="btn btn-primary w-full">
                Request a Quote
              </Link>
              {site.phone ? (
                <a href={telHref(site.phone)} className="btn btn-outline w-full">
                  <Phone className="h-4 w-4" aria-hidden />
                  Call {site.phone}
                </a>
              ) : null}
              {site.telegram ? (
                <a
                  href={telegramHref(site.telegram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline w-full"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Chat on Telegram
                </a>
              ) : null}
            </div>

            <div className="mt-6 border-t border-steel-200 pt-4 text-sm text-steel-500">
              <Link href="/faq" className="block py-1.5">
                FAQ
              </Link>
              <Link href="/privacy" className="block py-1.5">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block py-1.5">
                Terms of Business
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
