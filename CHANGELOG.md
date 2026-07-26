# Changelog

All notable changes to this project are documented here, in the style of
[Keep a Changelog](https://keepachangelog.com/). This file tracks what
shipped and when — for what's still ahead, see the MVP table in
[`README.md`](README.md); this file doesn't duplicate it, so the two can't
drift out of sync.

## [1.0.0] — 2026-07-26

The full connected MVP: a storefront and a dealer-OS running against one
real database, real-time, gated on accessibility in CI.

### Added — Storefront
- Homepage with live inventory feed, financing/CRM funnel visualization, and platform pitch links
- Inventory: search, brand/price/body-type filters, sort, side-by-side compare
- Vehicle detail pages with photo gallery, specs, trim comparison
- Financing calculator with real amortization against each listing's actual price
- Trade-in estimator
- Test-drive booking, no customer account required
- Favorites (saved vehicles, no account needed)
- Locations / dealer contact page
- Platform pitch page: pricing tiers, testimonial, FAQ

### Added — Dealer OS
- Dashboard with live KPIs computed from real data
- CRM lead pipeline: Kanban and table views, 7-stage status ladder, keyboard-accessible drag/reassign
- Round-robin lead auto-assignment on intake
- Inventory management: filters, bulk actions, quick edit, add vehicle
- Appointments: week calendar, scheduling, status tracking
- Analytics: sales funnel, inventory mix, lead sources
- Customers, Staff Activity, and Settings (notifications, team, dealership profile)
- Command palette (⌘K), live notification bell, mobile bottom nav

### Added — Platform
- Server-Sent Events: a single shared connection pushes lead/vehicle/appointment changes to every open dealer-OS tab, live — no polling
- Prisma + SQLite locally, Postgres (Neon) in production, same schema file for both
- Serverless API on Vercel (one function per resource, collection + by-id routes merged per the Hobby-plan function-count limit)
- OKLCH design token system shared across every page — no one-off hex values
- CI gate: axe-core accessibility audit + HTML validation on every push, across all pages — a WCAG failure fails the build
- `docs/ONBOARDING.md` — the current orientation doc for new contributors

### Known limitations (see README for the full breakdown and why)
- VIN decode / photo upload, finance pre-qualification, and deal e-signature are deferred — each needs a real third-party vendor integration, out of scope for a self-contained build
- Single shared login today — role-based permissions (Owner/Manager/Sales/BDC) not yet built
- Lead routing: round-robin only — territory/skill-based routing needs a data model that doesn't exist yet
