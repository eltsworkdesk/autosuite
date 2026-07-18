import { describe, it, expect } from 'vitest';
import { formatNaira, sortCars, filterCars, parseMileageKm } from '../js/lib/inventory.js';

const cars = [
  { id: 'a', name: 'BMW X6', brand: 'BMW', bodyStyle: 'SUV', price: 52000000, year: 2024, mileage: '6,200 km', featured: true },
  { id: 'b', name: 'Porsche Cayenne', brand: 'Porsche', bodyStyle: 'SUV', price: 68000000, year: 2025, mileage: '3,100 km', featured: true },
  { id: 'c', name: 'Toyota Camry', brand: 'Toyota', bodyStyle: 'Sedan', price: 24500000, year: 2023, mileage: '18,000 km', featured: false },
  { id: 'd', name: 'BMW 5 Series', brand: 'BMW', bodyStyle: 'Sedan', price: 33000000, year: 2018, mileage: '45,000 km', featured: false },
];

describe('formatNaira', () => {
  it('prefixes the naira sign and groups thousands', () => {
    expect(formatNaira(52000000)).toBe('₦52,000,000');
  });

  it('handles zero', () => {
    expect(formatNaira(0)).toBe('₦0');
  });
});

describe('filterCars', () => {
  it('returns everything when no filters are given', () => {
    expect(filterCars(cars)).toHaveLength(4);
  });

  it('matches by name, case-insensitively', () => {
    const results = filterCars(cars, { query: 'camry' });
    expect(results.map((c) => c.id)).toEqual(['c']);
  });

  it('matches by brand as well as name', () => {
    const results = filterCars(cars, { query: 'bmw' });
    expect(results.map((c) => c.id).sort()).toEqual(['a', 'd']);
  });

  it('filters by a single make', () => {
    const results = filterCars(cars, { brands: ['Porsche'] });
    expect(results.map((c) => c.id)).toEqual(['b']);
  });

  it('filters by multiple makes (OR within the facet)', () => {
    const results = filterCars(cars, { brands: ['Porsche', 'Toyota'] });
    expect(results.map((c) => c.id).sort()).toEqual(['b', 'c']);
  });

  it('filters by body style', () => {
    const results = filterCars(cars, { bodyStyles: ['Sedan'] });
    expect(results.map((c) => c.id).sort()).toEqual(['c', 'd']);
  });

  it('treats empty facet arrays as "all"', () => {
    expect(filterCars(cars, { brands: [], bodyStyles: [] })).toHaveLength(4);
  });

  it('filters by max price, inclusive', () => {
    const results = filterCars(cars, { maxPrice: 33000000 });
    expect(results.map((c) => c.id).sort()).toEqual(['c', 'd']);
  });

  it('filters by max mileage, inclusive, parsing the formatted string', () => {
    const results = filterCars(cars, { maxMileage: 10000 });
    expect(results.map((c) => c.id).sort()).toEqual(['a', 'b']);
  });

  it('combines query, make, body style, price, and mileage', () => {
    // BMW + Sedan + under ₦40M + under 50k km -> only the 5 Series
    const results = filterCars(cars, { brands: ['BMW'], bodyStyles: ['Sedan'], maxPrice: 40000000, maxMileage: 50000 });
    expect(results.map((c) => c.id)).toEqual(['d']);
  });

  it('AND across facets: a make with no matching body style yields nothing', () => {
    const results = filterCars(cars, { brands: ['Toyota'], bodyStyles: ['SUV'] });
    expect(results).toHaveLength(0);
  });
});

describe('parseMileageKm', () => {
  it('parses a formatted mileage string to a number', () => {
    expect(parseMileageKm('6,200 km')).toBe(6200);
    expect(parseMileageKm('45,000 km')).toBe(45000);
  });

  it('returns Infinity for an unparseable value so it is never wrongly excluded', () => {
    expect(parseMileageKm('')).toBe(Infinity);
    expect(parseMileageKm(null)).toBe(Infinity);
    expect(parseMileageKm(undefined)).toBe(Infinity);
  });
});

describe('sortCars', () => {
  it('sorts by price ascending', () => {
    const results = sortCars(cars, 'price-asc');
    expect(results.map((c) => c.id)).toEqual(['c', 'd', 'a', 'b']);
  });

  it('sorts by price descending', () => {
    const results = sortCars(cars, 'price-desc');
    expect(results.map((c) => c.id)).toEqual(['b', 'a', 'd', 'c']);
  });

  it('sorts by newest year first', () => {
    const results = sortCars(cars, 'year-desc');
    expect(results.map((c) => c.id)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('defaults to featured-first, stable otherwise', () => {
    const results = sortCars(cars, 'default');
    expect(results.map((c) => c.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('does not mutate the input array', () => {
    const copy = [...cars];
    sortCars(cars, 'price-asc');
    expect(cars).toEqual(copy);
  });
});
