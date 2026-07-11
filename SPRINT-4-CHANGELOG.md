# Sprint 4 Changelog — Cross-Site Polish

Scope: accessibility, responsiveness, performance, and SEO across all five
pages (home, cars, car-page, test-drive, plus new `robots.txt`/`sitemap.xml`).
No new features or visual redesign this sprint — this is a verification and
hardening pass on top of Sprints 1–3.

## Performance Improvements

- **Fixed the render-blocking font load** flagged as a recommendation back
  in Sprint 1: fonts were loaded via `@import` inside `style.css`, which the
  browser can't discover until it's already fetched and started parsing that
  stylesheet. Replaced with `<link rel="preconnect">` (to both
  fonts.googleapis.com and fonts.gstatic.com) plus a `<link
  rel="stylesheet">` directly in each page's `<head>` — the browser's
  preload scanner picks this up immediately, before CSS parsing even starts.
- Added `fetchpriority="high"` and explicit `width`/`height` to the two
  largest-contentful-paint images on the site (the homepage hero and the
  detail page's main photo), so the browser prioritizes fetching them and
  reserves their layout space immediately instead of discovering them mid
  cascade.
- Removed a confirmed-dead CSS rule (`.container`, a utility class defined
  but never applied in any HTML). Checked every class in every stylesheet
  against actual usage in the HTML/JS; this was the only genuine orphan.

## SEO Improvements

- Added `robots.txt` and `sitemap.xml` at the project root — the site had
  neither.
- Added canonical `<link>` tags to every real content page.
- `car-page.html` and `test-drive.html` were missing Open Graph tags
  entirely (present on `index.html`/`cars.html` since Sprint 1 but never
  extended to these two) — added full `og:title`/`og:description`/`og:image`
  to the detail page.
- Marked `test-drive.html` `noindex` — it's an internal preview of the
  booking modal, not real content, and indexing it would just create thin
  duplicate content competing with the real booking flow embedded on every
  other page.
- Added JSON-LD structured data: an `AutoDealer` schema on the homepage
  (name, address, phone, email) and a `Car`/`Offer` schema on the detail
  page (price, mileage, engine, availability) — both validated as
  well-formed JSON against schema.org types.

## Accessibility Improvements

- Ran axe-core across **all four pages at three viewport widths each
  (375px, 768px, 1440px) — 12 combinations total, zero violations** on
  every one. This is a verification pass on top of the fixes already made
  sprint-by-sprint (Sprints 1–3 each caught and fixed real issues as they
  were introduced); this sprint's audit confirms nothing regressed and nothing
  was missed at breakpoints not previously tested.

## Responsiveness Improvements

- Swept all four pages at seven widths (320, 375, 767, 768, 1024, 1440,
  1920px) checking specifically for horizontal overflow — the most common
  "broken layout" symptom. None found at any combination.
- Visually verified the two highest-risk zones by hand: the narrowest
  supported width (320px, an older/small phone) and the exact 767→768px
  boundary where the nav switches from the mobile burger menu to the full
  desktop nav — both render cleanly with no overlap or cramped spacing.

## Code Quality Improvements

- Consistent `<head>` structure across all five HTML files now (title,
  description, OG tags, theme-color, canonical, icon, font preconnect, CSS)
  — previously each page had accumulated slightly differently depending on
  which sprint touched it last.

## Future Recommendations

- **Per-vehicle SEO is inherently limited by the current architecture.**
  `car-page.html` serves all ten vehicles through one static file with a
  `?id=` query parameter and client-side JS hydration. That means: (a) the
  JSON-LD structured data and Open Graph tags only ever describe the
  default fallback car (the E450) since they're static HTML, not something
  the client-side hydration rewrites; and (b) crawlers that don't execute
  JavaScript would only ever see that one car's content, regardless of the
  URL's query string. Fixing this properly would mean either
  server-side rendering per car or generating one static HTML file per
  vehicle (10 files instead of 1) — both are real architecture changes, not
  something to slip into a polish sprint. Flagging it as the single biggest
  next step if organic search traffic to individual listings matters.
- `sitemap.xml` only lists the one generic `car-page.html` URL for the same
  reason above — once per-vehicle pages/URLs exist, the sitemap should list
  all ten.
- No automated Lighthouse/PageSpeed run was part of this sprint (not
  available in this environment); the performance changes here are targeted
  fixes for specific, verifiable issues (render-blocking fonts, missing LCP
  priority hints) rather than a full audit against Core Web Vitals
  thresholds. Worth running Lighthouse once the site is actually deployed.
