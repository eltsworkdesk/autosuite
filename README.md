# AutoSuite — The Dealership Operating System

**One connected product.** Customers get a premium car-shopping experience. Dealers get the CRM, inventory, and analytics engine that runs the business behind it. When a visitor books a test drive on the storefront, the lead lands in the dealer's pipeline **in real time** — nothing is disconnected.

**Live:** [dealerstack.vercel.app](https://dealerstack.vercel.app) · **Platform pitch:** [/pages/platform.html](https://dealerstack.vercel.app/pages/platform.html)

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
└─────────────────────┘        └──────────────┘        └──────────────────────┘
```

Try it yourself: book a test drive on any vehicle page — that's a real database row, visible on the dealer dashboard seconds later.

## Built to a deliverable standard

This is not a tutorial project. It's engineered the way client work ships:

- **Accessibility is a build gate.** Every push runs per-page axe-core audits plus HTML validation in CI — WCAG failures fail the build. Every color pairing in the design system is contrast-verified (AA minimum, most exceed 7:1).
- **A real design system.** OKLCH color tokens, spacing/type scales, and motion curves defined once in `css/style.css` and consumed by all nine pages — no one-off hex values, no drift between pages.
- **Real data end to end.** The dashboard shows actual Postgres rows. The financing calculator computes real amortization against each car's actual price. Nothing a dealer or reviewer touches is faked.
- **Deliberate architecture.** Hand-written HTML/CSS/JS for the storefront (fast, auditable, zero dependencies to rot) + Vercel serverless functions with Prisma/Neon Postgres for persistence. The dashboard is served from behind HTTP Basic Auth — its markup never reaches unauthenticated clients.
- **Traceable history.** Four documented storefront sprints (`SPRINT-*-CHANGELOG.md`), feature-branch merges, and design docs (`docs/`) from wireframe to shipped page.

## For dealers: the MVP today

| You get | Status |
|---|---|
| Branded storefront: search, filter, compare, vehicle pages | ✅ Live |
| Financing calculator + trade-in estimator on every listing | ✅ Live |
| Test-drive booking, no customer account needed | ✅ Live |
| Lead pipeline (Kanban + table), 7-stage status ladder | ✅ Live |
| Live KPIs: total leads, new this week, most-requested vehicle | ✅ Live |
| Inventory management, appointments, analytics, staff roles | 🔜 Next modules |

The roadmap follows the product design brief in `docs/` — the same sitemap, personas, and journey mapping the built pages came from.

## Stack

`HTML/CSS/JS (storefront)` · `Vercel Serverless Functions` · `Prisma + Neon Postgres` · `GitHub Actions (html-validate + axe-core)` · `Git LFS`

```
├── index.html              Storefront homepage
├── pages/                  Inventory, vehicle detail, compare, platform, test-drive
├── css/                    Design tokens + per-page stylesheets
├── js/                     Inventory, financing, compare, dashboard client
├── api/                    Serverless: leads CRUD, auth, dashboard
├── prisma/                 Lead schema (Postgres)
└── .github/workflows/      Accessibility + validation CI
```
