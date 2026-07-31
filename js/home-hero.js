/**
 * AutoSuite — homepage hero simulation.
 *
 * The hero doesn't illustrate the product claim, it runs it. Pressing "Book
 * Test Drive" on the customer device spawns a packet that travels the sync
 * line, lands on the dealer board as a real lead card, then walks that card
 * through the pipeline — New -> Assigned -> Contacted -> Sold — stamping a
 * timestamped log line at each step.
 *
 * The whole thing is a small state machine over STEPS below. Nothing here
 * knows about layout: the script only toggles .is-arrived on the packet and
 * the stylesheet decides whether "arrived" means the far right (desktop,
 * side-by-side) or the bottom (mobile, stacked).
 *
 * Under prefers-reduced-motion the sequence is rendered in its finished state
 * on load — same story, no movement.
 */
(function () {
  'use strict';

  const sim = document.getElementById('heroSim');
  if (!sim) return;

  const book = document.getElementById('simBook');
  const packet = document.getElementById('simPacket');
  const slot = document.getElementById('simSlot');
  const empty = document.getElementById('simEmpty');
  const lead = document.getElementById('simLead');
  const badge = document.getElementById('simBadge');
  const log = document.getElementById('simLog');
  const replay = document.getElementById('heroReplay');
  if (!book || !packet || !lead || !badge || !log) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TRAVEL_MS = 1100;

  // Real names and clock times, because "Lead #4821 / +1" is a database row and
  // this is meant to read as a person moving through a dealership.
  const STEPS = [
    { badge: 'New', cls: '', time: '10:42 AM', text: 'Booked by David M.', after: 0 },
    { badge: 'Assigned', cls: 'is-assigned', time: '10:45 AM', text: 'Assigned to Sarah O.', after: 1500 },
    { badge: 'Contacted', cls: 'is-contacted', time: '11:07 AM', text: 'Sarah called — confirmed', after: 1500 },
    { badge: 'Sold', cls: 'is-sold', time: 'Day 4', text: 'Closed — ₦52,000,000', after: 1800 },
  ];

  const BADGE_CLASSES = ['is-assigned', 'is-contacted', 'is-sold'];

  let timers = [];
  let running = false;

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function clearAll() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function applyStep(step) {
    badge.textContent = step.badge;
    badge.classList.remove.apply(badge.classList, BADGE_CLASSES);
    if (step.cls) badge.classList.add(step.cls);

    const li = document.createElement('li');
    const time = document.createElement('time');
    time.textContent = step.time;
    const span = document.createElement('span');
    span.textContent = step.text;
    li.appendChild(time);
    li.appendChild(span);
    log.appendChild(li);
  }

  function flip(step) {
    badge.classList.remove('is-flipping');
    // Force a reflow so re-adding the class restarts the animation rather than
    // being coalesced into a no-op.
    void badge.offsetWidth;
    badge.classList.add('is-flipping');
    applyStep(step);
  }

  function celebrate() {
    if (!slot) return;
    const colors = ['var(--brand-accent)', 'var(--brand-blue-light)', 'var(--success-on-dark)'];
    for (let i = 0; i < 14; i++) {
      const bit = document.createElement('span');
      bit.className = 'sim-confetti';
      bit.setAttribute('aria-hidden', 'true');
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
      const dist = 48 + Math.random() * 46;
      bit.style.setProperty('--cx', Math.cos(angle) * dist + 'px');
      bit.style.setProperty('--cy', Math.sin(angle) * dist + 40 + 'px');
      bit.style.setProperty('--cr', Math.round(Math.random() * 540 - 270) + 'deg');
      bit.style.background = colors[i % colors.length];
      slot.appendChild(bit);
      later(function () { bit.remove(); }, 1000);
    }
  }

  function reset() {
    clearAll();
    packet.classList.remove('is-live');
    // Kill the transition for one frame so the packet jumps home instead of
    // gliding backwards along the wire.
    packet.classList.add('no-anim');
    packet.classList.remove('is-arrived');
    void packet.offsetWidth;
    packet.classList.remove('no-anim');
    book.classList.remove('is-pressed');
    lead.hidden = true;
    lead.classList.remove('is-landing');
    badge.classList.remove.apply(badge.classList, BADGE_CLASSES);
    badge.classList.remove('is-flipping');
    badge.textContent = 'New';
    log.textContent = '';
    if (empty) empty.classList.remove('is-gone');
    if (slot) {
      slot.querySelectorAll('.sim-confetti').forEach(function (n) { n.remove(); });
    }
  }

  /* ---------- Static finished state for reduced motion ---------- */
  if (reduced) {
    if (empty) empty.remove();
    lead.hidden = false;
    STEPS.forEach(applyStep);
    return;
  }

  function travel(onArrive) {
    packet.classList.add('is-live');
    // One tick of breathing room so the browser has the start position
    // committed before the end position is set — otherwise both land in the
    // same style recalc and there is nothing to transition between.
    later(function () { packet.classList.add('is-arrived'); }, 30);
    later(function () {
      packet.classList.remove('is-live');
      onArrive();
    }, TRAVEL_MS + 60);
  }

  function run() {
    reset();
    running = true;

    book.classList.add('is-pressed');
    later(function () { book.classList.remove('is-pressed'); }, 200);

    later(function () {
      if (empty) empty.classList.add('is-gone');
      travel(function () {
        lead.hidden = false;
        lead.classList.add('is-landing');
        applyStep(STEPS[0]);

        let t = 0;
        for (let i = 1; i < STEPS.length; i++) {
          const step = STEPS[i];
          t += step.after;
          later(function () {
            flip(step);
            if (step.cls === 'is-sold') celebrate();
          }, t);
        }

        // Hold the finished board long enough to read, then loop.
        later(run, t + 4200);
      });
    }, 260);
  }

  book.addEventListener('click', run);
  if (replay) replay.addEventListener('click', run);

  // Only burn frames while the hero is actually on screen.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !running) {
          run();
        } else if (!entry.isIntersecting && running) {
          running = false;
          clearAll();
          reset();
        }
      });
    }, { threshold: 0.25 });
    io.observe(sim);
  } else {
    run();
  }
})();
