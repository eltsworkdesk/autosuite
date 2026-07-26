# Welcome to AutoSuite

This doc exists so you're not piecing the project together from a dozen
scattered files on your first day. Read this, skim the README, and you're
oriented. `docs/archive/` holds old sprint/phase logs — development-log
snapshots from earlier milestones, several of which are now inaccurate (one
of them still lists the CRM and dashboard as unbuilt "Phase 3" — they've
been live for a while). They're kept for history, not for orientation —
don't build your mental model from them. **`README.md` is the one source of
truth for current state.** This doc is the narrative version of it.

## What we're building, in one sentence

A dealership's customer-facing website and its internal operating system,
built as one connected product instead of the patchwork of disconnected
vendors most dealers actually run on.

## The thesis

Walk into how a typical dealer's software stack works today: the website is
one vendor, the CRM is another, inventory lives in a spreadsheet or a third
tool, and leads land in someone's email inbox. Nothing talks to anything
else. A customer who fills out a form on the website has no guarantee a
salesperson ever sees it before the trail goes cold.

AutoSuite's bet is that this is solvable by refusing to split the product in
two. When a visitor books a test drive on the storefront, that's not a form
submission into a void — it's a database write that shows up on the dealer's
CRM board and dashboard within seconds, over the same real-time connection
that powers every other live update in the dealer-facing app. The storefront
and the back office are two views into one system, not two systems bolted
together.

## Who it's for

Two audiences, both real:

- **The dealership** — the owner, the sales team, whoever's working leads.
  They live in the dealer-OS side: the CRM pipeline, the inventory manager,
  the appointments calendar, the analytics. This is the "back office."
- **The car shopper** — anyone browsing inventory, running a financing
  estimate, comparing trims, or booking a test drive. They never see the
  dealer-OS at all. This is the storefront.

Every feature you build should have a clear owner between those two. If
you're not sure which one a feature is for, that's usually a sign the
feature needs to be scoped tighter before you start.

## Where we actually are

The MVP is live and functional, not a mockup. Test-drive booking, the CRM
pipeline (7-stage Kanban + table view), inventory management, appointments,
analytics, round-robin lead assignment, customer records, staff activity,
settings — all of it runs against a real database (Postgres in production,
SQLite locally), not fixtures. The full breakdown of what's live versus
what's intentionally deferred is the MVP table in `README.md` — don't
duplicate it here, it'll just drift out of sync. The short version: what's
deferred is deferred because it needs a real third-party vendor account
(VIN decoding, a credit bureau, an e-signature provider) — not because it's
hard, but because it's out of scope for a self-contained build.

The design system is real and enforced, not aspirational: OKLCH color
tokens, a type/spacing scale, and motion curves defined once and consumed
everywhere — no one-off hex values anywhere in the codebase. Every page runs
through axe-core and HTML validation in CI; a WCAG failure fails the build.
That gate is non-negotiable — don't merge past it, don't disable it to ship
faster.

## Orienting yourself in the code

Start with the README's file tree — it's accurate and current. The one-line
version:

- `index.html` + `pages/*.html` — every screen, storefront and dealer-OS
  alike. No framework, no build step. Open a file, read it top to bottom.
- `css/style.css` — the design tokens and shared components. If you're
  about to write a new color or spacing value, it almost certainly already
  exists here.
- `js/dos-shell.js` — the shared dealer-OS shell (the SSE connection,
  command palette, notifications, mobile nav). Anything that needs to feel
  "live" across the dealer-OS routes through here.
- `js/lib/` — pure logic with no DOM dependency (filtering, sorting,
  financing math) and a matching test in `tests/`. If you're writing logic
  that isn't tied to a specific page, it belongs here, not inline in a
  page's script tag.
- `api/` — serverless functions, one per resource, each merging its
  collection and by-id routes into a single function (a Vercel Hobby-plan
  constraint — don't split them back apart).
- `docs/design-handoff/` — the actual design brief this build was built
  against: 15 docs covering foundations, every screen, user flows, and the
  accessibility checklist CI is gated on. When you're unsure whether
  something is a deliberate design decision or an oversight, check here
  before changing it.

## One open constraint worth knowing early

The project name collides with an existing live product at `autosuite.app`.
A rebrand is planned but deliberately deferred until after the initial
build ships — don't invest in the "AutoSuite" name anywhere that would be
expensive to change later (no baked-in wordmark in raster assets beyond
what already exists, no hardcoded brand strings in places that would need a
find-and-replace across dozens of files).

## What "done" looks like here

This isn't a tutorial project or a proof-of-concept that stops at the happy
path — it's built to the standard of something a client would actually
receive: accessible by default, real data end to end, nothing faked that a
reviewer might touch. Hold new work to that bar. If a feature only works in
the demo-data happy path, it's not done yet.
