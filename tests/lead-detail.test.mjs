import { describe, it, expect } from 'vitest';
import { priorityColor, synthesizeTimeline, PRIORITY_COLORS } from '../js/lib/lead-detail.js';

describe('priorityColor', () => {
  it('returns the matching color for each known priority', () => {
    expect(priorityColor('Low')).toBe(PRIORITY_COLORS.Low);
    expect(priorityColor('Normal')).toBe(PRIORITY_COLORS.Normal);
    expect(priorityColor('High')).toBe(PRIORITY_COLORS.High);
  });

  it('falls back to Normal for an unknown or missing priority', () => {
    expect(priorityColor('Urgent')).toBe(PRIORITY_COLORS.Normal);
    expect(priorityColor(undefined)).toBe(PRIORITY_COLORS.Normal);
  });
});

describe('synthesizeTimeline', () => {
  it('describes a test-drive lead with the vehicle name', () => {
    const events = synthesizeTimeline({
      createdAt: '2026-07-01T10:00:00.000Z',
      updatedAt: '2026-07-01T10:00:00.000Z',
      source: 'test-drive-modal',
      carName: '2024 BMW X6',
      statusLabel: 'New',
    });
    expect(events).toHaveLength(1);
    expect(events[0].text).toBe('Booked a test drive for 2024 BMW X6');
    expect(events[0].when).toBe('2026-07-01T10:00:00.000Z');
  });

  it('describes a trade-in lead without needing the vehicle name', () => {
    const events = synthesizeTimeline({
      createdAt: '2026-07-01T10:00:00.000Z',
      updatedAt: '2026-07-01T10:00:00.000Z',
      source: 'trade-in-estimator',
      carName: 'Trade-in: 2019 Honda Accord',
      statusLabel: 'New',
    });
    expect(events[0].text).toBe('Requested a trade-in estimate');
  });

  it('adds a status-change entry only when updatedAt meaningfully differs from createdAt', () => {
    const unchanged = synthesizeTimeline({
      createdAt: '2026-07-01T10:00:00.000Z',
      updatedAt: '2026-07-01T10:00:00.000Z',
      source: 'test-drive-modal',
      carName: 'Camry',
      statusLabel: 'New',
    });
    expect(unchanged).toHaveLength(1);

    const changed = synthesizeTimeline({
      createdAt: '2026-07-01T10:00:00.000Z',
      updatedAt: '2026-07-02T09:00:00.000Z',
      source: 'test-drive-modal',
      carName: 'Camry',
      statusLabel: 'Negotiating',
    });
    expect(changed).toHaveLength(2);
    expect(changed[1].text).toBe('Status changed to Negotiating');
  });

  it('ignores sub-5-second gaps between createdAt and updatedAt (Prisma insert noise)', () => {
    const events = synthesizeTimeline({
      createdAt: '2026-07-01T10:00:00.000Z',
      updatedAt: '2026-07-01T10:00:00.002Z',
      source: 'test-drive-modal',
      carName: 'Camry',
      statusLabel: 'New',
    });
    expect(events).toHaveLength(1);
  });

  it('events are ordered oldest first', () => {
    const events = synthesizeTimeline({
      createdAt: '2026-07-01T10:00:00.000Z',
      updatedAt: '2026-07-03T10:00:00.000Z',
      source: 'test-drive-modal',
      carName: 'Camry',
      statusLabel: 'Sold',
    });
    expect(events[0].when < events[1].when).toBe(true);
  });
});
