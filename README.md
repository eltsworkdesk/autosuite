# AutoSuite — Dealership Operating System

One connected product: a premium car-shopping experience for customers, and the CRM that runs the dealership behind it. When a visitor books a test drive on the storefront, the lead lands in the dealer's pipeline **in real time** — nothing is disconnected.

**Live site:** [dealerstack.vercel.app](https://dealerstack.vercel.app)

## The core loop

```
Customer                          System                       Dealer
--------                          ------                       ------
Browses inventory          →      Static site + JSON     →     —
Runs financing calculator  →      Client-side            →     —
Books a test drive         →      POST /api/leads        →     Lead appears on the
                                  (Postgres via Prisma)        dashboard, status NEW
                                                               ↓
                                                               Dealer works the lead:
                                                               New → Contacted → Qualified
                                                               → Appt. Scheduled →
                                                               Negotiating → Sold / Lost
```

## What's live today

**Consumer experience** (public)
- Searchable, filterable, sortable vehicle inventory
- Vehicle detail pages with photo galleries, spec tables, trim comparison
- Financing calculator — real amortization math against each car's price
- Trade-in estimator — creates a real lead, tagged by source
- Side-by-side vehicle comparison (pick up to 3 from the inventory grid)
- Test drive booking — persists to the database, no account required

**Dealer OS** (password-gated at `/dashboard`)
- Leads pipeline as a Kanban board or table — 7-stage status ladder
- Live KPIs computed from real data: total leads, new this week, most-requested vehicle
- Status changes persist instantly via PATCH

**Platform marketing page** — [pitches AutoSuite to dealerships](https://dealerstack.vercel.app/pages/platform.html): feature pillars, pricing tiers, FAQ.

## Architecture

Deliberately simple, deliberately real:

- **Frontend:** hand-written HTML/CSS/vanilla JS. No framework — chosen to keep the shipped pages fast, auditable, and dependency-free. A design-token system (OKLCH color, spacing/type scales) in `css/style.css` keeps all nine pages visually consistent.
- **Backend:** Vercel Serverless Functions (`/api`) + Prisma + Neon Postgres. One `Lead` model; the schema is pushed automatically on deploy.
- **Auth:** the dealer dashboard is served by a function behind HTTP Basic Auth — the page markup itself never ships to unauthenticated clients.
- **CI:** every push runs `html-validate` plus per-page **axe-core accessibility audits** in GitHub Actions. Accessibility failures fail the build.
- **Assets:** vehicle photography stored via Git LFS to keep clone sizes small.

```
├── index.html              Storefront homepage
├── pages/                  Inventory, vehicle detail, compare, platform, test-drive
├── css/                    Token system + per-page stylesheets
├── js/                     Inventory rendering, financing, compare, dashboard client
├── api/                    Serverless: leads CRUD, auth, dashboard
├── prisma/                 Lead schema (Postgres)
└── .github/workflows/      HTML validation + axe-core CI
```

## Engineering practices

- Sprint-based history — the storefront was built across four documented sprints (`SPRINT-*-CHANGELOG.md`), each merged as a feature branch
- Accessibility as a gate, not an afterthought: WCAG AA contrast verified for every token pairing; axe-core runs per page in CI
- Real data over mock data everywhere a recruiter or dealer might poke: the dashboard shows actual database rows, the calculators use actual listing prices

## Roadmap

Inventory management, appointments/calendar, analytics, customer profiles, and staff activity are designed (see `docs/`) and land next as Dealer OS modules. See [ROADMAP.md](ROADMAP.md).
