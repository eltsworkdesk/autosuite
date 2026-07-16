import { describe, it, expect } from 'vitest';
import { calculateMonthlyPayment } from '../js/lib/finance.js';

describe('calculateMonthlyPayment', () => {
  it('matches the standard amortization formula for a typical loan', () => {
    // ₦45,000,000 car, 10% down, 60 months, 18% APR
    const monthly = calculateMonthlyPayment({ price: 45000000, downPct: 10, termMonths: 60, aprPct: 18 });
    // principal = 40,500,000; verified against the closed-form amortization formula independently
    expect(monthly).toBeCloseTo(1028433.81, 1);
  });

  it('falls back to simple division when APR is 0', () => {
    const monthly = calculateMonthlyPayment({ price: 24000000, downPct: 0, termMonths: 24, aprPct: 0 });
    expect(monthly).toBeCloseTo(1000000, 5);
  });

  it('a 100% down payment reduces the monthly payment to zero', () => {
    const monthly = calculateMonthlyPayment({ price: 30000000, downPct: 100, termMonths: 60, aprPct: 15 });
    expect(monthly).toBe(0);
  });

  it('never returns a negative payment', () => {
    const monthly = calculateMonthlyPayment({ price: 10000000, downPct: 50, termMonths: 84, aprPct: 30 });
    expect(monthly).toBeGreaterThanOrEqual(0);
  });

  it('a larger down payment lowers the monthly payment, all else equal', () => {
    const lowDown = calculateMonthlyPayment({ price: 50000000, downPct: 10, termMonths: 60, aprPct: 18 });
    const highDown = calculateMonthlyPayment({ price: 50000000, downPct: 40, termMonths: 60, aprPct: 18 });
    expect(highDown).toBeLessThan(lowDown);
  });

  it('a longer term lowers the monthly payment, all else equal', () => {
    const shortTerm = calculateMonthlyPayment({ price: 50000000, downPct: 10, termMonths: 36, aprPct: 18 });
    const longTerm = calculateMonthlyPayment({ price: 50000000, downPct: 10, termMonths: 84, aprPct: 18 });
    expect(longTerm).toBeLessThan(shortTerm);
  });
});
