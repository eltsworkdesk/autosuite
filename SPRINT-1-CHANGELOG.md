# Sprint 1 Changelog — Homepage

Scope: navigation, hero, about, featured vehicles, footer, plus the new
"Why Choose Us" section. Cars page, vehicle detail, and test drive form are
untouched this sprint — they're Sprints 2–3.

Stack unchanged: HTML5, CSS3, vanilla JS. No frameworks, no build step.

## UI Improvements

- Formalized the design system in `style.css`: a real spacing scale
  (`--space-1` … `--space-9`), type scale (`--text-xs` … `--text-3xl`), and
  motion tokens (`--ease`, `--transition-fast/base/slow`), replacing one-off
  rem values and magic numbers across the homepage's CSS.
- Documented and tightened the button system: `.btn` (primary), `.btn.outline`
  (secondary, for dark surfaces like the hero), `.btn.ghost` (tertiary), and
  `.btn.small` (size modifier) — same class names as before so nothing else
  on the site breaks, now with distinct focus-visible rings for light and
  dark backgrounds.
- Hero: shortened the subhead to one scannable sentence, enlarged the image
  frame's max-width so the vehicle photo carries more visual weight, and
  added a subtle fade/rise entrance on load (respects
  `prefers-reduced-motion`).
- About section: text and image now sit inside one shared card (`.intro-card`)
  instead of two independent blocks, so it reads as a single section.
- Added a **Why Choose Us** section (Trusted Dealership, Certified Vehicles,
  Financing Assistance, Expert Support) with hand-coded inline SVG icons in
  the brand's line-icon style — no icon library added.
- Featured vehicle cards: added a subtle image scale on hover alongside the
  existing card lift, for the Carvana-style tactile feel the brief asked for.
- Footer rebuilt as three columns — Brand, Quick Links, Contact — with a
  separate bottom bar for the copyright line, instead of one stacked block.
- Added a visible active-page indicator to the nav (underline + color) via
  `aria-current="page"`.

## UX Improvements

- Nav "Home" now visibly indicates it's the current page.
- CTA hierarchy in the hero is now unambiguous: one primary action (Explore
  Inventory), one secondary (Book a Test Drive).
- Footer's Quick Links duplicate the primary nav so people can get anywhere
  from the bottom of a long page without scrolling back up.

## Code Quality Improvements

- Split hard-coded colors used as *text* (eyebrows, prices) onto a single
  token (`--brand-blue-deep`) rather than repeating the hex value inline, so
  a future contrast fix is a one-line change, not a find-and-replace.
- Added `<main>` as the actual content landmark; sections outside it (nav,
  modal, footer) are structured accordingly.
- Kept all button/card modifier classes backward-compatible rather than
  renaming them, since cars.html and car-page.html already depend on the
  current names and aren't in scope this sprint.

## Accessibility Improvements

- Added a skip-to-content link (visible on keyboard focus).
- Mobile menu button now exposes `aria-expanded` and `aria-controls`, kept in
  sync by `toggleMenu()`.
- Every homepage section has a heading and an `aria-labelledby` tying it back
  to that heading.
- Fixed a redundant-alt issue: the nav logo icon had `alt="AutoSuite"` right
  next to visible "AutoSuite" text — screen readers announced it twice. The
  icon is now `alt=""` since the adjacent text already carries the label.
- **Ran an automated audit (axe-core) against the rendered homepage.** It
  first caught a real WCAG AA contrast failure — the blue used for eyebrows
  and prices was 3.94:1 against white, below the 4.5:1 minimum for text that
  size. Darkened the token to `#1a4fb4` (7.44:1) and confirmed **zero
  violations** on re-run.

## Performance Improvements

- Added explicit `width`/`height` on the static About and footer images to
  reduce layout shift while they load (the dynamically-rendered car cards
  already rely on `aspect-ratio` in CSS for the same reason).
- No new render-blocking resources were introduced.

## Future Recommendations

- The roadmap ("Coming to AutoSuite") and Contact sections weren't in your
  listed homepage sections — I kept and lightly polished them by default
  rather than removing content, but they're worth a deliberate decision:
  keep, merge, or cut.
- The navbar/footer markup is duplicated across `index.html`, `cars.html`,
  and `car-page.html` since there's no templating in a build-tool-free static
  site. If the page count grows much further, a tiny include step (even a
  plain Node script that stitches partials at "build" time, still shipping
  static HTML) would remove that duplication without adding a framework.
- Google Fonts is loaded via `@import` in `style.css`, which delays first
  paint slightly more than a `<link rel="preconnect">` + `<link
  rel="stylesheet">` in `<head>` would. Worth revisiting in the
  cross-site performance pass (Sprint 4).
- Sprint 2 (cars.html) can now reuse the same button/card/token system as-is.
