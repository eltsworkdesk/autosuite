# Sprint 1 — Frontend Refactor & UI Polish

Summary of the audit and the changes made to take this from a rough prototype to a
recruiter-quality MVP. Stack is unchanged: plain HTML, CSS, and JavaScript — no
build tooling was introduced.

## Audit: what was broken

- **Asset paths didn't match the folder structure.** Every page referenced an
  `images/` folder that didn't exist — real assets lived in `assets/cars/`,
  `assets/logos/`, etc. Every photo on every page was a broken link.
- **Nav links were inconsistent and case-mismatched** (`Car-Page.html` vs the
  actual `pages/car-page.html`), and pages inside `pages/` linked to `style.css`
  and `script.js` as if they were in the same folder, when they live one level up.
- **`index.html` had a `<link rel="stylesheet" href="script.js">`** — a script
  included as a stylesheet, so none of the homepage's JS ever ran.
- **The "Book a Test Drive" button on the homepage called `openTestDriveModal()`**,
  but that function and the modal markup only existed on the separate
  `test-drive.html` page. The button did nothing.
- **`css/car.css`, `css/cars.css`, `css/home.css`, `css/responsive.css`, and
  `data/cars.json` all existed but were empty** — scaffolding for a modular
  structure that was never filled in. Everything had been dumped into one
  `style.css`.
- **The cars listing page had a search bar, brand dropdown, and price slider
  with no JavaScript behind any of them** — three inert form controls.
- **Car photos were multi-megabyte originals** (several were 3,000–8,000px wide,
  2–4MB each) used directly with no resizing — a real page-weight problem.
- **The car detail page pulled in a live Mercedes-Benz logo from Wikimedia** and
  used `via.placeholder.com` images for its photo grid — a third-party trademark
  hotlinked into a portfolio piece, plus dead placeholder images.
- **No favicon, inconsistent branding** ("Skywise" / "Skyewise" typos in the
  copy vs. the `AutoSuite` brand assets actually provided in `assets/logos/`).

## What changed

**Branding.** Unified everything under the AutoSuite brand already established
by the provided logo assets, rather than the placeholder "Skywise/Skyewise Auto
Group" copy. The nav mark uses the AutoSuite "A" symbol — its source file was a
flattened JPEG with a baked-in checkerboard (no real alpha channel), so it was
re-keyed programmatically into a proper transparent PNG for use as a favicon and
nav logo. Added a small **type + color system** in `style.css` (`:root`
variables) sampled from the brand mark's blue→purple gradient, paired with
Space Grotesk (display), Inter (body), and JetBrains Mono for a
"dashboard/OS" data-readout treatment on prices and specs — a deliberate,
brand-appropriate signature rather than a generic template look.

**Structure.** Rewrote every path so `index.html` and files under `pages/`
resolve correctly relative to their actual location. Split the single
`style.css` into the modular structure the empty files implied:
`style.css` (tokens, reset, navbar, buttons, modal, card, footer — shared),
`home.css`, `cars.css`, `car.css`, and `responsive.css` (all breakpoints,
loaded last).

**Data-driven inventory.** `data/cars.json` is now the single source of truth
for 10 vehicles. `js/cars-data.js` fetches it and renders:
- the homepage's "Featured this week" grid (top 3 marked `featured: true`),
- the listing page's full grid, with **working** search, brand filter (built
  from the real brand list, not hardcoded), and a price slider that scales to
  actual inventory,
- the detail page, which reads `?id=` from the URL and swaps in the matching
  car's name, price, specs, and photo gallery — falling back to static content
  if no id is present, so the page never breaks.

**Shared test-drive modal.** Moved off the standalone `test-drive.html` page
and embedded directly in `index.html`, `pages/cars.html`, and
`pages/car-page.html`, wired through the shared `js/script.js`. The original
`test-drive.html` is left in place (unlinked from nav) as a self-contained
reference version.

**Images.** Resized and compressed every photo actually used by the site into
`assets/web/` (originals in `assets/cars/` untouched) — hero/detail images to
1400px, card images to 900px — cutting per-image weight from multi-megabyte
down to well under 250KB, plus `loading="lazy"` on grid/gallery images. Removed
the hotlinked Mercedes-Benz logo and placeholder.com images.

## Known trade-offs / next steps

- The detail page's long-form content (buyer's guide, trim table, reviews) is
  still static per-template rather than fully data-driven — reasonable for one
  flagship listing in an MVP, but would need its own JSON schema to scale.
- The "Coming to AutoSuite" section on the homepage is intentionally a teaser,
  not a build — it documents the platform roadmap (inventory management, CRM,
  financing, automation) without implementing it, per this sprint's scope.
- No backend: the test-drive form shows a success state but doesn't send
  anywhere yet.
