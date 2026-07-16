/**
 * AutoSuite domain model.
 * Shared between the storefront UI, the leads API, and the dealer dashboard
 * so a single source of truth types every car and lead in the system.
 */

export type BodyStyle = 'Sedan' | 'SUV' | 'Coupe' | 'Truck';

export interface Car {
  /** URL-safe slug, e.g. "bmw-x6-2024". Used as the detail-route param. */
  id: string;
  brand: string;
  /** Full display name, e.g. "2024 BMW X6". */
  name: string;
  year: number;
  /** Price in Nigerian naira (NGN), stored as an integer. */
  price: number;
  /** Odometer reading in kilometres. Numeric so it can be sorted/formatted. */
  mileageKm: number;
  engine: string;
  horsepower: number;
  drivetrain: string;
  bodyStyle: BodyStyle;
  featured: boolean;
  /**
   * Ordered gallery, exterior shots first then interior. `images[0]` is the
   * hero. Paths are absolute from the public root (e.g. "/cars/bmw-x6-1.jpeg").
   */
  images: string[];
}

/**
 * The *active* subset of Prisma's `LeadStatus` enum (prisma/schema.prisma) —
 * matches `VALID_STATUSES` in api/leads/[id].js and `STAGES` in
 * js/dashboard.js exactly. Prisma's enum also has `SCHEDULED` and
 * `COMPLETED`, kept there only so `prisma db push` never has to drop a value
 * a live row might still reference; both are intentionally excluded here.
 * If you add a value, add it in all three places.
 */
export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'APPT_SCHEDULED'
  | 'NEGOTIATING'
  | 'SOLD'
  | 'LOST';

export type LeadSource = 'test-drive-modal' | 'trade-in-estimator';

export interface Lead {
  id: string;
  carId: string | null;
  carName: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by POST /api/leads. */
export interface NewLeadInput {
  carId?: string | null;
  carName: string;
  name: string;
  email: string;
  phone: string;
  source?: LeadSource;
}
