# AutoSuite — The Dealership Operating System

**One connected product.** Customers get a premium car-shopping experience. Dealers get the CRM, inventory, appointments, and analytics engine that runs the business behind it. When a visitor books a test drive on the storefront, the lead lands in the dealer's pipeline **in real time** — nothing is disconnected.

**Live:** [dealerstack.vercel.app](https://dealerstack.vercel.app) · **Dealer dashboard:** [/pages/dashboard.html](https://dealerstack.vercel.app/pages/dashboard.html) · **Platform pitch:** [/pages/platform.html](https://dealerstack.vercel.app/pages/platform.html)

![AutoSuite storefront homepage](docs/screenshots/home.png)

---

## Why this project exists

Most dealership software is a patchwork: a website from one vendor, a CRM from another, inventory in a spreadsheet, leads in an inbox. AutoSuite is built on a single thesis — **the storefront and the back office should be one system** — and this repo is the working proof:

```
 CUSTOMER SIDE                    DATA LAYER                DEALER SIDE
┌─────────────────────┐        ┌──────────────┐        ┌──────────────────────┐
│ Browse inventory    │        │              │        │ Dashboard (live KPIs)│
│ Financing calculator│  ───►  │  Serverless  │  ───►  │ CRM pipeline         │
│ Trade-in estimator  │        │  API +       │        │  New → Contacted →   │
│ Compare vehicles    │        │  Postgres    │        │  Qualified → Appt →  │
│ Book a test drive   │        │              │        │  Negotiating → Sold  │
│ Save favorites      │        │              │        │ Inventory management │
└─────────────────────┘        └──────────────┘        │ Appointments calendar│
                                                          │ Analytics + Staff    │
                                                          └──────────────────────┘
```

Try it yourself: book a test drive on any vehicle page — that's a real database row, visible on the dealer dashboard and CRM board seconds later via server-sent events (no polling, no refresh).

## Built to a deliverable standard

This is not a tutorial project. It's engineered the way client work ships:

- **Accessibility is a build gate.** Every push runs per-page axe-core audits plus HTML validation in CI, across all 18 pages — WCAG failures fail the build. Every color pairing in the design system is contrast-verified (AA minimum, most exceed 7:1).
- **A real design system.** OKLCH color tokens, spacing/type scales, and motion curves defined once in `css/style.css`/`css/dashboard.css` and consumed by every page — no one-off hex values, no drift between the storefront and the dealer-OS.
- **Real data end to end.** Both dashboards show actual Postgres rows. The financing calculator computes real amortization against each car's actual price. Nothing a dealer or reviewer touches is faked.
- **Deliberate architecture.** Hand-written HTML/CSS/JS for the storefront (fast, auditable, zero dependencies to rot) + Vercel serverless functions with Prisma/Postgres (Neon) for persistence, SQLite locally so contributors need zero setup. The dealer-OS is served from behind HTTP Basic Auth.
- **Real-time sync.** A single shared Server-Sent Events connection pushes lead/vehicle/appointment changes to every open dealer-OS tab — the CRM board, the dashboard KPIs, and the notification bell all update live, not on a timer.

## For dealers: the MVP today

| You get | Status |
|---|---|
| Branded storefront: search, filter, compare, favorites, vehicle pages | ✅ Live |
| Financing calculator + trade-in estimator on every listing | ✅ Live |
| Test-drive booking, no customer account needed | ✅ Live |
| Lead pipeline (Kanban + table), 7-stage status ladder, keyboard-accessible | ✅ Live |
| Round-robin lead auto-assignment on intake | ✅ Live |
| Inventory management: filters, bulk actions, quick edit, add vehicle | ✅ Live |
| Appointments: week calendar, scheduling, status tracking | ✅ Live |
| Analytics: sales funnel, inventory mix, lead sources | ✅ Live |
| Customers, Staff Activity, Settings (notifications, team, dealership profile) | ✅ Live |
| Command palette (⌘K), live notification bell, mobile bottom nav | ✅ Live |
| Platform pitch: pricing tiers, testimonial, FAQ | ✅ Live |
| VIN decode auto-fill, photo upload | 🔜 Needs a 3rd-party VIN/storage API |
| Finance pre-qualification (soft credit pull) | 🔜 Needs a lending partner integration |
| Deal paperwork / e-signature | 🔜 Needs an e-sign provider |
| Role-based permissions (Owner/Manager/Sales/BDC) | 🔜 Roadmap — single shared login today |
| Territory/skill-based lead routing | 🔜 Round-robin is live; the other two strategies need a territory/skill model that doesn't exist yet |
| AI-assisted follow-up workflows | 🔜 Roadmap |

The MVP follows the product design brief in [`docs/design-handoff/`](docs/design-handoff/) — 15 design docs covering foundations, every screen, information architecture, user flows, success metrics, states, and the accessibility checklist this build is gated against. The "Needs a 3rd-party integration" items are deliberately out of scope for a self-contained demo — they'd require real vendor accounts (VIN decoders, credit bureaus, e-signature) rather than more app code.

## Screens

**Dealer OS — leads pipeline.** Every test-drive booking on the storefront lands here as a live lead, on a 7-stage Kanban board with KPIs computed from real data.

![Dealer dashboard with lead pipeline](docs/screenshots/dashboard.png)

**Storefront inventory.** Search, brand filter, price slider, sort, save-to-favorites, and side-by-side compare — all client-side against real listings.

![Inventory grid](docs/screenshots/inventory.png)

**Vehicle page — the buyer's tools.** Financing calculator (real amortization against the listing price) and trade-in estimator, plus specs and trim comparison.

![Vehicle detail page with financing calculator](docs/screenshots/vehicle-page.png)

**Platform pitch.** The dealer-facing marketing page positioning AutoSuite as one operating system.

![Platform marketing page](docs/screenshots/platform.png)

## Stack

`HTML/CSS/JS (storefront + dealer-OS)` · `Vercel Serverless Functions` · `Prisma` · `SQLite (local)` / `Postgres via Neon (production)` · `Server-Sent Events` · `Vitest` · `GitHub Actions (html-validate + axe-core)`

```
├── index.html              Storefront homepage
├── pages/                  Storefront: cars, vehicle detail, compare, favorites,
│                           locations, financing calculator, trade-in estimator,
│                           platform pitch
│                           Dealer OS: dashboard, CRM, inventory, appointments,
│                           customers, analytics, staff activity, settings
├── css/                    Design tokens (style.css) + per-surface stylesheets
│                           (dashboard.css for the dealer-OS shell, home.css,
│                           cars.css, car.css, responsive.css, ...)
├── js/                     dos-shell.js (shared dealer-OS shell: SSE, command
│                           palette, notifications, modals, mobile nav),
│                           favorites.js, cars-data.js, compare.js, script.js
│   └── lib/                Pure logic (filtering/sorting, financing math) — no DOM,
│                           shared between the browser and tests/
├── tests/                  Vitest unit tests for js/lib/
├── api/                    Serverless functions: leads, vehicles, appointments
│                           (each merges its collection + by-id routes into one
│                           function via vercel.json rewrites), analytics,
│                           customers, team, dealership, finance, trade-ins,
│                           dashboard
├── prisma/                 Schema (SQLite locally, Postgres in prod — see
│                           scripts/prepare-prisma-schema.js) + seed scripts
├── docs/                   design-handoff/ (the 15-doc product design brief this
│                           was built from), architecture.md, design-system.md
└── .github/workflows/      Accessibility + validation CI (18 pages gated)
```

## Development

No build step for the storefront — open the HTML files directly, or serve the
repo root with any static server. The API (`api/`) needs a `DATABASE_URL`
(see `.env.example`) — locally this points at a zero-setup SQLite file, so
no database installation is required to get started.

```
npm install     # also runs `prisma generate`
npm run dev     # starts the local server + API on http://localhost:3000
npm test        # unit tests for js/lib/ (filtering, sorting, financing math)
npm run db:seed # populate local SQLite with demo data
```

Production (Vercel) runs against a real Postgres database (Neon) — the
datasource provider is patched from `sqlite` to `postgresql` at build time
only, so the same schema file serves both environments without contributors
needing Postgres running locally.
