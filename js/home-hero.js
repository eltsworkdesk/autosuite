/**
 * AutoSuite — homepage hero sequence.
 *
 * Demonstrates the product's core claim instead of illustrating it: a booking
 * fires on the storefront card, a packet travels the wire, and on arrival the
 * dashboard mockup actually reacts (counter increments, a new lead row lands,
 * the live-sync pill flashes). Then it resets and loops.
 *
 * The waypoints below are percentages that mirror the SVG path in index.html.
 * Both live in the same stretched coordinate space (the wire uses
 * preserveAspectRatio="none"), so animating the packet with left/top
 * percentages keeps it glued to the line at any container size — no
 * getPointAtLength/viewBox conversion needed.
 *
 * Under prefers-reduced-motion nothing animates: the hero renders the finished
 * state (19 leads, new row present) so the story still reads, statically.
 */
(function () {
  'use strict';

  const stage = document.querySelector('.hero-media');
  if (!stage) return;

  const packet = document.getElementById('heroPacket');
  const sourceBtn = document.getElementById('heroSourceBtn');
  const leadsStat = document.getElementById('heroLeadsStat');
  const leadsValue = document.getElementById('heroLeadsToday');
  const leadsList = document.getElementById('heroLeadsList');
  const livePill = document.querySelector('.hero-dash-live');
  const replay = document.getElementById('heroReplay');
  if (!packet || !leadsValue || !leadsList) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WAYPOINTS = [[26, 88], [52, 88], [52, 74], [78, 74]];
  const TRAVEL_MS = 1500;
  const BASE_LEADS = parseInt(leadsValue.textContent, 10) || 18;

  const NEW_LEAD = {
    name: 'Dana R.',
    detail: 'Test drive booked',
    time: 'now',
  };

  // Precompute segment lengths so the packet moves at a constant speed
  // rather than spending equal time on unequal segments.
  const segments = [];
  let total = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const [x1, y1] = WAYPOINTS[i];
    const [x2, y2] = WAYPOINTS[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    segments.push({ x1, y1, x2, y2, len });
    total += len;
  }

  function positionAt(progress) {
    let travelled = progress * total;
    for (const s of segments) {
      if (travelled <= s.len || s === segments[segments.length - 1]) {
        const t = s.len === 0 ? 0 : Math.min(travelled / s.len, 1);
        return [s.x1 + (s.x2 - s.x1) * t, s.y1 + (s.y2 - s.y1) * t];
      }
      travelled -= s.len;
    }
    return WAYPOINTS[WAYPOINTS.length - 1];
  }

  function buildLeadRow() {
    const li = document.createElement('li');
    li.className = 'is-new';
    li.innerHTML =
      '<span class="hero-dash-avatar"></span>' +
      '<span class="hero-dash-lead-text"><strong></strong><small></small></span>' +
      '<time></time>';
    li.querySelector('strong').textContent = NEW_LEAD.name;
    li.querySelector('small').textContent = NEW_LEAD.detail;
    li.querySelector('time').textContent = NEW_LEAD.time;
    return li;
  }

  /* ---------- Static end state for reduced motion ---------- */
  if (reduced) {
    leadsValue.textContent = BASE_LEADS + 1;
    const row = buildLeadRow();
    row.classList.remove('is-new');
    leadsList.insertBefore(row, leadsList.firstChild);
    if (leadsList.children.length > 4) leadsList.lastElementChild.remove();
    return;
  }

  let rafId = null;
  let timers = [];
  let addedRow = null;

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function clearAll() {
    timers.forEach(clearTimeout);
    timers = [];
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function reset() {
    packet.classList.remove('is-travelling');
    if (sourceBtn) sourceBtn.classList.remove('is-pressed');
    if (leadsStat) leadsStat.classList.remove('is-hit');
    leadsValue.classList.remove('is-bumped');
    if (livePill) livePill.classList.remove('is-flashing');
    leadsValue.textContent = BASE_LEADS;
    if (addedRow && addedRow.parentNode) addedRow.remove();
    addedRow = null;
  }

  function travel(onArrive) {
    const start = performance.now();
    packet.classList.add('is-travelling');
    (function step(now) {
      const p = Math.min((now - start) / TRAVEL_MS, 1);
      // Ease-in-out so the packet leaves and lands softly.
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const [x, y] = positionAt(eased);
      packet.style.left = x + '%';
      packet.style.top = y + '%';
      if (p < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        packet.classList.remove('is-travelling');
        onArrive();
      }
    })(start);
  }

  function runCycle() {
    clearAll();
    reset();

    // 1. The customer taps Book Test Drive.
    later(function () {
      if (sourceBtn) sourceBtn.classList.add('is-pressed');
      later(function () {
        if (sourceBtn) sourceBtn.classList.remove('is-pressed');
      }, 220);
    }, 500);

    // 2. The booking travels to the dealer OS.
    later(function () {
      travel(function () {
        // 3. The board reacts.
        leadsValue.textContent = BASE_LEADS + 1;
        leadsValue.classList.add('is-bumped');
        if (leadsStat) leadsStat.classList.add('is-hit');
        if (livePill) livePill.classList.add('is-flashing');

        addedRow = buildLeadRow();
        leadsList.insertBefore(addedRow, leadsList.firstChild);
        if (leadsList.children.length > 4) leadsList.lastElementChild.remove();
      });
    }, 900);

    // 4. Hold the result, then loop.
    later(runCycle, 7600);
  }

  if (replay) {
    replay.addEventListener('click', runCycle);
  }

  // Only run while the hero is actually on screen — no point burning frames
  // on a loop nobody is looking at.
  if ('IntersectionObserver' in window) {
    let running = false;
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !running) {
          running = true;
          runCycle();
        } else if (!entry.isIntersecting && running) {
          running = false;
          clearAll();
          reset();
        }
      });
    }, { threshold: 0.2 });
    io.observe(stage);
  } else {
    runCycle();
  }
})();
