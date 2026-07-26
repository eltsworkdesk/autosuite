# Sprint 3 Changelog — Vehicle Detail Page & Test Drive

Scope: `pages/car-page.html`, `css/car.css`, `pages/test-drive.html`, and the
shared test-drive modal (markup in every page + styles in `css/style.css` +
behavior in `js/script.js`). Homepage and cars listing untouched this sprint.

## UI Improvements

- All spacing/type in `car.css` now uses the Sprint 1 design tokens instead
  of one-off rem values, matching the rest of the site.
- Gallery thumbnails now show a clear selected state (`aria-current`) instead
  of relying on hover alone to indicate which photo is active.
- The non-functional "360°" button is now visibly disabled instead of
  looking clickable and doing nothing.
- "Similar Vehicles" now links to three vehicles that actually exist in
  inventory (BMW 5 Series, Mercedes GLC 300, Toyota Camry) instead of
  fictional cars (Audi A6, Lexus GS) AutoSuite doesn't carry — each card is
  a real link to that car's own detail page, with its real price.
- Added a mobile-only sticky "Book a Test Drive" bar, so the CTA stays
  reachable on a long scrolling page without competing for space with the
  top nav. Hidden at tablet+ widths, where the hero CTA is already visible.
- Rebuilt the standalone `test-drive.html` preview page on the shared design
  system (navbar, footer, tokens) instead of its own duplicate inline
  styles — it now looks like part of the site instead of a leftover demo.
- Test drive modal: added a two-column layout for Name/Phone at wider
  widths, required-field markers, and a proper success state (icon +
  message) instead of a single line of green text.

## UX Improvements

- **Form validation now gives real inline feedback.** Previously the modal
  relied entirely on the browser's native "please fill out this field"
  bubble. It now shows a specific message under each invalid field, focuses
  the first invalid field on a failed submit attempt, and clears a field's
  error the moment it becomes valid — without touching a backend, this is
  all client-side `checkValidity()`.
- The modal now returns keyboard focus to whatever element opened it when
  closed, and moves focus into the form when opened, instead of leaving
  focus stranded on the trigger button.
- Added a scroll-spy to the feature-nav chips (Buyer's Guide, Trim
  Comparison, Photos, etc.) so the current section is highlighted as you
  scroll — useful on a page with eight jump-to sections.
- Gallery thumbnails and photo grid images already had `loading="lazy"`
  from Sprint 0; unchanged, still appropriate here.

## Code Quality Improvements

- Fixed a real bug that predates this sprint: gallery thumbnail click
  handlers were only ever wired up when the page was hydrated via `?id=`
  in the URL. The default static fallback content (i.e. loading the page
  with no query string) had thumbnails that looked clickable but did
  nothing. Extracted a single `wireGalleryThumbs()` function and call it
  for both the static and JS-hydrated cases.
- Removed a redundant `role="table"` attribute from the trim comparison
  table — a native `<table>` already conveys that role; restating it adds
  nothing and is flagged by accessibility linting as redundant ARIA.

## Accessibility Improvements

- Gallery thumbnails are real `<button>` elements now, not `<img>` tags with
  a click handler — keyboard users can tab to them and press Enter/Space,
  which wasn't possible before.
- **Ran axe-core against the detail page (desktop + mobile) and the
  test-drive page** — this caught four real issues, all fixed and
  re-verified with a clean re-run:
  - Redundant alt text on the nav logo icon on `car-page.html` (same fix
    applied to `index.html`/`cars.html` in earlier sprints, missed here).
  - Two `<nav>` landmarks on the detail page (primary nav + the feature
    chips) had no way to be told apart by assistive tech — added
    `aria-label="Primary"` and `aria-label="On this page"`.
  - The horizontally-scrollable trim table wasn't reachable by keyboard —
    added `tabindex="0"` and `role="region"` with a label.
  - `test-drive.html` jumped from `<h1>` straight to the footer's `<h3>`,
    because the only `<h2>` on the page lives inside the modal, which is
    `display:none` until opened (axe correctly ignores hidden headings).
    Added a visually-hidden `<h2>` on the always-visible part of the page.
- All five pages (home, cars, detail ×2 viewports, test-drive) now return
  **zero axe violations**.

## Performance Improvements

- No new render-blocking resources. The scroll-spy uses a single
  `requestAnimationFrame`-throttled scroll listener rather than firing on
  every scroll event.

## Future Recommendations

- **Known cosmetic limitation, not a bug:** on the scroll-spy, the
  "Inventory" chip has a very narrow (practically unreachable) activation
  window. The page's tail sections (Trader Scores through Similar Vehicles)
  are short enough, and close enough to the bottom of the page, that once
  scrolling hits its maximum there isn't enough remaining scroll distance
  for "Inventory" to ever become the section closest to the viewport's
  center before "Similar Vehicles" (the true last section) takes over. All
  seven other chips activate correctly and in order. Fixing this properly
  would mean either adding more content to those sections (so the page is
  taller) or building a more complex proportional/interpolated scrollspy —
  flagging it rather than over-engineering a decorative nicety.
- The Buyer's Guide, Trim Comparison, and Trader Score content are static
  per-page rather than data-driven, same note as Sprint 0 — fine for one
  flagship listing, would need its own schema to scale across all ten cars'
  detail pages individually.
- The test-drive form still has no backend, per the brief's explicit
  constraint — success state is a friendly simulation, not a real booking.
