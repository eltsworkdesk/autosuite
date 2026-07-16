import type { Car } from '../types/car';

/**
 * NOT YET LIVE. This is a typed preview of the inventory model — nothing
 * imports this file yet. The site still runs on data/cars.json + data/cars.js
 * (loaded by every HTML page and read by js/cars-data.js); don't delete those
 * until something actually consumes this module.
 *
 * Why it exists: a shared, typed `Car` shape for the storefront, the leads
 * API, and the dealer dashboard to eventually converge on, with a richer
 * per-vehicle photo set than the single hero + 2 thumbnails cars.json ships
 * today. `mileageKm` (number) replaces cars.json's `mileage` (formatted
 * string, e.g. "6,200 km") so it can be sorted/computed on directly.
 *
 * Each car's `images` is its full exterior + interior gallery, read straight
 * from assets/cars/ (the renamed, high-res originals) via an absolute path —
 * vercel.json serves the repo root as static (`outputDirectory: "."`, no
 * framework), so `/assets/cars/<file>` resolves without any extra build step.
 */
export const cars: Car[] = [
  {
    id: 'bmw-x6-2024',
    brand: 'BMW',
    name: '2024 BMW X6 xDrive40i',
    year: 2024,
    price: 52000000,
    mileageKm: 6200,
    engine: '3.0L Turbo I6',
    horsepower: 335,
    drivetrain: 'All-Wheel Drive',
    bodyStyle: 'SUV',
    featured: true,
    images: [
      '/assets/cars/2024-x6-exterior1.jpeg', '/assets/cars/2024-x6-exterior2.jpeg', '/assets/cars/2024-x6-exterior3.jpeg',
      '/assets/cars/2024-x6-exterior4.jpeg', '/assets/cars/2024-x6-exterior5.jpeg',
      '/assets/cars/2024-x6-interior1.jpeg', '/assets/cars/2024-x6-interior2.jpeg', '/assets/cars/2024-x6-interior3.jpeg',
      '/assets/cars/2024-x6-interior4.jpeg', '/assets/cars/2024-x6-interior5.jpeg', '/assets/cars/2024-x6-interior6.jpeg',
    ],
  },
  {
    id: 'mercedes-e350-2024',
    brand: 'Mercedes-Benz',
    name: '2024 Mercedes-Benz E350',
    year: 2024,
    price: 42000000,
    mileageKm: 8500,
    engine: '2.0L Turbo I4',
    horsepower: 255,
    drivetrain: 'All-Wheel Drive',
    bodyStyle: 'Sedan',
    featured: true,
    images: [
      '/assets/cars/2024-E350-exterior1.jpeg', '/assets/cars/2024-E350-exterior2.jpeg', '/assets/cars/2024-E350-exterior3.jpeg',
      '/assets/cars/2024-E350-exterior4.jpeg',
      '/assets/cars/2024-E350-interior1.jpeg', '/assets/cars/2024-E350-interior2.jpeg', '/assets/cars/2024-E350-interior3.jpeg',
      '/assets/cars/2024-E350-interior4.jpeg',
    ],
  },
  {
    id: 'porsche-cayenne-2025',
    brand: 'Porsche',
    name: '2025 Porsche Cayenne',
    year: 2025,
    price: 68000000,
    mileageKm: 3100,
    engine: '3.0L V6 Turbo',
    horsepower: 348,
    drivetrain: 'All-Wheel Drive',
    bodyStyle: 'SUV',
    featured: true,
    images: [
      '/assets/cars/porsche-cayenne-exterior1.jpeg', '/assets/cars/porsche-cayenne-exterior2.jpeg', '/assets/cars/porsche-cayenne-exterior3.jpeg',
      '/assets/cars/porsche-cayenne-exterior4.jpeg', '/assets/cars/porsche-cayenne-exterior5.jpeg',
      '/assets/cars/porsche-cayenne-interior1.jpeg', '/assets/cars/porsche-cayenne-interior2.jpeg', '/assets/cars/porsche-cayenne-interior3.jpeg',
      '/assets/cars/porsche-cayenne-interior4.jpeg', '/assets/cars/porsche-cayenne-interior5.jpeg',
    ],
  },
  {
    id: 'amg-g63-2025',
    brand: 'Mercedes-Benz',
    name: '2025 Mercedes-AMG G63',
    year: 2025,
    price: 145000000,
    mileageKm: 1800,
    engine: '4.0L V8 Biturbo',
    horsepower: 577,
    drivetrain: 'All-Wheel Drive',
    bodyStyle: 'SUV',
    featured: true,
    images: [
      '/assets/cars/2025-g63-exterior1.jpeg', '/assets/cars/2025-g63-exterior2.jpeg', '/assets/cars/2025-g63-exterior3.jpeg',
      '/assets/cars/2025-g63-exterior4.jpeg', '/assets/cars/2025-g63-exterior5.jpeg',
      '/assets/cars/2025-g63-interior1.jpeg', '/assets/cars/2025-g63-interior2.jpeg', '/assets/cars/2025-g63-interior3.jpeg',
      '/assets/cars/2025-g63-interior4.jpeg', '/assets/cars/2025-g63-interior5.jpeg',
    ],
  },
  {
    id: 'gle53-amg-2023',
    brand: 'Mercedes-Benz',
    name: '2023 Mercedes-AMG GLE 53',
    year: 2023,
    price: 78000000,
    mileageKm: 12400,
    engine: '3.0L Turbo I6 Hybrid',
    horsepower: 429,
    drivetrain: 'All-Wheel Drive',
    bodyStyle: 'SUV',
    featured: false,
    images: [
      '/assets/cars/gle-53-amg-exterior1.jpeg', '/assets/cars/gle-53-amg-exterior2.jpeg', '/assets/cars/gle-53-amg-exterior3.jpeg',
      '/assets/cars/gle-53-amg-interior1.jpeg', '/assets/cars/gle-53-amg-interior2.jpeg', '/assets/cars/gle-53-amg-interior3.jpeg',
      '/assets/cars/gle-53-amg-interior4.jpeg',
    ],
  },
  {
    id: 'cadillac-escalade-2025',
    brand: 'Cadillac',
    name: '2025 Cadillac Escalade',
    year: 2025,
    price: 95000000,
    mileageKm: 4500,
    engine: '6.2L V8',
    horsepower: 420,
    drivetrain: '4WD',
    bodyStyle: 'SUV',
    featured: false,
    images: [
      '/assets/cars/2025-cadilac-escalade-exterior1.jpeg', '/assets/cars/2025-cadilac-escalade-exterior2.jpeg',
      '/assets/cars/2025-cadilac-escalade-interior1.jpeg', '/assets/cars/2025-cadilac-escalade-interior2.jpeg',
      '/assets/cars/2025-cadilac-escalade-interior3.jpeg', '/assets/cars/2025-cadilac-escalade-interior4.jpeg',
      '/assets/cars/2025-cadilac-escalade-interior5.jpeg',
    ],
  },
  {
    id: 'lexus-gx550-2025',
    brand: 'Lexus',
    name: '2025 Lexus GX 550',
    year: 2025,
    price: 72000000,
    mileageKm: 2000,
    engine: '3.4L Twin-Turbo V6',
    horsepower: 349,
    drivetrain: '4WD',
    bodyStyle: 'SUV',
    featured: false,
    images: [
      '/assets/cars/2025-Gx550-exterior1.jpeg', '/assets/cars/2025-Gx550-exterior2.jpeg', '/assets/cars/2025-Gx550-exterior3.jpeg',
      '/assets/cars/2025-Gx550-exterior4.jpeg',
      '/assets/cars/2025-Gx550-interior1.jpeg', '/assets/cars/2025-Gx550-interior2.jpeg', '/assets/cars/2025-Gx550-interior3.jpeg',
      '/assets/cars/2025-Gx550-interior4.jpeg',
    ],
  },
  {
    id: 'lexus-gx460-2022',
    brand: 'Lexus',
    name: '2022 Lexus GX 460',
    year: 2022,
    price: 58000000,
    mileageKm: 22000,
    engine: '4.6L V8',
    horsepower: 301,
    drivetrain: '4WD',
    bodyStyle: 'SUV',
    featured: false,
    images: [
      '/assets/cars/lexus-gx460-exterior1.jpeg', '/assets/cars/lexus-gx460-exterior2.jpeg', '/assets/cars/lexus-gx460-exterior3.jpeg',
      '/assets/cars/lexus-gx460-exterior4.jpeg',
      '/assets/cars/lexus-gx460-interior1.jpeg', '/assets/cars/lexus-gx460-interior2.jpeg', '/assets/cars/lexus-gx460-interior3.jpeg',
      '/assets/cars/lexus-gx460-interior4.jpeg', '/assets/cars/lexus-gx460-interior5.jpeg',
    ],
  },
  {
    id: 'mercedes-glc300-2025',
    brand: 'Mercedes-Benz',
    name: '2025 Mercedes-Benz GLC 300',
    year: 2025,
    price: 42000000,
    mileageKm: 5000,
    engine: '2.0L Turbo I4',
    horsepower: 255,
    drivetrain: 'All-Wheel Drive',
    bodyStyle: 'SUV',
    featured: false,
    images: [
      '/assets/cars/2025-glc300-exterior1.jpeg', '/assets/cars/2025-glc300-exterior2.jpeg', '/assets/cars/2025-glc300-exterior3.jpeg',
      '/assets/cars/2025-glc300-exterior4.jpeg',
      '/assets/cars/2025-glc300-interior1.jpeg', '/assets/cars/2025-glc300-interior2.jpeg', '/assets/cars/2025-glc300-interior3.jpeg',
      '/assets/cars/2025-glc300-interior4.jpeg', '/assets/cars/2025-glc300-interior5.jpeg', '/assets/cars/2025-glc300-interior6.jpeg',
    ],
  },
  {
    id: 'toyota-camry-2023',
    brand: 'Toyota',
    name: '2023 Toyota Camry XSE',
    year: 2023,
    price: 24500000,
    mileageKm: 18000,
    engine: '2.5L I4',
    horsepower: 203,
    drivetrain: 'Front-Wheel Drive',
    bodyStyle: 'Sedan',
    featured: false,
    images: [
      '/assets/cars/2023-camry-exterior1.jpeg', '/assets/cars/2023-camry-exterior2.jpeg', '/assets/cars/2023-camry-exterior3.jpeg',
      '/assets/cars/2023-camry-exterior4.jpeg',
      '/assets/cars/2023-camry-interior1.jpeg', '/assets/cars/2023-camry-interior2.jpeg', '/assets/cars/2023-camry-interior3.jpeg',
      '/assets/cars/2023-camry-interior4.jpeg',
    ],
  },
];

export function getCar(id: string): Car | undefined {
  return cars.find((c) => c.id === id);
}
