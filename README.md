# Industrial Works — Manufacturing & Machinery Platform

A complete website and content-management system for an industrial manufacturing and
machinery business: a public marketing and catalogue site, a quotation and service-request
system, and a password-protected admin panel that runs the whole thing.

The application is built to be **given to a real company to operate**. All business content —
names, contact details, products, projects, articles, statistics — is placeholder text that an
administrator replaces through the admin panel. Nothing on the site asserts a credential, client
count, certification or statistic unless an administrator has entered it.

---

## Table of contents

- [What's included](#whats-included)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [npm scripts](#npm-scripts)
- [The public website](#the-public-website)
- [The admin panel](#the-admin-panel)
- [Security](#security)
- [Database & portability](#database--portability)
- [SEO](#seo)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Content policy](#content-policy)

---

## What's included

**Public site**

- Home, About, Products, Machinery, Spare Parts, Services, Capabilities, Projects,
  Company Profile, Contact, Request a Quote, Service Request, FAQ, News, Search,
  Privacy, Terms, and a custom 404.
- Filterable, sortable, paginated product catalogue and a separate machinery catalogue.
- Product detail pages with gallery, technical specifications, features, applications,
  models and related items.
- A QR page per product/machine for sharing a link on a printed datasheet or machine plate.
- Blog / news with article pages.
- Print-ready Company Profile (use **Print / Save as PDF** — no extra dependency).
- Sitemap, robots.txt and structured data for search engines.

**Enquiry systems**

- **Quote request** — captures requirement, quantity, timeline, location, preferred contact
  method and an optional attachment link; issues a human-friendly reference (e.g. `QT-8F3K2A`).
- **Contact message** — general enquiries.
- **Service request** — machine faults and maintenance, with serial number, problem summary,
  photo links and a reference (e.g. `SR-...`).
- All three are validated with the same schema on the client and server, and protected by a
  honeypot field.
- Optional best-effort **Telegram notification** of new quote requests.

**Admin panel**

- Dashboard with catalogue, lead and pipeline counts plus recent enquiries.
- Full create / edit / delete for products & machinery, categories, spare parts, services,
  capabilities, projects, news, FAQs, team members, media assets and customers.
- Quote CRM: filter by status, search, per-lead status / assignee / internal notes.
- Service-request workflow: status, assignee, internal notes.
- Contact messages with inline status control.
- Company, homepage, social and SEO settings.

---

## Tech stack

| Area | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | Server Components + Server Actions |
| UI | React 19, TypeScript (strict) | No client-side framework debt |
| Styling | Tailwind CSS 3.4 | Design tokens, no gradients/glassmorphism |
| Database | Prisma 6 + SQLite | Portable to PostgreSQL (see below) |
| Auth | bcrypt + signed cookie | Stateless HMAC session |
| Validation | Zod | One schema shared by client and server |
| Icons | lucide-react | |
| QR codes | qrcode | |
| Runtime scripts | tsx | For the database seed |

Everything is free and open source; there is no paid service in the critical path.

---

## Getting started

Requirements: **Node.js 20+** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file from the template and edit it
cp .env.example .env
#    - set SESSION_SECRET to a long random string
#    - set the SEED_ADMIN_* credentials you want to sign in with

# 3. Create the database, generate the client and load sample content
npm run setup        # prisma generate + prisma db push + seed

# 4. Start developing
npm run dev          # http://localhost:3000
```

Sign in to the admin panel at **`/admin/login`** using the `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` you configured.

> Generate a strong secret with:
> `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

---

## Environment variables

All variables are documented in [`.env.example`](.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` for SQLite, or a PostgreSQL connection string |
| `SESSION_SECRET` | yes | Signs admin session cookies. **Must** be long and random in production |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical origin used for metadata, sitemap and absolute links |
| `SEED_ADMIN_EMAIL` | seeding | Email of the admin account created by the seed |
| `SEED_ADMIN_PASSWORD` | seeding | Password for that account (bcrypt-hashed at seed time) |
| `SEED_ADMIN_NAME` | seeding | Display name for that account |
| `TELEGRAM_BOT_TOKEN` | optional | Enables Telegram notifications for new enquiries |
| `TELEGRAM_CHAT_ID` | optional | Destination chat for those notifications |

`.env` is git-ignored. `.env.example` contains placeholders only and **is** committed.

---

## npm scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Start the production server |
| `npm run lint` | Next.js lint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run setup` | Generate client, push schema, seed |
| `npm run db:push` | Apply the schema to the database |
| `npm run db:seed` | Load sample content (idempotent — upserts by slug) |
| `npm run db:reset` | **Destructive.** Reset the database and re-seed |

---

## The public website

- **`/products`** and **`/machinery`** share one catalogue component (filters, sort,
  pagination) but query different `kind` values.
- **`/products/[slug]`** and **`/machinery/[slug]`** render the full technical record;
  **`…/qr`** renders a printable QR page for that item.
- **`/search`** searches products, machinery, spare parts, services, projects and news in one
  request and groups the results.
- **`/request-quote`**, **`/contact`** and **`/service-request`** submit through server actions.

Content is read through server-side data modules that **degrade gracefully**: if the database is
unavailable, a page renders an empty state instead of a 500 error.

---

## The admin panel

Everything is served from `/admin`. The panel is driven by a small **resource registry**
(`src/lib/admin-resources.ts`) rather than hand-written pages per model: the list view, the
create/edit form and the server action all read the same definition, so adding a field to a model
is a one-line change.

Routes:

- `/admin` — dashboard
- `/admin/products`, `/admin/categories`, `/admin/spare-parts`
- `/admin/services`, `/admin/capabilities`, `/admin/projects`, `/admin/news`, `/admin/faqs`, `/admin/team`
- `/admin/media`, `/admin/customers`
- `/admin/quotes`, `/admin/quotes/[id]` — quote CRM
- `/admin/service-requests`, `/admin/service-requests/[id]`
- `/admin/messages`
- `/admin/settings` — company / homepage / social / SEO tabs

**Editing tips**

- Multi-value fields (features, applications, gallery images, equipment) are edited as
  **one entry per line**.
- Technical specifications use one entry per line as `Label: value`.
- Working hours use `Label | Value`; homepage process/why-choose-us use `Title | Description`;
  statistics use `Label | Value | Note`.

---

## Security

- **Passwords** are hashed with bcrypt (cost 12). Plaintext is never stored.
- **Sessions** are stateless HMAC-SHA256 signed cookies (`httpOnly`, `SameSite=Lax`, 8-hour
  expiry). The token cannot be forged or extended without `SESSION_SECRET`.
- **Defence in depth.** `/admin/*` is guarded by edge middleware (cheap signature + expiry
  check) *and* by `requireAdmin()` inside the layout and inside every admin server action. The
  middleware is a convenience, not the control.
- **Login failures are generic** and timing-equalised, so the form does not reveal whether an
  account exists.
- **All writes are re-validated server-side** with the same Zod schema the form uses; a tampered
  request cannot bypass validation.
- **Response headers** set in `next.config.mjs`: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`.
- **Honeypot fields** on all public forms to deter simple bots.
- The admin area is `noindex` and disallowed in `robots.txt`.

Before going live: set a strong `SESSION_SECRET`, change the seeded admin password, and (if you
use one) point `NEXT_PUBLIC_SITE_URL` at the real domain.

---

## Database & portability

SQLite is used for zero-configuration local development, but the schema is written to be portable.
To move to PostgreSQL (including a free Supabase/Neon tier):

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Point `DATABASE_URL` at your database.
3. Run `npm run db:push` (or `prisma migrate deploy` for a migration-based workflow).

This works because the schema deliberately avoids provider-specific features: there are **no
native enums** (status/kind columns are `String`, guarded by TypeScript unions) and **no native
`Json`** columns (structured data is stored as JSON strings through `src/lib/serialize.ts`).

---

## SEO

- Per-page metadata, canonical URLs and Open Graph / Twitter cards.
- `sitemap.xml` generated from published content (plus the static routes).
- `robots.txt` blocking `/admin`, `/api/` and QR redirect paths.
- Structured data: `LocalBusiness` on the contact page and `FAQPage` on the FAQ page.
- A configurable title template, default description, keywords and social image in
  **Admin → Settings → SEO**.

---

## Accessibility

- Skip-to-content link, landmark regions and a single `<h1>` per page.
- Visible `:focus-visible` rings on every interactive element.
- Form controls are generated with real `<label>`s and wired `aria-describedby` / `aria-invalid`
  / error announcements.
- `prefers-reduced-motion` is respected, the modal traps focus and restores it on close, and the
  product gallery and mobile menu are keyboard operable.

---

## Deployment

The app is a standard Next.js project and deploys cleanly to Vercel, or any Node host.

**Vercel**

1. Import the repository.
2. Add the environment variables from [`.env.example`](.env.example) — in particular a strong
   `SESSION_SECRET` and a production `DATABASE_URL` (PostgreSQL).
3. Build command: `npm run build`. Run `npm run db:push` and `npm run db:seed` once against the
   production database (or seed via the admin panel instead).

**Any Node host**

```bash
npm ci
npm run build
npm run start      # PORT is respected
```

Note that SQLite is not suitable for multi-instance or ephemeral filesystem hosting — use
PostgreSQL for production.

---

## Project structure

```
prisma/
  schema.prisma        Data model (SQLite/Postgres-portable)
  seed.ts              Idempotent sample content
src/
  app/
    (site)/            Public marketing site (its own header/footer shell)
    admin/             Admin: login (public) + (dashboard) group (protected)
    sitemap.ts         Generated sitemap
    robots.ts          Generated robots.txt
  components/
    admin/             Admin shell, generic resource form, lead panels
    catalogue/         Product cards, gallery, catalogue view, detail
    forms/             Quote, contact and service-request forms
    layout/            Header, footer, logo, social links
    media/             MediaImage with fallback + fixed aspect
    site/              Page header, CTA band, cards, QR panel, print button
    ui/                Buttons, badges, breadcrumbs, pagination, fields, toast, modal
  config/
    site.ts            Default (placeholder) content
    navigation.ts      Information architecture
  lib/
    admin-resources.ts Admin resource registry
    serialize.ts       The only place JSON columns are (de)serialised
    utils.ts           cn, slugify, absoluteUrl, formatting, deep links
    validation.ts      Shared Zod schemas
  server/
    admin/             Generic admin data access
    actions/           Server actions (public + admin)
    auth.ts            Sessions, password hashing, guards
    db.ts              Prisma singleton
    ...                Catalogue, services, portfolio, content, leads, settings, QR, Telegram
  types/               DTOs, status unions, form state
  middleware.ts        Edge guard for /admin
public/images/         Clearly-labelled placeholder artwork
```

---

## Content policy

This project intentionally ships **no invented facts**. Specifically:

- The homepage **statistics block is hidden entirely** until an administrator enters real values.
- **Certifications, client counts and years of experience are not rendered at all**, because none
  were supplied.
- Placeholder imagery is labelled as such, and product images fall back to a labelled placeholder
  rather than a broken image.
- The privacy policy and terms of business are clearly marked as plain-language templates that the
  company should review before relying on them.

Replace the placeholders in **Admin → Settings** and the catalogue/content sections with verified
company information.
