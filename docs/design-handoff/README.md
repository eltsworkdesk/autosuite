# Handoff: AutoSuite Dealer Operating System + Consumer Experience

## Overview
This package extends the `eltsworkdesk/autosuite` repo from a single-page consumer showroom into the full AutoSuite product: the consumer buying experience (browse → vehicle detail → financing → compare → book test drive) plus the previously-nonexistent **Dealer Operating System** (Dashboard, CRM, Inventory Management) that the repo's own roadmap section promises. It also gives mobile layouts for both experiences.

## About the Design Files
The 7 files bundled here (`*.dc.html`) are **design references built as interactive HTML mockups** — not production code to copy directly. They render inline styles for streaming/editing reasons specific to the design tool that made them. **Do not port the inline-style markup as-is.** Recreate each screen inside the actual `autosuite` repo using its real stack: plain HTML pages + `css/*.css` + vanilla JS (`js/script.js`, `data/cars.js` pattern), following the file/module conventions already in the repo (see `docs/architecture.md`, `docs/design-system.md`).

## Fidelity
**Mixed.** Layout, hierarchy, component composition, and content are final — treat structure and copy as-is. Visual styling (color, type, spacing) is a **placeholder system** (blue/amber accents, Space Grotesk/IBM Plex) that must be **replaced with the repo's real design tokens**, listed below. Where the mockups' visual choices conflict with the repo's tokens, the repo's tokens win.

## Repo Design Tokens To Use (from `css/style.css`)
Use these `:root` custom properties already defined in the repo — do not invent new colors/fonts.

- Brand: `--brand-blue: #0ea5ff`, `--brand-blue-deep: #1a4fb4` (AA text color), `--brand-purple: #6c4cee`, `--gradient-brand: linear-gradient(135deg, var(--brand-blue), var(--brand-purple))`
- Ink/neutrals: `--navy-950: #0b1220`, `--navy-900: #10182c`, `--navy-800: #171f3a`, `--ink: #0b1220`, `--ink-soft: #4b5568`, `--ink-faint: #5c6478`, `--line: #e6e8f0`
- Surfaces: `--bg: #f6f7fb`, `--surface: #ffffff`, `--surface-sunken: #eef0f7`
- Feedback: `--success: #16a34a`, `--danger: #e0473f`
- Fonts: `--font-display: 'Space Grotesk'`, `--font-body: 'Inter'`, `--font-mono: 'JetBrains Mono'`
- Radius: `--radius-sm: 8px`, `--radius-md: 14px`, `--radius-lg: 22px`, `--radius-pill: 999px`
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg` (values in style.css) — subtle elevation only, never stacked
- Spacing: 4px-based scale `--space-1` (4px) through `--space-9` (96px)
- Type scale: `--text-xs` (12px) through `--text-3xl` (44px)
- Motion: `--ease: cubic-bezier(0.22, 1, 0.36, 1)`, `--transition-fast/base/slow`
- Existing components to reuse, don't rebuild: `.btn` / `.btn.outline` / `.btn.ghost` / `.btn.small`, `.data-chip` (mono "readout" chip — reuse for statuses, prices, tags everywhere), `.car-card`, `.navbar`, `.footer`, `.modal` (the test-drive modal pattern generalizes to any booking/lead-capture form)

**New tokens needed for the Dealer OS surfaces** (dark sidebar workspace) — not yet in style.css, propose adding to `:root`:
- `--dealer-sidebar-bg: var(--navy-950)`; sidebar active item: `background: var(--navy-800)`, text `#fff`
- Status colors for CRM pipeline stages — derive from existing hues, do not add new brand colors: New `--brand-blue-deep`, Contacted `#3b6fd1` (blue-500-ish, blend toward navy), Qualified `#2f8f8a` (teal, blend of blue+success), Appt. Scheduled `--success`, Negotiating `#d99a2b` (amber — new, needed for "in progress/attention" states), Sold `--success`, Lost `--ink-faint`

## Screens / Views

### 1. Foundations (reference only — not a shipped screen)
Site map, personas (Maya Torres / Derek Owusu), the customer↔dealer connected-journey table, CRM stage ladder, and a token preview. Use as the spec for IA and the lead lifecycle; do not build this page itself.
Source: `01 Foundations.dc.html`

### 2. Marketing Homepage
- **Purpose**: Explain AutoSuite as a dealership OS (not just a car site) to both shoppers and dealership owners; drive to Explore Inventory / Book Demo.
- **Layout**: Sticky nav (logo, Product/For Dealers/Pricing/FAQ, Sign in, Book a demo CTA) → centered hero (eyebrow pill, H1, subhead, two CTAs) → dark product-preview mock (sidebar + KPI cards + mini funnel chart) → "How it works" 2-card connected-event diagram (Customer card → arrow → Dealer card) → 3×2 feature-pillar grid → "For dealers" split section (copy + image placeholder) → dark testimonial quote block → 3-tier pricing grid → FAQ accordion-style list → dark closing CTA → footer.
- **Components**: Reuses repo's `.navbar`, `.btn`/`.btn.outline`/`.btn.ghost`, `.footer`, `.data-chip` for the eyebrow/status pills. The product-preview mock and feature pillar icons are new components — build as generic `.preview-window` (dark, rounded, traffic-light dots optional) and `.feature-card` (icon tile + heading + body, on `--surface` with `--line` border).
- **Content**: Exact hero copy, feature pillar names/descriptions, pricing tiers ($399 Starter / $899 Growth "Most Popular" / Custom Enterprise), FAQ Q&A — see file for verbatim text.
Source: `02 Marketing Homepage.dc.html`

### 3. Vehicle Experience (Inventory context + Vehicle Detail + Financing + Trade-In + Compare)
- **Purpose**: One scrollable page combining the inventory browse context (filter chips) with a full vehicle detail page, financing calculator, trade-in estimator, and compare-tray — matches the "Views a vehicle → financing → compares" journey.
- **Layout**: Nav bar with breadcrumb + Save/Compare → inventory filter-chip strip → 2-col vehicle detail (gallery + thumbnail strip left 1.4fr / specs+CTA+notes right 1fr) → availability banner (green, dot + text) → Specs 2-col key/value list → History checklist → Dealer Notes paragraph → 2-col financing (slider-based calculator card) + trade-in/compare stacked cards → 4-up "Similar vehicles" grid → trust stats (130-pt inspection / 7-day guarantee / 1yr warranty) + warranty FAQ list.
- **Components**: Gallery uses repo's existing image patterns from `pages/car-page.html` (adapt, don't rebuild) — this repo already has `assets/web/*` real vehicle photography (bmw-x6-2024-*.jpg, mercedes-e450-2024-*.jpg, etc.) to drop in instead of placeholders. Financing calculator sliders: reuse `#testDriveForm input` styling conventions for consistency (border, radius, focus states) even though these are `<input type=range>`. CTA buttons = `.btn` (Book Test Drive) / `.btn.outline` (Contact Dealer). Availability banner: new `.availability-banner` component, `background: #eafaf0` (matches existing `.form-status` success color), success dot.
- **Interactions**: Slider inputs recompute the monthly payment live (down payment %, term months, APR) — implement as vanilla JS, same file pattern as `js/script.js`. "Book Test Drive" reuses the existing shared `#testDriveModal` — pre-fill the `car` field with this vehicle's name. Compare "+ Add vehicle" opens a vehicle picker (new — not in repo yet); selecting a second vehicle should route to a new Compare page/state showing both cars' specs side by side.
Source: `03 Vehicle Experience.dc.html`

### 4. Dealer Dashboard
- **Purpose**: Staff landing page — "Linear/Stripe-dashboard" feel. Surfaces what needs attention today.
- **Layout**: Fixed 236px dark sidebar (logo, ⌘K search field, nav items: Overview/CRM/Inventory/Appointments/Customers/Analytics/Staff Activity, Settings + user footer) + main area: top bar (title, Quick action button, notification bell w/ dot) → 4-up KPI card row (New Leads Today, Test Drives Booked, Revenue MTD, Avg. Response Time — each with value + trend line) → 2-col row: Lead Pipeline (horizontal bar chart, one row per CRM stage, label+bar+count) / Upcoming Appointments list (time, name, vehicle, type chip) → 3-col row: Recently Added Vehicles (thumb+name+price+status dot) / Recent Customer Activity (activity feed sentences + relative time) / Inventory Health (label:value stat list).
- **Components**: Sidebar nav item — `.dealer-nav-item`, active state `background: var(--navy-800); color:#fff`, inactive `color: rgba(255,255,255,.6)`. KPI card — white surface card, `border:1px solid var(--line)`, `border-radius: var(--radius-md)`, mono label (`--font-mono`, uppercase, `--text-xs`), big number (`--font-display`, ~30px), trend line in `--success` or `--danger`. Pipeline bar row — track `background: var(--surface-sunken)`, fill colored per-stage (see token list above), rounded ends.
- **Data** (placeholder, wire to real API): KPIs = 18 leads / 7 test drives / $412K MTD / 6 min avg response. Pipeline stage counts: New 34, Contacted 28, Qualified 19, Appt. Scheduled 12, Negotiating 8, Sold 19. Full mock data in the `.dc.html` file's logic block — use as seed/fixture data.
Source: `04 Dealer Dashboard.dc.html`

### 5. CRM
- **Purpose**: Lead management in two views (Kanban board, Table) plus a Lead Detail page — the file demonstrates all three via tab-switching; build as three real states/routes.
- **Layout — Board**: Same sidebar. Top bar with Board/Table/Lead Detail tab switcher (segmented control, active = white bg + subtle shadow) + "+ New lead" button. Below: horizontally-scrolling columns, one per stage (New, Contacted, Qualified, Appt. Scheduled, Negotiating, Sold, Lost), each column header = colored dot + stage name + count; each column body = stacked lead cards (name + priority dot, vehicle line, source chip + avatar circle).
- **Layout — Table**: Same top bar. Single table: Customer | Vehicle | Source | Status (colored pill) | Priority | Assigned (avatar+name). Sortable/filterable columns (behavior only, not styled here).
- **Layout — Lead Detail**: 2-col (main 1fr / sidebar 320px). Main: header row (avatar, name, email/phone, status pill top-right) → "Interested In" card (vehicle thumb+name+price) → "Activity Timeline" card (dot+text+timestamp, vertical list, one entry per event). Sidebar: Details card (Source/Assigned/Priority/Created key-value list), Tags card (pill chips), Tasks card (checkbox list, completed = strikethrough + filled check), Documents card (file icon + filename).
- **Components**: Segmented tab control — new, reuse `--radius-md` container with `--surface-sunken` track, active tab = `--surface` + `--shadow-sm`. Kanban card = `.car-card`-style surface but simplified (no image). Status pill = `.data-chip` variant with per-status background tint (10% opacity of the stage color) + that color's text.
- **Interactions**: Cards drag-and-drop between board columns to change stage (standard Kanban DnD — HTML5 drag events or a lightweight lib). Clicking a card/table row opens Lead Detail. Checkbox tasks toggle strikethrough state.
Source: `05 CRM.dc.html`

### 6. Inventory Management
- **Purpose**: Staff-side vehicle listing management — effortless bulk editing, not the customer-facing catalog.
- **Layout**: Sidebar + top bar (title, counts summary text, Bulk actions + "+ Add vehicle" buttons) → filter row (search input, Status/Body type/Price dropdowns, Table/Cards view toggle) → "Featured on homepage" 4-up card strip (photo + name + price) → full inventory table: thumb | Vehicle (name+trim) | Price | Mileage | Status pill (Active/Featured/Draft/Sold — each a distinct tint) | Days listed | Quick edit link.
- **Components**: Reuse `.car-card` for the featured strip (it already exists in the repo — just swap in real photos from `assets/web/`). Table row status pill = same `.data-chip`-derived component as CRM's status pill, shared across both screens for consistency.
- **Interactions**: "Quick edit" opens an inline edit affordance or side-panel form (price, status, featured toggle) rather than navigating away — keep bulk workflows on one screen. Bulk actions = checkbox column (not yet in the mock — add a leading checkbox per row when wiring this up) enabling multi-select for status changes/deletion.
Source: `06 Inventory Management.dc.html`

### 7. Mobile
- **Purpose**: Reference layouts for four key mobile screens: Consumer Home (browse), Consumer Vehicle Detail, Dealer Dashboard, Dealer Lead Detail.
- **Pattern**: Consumer mobile = persistent bottom tab bar (Browse / Compare / Saved / Menu). Dealer OS mobile = persistent bottom tab bar scoped to floor tasks only (Home / Leads / Inventory / Calendar) — Analytics/Settings/Staff Activity stay desktop-only, reachable via the Home overflow menu on mobile.
- **Breakpoint**: Build mobile using the repo's existing `css/responsive.css` breakpoint conventions rather than a new breakpoint scheme.
Source: `07 Mobile.dc.html`

## Interactions & Behavior Summary
- Financing calculator: live-recompute monthly payment on slider input (down payment %, term, APR) — vanilla JS.
- Test drive booking: reuse existing shared `#testDriveModal` markup/JS across Homepage, Vehicle Detail, and (new) pre-filled from vehicle context.
- **Core cross-experience rule**: any consumer action that should create/update a lead (test drive booked, financing calc completed with contact info, trade-in submitted) must POST to the same lead-creation flow so it appears in CRM Board/Table with source correctly tagged (Website vs Phone vs Walk-in) and, ideally, auto-assigned per the dealer's existing routing rule (round robin / manager default).
- CRM board: drag-and-drop stage changes; table: click-through to Lead Detail; tasks: checkbox toggle with strikethrough.
- Inventory: quick edit as inline/side-panel, not full navigation; bulk select via row checkboxes.
- Dashboard KPIs, pipeline bars, and activity feed should be live-data driven, not static — treat all numeric content in the mocks as fixture/seed data only.

## State Management
- Lead object: `{id, customerName, email, phone, vehicleId, source, status (New|Contacted|Qualified|Appt. Scheduled|Negotiating|Sold|Lost), priority, assignedTo, tags[], tasks[], timeline[], documents[]}`
- Vehicle object needs a `status` field distinct from CRM lead status: `Active | Featured | Draft | Sold`, plus `daysListed`.
- View state for CRM screen: `view: 'board' | 'table' | 'detail'` plus `selectedLeadId`.
- Financing calculator: `{downPaymentPct, termMonths, apr}` → derived `monthlyPayment`.

## Design Tokens
See "Repo Design Tokens To Use" above — this section intentionally points to the existing `css/style.css` `:root` block rather than duplicating it, plus the proposed additions for dealer-side status colors.

## Assets
- Real vehicle photography already exists in `assets/web/` and `assets/cars/` (BMW X6, Mercedes E450/GLE53, Porsche Cayenne, Cadillac Escalade, Lexus GX460, Toyota Camry, Audi A7, BMW 5 Series, AMG G63, Mercedes GLC300) — use these instead of the striped placeholder blocks in the mockups.
- Logo/icon assets in `assets/logos/` and `assets/icons/` (primary logo, monochrome version, horizontal wordmark, app icon, favicon variants) — use for nav/sidebar/footer branding instead of the mockups' plain color-block logo mark.
- No new icon set was designed — mockups use text glyphs (▦ ☎ ▤ ◔ ✎ ▲ ◫ ⚙) as placeholders for sidebar nav icons; replace with a real icon set (recommend Lucide or Phosphor to match the existing `why-us` section's stroke-style SVG icons in `index.html`) before shipping.

## Files
- `01 Foundations.dc.html` — IA, personas, journeys, token reference (not a shipped screen)
- `02 Marketing Homepage.dc.html`
- `03 Vehicle Experience.dc.html`
- `04 Dealer Dashboard.dc.html`
- `05 CRM.dc.html`
- `06 Inventory Management.dc.html`
- `07 Mobile.dc.html`

Open any `.dc.html` file directly in a browser to view it.
