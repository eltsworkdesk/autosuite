/**
 * AutoSuite — platform pitch page behavior.
 *
 * Four independent pieces, each bailing out if its markup isn't on the page:
 * the hero pipeline carousel, the funnel counters, the no-code toggles, and
 * the CTA sparkles. Scroll reveal is NOT handled here — js/script.js owns the
 * shared [data-reveal] mechanism (including data-delay stagger) so this page
 * doesn't ship a second, weaker copy of it.
 *
 * Everything decorative is gated on prefers-reduced-motion: under it, each
 * animation jumps straight to its finished state rather than not running.
 */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Hero pipeline carousel ---------- */
  const stage = document.getElementById('pfStage');
  if (stage) {
    const slides = stage.querySelectorAll('.pf-slide');
    const title = document.getElementById('pfHeroTitle');
    const sub = document.getElementById('pfHeroSub');
    const countNow = document.getElementById('pfCountNow');
    const countBar = document.getElementById('pfCountBar');
    const arrow = document.getElementById('pfArrow');

    const copy = [
      {
        title: 'The dealership operating system.',
        sub: 'One platform connecting every customer touchpoint straight to your team.',
      },
      {
        title: 'From click to closed deal, instantly.',
        sub: 'The moment David books a test drive, the lead is already on your board.',
      },
      {
        title: 'One board. Every department.',
        sub: 'Watch a single lead move from New to SOLD — automatically, with nothing to configure.',
      },
    ];

    // Slide 2 types the customer's message out character by character.
    const bubble = stage.querySelector('[data-slide="1"] .pf-bubble p');
    const bubbleText = bubble ? bubble.textContent : '';
    let typeTimer = null;

    function typeBubble() {
      if (!bubble || reduced) return;
      clearInterval(typeTimer);
      bubble.textContent = '';
      let i = 0;
      typeTimer = setInterval(function () {
        bubble.textContent = bubbleText.slice(0, ++i);
        if (i >= bubbleText.length) clearInterval(typeTimer);
      }, 40);
    }

    // Slide 3 walks one lead across the CRM board.
    const kanban = document.getElementById('pfKanban');
    const puck = document.getElementById('pfKanbanPuck');
    const label = document.getElementById('pfKanbanLabel');
    const dots = kanban ? kanban.querySelectorAll('.pf-kanban-dot') : [];
    const stages = ['New Lead', 'Assigned: Sarah', 'Contacted', 'Qualified', 'Appointment Set', 'SOLD'];
    let kanbanTimer = null;

    function resetKanban() {
      if (!kanban) return;
      clearTimeout(kanbanTimer);
      kanban.classList.remove('is-sold');
      dots.forEach((d) => d.classList.remove('is-active'));
      if (puck) puck.style.left = '0%';
      if (label) label.textContent = stages[0];
    }

    function runKanban() {
      if (!kanban) return;
      if (reduced) {
        dots.forEach((d) => d.classList.add('is-active'));
        if (puck) puck.style.left = '100%';
        if (label) label.textContent = stages[stages.length - 1];
        kanban.classList.add('is-sold');
        return;
      }
      let i = 0;
      (function step() {
        dots.forEach((d, n) => d.classList.toggle('is-active', n <= i));
        if (puck) puck.style.left = (i / (stages.length - 1)) * 100 + '%';
        if (label) label.textContent = stages[i];
        if (i === stages.length - 1) {
          kanban.classList.add('is-sold');
          return;
        }
        i += 1;
        kanbanTimer = setTimeout(step, 620);
      })();
    }

    let index = 0;
    let started = false;
    let autoTimer = null;

    function show(i) {
      index = i;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === i));
      if (countNow) countNow.textContent = String(i + 1).padStart(2, '0');
      if (countBar) countBar.style.transform = 'scaleX(' + (i + 1) / copy.length + ')';

      function applyText() {
        if (title) {
          title.textContent = copy[i].title;
          title.style.opacity = '1';
          title.style.transform = 'none';
        }
        if (sub) {
          sub.textContent = copy[i].sub;
          sub.style.opacity = '1';
          sub.style.transform = 'none';
        }
      }

      // Cross-fade the headline on every change after the first paint.
      if (reduced || !started) {
        applyText();
      } else {
        [title, sub].forEach((el) => {
          if (!el) return;
          el.style.opacity = '0';
          el.style.transform = 'translateY(10px)';
        });
        setTimeout(applyText, 280);
      }
      started = true;

      resetKanban();
      if (i === 1) {
        if (bubble) bubble.textContent = reduced ? bubbleText : '';
        setTimeout(typeBubble, reduced ? 0 : 1650);
      }
      if (i === 2) {
        setTimeout(runKanban, reduced ? 0 : 1800);
      }
    }

    function startAuto() {
      if (reduced) return;
      autoTimer = setInterval(() => show((index + 1) % copy.length), 11000);
    }

    if (arrow) {
      arrow.addEventListener('click', () => {
        // On the last slide the arrow becomes "keep reading" instead of looping.
        if (index === copy.length - 1) {
          const next = document.getElementById('contrast');
          if (next) next.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
          return;
        }
        show((index + 1) % copy.length);
      });
    }

    show(0);
    startAuto();
    if (!reduced) {
      stage.addEventListener('mouseenter', () => clearInterval(autoTimer));
      stage.addEventListener('mouseleave', startAuto);
    }

    /* Live "leads captured this week" ticker. */
    const leadCount = document.getElementById('pfLeadCount');
    if (leadCount && !reduced) {
      let n = parseInt(leadCount.textContent, 10) || 0;
      setInterval(function () {
        n += Math.floor(Math.random() * 3) + 1;
        leadCount.textContent = n;
        leadCount.classList.remove('is-bumped');
        void leadCount.offsetWidth; // force reflow so the animation re-runs
        leadCount.classList.add('is-bumped');
      }, 5200);
    }
  }

  /* ---------- 2. Funnel bars + counters ---------- */
  const funnel = document.getElementById('pfFunnel');
  if (funnel) {
    function runFunnel() {
      funnel.querySelectorAll('.pf-fbar').forEach((bar) => {
        bar.style.width = bar.getAttribute('data-w') + '%';
      });
      funnel.querySelectorAll('.pf-cnt').forEach((el) => {
        const target = parseInt(el.getAttribute('data-t'), 10) || 0;
        if (reduced) {
          el.textContent = target;
          return;
        }
        const duration = 1100;
        let t0 = null;
        function tick(ts) {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / duration, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }

    if (reduced || !('IntersectionObserver' in window)) {
      runFunnel();
    } else {
      let done = false;
      const fo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !done) {
            done = true;
            runFunnel();
            fo.disconnect();
          }
        });
      }, { threshold: 0.35 });
      fo.observe(funnel);
    }
  }

  /* ---------- 3. No-code toggles ---------- */
  document.querySelectorAll('.pf-tog').forEach((tog) => {
    tog.addEventListener('click', () => {
      tog.setAttribute('aria-checked', tog.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    });
  });

  /* ---------- 4. CTA sparkles ---------- */
  const crown = document.getElementById('pfCrown');
  if (crown && !reduced) {
    let glitter = null;

    function sparkle() {
      const s = document.createElement('span');
      s.className = 'pf-sparkle';
      s.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8 Z" fill="#fff"/></svg>';
      s.style.left = 10 + Math.random() * 80 + '%';
      s.style.top = Math.random() * 60 - 10 + '%';
      s.style.setProperty('--pf-sx', Math.random() * 44 - 22 + 'px');
      s.style.setProperty('--pf-sy', -16 - Math.random() * 26 + 'px');
      crown.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }

    crown.addEventListener('mouseenter', () => {
      sparkle();
      sparkle();
      glitter = setInterval(sparkle, 160);
    });
    crown.addEventListener('mouseleave', () => clearInterval(glitter));
    crown.addEventListener('focus', () => {
      sparkle();
      sparkle();
      sparkle();
    });
  }
})();
