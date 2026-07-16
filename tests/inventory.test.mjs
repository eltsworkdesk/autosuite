import { describe, it, expect } from 'vitest';
import { formatNaira, sortCars, filterCars } from '../js/lib/inventory.js';

const cars = [
  { id: 'a', name: 'BMW X6', brand: 'BMW', price: 52000000, year: 2024, featured: true },
  { id: 'b', name: 'Porsche Cayenne', brand: 'Porsche', price: 68000000, year: 2025, featured: true },
  { id: 'c', name: 'Toyota Camry', brand: 'Toyota', price: 24500000, year: 2023, featured: false },
  { id: 'd', name: 'BMW 5 Series', brand: 'BMW', price: 33000000, year: 2018, featured: false },
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

  it('filters by exact brand', () => {
    const results = filterCars(cars, { brand: 'Porsche' });
    expect(results.map((c) => c.id)).toEqual(['b']);
  });

  it('filters by max price, inclusive', () => {
    const results = filterCars(cars, { maxPrice: 33000000 });
    expect(results.map((c) => c.id).sort()).toEqual(['c', 'd']);
  });

  it('combines query, brand, and price filters', () => {
    const results = filterCars(cars, { query: 'bmw', brand: 'BMW', maxPrice: 40000000 });
    expect(results.map((c) => c.id)).toEqual(['d']);
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
