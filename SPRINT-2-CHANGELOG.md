# Sprint 2 Changelog — Cars (Inventory) Page

Scope: `pages/cars.html`, `css/cars.css`, and the listing-page logic in
`js/cars-data.js`. Homepage untouched this sprint. Detail page and test
drive form are Sprint 3.

## UI Improvements

- Search field redesigned as a modern pill input: search icon, and a clear
  (×) button that only appears once you've typed something.
- Added a **Sort By** control (Featured, Price low→high, Price high→low,
  Newest first) next to the existing brand filter — the brief's "search
  should feel modern" read as needing more than just text search + one
  dropdown.
- Added a **Reset** button in the filter bar, and a second one inside the
  empty state itself, so a dead-end search is never more than one click from
  a full inventory again.
- Empty state redesigned: icon, heading, explanatory copy, and a reset
  action, instead of a single line of gray text.
- All spacing/type in `cars.css` now uses the same token scale from
  Sprint 1 (`--space-*`, `--text-*`) instead of one-off rem values, so this
  page is visually consistent with the homepage.
- Footer and nav synced to the Sprint 1 homepage redesign (Quick Links
  columns, active-page state) — this page had been left on the old single-
  block footer.

## UX Improvements

- Search input is **debounced** (200ms) so filtering doesn't refire on every
  keystroke while typing.
- Result count (`resultCount`) is `aria-live="polite"`, and the grid itself
  updates its `aria-busy` state, so screen reader users get told when
  results change instead of having to re-discover the grid.
- Reset restores every control (search, brand, sort, price slider) in one
  action and returns focus to the search field.

## Code Quality Improvements

- Extracted `debounce()` and `emptyStateHTML()` as small named helpers in
  `cars-data.js` rather than inlining that logic in the filter handler.
- Sort logic centralized in one `sortResults()` function so adding another
  sort option later is a one-line `case`, not a rewrite.
- Kept `carCardHTML()` and the core filtering predicate unchanged from
  Sprint 1 — this sprint only extended the page around it, it didn't rebuild
  what was already working.

## Accessibility Improvements

- Added a skip link and `<main>` landmark (mirrors Sprint 1's homepage
  pattern).
- Added an `aria-labelledby` grid heading: **an automated audit (axe-core)
  caught a real heading-order violation** — the page jumped from `<h1>`
  straight to the car cards' `<h3>` with nothing in between. Fixed with a
  visually-hidden `<h2>` ("Search Results") above the grid; verified 0
  heading-order violations on re-run.
- Same audit caught a second real issue: the `--ink-faint` color token
  (used on the filter labels at 12px) was 3.13:1 against white, below the
  4.5:1 AA minimum. Darkened the token from `#8892a6` to `#5c6478`
  (5.92:1). This token is shared globally, so I re-ran the audit against
  **both** the homepage and this page afterward to confirm neither
  regressed — both came back at 0 violations.

## Performance Improvements

- No new render-blocking resources. Filtering/sorting all happens
  client-side against the already-fetched `cars.json`, so there's no
  additional network cost per interaction.

## Future Recommendations

- The price slider is a single "max price" control. A proper two-handle
  min/max range would match Carvana's search more closely, but a dual-range
  slider needs either two coordinated `<input type="range">` elements with
  custom styling or a small custom component — flagging it rather than
  scope-creeping it into this sprint.
- Filter state (search term, brand, sort, price) isn't reflected in the URL,
  so a filtered view can't be bookmarked or shared. Worth adding in a later
  pass via `URLSearchParams`, following the same pattern the detail page
  already uses for `?id=`.
- Card layout/hover states are inherited as-is from Sprint 1; no changes
  were needed here, since they already read as consistent with this page's
  grid.
