/**
 * AutoSuite — pure Lead Detail logic (priority colors, activity timeline).
 * No DOM access, so it's usable both as a plain browser script
 * (window.AutoSuiteLeadDetail) and from Node/Vitest (module.exports).
 *
 * The timeline is *synthesized* from fields the Lead already has
 * (createdAt/updatedAt/source/status) rather than stored as its own log —
 * there's no event-history table, so this is what's honestly knowable.
 */
(function (root, factory) {
  const lib = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = lib;
  }
  if (root) {
    root.AutoSuiteLeadDetail = lib;
  }
})(typeof window !== 'undefined' ? window : undefined, function () {
  const PRIORITY_COLORS = {
    Low: 'oklch(60% 0.01 260)',
    Normal: 'oklch(50% 0.12 235)',
    High: 'oklch(58% 0.18 25)',
  };

  function priorityColor(priority) {
    return PRIORITY_COLORS[priority] || PRIORITY_COLORS.Normal;
  }

  const SOURCE_LABELS = {
    'test-drive-modal': (carName) => `Booked a test drive for ${carName}`,
    'trade-in-estimator': () => 'Requested a trade-in estimate',
  };

  /**
   * @param {{createdAt: string, updatedAt: string, source: string, carName: string, statusLabel: string}} lead
   * @returns {Array<{text: string, when: string}>} oldest first
   */
  function synthesizeTimeline(lead) {
    const events = [];
    const describeCreated = SOURCE_LABELS[lead.source] || (() => 'Lead created');
    events.push({ text: describeCreated(lead.carName), when: lead.createdAt });

    const created = new Date(lead.createdAt).getTime();
    const updated = new Date(lead.updatedAt).getTime();
    // More than a few seconds apart means something actually changed after
    // creation (status update) — not just Prisma's identical createdAt/
    // updatedAt on insert.
    if (updated - created > 5000) {
      events.push({ text: `Status changed to ${lead.statusLabel}`, when: lead.updatedAt });
    }

    return events;
  }

  return { priorityColor, synthesizeTimeline, PRIORITY_COLORS };
});
