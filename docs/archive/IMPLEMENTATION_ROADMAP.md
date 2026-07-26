# AutoSuite Implementation Roadmap
## Lead Software Engineer Plan – UX Spec to Code

**Date:** 2026-07-18  
**Status:** Planning Phase  
**Goal:** Implement the complete UX redesign specification with 1:1 fidelity.

---

## I. DESIGN SYSTEM AS CODE

### A. Design Tokens (CSS/JS)
Define all design tokens from the spec as reusable variables:

**Location:** `src/design-system/tokens.ts`

#### Colors (OKLch format)
- **Primary:** `oklch(45% 0.16 260)` → `#4A5FFF` (blue)
- **Accent:** `oklch(65% 0.14 55)` → `#FFB700` (orange)
- **Ink (Dark):** `oklch(20% 0.012 260)` → `#0B1220` (near-black)
- **Success:** `oklch(60% 0.14 145)` → `#00A876` (green)
- **Danger:** `oklch(55% 0.18 25)` → `#E63946` (red)
- **Neutral grays:** oklch scales (50% through 97% lightness)
- **Semantic states:** (hover, focus, active, disabled, invalid)

#### Typography
- **Display & headings:** Space Grotesk (500, 600, 700)
- **Body & UI:** IBM Plex Sans (400, 500, 600, 700)
- **Data/labels/timestamps:** IBM Plex Mono (400, 500, 600)
- **Scales:** 11px, 12px, 13px, 14px, 15px, 18px, 20px, 28px, 32px, 34px, 56px

#### Spacing
- **Base unit:** 8px
- **Scale:** 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px

#### Radius
- **Base:** 8px (inputs, small elements)
- **Cards:** 12px
- **Buttons:** 9px
- **Rounded:** 999px (pills, full-width circle)

#### Shadows
- **Subtle (hover/menu):** `0 1px 2px rgba(0,0,0,.08)`
- **Elevated (modals):** `0 20px 40px -12px rgba(0,0,0,.2)`
- **Dropdown:** `0 8px 20px -8px rgba(0,0,0,.15)`

### B. Component Library
Define reusable components that consume tokens:

**Location:** `src/components/`

Components from spec (Component Inventory):
- **Button** (Primary, Secondary, Ghost, Disabled, Destructive)
- **Input** (text, range, focused, invalid states)
- **Badge/Status pills** (New, Negotiating, Sold/Active, Lost/Draft)
- **Card** (KPI, Kanban, standard)
- **Table** (header, row, grid-based)
- **Charts** (bar, funnel, line — recharts/d3)
- **Modal/Drawer** (title, body, actions, focus trap)
- **Dropdown/Select**
- **Navigation** (active/inactive nav items, sidebar)
- **Toast notification**
- **Command palette** (⌘K trigger + search modal)
- **Kanban board** (drag-and-drop columns, cards)
- **Calendar** (appointments view)
- **Avatar** (user profile circles)

---

## II. DATA MODELS & STATE MANAGEMENT

### A. Database Schema (Prisma)
**Location:** `prisma/schema.prisma`

Expand the existing Lead model and add:

```
Lead {
  id, carId, carName, name, email, phone, status, source, priority, tags, tasks, createdAt, updatedAt
  // NEW: appointmentId (FK), assignedTo (FK), tradeInId (FK), financeAppId (FK)
}

Vehicle {
  id, vin, make, model, year, price, mileage, color, body, engine, transmission, drivetrain, mpg, images, 
  specs, history, dealerNotes, status (Draft/Active/Featured/Sold), createdAt, soldAt, updatedAt
}

Appointment {
  id, leadId, vehicleId, type (Test Drive/Inspection), dateTime, dealershipId, status (Scheduled/Completed/NoShow), 
  notes, createdAt, updatedAt
}

Customer {
  id, name, email, phone, address, preferredVehicles[], purchaseHistory [], referralCode, createdAt, updatedAt
}

TradeInEstimate {
  id, leadId, yearMakeModel, mileage, condition, estimateRange { low, high }, status, inPersonInspectionScheduled,
  inspectionDatetime, createdAt, updatedAt
}

FinanceApplication {
  id, leadId, vehicleId, downPayment, loanTerm, apr, monthlyPayment, status (Pending/Approved/Denied), 
  approvalDetails, createdAt, updatedAt
}

Inventory (Dealer side) {
  id, dealershipId, vehicleId, listingStatus (Draft/Active/Featured/Sold), dayOnLot, interestCount, 
  viewCount, photoCount, soldDate, updatedAt
}

Dealership {
  id, name, email, phone, address, timezone, leadRoutingRules [], teamMembers [], settings {}, 
  createdAt, updatedAt
}

TeamMember {
  id, dealershipId, name, email, role (Owner/Manager/Sales/BDC), permissions [], joinedAt, deactivatedAt
}

Analytics {
  id, dealershipId, date, newLeads, contactedLeads, qualifiedLeads, appointmentsScheduled, 
  testDrivesCompleted, salesClosed, revenue, conversionRate, createdAt
}

Notification {
  id, recipientId, type (LeadCreated/TestDriveBooked/AppointmentReminder/MessageReceived), 
  linkedEntityId, linkedEntityType, read, createdAt, updatedAt
}
```

### B. State Management (Redux/Zustand)
**Location:** `src/store/`

Slices:
- **auth:** currentUser, isAuthenticated, role, permissions
- **leads:** allLeads, selectedLead, filters, sorting, pagination
- **vehicles:** inventory, filters, selectedVehicle, comparison
- **appointments:** upcomingAppointments, appointments
- **customers:** customers, selectedCustomer
- **dashboard:** kpis, pipeline, activityFeed, alerts
- **notifications:** toasts, realTimeAlerts
- **ui:** sidebarOpen, commandPaletteOpen, modalState

### C. Real-Time Updates
- WebSocket or polling for:
  - New leads → dealer CRM
  - Lead status changes
  - Appointment bookings
  - Notifications

---

## III. INFORMATION ARCHITECTURE → FILE STRUCTURE

Map the UX IA to the codebase:

```
AutoSuite_Final/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── [more base components]
│   │   ├── layouts/
│   │   │   ├── ConsumerLayout.tsx (navbar + footer)
│   │   │   ├── DealerLayout.tsx (sidebar + top bar)
│   │   │   └── PublicLayout.tsx (marketing pages)
│   │   ├── consumer/
│   │   │   ├── InventoryPage.tsx
│   │   │   ├── VehicleDetail.tsx
│   │   │   ├── ComparisonTool.tsx
│   │   │   ├── FinancingCalculator.tsx
│   │   │   ├── TradeInEstimator.tsx
│   │   │   ├── TestDriveBooking.tsx
│   │   │   ├── FavoritesPage.tsx
│   │   │   └── DealerLocations.tsx
│   │   ├── dealer/
│   │   │   ├── Dashboard/
│   │   │   │   ├── DealerDashboard.tsx
│   │   │   │   ├── KPIRow.tsx
│   │   │   │   ├── LeadPipelineFunnel.tsx
│   │   │   │   ├── UpcomingAppointments.tsx
│   │   │   │   ├── RecentlyAddedVehicles.tsx
│   │   │   │   ├── CustomerActivity.tsx
│   │   │   │   └── InventoryHealth.tsx
│   │   │   ├── CRM/
│   │   │   │   ├── CRMPage.tsx
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── LeadsTable.tsx
│   │   │   │   ├── LeadDetailPanel.tsx
│   │   │   │   ├── LeadCard.tsx
│   │   │   │   ├── ActivityTimeline.tsx
│   │   │   │   └── LeadFilters.tsx
│   │   │   ├── Inventory/
│   │   │   │   ├── InventoryPage.tsx
│   │   │   │   ├── VehicleList.tsx
│   │   │   │   ├── BulkActions.tsx
│   │   │   │   ├── VehicleForm.tsx
│   │   │   │   └── PhotoUpload.tsx
│   │   │   ├── Appointments/
│   │   │   │   ├── AppointmentsPage.tsx
│   │   │   │   ├── Calendar.tsx
│   │   │   │   ├── BookingRules.tsx
│   │   │   │   └── AppointmentDetail.tsx
│   │   │   ├── Analytics/
│   │   │   │   ├── AnalyticsPage.tsx
│   │   │   │   ├── FunnelChart.tsx
│   │   │   │   ├── RevenueChart.tsx
│   │   │   │   ├── ConversionChart.tsx
│   │   │   │   └── ReportBuilder.tsx
│   │   │   ├── Customers/
│   │   │   │   ├── CustomersPage.tsx
│   │   │   │   ├── CustomerProfile.tsx
│   │   │   │   └── PurchaseHistory.tsx
│   │   │   ├── Staff/
│   │   │   │   ├── StaffActivityPage.tsx
│   │   │   │   ├── ResponseTimeLeaderboard.tsx
│   │   │   │   └── ActivityLog.tsx
│   │   │   ├── Settings/
│   │   │   │   ├── SettingsPage.tsx
│   │   │   │   ├── DealershipProfile.tsx
│   │   │   │   ├── LeadRouting.tsx
│   │   │   │   ├── Billing.tsx
│   │   │   │   ├── TeamManagement.tsx
│   │   │   │   ├── Permissions.tsx
│   │   │   │   └── NotificationPreferences.tsx
│   │   └── marketing/
│   │       ├── HomePage.tsx
│   │       ├── PricingPage.tsx
│   │       ├── FAQPage.tsx
│   │       ├── DemoPage.tsx
│   │       ├── AboutPage.tsx
│   │       └── ContactPage.tsx
│   ├── design-system/
│   │   ├── tokens.ts (colors, typography, spacing, shadows)
│   │   ├── themes.ts (light/dark if needed)
│   │   └── globalStyles.css
│   ├── store/
│   │   ├── index.ts (Redux setup)
│   │   ├── slices/
│   │   │   ├── auth.ts
│   │   │   ├── leads.ts
│   │   │   ├── vehicles.ts
│   │   │   ├── appointments.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── ui.ts
│   │   │   └── notifications.ts
│   │   └── hooks.ts (useAppDispatch, useAppSelector)
│   ├── lib/
│   │   ├── api.ts (API client with auth)
│   │   ├── realtime.ts (WebSocket for lead updates)
│   │   ├── finance.ts (financing calculations)
│   │   ├── validation.ts (form validation schemas)
│   │   ├── conversions.ts (funnel tracking)
│   │   └── helpers.ts (utilities)
│   ├── hooks/
│   │   ├── useLeads.ts
│   │   ├── useVehicles.ts
│   │   ├── useDealership.ts
│   │   └── [domain-specific hooks]
│   ├── types/
│   │   ├── index.ts (re-exports all types)
│   │   ├── lead.ts
│   │   ├── vehicle.ts
│   │   ├── appointment.ts
│   │   ├── customer.ts
│   │   ├── dealership.ts
│   │   └── [more domain types]
│   └── pages/ or routes/
│       └── [route definitions]
├── api/ (API handlers)
│   ├── auth/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   └── logout.ts
│   ├── leads/
│   │   ├── [id].ts (GET, PATCH, DELETE)
│   │   ├── index.ts (GET all, POST new)
│   │   ├── [id]/status.ts (PATCH status)
│   │   └── [id]/assign.ts (PATCH assignment)
│   ├── vehicles/
│   │   ├── [id].ts
│   │   ├── index.ts
│   │   ├── [id]/photos.ts (upload)
│   │   └── [id]/bulk.ts (bulk update)
│   ├── appointments/
│   │   ├── [id].ts
│   │   └── index.ts
│   ├── customers/
│   │   ├── [id].ts
│   │   └── index.ts
│   ├── analytics/
│   │   ├── dashboard.ts
│   │   ├── funnel.ts
│   │   ├── revenue.ts
│   │   └── reports.ts
│   ├── notifications/
│   │   ├── [id].ts
│   │   └── index.ts
│   └── [more domain APIs]
├── prisma/
│   └── schema.prisma (full data model)
├── tests/
│   ├── unit/ (component + utility tests)
│   ├── integration/ (API + state flow tests)
│   └── e2e/ (full user journey tests)
├── docs/
│   └── [design specs, data models, etc.]
└── [config files: tsconfig, jest, vitest, env.example, etc.]
```

---

## IV. PHASE 1 – CORE CONVERSION FUNNEL (WEEKS 1–3)

### Priority: Implement the demo narrative end-to-end
**"Consumer books test drive → Lead appears in dealer's CRM instantly"**

### Phase 1 Scope

#### 1.1 Design System Foundation
- [ ] Create `src/design-system/tokens.ts` with all colors, typography, spacing
- [ ] Create base components: Button, Input, Card, Modal
- [ ] Create DealerLayout + ConsumerLayout
- [ ] Verify design tokens match spec (test with existing pages)

**Acceptance:** All spec colors/fonts/spacing used in code, not hardcoded

#### 1.2 Consumer – Vehicle Discovery & Booking
- [ ] Refactor `InventoryPage` to match UX spec
  - Filter bar (body, price, make, mileage)
  - Grid view with vehicle cards
  - Sorting dropdown
  - Responsive (desktop, tablet, mobile per spec)
- [ ] Implement `VehicleDetail` page (match spec exactly)
  - Hero gallery + thumbnails
  - 360° view trigger
  - Specs in grid
  - Vehicle history checklist
  - Dealer notes
  - "Book Test Drive" + "Contact Dealer" buttons
  - Success alert ("Available now...")
- [ ] Implement `FinancingCalculator` component
  - Down payment slider
  - Loan term slider
  - APR slider
  - Real-time monthly payment display
- [ ] Implement `TestDriveBooking` modal/form
  - Type selector (Test Drive / Inspection)
  - Date + time picker
  - Contact info confirmation
  - Submit → creates Lead in DB + real-time notify dealer

**Acceptance:**
- All three pages render with design spec styling
- Financing calculator recalculates on slider change
- Test drive form submits a Lead to the database
- Responsive at all breakpoints (test manually)

#### 1.3 Dealer – Real-Time Lead Reception
- [ ] Set up Prisma migrations for Lead, Vehicle, Appointment models
- [ ] Create CRM page with Kanban board view
  - Columns for each stage (New, Contacted, Qualified, Appt. Scheduled, Negotiating, Sold, Lost)
  - Lead cards with name, vehicle, source, avatar, priority dot
  - Card count per stage
  - Drag-and-drop between columns (react-beautiful-dnd or dnd-kit)
- [ ] Implement Lead Detail panel (side drawer or modal)
  - Customer info (name, email, phone)
  - Interested vehicle
  - Activity timeline (with timestamps)
  - Details card (source, assigned rep, priority, created date)
  - Tags (editable)
  - Tasks (editable, checkable)
- [ ] Implement real-time lead sync
  - WebSocket or polling endpoint (`/api/leads/stream` or similar)
  - When a test drive is booked on consumer side, it appears in dealer's CRM instantly
  - Auto-assign rule (round-robin if applicable)
  - Toast notification ("New lead: Maya Torres — BMW X6")

**Acceptance:**
- Dealer sees CRM board with populated stages
- Test drive booking from consumer → appears in New stage within 1–2 seconds
- Lead card shows all required fields (name, vehicle, source, avatar, priority)
- Drag-and-drop moves card + updates status in DB
- Lead Detail panel shows all data
- Notification fires when new lead arrives

#### 1.4 Dashboard Overview (Dealer)
- [ ] Create DealerDashboard with:
  - KPI row (4 cards: New Leads Today, Test Drives Booked, Revenue MTD, Avg. Response Time)
  - Lead Pipeline funnel (horizontal bar chart with stage counts)
  - Upcoming Appointments list
  - Recently Added Vehicles
  - Recent Customer Activity feed
  - Inventory Health metrics
- [ ] Wire KPIs to real data (counts from DB)
- [ ] Responsive layout (desktop first, mobile-friendly card stacking)

**Acceptance:**
- Dashboard displays correct KPI counts
- Lead pipeline funnel shows correct stage distribution
- Appointments list populates from DB
- All cards responsive

#### 1.5 Authentication & Layout
- [ ] Set up basic auth system
  - Login page (email/password)
  - Protect dealer routes
  - Store session (JWT or session cookie)
- [ ] Create DealerLayout with:
  - Left sidebar (dark background, per spec)
  - Logo + ⌘K search trigger
  - Nav items (Overview, CRM, Inventory, Appointments, Customers, Analytics, Staff Activity, Settings)
  - User profile at bottom
  - Responsive: hamburger menu on mobile
- [ ] Implement ConsumerLayout with navbar/footer

**Acceptance:**
- Login required for dealer pages
- Sidebar navigation works
- Responsive menu on mobile
- Sessions persist across page reload

#### 1.6 Data Models & API
- [ ] Expand Prisma schema:
  - Lead (carId FK, appointmentId FK, assignedTo FK, priority, tags, tasks)
  - Vehicle (full spec with images, history, etc.)
  - Appointment (leadId FK, vehicleId FK, type, dateTime, status)
  - Dealership (basic: id, name, email, address)
  - TeamMember (basic: id, dealershipId FK, name, email, role)
- [ ] Create API endpoints:
  - `POST /api/leads` (create from test drive booking)
  - `GET /api/leads` (list with pagination/filtering)
  - `PATCH /api/leads/[id]/status` (move stage on Kanban)
  - `GET /api/leads/stream` (real-time updates)
  - `GET /api/vehicles` (inventory listing)
  - `GET /api/vehicles/[id]` (detail)
  - `POST /api/appointments` (book appointment)
  - `GET /api/dashboard/kpis` (dashboard metrics)

**Acceptance:**
- All API endpoints return correct data shape
- Leads created on consumer side appear in dealer's list
- Status updates persist in DB
- Real-time updates work (test with 2 browser windows)

#### 1.7 Styling & Responsive Design
- [ ] Apply design system tokens throughout Phase 1 components
- [ ] Test responsive breakpoints:
  - Desktop (1280px+)
  - Tablet (768px–1279px)
  - Mobile (375px–767px)
- [ ] Verify all interactions per spec (hover, focus, active states)
- [ ] Ensure contrast ratios meet WCAG AA

**Acceptance:**
- All pages responsive and match spec at each breakpoint
- No hardcoded colors/fonts/spacing
- Interactions match spec mockups

#### 1.8 Testing
- [ ] Unit tests for components (Button, Input, Card, etc.)
- [ ] Integration tests for key flows:
  - Test drive booking → Lead creation
  - Lead status update
  - Real-time sync
- [ ] Manual acceptance test checklist (per UX spec)

**Acceptance:**
- All unit tests pass
- Integration tests demonstrate core narrative
- Manual checklist completed

---

## V. PHASE 2 – ENHANCE & POLISH (WEEKS 4–6)

### Consumer Experience
- [ ] Trade-in Estimator (full flow)
- [ ] Financing Application (soft-pull form, approval flow)
- [ ] Vehicle Comparison Tool (multi-select, side-by-side specs)
- [ ] Favorites / Saved Vehicles
- [ ] Dealer Locations / Contact info
- [ ] Marketing pages (About, Pricing, FAQ, Demo)

### Dealer OS – Operations
- [ ] Inventory Management
  - Vehicle list with Draft/Active/Featured/Sold status filters
  - Bulk actions (status change, price update)
  - Photo upload (drag-and-drop)
  - VIN decoder auto-fill
- [ ] Appointments / Calendar
  - Calendar view (month, week, day)
  - Booking rules (slots per rep, hours, buffer)
  - Appointment detail + notes
  - Reminders
- [ ] Customers page
  - Customer profiles (name, email, phone, address)
  - Purchase history per customer
  - Repeat purchase tracking
- [ ] Trade-in Queue (pending appraisals)
  - List of trade-ins waiting inspection
  - Status tracking
  - Appraisal history

### Dealer OS – Intelligence
- [ ] Analytics Dashboard
  - Funnel chart (traffic → lead → appt → sale)
  - Revenue chart (MTD, trend)
  - Conversion rate by source
  - Response time metrics
  - Leaderboard (sales per rep, response time)
- [ ] Reports (scheduled, exportable)
- [ ] Staff Activity (response times, action counts per rep)

### Quality & Performance
- [ ] Responsive design audit (all screens on mobile)
- [ ] Accessibility audit (WCAG AA)
  - Keyboard navigation
  - Screen reader testing
  - Color contrast
  - ARIA labels
- [ ] Performance (Core Web Vitals)
  - Image optimization + lazy loading
  - Code splitting
  - Bundle size review
  - LCP < 2.5s target
- [ ] Error states & edge cases
  - Empty states (no leads, no vehicles)
  - Loading states (spinners, skeletons)
  - Error boundaries
  - Network failure handling

---

## VI. PHASE 3 – QUALITY & LAUNCH (WEEKS 7–8)

### Complete Features
- [ ] Command Palette (⌘K search)
  - Search leads, vehicles, customers by name/ID
  - Quick navigation to pages
  - Recent items
- [ ] Notifications (real-time)
  - Lead created → rep notification
  - Appointment reminder (day before, 1 hour before)
  - Lead status change notification
  - Push notifications (if applicable)
- [ ] Settings & Permissions
  - Dealership profile (name, address, timezone)
  - Lead routing rules (round-robin, territory, skill-based)
  - Billing & subscription
  - Team management (invite, roles, deactivate)
  - Permissions (RBAC: Owner, Manager, Sales, BDC)
  - Notification preferences (channels, frequency)

### Final QA
- [ ] Full test suite (unit + integration + e2e)
- [ ] Regression testing (all workflows)
- [ ] Performance profiling
- [ ] Security review (auth, input validation, SQL injection, XSS)
- [ ] Accessibility final audit
- [ ] Browser/device testing (Chrome, Firefox, Safari, Edge, iOS, Android)
- [ ] Stakeholder review + UAT

### Launch Prep
- [ ] Documentation (API docs, user guide, admin guide)
- [ ] Deployment setup (CI/CD pipeline)
- [ ] Monitoring (error tracking, analytics)
- [ ] Support (help center, contact form)
- [ ] Launch checklist

---

## VII. TESTING STRATEGY

### Unit Tests (Vitest + React Testing Library)
- Each component rendered with design tokens
- Props validation
- Event handlers (click, input, drag, etc.)
- State updates

### Integration Tests
- Lead creation flow (consumer form → API → database → dealer notification)
- Lead status updates (drag card → API → real-time update)
- Authentication (login → session → protected routes)
- Dashboard data loading

### E2E Tests (Playwright/Cypress if applicable)
- End-to-end user journey (book test drive → dealer sees lead)
- CRM workflows (filter, drag, detail)
- Appointment booking
- Inventory management
- Analytics page loads correctly

### Manual Acceptance Tests
- Each UX mockup has a checklist
- Designer + QA review together
- Responsive testing at breakpoints
- Accessibility testing with screen readers

---

## VIII. DEVELOPMENT STANDARDS

### Code Quality
- TypeScript strict mode
- ESLint + Prettier
- No hardcoded values (use design tokens)
- Meaningful variable/component names
- No console errors/warnings

### Commit Messages
Reference UX spec artifacts:
```
feat(CRM): implement Kanban board with drag-and-drop

Maps to UX spec 05-CRM.dc.html. Enables sales reps to move leads
through pipeline visually. Drag-and-drop updates lead status in
real-time via PATCH /api/leads/[id]/status.

Acceptance: All stages render, drag updates DB, real-time sync works.
```

### PR/Merge Checklist
- [ ] Matches UX spec (feature-complete)
- [ ] Tests pass (unit + integration)
- [ ] Responsive at all breakpoints
- [ ] WCAG AA compliant
- [ ] No console errors
- [ ] Bundle size reasonable
- [ ] Commit message clear
- [ ] Linked to issue/spec artifact

---

## IX. SUCCESS CRITERIA

### Phase 1 Complete
- ✓ Core demo (book test drive → CRM lead appears) works end-to-end
- ✓ All UX screens for Phase 1 render per spec
- ✓ Real-time sync under 2 seconds
- ✓ Responsive at 3 breakpoints
- ✓ Authentication works
- ✓ Dashboard KPIs correct
- ✓ All Phase 1 tests pass

### Phase 2 Complete
- ✓ All consumer workflows (financing, trade-in, compare, favorites) implemented
- ✓ All dealer workflows (inventory, appointments, customers, analytics) implemented
- ✓ Responsive & accessible throughout
- ✓ Performance targets met (LCP < 2.5s)
- ✓ Full test coverage (unit + integration)

### Phase 3 / Launch
- ✓ Command palette working
- ✓ All notifications firing correctly
- ✓ Full permissions/RBAC system in place
- ✓ Zero critical bugs
- ✓ Stakeholder sign-off
- ✓ Live on production

---

## X. RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Real-time sync latency | Demo fails | Use WebSocket, fallback to polling; test early |
| Design token inconsistency | Visual debt | Centralize tokens, enforce via linting |
| Responsive design misses | Mobile users blocked | Test at breakpoints weekly |
| Auth complexity | Scope creep | Use simple JWT-based auth initially |
| Scope creep on Phase 1 | Delay launch | Lock Phase 1 scope; defer features to Phase 2 |
| Performance regression | Core Web Vitals fail | Profile early, set budgets per component |

---

## XI. NEXT STEPS

1. **Create `src/` folder structure** (as outlined in Section III)
2. **Build design system** (tokens, base components) — Phase 1.1
3. **Expand Prisma schema** — Phase 1.6
4. **Implement consumer → dealer flow** — Phase 1.2 through 1.4
5. **Set up real-time** — Phase 1.3
6. **Launch Phase 1 features** — EOW Week 3
7. **QA & iterate** → Phase 2 → Phase 3

---

**Owner:** Lead Software Engineer  
**Last Updated:** 2026-07-18
