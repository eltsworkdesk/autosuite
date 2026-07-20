/**
 * AutoSuite Dealer OS — shared shell behavior.
 * Included by every dos-shell page. Provides:
 *  - A single EventSource connection per page (window.DosShell.onEvent)
 *  - Command palette (Cmd/Ctrl+K, or click the sidebar search box)
 *  - A live notification bell fed by the same event stream
 *  - A shared toast() helper for save/action confirmations
 */
(function () {
  const NAV_ITEMS = [
    { label: 'Overview', href: 'dashboard.html', icon: '▦' },
    { label: 'CRM', href: 'crm.html', icon: '☎' },
    { label: 'Inventory', href: 'inventory.html', icon: '▤' },
    { label: 'Appointments', href: 'appointments.html', icon: '◔' },
    { label: 'Customers', href: 'customers.html', icon: '✎' },
    { label: 'Analytics', href: 'analytics.html', icon: '▲' },
    { label: 'Staff Activity', href: 'staff-activity.html', icon: '◫' },
    { label: 'Settings', href: 'settings.html', icon: '⚙' }
  ];

  function authHeader() {
    return { Authorization: 'Basic ' + btoa('admin:admin') };
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- Single shared SSE connection ----------
  const listeners = [];

  function dispatch(evt) {
    listeners.forEach(({ types, cb }) => {
      if (types.includes(evt.type)) cb(evt);
    });
  }

  function onEvent(types, cb) {
    listeners.push({ types, cb });
  }

  try {
    const source = new EventSource('/api/events');
    source.onmessage = (e) => {
      try {
        dispatch(JSON.parse(e.data));
      } catch (err) { /* ignore malformed frames */ }
    };
    source.onerror = () => console.warn('SSE connection lost, pages fall back to their own polling');
  } catch (err) {
    console.warn('EventSource unavailable:', err.message);
  }

  // ---------- Toast ----------
  let toastContainer;

  function toast(message, kind) {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:1200;display:flex;flex-direction:column;gap:8px;align-items:center;';
      toastContainer.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastContainer);
    }
    const mark = kind === 'error' ? { glyph: '✕', color: 'oklch(65% 0.18 25)' } : { glyph: '✓', color: 'oklch(60% 0.14 145)' };
    const pill = document.createElement('div');
    pill.style.cssText = 'display:inline-flex;align-items:center;gap:10px;padding:12px 16px;background:oklch(20% 0.012 260);border-radius:9px;box-shadow:0 12px 32px rgba(0,0,0,0.25);opacity:0;transform:translateY(8px);transition:opacity 150ms ease,transform 150ms ease;';
    pill.innerHTML = `<span style="color:${mark.color};">${mark.glyph}</span><span style="font:500 13px 'IBM Plex Sans',sans-serif;color:#fff;">${esc(message)}</span>`;
    toastContainer.appendChild(pill);
    requestAnimationFrame(() => { pill.style.opacity = '1'; pill.style.transform = 'translateY(0)'; });
    setTimeout(() => {
      pill.style.opacity = '0';
      pill.style.transform = 'translateY(8px)';
      setTimeout(() => pill.remove(), 200);
    }, 3000);
  }

  // ---------- Focus trap (shared by the command palette and any other
  // modal/panel, e.g. inventory.html's Quick Edit side panel) ----------
  function trapFocus(container, restoreFocusTo) {
    function focusables() {
      return [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((el) => el.offsetParent !== null);
    }
    function handleKeydown(e) {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener('keydown', handleKeydown);
    return {
      release() {
        container.removeEventListener('keydown', handleKeydown);
        if (restoreFocusTo && typeof restoreFocusTo.focus === 'function') restoreFocusTo.focus();
      }
    };
  }

  // ---------- Modal (spec 14's Modal/Drawer component: title, body,
  // Cancel/Confirm actions, focus trap) ----------
  function openModal({ title, bodyHtml, confirmLabel = 'Save', cancelLabel = 'Cancel', onConfirm, focusSelector }) {
    return new Promise((resolve) => {
      const trigger = document.activeElement;
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,12,20,0.4);z-index:1150;display:flex;align-items:center;justify-content:center;padding:20px;';
      overlay.innerHTML = `
        <div role="dialog" aria-modal="true" aria-labelledby="dosModalTitle" style="width:420px;max-width:100%;background:#fff;border-radius:12px;box-shadow:0 20px 40px -12px rgba(0,0,0,.3);overflow:hidden;">
          <div id="dosModalTitle" style="padding:16px 18px;border-bottom:1px solid oklch(93% 0.005 260);font:600 14px 'Space Grotesk',sans-serif;color:oklch(20% 0.01 260);">${esc(title)}</div>
          <div data-modal-body style="padding:18px;max-height:60vh;overflow-y:auto;">${bodyHtml}</div>
          <div data-modal-error style="padding:0 18px;color:oklch(55% 0.18 25);font:500 12px 'IBM Plex Sans',sans-serif;display:none;"></div>
          <div style="padding:14px 18px 18px;display:flex;justify-content:flex-end;gap:8px;">
            <button type="button" data-modal-cancel style="padding:9px 16px;border:1px solid oklch(88% 0.005 260);border-radius:8px;font:600 13px 'IBM Plex Sans',sans-serif;background:#fff;cursor:pointer;">${esc(cancelLabel)}</button>
            <button type="button" data-modal-confirm style="padding:9px 16px;background:oklch(45% 0.16 260);color:#fff;border-radius:8px;font:600 13px 'IBM Plex Sans',sans-serif;border:none;cursor:pointer;">${esc(confirmLabel)}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const focusTarget = (focusSelector && overlay.querySelector(focusSelector)) || overlay.querySelector('input, select, textarea');
      if (focusTarget) focusTarget.focus();
      const trap = trapFocus(overlay, trigger);

      function close(result) {
        trap.release();
        document.removeEventListener('keydown', onKeydown);
        overlay.remove();
        resolve(result);
      }

      function onKeydown(e) {
        if (e.key === 'Escape') close(null);
      }
      document.addEventListener('keydown', onKeydown);

      overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(null); });
      overlay.querySelector('[data-modal-cancel]').addEventListener('click', () => close(null));
      overlay.querySelector('[data-modal-confirm]').addEventListener('click', async () => {
        const errorEl = overlay.querySelector('[data-modal-error]');
        errorEl.style.display = 'none';
        if (!onConfirm) return close(true);
        try {
          const result = await onConfirm(overlay);
          if (result === false) return; // validation failed client-side, stay open
          close(result === undefined ? true : result);
        } catch (err) {
          errorEl.textContent = err.message || 'Something went wrong';
          errorEl.style.display = 'block';
        }
      });
    });
  }

  window.DosShell = { onEvent, toast, trapFocus, openModal };

  // ---------- Command palette ----------
  let paletteEl, paletteInput, paletteResults;
  let searchCache = { leads: null, vehicles: null };
  let paletteRows = [];
  let paletteActiveIndex = -1;
  let paletteFocusTrap = null;
  let paletteTrigger = null;

  function buildPalette() {
    paletteEl = document.createElement('div');
    paletteEl.id = 'dosPalette';
    paletteEl.setAttribute('role', 'dialog');
    paletteEl.setAttribute('aria-modal', 'true');
    paletteEl.setAttribute('aria-label', 'Command palette');
    paletteEl.style.cssText = 'position:fixed;inset:0;background:rgba(10,12,20,0.6);display:none;align-items:flex-start;justify-content:center;padding-top:14vh;z-index:1000;';
    paletteEl.innerHTML = `
      <div style="width:560px;max-width:92vw;background:oklch(20% 0.012 260);border-radius:14px;box-shadow:0 30px 60px -20px rgba(0,0,0,0.5);overflow:hidden;">
        <div style="display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid oklch(30% 0.01 260);">
          <span style="color:oklch(55% 0.01 260);font:500 12px 'IBM Plex Mono',monospace;">⌘K</span>
          <input id="dosPaletteInput" aria-label="Search leads, vehicles, or jump to a page" autocomplete="off" placeholder="Search leads, vehicles, or jump to a page..." style="flex:1;background:transparent;border:none;outline:none;padding:2px 0;font:400 15px 'IBM Plex Sans',sans-serif;color:#fff;">
        </div>
        <div id="dosPaletteResults" role="listbox" style="max-height:360px;overflow-y:auto;padding:8px;"></div>
      </div>
    `;
    document.body.appendChild(paletteEl);
    paletteInput = document.getElementById('dosPaletteInput');
    paletteResults = document.getElementById('dosPaletteResults');
    paletteEl.addEventListener('click', (e) => { if (e.target === paletteEl) closePalette(); });
    paletteInput.addEventListener('input', () => renderPaletteResults(paletteInput.value));
    paletteInput.addEventListener('keydown', onPaletteKeydown);
  }

  function openPalette() {
    if (!paletteEl) buildPalette();
    paletteTrigger = document.activeElement;
    paletteEl.style.display = 'flex';
    paletteInput.value = '';
    paletteInput.focus();
    renderPaletteResults('');
    prefetchSearchData();
    paletteFocusTrap = trapFocus(paletteEl, paletteTrigger);
  }

  function closePalette() {
    if (paletteEl) paletteEl.style.display = 'none';
    if (paletteFocusTrap) {
      paletteFocusTrap.release();
      paletteFocusTrap = null;
    }
  }

  function isPaletteOpen() {
    return !!paletteEl && paletteEl.style.display === 'flex';
  }

  async function prefetchSearchData() {
    if (searchCache.leads === null) {
      try {
        const res = await fetch('/api/leads', { headers: authHeader() });
        searchCache.leads = res.ok ? (await res.json()).leads : [];
      } catch (e) { searchCache.leads = []; }
    }
    if (searchCache.vehicles === null) {
      try {
        const res = await fetch('/api/vehicles');
        searchCache.vehicles = res.ok ? (await res.json()).vehicles : [];
      } catch (e) { searchCache.vehicles = []; }
    }
    renderPaletteResults(paletteInput.value);
  }

  function renderPaletteResults(query) {
    const q = query.trim().toLowerCase();
    const groups = [];

    const pageRows = NAV_ITEMS.filter((item) => !q || item.label.toLowerCase().includes(q))
      .map((item) => ({ icon: item.icon, label: item.label, sub: 'Go to page', href: item.href }));
    if (pageRows.length) groups.push({ title: 'Pages', rows: pageRows });

    if (q) {
      const leadRows = (searchCache.leads || [])
        .filter((lead) => (lead.name + ' ' + lead.carName).toLowerCase().includes(q))
        .map((lead) => ({ icon: '☎', label: lead.name, sub: lead.carName + ' · ' + (lead.status || 'NEW'), href: 'crm.html' }));
      if (leadRows.length) groups.push({ title: 'Leads', rows: leadRows });

      const vehicleRows = (searchCache.vehicles || [])
        .filter((v) => (v.make + ' ' + v.model).toLowerCase().includes(q))
        .map((v) => ({ icon: '▤', label: `${v.make} ${v.model}`, sub: '₦' + v.price.toLocaleString(), href: 'inventory.html' }));
      if (vehicleRows.length) groups.push({ title: 'Vehicles', rows: vehicleRows });
    }

    paletteRows = groups.flatMap((g) => g.rows);
    paletteActiveIndex = paletteRows.length ? 0 : -1;

    if (paletteRows.length === 0) {
      paletteResults.innerHTML = '<div style="padding:24px;text-align:center;color:oklch(60% 0.01 260);font:400 13px sans-serif;">No results</div>';
      return;
    }

    let rowIndex = -1;
    paletteResults.innerHTML = groups.map((g) => `
      <div style="font:500 11px 'IBM Plex Mono',monospace;color:oklch(55% 0.01 260);text-transform:uppercase;letter-spacing:0.05em;padding:8px 10px 6px;">${esc(g.title)}</div>
      ${g.rows.map((r) => {
        rowIndex++;
        return `
          <a href="${esc(r.href)}" data-row-index="${rowIndex}" role="option" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;text-decoration:none;color:inherit;">
            <div style="width:24px;text-align:center;color:oklch(70% 0.01 260);">${r.icon}</div>
            <div style="color:#fff;font:500 13px 'IBM Plex Sans',sans-serif;">${esc(r.label)} <span style="color:oklch(60% 0.01 260);font-weight:400;">— ${esc(r.sub)}</span></div>
          </a>
        `;
      }).join('')}
    `).join('');

    highlightActiveRow();
  }

  function highlightActiveRow() {
    paletteResults.querySelectorAll('[data-row-index]').forEach((el) => {
      const isActive = Number(el.dataset.rowIndex) === paletteActiveIndex;
      el.style.background = isActive ? 'oklch(28% 0.01 260)' : 'transparent';
      el.setAttribute('aria-selected', String(isActive));
      if (isActive) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function onPaletteKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (paletteRows.length) paletteActiveIndex = (paletteActiveIndex + 1) % paletteRows.length;
      highlightActiveRow();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (paletteRows.length) paletteActiveIndex = (paletteActiveIndex - 1 + paletteRows.length) % paletteRows.length;
      highlightActiveRow();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const active = paletteRows[paletteActiveIndex];
      if (active) window.location.href = active.href;
    }
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openPalette();
    }
    if (e.key === 'Escape' && isPaletteOpen()) closePalette();
  });

  // ---------- Notification bell ----------
  const NOTIF_MAX = 20;
  let notifications = [];
  let notifPanel, notifBadge;

  function iconFor(type) {
    if (type.startsWith('lead')) return '☎';
    if (type.startsWith('appointment')) return '◔';
    if (type.startsWith('vehicle')) return '▤';
    return '•';
  }

  function textFor(evt) {
    const p = evt.payload || {};
    switch (evt.type) {
      case 'lead.created': return `New lead: ${p.name} — ${p.carName}`;
      case 'lead.updated': return `${p.name} moved to ${p.status}`;
      case 'appointment.created': return 'New appointment scheduled';
      case 'appointment.updated': return `Appointment marked ${p.status}`;
      case 'vehicle.created': return `Vehicle added: ${p.make} ${p.model}`;
      case 'vehicle.updated': return `Vehicle updated: ${(p.make || '') + ' ' + (p.model || '')}`.trim();
      case 'vehicle.deleted': return 'Vehicle removed from inventory';
      case 'customer.created': return `New customer: ${p.name}`;
      default: return evt.type;
    }
  }

  function renderNotifPanel() {
    if (!notifPanel) return;
    const body = notifPanel.querySelector('[data-notif-body]');
    if (notifications.length === 0) {
      body.innerHTML = '<div style="padding:20px;text-align:center;color:oklch(50% 0.01 260);font:400 13px sans-serif;">No notifications yet</div>';
      return;
    }
    body.innerHTML = notifications.map((n) => `
      <div style="display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid oklch(95% 0.004 260);background:${n.read ? '#fff' : 'oklch(98% 0.01 260)'};">
        <div style="width:8px;height:8px;border-radius:50%;background:${n.read ? 'transparent' : 'oklch(45% 0.16 260)'};margin-top:6px;flex:none;"></div>
        <div style="flex:1;">
          <div style="font:400 13px 'IBM Plex Sans',sans-serif;color:oklch(25% 0.01 260);">${esc(textFor(n))}</div>
          <div style="font:400 11px 'IBM Plex Mono',monospace;color:oklch(55% 0.01 260);margin-top:2px;">${new Date(n.at).toLocaleTimeString()}</div>
        </div>
      </div>
    `).join('');
  }

  function markAllRead() {
    notifications.forEach((n) => { n.read = true; });
    renderNotifPanel();
    if (notifBadge) notifBadge.style.display = 'none';
  }

  function initBell() {
    const bellWrap = document.querySelector('[data-dos-bell]');
    if (!bellWrap) return;
    bellWrap.style.position = 'relative';
    bellWrap.style.cursor = 'pointer';
    bellWrap.setAttribute('role', 'button');
    bellWrap.setAttribute('tabindex', '0');
    bellWrap.setAttribute('aria-label', 'Notifications');
    notifBadge = bellWrap.querySelector('[data-dos-bell-dot]');
    if (notifBadge) notifBadge.style.display = 'none';

    notifPanel = document.createElement('div');
    notifPanel.setAttribute('role', 'region');
    notifPanel.setAttribute('aria-label', 'Notifications list');
    notifPanel.style.cssText = 'position:absolute;top:24px;right:0;width:320px;max-height:420px;overflow-y:auto;background:#fff;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.18);display:none;z-index:1001;';
    notifPanel.innerHTML = `
      <div style="padding:14px 16px;border-bottom:1px solid oklch(93% 0.005 260);display:flex;justify-content:space-between;align-items:center;">
        <div style="font:600 14px 'Space Grotesk',sans-serif;">Notifications</div>
        <button type="button" data-mark-all style="font:500 12px 'IBM Plex Sans',sans-serif;color:oklch(45% 0.16 260);background:none;border:none;cursor:pointer;padding:0;">Mark all read</button>
      </div>
      <div data-notif-body></div>
    `;
    bellWrap.appendChild(notifPanel);
    notifPanel.querySelector('[data-mark-all]').addEventListener('click', (e) => { e.stopPropagation(); markAllRead(); });
    renderNotifPanel();

    const toggle = () => {
      const isOpen = notifPanel.style.display === 'block';
      notifPanel.style.display = isOpen ? 'none' : 'block';
    };
    bellWrap.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    bellWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    document.addEventListener('click', () => { notifPanel.style.display = 'none'; });
  }

  function pushNotification(evt) {
    notifications.unshift(Object.assign({ read: false }, evt));
    if (notifications.length > NOTIF_MAX) notifications.pop();
    renderNotifPanel();
    if (notifBadge) notifBadge.style.display = 'block';
  }

  function initSearchBox() {
    const box = document.querySelector('[data-dos-search]');
    if (box) {
      box.style.cursor = 'pointer';
      box.setAttribute('role', 'button');
      box.setAttribute('tabindex', '0');
      box.setAttribute('aria-label', 'Open command palette');
      box.addEventListener('click', openPalette);
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPalette(); }
      });
    }
  }

  function labelIconOnlyNav() {
    document.querySelectorAll('.dos-nav-item, .dos-navitem').forEach((el) => {
      if (!el.getAttribute('aria-label') && el.textContent.trim()) {
        el.setAttribute('aria-label', el.textContent.trim().replace(/^[^\w]+/, '').trim());
      }
    });
  }

  // ---------- Mobile bottom tab bar ----------
  // Spec 07: dealer-OS mobile nav is scoped to floor tasks only (Home /
  // Leads / Inventory / Calendar); Analytics/Settings/Staff Activity stay
  // desktop-only, reached via a "More" overflow from here.
  const MOBILE_TABS = [
    { label: 'Home', href: 'dashboard.html', glyph: '▦' },
    { label: 'Leads', href: 'crm.html', glyph: '☎' },
    { label: 'Inventory', href: 'inventory.html', glyph: '▤' },
    { label: 'Calendar', href: 'appointments.html', glyph: '◔' }
  ];
  const MOBILE_MORE_ITEMS = [
    { label: 'Customers', href: 'customers.html', glyph: '✎' },
    { label: 'Analytics', href: 'analytics.html', glyph: '▲' },
    { label: 'Staff Activity', href: 'staff-activity.html', glyph: '◫' },
    { label: 'Settings', href: 'settings.html', glyph: '⚙' }
  ];

  function currentPage() {
    return location.pathname.split('/').pop() || 'dashboard.html';
  }

  function initMobileTabBar() {
    if (!document.querySelector('.dos-shell')) return; // only on dealer-OS pages
    const page = currentPage();

    const sheet = document.createElement('div');
    sheet.className = 'dos-mobile-more-sheet';
    sheet.setAttribute('role', 'menu');
    sheet.innerHTML = MOBILE_MORE_ITEMS.map((item) => `
      <a class="dos-mobile-more-item" role="menuitem" href="${item.href}"><span class="glyph">${item.glyph}</span>${esc(item.label)}</a>
    `).join('');
    document.body.appendChild(sheet);

    const bar = document.createElement('nav');
    bar.className = 'dos-mobile-tabbar';
    bar.setAttribute('aria-label', 'Dealer OS mobile navigation');
    const isMoreActive = MOBILE_MORE_ITEMS.some((i) => i.href === page);
    bar.innerHTML = MOBILE_TABS.map((tab) => `
      <a class="dos-mobile-tab${tab.href === page ? ' active' : ''}" href="${tab.href}" aria-current="${tab.href === page ? 'page' : 'false'}">
        <span class="glyph">${tab.glyph}</span>${esc(tab.label)}
      </a>
    `).join('') + `
      <button type="button" class="dos-mobile-tab${isMoreActive ? ' active' : ''}" id="dosMobileMoreBtn" aria-haspopup="true" aria-expanded="false">
        <span class="glyph">☰</span>More
      </button>
    `;
    document.body.appendChild(bar);

    const moreBtn = document.getElementById('dosMobileMoreBtn');
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = sheet.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', (e) => {
      if (!sheet.contains(e.target)) {
        sheet.classList.remove('open');
        moreBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function init() {
    initSearchBox();
    initBell();
    initMobileTabBar();
    labelIconOnlyNav();
    onEvent(
      ['lead.created', 'lead.updated', 'appointment.created', 'appointment.updated', 'vehicle.created', 'vehicle.updated', 'vehicle.deleted', 'customer.created'],
      pushNotification
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
